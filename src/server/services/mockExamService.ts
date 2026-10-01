import { db } from '../db/database';
import { MockExam, MockExamQuestion, Question, QuestionOption, QuestionVersion } from '../db/schema';
import { recordAuditLog } from './auditService';
import { getCurrentUserContext } from './authService';

export interface FullMockExamResponse {
  exam: MockExam;
  items: Array<{
    item: MockExamQuestion;
    question: Question;
    version: QuestionVersion;
    options: QuestionOption[];
  }>;
}

export function listMockExams(onlyPublished = false): MockExam[] {
  let exams = db.getTable('mock_exams');
  if (onlyPublished) {
    exams = exams.filter((e) => e.is_published);
  }
  return exams.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function getMockExamById(examId: string): FullMockExamResponse {
  const exam = db.findById('mock_exams', examId) as MockExam | undefined;
  if (!exam) throw new Error(`Mock Exam ${examId} not found`);

  const mockQuestions = db
    .find('mock_exam_questions', (mq) => mq.mock_exam_id === examId)
    .sort((a, b) => a.question_order - b.question_order);

  const items = mockQuestions.map((item) => {
    const version = db.findById('question_versions', item.question_version_id) as QuestionVersion;
    const question = db.findById('questions', version.question_id) as Question;
    const options = db.find('question_options', (o) => o.question_version_id === version.id);

    return {
      item,
      question,
      version,
      options,
    };
  });

  return { exam, items };
}

export function createMockExam(params: {
  id?: string;
  title: string;
  subtitle?: string;
  scope?: string;
  level?: 'Level I' | 'Level II' | 'Level III';
  format_year?: string;
  difficulty?: 'Foundational' | 'Standard CFA' | 'Advanced' | 'Challenging';
  duration_minutes: number;
  passing_score_mps?: number;
  is_recommended?: boolean;
  priority_label?: string;
  question_version_ids: string[]; // Order represents question_order
}) {
  const { user } = getCurrentUserContext();
  const examId = params.id || `cfa-mock-${Date.now()}`;
  const now = new Date().toISOString();

  return db.runInTransaction(() => {
    const mockExam: MockExam = {
      id: examId,
      title: params.title.trim(),
      subtitle: params.subtitle?.trim(),
      scope: params.scope || 'CFA Level I Mock Exam',
      level: params.level || 'Level I',
      format_year: params.format_year || '2026',
      difficulty: params.difficulty || 'Standard CFA',
      duration_minutes: params.duration_minutes || 135,
      total_questions: params.question_version_ids.length,
      passing_score_mps: params.passing_score_mps || 70.0,
      is_published: false,
      is_recommended: params.is_recommended || false,
      priority_label: params.priority_label,
      is_nationwide: false,
      created_by: user.id,
      created_at: now,
      updated_at: now,
    };
    db.insert('mock_exams', mockExam);

    // Bind frozen question versions
    params.question_version_ids.forEach((vId, idx) => {
      const version = db.findById('question_versions', vId);
      if (!version) throw new Error(`Question version ${vId} does not exist`);

      const meq: MockExamQuestion = {
        id: `meq-${examId}-${idx + 1}`,
        mock_exam_id: examId,
        question_version_id: vId,
        question_order: idx + 1,
        points: 1,
        created_at: now,
      };
      db.insert('mock_exam_questions', meq);
    });

    recordAuditLog({
      actor_id: user.id,
      actor_name: user.email,
      action: 'MOCK_EXAM_CREATED',
      entity_type: 'mock_exams',
      entity_id: examId,
      new_values: { title: params.title, questionsCount: params.question_version_ids.length },
    });

    return getMockExamById(examId);
  });
}

export function updateMockExamQuestions(
  examId: string,
  questionVersionIds: string[]
) {
  const exam = db.findById('mock_exams', examId) as MockExam | undefined;
  if (!exam) throw new Error(`Mock Exam ${examId} not found`);

  // Remove existing bindings
  const existingBindings = db.find('mock_exam_questions', (m) => m.mock_exam_id === examId);
  const now = new Date().toISOString();

  return db.runInTransaction(() => {
    existingBindings.forEach((b) => db.delete('mock_exam_questions', b.id));

    questionVersionIds.forEach((vId, idx) => {
      const version = db.findById('question_versions', vId);
      if (!version) throw new Error(`Question version ${vId} does not exist`);

      const meq: MockExamQuestion = {
        id: `meq-${examId}-${idx + 1}-${Date.now()}`,
        mock_exam_id: examId,
        question_version_id: vId,
        question_order: idx + 1,
        points: 1,
        created_at: now,
      };
      db.insert('mock_exam_questions', meq);
    });

    db.update('mock_exams', examId, {
      total_questions: questionVersionIds.length,
      updated_at: now,
    });

    return getMockExamById(examId);
  });
}

export function setMockExamPublishStatus(examId: string, isPublished: boolean) {
  const { user } = getCurrentUserContext();
  const exam = db.findById('mock_exams', examId) as MockExam | undefined;
  if (!exam) throw new Error(`Mock Exam ${examId} not found`);

  const now = new Date().toISOString();

  return db.runInTransaction(() => {
    db.update('mock_exams', examId, {
      is_published: isPublished,
      updated_at: now,
    });

    recordAuditLog({
      actor_id: user.id,
      actor_name: user.email,
      action: isPublished ? 'MOCK_EXAM_PUBLISHED' : 'MOCK_EXAM_UNPUBLISHED',
      entity_type: 'mock_exams',
      entity_id: examId,
      new_values: { is_published: isPublished },
    });

    return getMockExamById(examId);
  });
}
