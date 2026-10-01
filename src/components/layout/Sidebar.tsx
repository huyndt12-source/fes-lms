import React from 'react';
import { useLms } from '../../context/LmsContext';
import { NavigationTab } from '../../types';
import { FesLogo } from '../common/FesLogo';

export const Sidebar: React.FC = () => {
  const {
    currentTab,
    navigateToTab,
    navigateToView,
    studentProfile,
    isSidebarOpenMobile,
    toggleMobileSidebar,
    currentUserRole,
  } = useLms();

  const navItems: { id: NavigationTab; label: string; icon: string; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'space_dashboard' },
    { id: 'my-courses', label: 'My Courses', icon: 'menu_book' },
    { id: 'mock-exams', label: 'Mock Exams', icon: 'quiz', badge: 'Level I Active' },
    { id: 'practice-questions', label: 'Practice Questions', icon: 'psychology' },
    { id: 'analytics', label: 'Progress & Analytics', icon: 'monitoring' },
    { id: 'exam-history', label: 'Exam History', icon: 'history_edu' },
    { id: 'bookmarks-notes', label: 'Bookmarks & Notes', icon: 'bookmark_added' },
    { id: 'study-resources', label: 'Study Resources', icon: 'folder_special' },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between bg-surface-container-lowest">
      <div className="flex flex-col flex-1 overflow-y-auto">
        {/* Header / Logo */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-surface-container/50">
          <div className="flex items-center cursor-pointer py-1" onClick={() => navigateToTab('dashboard')}>
            <FesLogo size="md" showSubtitle subtitleText="CFA Prep Portal" />
          </div>
          {/* Mobile close button */}
          <button
            onClick={toggleMobileSidebar}
            className="lg:hidden p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Navigation Items */}
        <div className="px-4 py-4">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => navigateToTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-primary-container text-on-primary shadow-sm font-bold'
                      : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-[20px] ${
                      isActive ? 'text-secondary-fixed' : 'text-secondary'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] font-semibold bg-tertiary-fixed text-on-tertiary-fixed px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                  {isActive && !item.badge && (
                    <span className="w-1.5 h-1.5 rounded-full bg-tertiary-fixed-dim"></span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer / Student Exam Countdown Card */}
      <div className="p-4 flex flex-col gap-3 bg-surface-container-lowest border-t border-surface-container/60">
        <div className="p-3.5 bg-primary rounded-xl text-on-primary shadow-sm">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary-fixed">
              CFA Candidate
            </span>
            <span className="text-[10px] font-bold bg-tertiary-fixed text-on-tertiary-fixed px-1.5 py-0.5 rounded">
              Level I
            </span>
          </div>
          <div className="text-xs font-semibold text-surface-container-lowest">
            Target: {studentProfile.targetExamDate}
          </div>
          <div className="flex items-center justify-between mt-2.5 text-[11px] text-on-primary-container font-medium">
            <span>Exam Countdown</span>
            <span className="font-bold text-tertiary-fixed-dim">
              {studentProfile.daysRemaining} days
            </span>
          </div>
          <div className="w-full bg-primary-container h-1.5 rounded-full overflow-hidden mt-1.5">
            <div
              className="bg-secondary-fixed h-full rounded-full transition-all duration-500"
              style={{ width: `${studentProfile.overallProgressPercentage}%` }}
            ></div>
          </div>
        </div>

        {currentUserRole !== 'STUDENT' && (
          <button
            onClick={() => navigateToView('admin')}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs font-bold transition"
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
              <span>Cổng Admin CMS</span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20">
              CMS
            </span>
          </button>
        )}

        <div className="flex items-center justify-between px-2 pt-1 text-xs">
          <button
            onClick={() => navigateToTab('settings')}
            className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">settings</span>
            Settings
          </button>
          <button
            onClick={() => navigateToTab('dashboard')}
            className="flex items-center gap-2 text-on-surface-variant hover:text-error transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            Log Out
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-72 bg-surface-container-lowest z-40 flex-col justify-between shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-r border-surface-container/60">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isSidebarOpenMobile && (
        <div
          onClick={toggleMobileSidebar}
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-xs z-50 transition-opacity"
        />
      )}

      {/* Mobile Sidebar Off-canvas */}
      <div
        className={`lg:hidden fixed top-0 left-0 bottom-0 w-72 bg-surface-container-lowest z-50 shadow-2xl transition-transform duration-300 ease-in-out ${
          isSidebarOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
};
