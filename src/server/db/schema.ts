export interface Role {
  id: 'ADMIN' | 'CONTENT_MANAGER' | 'INSTRUCTOR' | 'STUDENT';
  name: string;
  description?: string;
  created_at: string;
}

export interface Permission {
  id: string;
  category: 'QBANK' | 'EXAMS' | 'COURSES' | 'STUDENTS' | 'SYSTEM';
  description: string;
  created_at: string;
}

export interface RolePermission {
  role_id: Role['id'];
  permission_id: string;
  granted_at: string;
}

export interface User {
  id: string;
  role_id: Role['id'];
  email: string;
  password_hash: string;
  is_active: boolean;
  is_email_verified: boolean;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  user_id: string;
  full_name: string;
  phone_number?: string;
  avatar_url?: string;
  target_exam_date?: string;
  cfa_level: string;
  study_title: string;
  target_mps: number;
  forecast_score: number;
  readiness_index: number;
  streak_days: number;
  last_active_date?: string;
  updated_at: string;
}

export interface Topic {
  id: string;
  cfa_level: string;
  name: string;
  code: string;
  weight_min: number;
  weight_max: number;
  display_order: number;
  created_at: string;
}

export interface Subtopic {
  id: string;
  topic_id: string;
  reading_number: number;
  name: string;
  los_code?: string;
  display_order: number;
  created_at: string;
}

export interface Course {
  id: string;
  topic_id: string;
  title: string;
  level: string;
  description?: string;
  instructor_name: string;
  instructor_title?: string;
  badge?: string;
  is_published: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface CourseModule {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  display_order: number;
  created_at: string;
}

export interface Lesson {
  id: string;
  module_id: string;
  course_id: string;
  subtopic_id?: string;
  title: string;
  los_code?: string;
  description?: string;
  key_takeaways: string[];
  display_order: number;
  is_free_preview: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Video {
  id: string;
  lesson_id: string;
  provider: 'hls' | 'cloudflare_stream' | 'mux' | 'vimeo';
  video_url: string;
  duration_seconds: number;
  thumbnail_url?: string;
  resolution_modes: string[];
  status: 'ready' | 'processing' | 'error';
  created_at: string;
}

export interface LessonResource {
  id: string;
  lesson_id: string;
  title: string;
  resource_type: 'PDF' | 'Formula Sheet' | 'Reference' | 'Reading';
  file_url: string;
  file_size_bytes: number;
  file_size_formatted: string;
  download_count: number;
  created_at: string;
}

export interface Question {
  id: string;
  question_code: string;
  topic_id: string;
  subtopic_id?: string;
  los_code: string;
  reading: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  current_version_id?: string;
  status: 'Active' | 'Archived' | 'Draft';
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface QuestionExhibit {
  title: string;
  subtitle?: string;
  headers: string[];
  rows: string[][];
}

export interface QuestionVersion {
  id: string;
  question_id: string;
  version_number: number;
  scenario_text?: string;
  exhibit?: QuestionExhibit;
  prompt: string;
  correct_answer: 'A' | 'B' | 'C';
  explanation: string;
  change_summary?: string;
  is_published: boolean;
  published_at?: string;
  created_by?: string;
  created_at: string;
}

export interface QuestionOption {
  id: string;
  question_version_id: string;
  option_key: 'A' | 'B' | 'C';
  option_text: string;
  subtext?: string;
}

export interface QuestionTag {
  question_id: string;
  tag: string;
  created_at: string;
}

export interface MockExam {
  id: string;
  title: string;
  subtitle?: string;
  scope: string;
  level: 'Level I' | 'Level II' | 'Level III';
  format_year: string;
  difficulty: 'Foundational' | 'Standard CFA' | 'Advanced' | 'Challenging';
  duration_minutes: number;
  total_questions: number;
  passing_score_mps: number;
  is_published: boolean;
  is_recommended: boolean;
  priority_label?: string;
  is_nationwide: boolean;
  scheduled_start?: string;
  scheduled_end?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface MockExamQuestion {
  id: string;
  mock_exam_id: string;
  question_version_id: string;
  question_order: number;
  points: number;
  created_at: string;
}

export interface ExamAttempt {
  id: string;
  user_id: string;
  mock_exam_id: string;
  status: 'in-progress' | 'completed' | 'abandoned';
  current_question_index: number;
  remaining_seconds: number;
  total_duration_seconds: number;
  time_spent_seconds: number;
  is_paused: boolean;
  font_size_preference: 'normal' | 'large' | 'extra-large';
  score_percentage?: number;
  passed_mps?: boolean;
  correct_count?: number;
  incorrect_count?: number;
  unanswered_count?: number;
  percentile_rank?: number;
  started_at: string;
  last_heartbeat_at: string;
  completed_at?: string;
}

export interface ExamAnswer {
  id: string;
  attempt_id: string;
  question_version_id: string;
  question_order: number;
  selected_option?: 'A' | 'B' | 'C';
  is_correct?: boolean;
  is_flagged: boolean;
  time_spent_seconds: number;
  answered_at?: string;
}

export interface ExamResult {
  attempt_id: string;
  total_questions: number;
  score_percentage: number;
  mps_percentage: number;
  passed_mps: boolean;
  confidence_band_min: number;
  confidence_band_max: number;
  percentile_rank: number;
  avg_seconds_per_question: number;
  mentor_note?: string;
  created_at: string;
}

export interface TopicPerformance {
  id: string;
  attempt_id: string;
  topic_id: string;
  total_questions: number;
  correct_count: number;
  percentage: number;
  target_mps: number;
  performance_status: 'Vượt trội' | 'Tốt' | 'Đạt' | 'Cần cải thiện' | 'Vùng nguy hiểm';
  status_badge: string;
  action_recommendation: string;
  created_at: string;
}

export interface VideoProgress {
  id: string;
  user_id: string;
  video_id: string;
  last_playback_seconds: number;
  max_watched_seconds: number;
  watched_percentage: number;
  is_completed: boolean;
  completed_at?: string;
  last_heartbeat_at: string;
}

export interface LessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  course_id: string;
  status: 'not-started' | 'in-progress' | 'completed';
  practice_questions_answered: number;
  practice_questions_correct: number;
  completed_at?: string;
  updated_at: string;
}

export interface CourseProgress {
  id: string;
  user_id: string;
  course_id: string;
  total_lessons: number;
  completed_lessons: number;
  progress_percentage: number;
  last_accessed_lesson_id?: string;
  is_completed: boolean;
  completed_at?: string;
  updated_at: string;
}

export interface StudentNote {
  id: string;
  user_id: string;
  lesson_id: string;
  timestamp_seconds: number;
  timestamp_formatted: string;
  note_text: string;
  created_at: string;
  updated_at: string;
}

export interface Bookmark {
  id: string;
  user_id: string;
  item_type: 'question' | 'lesson' | 'resource';
  target_id: string;
  topic_id?: string;
  notes?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'general' | 'exam_result' | 'study_reminder' | 'course_update';
  link_url?: string;
  is_read: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor_id?: string;
  actor_name?: string;
  action: string;
  entity_type: string;
  entity_id: string;
  old_values?: any;
  new_values?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface QuestionImportJob {
  id: string;
  admin_id?: string;
  file_name: string;
  total_rows: number;
  successful_rows: number;
  failed_rows: number;
  error_log: Array<{ row: number; error: string; data?: any }>;
  status: 'VALIDATING' | 'COMPLETED' | 'FAILED';
  created_at: string;
}
