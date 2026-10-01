import fs from 'fs';
import path from 'path';
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

export interface DatabaseTables {
  roles: Role[];
  permissions: Permission[];
  role_permissions: RolePermission[];
  users: User[];
  user_profiles: UserProfile[];
  topics: Topic[];
  subtopics: Subtopic[];
  courses: Course[];
  course_modules: CourseModule[];
  lessons: Lesson[];
  videos: Video[];
  lesson_resources: LessonResource[];
  questions: Question[];
  question_versions: QuestionVersion[];
  question_options: QuestionOption[];
  question_tags: QuestionTag[];
  mock_exams: MockExam[];
  mock_exam_questions: MockExamQuestion[];
  exam_attempts: ExamAttempt[];
  exam_answers: ExamAnswer[];
  exam_results: ExamResult[];
  topic_performance: TopicPerformance[];
  video_progress: VideoProgress[];
  lesson_progress: LessonProgress[];
  course_progress: CourseProgress[];
  student_notes: StudentNote[];
  bookmarks: Bookmark[];
  notifications: Notification[];
  audit_logs: AuditLog[];
  question_import_jobs: QuestionImportJob[];
}

export const TABLE_PRIMARY_KEYS: Partial<Record<keyof DatabaseTables, string>> = {
  user_profiles: 'user_id',
  exam_results: 'attempt_id',
};

export class Database {
  private data: DatabaseTables;
  private transactionSnapshot: DatabaseTables | null = null;
  private filePath: string;
  private inTransaction: boolean = false;

  private getRecordId<K extends keyof DatabaseTables>(tableName: K, item: any): string | undefined {
    const keyField = TABLE_PRIMARY_KEYS[tableName];
    if (keyField && item && item[keyField] !== undefined) {
      return item[keyField];
    }
    return item ? item.id : undefined;
  }

  constructor(storageDir = path.resolve(process.cwd(), 'data')) {
    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir, { recursive: true });
    }
    this.filePath = path.join(storageDir, 'fes_database.json');
    this.data = this.createEmptyTables();
    this.loadFromDisk();
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

  private loadFromDisk(): void {
    if (fs.existsSync(this.filePath)) {
      try {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        this.data = { ...this.createEmptyTables(), ...parsed };
      } catch (err) {
        console.error('Error loading database file from disk, initializing fresh:', err);
      }
    }
  }

  public saveToDisk(): void {
    if (this.inTransaction) return; // Wait until transaction commits
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database to disk:', err);
    }
  }

  public resetDatabase(): void {
    this.data = this.createEmptyTables();
    this.saveToDisk();
  }

  // --- Transaction Management ---
  private transactionDepth: number = 0;

  public beginTransaction(): void {
    if (this.transactionDepth === 0) {
      this.transactionSnapshot = JSON.parse(JSON.stringify(this.data));
      this.inTransaction = true;
    }
    this.transactionDepth++;
  }

  public commit(): void {
    if (this.transactionDepth <= 0) {
      return;
    }
    this.transactionDepth--;
    if (this.transactionDepth === 0) {
      this.transactionSnapshot = null;
      this.inTransaction = false;
      this.saveToDisk();
    }
  }

  public rollback(): void {
    if (this.transactionSnapshot) {
      this.data = this.transactionSnapshot;
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

  // --- Generic Table Getters & Mutators ---
  public getTable<K extends keyof DatabaseTables>(tableName: K): DatabaseTables[K] {
    return this.data[tableName];
  }

  public findById<K extends keyof DatabaseTables>(
    tableName: K,
    id: string
  ): any | undefined {
    const list = this.data[tableName] as any[];
    return list.find((item) => this.getRecordId(tableName, item) === id || item.id === id);
  }

  public findOne<K extends keyof DatabaseTables>(
    tableName: K,
    predicate: (item: any) => boolean
  ): any | undefined {
    const list = this.data[tableName] as any[];
    return list.find(predicate);
  }

  public find<K extends keyof DatabaseTables>(
    tableName: K,
    predicate?: (item: any) => boolean
  ): any[] {
    const list = this.data[tableName] as any[];
    return predicate ? list.filter(predicate) : [...list];
  }

  public insert<K extends keyof DatabaseTables>(tableName: K, record: any): any {
    // Unique constraints check
    if (tableName === 'users') {
      const existing = this.data.users.find((u) => u.email.toLowerCase() === record.email.toLowerCase());
      if (existing) throw new Error(`User with email ${record.email} already exists`);
    }
    if (tableName === 'questions') {
      const existing = this.data.questions.find((q) => q.question_code === record.question_code);
      if (existing) throw new Error(`Question code ${record.question_code} already exists`);
    }
    if (tableName === 'question_versions') {
      const existing = this.data.question_versions.find(
        (v) => v.question_id === record.question_id && v.version_number === record.version_number
      );
      if (existing) {
        throw new Error(`Version ${record.version_number} for question ${record.question_id} already exists`);
      }
    }
    if (tableName === 'question_options') {
      const existing = this.data.question_options.find(
        (o) => o.question_version_id === record.question_version_id && o.option_key === record.option_key
      );
      if (existing) {
        throw new Error(`Option key ${record.option_key} already exists for version ${record.question_version_id}`);
      }
    }
    if (tableName === 'mock_exam_questions') {
      const existingOrder = this.data.mock_exam_questions.find(
        (m) => m.mock_exam_id === record.mock_exam_id && m.question_order === record.question_order
      );
      if (existingOrder) {
        throw new Error(`Order ${record.question_order} already taken in mock exam ${record.mock_exam_id}`);
      }
      const existingVer = this.data.mock_exam_questions.find(
        (m) => m.mock_exam_id === record.mock_exam_id && m.question_version_id === record.question_version_id
      );
      if (existingVer) {
        throw new Error(`Question version ${record.question_version_id} already included in exam ${record.mock_exam_id}`);
      }
    }

    (this.data[tableName] as any[]).push(record);
    this.saveToDisk();
    return record;
  }

  public update<K extends keyof DatabaseTables>(
    tableName: K,
    id: string,
    updates: Partial<any>
  ): any {
    const list = this.data[tableName] as any[];
    const index = list.findIndex(
      (item) => this.getRecordId(tableName, item) === id || item.id === id
    );
    if (index === -1) {
      throw new Error(`Record with id ${id} not found in ${String(tableName)}`);
    }

    // STRICT IMMUTABILITY RULE FOR QUESTION VERSIONS
    if (tableName === 'question_versions') {
      const current = list[index] as QuestionVersion;
      if (current.is_published) {
        // Check if updating sensitive fields (prompt, exhibit, correct_answer, explanation)
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
      const currentOpt = list[index] as QuestionOption;
      const parentVersion = this.findById('question_versions', currentOpt.question_version_id) as QuestionVersion | undefined;
      if (parentVersion && parentVersion.is_published) {
        throw new Error(
          `IMMUTABILITY VIOLATION: Options for published version ${parentVersion.id} cannot be modified. Create a new question version.`
        );
      }
    }

    const updated = { ...list[index], ...updates };
    list[index] = updated;
    this.saveToDisk();
    return updated;
  }

  public delete<K extends keyof DatabaseTables>(tableName: K, id: string): boolean {
    // FOREIGN KEY RESTRICTION CHECKS
    if (tableName === 'question_versions') {
      const isUsedInExams = this.data.mock_exam_questions.some((m) => m.question_version_id === id);
      if (isUsedInExams) {
        throw new Error(`FK RESTRICT: Cannot delete question_version ${id} because it is referenced in mock_exam_questions.`);
      }
      const isUsedInAnswers = this.data.exam_answers.some((a) => a.question_version_id === id);
      if (isUsedInAnswers) {
        throw new Error(`FK RESTRICT: Cannot delete question_version ${id} because historical exam_answers reference it.`);
      }
    }

    if (tableName === 'mock_exams') {
      const hasAttempts = this.data.exam_attempts.some((a) => a.mock_exam_id === id);
      if (hasAttempts) {
        throw new Error(`FK RESTRICT: Cannot delete mock_exam ${id} because student exam attempts exist.`);
      }
    }

    const list = this.data[tableName] as any[];
    const index = list.findIndex(
      (item) => this.getRecordId(tableName, item) === id || item.id === id
    );
    if (index === -1) return false;

    // CASCADE DELETIONS WHERE APPLICABLE
    if (tableName === 'questions') {
      // Cascade delete versions & tags
      const versionsToDelete = this.data.question_versions.filter((v) => v.question_id === id);
      for (const ver of versionsToDelete) {
        this.delete('question_versions', ver.id);
      }
      this.data.question_tags = this.data.question_tags.filter((t) => t.question_id !== id);
    }

    if (tableName === 'question_versions') {
      this.data.question_options = this.data.question_options.filter((o) => o.question_version_id !== id);
    }

    if (tableName === 'mock_exams') {
      this.data.mock_exam_questions = this.data.mock_exam_questions.filter((m) => m.mock_exam_id !== id);
    }

    if (tableName === 'exam_attempts') {
      this.data.exam_answers = this.data.exam_answers.filter((a) => a.attempt_id !== id);
      this.data.exam_results = this.data.exam_results.filter((r) => r.attempt_id !== id);
      this.data.topic_performance = this.data.topic_performance.filter((tp) => tp.attempt_id !== id);
    }

    list.splice(index, 1);
    this.saveToDisk();
    return true;
  }
}

import { FirestoreDatabase, firestoreDb, type IDatabase } from './firestore';

export { FirestoreDatabase, firestoreDb, type IDatabase };

// Fallback JSON-backed database instance
export const jsonDb = new Database();

// Active database provider is FirestoreDatabase
export const activeProvider = 'firestore' as const;
export const db = firestoreDb;

