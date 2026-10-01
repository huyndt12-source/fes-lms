import { Router } from 'express';
import { db } from '../db/database';
import { requireRole } from '../services/authService';
import {
  archiveQuestion,
  createNewQuestionVersion,
  createQuestion,
  getQuestionById,
  listQuestions,
  publishQuestionVersion,
} from '../services/qbankService';
import {
  createMockExam,
  getMockExamById,
  listMockExams,
  setMockExamPublishStatus,
  updateMockExamQuestions,
} from '../services/mockExamService';
import {
  commitQuestionImport,
  validateQuestionImport,
} from '../services/importService';
import {
  bulkSetStudentStatus,
  createStudent,
  getStudentDetail,
  listStudents,
  setStudentStatus,
  updateStudentProfile,
} from '../services/studentManagementService';

export const adminRouter = Router();

// Protect ALL admin routes with server-side authorization check!
adminRouter.use(requireRole(['ADMIN', 'CONTENT_MANAGER', 'INSTRUCTOR']));

// 1. Dashboard Metrics
adminRouter.get('/stats', (req, res) => {
  try {
    const questions = db.getTable('questions');
    const versions = db.getTable('question_versions');
    const mockExams = db.getTable('mock_exams');
    const students = db.find('users', (u) => u.role_id === 'STUDENT');
    const attempts = db.getTable('exam_attempts');
    const completedAttempts = attempts.filter((a) => a.status === 'completed');

    const avgScore =
      completedAttempts.length > 0
        ? Math.round(
            (completedAttempts.reduce((acc, a) => acc + (a.score_percentage || 0), 0) /
              completedAttempts.length) *
              10
          ) / 10
        : 0;

    const passCount = completedAttempts.filter((a) => a.passed_mps).length;
    const passRate =
      completedAttempts.length > 0
        ? Math.round((passCount / completedAttempts.length) * 100)
        : 0;

    res.json({
      totalQuestions: questions.length,
      activeQuestions: questions.filter((q) => q.status === 'Active').length,
      totalQuestionVersions: versions.length,
      totalMockExams: mockExams.length,
      publishedMockExams: mockExams.filter((m) => m.is_published).length,
      totalStudents: students.length,
      totalAttempts: attempts.length,
      completedAttempts: completedAttempts.length,
      averageScore: avgScore,
      passRate,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Question Bank Routes
adminRouter.get('/questions', (req, res) => {
  try {
    const { search, topic_id, subtopic_id, difficulty, status } = req.query as any;
    const questions = listQuestions({ search, topic_id, subtopic_id, difficulty, status });
    res.json(questions);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.get('/questions/:id', (req, res) => {
  try {
    const result = getQuestionById(req.params.id);
    res.json(result);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

adminRouter.post('/questions', (req, res) => {
  try {
    const result = createQuestion(req.body);
    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

adminRouter.post('/questions/:id/versions', (req, res) => {
  try {
    const result = createNewQuestionVersion(req.params.id, req.body);
    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

adminRouter.post('/questions/versions/:versionId/publish', (req, res) => {
  try {
    const result = publishQuestionVersion(req.params.versionId);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

adminRouter.post('/questions/:id/archive', (req, res) => {
  try {
    const result = archiveQuestion(req.params.id);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 3. Question Import Routes
adminRouter.post('/questions/import/validate', (req, res) => {
  try {
    const { fileName, rows } = req.body;
    if (!rows || !Array.isArray(rows)) {
      return res.status(400).json({ error: 'Rows array is required' });
    }
    const validationResult = validateQuestionImport(fileName || 'import.csv', rows);
    res.json(validationResult);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

adminRouter.post('/questions/import/commit', (req, res) => {
  try {
    const { fileName, validRows } = req.body;
    if (!validRows || !Array.isArray(validRows) || validRows.length === 0) {
      return res.status(400).json({ error: 'Valid rows are required for commit' });
    }
    const commitResult = commitQuestionImport({ fileName: fileName || 'import.csv', validRows });
    res.json(commitResult);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Mock Exams Management
adminRouter.get('/mock-exams', (req, res) => {
  try {
    const exams = listMockExams(false);
    res.json(exams);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.get('/mock-exams/:id', (req, res) => {
  try {
    const result = getMockExamById(req.params.id);
    res.json(result);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

adminRouter.post('/mock-exams', (req, res) => {
  try {
    const result = createMockExam(req.body);
    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

adminRouter.put('/mock-exams/:id/questions', (req, res) => {
  try {
    const { questionVersionIds } = req.body;
    const result = updateMockExamQuestions(req.params.id, questionVersionIds);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

adminRouter.post('/mock-exams/:id/publish', (req, res) => {
  try {
    const { isPublished } = req.body;
    const result = setMockExamPublishStatus(req.params.id, isPublished !== false);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 5. Students Management & Results
adminRouter.get('/students', (req, res) => {
  try {
    const { search, cfaLevel, status, targetDate } = req.query;
    const result = listStudents({
      search: search as string,
      cfaLevel: cfaLevel as string,
      status: status as string,
      targetDate: targetDate as string,
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.post('/students', (req, res) => {
  try {
    const result = createStudent(req.body);
    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

adminRouter.get('/students/:id', (req, res) => {
  try {
    const detail = getStudentDetail(req.params.id);
    res.json(detail);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

adminRouter.put('/students/:id', (req, res) => {
  try {
    const updated = updateStudentProfile(req.params.id, req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

adminRouter.put('/students/:id/status', (req, res) => {
  try {
    const { isActive } = req.body;
    const result = setStudentStatus(req.params.id, isActive !== false);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

adminRouter.post('/students/bulk-status', (req, res) => {
  try {
    const { studentIds, isActive } = req.body;
    if (!studentIds || !Array.isArray(studentIds)) {
      return res.status(400).json({ error: 'studentIds array is required' });
    }
    const result = bulkSetStudentStatus(studentIds, isActive !== false);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

adminRouter.get('/results', (req, res) => {
  try {
    const attempts = db.getTable('exam_attempts');
    const exams = db.getTable('mock_exams');
    const users = db.getTable('users');
    const profiles = db.getTable('user_profiles');

    const list = attempts
      .map((a) => {
        const exam = exams.find((e) => e.id === a.mock_exam_id);
        const user = users.find((u) => u.id === a.user_id);
        const profile = profiles.find((p) => p.user_id === a.user_id);

        return {
          attemptId: a.id,
          studentName: profile?.full_name || user?.email || a.user_id,
          studentEmail: user?.email || '',
          examId: a.mock_exam_id,
          examTitle: exam?.title || a.mock_exam_id,
          status: a.status,
          scorePercentage: a.score_percentage || 0,
          passedMps: a.passed_mps || false,
          correctCount: a.correct_count || 0,
          totalQuestions: exam?.total_questions || 0,
          timeSpentMinutes: Math.round(a.time_spent_seconds / 60),
          startedAt: a.started_at,
          completedAt: a.completed_at,
        };
      })
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Audit Logs
adminRouter.get('/audit-logs', (req, res) => {
  try {
    const logs = db.getTable('audit_logs');
    const sorted = [...logs].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    res.json(sorted.slice(0, 100));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Topics and Metadata
adminRouter.get('/topics', (req, res) => {
  try {
    const topics = db.getTable('topics');
    const subtopics = db.getTable('subtopics');
    res.json({ topics, subtopics });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
