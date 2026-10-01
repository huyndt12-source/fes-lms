import { db } from '../db/database';
import { Question, QuestionOption, QuestionVersion } from '../db/schema';
import { recordAuditLog } from './auditService';
import { getCurrentUserContext } from './authService';

export interface FullQuestionResponse {
  question: Question;
  currentVersion: QuestionVersion | null;
  options: QuestionOption[];
  allVersionsCount: number;
}

export function listQuestions(params?: {
  search?: string;
  topic_id?: string;
  subtopic_id?: string;
  difficulty?: string;
  status?: string;
}): FullQuestionResponse[] {
  let questions = db.getTable('questions');

  if (params?.topic_id) {
    questions = questions.filter((q) => q.topic_id === params.topic_id);
  }
  if (params?.subtopic_id) {
    questions = questions.filter((q) => q.subtopic_id === params.subtopic_id);
  }
  if (params?.difficulty) {
    questions = questions.filter((q) => q.difficulty === params.difficulty);
  }
  if (params?.status) {
    questions = questions.filter((q) => q.status === params.status);
  }
  if (params?.search) {
    const qLower = params.search.toLowerCase();
    questions = questions.filter((q) => {
      const matchCode = q.question_code.toLowerCase().includes(qLower);
      const matchReading = q.reading.toLowerCase().includes(qLower);
      const version = q.current_version_id
        ? (db.findById('question_versions', q.current_version_id) as QuestionVersion)
        : null;
      const matchPrompt = version?.prompt.toLowerCase().includes(qLower);
      return matchCode || matchReading || matchPrompt;
    });
  }

  return questions.map((q) => {
    const currentVersion = q.current_version_id
      ? (db.findById('question_versions', q.current_version_id) as QuestionVersion)
      : null;
    const options = currentVersion
      ? db.find('question_options', (o) => o.question_version_id === currentVersion.id)
      : [];
    const allVersionsCount = db.find('question_versions', (v) => v.question_id === q.id).length;

    return {
      question: q,
      currentVersion,
      options,
      allVersionsCount,
    };
  });
}

export function getQuestionById(questionId: string) {
  const question = db.findById('questions', questionId) as Question | undefined;
  if (!question) throw new Error(`Question ${questionId} not found`);

  const currentVersion = question.current_version_id
    ? (db.findById('question_versions', question.current_version_id) as QuestionVersion)
    : null;
  const options = currentVersion
    ? db.find('question_options', (o) => o.question_version_id === currentVersion.id)
    : [];

  const allVersions = db
    .find('question_versions', (v) => v.question_id === question.id)
    .sort((a, b) => b.version_number - a.version_number);

  const versionsWithOptions = allVersions.map((ver) => ({
    version: ver,
    options: db.find('question_options', (o) => o.question_version_id === ver.id),
  }));

  return {
    question,
    currentVersion,
    options,
    versions: versionsWithOptions,
  };
}

export function createQuestion(params: {
  question_code: string;
  topic_id: string;
  subtopic_id?: string;
  los_code: string;
  reading: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  prompt: string;
  scenario_text?: string;
  options: { key: 'A' | 'B' | 'C'; text: string; subtext?: string }[];
  correct_answer: 'A' | 'B' | 'C';
  explanation: string;
  publishImmediately?: boolean;
}) {
  const { user } = getCurrentUserContext();
  const now = new Date().toISOString();
  const questionId = `q-${Date.now()}`;
  const versionId = `qv-${questionId}-v1`;

  return db.runInTransaction(() => {
    // 1. Create Question Header
    const question: Question = {
      id: questionId,
      question_code: params.question_code.trim(),
      topic_id: params.topic_id,
      subtopic_id: params.subtopic_id,
      los_code: params.los_code.trim(),
      reading: params.reading.trim(),
      difficulty: params.difficulty,
      current_version_id: versionId,
      status: 'Active',
      created_by: user.id,
      created_at: now,
      updated_at: now,
    };
    db.insert('questions', question);

    // 2. Create Question Version 1
    const version: QuestionVersion = {
      id: versionId,
      question_id: questionId,
      version_number: 1,
      scenario_text: params.scenario_text?.trim(),
      prompt: params.prompt.trim(),
      correct_answer: params.correct_answer,
      explanation: params.explanation.trim(),
      change_summary: 'Initial question creation',
      is_published: params.publishImmediately !== false,
      published_at: params.publishImmediately !== false ? now : undefined,
      created_by: user.id,
      created_at: now,
    };
    db.insert('question_versions', version);

    // 3. Create Options
    params.options.forEach((opt) => {
      const option: QuestionOption = {
        id: `opt-${versionId}-${opt.key}`,
        question_version_id: versionId,
        option_key: opt.key,
        option_text: opt.text.trim(),
        subtext: opt.subtext?.trim(),
      };
      db.insert('question_options', option);
    });

    recordAuditLog({
      actor_id: user.id,
      actor_name: user.email,
      action: 'QUESTION_CREATED',
      entity_type: 'questions',
      entity_id: questionId,
      new_values: { code: params.question_code, version: 1 },
    });

    return getQuestionById(questionId);
  });
}

/**
 * Creates a NEW question version without mutating existing versions!
 */
export function createNewQuestionVersion(
  questionId: string,
  params: {
    prompt: string;
    scenario_text?: string;
    options: { key: 'A' | 'B' | 'C'; text: string; subtext?: string }[];
    correct_answer: 'A' | 'B' | 'C';
    explanation: string;
    change_summary?: string;
    publishImmediately?: boolean;
  }
) {
  const { user } = getCurrentUserContext();
  const question = db.findById('questions', questionId) as Question | undefined;
  if (!question) throw new Error(`Question ${questionId} not found`);

  const existingVersions = db.find('question_versions', (v) => v.question_id === questionId);
  const nextVersionNum = Math.max(...existingVersions.map((v) => v.version_number), 0) + 1;
  const newVersionId = `qv-${questionId}-v${nextVersionNum}`;
  const now = new Date().toISOString();

  return db.runInTransaction(() => {
    // 1. Insert brand new version
    const newVersion: QuestionVersion = {
      id: newVersionId,
      question_id: questionId,
      version_number: nextVersionNum,
      scenario_text: params.scenario_text?.trim(),
      prompt: params.prompt.trim(),
      correct_answer: params.correct_answer,
      explanation: params.explanation.trim(),
      change_summary: params.change_summary || `Revision v${nextVersionNum}`,
      is_published: params.publishImmediately === true,
      published_at: params.publishImmediately === true ? now : undefined,
      created_by: user.id,
      created_at: now,
    };
    db.insert('question_versions', newVersion);

    // 2. Insert new options for this new version
    params.options.forEach((opt) => {
      const option: QuestionOption = {
        id: `opt-${newVersionId}-${opt.key}`,
        question_version_id: newVersionId,
        option_key: opt.key,
        option_text: opt.text.trim(),
        subtext: opt.subtext?.trim(),
      };
      db.insert('question_options', option);
    });

    // 3. If published immediately, update question current_version_id
    if (params.publishImmediately === true) {
      db.update('questions', questionId, {
        current_version_id: newVersionId,
        updated_at: now,
      });
    }

    recordAuditLog({
      actor_id: user.id,
      actor_name: user.email,
      action: 'QUESTION_VERSION_CREATED',
      entity_type: 'question_versions',
      entity_id: newVersionId,
      new_values: { version_number: nextVersionNum, is_published: params.publishImmediately === true },
    });

    return getQuestionById(questionId);
  });
}

export function publishQuestionVersion(versionId: string) {
  const { user } = getCurrentUserContext();
  const version = db.findById('question_versions', versionId) as QuestionVersion | undefined;
  if (!version) throw new Error(`Version ${versionId} not found`);

  const now = new Date().toISOString();

  return db.runInTransaction(() => {
    db.update('question_versions', versionId, {
      is_published: true,
      published_at: now,
    });

    db.update('questions', version.question_id, {
      current_version_id: versionId,
      updated_at: now,
    });

    recordAuditLog({
      actor_id: user.id,
      actor_name: user.email,
      action: 'QUESTION_VERSION_PUBLISHED',
      entity_type: 'question_versions',
      entity_id: versionId,
      new_values: { published_at: now },
    });

    return getQuestionById(version.question_id);
  });
}

export function archiveQuestion(questionId: string) {
  const { user } = getCurrentUserContext();
  const now = new Date().toISOString();

  return db.runInTransaction(() => {
    db.update('questions', questionId, {
      status: 'Archived',
      updated_at: now,
    });

    recordAuditLog({
      actor_id: user.id,
      actor_name: user.email,
      action: 'QUESTION_ARCHIVED',
      entity_type: 'questions',
      entity_id: questionId,
    });

    return getQuestionById(questionId);
  });
}
