import { db } from '../db/database';
import {
  ExamAnswer,
  ExamAttempt,
  ExamResult,
  MockExam,
  MockExamQuestion,
  Question,
  QuestionOption,
  QuestionVersion,
  Topic,
  TopicPerformance,
} from '../db/schema';
import { recordAuditLog } from './auditService';

export interface SanitizedQuestionDTO {
  questionOrder: number;
  questionId: string;
  questionVersionId: string;
  code: string;
  topicId: string;
  topicName: string;
  reading: string;
  losCode: string;
  difficulty: string;
  scenarioText?: string;
  exhibit?: any;
  prompt: string;
  options: { id: 'A' | 'B' | 'C'; text: string; subtext?: string }[];
  // NO correct_answer and NO explanation here!
}

export interface SanitizedActiveSessionDTO {
  attemptId: string;
  examId: string;
  examTitle: string;
  totalQuestions: number;
  currentQuestionIndex: number;
  remainingSeconds: number;
  totalDurationSeconds: number;
  isPaused: boolean;
  fontSizeLevel: 'normal' | 'large' | 'extra-large';
  answers: Record<number, 'A' | 'B' | 'C'>; // questionOrder -> selected option
  flaggedQuestionOrders: number[];
  questions: SanitizedQuestionDTO[];
}

export function getSanitizedExamForStudent(examId: string): SanitizedActiveSessionDTO | null {
  const exam = db.findById('mock_exams', examId) as MockExam | undefined;
  if (!exam) return null;

  const mockQuestions = db
    .find('mock_exam_questions', (mq) => mq.mock_exam_id === examId)
    .sort((a, b) => a.question_order - b.question_order);

  const questions: SanitizedQuestionDTO[] = mockQuestions.map((mq) => {
    const version = db.findById('question_versions', mq.question_version_id) as QuestionVersion;
    const qHeader = db.findById('questions', version.question_id) as Question;
    const topic = db.findById('topics', qHeader.topic_id) as Topic;
    const options = db
      .find('question_options', (o) => o.question_version_id === version.id)
      .sort((a, b) => a.option_key.localeCompare(b.option_key));

    return {
      questionOrder: mq.question_order,
      questionId: qHeader.id,
      questionVersionId: version.id,
      code: qHeader.question_code,
      topicId: qHeader.topic_id,
      topicName: topic ? topic.name : qHeader.topic_id,
      reading: qHeader.reading,
      losCode: qHeader.los_code,
      difficulty: qHeader.difficulty,
      scenarioText: version.scenario_text,
      exhibit: version.exhibit,
      prompt: version.prompt,
      options: options.map((opt) => ({
        id: opt.option_key,
        text: opt.option_text,
        subtext: opt.subtext,
      })),
    };
  });

  return {
    attemptId: '',
    examId: exam.id,
    examTitle: exam.title,
    totalQuestions: questions.length,
    currentQuestionIndex: 0,
    remainingSeconds: exam.duration_minutes * 60,
    totalDurationSeconds: exam.duration_minutes * 60,
    isPaused: false,
    fontSizeLevel: 'normal',
    answers: {},
    flaggedQuestionOrders: [],
    questions,
  };
}

export function startExamAttempt(userId: string, examId: string): SanitizedActiveSessionDTO {
  const exam = db.findById('mock_exams', examId) as MockExam | undefined;
  if (!exam) throw new Error(`Exam ${examId} not found`);

  // Check if an existing in-progress attempt exists for this user and exam
  let attempt = db.findOne(
    'exam_attempts',
    (a) => a.user_id === userId && a.mock_exam_id === examId && a.status === 'in-progress'
  ) as ExamAttempt | undefined;

  const now = new Date().toISOString();

  if (!attempt) {
    const attemptId = `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const totalDurationSeconds = exam.duration_minutes * 60;

    attempt = {
      id: attemptId,
      user_id: userId,
      mock_exam_id: examId,
      status: 'in-progress',
      current_question_index: 0,
      remaining_seconds: totalDurationSeconds,
      total_duration_seconds: totalDurationSeconds,
      time_spent_seconds: 0,
      is_paused: false,
      font_size_preference: 'normal',
      started_at: now,
      last_heartbeat_at: now,
    };
    db.insert('exam_attempts', attempt);

    // Bind all mock exam questions to exam_answers with their explicit question_version_id
    const mockQuestions = db
      .find('mock_exam_questions', (mq) => mq.mock_exam_id === examId)
      .sort((a, b) => a.question_order - b.question_order);

    mockQuestions.forEach((mq) => {
      const ans: ExamAnswer = {
        id: `ans-${attempt!.id}-${mq.question_order}`,
        attempt_id: attempt!.id,
        question_version_id: mq.question_version_id,
        question_order: mq.question_order,
        is_flagged: false,
        time_spent_seconds: 0,
      };
      db.insert('exam_answers', ans);
    });
  }

  // Build the sanitized response
  const baseSession = getSanitizedExamForStudent(examId)!;
  const existingAnswers = db.find('exam_answers', (a) => a.attempt_id === attempt!.id);

  const answerMap: Record<number, 'A' | 'B' | 'C'> = {};
  const flaggedOrders: number[] = [];

  existingAnswers.forEach((ans) => {
    if (ans.selected_option) {
      answerMap[ans.question_order] = ans.selected_option;
    }
    if (ans.is_flagged) {
      flaggedOrders.push(ans.question_order);
    }
  });

  return {
    ...baseSession,
    attemptId: attempt.id,
    currentQuestionIndex: attempt.current_question_index,
    remainingSeconds: attempt.remaining_seconds,
    isPaused: attempt.is_paused,
    fontSizeLevel: attempt.font_size_preference,
    answers: answerMap,
    flaggedQuestionOrders: flaggedOrders,
  };
}

export function syncExamAttempt(
  attemptId: string,
  payload: {
    currentQuestionIndex?: number;
    remainingSeconds?: number;
    answers?: Record<number, 'A' | 'B' | 'C'>;
    flaggedQuestionOrders?: number[];
    isPaused?: boolean;
    fontSizePreference?: 'normal' | 'large' | 'extra-large';
  }
) {
  const attempt = db.findById('exam_attempts', attemptId) as ExamAttempt | undefined;
  if (!attempt) throw new Error(`Attempt ${attemptId} not found`);
  if (attempt.status !== 'in-progress') throw new Error(`Attempt is already ${attempt.status}`);

  const now = new Date().toISOString();
  const updates: Partial<ExamAttempt> = {
    last_heartbeat_at: now,
  };

  if (payload.currentQuestionIndex !== undefined) updates.current_question_index = payload.currentQuestionIndex;
  if (payload.remainingSeconds !== undefined) {
    updates.remaining_seconds = payload.remainingSeconds;
    updates.time_spent_seconds = attempt.total_duration_seconds - payload.remainingSeconds;
  }
  if (payload.isPaused !== undefined) updates.is_paused = payload.isPaused;
  if (payload.fontSizePreference !== undefined) updates.font_size_preference = payload.fontSizePreference;

  db.update('exam_attempts', attemptId, updates);

  // Sync answers and flags
  if (payload.answers) {
    const existingAnswers = db.find('exam_answers', (a) => a.attempt_id === attemptId);
    existingAnswers.forEach((ans) => {
      const selected = payload.answers![ans.question_order];
      const isFlagged = payload.flaggedQuestionOrders?.includes(ans.question_order);

      const ansUpdates: Partial<ExamAnswer> = {};
      if (selected !== undefined && selected !== ans.selected_option) {
        ansUpdates.selected_option = selected;
        ansUpdates.answered_at = now;
      }
      if (isFlagged !== undefined && isFlagged !== ans.is_flagged) {
        ansUpdates.is_flagged = isFlagged;
      }

      if (Object.keys(ansUpdates).length > 0) {
        db.update('exam_answers', ans.id, ansUpdates);
      }
    });
  }

  return { success: true };
}

/**
 * Server-authoritative grading and result calculation.
 */
export function submitExamAttempt(userId: string, attemptId: string) {
  const attempt = db.findById('exam_attempts', attemptId) as ExamAttempt | undefined;
  if (!attempt) throw new Error(`Attempt ${attemptId} not found`);
  if (attempt.user_id !== userId) throw new Error(`Unauthorized attempt submit`);
  if (attempt.status === 'completed') {
    return getExamAttemptResult(attemptId);
  }

  const exam = db.findById('mock_exams', attempt.mock_exam_id) as MockExam;
  const answers = db.find('exam_answers', (a) => a.attempt_id === attemptId);

  return db.runInTransaction(() => {
    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;

    const topicStats: Record<
      string,
      { total: number; correct: number; topicName: string; losCodes: Set<string> }
    > = {};

    answers.forEach((ans) => {
      const version = db.findById('question_versions', ans.question_version_id) as QuestionVersion;
      const question = db.findById('questions', version.question_id) as Question;
      const topic = db.findById('topics', question.topic_id) as Topic;

      if (!topicStats[question.topic_id]) {
        topicStats[question.topic_id] = {
          total: 0,
          correct: 0,
          topicName: topic ? topic.name : question.topic_id,
          losCodes: new Set(),
        };
      }
      topicStats[question.topic_id].total += 1;
      topicStats[question.topic_id].losCodes.add(question.los_code);

      if (!ans.selected_option) {
        unansweredCount += 1;
        db.update('exam_answers', ans.id, { is_correct: false });
      } else if (ans.selected_option === version.correct_answer) {
        correctCount += 1;
        topicStats[question.topic_id].correct += 1;
        db.update('exam_answers', ans.id, { is_correct: true });
      } else {
        incorrectCount += 1;
        db.update('exam_answers', ans.id, { is_correct: false });
      }
    });

    const totalQuestions = answers.length;
    const scorePercentage = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
    const passedMps = scorePercentage >= exam.passing_score_mps;
    const now = new Date().toISOString();

    // Update attempt
    db.update('exam_attempts', attemptId, {
      status: 'completed',
      score_percentage: Math.round(scorePercentage * 100) / 100,
      passed_mps: passedMps,
      correct_count: correctCount,
      incorrect_count: incorrectCount,
      unanswered_count: unansweredCount,
      percentile_rank: Math.min(Math.round(scorePercentage * 1.15), 98),
      completed_at: now,
    });

    // Create exam_results
    const examResult: ExamResult = {
      attempt_id: attemptId,
      total_questions: totalQuestions,
      score_percentage: Math.round(scorePercentage * 100) / 100,
      mps_percentage: exam.passing_score_mps,
      passed_mps: passedMps,
      confidence_band_min: Math.max(Math.round((scorePercentage - 4.5) * 10) / 10, 0),
      confidence_band_max: Math.min(Math.round((scorePercentage + 4.5) * 10) / 10, 100),
      percentile_rank: Math.min(Math.round(scorePercentage * 1.15), 98),
      avg_seconds_per_question: Math.round(attempt.time_spent_seconds / (totalQuestions || 1)),
      mentor_note: passedMps
        ? 'Kết quả vượt ngưỡng chuẩn MPS CFA Institute. Tiếp tục duy trì phong độ và rà soát các câu hỏi nâng cao.'
        : 'Điểm số hiện tại ở mức cần lưu ý. Hãy tập trung học lại các bài giảng video trong những Topic dưới 70% MPS.',
      created_at: now,
    };
    db.insert('exam_results', examResult);

    // Create topic_performance records
    Object.entries(topicStats).forEach(([topicId, stat]) => {
      const topicPct = stat.total > 0 ? (stat.correct / stat.total) * 100 : 0;
      let performanceStatus: TopicPerformance['performance_status'] = 'Đạt';
      let actionRec = 'Duy trì luyện tập đều đặn.';

      if (topicPct >= 85) {
        performanceStatus = 'Vượt trội';
        actionRec = 'Kiến thức vững chắc. Tối ưu thời gian làm bài.';
      } else if (topicPct >= 70) {
        performanceStatus = 'Tốt';
        actionRec = 'Đạt mức chuẩn MPS. Luyện thêm 10 câu khó để nâng cao biên an toàn.';
      } else if (topicPct >= 50) {
        performanceStatus = 'Cần cải thiện';
        actionRec = `Học lại bài giảng video chuyên sâu Topic ${stat.topicName} và giải thêm Q-Bank.`;
      } else {
        performanceStatus = 'Vùng nguy hiểm';
        actionRec = `Nguy cơ rớt kỳ thi do Topic ${stat.topicName}. Yêu cầu xem lại toàn bộ bài giảng và làm lại bài thi.`;
      }

      const tp: TopicPerformance = {
        id: `tp-${attemptId}-${topicId}`,
        attempt_id: attemptId,
        topic_id: topicId,
        total_questions: stat.total,
        correct_count: stat.correct,
        percentage: Math.round(topicPct * 10) / 10,
        target_mps: exam.passing_score_mps,
        performance_status: performanceStatus,
        status_badge: `${performanceStatus} (${Math.round(topicPct)}%)`,
        action_recommendation: actionRec,
        created_at: now,
      };
      db.insert('topic_performance', tp);
    });

    recordAuditLog({
      actor_id: userId,
      action: 'EXAM_SUBMITTED',
      entity_type: 'exam_attempts',
      entity_id: attemptId,
      new_values: { score: scorePercentage, passed: passedMps },
    });

    return getExamAttemptResult(attemptId);
  });
}

/**
 * Full exam result with answer keys & explanations (ONLY for completed attempts).
 */
export function getExamAttemptResult(attemptId: string) {
  const attempt = db.findById('exam_attempts', attemptId) as ExamAttempt | undefined;
  if (!attempt) throw new Error(`Attempt ${attemptId} not found`);

  const exam = db.findById('mock_exams', attempt.mock_exam_id) as MockExam;
  const result = db.findById('exam_results', attemptId) as ExamResult;
  const topicBreakdown = db.find('topic_performance', (tp) => tp.attempt_id === attemptId);
  const answers = db
    .find('exam_answers', (a) => a.attempt_id === attemptId)
    .sort((a, b) => a.question_order - b.question_order);

  // Map review questions with their frozen historical question_version
  const reviewQuestions = answers.map((ans) => {
    const version = db.findById('question_versions', ans.question_version_id) as QuestionVersion;
    const question = db.findById('questions', version.question_id) as Question;
    const topic = db.findById('topics', question.topic_id) as Topic;
    const options = db.find('question_options', (o) => o.question_version_id === version.id);

    return {
      questionOrder: ans.question_order,
      questionId: question.id,
      questionVersionId: version.id,
      versionNumber: version.version_number,
      code: question.question_code,
      topicId: question.topic_id,
      topicName: topic ? topic.name : question.topic_id,
      reading: question.reading,
      losCode: question.los_code,
      difficulty: question.difficulty,
      scenarioText: version.scenario_text,
      exhibit: version.exhibit,
      prompt: version.prompt,
      options: options.map((opt) => ({
        id: opt.option_key,
        text: opt.option_text,
        subtext: opt.subtext,
      })),
      selectedOption: ans.selected_option,
      correctAnswer: version.correct_answer,
      isCorrect: ans.is_correct,
      isFlagged: ans.is_flagged,
      explanation: version.explanation,
      timeSpentSeconds: ans.time_spent_seconds,
    };
  });

  return {
    attempt,
    exam,
    result,
    topicBreakdown,
    reviewQuestions,
  };
}
