// API Client for FES Academy LMS Full-Stack Backend
import { getFirebaseIdToken } from './firebaseAuth';

/**
 * Enhanced fetch wrapper that automatically appends Firebase ID token
 * to Authorization header when an authenticated user exists.
 */
async function authFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const token = await getFirebaseIdToken();
  const headers = new Headers(init?.headers || {});
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return fetch(input, { ...init, headers });
}

export const apiClient = {
  // --- Auth & Session ---
  async getAuthMe() {
    const res = await authFetch('/api/auth/me');
    if (!res.ok) throw new Error('Failed to fetch auth');
    return res.json();
  },

  async verifyToken(idToken: string) {
    const res = await authFetch('/api/auth/verify-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });
    if (!res.ok) throw new Error('Failed to verify token');
    return res.json();
  },

  async getProviderStatus() {
    const res = await authFetch('/api/auth/provider-status');
    if (!res.ok) throw new Error('Failed to fetch provider status');
    return res.json();
  },

  async switchRole(roleIdOrUserId: string) {
    const res = await authFetch('/api/auth/switch-role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roleId: roleIdOrUserId }),
    });
    if (!res.ok) throw new Error('Failed to switch role');
    return res.json();
  },

  async getUsersList() {
    const res = await authFetch('/api/auth/users-list');
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  },

  // --- Admin Endpoints ---
  async getAdminStats() {
    const res = await authFetch('/api/admin/stats');
    if (!res.ok) throw new Error('Failed to fetch admin stats');
    return res.json();
  },

  async getAdminQuestions(params?: {
    search?: string;
    topic_id?: string;
    difficulty?: string;
    status?: string;
  }) {
    const query = new URLSearchParams(params as any).toString();
    const res = await authFetch(`/api/admin/questions?${query}`);
    if (!res.ok) throw new Error('Failed to fetch questions');
    return res.json();
  },

  async getAdminQuestionById(id: string) {
    const res = await authFetch(`/api/admin/questions/${id}`);
    if (!res.ok) throw new Error('Failed to fetch question');
    return res.json();
  },

  async createQuestion(data: any) {
    const res = await authFetch('/api/admin/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create question');
    }
    return res.json();
  },

  async createNewQuestionVersion(questionId: string, data: any) {
    const res = await authFetch(`/api/admin/questions/${questionId}/versions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create version');
    }
    return res.json();
  },

  async publishQuestionVersion(versionId: string) {
    const res = await authFetch(`/api/admin/questions/versions/${versionId}/publish`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to publish version');
    return res.json();
  },

  async archiveQuestion(questionId: string) {
    const res = await authFetch(`/api/admin/questions/${questionId}/archive`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to archive question');
    return res.json();
  },

  async validateImport(fileName: string, rows: any[]) {
    const res = await authFetch('/api/admin/questions/import/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName, rows }),
    });
    if (!res.ok) throw new Error('Failed to validate import');
    return res.json();
  },

  async commitImport(fileName: string, validRows: any[]) {
    const res = await authFetch('/api/admin/questions/import/commit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName, validRows }),
    });
    if (!res.ok) throw new Error('Failed to commit import');
    return res.json();
  },

  async getAdminMockExams() {
    const res = await authFetch('/api/admin/mock-exams');
    if (!res.ok) throw new Error('Failed to fetch mock exams');
    return res.json();
  },

  async getAdminMockExamById(id: string) {
    const res = await authFetch(`/api/admin/mock-exams/${id}`);
    if (!res.ok) throw new Error('Failed to fetch mock exam');
    return res.json();
  },

  async createMockExam(data: any) {
    const res = await authFetch('/api/admin/mock-exams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create mock exam');
    }
    return res.json();
  },

  async updateMockExamQuestions(examId: string, questionVersionIds: string[]) {
    const res = await authFetch(`/api/admin/mock-exams/${examId}/questions`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionVersionIds }),
    });
    if (!res.ok) throw new Error('Failed to update questions');
    return res.json();
  },

  async setMockExamPublishStatus(examId: string, isPublished: boolean) {
    const res = await authFetch(`/api/admin/mock-exams/${examId}/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublished }),
    });
    if (!res.ok) throw new Error('Failed to update publish status');
    return res.json();
  },

  async getAdminStudents(filters?: {
    search?: string;
    cfaLevel?: string;
    status?: string;
    targetDate?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.cfaLevel) params.append('cfaLevel', filters.cfaLevel);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.targetDate) params.append('targetDate', filters.targetDate);
    const queryString = params.toString() ? `?${params.toString()}` : '';

    const res = await authFetch(`/api/admin/students${queryString}`);
    if (!res.ok) throw new Error('Failed to fetch students');
    return res.json();
  },

  async createAdminStudent(data: {
    fullName: string;
    email: string;
    cfaLevel: string;
    targetExamDate: string;
    phoneNumber?: string;
    isActive?: boolean;
  }) {
    const res = await authFetch('/api/admin/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create student');
    }
    return res.json();
  },

  async getAdminStudentDetail(id: string) {
    const res = await authFetch(`/api/admin/students/${id}`);
    if (!res.ok) throw new Error('Failed to fetch student details');
    return res.json();
  },

  async updateAdminStudent(
    id: string,
    data: {
      fullName?: string;
      phoneNumber?: string;
      cfaLevel?: string;
      targetExamDate?: string;
      studyTitle?: string;
      isActive?: boolean;
    }
  ) {
    const res = await authFetch(`/api/admin/students/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update student profile');
    }
    return res.json();
  },

  async setAdminStudentStatus(id: string, isActive: boolean) {
    const res = await authFetch(`/api/admin/students/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive }),
    });
    if (!res.ok) throw new Error('Failed to update student status');
    return res.json();
  },

  async bulkSetAdminStudentStatus(studentIds: string[], isActive: boolean) {
    const res = await authFetch('/api/admin/students/bulk-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentIds, isActive }),
    });
    if (!res.ok) throw new Error('Failed to perform bulk update');
    return res.json();
  },

  async getAdminResults() {
    const res = await authFetch('/api/admin/results');
    if (!res.ok) throw new Error('Failed to fetch results');
    return res.json();
  },

  async getAdminAuditLogs() {
    const res = await authFetch('/api/admin/audit-logs');
    if (!res.ok) throw new Error('Failed to fetch audit logs');
    return res.json();
  },

  async getAdminTopics() {
    const res = await authFetch('/api/admin/topics');
    if (!res.ok) throw new Error('Failed to fetch topics');
    return res.json();
  },

  // --- Student Endpoints ---
  async getStudentExams() {
    const res = await authFetch('/api/student/exams');
    if (!res.ok) throw new Error('Failed to fetch exams');
    return res.json();
  },

  async startStudentExam(examId: string) {
    const res = await authFetch(`/api/student/exams/${examId}/start`, {
      method: 'POST',
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to start exam');
    }
    return res.json();
  },

  async syncStudentAttempt(attemptId: string, payload: any) {
    const res = await authFetch(`/api/student/attempts/${attemptId}/sync`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to sync attempt');
    return res.json();
  },

  async submitStudentExam(attemptId: string) {
    const res = await authFetch(`/api/student/attempts/${attemptId}/submit`, {
      method: 'POST',
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to submit exam');
    }
    return res.json();
  },

  async getStudentExamResult(attemptId: string) {
    const res = await authFetch(`/api/student/attempts/${attemptId}/result`);
    if (!res.ok) throw new Error('Failed to fetch result');
    return res.json();
  },

  async getStudentCourses() {
    const res = await authFetch('/api/student/courses');
    if (!res.ok) throw new Error('Failed to fetch courses');
    return res.json();
  },

  async sendVideoHeartbeat(lessonId: string, playbackSeconds: number) {
    const res = await authFetch('/api/student/video/heartbeat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lessonId, playbackSeconds }),
    });
    if (!res.ok) throw new Error('Failed to record heartbeat');
    return res.json();
  },

  async getStudentAnalytics() {
    const res = await authFetch('/api/student/analytics');
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return res.json();
  },

  // --- Automated Test Suite ---
  async runAllTests() {
    const res = await authFetch('/api/test/run-all', {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to run test suite');
    return res.json();
  },
};
