import { db } from '../db/database';
import { User, UserProfile, AuditLog } from '../db/schema';
import { recordAuditLog } from './auditService';
import { getCurrentUserContext } from './authService';

export interface CreateStudentInput {
  fullName: string;
  email: string;
  cfaLevel: 'Level I' | 'Level II' | 'Level III';
  targetExamDate: string;
  phoneNumber?: string;
  isActive?: boolean;
}

export interface UpdateStudentInput {
  fullName?: string;
  phoneNumber?: string;
  cfaLevel?: 'Level I' | 'Level II' | 'Level III';
  targetExamDate?: string;
  studyTitle?: string;
  isActive?: boolean;
}

export interface StudentListItem {
  id: string;
  email: string;
  name: string;
  phone?: string;
  cfaLevel: string;
  targetDate: string;
  studyTitle: string;
  isActive: boolean;
  streakDays: number;
  forecastScore: number;
  readinessIndex: number;
  totalAttempts: number;
  completedAttempts: number;
  lastActive: string;
  createdAt: string;
}

export function listStudents(filters?: {
  search?: string;
  cfaLevel?: string;
  status?: string;
  targetDate?: string;
}): StudentListItem[] {
  const students = db.find('users', (u) => u.role_id === 'STUDENT');
  const profiles = db.getTable('user_profiles');
  const attempts = db.getTable('exam_attempts');

  let list: StudentListItem[] = students.map((s) => {
    const p = profiles.find((prof) => prof.user_id === s.id);
    const studentAttempts = attempts.filter((a) => a.user_id === s.id);
    const completed = studentAttempts.filter((a) => a.status === 'completed');

    return {
      id: s.id,
      email: s.email,
      name: p?.full_name || s.email,
      phone: p?.phone_number,
      cfaLevel: p?.cfa_level || 'Level I',
      targetDate: p?.target_exam_date || 'Nov 2026',
      studyTitle: p?.study_title || `CFA ${p?.cfa_level || 'Level I'} Candidate`,
      isActive: s.is_active,
      streakDays: p?.streak_days || 0,
      forecastScore: p?.forecast_score || 0,
      readinessIndex: p?.readiness_index || 0,
      totalAttempts: studentAttempts.length,
      completedAttempts: completed.length,
      lastActive: s.last_login_at || s.created_at,
      createdAt: s.created_at,
    };
  });

  // Apply filters
  if (filters?.search) {
    const term = filters.search.toLowerCase().trim();
    list = list.filter(
      (s) => s.name.toLowerCase().includes(term) || s.email.toLowerCase().includes(term)
    );
  }

  if (filters?.cfaLevel && filters.cfaLevel !== 'ALL') {
    list = list.filter((s) => s.cfaLevel === filters.cfaLevel);
  }

  if (filters?.status && filters.status !== 'ALL') {
    if (filters.status === 'ACTIVE') {
      list = list.filter((s) => s.isActive);
    } else if (filters.status === 'INACTIVE') {
      list = list.filter((s) => !s.isActive);
    }
  }

  if (filters?.targetDate && filters.targetDate !== 'ALL') {
    list = list.filter((s) => s.targetDate.includes(filters.targetDate!));
  }

  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function createStudent(input: CreateStudentInput): {
  student: StudentListItem;
  invitationUrl: string;
  firebaseAuthPrepared: boolean;
} {
  // 1. Validation
  if (!input.fullName || !input.fullName.trim()) {
    throw new Error('Họ và tên học viên là bắt buộc');
  }

  if (!input.email || !input.email.trim()) {
    throw new Error('Email học viên là bắt buộc');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(input.email.trim())) {
    throw new Error('Định dạng email không hợp lệ');
  }

  if (!input.cfaLevel || !['Level I', 'Level II', 'Level III'].includes(input.cfaLevel)) {
    throw new Error('CFA Level phải là Level I, Level II hoặc Level III');
  }

  if (!input.targetExamDate || !input.targetExamDate.trim()) {
    throw new Error('Kỳ thi mục tiêu là bắt buộc');
  }

  // 2. Duplicate email check
  const existingUser = db.findOne(
    'users',
    (u) => u.email.toLowerCase() === input.email.trim().toLowerCase()
  );
  if (existingUser) {
    throw new Error(`Email "${input.email.trim()}" đã tồn tại trong hệ thống`);
  }

  const now = new Date().toISOString();
  const studentId = `usr-std-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;

  // 3. Prepare for Firebase Authentication:
  // Admin NEVER sets or knows student password.
  // password_hash is flagged as PENDING_FIREBASE_INVITATION.
  const newUser: User = {
    id: studentId,
    role_id: 'STUDENT',
    email: input.email.trim().toLowerCase(),
    password_hash: 'PENDING_FIREBASE_INVITATION',
    is_active: input.isActive !== false,
    is_email_verified: false,
    created_at: now,
    updated_at: now,
  };

  const newProfile: UserProfile = {
    user_id: studentId,
    full_name: input.fullName.trim(),
    phone_number: input.phoneNumber?.trim() || undefined,
    target_exam_date: input.targetExamDate.trim(),
    cfa_level: input.cfaLevel,
    study_title: `CFA ${input.cfaLevel} Candidate (${input.targetExamDate.trim()})`,
    target_mps: 70,
    forecast_score: 0,
    readiness_index: 0,
    streak_days: 0,
    updated_at: now,
  };

  db.runInTransaction(() => {
    db.insert('users', newUser);
    db.insert('user_profiles', newProfile);

    // Initial notification for student
    db.insert('notifications', {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      user_id: studentId,
      title: 'Chào mừng bạn đến với FES Academy LMS',
      message: `Hồ sơ học viên CFA ${input.cfaLevel} của bạn đã được thiết lập thành công. Hãy bắt đầu lộ trình học ngay hôm nay!`,
      type: 'general',
      link_url: '/dashboard',
      is_read: false,
      created_at: now,
    });

    // Record audit log
    recordAuditLog({
      action: 'STUDENT_CREATED',
      entity_type: 'USER',
      entity_id: studentId,
      new_values: {
        email: newUser.email,
        fullName: newProfile.full_name,
        cfaLevel: newProfile.cfa_level,
        targetExamDate: newProfile.target_exam_date,
        isActive: newUser.is_active,
        authProvider: 'firebase_auth_pending',
      },
    });
  });

  const studentItem: StudentListItem = {
    id: studentId,
    email: newUser.email,
    name: newProfile.full_name,
    phone: newProfile.phone_number,
    cfaLevel: newProfile.cfa_level,
    targetDate: newProfile.target_exam_date || input.targetExamDate,
    studyTitle: newProfile.study_title,
    isActive: newUser.is_active,
    streakDays: 0,
    forecastScore: 0,
    readinessIndex: 0,
    totalAttempts: 0,
    completedAttempts: 0,
    lastActive: now,
    createdAt: now,
  };

  const invitationToken = `fes_setup_${studentId}_${Date.now().toString(36)}`;
  const invitationUrl = `https://lms.fesacademy.com.vn/auth/setup-password?token=${invitationToken}`;

  return {
    student: studentItem,
    invitationUrl,
    firebaseAuthPrepared: true,
  };
}

export function updateStudentProfile(
  studentId: string,
  updates: UpdateStudentInput
): StudentListItem {
  const user = db.findById('users', studentId) as User | undefined;
  if (!user || user.role_id !== 'STUDENT') {
    throw new Error(`Học viên với ID "${studentId}" không tồn tại`);
  }

  const profile = db.findOne('user_profiles', (p) => p.user_id === studentId) as
    | UserProfile
    | undefined;
  if (!profile) {
    throw new Error(`Hồ sơ học viên "${studentId}" không tìm thấy`);
  }

  const now = new Date().toISOString();
  const oldValues = {
    fullName: profile.full_name,
    phone: profile.phone_number,
    cfaLevel: profile.cfa_level,
    targetExamDate: profile.target_exam_date,
    isActive: user.is_active,
  };

  db.runInTransaction(() => {
    if (updates.isActive !== undefined && updates.isActive !== user.is_active) {
      db.update('users', studentId, {
        is_active: updates.isActive,
        updated_at: now,
      });
    }

    const profileUpdates: Partial<UserProfile> = { updated_at: now };
    if (updates.fullName !== undefined && updates.fullName.trim()) {
      profileUpdates.full_name = updates.fullName.trim();
    }
    if (updates.phoneNumber !== undefined) {
      profileUpdates.phone_number = updates.phoneNumber.trim() || undefined;
    }
    if (updates.cfaLevel !== undefined) {
      profileUpdates.cfa_level = updates.cfaLevel;
    }
    if (updates.targetExamDate !== undefined) {
      profileUpdates.target_exam_date = updates.targetExamDate.trim();
    }
    if (updates.studyTitle !== undefined) {
      profileUpdates.study_title = updates.studyTitle.trim();
    }

    db.update('user_profiles', profile.user_id, profileUpdates);

    recordAuditLog({
      action: 'STUDENT_UPDATED',
      entity_type: 'USER',
      entity_id: studentId,
      old_values: oldValues,
      new_values: updates,
    });
  });

  const updatedUser = db.findById('users', studentId) as User;
  const updatedProfile = db.findOne('user_profiles', (p) => p.user_id === studentId) as UserProfile;
  const studentAttempts = db.find('exam_attempts', (a) => a.user_id === studentId);

  return {
    id: updatedUser.id,
    email: updatedUser.email,
    name: updatedProfile.full_name,
    phone: updatedProfile.phone_number,
    cfaLevel: updatedProfile.cfa_level,
    targetDate: updatedProfile.target_exam_date || 'Nov 2026',
    studyTitle: updatedProfile.study_title,
    isActive: updatedUser.is_active,
    streakDays: updatedProfile.streak_days,
    forecastScore: updatedProfile.forecast_score,
    readinessIndex: updatedProfile.readiness_index,
    totalAttempts: studentAttempts.length,
    completedAttempts: studentAttempts.filter((a) => a.status === 'completed').length,
    lastActive: updatedUser.last_login_at || updatedUser.created_at,
    createdAt: updatedUser.created_at,
  };
}

export function setStudentStatus(studentId: string, isActive: boolean): { success: boolean; isActive: boolean } {
  const user = db.findById('users', studentId) as User | undefined;
  if (!user || user.role_id !== 'STUDENT') {
    throw new Error(`Học viên với ID "${studentId}" không tồn tại`);
  }

  const oldStatus = user.is_active;
  db.update('users', studentId, {
    is_active: isActive,
    updated_at: new Date().toISOString(),
  });

  recordAuditLog({
    action: isActive ? 'STUDENT_ACTIVATED' : 'STUDENT_DEACTIVATED',
    entity_type: 'USER',
    entity_id: studentId,
    old_values: { isActive: oldStatus },
    new_values: { isActive },
  });

  return { success: true, isActive };
}

export function bulkSetStudentStatus(
  studentIds: string[],
  isActive: boolean
): { successCount: number; failedCount: number } {
  let successCount = 0;
  let failedCount = 0;

  db.runInTransaction(() => {
    for (const id of studentIds) {
      try {
        const user = db.findById('users', id) as User | undefined;
        if (user && user.role_id === 'STUDENT') {
          db.update('users', id, {
            is_active: isActive,
            updated_at: new Date().toISOString(),
          });
          recordAuditLog({
            action: isActive ? 'STUDENT_ACTIVATED' : 'STUDENT_DEACTIVATED',
            entity_type: 'USER',
            entity_id: id,
            new_values: { bulkAction: true, isActive },
          });
          successCount++;
        } else {
          failedCount++;
        }
      } catch {
        failedCount++;
      }
    }
  });

  return { successCount, failedCount };
}

export function getStudentDetail(studentId: string) {
  const user = db.findById('users', studentId) as User | undefined;
  if (!user || user.role_id !== 'STUDENT') {
    throw new Error(`Học viên với ID "${studentId}" không tồn tại`);
  }

  const profile = db.findOne('user_profiles', (p) => p.user_id === studentId) as UserProfile | undefined;
  const attempts = db.find('exam_attempts', (a) => a.user_id === studentId);
  const mockExams = db.getTable('mock_exams');
  const videoProgress = db.find('video_progress', (vp) => vp.user_id === studentId);
  const lessonProgress = db.find('lesson_progress', (lp) => lp.user_id === studentId);
  const courseProgress = db.find('course_progress', (cp) => cp.user_id === studentId);
  const courses = db.getTable('courses');
  const lessons = db.getTable('lessons');
  const topics = db.getTable('topics');
  const studentNotes = db.find('student_notes', (n) => n.user_id === studentId);
  const auditLogs = db.find('audit_logs', (log) => log.entity_id === studentId);

  // 1. Overview data
  const overview = {
    id: user.id,
    email: user.email,
    fullName: profile?.full_name || user.email,
    phoneNumber: profile?.phone_number || '',
    cfaLevel: profile?.cfa_level || 'Level I',
    studyTitle: profile?.study_title || `CFA ${profile?.cfa_level || 'Level I'} Candidate`,
    targetExamDate: profile?.target_exam_date || 'Nov 2026',
    isActive: user.is_active,
    isEmailVerified: user.is_email_verified,
    targetMps: profile?.target_mps || 70,
    forecastScore: profile?.forecast_score || 0,
    readinessIndex: profile?.readiness_index || 0,
    streakDays: profile?.streak_days || 0,
    lastActiveDate: user.last_login_at || user.created_at,
    createdAt: user.created_at,
  };

  // 2. Learning Progress Data
  const totalVideoSeconds = videoProgress.reduce((acc, v) => acc + (v.last_playback_seconds || 0), 0);
  const completedLessonsCount = lessonProgress.filter((l) => l.status === 'completed').length;

  const coursesProgressDetailed = courses.map((c) => {
    const cp = courseProgress.find((p) => p.course_id === c.id);
    const courseLessons = lessons.filter((l) => l.course_id === c.id);
    const completedInCourse = lessonProgress.filter(
      (lp) => lp.course_id === c.id && lp.status === 'completed'
    ).length;

    return {
      courseId: c.id,
      title: c.title,
      level: c.level,
      instructor: c.instructor_name,
      totalLessons: courseLessons.length || cp?.total_lessons || 1,
      completedLessons: completedInCourse || cp?.completed_lessons || 0,
      progressPercentage:
        cp?.progress_percentage ||
        (courseLessons.length > 0
          ? Math.round((completedInCourse / courseLessons.length) * 100)
          : 0),
      isCompleted: cp?.is_completed || false,
      lastAccessedLessonId: cp?.last_accessed_lesson_id,
    };
  });

  // 3. Mock Exams History
  const mockAttemptsHistory = attempts
    .map((a) => {
      const exam = mockExams.find((e) => e.id === a.mock_exam_id);
      return {
        attemptId: a.id,
        examId: a.mock_exam_id,
        examTitle: exam?.title || a.mock_exam_id,
        examLevel: exam?.level || 'Level I',
        status: a.status,
        scorePercentage: a.score_percentage || 0,
        passedMps: a.passed_mps || false,
        correctCount: a.correct_count || 0,
        totalQuestions: exam?.total_questions || 90,
        timeSpentMinutes: Math.round(a.time_spent_seconds / 60),
        startedAt: a.started_at,
        completedAt: a.completed_at,
      };
    })
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

  // 4. Topic Performance
  const topicPerfList = db.find('topic_performance', (tp) =>
    attempts.some((a) => a.id === tp.attempt_id)
  );

  const topicPerformance = topics.map((top) => {
    const records = topicPerfList.filter((tp) => tp.topic_id === top.id);
    let avgPercentage = 0;
    let statusBadge = 'Chưa có dữ liệu';
    let performanceStatus = 'Đạt';

    if (records.length > 0) {
      avgPercentage = Math.round(
        records.reduce((sum, r) => sum + r.percentage, 0) / records.length
      );
      performanceStatus = records[records.length - 1].performance_status;
      statusBadge = records[records.length - 1].status_badge;
    } else {
      // Default estimation based on profile forecast score
      avgPercentage = profile?.forecast_score ? Math.round(profile.forecast_score) : 65;
      if (avgPercentage >= 75) {
        performanceStatus = 'Vượt trội';
        statusBadge = 'Vượt trội (>75%)';
      } else if (avgPercentage >= 70) {
        performanceStatus = 'Đạt';
        statusBadge = 'Đạt MPS (70-75%)';
      } else {
        performanceStatus = 'Cần cải thiện';
        statusBadge = 'Cần cải thiện (<70%)';
      }
    }

    return {
      topicId: top.id,
      topicName: top.name,
      topicCode: top.code,
      weightRange: `${top.weight_min}% - ${top.weight_max}%`,
      percentage: avgPercentage,
      targetMps: 70,
      passedMps: avgPercentage >= 70,
      performanceStatus,
      statusBadge,
      sampleSize: records.length,
    };
  });

  // 5. Activity Timeline
  const activities: Array<{
    id: string;
    type: 'LOGIN' | 'EXAM_SUBMISSION' | 'VIDEO_WATCH' | 'NOTE_ADDED' | 'STATUS_CHANGE';
    title: string;
    description: string;
    timestamp: string;
  }> = [];

  // Add exam activities
  for (const a of mockAttemptsHistory) {
    if (a.completedAt) {
      activities.push({
        id: `act-exam-${a.attemptId}`,
        type: 'EXAM_SUBMISSION',
        title: `Nộp bài thi thử: ${a.examTitle}`,
        description: `Đạt ${a.scorePercentage}% (${a.passedMps ? 'Đạt MPS' : 'Dưới MPS'}) - ${a.correctCount}/${a.totalQuestions} câu đúng`,
        timestamp: a.completedAt,
      });
    }
  }

  // Add notes activities
  for (const n of studentNotes) {
    activities.push({
      id: `act-note-${n.id}`,
      type: 'NOTE_ADDED',
      title: 'Tạo ghi chú bài giảng video',
      description: `Ghi chú tại mốc ${n.timestamp_formatted}: "${n.note_text.slice(0, 60)}..."`,
      timestamp: n.created_at,
    });
  }

  // Add audit logs for this student
  for (const log of auditLogs) {
    activities.push({
      id: `act-log-${log.id}`,
      type: 'STATUS_CHANGE',
      title: `Hệ thống: ${log.action}`,
      description: `Thực hiện bởi ${log.actor_name || 'Admin'}`,
      timestamp: log.created_at,
    });
  }

  // Sort activities newest first
  activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return {
    overview,
    learningProgress: {
      totalWatchMinutes: Math.round(totalVideoSeconds / 60),
      completedLessonsCount,
      totalEnrolledCourses: coursesProgressDetailed.length,
      courses: coursesProgressDetailed,
    },
    mockExams: mockAttemptsHistory,
    topicPerformance,
    courses: coursesProgressDetailed,
    activities: activities.slice(0, 30),
  };
}
