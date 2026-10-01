import fs from 'fs';
import path from 'path';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  Firestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  runTransaction as firestoreRunTransaction,
  writeBatch,
} from 'firebase/firestore';
import {
  AuditLog,
  Bookmark,
  Course,
  CourseModule,
  CourseProgress,
  ExamAnswer,
  ExamAttempt,
  ExamResult,
  Lesson,
  LessonProgress,
  LessonResource,
  MockExam,
  MockExamQuestion,
  Notification,
  Permission,
  Question,
  QuestionImportJob,
  QuestionOption,
  QuestionTag,
  QuestionVersion,
  Role,
  RolePermission,
  StudentNote,
  Subtopic,
  Topic,
  TopicPerformance,
  User,
  UserProfile,
  Video,
  VideoProgress,
} from './schema';
import type { DatabaseTables } from './database';

export const TABLE_PRIMARY_KEYS: Partial<Record<keyof DatabaseTables, string>> = {
  user_profiles: 'user_id',
  exam_results: 'attempt_id',
};

export type { DatabaseTables };

export interface FirebaseConfig {
  projectId: string;
  appId: string;
  apiKey: string;
  authDomain: string;
  firestoreDatabaseId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  measurementId?: string;
  oAuthClientId?: string;
  recaptchaSiteKey?: string;
}

/**
 * Common Database interface implemented by both Database (JSON-backed)
 * and FirestoreDatabase (Firestore-backed).
 */
export interface IDatabase {
  getTable<K extends keyof DatabaseTables>(tableName: K): Promise<DatabaseTables[K]> | DatabaseTables[K];
  findById<K extends keyof DatabaseTables>(tableName: K, id: string): Promise<any | undefined> | (any | undefined);
  findOne<K extends keyof DatabaseTables>(
    tableName: K,
    predicate: (item: any) => boolean
  ): Promise<any | undefined> | (any | undefined);
  find<K extends keyof DatabaseTables>(
    tableName: K,
    predicate?: (item: any) => boolean
  ): Promise<any[]> | any[];
  insert<K extends keyof DatabaseTables>(tableName: K, record: any): Promise<any> | any;
  update<K extends keyof DatabaseTables>(
    tableName: K,
    id: string,
    updates: Partial<any>
  ): Promise<any> | any;
  delete<K extends keyof DatabaseTables>(tableName: K, id: string): Promise<boolean> | boolean;
  beginTransaction(): Promise<void> | void;
  commit(): Promise<void> | void;
  rollback(): Promise<void> | void;
  runInTransaction<T>(fn: () => T | Promise<T>): Promise<T> | T;
}

/**
 * Loads Firebase configuration from firebase-applet-config.json or environment.
 */
export function loadFirebaseConfig(): FirebaseConfig {
  const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    try {
      const content = fs.readFileSync(configPath, 'utf-8');
      return JSON.parse(content) as FirebaseConfig;
    } catch (err) {
      console.warn('Failed to parse firebase-applet-config.json, falling back to env:', err);
    }
  }

  return {
    projectId: process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || '',
    appId: process.env.FIREBASE_APP_ID || process.env.VITE_FIREBASE_APP_ID || '',
    apiKey: process.env.FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY || '',
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || process.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    firestoreDatabaseId: process.env.FIRESTORE_DATABASE_ID || process.env.VITE_FIRESTORE_DATABASE_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
  };
}

/**
 * Recursively strips undefined fields from an object so Firestore setDoc does not reject it.
 */
function sanitizeForFirestore<T>(data: T): any {
  if (data === null || data === undefined) {
    return null;
  }
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeForFirestore(item));
  }
  if (typeof data === 'object') {
    const clean: Record<string, any> = {};
    for (const [key, value] of Object.entries(data as Record<string, any>)) {
      if (value !== undefined) {
        clean[key] = sanitizeForFirestore(value);
      }
    }
    return clean;
  }
  return data;
}

/**
 * Firestore Database Adapter.
 * Provides full compatibility with the existing LMS Database contract,
 * preserving canonical primary keys (TABLE_PRIMARY_KEYS) and entity ID resolution.
 */
export class FirestoreDatabase implements IDatabase {
  private app: FirebaseApp;
  private firestore: Firestore;
  private inTransaction: boolean = false;
  private transactionDepth: number = 0;
  private cache: DatabaseTables;
  private transactionSnapshot: DatabaseTables | null = null;
  private pendingWrites: Promise<any>[] = [];
  public readonly provider = 'firestore' as const;

  constructor(customConfig?: FirebaseConfig) {
    const config = customConfig || loadFirebaseConfig();
    this.app = getApps().length > 0 ? getApp() : initializeApp(config);

    if (config.firestoreDatabaseId && config.firestoreDatabaseId !== '(default)') {
      this.firestore = getFirestore(this.app, config.firestoreDatabaseId);
    } else {
      this.firestore = getFirestore(this.app);
    }

    this.cache = this.loadInitialCache();
  }

  private createEmptyTables(): DatabaseTables {
    return {
      roles: [],
      permissions: [],
      role_permissions: [],
      users: [],
      user_profiles: [],
      topics: [],
      subtopics: [],
      courses: [],
      course_modules: [],
      lessons: [],
      videos: [],
      lesson_resources: [],
      questions: [],
      question_versions: [],
      question_options: [],
      question_tags: [],
      mock_exams: [],
      mock_exam_questions: [],
      exam_attempts: [],
      exam_answers: [],
      exam_results: [],
      topic_performance: [],
      video_progress: [],
      lesson_progress: [],
      course_progress: [],
      student_notes: [],
      bookmarks: [],
      notifications: [],
      audit_logs: [],
      question_import_jobs: [],
    };
  }

  private loadInitialCache(): DatabaseTables {
    const jsonPath = path.resolve(process.cwd(), 'data', 'fes_database.json');
    if (fs.existsSync(jsonPath)) {
      try {
        const raw = fs.readFileSync(jsonPath, 'utf-8');
        return { ...this.createEmptyTables(), ...JSON.parse(raw) };
      } catch (err) {
        console.warn('[FirestoreDatabase] Failed to read initial snapshot from data/fes_database.json:', err);
      }
    }
    return this.createEmptyTables();
  }

  /**
   * Resets in-memory database tables.
   */
  public resetDatabase(): void {
    this.cache = this.createEmptyTables();
  }

  /**
   * Waits for any in-flight asynchronous Firestore write operations to complete.
   */
  public async waitForPendingWrites(): Promise<void> {
    if (this.pendingWrites.length > 0) {
      const currentWrites = [...this.pendingWrites];
      this.pendingWrites = [];
      await Promise.all(currentWrites);
    }
  }

  /**
   * Retrieves the canonical Firestore database instance.
   */
  public getFirestoreInstance(): Firestore {
    return this.firestore;
  }

  /**
   * Resolves the primary key ID for an entity record using TABLE_PRIMARY_KEYS.
   */
  public getRecordId<K extends keyof DatabaseTables>(tableName: K, item: any): string | undefined {
    const keyField = TABLE_PRIMARY_KEYS[tableName];
    if (keyField && item && item[keyField] !== undefined) {
      return String(item[keyField]);
    }
    return item && item.id !== undefined ? String(item.id) : undefined;
  }

  // --- Transaction Management ---
  public beginTransaction(): void {
    if (this.transactionDepth === 0) {
      this.transactionSnapshot = JSON.parse(JSON.stringify(this.cache));
      this.inTransaction = true;
    }
    this.transactionDepth++;
  }

  public commit(): void {
    if (this.transactionDepth <= 0) return;
    this.transactionDepth--;
    if (this.transactionDepth === 0) {
      this.transactionSnapshot = null;
      this.inTransaction = false;
    }
  }

  public rollback(): void {
    if (this.transactionSnapshot) {
      this.cache = this.transactionSnapshot;
      this.transactionSnapshot = null;
    }
    this.inTransaction = false;
    this.transactionDepth = 0;
  }

  public runInTransaction<T>(fn: () => T): T {
    this.beginTransaction();
    try {
      const result = fn();
      this.commit();
      return result;
    } catch (error) {
      this.rollback();
      throw error;
    }
  }

  // --- CRUD Operations ---

  public getTable<K extends keyof DatabaseTables>(tableName: K): DatabaseTables[K] {
    return this.cache[tableName] || ([] as any);
  }

  public async getTableAsync<K extends keyof DatabaseTables>(tableName: K): Promise<DatabaseTables[K]> {
    const colRef = collection(this.firestore, String(tableName));
    const snapshot = await getDocs(colRef);
    const results: any[] = [];
    snapshot.forEach((d) => {
      results.push(d.data());
    });
    return results as DatabaseTables[K];
  }

  public findById<K extends keyof DatabaseTables>(
    tableName: K,
    id: string
  ): any | undefined {
    const list = (this.cache[tableName] || []) as any[];
    return list.find((item) => this.getRecordId(tableName, item) === id || item.id === id);
  }

  public async findByIdAsync<K extends keyof DatabaseTables>(
    tableName: K,
    id: string
  ): Promise<any | undefined> {
    const docRef = doc(this.firestore, String(tableName), id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data();
    }
    const keyField = TABLE_PRIMARY_KEYS[tableName];
    if (keyField && keyField !== 'id') {
      const all = await this.getTableAsync(tableName);
      return (all as any[]).find((item) => this.getRecordId(tableName, item) === id || item.id === id);
    }
    return undefined;
  }

  public findOne<K extends keyof DatabaseTables>(
    tableName: K,
    predicate: (item: any) => boolean
  ): any | undefined {
    const list = (this.cache[tableName] || []) as any[];
    return list.find(predicate);
  }

  public find<K extends keyof DatabaseTables>(
    tableName: K,
    predicate?: (item: any) => boolean
  ): any[] {
    const list = (this.cache[tableName] || []) as any[];
    return predicate ? list.filter(predicate) : [...list];
  }

  public insert<K extends keyof DatabaseTables>(tableName: K, record: any): any {
    // Unique constraints check
    if (tableName === 'users') {
      const users = (this.cache.users || []) as User[];
      const existing = users.find((u) => u.email.toLowerCase() === record.email.toLowerCase());
      if (existing) throw new Error(`User with email ${record.email} already exists`);
    }
    if (tableName === 'questions') {
      const questions = (this.cache.questions || []) as Question[];
      const existing = questions.find((q) => q.question_code === record.question_code);
      if (existing) throw new Error(`Question code ${record.question_code} already exists`);
    }
    if (tableName === 'question_versions') {
      const versions = (this.cache.question_versions || []) as QuestionVersion[];
      const existing = versions.find(
        (v) => v.question_id === record.question_id && v.version_number === record.version_number
      );
      if (existing) {
        throw new Error(`Version ${record.version_number} for question ${record.question_id} already exists`);
      }
    }
    if (tableName === 'question_options') {
      const options = (this.cache.question_options || []) as QuestionOption[];
      const existing = options.find(
        (o) => o.question_version_id === record.question_version_id && o.option_key === record.option_key
      );
      if (existing) {
        throw new Error(`Option key ${record.option_key} already exists for version ${record.question_version_id}`);
      }
    }
    if (tableName === 'mock_exam_questions') {
      const mockQuestions = (this.cache.mock_exam_questions || []) as MockExamQuestion[];
      const existingOrder = mockQuestions.find(
        (m) => m.mock_exam_id === record.mock_exam_id && m.question_order === record.question_order
      );
      if (existingOrder) {
        throw new Error(`Order ${record.question_order} already taken in mock exam ${record.mock_exam_id}`);
      }
      const existingVer = mockQuestions.find(
        (m) => m.mock_exam_id === record.mock_exam_id && m.question_version_id === record.question_version_id
      );
      if (existingVer) {
        throw new Error(`Question version ${record.question_version_id} already included in exam ${record.mock_exam_id}`);
      }
    }

    const docId = this.getRecordId(tableName, record);
    if (!docId) {
      throw new Error(`Cannot insert record into ${String(tableName)}: missing primary key id.`);
    }

    // Update in-memory cache
    const list = this.cache[tableName] as any[];
    list.push(record);

    // Persist to Firestore asynchronously
    const docRef = doc(this.firestore, String(tableName), docId);
    const sanitizedRecord = sanitizeForFirestore(record);
    const p = setDoc(docRef, sanitizedRecord).catch((err) => {
      console.error(`[FirestoreDatabase] Async setDoc failed on ${String(tableName)}/${docId}:`, err);
    });
    this.pendingWrites.push(p);

    return record;
  }

  public update<K extends keyof DatabaseTables>(
    tableName: K,
    id: string,
    updates: Partial<any>
  ): any {
    const existing = this.findById(tableName, id);
    if (!existing) {
      throw new Error(`Record with id ${id} not found in ${String(tableName)}`);
    }

    // STRICT IMMUTABILITY RULE FOR QUESTION VERSIONS
    if (tableName === 'question_versions') {
      const current = existing as QuestionVersion;
      if (current.is_published) {
        const sensitiveKeys = ['prompt', 'correct_answer', 'explanation', 'scenario_text', 'exhibit'];
        const isEditingSensitive = sensitiveKeys.some(
          (k) => updates[k] !== undefined && updates[k] !== (current as any)[k]
        );
        if (isEditingSensitive) {
          throw new Error(
            `IMMUTABILITY VIOLATION: Published question version ${id} cannot be modified. A new question version must be created.`
          );
        }
      }
    }

    // IMMUTABILITY RULE FOR QUESTION OPTIONS
    if (tableName === 'question_options') {
      const currentOpt = existing as QuestionOption;
      const parentVersion = this.findById('question_versions', currentOpt.question_version_id) as
        | QuestionVersion
        | undefined;
      if (parentVersion && parentVersion.is_published) {
        throw new Error(
          `IMMUTABILITY VIOLATION: Options for published version ${parentVersion.id} cannot be modified. Create a new question version.`
        );
      }
    }

    const updated = { ...existing, ...updates };
    const list = this.cache[tableName] as any[];
    const index = list.findIndex(
      (item) => this.getRecordId(tableName, item) === id || item.id === id
    );
    if (index !== -1) {
      list[index] = updated;
    }

    // Persist to Firestore asynchronously
    const docId = this.getRecordId(tableName, updated) || id;
    const docRef = doc(this.firestore, String(tableName), docId);
    const sanitizedUpdated = sanitizeForFirestore(updated);
    const p = setDoc(docRef, sanitizedUpdated, { merge: true }).catch((err) => {
      console.error(`[FirestoreDatabase] Async setDoc failed on ${String(tableName)}/${docId}:`, err);
    });
    this.pendingWrites.push(p);

    return updated;
  }

  public delete<K extends keyof DatabaseTables>(tableName: K, id: string): boolean {
    // FOREIGN KEY RESTRICTION CHECKS
    if (tableName === 'question_versions') {
      const mockQuestions = (this.cache.mock_exam_questions || []) as MockExamQuestion[];
      if (mockQuestions.some((m) => m.question_version_id === id)) {
        throw new Error(`FK RESTRICT: Cannot delete question_version ${id} because it is referenced in mock_exam_questions.`);
      }
      const answers = (this.cache.exam_answers || []) as ExamAnswer[];
      if (answers.some((a) => a.question_version_id === id)) {
        throw new Error(`FK RESTRICT: Cannot delete question_version ${id} because historical exam_answers reference it.`);
      }
    }

    if (tableName === 'mock_exams') {
      const attempts = (this.cache.exam_attempts || []) as ExamAttempt[];
      if (attempts.some((a) => a.mock_exam_id === id)) {
        throw new Error(`FK RESTRICT: Cannot delete mock_exam ${id} because student exam attempts exist.`);
      }
    }

    const existing = this.findById(tableName, id);
    if (!existing) return false;

    // CASCADE DELETIONS WHERE APPLICABLE
    if (tableName === 'questions') {
      const versions = (this.cache.question_versions || []) as QuestionVersion[];
      const versionsToDelete = versions.filter((v) => v.question_id === id);
      for (const ver of versionsToDelete) {
        this.delete('question_versions', ver.id);
      }
      const tags = (this.cache.question_tags || []) as QuestionTag[];
      const tagsToDelete = tags.filter((t) => t.question_id === id);
      for (const tag of tagsToDelete) {
        const tagDocId = `${tag.question_id}_${tag.tag}`;
        deleteDoc(doc(this.firestore, 'question_tags', tagDocId)).catch(() => {});
      }
      this.cache.question_tags = this.cache.question_tags.filter((t) => t.question_id !== id);
    }

    if (tableName === 'question_versions') {
      const options = (this.cache.question_options || []) as QuestionOption[];
      const optionsToDelete = options.filter((o) => o.question_version_id === id);
      for (const opt of optionsToDelete) {
        this.delete('question_options', opt.id);
      }
    }

    if (tableName === 'mock_exams') {
      const mockQuestions = (this.cache.mock_exam_questions || []) as MockExamQuestion[];
      const questionsToDelete = mockQuestions.filter((m) => m.mock_exam_id === id);
      for (const q of questionsToDelete) {
        this.delete('mock_exam_questions', q.id);
      }
    }

    if (tableName === 'exam_attempts') {
      const answers = (this.cache.exam_answers || []) as ExamAnswer[];
      for (const ans of answers.filter((a) => a.attempt_id === id)) {
        this.delete('exam_answers', ans.id);
      }
      const results = (this.cache.exam_results || []) as ExamResult[];
      for (const res of results.filter((r) => r.attempt_id === id)) {
        this.delete('exam_results', res.attempt_id);
      }
      const topicPerfs = (this.cache.topic_performance || []) as TopicPerformance[];
      for (const tp of topicPerfs.filter((t) => t.attempt_id === id)) {
        this.delete('topic_performance', tp.id);
      }
    }

    const list = this.cache[tableName] as any[];
    const index = list.findIndex(
      (item) => this.getRecordId(tableName, item) === id || item.id === id
    );
    if (index === -1) return false;
    list.splice(index, 1);

    const docId = this.getRecordId(tableName, existing) || id;
    const docRef = doc(this.firestore, String(tableName), docId);
    const p = deleteDoc(docRef).catch((err) => {
      console.error(`[FirestoreDatabase] Async deleteDoc failed on ${String(tableName)}/${docId}:`, err);
    });
    this.pendingWrites.push(p);

    return true;
  }
}

// Export singleton firestore database instance
export const firestoreDb = new FirestoreDatabase();
