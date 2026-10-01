import React, { useState } from 'react';
import { useLms } from '../../context/LmsContext';
import { FesLogo } from '../common/FesLogo';

export const Header: React.FC = () => {
  const {
    studentProfile,
    navigateToView,
    toggleMobileSidebar,
    currentUserRole,
    switchUserRole,
    firebaseUser,
    loginWithEmail,
    logout,
  } = useLms();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [emailInput, setEmailInput] = useState('admin@fes.edu.vn');
  const [passInput, setPassInput] = useState('admin123');
  const [authMsg, setAuthMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthMsg(null);
    setIsSubmitting(true);
    try {
      await loginWithEmail(emailInput, passInput);
      setAuthMsg({ type: 'success', text: 'Đăng nhập Firebase thành công!' });
      setTimeout(() => setShowAuthModal(false), 800);
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.includes('operation-not-allowed') || msg.includes('PASSWORD_LOGIN_DISABLED')) {
        setAuthMsg({
          type: 'error',
          text: 'Email/Password sign-in method is currently disabled in Firebase Console. Please enable it under Firebase Console > Authentication > Sign-in method > Email/Password.',
        });
      } else {
        setAuthMsg({ type: 'error', text: msg || 'Đăng nhập không thành công.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    setIsSubmitting(true);
    try {
      await logout();
      setAuthMsg({ type: 'success', text: 'Đã đăng xuất Firebase.' });
    } catch (err: any) {
      setAuthMsg({ type: 'error', text: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const notifications = [
    {
      id: 1,
      title: 'Đã hoàn thành phân tích Mock 01',
      desc: 'Báo cáo ma trận 10 chủ đề đã sẵn sàng. Điểm số: 78% (Đạt chuẩn).',
      time: '10 phút trước',
      unread: true,
    },
    {
      id: 2,
      title: 'Nhắc nhở ca thi dở dang',
      desc: 'Mock Exam 02 (Session 1) còn 68 phút và 48 câu hỏi chưa làm.',
      time: '2 giờ trước',
      unread: true,
    },
    {
      id: 3,
      title: 'Lịch thi toàn quốc 05/10/2026',
      desc: 'Đã có 482 học viên đăng ký kỳ thi Final Nationwide Mock Exam.',
      time: 'Hôm qua',
      unread: false,
    },
  ];

  return (
    <header className="fixed top-0 left-0 lg:left-72 right-0 h-16 bg-surface/85 backdrop-blur-xl z-30 shadow-[0_1px_8px_rgba(0,0,0,0.04)] px-4 sm:px-8 flex items-center justify-between gap-4 border-b border-surface-container/40">
      {/* Left: Mobile hamburger & Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={toggleMobileSidebar}
            className="p-2 rounded-lg bg-surface-container-lowest text-on-surface-variant hover:text-on-surface shadow-xs"
            title="Mở menu điều hướng"
          >
            <span className="material-symbols-outlined text-[20px]">menu</span>
          </button>
          <div onClick={() => navigateToView('dashboard')} className="cursor-pointer flex items-center">
            <FesLogo variant="mark" size="xs" />
          </div>
        </div>

        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[20px]">
            search
          </span>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-lg bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant/60 outline-none shadow-[0_1px_4px_rgba(0,0,0,0.03)] border border-surface-container/60 focus:border-secondary focus:bg-surface-container-lowest transition-all"
            placeholder="Tìm kiếm mock exam, công thức, reading..."
            type="text"
          />
        </div>
      </div>

      {/* Right: Tools & Profile */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Admin CMS Access Button */}
        {currentUserRole !== 'STUDENT' ? (
          <button
            onClick={() => navigateToView('admin')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-sm transition"
            title="Mở cổng quản trị FES Admin CMS"
          >
            <span className="material-symbols-outlined text-[16px]">shield_person</span>
            <span className="hidden sm:inline">Admin CMS</span>
          </button>
        ) : (
          <button
            onClick={() => switchUserRole('ADMIN')}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-surface-container-lowest hover:bg-surface-container border border-surface-container rounded-lg text-[11px] font-semibold text-secondary transition"
            title="Chuyển sang quyền Admin để vào CMS"
          >
            <span className="material-symbols-outlined text-[16px]">manage_accounts</span>
            <span className="hidden md:inline">Đổi sang Admin</span>
          </button>
        )}

        {/* CFA Cohort Selector */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-surface-container-lowest rounded-lg shadow-[0_1px_4px_rgba(0,0,0,0.03)] cursor-pointer border border-surface-container/50 hover:bg-surface-container-low transition-colors">
          <span className="material-symbols-outlined text-[18px] text-primary">school</span>
          <span className="text-xs font-bold text-primary">CFA Level I (Nov 2026)</span>
          <span className="material-symbols-outlined text-[16px] text-on-surface-variant">arrow_drop_down</span>
        </div>

        {/* Streak Pill */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-tertiary-fixed/30 rounded-lg text-xs font-bold text-tertiary-container shadow-xs">
          <span className="text-sm">🔥</span>
          <span className="hidden sm:inline">{studentProfile.streakDays} ngày liên tục</span>
          <span className="sm:hidden">{studentProfile.streakDays}d</span>
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg bg-surface-container-lowest text-on-surface-variant hover:text-on-surface shadow-[0_1px_4px_rgba(0,0,0,0.03)] border border-surface-container/50 transition-colors"
            title="Thông báo"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error animate-pulse"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-surface-container-lowest rounded-xl shadow-xl border border-surface-container p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-3 border-b border-surface-container">
                <span className="text-xs font-bold text-primary uppercase tracking-wider">Thông Báo Học Tập</span>
                <span className="text-[10px] text-secondary font-semibold cursor-pointer hover:underline">
                  Đánh dấu đã đọc
                </span>
              </div>
              <div className="divide-y divide-surface-container/60 max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="py-2.5 px-1 hover:bg-surface-container-low transition-colors rounded-lg">
                    <div className="flex items-center justify-between text-xs font-bold text-primary">
                      <span>{n.title}</span>
                      {n.unread && <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>}
                    </div>
                    <p className="text-[11px] text-on-surface-variant mt-0.5 leading-snug">{n.desc}</p>
                    <span className="text-[10px] text-outline block mt-1">{n.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Firebase Authentication Trigger */}
        <button
          onClick={() => {
            setAuthMsg(null);
            setShowAuthModal(true);
          }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-surface-container-lowest hover:bg-surface-container border border-surface-container/80 rounded-lg text-xs font-medium text-on-surface shadow-xs transition"
          title="Xác thực Firebase Authentication"
        >
          <span className={`w-2 h-2 rounded-full ${firebaseUser ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
          <span className="material-symbols-outlined text-[16px] text-amber-600">lock</span>
          <span className="hidden xl:inline text-[11px] font-semibold">
            {firebaseUser?.email ? firebaseUser.email.split('@')[0] : 'Firebase Auth'}
          </span>
        </button>

        {/* Student Profile */}
        <div
          onClick={() => navigateToView('analytics')}
          className="flex items-center gap-2 sm:gap-3 pl-1 sm:pl-2 cursor-pointer hover:opacity-90 transition-opacity"
        >
          <img
            alt="Profile"
            className="w-8 h-8 rounded-full object-cover shadow-[0_1px_4px_rgba(0,0,0,0.08)] border border-surface-container"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuACARXirB4FhV79qjPAi6Wfq8RVIodmIPk8o6HLpPeAbZBPn58P4YjsHJ-F2TRG6vx7qI-h0nKPcbFe1cM1ezboYQMGwZJMt0DZdfNgI1uX8QCT_V9KELiU0tgNC9nnkOyEq_csBJbORXzQNJcg6TWFWQkCNj4anUK4XeizzE-HYfX00DAIrgMcQhGa4jVHgy2tyZdawvlfSbGewgPL1VX9fWzKnw2g1u_wwpedA8RZaWIf7Fn3w3Mj"
          />
          <div className="hidden sm:flex flex-col text-left leading-tight">
            <span className="text-xs font-bold text-on-surface">{studentProfile.name}, CFA L1</span>
            <span className="text-[10px] font-semibold text-secondary">{studentProfile.title}</span>
          </div>
        </div>
      </div>

      {/* Firebase Authentication Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-surface-container-lowest border border-surface-container rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-surface-container">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500 text-[24px]">verified_user</span>
                <div>
                  <h3 className="text-sm font-bold text-primary">Firebase Authentication</h3>
                  <p className="text-[11px] text-on-surface-variant">Production Architecture & Server RBAC</p>
                </div>
              </div>
              <button
                onClick={() => setShowAuthModal(false)}
                className="p-1 rounded-lg hover:bg-surface-container text-on-surface-variant"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Current Session Info */}
            <div className="mt-4 p-3 rounded-xl bg-surface-container-low border border-surface-container/60 text-xs">
              <div className="flex justify-between items-center mb-1">
                <span className="text-on-surface-variant font-medium">Trạng thái Firebase:</span>
                <span className={`font-bold ${firebaseUser ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {firebaseUser ? 'Đã đăng nhập Firebase' : 'Chưa đăng nhập'}
                </span>
              </div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-on-surface-variant font-medium">Email hiện tại:</span>
                <span className="font-semibold text-primary">{firebaseUser?.email || 'Chưa xác thực'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant font-medium">Quyền RBAC máy chủ:</span>
                <span className="px-2 py-0.5 rounded bg-surface-container-highest text-primary font-bold text-[10px]">
                  {currentUserRole}
                </span>
              </div>
            </div>

            {/* Message Banner */}
            {authMsg && (
              <div
                className={`mt-3 p-3 rounded-xl text-xs ${
                  authMsg.type === 'error'
                    ? 'bg-error/10 text-error border border-error/20'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}
              >
                {authMsg.text}
              </div>
            )}

            {/* Email / Password Sign In Form */}
            <form onSubmit={handleLoginSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-secondary mb-1">Email</label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="admin@fes.edu.vn"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-surface-container-lowest border border-surface-container focus:border-primary outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-secondary mb-1">Mật khẩu</label>
                <input
                  type="password"
                  value={passInput}
                  onChange={(e) => setPassInput(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-surface-container-lowest border border-surface-container focus:border-primary outline-none"
                  required
                />
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setEmailInput('admin@fes.edu.vn');
                    setPassInput('admin123');
                  }}
                  className="flex-1 py-1 px-2 text-[10px] font-semibold bg-surface-container-low hover:bg-surface-container rounded-md text-secondary text-center border border-surface-container/60 transition"
                >
                  Tài khoản Admin
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmailInput('student@fes.edu.vn');
                    setPassInput('student123');
                  }}
                  className="flex-1 py-1 px-2 text-[10px] font-semibold bg-surface-container-low hover:bg-surface-container rounded-md text-secondary text-center border border-surface-container/60 transition"
                >
                  Tài khoản Student
                </button>
              </div>

              <div className="flex items-center gap-2 pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2 px-4 bg-primary text-on-primary rounded-lg text-xs font-bold shadow-sm hover:opacity-95 disabled:opacity-50 transition"
                >
                  {isSubmitting ? 'Đang xác thực...' : 'Đăng nhập Firebase'}
                </button>

                {firebaseUser && (
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isSubmitting}
                    className="py-2 px-3 border border-surface-container hover:bg-surface-container text-on-surface-variant rounded-lg text-xs font-semibold transition"
                  >
                    Đăng xuất
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
