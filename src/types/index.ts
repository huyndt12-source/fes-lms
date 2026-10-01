export type NavigationTab =
  | 'dashboard'
  | 'my-courses'
  | 'mock-exams'
  | 'practice-questions'
  | 'analytics'
  | 'exam-history'
  | 'bookmarks-notes'
  | 'study-resources'
  | 'settings';

export type CfaTopic =
  | 'Ethical & Professional Standards'
  | 'Quantitative Methods'
  | 'Economics'
  | 'Financial Reporting & Analysis (FRA)'
  | 'Corporate Issuers'
  | 'Equity Investments'
  | 'Fixed Income'
  | 'Derivatives'
  | 'Alternative Investments'
  | 'Portfolio Management';

export interface QuestionOption {
  id: 'A' | 'B' | 'C';
  text: string;
  subtext?: string;
}

export interface QuestionExhibit {
  title: string;
  subtitle?: string;
  headers: string[];
  rows: string[][];
}

export interface Question {
  id: number;
  questionNumber: number;
  topic: CfaTopic;
  subtopic: string;
  reading: string;
  scenarioText?: string;
  exhibit?: QuestionExhibit;
  prompt: string;
  options: QuestionOption[];
  correctAnswer: 'A' | 'B' | 'C';
  explanation: string;
  losCode?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
}

export type ExamStatus = 'not-started' | 'in-progress' | 'completed';

export interface MockExam {
  id: string;
  title: string;
  subtitle: string;
  scope: string;
  level: 'Level I' | 'Level II' | 'Level III';
  formatYear: string;
  status: ExamStatus;
  difficulty: 'Foundational' | 'Standard CFA' | 'Advanced' | 'Challenging';
  totalQuestions: number;
  durationMinutes: number;
  sessionsCount: number;
  sessionNumber?: number;
  passingScoreMps: number;
  isRecommended?: boolean;
  priorityLabel?: string;
  scheduledDate?: string;
  isNationwide?: boolean;
  registeredCount?: number;
  completedDate?: string;
  userScorePercentage?: number;
  correctCount?: number;
  timeSpentSeconds?: number;
  topicsDistribution?: { topic: string; percentage: number }[];
  questions: Question[];
}

export interface ActiveExamSession {
  examId: string;
  examTitle: string;
  totalQuestions: number;
  currentQuestionIndex: number; // 0-based
  answers: Record<number, 'A' | 'B' | 'C'>; // questionId -> option
  flaggedQuestionIds: number[];
  remainingSeconds: number;
  totalDurationSeconds: number;
  isPaused: boolean;
  fontSizeLevel: 'normal' | 'large' | 'extra-large';
}

export interface TopicResult {
  topic: CfaTopic;
  subtopics: string;
  weight: string;
  total: number;
  correct: number;
  percentage: number;
  targetMps: number;
  status: 'Vượt trội' | 'Tốt' | 'Đạt' | 'Cần cải thiện' | 'Vùng nguy hiểm';
  statusBadge: string;
  actionRecommendation: string;
}

export interface ExamResultData {
  examId: string;
  examTitle: string;
  completedAt: string;
  timeSpentFormatted: string;
  timeSpentSeconds: number;
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  scorePercentage: number;
  passedMps: boolean;
  mpsPercentage: number;
  confidenceBand: { min: number; max: number };
  percentileRank: number;
  avgSecondsPerQuestion: number;
  topicBreakdown: TopicResult[];
  answers: Record<number, 'A' | 'B' | 'C'>;
  flaggedIds: number[];
}

export interface StudentProfile {
  name: string;
  targetExamDate: string;
  daysRemaining: number;
  level: string;
  title: string;
  streakDays: number;
  targetMps: number;
  forecastScore: number;
  overallProgressPercentage: number;
  readingsCompleted: number;
  totalReadings: number;
  questionsCompleted: number;
  totalTargetQuestions: number;
  todayQuestions: number;
  completedMocksCount: number;
  averageScorePercentage: number;
  readinessIndex: number;
}

export type LessonStatus = 'completed' | 'in-progress' | 'locked';

export interface LessonResource {
  id: string;
  title: string;
  type: 'PDF' | 'Formula Sheet' | 'Reference' | 'Reading';
  size: string;
  downloadUrl?: string;
}

export interface LessonNote {
  id: string;
  lessonId: string;
  timestampSeconds: number;
  timestampFormatted: string; // e.g. "24:35"
  text: string;
  createdAt: string;
}

export interface LessonPracticeQuestion {
  id: number;
  questionNumber: number;
  prompt: string;
  options: { id: 'A' | 'B' | 'C'; text: string }[];
  correctAnswer: 'A' | 'B' | 'C';
  explanation: string;
}

export interface Lesson {
  id: string;
  moduleId: string;
  courseId: string;
  title: string;
  durationMinutes: number;
  durationSeconds: number;
  order: number;
  status: LessonStatus;
  watchedPercentage: number;
  lastPlaybackSeconds: number; // e.g. 1475s (24:35)
  videoUrl?: string;
  instructor: {
    name: string;
    title: string;
    avatarUrl?: string;
  };
  description: string;
  keyTakeaways: string[];
  losCode: string;
  resources: LessonResource[];
  practiceQuestions: LessonPracticeQuestion[];
}

export interface CourseModule {
  id: string;
  courseId: string;
  order: number;
  title: string;
  description: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  cfaTopic: CfaTopic;
  level: string;
  description: string;
  instructorName: string;
  modulesCount: number;
  totalLessonsCount: number;
  completedLessonsCount: number;
  practiceQuestionsCount: number;
  completedPracticeQuestionsCount: number;
  progressPercentage: number;
  modules: CourseModule[];
  badge?: string;
  isWeakArea?: boolean;
}
