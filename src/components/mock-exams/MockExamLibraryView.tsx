import React, { useState } from 'react';
import { useLms } from '../../context/LmsContext';
import { MockExam } from '../../types';

export const MockExamLibraryView: React.FC = () => {
  const {
    mockExams,
    openExamInstructions,
    startExam,
    resumeInProgressExam,
    viewCompletedExamResult,
    startReviewAnswers,
    studentProfile,
  } = useLms();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<'Level I' | 'Level II' | 'Level III'>('Level I');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [remindRegistered, setRemindRegistered] = useState(false);

  // Filtered exams
  const filteredExams = mockExams.filter((exam) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = exam.title.toLowerCase().includes(q) || exam.scope.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (statusFilter === 'completed' && exam.status !== 'completed') return false;
    if (statusFilter === 'in-progress' && exam.status !== 'in-progress') return false;
    if (statusFilter === 'not-started' && exam.status !== 'not-started') return false;
    if (difficultyFilter !== 'all' && exam.difficulty !== difficultyFilter) return false;
    return true;
  });

  return (
    <div className="flex flex-col w-full">
      <div className="relative w-full overflow-hidden px-4 sm:px-8 py-8 max-w-[1400px] mx-auto">
        {/* Dynamic Gradient Ambient Backdrop */}
        <div className="absolute -top-24 right-1/4 w-96 h-96 bg-primary-fixed/30 rounded-full blur-3xl pointer-events-none -z-10"></div>
        <div className="absolute top-1/2 -left-20 w-80 h-80 bg-tertiary-fixed/20 rounded-full blur-3xl pointer-events-none -z-10"></div>

        {/* Editorial Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-surface-container-high/60">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-2.5">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-primary-container text-on-primary-container">
                Official Simulation Hub
              </span>
              <span className="text-xs font-semibold text-secondary flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                Curriculum 2026 Aligned
              </span>
            </div>
            <h1 className="font-headline text-3xl sm:text-4xl font-black text-primary tracking-tight leading-tight">
              Thư Viện Đề Thi Mock Exam CFA®
            </h1>
            <p className="mt-2 text-sm sm:text-base text-on-surface-variant font-light leading-relaxed max-w-2xl">
              Bộ đề thi thử chuẩn cấu trúc và độ khó CFA Institute 2026, tích hợp giải pháp đồng hồ bấm giờ áp lực thật, phân tích ma trận điểm mạnh/yếu theo từng Topic LOS chuyên sâu.
            </p>
          </div>

          {/* Live Exam Readiness Metric Widget */}
          <div className="flex items-center gap-4 bg-surface-container-lowest p-3.5 rounded-xl shadow-sm self-start lg:self-auto border border-surface-container/60">
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-surface-container-high"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                ></path>
                <path
                  className="text-secondary"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray="74.2, 100"
                  strokeLinecap="round"
                  strokeWidth="3"
                ></path>
              </svg>
              <span className="absolute text-[11px] font-bold text-primary">74.2%</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-outline">
                Xác suất đỗ dự phóng
              </span>
              <span className="text-xs font-bold text-secondary flex items-center gap-1">
                Trên ngưỡng MPS chuẩn (70%)
                <span className="material-symbols-outlined text-[14px]">trending_up</span>
              </span>
            </div>
          </div>
        </div>

        {/* Fast Stat Bar Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6">
          <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex items-center gap-3.5 transition-transform hover:-translate-y-0.5 duration-200">
            <div className="w-11 h-11 rounded-lg bg-primary-fixed/40 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[24px]">library_books</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-primary leading-none">12</span>
              <span className="text-xs font-medium text-on-surface-variant mt-1">Tổng số Mock Exams</span>
            </div>
          </div>
          <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex items-center gap-3.5 transition-transform hover:-translate-y-0.5 duration-200">
            <div className="w-11 h-11 rounded-lg bg-secondary-fixed/50 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[24px]">verified</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-primary leading-none">04</span>
              <span className="text-xs font-medium text-on-surface-variant mt-1">Đã hoàn thành</span>
            </div>
          </div>
          <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex items-center gap-3.5 transition-transform hover:-translate-y-0.5 duration-200">
            <div className="w-11 h-11 rounded-lg bg-tertiary-fixed/60 flex items-center justify-center text-tertiary-container">
              <span className="material-symbols-outlined text-[24px]">timelapse</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-tertiary-container leading-none">01</span>
              <span className="text-xs font-medium text-on-surface-variant mt-1">Đang làm dở</span>
            </div>
          </div>
          <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex items-center gap-3.5 transition-transform hover:-translate-y-0.5 duration-200">
            <div className="w-11 h-11 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[24px]">analytics</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-primary leading-none">74.2%</span>
              <span className="text-xs font-medium text-on-surface-variant mt-1">
                Điểm trung bình (MPS: 70%)
              </span>
            </div>
          </div>
        </div>

        {/* Filter & Control Deck */}
        <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm space-y-4 mb-8 border border-surface-container/50">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[20px]">
                search
              </span>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 text-xs bg-surface-container-low rounded-xl text-on-surface placeholder:text-outline outline-none focus:bg-surface-container transition-all"
                placeholder="Tìm kiếm tên đề thi, mã đề (ví dụ: Mock 02, Ethics Focus)..."
                type="text"
              />
            </div>
            {/* Segment Switcher */}
            <div className="inline-flex p-1 bg-surface-container-low rounded-xl self-start md:self-auto">
              {(['Level I', 'Level II', 'Level III'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setSelectedLevel(lvl)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedLevel === lvl
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {lvl} {lvl === 'Level I' && '(Nov 26)'}
                </button>
              ))}
            </div>
          </div>

          {/* Advanced Filter Selectors Row */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-surface-container">
            {/* Filter 1: Type */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-bold text-outline tracking-wider">
                Loại bài thi
              </label>
              <div className="relative">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full appearance-none bg-surface-container-low text-xs font-medium text-on-surface px-3 py-2 pr-8 rounded-lg outline-none cursor-pointer focus:bg-surface-container"
                >
                  <option value="all">Tất cả cấu trúc</option>
                  <option value="full">Full Mock (2 Sessions - 180 Qs)</option>
                  <option value="half">Half Mock (Session 1 hoặc 2)</option>
                  <option value="topic">Topic-Specific Mock</option>
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[18px]">
                  expand_more
                </span>
              </div>
            </div>

            {/* Filter 2: Status */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-bold text-outline tracking-wider">
                Trạng thái
              </label>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full appearance-none bg-surface-container-low text-xs font-medium text-on-surface px-3 py-2 pr-8 rounded-lg outline-none cursor-pointer focus:bg-surface-container"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="not-started">Chưa làm (Not Started)</option>
                  <option value="in-progress">Đang làm dở (In Progress)</option>
                  <option value="completed">Đã hoàn thành (Completed)</option>
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[18px]">
                  expand_more
                </span>
              </div>
            </div>

            {/* Filter 3: Difficulty */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-bold text-outline tracking-wider">
                Độ khó đề thi
              </label>
              <div className="relative">
                <select
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                  className="w-full appearance-none bg-surface-container-low text-xs font-medium text-on-surface px-3 py-2 pr-8 rounded-lg outline-none cursor-pointer focus:bg-surface-container"
                >
                  <option value="all">Mọi cấp độ khó</option>
                  <option value="Foundational">Căn bản (Foundational)</option>
                  <option value="Standard CFA">Chuẩn kỳ thi (Standard CFA)</option>
                  <option value="Challenging">Nâng cao (Challenging 80+)</option>
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[18px]">
                  expand_more
                </span>
              </div>
            </div>

            {/* Filter 4: Sort */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-bold text-outline tracking-wider">
                Sắp xếp theo
              </label>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full appearance-none bg-surface-container-low text-xs font-medium text-on-surface px-3 py-2 pr-8 rounded-lg outline-none cursor-pointer focus:bg-surface-container"
                >
                  <option value="recent">Đề làm gần đây nhất</option>
                  <option value="updated">Mới cập nhật (2026)</option>
                  <option value="score">Điểm cao xuống thấp</option>
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[18px]">
                  swap_vert
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Active Filter Chips Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-outline">Đang hiển thị:</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-surface-container-lowest rounded-full text-xs font-medium text-primary shadow-xs border border-surface-container">
              CFA Level I
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-surface-container-lowest rounded-full text-xs font-medium text-primary shadow-xs border border-surface-container">
              Chuẩn đề thi 2026
            </span>
            {(searchQuery || statusFilter !== 'all' || difficultyFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setDifficultyFilter('all');
                }}
                className="text-xs text-secondary hover:underline font-semibold ml-2 cursor-pointer"
              >
                Xoá tất cả bộ lọc
              </button>
            )}
          </div>
          <span className="text-xs text-on-surface-variant font-medium">
            Tìm thấy <strong>{filteredExams.length} bài thi</strong> phù hợp
          </span>
        </div>

        {/* Mock Exams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExams.map((exam) => {
            // CARD 1: IN PROGRESS
            if (exam.status === 'in-progress') {
              return (
                <div
                  key={exam.id}
                  className="bg-surface-container-lowest rounded-2xl p-6 shadow-md flex flex-col justify-between relative overflow-hidden group hover:shadow-lg transition-all duration-300 border border-surface-container/60"
                >
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-tertiary-fixed-dim"></div>
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-tertiary-fixed/60 text-on-tertiary-fixed">
                        <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
                        ĐANG LÀM DỞ
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-surface-container-low text-primary">
                          {exam.level}
                        </span>
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary text-primary-fixed">
                          {exam.formatYear}
                        </span>
                      </div>
                    </div>
                    <h3 className="font-headline font-bold text-base text-primary group-hover:text-secondary transition-colors leading-snug">
                      {exam.title}
                    </h3>
                    <p className="text-xs text-on-surface-variant font-light mt-1.5 line-clamp-1">
                      <strong className="font-medium text-on-surface">Phạm vi:</strong> {exam.scope}
                    </p>
                    <div className="flex items-center gap-4 mt-3 py-2 px-3 rounded-lg bg-surface-container-low text-xs text-on-surface-variant">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px] text-secondary">assignment</span>
                        <span className="font-medium text-primary">{exam.totalQuestions} Câu hỏi</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px] text-secondary">schedule</span>
                        <span>{exam.durationMinutes} Phút</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px] text-tertiary">speed</span>
                        <span>{exam.difficulty}</span>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="mt-4 p-3 rounded-xl bg-surface-container">
                      <div className="flex items-center justify-between text-[11px] mb-1.5">
                        <span className="font-bold text-primary">Đã làm 43 / 90 câu (48%)</span>
                        <span className="font-bold text-error flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">timer</span>
                          Còn 68:15
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
                        <div className="h-full rounded-full bg-secondary transition-all" style={{ width: '48%' }}></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-6 pt-4 border-t border-surface-container-low">
                    <button
                      onClick={resumeInProgressExam}
                      className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-tertiary-fixed-dim hover:bg-tertiary-fixed text-on-tertiary-fixed font-bold text-xs shadow-sm hover:shadow transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                      Tiếp tục làm bài
                    </button>
                    <button
                      onClick={() => openExamInstructions(exam)}
                      className="p-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface-variant transition-colors cursor-pointer"
                      title="Làm lại từ đầu"
                    >
                      <span className="material-symbols-outlined text-[18px]">restart_alt</span>
                    </button>
                  </div>
                </div>
              );
            }

            // CARD 2: COMPLETED EXAMS
            if (exam.status === 'completed') {
              return (
                <div
                  key={exam.id}
                  className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all duration-300 border border-surface-container/60"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-secondary-container text-on-secondary-container">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                        ĐÃ HOÀN THÀNH
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-surface-container-low text-primary">
                        {exam.level}
                      </span>
                    </div>
                    <h3 className="font-headline font-bold text-base text-primary group-hover:text-secondary transition-colors leading-snug">
                      {exam.title}
                    </h3>
                    <span className="text-[11px] text-outline font-medium block mt-1">
                      Hoàn thành ngày: {exam.completedDate || '20/09/2026'}
                    </span>

                    {/* Result metrics box */}
                    <div className="mt-4 p-3.5 rounded-xl bg-surface-container-low flex flex-col gap-2">
                      <div className="flex items-end justify-between">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-outline">
                            Điểm số đạt được
                          </span>
                          <div className="text-xl font-black text-secondary leading-tight">
                            {exam.userScorePercentage}%{' '}
                            <span className="text-xs font-semibold text-on-surface-variant">
                              ({exam.correctCount || 140}/{exam.totalQuestions})
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold bg-secondary text-on-secondary">
                            PASSED (MPS: 70%)
                          </span>
                          <span className="text-[11px] text-outline block mt-0.5">
                            Thời gian: {Math.round((exam.timeSpentSeconds || 254 * 60) / 60)} / {exam.durationMinutes} phút
                          </span>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-surface-container-high/70 flex items-center justify-between text-[11px] text-on-surface-variant font-medium">
                        <span>Ethics: <strong>82%</strong></span>
                        <span>•</span>
                        <span>FRA: <strong>74%</strong></span>
                        <span>•</span>
                        <span>Equity: <strong>80%</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 mt-6 pt-4 border-t border-surface-container-low">
                    <button
                      onClick={() => viewCompletedExamResult(exam.id)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-bold text-xs transition-colors shadow-sm cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">bar_chart</span>
                      Xem phân tích kết quả
                    </button>
                    <button
                      onClick={() => startReviewAnswers(exam.id, 'all')}
                      className="text-xs font-bold text-secondary hover:text-primary transition-colors whitespace-nowrap px-1 cursor-pointer"
                    >
                      Review đáp án
                    </button>
                  </div>
                </div>
              );
            }

            // CARD 3: SCHEDULED / NATIONAL EVENT
            if (exam.isNationwide) {
              return (
                <div
                  key={exam.id}
                  className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all duration-300 border border-surface-container/60"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-primary text-on-primary">
                        <span className="material-symbols-outlined text-[14px]">lock_clock</span>
                        SẮP MỞ (05/10/2026)
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed">
                        Toàn quốc
                      </span>
                    </div>
                    <h3 className="font-headline font-bold text-base text-primary group-hover:text-secondary transition-colors leading-snug">
                      {exam.title}
                    </h3>
                    <p className="text-xs text-on-surface-variant font-light mt-1.5">
                      {exam.subtitle}
                    </p>
                    <div className="mt-4 p-3.5 rounded-xl bg-surface-container-low flex flex-col gap-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-on-surface-variant">Cấu trúc:</span>
                        <strong className="text-primary font-bold">180 câu • 2 ca thi chuẩn CFAI</strong>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-on-surface-variant">Thời gian mở cổng:</span>
                        <strong className="text-secondary font-bold">{exam.scheduledDate}</strong>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-on-surface-variant">Đã đăng ký:</span>
                        <strong className="text-primary font-bold">
                          {remindRegistered ? (exam.registeredCount || 482) + 1 : exam.registeredCount || 482} Học viên
                        </strong>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-6 pt-4 border-t border-surface-container-low">
                    <button
                      onClick={() => setRemindRegistered(!remindRegistered)}
                      className={`w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                        remindRegistered
                          ? 'bg-secondary text-on-secondary shadow-sm'
                          : 'bg-surface-container-high hover:bg-primary hover:text-on-primary text-primary'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {remindRegistered ? 'check' : 'notification_add'}
                      </span>
                      {remindRegistered ? 'Đã kích hoạt nhắc lịch thi' : 'Đăng ký nhắc lịch thi'}
                    </button>
                  </div>
                </div>
              );
            }

            // CARD 4 & 5: NOT STARTED / RECOMMENDED CHALLENGE
            return (
              <div
                key={exam.id}
                className="bg-surface-container-lowest rounded-2xl p-6 shadow-md flex flex-col justify-between relative overflow-hidden group hover:shadow-xl transition-all duration-300 border border-surface-container/60"
              >
                {exam.isRecommended && (
                  <div className="absolute -right-8 -top-8 w-24 h-24 bg-tertiary-fixed/30 rounded-full blur-xl pointer-events-none"></div>
                )}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    {exam.isRecommended ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-tertiary-fixed text-on-tertiary-fixed">
                        <span className="material-symbols-outlined text-[14px]">star</span>
                        ĐỀ XUẤT HỌC TẬP
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-surface-container-high text-on-surface-variant">
                        CHƯA LÀM
                      </span>
                    )}
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-surface-container-low text-primary">
                        {exam.level}
                      </span>
                      {exam.difficulty === 'Challenging' && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-error-container text-on-error-container">
                          Challenging
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="font-headline font-bold text-base text-primary group-hover:text-secondary transition-colors leading-snug">
                    {exam.title}
                  </h3>
                  <p className="text-xs text-on-surface-variant font-light mt-1.5">
                    {exam.subtitle}
                  </p>

                  <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                    <div className="p-2 rounded-lg bg-surface-container-low flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-secondary">timer</span>
                      <div>
                        <span className="block text-[10px] text-outline uppercase font-semibold">Thời lượng</span>
                        <span className="font-bold text-primary">
                          {exam.totalQuestions} Qs ({exam.durationMinutes}p)
                        </span>
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-surface-container-low flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-tertiary-container">group</span>
                      <div>
                        <span className="block text-[10px] text-outline uppercase font-semibold">Điểm TB học viên</span>
                        <span className="font-bold text-primary">68.4% (Hard)</span>
                      </div>
                    </div>
                  </div>

                  {exam.isRecommended && (
                    <div className="mt-3 py-1.5 px-2.5 rounded-lg bg-tertiary-fixed/30 text-[11px] text-on-tertiary-fixed font-semibold flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[14px]">military_tech</span>
                      Thích hợp đánh giá giai đoạn chốt điểm trước 30 ngày thi.
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-6 pt-4 border-t border-surface-container-low">
                  <button
                    onClick={() => openExamInstructions(exam)}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-bold text-xs shadow-sm transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">play_circle</span>
                    Xem hướng dẫn &amp; Bắt đầu
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Exam Strategy & Knowledge Base Quick Anchor */}
        <div className="mt-12 bg-primary rounded-2xl p-6 sm:p-8 text-on-primary relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-secondary/30 rounded-full blur-2xl pointer-events-none"></div>
          <div className="max-w-xl z-10">
            <div className="flex items-center gap-2 mb-2 text-tertiary-fixed text-xs font-bold uppercase tracking-wider">
              <span className="material-symbols-outlined text-[18px]">lightbulb</span>
              CFA Exam Day Best Practices
            </div>
            <h2 className="font-headline text-xl sm:text-2xl font-black leading-tight text-surface-container-lowest">
              Chiến thuật tối ưu 135 phút cho mỗi Session thi
            </h2>
            <p className="text-on-primary-container text-xs sm:text-sm font-light mt-2 leading-relaxed">
              Đừng dừng lại quá 90 giây ở một câu hỏi tính toán phức tạp. Xem sổ tay phân bổ thời gian và mẹo sử dụng máy tính tài chính BA II Plus do các giảng viên CFA Charterholder tại FES biên soạn.
            </p>
          </div>
          <div className="z-10 flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button
              onClick={() => alert('Đang tải tài liệu: Guideline phân bổ thời gian CFA 2026 (PDF)...')}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-tertiary-fixed-dim hover:bg-tertiary-fixed text-on-tertiary-fixed font-bold text-xs shadow-md transition-all whitespace-nowrap cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              Tải Guideline phân bổ thời gian
            </button>
            <button
              onClick={() => alert('Đã gửi yêu cầu đăng ký hỗ trợ 1-on-1 với Giảng viên CFA Charterholder.')}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-primary-container text-on-primary hover:bg-secondary transition-colors text-xs font-bold whitespace-nowrap cursor-pointer"
            >
              Đăng ký hỗ trợ 1-on-1
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
