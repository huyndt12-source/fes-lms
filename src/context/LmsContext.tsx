import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  initialInProgressAnswers,
  initialInProgressFlags,
  initialMockExams,
  initialStudentProfile,
  mock01TopicResults,
} from '../data/mockData';
import { initialCourses, initialLessonNotes } from '../data/coursesData';
import {
  onAuthChange,
  loginWithEmailPassword,
  logoutFirebase,
  isPasswordLoginDisabledError,
} from '../services/firebaseAuth';
import { apiClient } from '../services/apiClient';
import {
  ActiveExamSession,
  CfaTopic,
  Course,
  ExamResultData,
  Lesson,
  LessonNote,
  MockExam,
  NavigationTab,
  Question,
  StudentProfile,
  TopicResult,
} from '../types';

export type ViewMode =
  | 'dashboard'
  | 'mock-library'
  | 'exam-interface'
  | 'exam-result'
  | 'review-answers'
  | 'analytics'
  | 'my-courses'
  | 'course-detail'
  | 'video-lesson'
  | 'practice-questions'
  | 'exam-history'
  | 'bookmarks-notes'
  | 'study-resources'
  | 'settings'
  | 'admin';

interface LmsContextType {
  currentTab: NavigationTab;
  currentView: ViewMode;
  currentUserRole: string;
  switchUserRole: (role: string) => Promise<void>;
  firebaseUser: any | null;
  authLoading: boolean;
  authError: string | null;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  studentProfile: StudentProfile;
  mockExams: MockExam[];
  activeExam: MockExam | null;
  activeSession: ActiveExamSession | null;
  latestResult: ExamResultData | null;
  reviewFilter: 'all' | 'incorrect' | 'correct' | 'flagged' | 'unanswered';
  selectedReviewQuestionIndex: number;
  isSubmitModalOpen: boolean;
  isInstructionsModalOpen: boolean;
  selectedExamForInstructions: MockExam | null;
  isCalculatorOpen: boolean;
  isScratchpadOpen: boolean;
  bookmarks: number[];
  notes: Record<number, string>;
  isSidebarOpenMobile: boolean;

  // Video Learning Module State
  courses: Course[];
  selectedCourseId: string;
  selectedLessonId: string;
  selectedCourse: Course | undefined;
  selectedLesson: Lesson | undefined;
  lessonNotes: LessonNote[];
  currentPlaybackSeconds: number;
  playbackSpeed: number;
  isVideoPlaying: boolean;
  videoVolume: number;
  activeVideoTab: 'overview' | 'notes' | 'resources' | 'practice';

  // Actions
  navigateToTab: (tab: NavigationTab) => void;
  navigateToView: (view: ViewMode) => void;
  openExamInstructions: (exam: MockExam) => void;
  closeExamInstructions: () => void;
  startExam: (exam: MockExam, resume?: boolean) => void;
  resumeInProgressExam: () => void;
  selectAnswer: (questionId: number, optionId: 'A' | 'B' | 'C') => void;
  clearAnswer: (questionId: number) => void;
  toggleFlag: (questionId: number) => void;
  goToQuestion: (index: number) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  togglePauseTimer: () => void;
  setFontSize: (size: 'normal' | 'large' | 'extra-large') => void;
  openSubmitModal: () => void;
  closeSubmitModal: () => void;
  submitExam: () => void;
  viewCompletedExamResult: (examId: string) => void;
  startReviewAnswers: (examId?: string, filter?: 'all' | 'incorrect' | 'correct' | 'flagged' | 'unanswered') => void;
  setReviewFilter: (filter: 'all' | 'incorrect' | 'correct' | 'flagged' | 'unanswered') => void;
  setSelectedReviewQuestionIndex: (index: number) => void;
  toggleBookmark: (questionId: number) => void;
  saveQuestionNote: (questionId: number, text: string) => void;
  toggleCalculator: () => void;
  toggleScratchpad: () => void;
  toggleMobileSidebar: () => void;

  // Video Learning Actions
  openCourseDetail: (courseId: string) => void;
  openLessonVideo: (courseId: string, lessonId: string, resumeSeconds?: number) => void;
  togglePlayVideo: () => void;
  seekVideo: (seconds: number) => void;
  setPlaybackSpeed: (speed: number) => void;
  setVideoVolume: (vol: number) => void;
  setActiveVideoTab: (tab: 'overview' | 'notes' | 'resources' | 'practice') => void;
  markLessonCompleted: (courseId: string, lessonId: string) => void;
  addLessonNote: (lessonId: string, text: string, timestampSeconds: number) => void;
  editLessonNote: (noteId: string, text: string) => void;
  deleteLessonNote: (noteId: string) => void;
}

const LmsContext = createContext<LmsContextType | undefined>(undefined);

export const LmsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [currentUserRole, setCurrentUserRole] = useState<string>('ADMIN');
  const [studentProfile, setStudentProfile] = useState<StudentProfile>(initialStudentProfile);
  const [firebaseUser, setFirebaseUser] = useState<any | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [mockExams, setMockExams] = useState<MockExam[]>(initialMockExams);
  const [activeExam, setActiveExam] = useState<MockExam | null>(null);

  const refreshAuth = async () => {
    try {
      const data = await apiClient.getAuthMe();
      if (data?.role?.id) {
        setCurrentUserRole(data.role.id);
      }
      if (data?.profile?.full_name) {
        setStudentProfile((prev) => ({
          ...prev,
          name: data.profile.full_name,
          title: data.profile.study_title || prev.title,
        }));
      }
    } catch (err: any) {
      console.warn('Failed to refresh auth context:', err);
    }
  };

  useEffect(() => {
    // 1. Initial auth fetch
    refreshAuth();

    // 2. Subscribe to Firebase Auth state changes
    const unsubscribe = onAuthChange(async (user) => {
      setFirebaseUser(user);
      setAuthLoading(false);
      await refreshAuth();
    });

    return () => unsubscribe();
  }, []);

  const loginWithEmail = async (email: string, pass: string) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      await loginWithEmailPassword(email, pass);
      await refreshAuth();
    } catch (err: any) {
      if (isPasswordLoginDisabledError(err)) {
        setAuthError(
          'Email/Password provider is currently disabled in Firebase Console. Please enable it under Authentication > Sign-in method.'
        );
      } else {
        setAuthError(err.message || 'Login failed');
      }
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    setAuthLoading(true);
    try {
      await logoutFirebase();
      await refreshAuth();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setAuthLoading(false);
    }
  };

  const switchUserRole = async (newRole: string) => {
    try {
      const data = await apiClient.switchRole(newRole);
      if (data?.current?.role?.id) {
        setCurrentUserRole(data.current.role.id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Video Learning Module States
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('cfa-l1-fra');
  const [selectedLessonId, setSelectedLessonId] = useState<string>('fra-m01-l03');
  const [lessonNotes, setLessonNotes] = useState<LessonNote[]>(initialLessonNotes);
  const [currentPlaybackSeconds, setCurrentPlaybackSeconds] = useState<number>(1475); // 24:35
  const [playbackSpeed, setPlaybackSpeedState] = useState<number>(1);
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(false);
  const [videoVolume, setVideoVolumeState] = useState<number>(0.85);
  const [activeVideoTab, setActiveVideoTab] = useState<'overview' | 'notes' | 'resources' | 'practice'>('overview');

  // Initialize activeSession with the in-progress Mock Exam 02 (question 43 / 90, 68m15s remaining, 42 answered, 5 flagged)
  const [activeSession, setActiveSession] = useState<ActiveExamSession | null>({
    examId: 'fes-cfa-l1-mock-02',
    examTitle: 'FES CFA Level I - Mock Exam 02 (Session 1)',
    totalQuestions: 90,
    currentQuestionIndex: 42, // index 42 is Question 43
    answers: initialInProgressAnswers,
    flaggedQuestionIds: initialInProgressFlags,
    remainingSeconds: 68 * 60 + 15, // 01:08:15
    totalDurationSeconds: 135 * 60,
    isPaused: false,
    fontSizeLevel: 'normal',
  });

  // Default pre-computed result for Mock 01 (matching Image 9 & HTML 5)
  const defaultMock01Result: ExamResultData = {
    examId: 'fes-cfa-l1-mock-01',
    examTitle: 'FES CFA Level I - Mock Exam 01 (Full 180 Qs)',
    completedAt: '20 Tháng 9, 2026',
    timeSpentFormatted: '4 giờ 14 phút',
    timeSpentSeconds: 254 * 60,
    totalQuestions: 180,
    correctCount: 140,
    incorrectCount: 32,
    unansweredCount: 8,
    scorePercentage: 78,
    passedMps: true,
    mpsPercentage: 70,
    confidenceBand: { min: 75, max: 81 },
    percentileRank: 12,
    avgSecondsPerQuestion: 85,
    topicBreakdown: mock01TopicResults,
    answers: initialInProgressAnswers,
    flaggedIds: initialInProgressFlags,
  };

  const [latestResult, setLatestResult] = useState<ExamResultData | null>(defaultMock01Result);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'incorrect' | 'correct' | 'flagged' | 'unanswered'>('all');
  const [selectedReviewQuestionIndex, setSelectedReviewQuestionIndex] = useState<number>(0);

  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isInstructionsModalOpen, setIsInstructionsModalOpen] = useState(false);
  const [selectedExamForInstructions, setSelectedExamForInstructions] = useState<MockExam | null>(null);

  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isScratchpadOpen, setIsScratchpadOpen] = useState(false);
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);

  const [bookmarks, setBookmarks] = useState<number[]>([12, 43, 78]);
  const [notes, setNotes] = useState<Record<number, string>>({
    43: 'Ghi chú quan trọng: IFRS 16 tách payment thành lãi (CFO) và gốc (CFF) -> CFO tăng so với IAS 17.',
  });

  // Live countdown timer for the exam
  useEffect(() => {
    if (currentView !== 'exam-interface' || !activeSession || activeSession.isPaused) {
      return;
    }

    const interval = setInterval(() => {
      setActiveSession((prev) => {
        if (!prev) return null;
        if (prev.remainingSeconds <= 1) {
          clearInterval(interval);
          // Auto submit when time runs out
          setTimeout(() => submitExam(), 0);
          return { ...prev, remainingSeconds: 0 };
        }
        return { ...prev, remainingSeconds: prev.remainingSeconds - 1 };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentView, activeSession?.isPaused]);

  const navigateToTab = (tab: NavigationTab) => {
    setCurrentTab(tab);
    setIsSidebarOpenMobile(false);
    if (tab === 'dashboard') setCurrentView('dashboard');
    else if (tab === 'mock-exams') setCurrentView('mock-library');
    else if (tab === 'analytics') setCurrentView('analytics');
    else setCurrentView(tab as ViewMode);
  };

  const navigateToView = (view: ViewMode) => {
    setCurrentView(view);
    setIsSidebarOpenMobile(false);
    if (view === 'dashboard') setCurrentTab('dashboard');
    else if (view === 'mock-library' || view === 'exam-interface' || view === 'exam-result' || view === 'review-answers') {
      setCurrentTab('mock-exams');
    } else if (view === 'analytics') {
      setCurrentTab('analytics');
    } else if (view === 'my-courses' || view === 'course-detail' || view === 'video-lesson') {
      setCurrentTab('my-courses');
    }
  };

  const openExamInstructions = (exam: MockExam) => {
    setSelectedExamForInstructions(exam);
    setIsInstructionsModalOpen(true);
  };

  const closeExamInstructions = () => {
    setIsInstructionsModalOpen(false);
    setSelectedExamForInstructions(null);
  };

  const startExam = (exam: MockExam, resume = false) => {
    closeExamInstructions();
    setActiveExam(exam);

    if (resume && activeSession && activeSession.examId === exam.id) {
      // Resume existing state
      setCurrentView('exam-interface');
      setCurrentTab('mock-exams');
      return;
    }

    // New session
    setActiveSession({
      examId: exam.id,
      examTitle: exam.title,
      totalQuestions: exam.totalQuestions,
      currentQuestionIndex: 0,
      answers: {},
      flaggedQuestionIds: [],
      remainingSeconds: exam.durationMinutes * 60,
      totalDurationSeconds: exam.durationMinutes * 60,
      isPaused: false,
      fontSizeLevel: 'normal',
    });

    setCurrentView('exam-interface');
    setCurrentTab('mock-exams');
  };

  const resumeInProgressExam = () => {
    const mock02 = mockExams.find((e) => e.id === 'fes-cfa-l1-mock-02') || mockExams[0];
    setActiveExam(mock02);
    setCurrentView('exam-interface');
    setCurrentTab('mock-exams');
  };

  const selectAnswer = (questionId: number, optionId: 'A' | 'B' | 'C') => {
    if (!activeSession) return;
    setActiveSession((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        answers: {
          ...prev.answers,
          [questionId]: optionId,
        },
      };
    });
  };

  const clearAnswer = (questionId: number) => {
    if (!activeSession) return;
    setActiveSession((prev) => {
      if (!prev) return null;
      const nextAnswers = { ...prev.answers };
      delete nextAnswers[questionId];
      return {
        ...prev,
        answers: nextAnswers,
      };
    });
  };

  const toggleFlag = (questionId: number) => {
    if (!activeSession) return;
    setActiveSession((prev) => {
      if (!prev) return null;
      const isFlagged = prev.flaggedQuestionIds.includes(questionId);
      const flaggedQuestionIds = isFlagged
        ? prev.flaggedQuestionIds.filter((id) => id !== questionId)
        : [...prev.flaggedQuestionIds, questionId];
      return {
        ...prev,
        flaggedQuestionIds,
      };
    });
  };

  const goToQuestion = (index: number) => {
    if (!activeSession) return;
    if (index >= 0 && index < activeSession.totalQuestions) {
      setActiveSession((prev) => (prev ? { ...prev, currentQuestionIndex: index } : null));
    }
  };

  const nextQuestion = () => {
    if (!activeSession) return;
    if (activeSession.currentQuestionIndex < activeSession.totalQuestions - 1) {
      goToQuestion(activeSession.currentQuestionIndex + 1);
    }
  };

  const prevQuestion = () => {
    if (!activeSession) return;
    if (activeSession.currentQuestionIndex > 0) {
      goToQuestion(activeSession.currentQuestionIndex - 1);
    }
  };

  const togglePauseTimer = () => {
    if (!activeSession) return;
    setActiveSession((prev) => (prev ? { ...prev, isPaused: !prev.isPaused } : null));
  };

  const setFontSize = (size: 'normal' | 'large' | 'extra-large') => {
    if (!activeSession) return;
    setActiveSession((prev) => (prev ? { ...prev, fontSizeLevel: size } : null));
  };

  const openSubmitModal = () => {
    setIsSubmitModalOpen(true);
  };

  const closeSubmitModal = () => {
    setIsSubmitModalOpen(false);
  };

  const submitExam = () => {
    if (!activeSession) return;
    setIsSubmitModalOpen(false);

    const exam = activeExam || mockExams.find((e) => e.id === activeSession.examId) || mockExams[0];
    const questions = exam.questions;

    // Calculate actual score from answered questions
    let correct = 0;
    let incorrect = 0;
    let unanswered = 0;

    const topicStats: Record<
      string,
      { total: number; correct: number; subtopics: string; weight: string; targetMps: number }
    > = {};

    questions.forEach((q) => {
      if (!topicStats[q.topic]) {
        topicStats[q.topic] = {
          total: 0,
          correct: 0,
          subtopics: q.subtopic || 'General Topic Content',
          weight: '10-15%',
          targetMps: 70,
        };
      }
      topicStats[q.topic].total += 1;

      const userAns = activeSession.answers[q.id];
      if (!userAns) {
        unanswered += 1;
      } else if (userAns === q.correctAnswer) {
        correct += 1;
        topicStats[q.topic].correct += 1;
      } else {
        incorrect += 1;
      }
    });

    const totalQuestions = questions.length;
    const scorePercentage = Math.round((correct / totalQuestions) * 100);
    const passedMps = scorePercentage >= (exam.passingScoreMps || 70);
    const timeSpentSec = activeSession.totalDurationSeconds - activeSession.remainingSeconds;
    const hours = Math.floor(timeSpentSec / 3600);
    const mins = Math.floor((timeSpentSec % 3600) / 60);
    const timeSpentFormatted = hours > 0 ? `${hours} giờ ${mins} phút` : `${mins} phút`;

    const topicBreakdown: TopicResult[] = Object.entries(topicStats).map(([topic, data]) => {
      const pct = Math.round((data.correct / Math.max(1, data.total)) * 100);
      let status: TopicResult['status'] = 'Đạt';
      let statusBadge = 'Đạt';
      let recommendation = 'Duy trì phong độ làm bài';

      if (pct >= 85) {
        status = 'Vượt trội';
        statusBadge = 'Vượt trội - Duy trì';
        recommendation = 'Duy trì ôn tập 10 câu Flashcard mỗi tuần';
      } else if (pct >= 75) {
        status = 'Tốt';
        statusBadge = 'Tốt';
        recommendation = 'Luyện tập các case study nâng cao';
      } else if (pct >= 65) {
        status = 'Cần cải thiện';
        statusBadge = '⚠️ Cận MPS - Cần ôn';
        recommendation = 'Cần làm thêm 20 bài tập trọng điểm';
      } else {
        status = 'Vùng nguy hiểm';
        statusBadge = '🚨 Vùng nguy hiểm - Dưới MPS';
        recommendation = 'Học lại lý thuyết nền tảng & công thức';
      }

      return {
        topic: topic as CfaTopic,
        subtopics: data.subtopics,
        weight: data.weight,
        total: data.total,
        correct: data.correct,
        percentage: pct,
        targetMps: data.targetMps,
        status,
        statusBadge,
        actionRecommendation: recommendation,
      };
    });

    const resultData: ExamResultData = {
      examId: exam.id,
      examTitle: exam.title,
      completedAt: 'Hôm nay, 11:30 SA',
      timeSpentFormatted,
      timeSpentSeconds: timeSpentSec,
      totalQuestions,
      correctCount: correct,
      incorrectCount: incorrect,
      unansweredCount: unanswered,
      scorePercentage,
      passedMps,
      mpsPercentage: exam.passingScoreMps || 70,
      confidenceBand: {
        min: Math.max(0, scorePercentage - 3),
        max: Math.min(100, scorePercentage + 3),
      },
      percentileRank: scorePercentage >= 75 ? 12 : 25,
      avgSecondsPerQuestion: Math.max(30, Math.round(timeSpentSec / Math.max(1, correct + incorrect))),
      topicBreakdown,
      answers: activeSession.answers,
      flaggedIds: activeSession.flaggedQuestionIds,
    };

    setLatestResult(resultData);

    // Update Mock Exam state in list
    setMockExams((prev) =>
      prev.map((e) =>
        e.id === exam.id
          ? {
              ...e,
              status: 'completed',
              userScorePercentage: scorePercentage,
              correctCount: correct,
              completedDate: 'Hôm nay',
              timeSpentSeconds: timeSpentSec,
            }
          : e
      )
    );

    // Update Student Profile KPIs on Dashboard
    setStudentProfile((prev) => {
      const answeredNew = Object.keys(activeSession.answers).length;
      const nextCompletedMocks = prev.completedMocksCount + 1;
      const nextAvg = Math.round((prev.averageScorePercentage * prev.completedMocksCount + scorePercentage) / nextCompletedMocks);
      return {
        ...prev,
        completedMocksCount: nextCompletedMocks,
        questionsCompleted: prev.questionsCompleted + answeredNew,
        todayQuestions: prev.todayQuestions + answeredNew,
        averageScorePercentage: nextAvg,
        forecastScore: parseFloat(((prev.forecastScore + scorePercentage) / 2).toFixed(1)),
      };
    });

    // Navigate to Result screen
    setCurrentView('exam-result');
  };

  const viewCompletedExamResult = (examId: string) => {
    const exam = mockExams.find((e) => e.id === examId);
    if (!exam) return;
    setActiveExam(exam);

    if (exam.id === 'fes-cfa-l1-mock-01' || !latestResult || latestResult.examId !== exam.id) {
      setLatestResult({
        ...defaultMock01Result,
        examId: exam.id,
        examTitle: exam.title,
        scorePercentage: exam.userScorePercentage || 78,
      });
    }

    setCurrentView('exam-result');
    setCurrentTab('mock-exams');
  };

  const startReviewAnswers = (
    examId?: string,
    filter: 'all' | 'incorrect' | 'correct' | 'flagged' | 'unanswered' = 'all'
  ) => {
    if (examId) {
      const exam = mockExams.find((e) => e.id === examId);
      if (exam) setActiveExam(exam);
    }
    setReviewFilter(filter);
    setSelectedReviewQuestionIndex(0);
    setCurrentView('review-answers');
  };

  const toggleBookmark = (questionId: number) => {
    setBookmarks((prev) =>
      prev.includes(questionId) ? prev.filter((id) => id !== questionId) : [...prev, questionId]
    );
  };

  const saveQuestionNote = (questionId: number, text: string) => {
    setNotes((prev) => ({
      ...prev,
      [questionId]: text,
    }));
  };

  const toggleCalculator = () => setIsCalculatorOpen((prev) => !prev);
  const toggleScratchpad = () => setIsScratchpadOpen((prev) => !prev);
  const toggleMobileSidebar = () => setIsSidebarOpenMobile((prev) => !prev);

  // Derived selectedCourse and selectedLesson
  const selectedCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];
  let foundLesson: Lesson | undefined;
  for (const mod of selectedCourse?.modules || []) {
    const l = mod.lessons.find((les) => les.id === selectedLessonId);
    if (l) {
      foundLesson = l;
      break;
    }
  }
  const selectedLesson = foundLesson || selectedCourse?.modules[0]?.lessons[0];

  // Video playback ticker effect
  useEffect(() => {
    if (currentView !== 'video-lesson' || !isVideoPlaying || !selectedLesson) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentPlaybackSeconds((prev) => {
        const nextTime = Math.min(selectedLesson.durationSeconds, prev + 1 * playbackSpeed);
        // If reached end, mark as completed
        if (nextTime >= selectedLesson.durationSeconds) {
          setIsVideoPlaying(false);
          markLessonCompleted(selectedCourseId, selectedLesson.id);
          return selectedLesson.durationSeconds;
        }
        return nextTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentView, isVideoPlaying, playbackSpeed, selectedLesson, selectedCourseId]);

  // Video Learning Actions
  const openCourseDetail = (courseId: string) => {
    setSelectedCourseId(courseId);
    setCurrentTab('my-courses');
    setCurrentView('course-detail');
  };

  const openLessonVideo = (courseId: string, lessonId: string, resumeSeconds?: number) => {
    setSelectedCourseId(courseId);
    setSelectedLessonId(lessonId);

    // Find lesson to restore playback position
    const targetCourse = courses.find((c) => c.id === courseId);
    let targetLesson: Lesson | undefined;
    for (const m of targetCourse?.modules || []) {
      const l = m.lessons.find((x) => x.id === lessonId);
      if (l) {
        targetLesson = l;
        break;
      }
    }

    const startPos = resumeSeconds !== undefined
      ? resumeSeconds
      : targetLesson
      ? targetLesson.lastPlaybackSeconds
      : 0;

    setCurrentPlaybackSeconds(startPos);
    setIsVideoPlaying(false);
    setCurrentTab('my-courses');
    setCurrentView('video-lesson');
  };

  const togglePlayVideo = () => {
    setIsVideoPlaying((prev) => !prev);
  };

  const seekVideo = (seconds: number) => {
    if (!selectedLesson) return;
    const clamped = Math.max(0, Math.min(selectedLesson.durationSeconds, seconds));
    setCurrentPlaybackSeconds(clamped);

    // Update lesson lastPlaybackSeconds
    setCourses((prevCourses) =>
      prevCourses.map((c) => {
        if (c.id !== selectedCourseId) return c;
        return {
          ...c,
          modules: c.modules.map((m) => ({
            ...m,
            lessons: m.lessons.map((l) => {
              if (l.id !== selectedLesson.id) return l;
              const pct = Math.min(100, Math.round((clamped / l.durationSeconds) * 100));
              return {
                ...l,
                lastPlaybackSeconds: clamped,
                watchedPercentage: Math.max(l.watchedPercentage, pct),
              };
            }),
          })),
        };
      })
    );
  };

  const setPlaybackSpeed = (speed: number) => {
    setPlaybackSpeedState(speed);
  };

  const setVideoVolume = (vol: number) => {
    setVideoVolumeState(vol);
  };

  const markLessonCompleted = (courseId: string, lessonId: string) => {
    setCourses((prevCourses) => {
      return prevCourses.map((c) => {
        if (c.id !== courseId) return c;

        let newlyCompleted = 0;
        const updatedModules = c.modules.map((m) => {
          return {
            ...m,
            lessons: m.lessons.map((l) => {
              if (l.id === lessonId) {
                if (l.status !== 'completed') newlyCompleted = 1;
                return {
                  ...l,
                  status: 'completed' as const,
                  watchedPercentage: 100,
                  lastPlaybackSeconds: l.durationSeconds,
                };
              }
              return l;
            }),
          };
        });

        const nextCompletedCount = c.completedLessonsCount + newlyCompleted;
        const nextProgress = Math.round((nextCompletedCount / Math.max(1, c.totalLessonsCount)) * 100);

        return {
          ...c,
          completedLessonsCount: nextCompletedCount,
          progressPercentage: nextProgress,
          modules: updatedModules,
        };
      });
    });

    // Update Student Profile Overall Progress
    setStudentProfile((prev) => ({
      ...prev,
      overallProgressPercentage: Math.min(100, parseFloat((prev.overallProgressPercentage + 0.5).toFixed(1))),
    }));
  };

  const addLessonNote = (lessonId: string, text: string, timestampSeconds: number) => {
    const mins = Math.floor(timestampSeconds / 60);
    const secs = Math.floor(timestampSeconds % 60);
    const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    const newNote: LessonNote = {
      id: 'note_' + Date.now(),
      lessonId,
      timestampSeconds,
      timestampFormatted: formatted,
      text,
      createdAt: 'Vừa xong',
    };

    setLessonNotes((prev) => [newNote, ...prev]);
  };

  const editLessonNote = (noteId: string, text: string) => {
    setLessonNotes((prev) =>
      prev.map((n) => (n.id === noteId ? { ...n, text, createdAt: 'Đã chỉnh sửa' } : n))
    );
  };

  const deleteLessonNote = (noteId: string) => {
    setLessonNotes((prev) => prev.filter((n) => n.id !== noteId));
  };

  return (
    <LmsContext.Provider
      value={{
        currentTab,
        currentView,
        currentUserRole,
        switchUserRole,
        firebaseUser,
        authLoading,
        authError,
        loginWithEmail,
        logout,
        refreshAuth,
        studentProfile,
        mockExams,
        activeExam,
        activeSession,
        latestResult,
        reviewFilter,
        selectedReviewQuestionIndex,
        isSubmitModalOpen,
        isInstructionsModalOpen,
        selectedExamForInstructions,
        isCalculatorOpen,
        isScratchpadOpen,
        bookmarks,
        notes,
        isSidebarOpenMobile,
        courses,
        selectedCourseId,
        selectedLessonId,
        selectedCourse,
        selectedLesson,
        lessonNotes,
        currentPlaybackSeconds,
        playbackSpeed,
        isVideoPlaying,
        videoVolume,
        activeVideoTab,
        navigateToTab,
        navigateToView,
        openExamInstructions,
        closeExamInstructions,
        startExam,
        resumeInProgressExam,
        selectAnswer,
        clearAnswer,
        toggleFlag,
        goToQuestion,
        nextQuestion,
        prevQuestion,
        togglePauseTimer,
        setFontSize,
        openSubmitModal,
        closeSubmitModal,
        submitExam,
        viewCompletedExamResult,
        startReviewAnswers,
        setReviewFilter,
        setSelectedReviewQuestionIndex,
        toggleBookmark,
        saveQuestionNote,
        toggleCalculator,
        toggleScratchpad,
        toggleMobileSidebar,
        openCourseDetail,
        openLessonVideo,
        togglePlayVideo,
        seekVideo,
        setPlaybackSpeed,
        setVideoVolume,
        setActiveVideoTab,
        markLessonCompleted,
        addLessonNote,
        editLessonNote,
        deleteLessonNote,
      }}
    >
      {children}
    </LmsContext.Provider>
  );

};

export const useLms = () => {
  const context = useContext(LmsContext);
  if (!context) {
    throw new Error('useLms must be used within an LmsProvider');
  }
  return context;
};
