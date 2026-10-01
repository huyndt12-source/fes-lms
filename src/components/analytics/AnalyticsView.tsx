import React, { useState } from 'react';
import { useLms } from '../../context/LmsContext';

export const AnalyticsView: React.FC = () => {
  const {
    studentProfile,
    resumeInProgressExam,
    navigateToTab,
    navigateToView,
    openLessonVideo,
    openCourseDetail,
  } = useLms();
  const [timeRange, setTimeRange] = useState<'all' | '30d' | '90d'>('all');
  const [topicFilter, setTopicFilter] = useState<'all' | 'needs-improvement' | 'strong'>('all');

  return (
    <div className="flex flex-col w-full">
      <div className="p-4 sm:p-8 max-w-[1400px] w-full mx-auto space-y-8">
        {/* Header Section with Title, Subtitle, and Time Filter */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-fixed/50 text-secondary text-xs font-semibold uppercase tracking-wider">
              <span className="material-symbols-outlined text-[16px]">analytics</span>
              CFA® Institute Standardized Diagnostic
            </div>
            <h1 className="text-3xl lg:text-4xl font-black text-primary font-headline tracking-tight leading-tight">
              Phân Tích Tiến Độ &amp; Hiệu Suất Học Tập CFA®
            </h1>
            <p className="text-on-surface-variant text-sm font-light leading-relaxed">
              Báo cáo năng lực chuẩn hóa theo chuẩn CFA Institute, dự báo xác suất đỗ kỳ thi {studentProfile.targetExamDate} dựa trên {studentProfile.questionsCompleted.toLocaleString()} câu hỏi luyện tập và {studentProfile.completedMocksCount} đợt thi thử.
            </p>
          </div>

          {/* Time range switcher */}
          <div className="flex items-center p-1 bg-surface-container rounded-xl shadow-inner self-start lg:self-auto border border-surface-container/60">
            {(
              [
                { id: 'all', label: 'Tất cả thời gian' },
                { id: '30d', label: '30 ngày qua' },
                { id: '90d', label: '90 ngày qua' },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => setTimeRange(t.id)}
                className={`px-4 py-2 text-xs rounded-lg transition-all duration-200 cursor-pointer ${
                  timeRange === t.id
                    ? 'bg-surface-container-lowest text-primary font-bold shadow-sm'
                    : 'text-on-surface-variant hover:text-primary font-medium'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Top KPI Cards (Bento Metric Strip) */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {/* Readiness Index */}
          <div className="relative overflow-hidden bg-primary text-on-primary rounded-2xl p-6 shadow-md flex flex-col justify-between group hover:shadow-xl transition-all duration-300">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary-fixed">
                  Readiness Index
                </span>
                <div className="text-4xl font-extrabold tracking-tight font-headline flex items-baseline gap-1">
                  {studentProfile.readinessIndex}
                  <span className="text-lg font-light text-on-primary-container">/100</span>
                </div>
              </div>
              <div className="w-11 h-11 rounded-xl bg-primary-container/80 flex items-center justify-center text-tertiary-fixed shadow-sm">
                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  verified
                </span>
              </div>
            </div>
            <div className="mt-4 pt-3 flex items-center justify-between text-xs border-t border-primary-container/50">
              <span className="font-medium inline-flex items-center gap-1.5 text-secondary-fixed">
                <span className="w-2 h-2 rounded-full bg-secondary-fixed animate-pulse"></span>
                Sẵn sàng cao
              </span>
              <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-[11px] font-bold">
                Dự báo đỗ 88%
              </span>
            </div>
          </div>

          {/* Total Study Hours */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow border border-surface-container/60">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                  Tổng thời gian ôn luyện
                </span>
                <div className="text-4xl font-extrabold text-on-surface tracking-tight font-headline">
                  142.5 <span className="text-base font-normal text-on-surface-variant">Giờ</span>
                </div>
              </div>
              <div className="w-11 h-11 rounded-xl bg-surface-container text-secondary flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">timer</span>
              </div>
            </div>
            <div className="mt-4 space-y-1.5">
              <div className="flex justify-between text-[11px] font-medium text-on-surface-variant">
                <span>Mục tiêu 300 giờ chuẩn CFA</span>
                <span className="font-bold text-primary">47.5%</span>
              </div>
              <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                <div className="bg-secondary h-full rounded-full transition-all duration-700" style={{ width: '47.5%' }}></div>
              </div>
            </div>
          </div>

          {/* Total Questions Solved */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow border border-surface-container/60">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                  Câu hỏi hoàn thành
                </span>
                <div className="text-4xl font-extrabold text-on-surface tracking-tight font-headline">
                  {studentProfile.questionsCompleted.toLocaleString()}
                </div>
              </div>
              <div className="w-11 h-11 rounded-xl bg-surface-container text-secondary flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">task_alt</span>
              </div>
            </div>
            <div className="mt-4 pt-3 flex items-center justify-between text-xs border-t border-surface-container/60">
              <span className="text-on-surface-variant font-light">Độ chính xác TB</span>
              <span className="font-bold text-secondary text-sm inline-flex items-center gap-1">
                76.4%
                <span className="material-symbols-outlined text-base">trending_up</span>
              </span>
            </div>
          </div>

          {/* Mock Exams Taken */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow border border-surface-container/60">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                  Bài Mock Exam
                </span>
                <div className="text-4xl font-extrabold text-on-surface tracking-tight font-headline">
                  {studentProfile.completedMocksCount}{' '}
                  <span className="text-base font-normal text-on-surface-variant">Đề</span>
                </div>
              </div>
              <div className="w-11 h-11 rounded-xl bg-tertiary-fixed/30 text-tertiary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  military_tech
                </span>
              </div>
            </div>
            <div className="mt-4 pt-3 flex items-center justify-between text-xs border-t border-surface-container/60">
              <span className="text-on-surface-variant font-light">
                Điểm TB: <strong className="font-semibold text-on-surface">{studentProfile.averageScorePercentage}%</strong>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-bold text-[11px]">
                Cao nhất: 78%
              </span>
            </div>
          </div>
        </div>

        {/* Smart Recommendations Strip */}
        <div className="bg-surface-container-low rounded-2xl p-6 shadow-sm space-y-4 border border-surface-container">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed">
                <span className="material-symbols-outlined text-lg">auto_awesome</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-primary font-headline uppercase tracking-wide">
                  Đề Xuất Hành Động Thông Minh (AI Recommendation Engine)
                </h3>
                <p className="text-xs text-on-surface-variant">
                  Tối ưu hóa điểm số dựa trên trọng số kỳ thi và điểm yếu hiện tại
                </p>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-secondary self-start sm:self-auto">
              Cập nhật sau mỗi bài thi
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            {/* Rec 1 */}
            <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm flex flex-col justify-between group hover:shadow-md transition-all border border-surface-container/60">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-error-container text-on-error-container">
                    Vùng Cần Cải Thiện
                  </span>
                  <span className="text-[11px] font-bold text-primary">#FixedIncome</span>
                </div>
                <p className="text-xs font-semibold text-on-surface leading-snug">
                  Luyện chuyên sâu 50 câu Fixed Income: Duration &amp; Convexity
                </p>
                <p className="text-[11px] text-on-surface-variant font-light leading-normal">
                  Độ chính xác hiện tại 59% (dưới ngưỡng 70%). Cần thêm 1.5 giờ giải bài tập tính toán.
                </p>
              </div>
              <div className="mt-4 pt-3 flex items-center justify-between border-t border-surface-container/60">
                <span className="text-[11px] font-semibold text-on-surface-variant flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-secondary">schedule</span> 45 phút
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openCourseDetail('cfa-l1-fixed-income')}
                    className="px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                    title="Xem khóa học Fixed Income"
                  >
                    <span className="material-symbols-outlined text-sm">smart_display</span>
                    <span>Video</span>
                  </button>
                  <button
                    onClick={() => navigateToTab('practice-questions')}
                    className="px-3 py-1.5 rounded-lg bg-tertiary-fixed hover:bg-tertiary-fixed-dim text-on-tertiary-fixed font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    Luyện ngay <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Rec 2 */}
            <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm flex flex-col justify-between group hover:shadow-md transition-all border border-surface-container/60">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-secondary-container text-on-secondary-container">
                    Đang Dở Dang
                  </span>
                  <span className="text-[11px] font-bold text-primary">#MockExam</span>
                </div>
                <p className="text-xs font-semibold text-on-surface leading-snug">
                  Hoàn thành Mock Exam 02 Session 1 để có điểm Full Mock hoàn chỉnh
                </p>
                <p className="text-[11px] text-on-surface-variant font-light leading-normal">
                  Bạn đã hoàn thành 43/90 câu. Tiếp tục giữ nhịp độ để hoàn tất bài thi!
                </p>
              </div>
              <div className="mt-4 pt-3 flex items-center justify-between border-t border-surface-container/60">
                <span className="text-[11px] font-semibold text-on-surface-variant flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-secondary">quiz</span> 47 câu còn lại
                </span>
                <button
                  onClick={resumeInProgressExam}
                  className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                >
                  Làm tiếp <span className="material-symbols-outlined text-[14px]">play_arrow</span>
                </button>
              </div>
            </div>

            {/* Rec 3 */}
            <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm flex flex-col justify-between group hover:shadow-md transition-all border border-surface-container/60">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-tertiary-fixed/60 text-on-tertiary-fixed">
                    Củng Cố Trọng Số Cao
                  </span>
                  <span className="text-[11px] font-bold text-primary">#Ethics</span>
                </div>
                <p className="text-xs font-semibold text-on-surface leading-snug">
                  Ôn tập Flashcards Ethics Standard I(B) Independence &amp; Objectivity
                </p>
                <p className="text-[11px] text-on-surface-variant font-light leading-normal">
                  Đạo đức chiếm 15-20% điểm thi. Giữ tỷ lệ chính xác trên 85% để an toàn vượt qua MPS.
                </p>
              </div>
              <div className="mt-4 pt-3 flex items-center justify-between border-t border-surface-container/60">
                <span className="text-[11px] font-semibold text-on-surface-variant flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-secondary">style</span> 24 thẻ
                </span>
                <button
                  onClick={() => navigateToTab('bookmarks-notes')}
                  className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                >
                  Xem thẻ <span className="material-symbols-outlined text-[14px]">visibility</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Visual Analytics Section (Grid Split) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Chart 1: Score Trend Chart (7 cols) */}
          <div className="lg:col-span-7 bg-surface-container-lowest rounded-2xl p-7 shadow-sm flex flex-col justify-between border border-surface-container/60">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-extrabold text-primary font-headline">
                  Điểm Số Mock Exam Qua Các Lần Thi
                </h2>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1.5 font-medium text-on-surface-variant">
                    <span className="w-3 h-3 rounded-full bg-secondary"></span> Điểm của bạn
                  </span>
                  <span className="flex items-center gap-1.5 font-medium text-tertiary-container">
                    <span className="w-4 h-0.5 border-t-2 border-dashed border-tertiary-fixed-dim"></span> MPS Benchmark (70%)
                  </span>
                </div>
              </div>
              <p className="text-xs text-on-surface-variant font-light">
                Tiến trình tăng trưởng điểm qua các bài kiểm tra thực chiến chuẩn CFA.
              </p>
            </div>

            {/* SVG Line Chart with Benchmark */}
            <div className="relative w-full my-6 pt-4">
              <div className="relative h-64 w-full">
                <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 540 220">
                  <defs>
                    <linearGradient id="analyticsScoreGrad" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#006874" stopOpacity="0.28" />
                      <stop offset="100%" stopColor="#006874" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  {/* Grid Lines */}
                  <line stroke="#e1e2e5" strokeDasharray="3 3" strokeWidth="1" x1="0" x2="540" y1="20" y2="20" />
                  <text fill="#70787d" fontSize="10" x="5" y="16">90%</text>
                  <line stroke="#e1e2e5" strokeDasharray="3 3" strokeWidth="1" x1="0" x2="540" y1="70" y2="70" />
                  <text fill="#70787d" fontSize="10" x="5" y="66">80%</text>
                  {/* MPS Gold Line at 70% */}
                  <line stroke="#f3bf28" strokeDasharray="6 4" strokeWidth="2" x1="0" x2="540" y1="120" y2="120" />
                  <text fill="#5e4700" fontSize="11" fontWeight="700" x="430" y="114">
                    MPS: 70% Điểm chuẩn
                  </text>
                  <line stroke="#e1e2e5" strokeDasharray="3 3" strokeWidth="1" x1="0" x2="540" y1="170" y2="170" />
                  <text fill="#70787d" fontSize="10" x="5" y="166">60%</text>
                  {/* Line Chart Area */}
                  <path d="M 60,150 L 200,115 L 340,80 L 480,75 L 480,210 L 60,210 Z" fill="url(#analyticsScoreGrad)" />
                  <path d="M 60,150 L 200,115 L 340,80 L 480,75" fill="none" stroke="#006874" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" />
                  {/* Points */}
                  <circle cx="60" cy="150" fill="#ffffff" r="6" stroke="#006874" strokeWidth="3" />
                  <text fill="#00394b" fontSize="12" fontWeight="800" textAnchor="middle" x="60" y="138">64%</text>
                  <circle cx="200" cy="115" fill="#ffffff" r="6" stroke="#006874" strokeWidth="3" />
                  <text fill="#00394b" fontSize="12" fontWeight="800" textAnchor="middle" x="200" y="103">71%</text>
                  <circle cx="340" cy="80" fill="#ffffff" r="6" stroke="#006874" strokeWidth="3" />
                  <text fill="#00394b" fontSize="12" fontWeight="800" textAnchor="middle" x="340" y="68">78%</text>
                  <circle cx="480" cy="75" fill="#f3bf28" r="7" stroke="#00394b" strokeWidth="3" />
                  <text fill="#5e4700" fontSize="13" fontWeight="900" textAnchor="middle" x="480" y="63">79%*</text>
                </svg>
              </div>

              {/* Bottom Axis Labels */}
              <div className="grid grid-cols-4 text-center mt-3 pt-2 border-t border-surface-container">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-on-surface">Diagnostic</span>
                  <span className="text-[10px] text-on-surface-variant font-light">12/08/2026</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-on-surface">Mock 01 - AM</span>
                  <span className="text-[10px] text-on-surface-variant font-light">28/08/2026</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-on-surface">Mock 01 - Full</span>
                  <span className="text-[10px] text-on-surface-variant font-light">15/09/2026</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-primary flex items-center justify-center gap-1">
                    Mock 02 - AM
                    <span className="w-1.5 h-1.5 rounded-full bg-tertiary-fixed-dim animate-ping"></span>
                  </span>
                  <span className="text-[10px] text-tertiary-container font-semibold">Đang diễn ra</span>
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-surface-container-low rounded-xl flex items-center justify-between text-xs text-on-surface-variant border border-surface-container/60">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-lg">check_circle</span>
                <span>Bạn đã duy trì phong độ vượt trên <strong>Minimum Passing Score (70%)</strong> trong 3 bài thi liên tiếp.</span>
              </div>
              <span className="font-bold text-secondary text-right shrink-0">+15% so với đầu vào</span>
            </div>
          </div>

          {/* Chart 2: Radar Ma Trận Năng Lực 10 Topic (5 cols) */}
          <div className="lg:col-span-5 bg-surface-container-lowest rounded-2xl p-7 shadow-sm flex flex-col justify-between border border-surface-container/60">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-extrabold text-primary font-headline">
                  Ma Trận Năng Lực 10 Topic
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-surface-container text-on-surface-variant">
                  Chuẩn CFA L1
                </span>
              </div>
              <p className="text-xs text-on-surface-variant font-light">
                So sánh Năng Lực Thực Tế vs Trung Bình Đồng Môn vs Ngưỡng MPS.
              </p>
            </div>

            {/* Radar Diagram */}
            <div className="my-4 relative flex items-center justify-center">
              <svg className="w-64 h-64" viewBox="0 0 240 240">
                <polygon fill="none" points="120,20 180,45 215,100 200,165 155,215 85,215 40,165 25,100 60,45" stroke="#edeef0" strokeWidth="1" />
                <polygon fill="none" points="120,50 162,67 186,105 176,150 144,185 96,185 64,150 54,105 78,67" stroke="#edeef0" strokeWidth="1" />
                <polygon fill="none" points="120,80 145,90 158,110 152,136 134,156 106,156 88,136 82,110 95,90" stroke="#edeef0" strokeWidth="1" />
                {/* Spokes */}
                <line stroke="#f2f4f6" strokeWidth="1" x1="120" x2="120" y1="120" y2="20" />
                <line stroke="#f2f4f6" strokeWidth="1" x1="120" x2="180" y1="120" y2="45" />
                <line stroke="#f2f4f6" strokeWidth="1" x1="120" x2="215" y1="120" y2="100" />
                <line stroke="#f2f4f6" strokeWidth="1" x1="120" x2="200" y1="120" y2="165" />
                <line stroke="#f2f4f6" strokeWidth="1" x1="120" x2="155" y1="120" y2="215" />
                <line stroke="#f2f4f6" strokeWidth="1" x1="120" x2="85" y1="120" y2="215" />
                <line stroke="#f2f4f6" strokeWidth="1" x1="120" x2="40" y1="120" y2="165" />
                <line stroke="#f2f4f6" strokeWidth="1" x1="120" x2="25" y1="120" y2="100" />
                <line stroke="#f2f4f6" strokeWidth="1" x1="120" x2="60" y1="120" y2="45" />
                {/* Peer Average Shape (Dotted) */}
                <polygon fill="#edeef0" fillOpacity="0.4" points="120,62 155,75 170,110 162,145 130,170 100,170 70,145 68,110 85,75" stroke="#c0c8cd" strokeDasharray="3 3" strokeWidth="1.5" />
                {/* Candidate Actual Performance Shape */}
                <polygon fill="#006874" fillOpacity="0.35" points="120,35 170,55 160,110 188,155 140,175 105,180 50,150 45,95 72,55" stroke="#006874" strokeWidth="2.5" />
                <circle cx="120" cy="35" fill="#00394b" r="4" />
                <circle cx="188" cy="155" fill="#00394b" r="4" />
                <circle cx="50" cy="150" fill="#ba1a1a" r="4.5" />
                <circle cx="45" cy="95" fill="#e17e23" r="4" />
                <text fill="#00394b" fontSize="9" fontWeight="700" textAnchor="middle" x="120" y="14">Ethics (85%)</text>
                <text fill="#00394b" fontSize="9" fontWeight="700" textAnchor="start" x="200" y="160">Alts (88%)</text>
                <text fill="#ba1a1a" fontSize="9" fontWeight="700" textAnchor="end" x="40" y="162">FI (59%)</text>
                <text fill="#40484c" fontSize="9" fontWeight="700" textAnchor="end" x="20" y="95">FRA (68%)</text>
              </svg>
            </div>

            {/* Split Summary */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-surface-container-low rounded-xl border border-surface-container/60">
                <span className="text-[10px] font-bold uppercase tracking-wider text-secondary flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">thumb_up</span> Thế mạnh vững chắc
                </span>
                <div className="mt-1.5 space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-on-surface">Ethics &amp; Professional</span>
                    <span className="text-secondary font-bold">85%</span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-on-surface">Alternative Investments</span>
                    <span className="text-secondary font-bold">88%</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-error-container/40 rounded-xl border border-error/20">
                <span className="text-[10px] font-bold uppercase tracking-wider text-error flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">priority_high</span> Trọng tâm cải thiện
                </span>
                <div className="mt-1.5 space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-on-surface">Fixed Income</span>
                    <span className="text-error font-bold">59%</span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-on-surface">Financial Reporting (FRA)</span>
                    <span className="text-on-surface-variant font-bold">68%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Topic Mastery Matrix Table */}
        <div className="bg-surface-container-lowest rounded-2xl p-7 shadow-sm space-y-6 border border-surface-container/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-extrabold text-primary font-headline">
                Chi Tiết Ma Trận Đánh Giá Topic (Topic Mastery Matrix)
              </h2>
              <p className="text-xs text-on-surface-variant font-light">
                Thống kê chi tiết số lượng câu hỏi, tỷ lệ chính xác và đề xuất can thiệp cho từng môn học.
              </p>
            </div>
            <div className="flex items-center gap-1.5 p-1 bg-surface-container rounded-xl self-start sm:self-auto border border-surface-container">
              <button
                onClick={() => setTopicFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  topicFilter === 'all'
                    ? 'bg-surface-container-lowest text-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                Tất cả Topics (10)
              </button>
              <button
                onClick={() => setTopicFilter('needs-improvement')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  topicFilter === 'needs-improvement'
                    ? 'bg-surface-container-lowest text-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                Cần cải thiện (2)
              </button>
              <button
                onClick={() => setTopicFilter('strong')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  topicFilter === 'strong'
                    ? 'bg-surface-container-lowest text-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                Vững vàng (8)
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider bg-surface-container-low/70 rounded-xl">
                  <th className="py-3 px-4 rounded-l-xl">CFA Topic / Chuyên đề</th>
                  <th className="py-3 px-4 text-center">Trọng số kỳ thi</th>
                  <th className="py-3 px-4 text-center">Số câu đã làm</th>
                  <th className="py-3 px-4">Tỷ lệ chính xác</th>
                  <th className="py-3 px-4 text-center">Đánh giá trạng thái</th>
                  <th className="py-3 px-4 rounded-r-xl">Hành động gợi ý</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-surface-container">
                {/* Row 1 */}
                {(topicFilter === 'all' || topicFilter === 'strong') && (
                  <tr className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-primary flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-secondary"></span>
                      Ethical &amp; Professional Standards
                    </td>
                    <td className="py-3.5 px-4 text-center text-on-surface-variant font-medium">15 - 20%</td>
                    <td className="py-3.5 px-4 text-center font-semibold text-on-surface">240 / 300</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-surface-container h-2 rounded-full overflow-hidden">
                          <div className="bg-secondary h-full rounded-full" style={{ width: '85%' }}></div>
                        </div>
                        <span className="font-bold text-primary">85.0%</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-secondary-container text-on-secondary-container">
                        Vững vàng
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-on-surface-variant font-medium">
                      Duy trì ôn tập 10 câu Flashcard mỗi tuần
                    </td>
                  </tr>
                )}

                {/* Row 2: Fixed Income (Red) */}
                {(topicFilter === 'all' || topicFilter === 'needs-improvement') && (
                  <tr className="bg-error-container/10 hover:bg-error-container/20 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-primary flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-error"></span>
                      Fixed Income
                    </td>
                    <td className="py-3.5 px-4 text-center text-on-surface-variant font-medium">11 - 14%</td>
                    <td className="py-3.5 px-4 text-center font-semibold text-on-surface">180 / 250</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-surface-container h-2 rounded-full overflow-hidden">
                          <div className="bg-error h-full rounded-full" style={{ width: '59%' }}></div>
                        </div>
                        <span className="font-bold text-error">59.0%</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-error-container text-on-error-container">
                        Vùng đỏ (Báo động)
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openCourseDetail('cfa-l1-fixed-income')}
                          className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[15px] text-secondary">smart_display</span>
                          <span>Học Video Duration</span>
                        </button>
                        <span className="text-outline text-xs">•</span>
                        <button
                          onClick={() => navigateToTab('practice-questions')}
                          className="text-xs font-bold text-error hover:underline cursor-pointer"
                        >
                          Luyện Q-Bank
                        </button>
                      </div>
                    </td>
                  </tr>
                )}

                {/* Row 3: FRA */}
                {(topicFilter === 'all' || topicFilter === 'needs-improvement') && (
                  <tr className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-primary flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-tertiary-fixed-dim"></span>
                      Financial Statement Analysis (FRA)
                    </td>
                    <td className="py-3.5 px-4 text-center text-on-surface-variant font-medium">13 - 17%</td>
                    <td className="py-3.5 px-4 text-center font-semibold text-on-surface">210 / 280</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-surface-container h-2 rounded-full overflow-hidden">
                          <div className="bg-tertiary-fixed-dim h-full rounded-full" style={{ width: '68%' }}></div>
                        </div>
                        <span className="font-bold text-tertiary-container">68.0%</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-tertiary-fixed/60 text-on-tertiary-fixed">
                        Cần cải thiện
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => openLessonVideo('cfa-l1-fra', 'fra-m01-l03', 1475)}
                        className="text-xs font-bold text-secondary hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[15px] text-secondary">play_circle</span>
                        <span>Xem bài giảng: IFRS 15 &amp; Leases (từ 24:35)</span>
                      </button>
                    </td>
                  </tr>
                )}

                {/* Row 4: Equity */}
                {(topicFilter === 'all' || topicFilter === 'strong') && (
                  <tr className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-primary flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-secondary"></span>
                      Equity Investments
                    </td>
                    <td className="py-3.5 px-4 text-center text-on-surface-variant font-medium">10 - 12%</td>
                    <td className="py-3.5 px-4 text-center font-semibold text-on-surface">190 / 200</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-surface-container h-2 rounded-full overflow-hidden">
                          <div className="bg-secondary h-full rounded-full" style={{ width: '79%' }}></div>
                        </div>
                        <span className="font-bold text-primary">79.2%</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-secondary-container text-on-secondary-container">
                        Đạt chuẩn
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-on-surface-variant font-medium">
                      Luyện tập các case study DDM và Multiplier Models
                    </td>
                  </tr>
                )}

                {/* Row 5: Quant */}
                {(topicFilter === 'all' || topicFilter === 'strong') && (
                  <tr className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-primary flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-secondary"></span>
                      Quantitative Methods
                    </td>
                    <td className="py-3.5 px-4 text-center text-on-surface-variant font-medium">6 - 9%</td>
                    <td className="py-3.5 px-4 text-center font-semibold text-on-surface">160 / 180</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-surface-container h-2 rounded-full overflow-hidden">
                          <div className="bg-secondary h-full rounded-full" style={{ width: '74%' }}></div>
                        </div>
                        <span className="font-bold text-primary">74.5%</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-secondary-container text-on-secondary-container">
                        Đạt chuẩn
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-on-surface-variant font-medium">
                      Củng cố công thức Hypothesis Testing
                    </td>
                  </tr>
                )}

                {/* Row 6: Alternative Investments */}
                {(topicFilter === 'all' || topicFilter === 'strong') && (
                  <tr className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-primary flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-secondary"></span>
                      Alternative Investments
                    </td>
                    <td className="py-3.5 px-4 text-center text-on-surface-variant font-medium">5 - 8%</td>
                    <td className="py-3.5 px-4 text-center font-semibold text-on-surface">95 / 100</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-surface-container h-2 rounded-full overflow-hidden">
                          <div className="bg-secondary h-full rounded-full" style={{ width: '88%' }}></div>
                        </div>
                        <span className="font-bold text-primary">88.0%</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-secondary-fixed text-on-secondary-fixed">
                        Xuất sắc
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-on-surface-variant font-medium">
                      Đã sẵn sàng cho ngày thi chính thức
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 4: Study Habits & Biological Profile */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Consistency Weekly Bar Chart (7 cols) */}
          <div className="lg:col-span-7 bg-surface-container-lowest rounded-2xl p-7 shadow-sm flex flex-col justify-between border border-surface-container/60">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-primary font-headline">
                  Thói Quen &amp; Nhịp Độ Học Hàng Tuần
                </h2>
                <p className="text-xs text-on-surface-variant font-light">
                  Mục tiêu hàng tuần: 18 giờ (Hiện đạt trung bình 2.5 giờ/ngày).
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-secondary">Đạt 17.5 / 18h</span>
                <div className="text-[10px] text-on-surface-variant">Tuần hiện tại</div>
              </div>
            </div>

            {/* 7-day Bar Visualizer */}
            <div className="grid grid-cols-7 gap-3 items-end h-48 my-6 px-4">
              <div className="flex flex-col items-center gap-2 h-full justify-end">
                <span className="text-[11px] font-bold text-on-surface">2.5h</span>
                <div className="w-full bg-secondary rounded-t-lg" style={{ height: '60%' }}></div>
                <span className="text-xs font-semibold text-on-surface-variant">T2</span>
              </div>
              <div className="flex flex-col items-center gap-2 h-full justify-end">
                <span className="text-[11px] font-bold text-on-surface">3.0h</span>
                <div className="w-full bg-secondary rounded-t-lg" style={{ height: '75%' }}></div>
                <span className="text-xs font-semibold text-on-surface-variant">T3</span>
              </div>
              <div className="flex flex-col items-center gap-2 h-full justify-end">
                <span className="text-[11px] font-bold text-on-surface">2.0h</span>
                <div className="w-full bg-secondary rounded-t-lg" style={{ height: '50%' }}></div>
                <span className="text-xs font-semibold text-on-surface-variant">T4</span>
              </div>
              <div className="flex flex-col items-center gap-2 h-full justify-end">
                <span className="text-[11px] font-bold text-on-surface">3.5h</span>
                <div className="w-full bg-primary rounded-t-lg" style={{ height: '85%' }}></div>
                <span className="text-xs font-semibold text-on-surface-variant">T5</span>
              </div>
              <div className="flex flex-col items-center gap-2 h-full justify-end">
                <span className="text-[11px] font-bold text-on-surface">1.5h</span>
                <div className="w-full bg-secondary rounded-t-lg" style={{ height: '38%' }}></div>
                <span className="text-xs font-semibold text-on-surface-variant">T6</span>
              </div>
              <div className="flex flex-col items-center gap-2 h-full justify-end relative">
                <span className="px-1.5 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed text-[9px] font-black absolute -top-2">
                  Mock Day
                </span>
                <span className="text-[11px] font-extrabold text-tertiary-container">4.5h</span>
                <div className="w-full bg-tertiary-fixed-dim rounded-t-lg" style={{ height: '100%' }}></div>
                <span className="text-xs font-bold text-tertiary-container">T7</span>
              </div>
              <div className="flex flex-col items-center gap-2 h-full justify-end">
                <span className="text-[11px] font-bold text-on-surface">0.5h</span>
                <div className="w-full bg-surface-container-high rounded-t-lg" style={{ height: '15%' }}></div>
                <span className="text-xs font-semibold text-on-surface-variant">CN</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-on-surface-variant pt-2 border-t border-surface-container">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                <span>Ngày học hiệu quả nhất: <strong>Thứ Bảy (Mock Exam)</strong></span>
              </div>
              <span className="text-[11px] text-secondary font-semibold">Tỷ lệ hoàn thành lịch: 97.2%</span>
            </div>
          </div>

          {/* Biological Profile (5 cols) */}
          <div className="lg:col-span-5 bg-surface-container-lowest rounded-2xl p-7 shadow-sm flex flex-col justify-between border border-surface-container/60">
            <div>
              <h2 className="text-lg font-extrabold text-primary font-headline">
                Hồ Sơ Nhịp Sinh Học Học Tập
              </h2>
              <p className="text-xs text-on-surface-variant font-light">
                Phân tích khung giờ tiếp thu kiến thức tài chính tối ưu nhất của bạn.
              </p>
            </div>

            <div className="space-y-4 my-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-surface-container-low border border-surface-container/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-tertiary-fixed/40 flex items-center justify-center text-xl">
                    🔥
                  </div>
                  <div>
                    <div className="text-xs font-bold text-primary">Chuỗi học tập liên tục</div>
                    <div className="text-[11px] text-on-surface-variant">Kỷ lục dài nhất từ trước đến nay</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-tertiary-container font-headline">
                    {studentProfile.streakDays}
                  </span>
                  <span className="text-xs font-bold text-on-surface-variant"> ngày</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-surface-container-low border border-surface-container/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary-fixed/50 flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined text-2xl">bedtime</span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-primary">Khung giờ vàng hiệu quả</div>
                    <div className="text-[11px] text-on-surface-variant">Độ chính xác đạt 84.2% trong khung giờ này</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-extrabold text-secondary font-headline">20:00 - 22:30</span>
                  <div className="text-[10px] text-on-surface-variant">Buổi tối</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-surface-container-low border border-surface-container/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-container text-on-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl">speed</span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-primary">Tốc độ giải câu hỏi</div>
                    <div className="text-[11px] text-on-surface-variant">Chuẩn CFA Level I là 90 giây/câu</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-primary font-headline">76 giây</span>
                  <div className="text-[10px] text-secondary font-bold">Nhanh hơn 14s</div>
                </div>
              </div>
            </div>

            <div className="pt-2 text-center">
              <button
                onClick={() => navigateToView('mock-library')}
                className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:text-secondary transition-colors cursor-pointer"
              >
                <span>Lên lịch thi Mock Exam tiếp theo</span>
                <span className="material-symbols-outlined text-sm">calendar_month</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Action Banner for Export */}
        <div className="bg-primary text-on-primary rounded-2xl p-6 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-container flex items-center justify-center text-tertiary-fixed shrink-0">
              <span className="material-symbols-outlined text-3xl">download_for_offline</span>
            </div>
            <div>
              <h4 className="text-base font-bold font-headline">
                Tải Báo Cáo Phân Tích Hiệu Suất Toàn Diện (PDF)
              </h4>
              <p className="text-xs text-on-primary-container font-light">
                Bao gồm chi tiết 10 môn học, phân tích xác suất đỗ, và lộ trình 48 ngày nước rút dành cho giảng viên FES Academy cố vấn.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
            <button
              onClick={() => navigateToTab('exam-history')}
              className="flex-1 md:flex-none px-4 py-2.5 rounded-lg bg-surface-container-lowest/10 hover:bg-surface-container-lowest/20 text-on-primary font-semibold text-xs transition-colors cursor-pointer"
            >
              Xem lịch sử kỳ thi
            </button>
            <button
              onClick={() => alert('Đang xuất báo cáo toàn diện CFA Level I Diagnostic (PDF)...')}
              className="flex-1 md:flex-none px-5 py-2.5 rounded-lg bg-tertiary-fixed hover:bg-tertiary-fixed-dim text-on-tertiary-fixed font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span> Xuất File PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
