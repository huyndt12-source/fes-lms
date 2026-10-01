import React from 'react';
import {
  LayoutDashboard,
  HelpCircle,
  FileSpreadsheet,
  FileCheck,
  BookOpen,
  Users,
  Award,
  History,
  CheckCircle2,
  ArrowLeft,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { FesLogo } from '../common/FesLogo';

export type AdminTab =
  | 'dashboard'
  | 'question-bank'
  | 'question-import'
  | 'mock-exams'
  | 'students'
  | 'results'
  | 'audit-logs'
  | 'test-suite';

interface AdminLayoutProps {
  currentTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  onExitAdmin: () => void;
  currentRole: string;
  onSwitchRole: (role: string) => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  onTabChange,
  onExitAdmin,
  currentRole,
  onSwitchRole,
  children,
}) => {
  const navItems: { id: AdminTab; label: string; icon: any; badge?: string }[] = [
    { id: 'dashboard', label: 'Bảng điều khiển', icon: LayoutDashboard },
    { id: 'question-bank', label: 'Ngân hàng câu hỏi', icon: HelpCircle },
    { id: 'question-import', label: 'Import Excel / CSV', icon: FileSpreadsheet },
    { id: 'mock-exams', label: 'Quản lý Mock Exam', icon: FileCheck },
    { id: 'students', label: 'Học viên CFA', icon: Users },
    { id: 'results', label: 'Kết quả & Phổ điểm', icon: Award },
    { id: 'audit-logs', label: 'Nhật ký Audit Log', icon: History },
    { id: 'test-suite', label: 'Kiểm thử 10 kịch bản', icon: CheckCircle2, badge: 'Auto' },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Top Bar */}
      <header className="h-16 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <FesLogo size="sm" textColor="#ffffff" />
            <span className="text-xs uppercase tracking-wider font-extrabold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Admin CMS
            </span>
          </div>

          <div className="h-5 w-px bg-slate-700 hidden sm:block" />

          <button
            onClick={onExitAdmin}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Về Student LMS
          </button>
        </div>

        {/* Role Switcher & User Profile */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1 rounded-lg border border-slate-700 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-400 hidden sm:inline">Quyền:</span>
            <select
              value={currentRole}
              onChange={(e) => onSwitchRole(e.target.value)}
              className="bg-transparent text-emerald-400 font-bold focus:outline-none cursor-pointer"
            >
              <option value="ADMIN" className="bg-slate-900 text-white">Super Admin</option>
              <option value="CONTENT_MANAGER" className="bg-slate-900 text-white">Content Manager</option>
              <option value="INSTRUCTOR" className="bg-slate-900 text-white">Instructor</option>
              <option value="STUDENT" className="bg-slate-900 text-white">Student (Test 403)</option>
            </select>
          </div>

          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center font-bold text-white text-xs border border-white/20">
            AD
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row">
        {/* Admin Navigation Sidebar */}
        <aside className="w-full md:w-64 bg-slate-950/60 border-r border-slate-800/80 p-4 shrink-0">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
            Hệ thống Quản trị
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="mt-8 p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-300">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Chính sách Bất biến</span>
            </div>
            <p className="leading-relaxed">
              Câu hỏi đã xuất bản được lưu trữ bất biến (Immutable). Chỉnh sửa câu hỏi sẽ tự động tạo Version mới mà không làm thay đổi bài thi lịch sử.
            </p>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};
