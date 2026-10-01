import { db } from '../db/database';
import { CourseProgress, Lesson, LessonProgress, Video, VideoProgress } from '../db/schema';

export function recordVideoHeartbeat(params: {
  userId: string;
  lessonId: string;
  playbackSeconds: number;
}) {
  const lesson = db.findById('lessons', params.lessonId) as Lesson | undefined;
  if (!lesson) throw new Error(`Lesson ${params.lessonId} not found`);

  const video = db.findOne('videos', (v) => v.lesson_id === params.lessonId) as Video | undefined;
  if (!video) throw new Error(`Video for lesson ${params.lessonId} not found`);

  const now = new Date().toISOString();
  const duration = video.duration_seconds || 2400;

  let vp = db.findOne(
    'video_progress',
    (v) => v.user_id === params.userId && v.video_id === video.id
  ) as VideoProgress | undefined;

  const maxWatched = vp
    ? Math.max(vp.max_watched_seconds, params.playbackSeconds)
    : params.playbackSeconds;
  const watchedPct = Math.min(Math.round((maxWatched / duration) * 1000) / 10, 100);
  const isCompleted = watchedPct >= 85.0;

  if (!vp) {
    vp = {
      id: `vp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      user_id: params.userId,
      video_id: video.id,
      last_playback_seconds: Math.round(params.playbackSeconds),
      max_watched_seconds: Math.round(maxWatched),
      watched_percentage: watchedPct,
      is_completed: isCompleted,
      completed_at: isCompleted ? now : undefined,
      last_heartbeat_at: now,
    };
    db.insert('video_progress', vp);
  } else {
    db.update('video_progress', vp.id, {
      last_playback_seconds: Math.round(params.playbackSeconds),
      max_watched_seconds: Math.round(maxWatched),
      watched_percentage: watchedPct,
      is_completed: vp.is_completed || isCompleted,
      completed_at: vp.completed_at || (isCompleted ? now : undefined),
      last_heartbeat_at: now,
    });
  }

  // Update or insert lesson_progress
  let lp = db.findOne(
    'lesson_progress',
    (p) => p.user_id === params.userId && p.lesson_id === lesson.id
  ) as LessonProgress | undefined;

  const lessonStatus = isCompleted || lp?.status === 'completed' ? 'completed' : 'in-progress';

  if (!lp) {
    lp = {
      id: `lp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      user_id: params.userId,
      lesson_id: lesson.id,
      course_id: lesson.course_id,
      status: lessonStatus,
      practice_questions_answered: 0,
      practice_questions_correct: 0,
      completed_at: isCompleted ? now : undefined,
      updated_at: now,
    };
    db.insert('lesson_progress', lp);
  } else {
    db.update('lesson_progress', lp.id, {
      status: lessonStatus,
      completed_at: lp.completed_at || (isCompleted ? now : undefined),
      updated_at: now,
    });
  }

  // Roll up to course_progress
  updateCourseProgressRollup(params.userId, lesson.course_id);

  return {
    lastPlaybackSeconds: Math.round(params.playbackSeconds),
    watchedPercentage: watchedPct,
    isCompleted,
  };
}

export function updateCourseProgressRollup(userId: string, courseId: string) {
  const allLessons = db.find('lessons', (l) => l.course_id === courseId);
  const total = allLessons.length;
  if (total === 0) return;

  const completedCount = allLessons.filter((l) => {
    const lp = db.findOne(
      'lesson_progress',
      (p) => p.user_id === userId && p.lesson_id === l.id && p.status === 'completed'
    );
    return !!lp;
  }).length;

  const progressPct = Math.round((completedCount / total) * 100);
  const isCourseCompleted = completedCount === total;
  const now = new Date().toISOString();

  let cp = db.findOne(
    'course_progress',
    (p) => p.user_id === userId && p.course_id === courseId
  ) as CourseProgress | undefined;

  if (!cp) {
    cp = {
      id: `cp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      user_id: userId,
      course_id: courseId,
      total_lessons: total,
      completed_lessons: completedCount,
      progress_percentage: progressPct,
      is_completed: isCourseCompleted,
      completed_at: isCourseCompleted ? now : undefined,
      updated_at: now,
    };
    db.insert('course_progress', cp);
  } else {
    db.update('course_progress', cp.id, {
      total_lessons: total,
      completed_lessons: completedCount,
      progress_percentage: progressPct,
      is_completed: cp.is_completed || isCourseCompleted,
      completed_at: cp.completed_at || (isCourseCompleted ? now : undefined),
      updated_at: now,
    });
  }
}

export function getLessonProgress(userId: string, lessonId: string) {
  const video = db.findOne('videos', (v) => v.lesson_id === lessonId) as Video | undefined;
  if (!video) return { lastPlaybackSeconds: 0, watchedPercentage: 0, isCompleted: false };

  const vp = db.findOne(
    'video_progress',
    (v) => v.user_id === userId && v.video_id === video.id
  ) as VideoProgress | undefined;

  return {
    lastPlaybackSeconds: vp?.last_playback_seconds || 0,
    watchedPercentage: vp?.watched_percentage || 0,
    isCompleted: vp?.is_completed || false,
  };
}
