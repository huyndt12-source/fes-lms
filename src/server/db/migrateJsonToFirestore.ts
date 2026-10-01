import fs from 'fs';
import path from 'path';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  writeBatch,
  getDocs,
  getDoc,
  terminate,
  Firestore,
} from 'firebase/firestore';
import { loadFirebaseConfig } from './firestore';
import { type DatabaseTables, TABLE_PRIMARY_KEYS } from './database';

export interface MigrationValidationResult {
  valid: boolean;
  totalRecords: number;
  tableCounts: Record<string, number>;
  fkViolations: string[];
  pkDuplicates: string[];
  warnings: string[];
}

export interface MigrationSummary {
  success: boolean;
  dryRun: boolean;
  totalMigrated: number;
  collectionsProcessed: number;
  details: Record<string, { attempted: number; succeeded: number }>;
  durationMs: number;
  validationReport: MigrationValidationResult;
}

/**
 * Resolves the deterministic Firestore document ID for any record across all 30 collections.
 * Guarantees idempotency: re-running the migration will overwrite/set the exact same document ID.
 */
export function getDocumentId(tableName: keyof DatabaseTables, record: any): string {
  // 1. Check custom primary keys from canonical mapping
  const customKey = TABLE_PRIMARY_KEYS[tableName];
  if (customKey && record && record[customKey] !== undefined) {
    return String(record[customKey]);
  }

  // 2. Check composite primary key tables
  if (tableName === 'role_permissions') {
    return `${record.role_id}_${record.permission_id}`;
  }
  if (tableName === 'question_tags') {
    return `${record.question_id}_${record.tag}`;
  }

  // 3. Standard id column
  if (record && record.id !== undefined) {
    return String(record.id);
  }

  throw new Error(`Cannot resolve primary key for table ${String(tableName)} on record: ${JSON.stringify(record)}`);
}

/**
 * Validates the raw JSON database before migration to guarantee foreign-key
 * relationships, primary-key uniqueness, and question versioning consistency.
 */
export function validateDatabaseBeforeMigration(data: DatabaseTables): MigrationValidationResult {
  const result: MigrationValidationResult = {
    valid: true,
    totalRecords: 0,
    tableCounts: {},
    fkViolations: [],
    pkDuplicates: [],
    warnings: [],
  };

  const userIds = new Set((data.users || []).map((u) => u.id));
  const questionIds = new Set((data.questions || []).map((q) => q.id));
  const versionIds = new Set((data.question_versions || []).map((v) => v.id));
  const examIds = new Set((data.mock_exams || []).map((m) => m.id));
  const attemptIds = new Set((data.exam_attempts || []).map((a) => a.id));
  const topicIds = new Set((data.topics || []).map((t) => t.id));
  const courseIds = new Set((data.courses || []).map((c) => c.id));
  const moduleIds = new Set((data.course_modules || []).map((m) => m.id));

  // Count & validate each table
  for (const [tableKey, rows] of Object.entries(data)) {
    const tableName = tableKey as keyof DatabaseTables;
    const rowList = (Array.isArray(rows) ? rows : []) as any[];
    result.tableCounts[tableName] = rowList.length;
    result.totalRecords += rowList.length;

    // Check duplicate primary keys within the table
    const seenIds = new Set<string>();
    for (const row of rowList) {
      try {
        const docId = getDocumentId(tableName, row);
        if (seenIds.has(docId)) {
          result.pkDuplicates.push(`Table ${tableName}: duplicate primary key ${docId}`);
        } else {
          seenIds.add(docId);
        }
      } catch (err: any) {
        result.pkDuplicates.push(`Table ${tableName}: invalid primary key: ${err.message}`);
      }
    }
  }

  // Foreign-Key Checks:
  // 1. user_profiles -> users.id
  for (const prof of data.user_profiles || []) {
    if (!userIds.has(prof.user_id)) {
      result.fkViolations.push(`user_profiles.user_id "${prof.user_id}" not found in users.id`);
    }
  }

  // 2. question_versions -> questions.id
  for (const ver of data.question_versions || []) {
    if (!questionIds.has(ver.question_id)) {
      result.fkViolations.push(`question_versions.question_id "${ver.question_id}" not found in questions.id`);
    }
  }

  // 3. question_options -> question_versions.id
  for (const opt of data.question_options || []) {
    if (!versionIds.has(opt.question_version_id)) {
      result.fkViolations.push(`question_options.question_version_id "${opt.question_version_id}" not found in question_versions.id`);
    }
  }

  // 4. mock_exam_questions -> mock_exams.id & question_versions.id
  for (const meq of data.mock_exam_questions || []) {
    if (!examIds.has(meq.mock_exam_id)) {
      result.fkViolations.push(`mock_exam_questions.mock_exam_id "${meq.mock_exam_id}" not found in mock_exams.id`);
    }
    if (!versionIds.has(meq.question_version_id)) {
      result.fkViolations.push(`mock_exam_questions.question_version_id "${meq.question_version_id}" not found in question_versions.id`);
    }
  }

  // 5. exam_attempts -> mock_exams.id & users.id
  for (const att of data.exam_attempts || []) {
    if (!examIds.has(att.mock_exam_id)) {
      result.fkViolations.push(`exam_attempts.mock_exam_id "${att.mock_exam_id}" not found in mock_exams.id`);
    }
    if (!userIds.has(att.user_id)) {
      result.fkViolations.push(`exam_attempts.user_id "${att.user_id}" not found in users.id`);
    }
  }

  // 6. exam_answers -> exam_attempts.id & question_versions.id
  for (const ans of data.exam_answers || []) {
    if (!attemptIds.has(ans.attempt_id)) {
      result.fkViolations.push(`exam_answers.attempt_id "${ans.attempt_id}" not found in exam_attempts.id`);
    }
    if (!versionIds.has(ans.question_version_id)) {
      result.fkViolations.push(`exam_answers.question_version_id "${ans.question_version_id}" not found in question_versions.id`);
    }
  }

  // 7. exam_results -> exam_attempts.id
  for (const res of data.exam_results || []) {
    if (!attemptIds.has(res.attempt_id)) {
      result.fkViolations.push(`exam_results.attempt_id "${res.attempt_id}" not found in exam_attempts.id`);
    }
  }

  // 8. subtopics -> topics.id
  for (const sub of data.subtopics || []) {
    if (!topicIds.has(sub.topic_id)) {
      result.fkViolations.push(`subtopics.topic_id "${sub.topic_id}" not found in topics.id`);
    }
  }

  // 9. course_modules -> courses.id
  for (const mod of data.course_modules || []) {
    if (!courseIds.has(mod.course_id)) {
      result.fkViolations.push(`course_modules.course_id "${mod.course_id}" not found in courses.id`);
    }
  }

  // 10. lessons -> course_modules.id
  for (const les of data.lessons || []) {
    if (!moduleIds.has(les.module_id)) {
      result.fkViolations.push(`lessons.module_id "${les.module_id}" not found in course_modules.id`);
    }
  }

  if (result.fkViolations.length > 0 || result.pkDuplicates.length > 0) {
    result.valid = false;
  }

  return result;
}

/**
 * Executes JSON -> Firestore migration.
 * By default, dryRun is true for safety unless explicitly passed false.
 */
export async function runJsonToFirestoreMigration(options: {
  jsonFilePath?: string;
  dryRun?: boolean;
}): Promise<MigrationSummary> {
  const startTime = Date.now();
  const filePath = options.jsonFilePath || path.resolve(process.cwd(), 'data', 'fes_database.json');
  const dryRun = options.dryRun !== false; // defaults to true unless dryRun: false is specified

  if (!fs.existsSync(filePath)) {
    throw new Error(`Database file not found at: ${filePath}`);
  }

  const rawJson = fs.readFileSync(filePath, 'utf-8');
  const data: DatabaseTables = JSON.parse(rawJson);

  // 1. Pre-write Validation
  const validation = validateDatabaseBeforeMigration(data);
  if (!validation.valid) {
    throw new Error(
      `Pre-migration validation failed with ${validation.fkViolations.length} FK violation(s) and ${validation.pkDuplicates.length} PK duplicate(s).`
    );
  }

  const summary: MigrationSummary = {
    success: false,
    dryRun,
    totalMigrated: 0,
    collectionsProcessed: 0,
    details: {},
    durationMs: 0,
    validationReport: validation,
  };

  if (dryRun) {
    summary.success = true;
    summary.totalMigrated = validation.totalRecords;
    summary.collectionsProcessed = Object.keys(data).length;
    for (const [table, count] of Object.entries(validation.tableCounts)) {
      summary.details[table] = { attempted: count, succeeded: count };
    }
    summary.durationMs = Date.now() - startTime;
    return summary;
  }

  // 2. Perform Idempotent Firestore Writes
  const config = loadFirebaseConfig();
  const app = getApps().length > 0 ? getApp() : initializeApp(config);
  const db: Firestore = config.firestoreDatabaseId && config.firestoreDatabaseId !== '(default)'
    ? getFirestore(app, config.firestoreDatabaseId)
    : getFirestore(app);

  try {
    // Process in batches (max 400 operations per batch to stay safely under Firestore 500 limit)
    const BATCH_LIMIT = 400;
    let currentBatch = writeBatch(db);
    let batchOpCount = 0;

    for (const [tableKey, rows] of Object.entries(data)) {
      const tableName = tableKey as keyof DatabaseTables;
      const rowList = (Array.isArray(rows) ? rows : []) as any[];
      summary.details[tableName] = { attempted: rowList.length, succeeded: 0 };
      summary.collectionsProcessed++;

      for (const record of rowList) {
        const docId = getDocumentId(tableName, record);
        const docRef = doc(db, tableName, docId);

        // setDoc with full record ensures clean idempotency (re-running overwrites identically)
        currentBatch.set(docRef, record);
        batchOpCount++;
        summary.details[tableName].succeeded++;
        summary.totalMigrated++;

        if (batchOpCount >= BATCH_LIMIT) {
          await currentBatch.commit();
          currentBatch = writeBatch(db);
          batchOpCount = 0;
        }
      }
    }

    if (batchOpCount > 0) {
      await currentBatch.commit();
    }

    summary.success = true;
  } finally {
    await terminate(db).catch(() => {});
  }

  summary.durationMs = Date.now() - startTime;
  return summary;
}

/**
 * Validates that all migrated Firestore collections match expected JSON database records.
 */
export async function verifyFirestoreMigration(): Promise<{
  verified: boolean;
  collectionStats: Record<string, { expected: number; found: number }>;
  discrepancies: string[];
}> {
  const filePath = path.resolve(process.cwd(), 'data', 'fes_database.json');
  const data: DatabaseTables = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const config = loadFirebaseConfig();
  const app = getApps().length > 0 ? getApp() : initializeApp(config);
  const db: Firestore = config.firestoreDatabaseId && config.firestoreDatabaseId !== '(default)'
    ? getFirestore(app, config.firestoreDatabaseId)
    : getFirestore(app);

  const stats: Record<string, { expected: number; found: number }> = {};
  const discrepancies: string[] = [];

  try {
    for (const [tableKey, rows] of Object.entries(data)) {
      const tableName = tableKey as keyof DatabaseTables;
      const expectedCount = Array.isArray(rows) ? rows.length : 0;
      const colRef = collection(db, tableName);
      const snap = await getDocs(colRef);
      const foundCount = snap.size;

      stats[tableName] = { expected: expectedCount, found: foundCount };
      if (expectedCount !== foundCount) {
        discrepancies.push(`Collection "${tableName}": expected ${expectedCount}, found ${foundCount}`);
      }
    }
  } finally {
    await terminate(db).catch(() => {});
  }

  return {
    verified: discrepancies.length === 0,
    collectionStats: stats,
    discrepancies,
  };
}

// CLI handler for test or dry-run inspection
if (process.argv[1] && process.argv[1].endsWith('migrateJsonToFirestore.ts')) {
  const isExecute = process.argv.includes('--execute');
  const isVerify = process.argv.includes('--verify');

  if (isVerify) {
    verifyFirestoreMigration()
      .then((res) => {
        console.log('[MIGRATION VERIFICATION]:', JSON.stringify(res, null, 2));
        process.exit(res.verified ? 0 : 1);
      })
      .catch((err) => {
        console.error('[VERIFICATION ERROR]:', err);
        process.exit(1);
      });
  } else {
    runJsonToFirestoreMigration({ dryRun: !isExecute })
      .then((summary) => {
        console.log(`[MIGRATION ${summary.dryRun ? 'DRY-RUN' : 'EXECUTION'} SUMMARY]:`, JSON.stringify(summary, null, 2));
        process.exit(summary.success ? 0 : 1);
      })
      .catch((err) => {
        console.error('[MIGRATION ERROR]:', err);
        process.exit(1);
      });
  }
}
