import { Router } from 'express';
import { db } from '../db/database';
import { getCurrentUserContext } from '../services/authService';
import {
  getExamAttemptResult,
  startExamAttempt,
  submitExamAttempt,
  syncExamAttempt,
} from '../services/examExecutionService';
import { listMockExams } from '../services/mockExamService';
import { getLessonProgress, recordVideoHeartbeat } from '../services/videoService';
import { Course, CourseModule, Lesson, TopicPerformance, Video } from '../db/schema';

export const studentRouter = Router();

// 1. Available Mock Exams for Student (ONLY Published!)
studentRouter.get('/exams', (req, res) => {
  try {
    const { profile } = getCurrentUserContext();
    const publishedExams = listMockExams(true).filter(
      (e) => !e.level || e.level === profile.cfa_level
    );
    res.json(publishedExams);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Start Exam Attempt (Delivers SANITIZED questions with NO answer keys or explanations!)
studentRouter.post('/exams/:id/start', (req, res) => {
  try {
    const { user } = getCurrentUserContext();
    const sanitizedSession = startExamAttempt(user.id, req.params.id);
    res.json(sanitizedSession);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 3. Live Sync Answers & Timer
studentRouter.patch('/attempts/:id/sync', (req, res) => {
  try {
    const result = syncExamAttempt(req.params.id, req.body);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 4. Server-Side Submit & Grade
studentRouter.post('/attempts/:id/submit', (req, res) => {
  try {
    const { user } = getCurrentUserContext();
    const gradedResult = submitExamAttempt(user.id, req.params.id);
    res.json(gradedResult);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 5. Get Review Result (Only for completed attempts)
studentRouter.get('/attempts/:id/result', (req, res) => {
  try {
    const result = getExamAttemptResult(req.params.id);
    res.json(result);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

// 6. Courses with Student Video Progress
studentRouter.get('/courses', (req, res) => {
  try {
    const { user } = getCurrentUserContext();
    const courses = db.find('courses', (c: Course) => c.is_published);
    const modules = db.getTable('course_modules');
    const lessons = db.find('lessons', (l: Lesson) => l.is_published);

    const fullCourses = courses.map((course) => {
      const courseMods = modules
        .filter((m: CourseModule) => m.course_id === course.id)
        .sort((a, b) => a.display_order - b.display_order);

      const enrichedMods = courseMods.map((mod) => {
        const modLessons = lessons
          .filter((l: Lesson) => l.module_id === mod.id)
          .sort((a, b) => a.display_order - b.display_order);

        const enrichedLessons = modLessons.map((les) => {
          const prog = getLessonProgress(user.id, les.id);
          const video = db.findOne('videos', (v: Video) => v.lesson_id === les.id);

          return {
            ...les,
            durationSeconds: video?.duration_seconds || 2400,
            durationMinutes: Math.round((video?.duration_seconds || 2400) / 60),
            watchedPercentage: prog.watchedPercentage,
            lastPlaybackSeconds: prog.lastPlaybackSeconds,
            status: prog.isCompleted ? 'completed' : prog.watchedPercentage > 0 ? 'in-progress' : 'locked',
          };
        });

        return {
          ...mod,
          lessons: enrichedLessons,
        };
      });

      const totalLessons = enrichedMods.reduce((acc, m) => acc + m.lessons.length, 0);
      const completedLessons = enrichedMods.reduce(
        (acc, m) => acc + m.lessons.filter((l) => l.status === 'completed').length,
        0
      );
      const progressPercentage =
        totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

      return {
        ...course,
        modulesCount: courseMods.length,
        totalLessonsCount: totalLessons,
        completedLessonsCount: completedLessons,
        progressPercentage,
        modules: enrichedMods,
      };
    });

    res.json(fullCourses);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Video Telemetry Heartbeat
studentRouter.post('/video/heartbeat', (req, res) => {
  try {
    const { user } = getCurrentUserContext();
    const { lessonId, playbackSeconds } = req.body;
    if (!lessonId || playbackSeconds === undefined) {
      return res.status(400).json({ error: 'lessonId and playbackSeconds required' });
    }

    const result = recordVideoHeartbeat({
      userId: user.id,
      lessonId,
      playbackSeconds: Number(playbackSeconds),
    });

    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 8. Performance Analytics & Personalized Learning Loop
studentRouter.get('/analytics', (req, res) => {
  try {
    const { user } = getCurrentUserContext();
    const studentAttempts = db.find('exam_attempts', (a) => a.user_id === user.id && a.status === 'completed');

    if (studentAttempts.length === 0) {
      return res.json({
        hasAttempts: false,
        topicPerformance: [],
        weakTopics: [],
        recommendations: [],
      });
    }

    // Get latest attempt
    const latestAttempt = studentAttempts.sort(
      (a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime()
    )[0];

    const topicPerf = db.find('topic_performance', (tp: TopicPerformance) => tp.attempt_id === latestAttempt.id);

    // Identify weak topics (percentage < 70% MPS)
    const weakTopics = topicPerf.filter((tp) => tp.percentage < 70);

    // Generate personalized learning recommendations
    const recommendations = weakTopics.map((wt) => {
      const topic = db.findById('topics', wt.topic_id);
      const course = db.findOne('courses', (c) => c.topic_id === wt.topic_id);
      const recommendedLesson = course
        ? db.findOne('lessons', (l) => l.course_id === course.id)
        : null;

      return {
        topicId: wt.topic_id,
        topicName: topic?.name || wt.topic_id,
        scorePercentage: wt.percentage,
        status: wt.performance_status,
        recommendedCourseId: course?.id || 'cfa-l1-fra',
        recommendedLessonId: recommendedLesson?.id || 'les-fra-03',
        recommendedLessonTitle: recommendedLesson?.title || 'Phân tích Chuyên sâu Kế toán Thuê tài sản',
        actionText: wt.action_recommendation,
      };
    });

    res.json({
      hasAttempts: true,
      latestAttemptId: latestAttempt.id,
      overallScore: latestAttempt.score_percentage,
      passedMps: latestAttempt.passed_mps,
      percentileRank: latestAttempt.percentile_rank,
      topicPerformance: topicPerf,
      weakTopics,
      recommendations,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
