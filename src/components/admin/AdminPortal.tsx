import React, { useEffect, useState } from 'react';
import { AdminLayout, AdminTab } from './AdminLayout';
import { AdminDashboardView } from './AdminDashboardView';
import { AdminQuestionBankView } from './AdminQuestionBankView';
import { AdminQuestionImportView } from './AdminQuestionImportView';
import { AdminMockExamBuilderView } from './AdminMockExamBuilderView';
import { AdminStudentsView } from './AdminStudentsView';
import { AdminResultsView } from './AdminResultsView';
import { AdminAuditLogsView } from './AdminAuditLogsView';
import { AdminTestRunnerView } from './AdminTestRunnerView';
import { apiClient } from '../../services/apiClient';

interface AdminPortalProps {
  onExitAdmin: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ onExitAdmin }) => {
  const [currentTab, setCurrentTab] = useState<AdminTab>('dashboard');
  const [currentRole, setCurrentRole] = useState('ADMIN');
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const ctx = await apiClient.getAuthMe();
      setCurrentRole(ctx.role.id);
      if (ctx.role.id === 'STUDENT') {
        setAccessDenied(true);
      } else {
        setAccessDenied(false);
      }
    } catch (err) {
      console.error('Auth error:', err);
    }
  };

  const handleSwitchRole = async (newRole: string) => {
    try {
      const res = await apiClient.switchRole(newRole);
      setCurrentRole(res.current.role.id);
      if (res.current.role.id === 'STUDENT') {
        setAccessDenied(true);
      } else {
        setAccessDenied(false);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-slate-100">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4 shadow-xl">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-white">403 Forbidden: Quyền Truy Cập Bị Từ Chối</h1>
        <p className="text-xs text-slate-400 max-w-md mt-2">
          Tài khoản với vai trò <strong>STUDENT (Học viên)</strong> được máy chủ bảo vệ nghiêm ngặt và không có quyền truy cập vào Admin CMS hay Ngân hàng câu hỏi.
        </p>

        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={() => handleSwitchRole('ADMIN')}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
          >
            Chuyển lại quyền Admin
          </button>
          <button
            onClick={onExitAdmin}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
          >
            Về Student LMS
          </button>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout
      currentTab={currentTab}
      onTabChange={setCurrentTab}
      onExitAdmin={onExitAdmin}
      currentRole={currentRole}
      onSwitchRole={handleSwitchRole}
    >
      {currentTab === 'dashboard' && <AdminDashboardView onNavigateTab={setCurrentTab} />}
      {currentTab === 'question-bank' && <AdminQuestionBankView />}
      {currentTab === 'question-import' && <AdminQuestionImportView />}
      {currentTab === 'mock-exams' && <AdminMockExamBuilderView />}
      {currentTab === 'students' && <AdminStudentsView />}
      {currentTab === 'results' && <AdminResultsView />}
      {currentTab === 'audit-logs' && <AdminAuditLogsView />}
      {currentTab === 'test-suite' && <AdminTestRunnerView />}
    </AdminLayout>
  );
};
