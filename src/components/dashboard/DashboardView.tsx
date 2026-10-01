import React from 'react';
import { useLms } from '../../context/LmsContext';
import { FesLogo } from '../common/FesLogo';

export const DashboardView: React.FC = () => {
  const {
    studentProfile,
    resumeInProgressExam,
    navigateToTab,
    navigateToView,
    mockExams,
    openExamInstructions,
    viewCompletedExamResult,
    openLessonVideo,
  } = useLms();

  const mock03 = mockExams.find((e) => e.id === 'fes-cfa-l1-mock-03') || mockExams[2];
  const mock02 = mockExams.find((e) => e.id === 'fes-cfa-l1-mock-02') || mockExams[0];

  return (
    <div className="flex flex-col w-full">
      <div className="px-4 sm:px-8 py-8 max-w-[1400px] mx-auto w-full space-y-8">
        {/* 1. Hero Section: Asymmetric Executive Dashboard Banner */}
        <div className="relative overflow-hidden rounded-xl bg-primary text-on-primary shadow-xl">
          {/* Ambient decorative aura */}
          <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-secondary/20 blur-3xl pointer-events-none"></div>
          <div className="absolute right-1/3 -bottom-20 w-72 h-72 rounded-full bg-tertiary-fixed-dim/10 blur-2xl pointer-events-none"></div>

          <div className="relative z-10 p-6 sm:p-8 lg:p-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="max-w-3xl space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold tracking-wider">
                <span className="px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed flex items-center gap-1.5 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary-container animate-pulse"></span>
                  CFA® Program Level I Candidate
                </span>
                <span className="text-on-primary-container font-mono">
                  • Kỳ thi: {studentProfile.targetExamDate}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-error/20 text-error-container font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">schedule</span> Còn{' '}
                  {studentProfile.daysRemaining} ngày
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-headline tracking-tight text-surface-container-lowest leading-tight">
                Chào mừng bạn quay trở lại,{' '}
                <span className="text-secondary-fixed">{studentProfile.name}</span>
              </h1>

              <div className="flex flex-wrap items-center gap-6 pt-1 text-sm text-surface-dim font-light">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary-fixed text-lg">
                    verified
                  </span>
                  <span>
                    Mục tiêu điểm kỳ vọng:{' '}
                    <strong className="text-surface-container-lowest font-semibold">
                      {studentProfile.targetMps}%+ MPS
                    </strong>{' '}
                    (Minimum Passing Score)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-tertiary-fixed-dim text-lg">
                    insights
                  </span>
                  <span>
                    Dự báo hiện tại:{' '}
                    <strong className="text-tertiary-fixed-dim font-bold">
                      {studentProfile.forecastScore}%
                    </strong>{' '}
                    (Đạt chuẩn)
                  </span>
                </div>
              </div>
            </div>

            {/* Quick CTA Module: In-progress exam */}
            <div className="flex-shrink-0 bg-primary-container/60 backdrop-blur-md p-5 rounded-xl border border-secondary/20 shadow-inner flex flex-col gap-3 max-w-sm w-full">
              <div className="flex items-center justify-between text-xs">
                <span className="text-on-primary-container font-medium uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-tertiary-fixed-dim">
                    play_circle
                  </span>
                  Bài thi dở dang
                </span>
                <span className="font-mono text-tertiary-fixed text-[11px] font-bold">
                  43/90 câu đã làm
                </span>
              </div>
              <div className="font-semibold text-surface-container-lowest text-sm line-clamp-1">
                Mock Exam 02 (Session 1 - Morning)
              </div>
              {/* Progress track */}
              <div className="w-full bg-primary/80 h-1.5 rounded-full overflow-hidden">
                <div className="bg-tertiary-fixed-dim h-full rounded-full" style={{ width: '48%' }}></div>
              </div>
              <button
                onClick={resumeInProgressExam}
                className="mt-1 w-full text-center py-2.5 px-4 rounded-lg bg-tertiary-fixed-dim hover:bg-tertiary-fixed text-on-tertiary-fixed font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-md flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer"
              >
                <span>Tiếp tục làm bài</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2. KPI Metrics Grid (5 Key Fintech Indicator Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Metric 1 */}
          <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                Tiến độ chung
              </span>
              <div className="w-8 h-8 rounded-lg bg-primary-fixed/40 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-lg">donut_large</span>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black font-headline text-primary tracking-tight">
                  {studentProfile.overallProgressPercentage}%
                </span>
                <span className="text-xs text-on-surface-variant font-medium">
                  {studentProfile.readingsCompleted}/{studentProfile.totalReadings} Readings
                </span>
              </div>
              <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden mt-3">
                <div
                  className="bg-secondary h-full rounded-full"
                  style={{ width: `${studentProfile.overallProgressPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Metric 2 */}
          <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                Câu hỏi đã làm
              </span>
              <div className="w-8 h-8 rounded-lg bg-secondary-fixed/50 flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-lg">task_alt</span>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black font-headline text-primary tracking-tight">
                  {studentProfile.questionsCompleted.toLocaleString()}
                </span>
                <span className="text-xs font-mono text-outline">
                  / {studentProfile.totalTargetQuestions.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-2.5 text-[11px] font-semibold text-secondary">
                <span className="material-symbols-outlined text-sm">trending_up</span>
                <span>+{studentProfile.todayQuestions} câu hoàn thành hôm nay</span>
              </div>
            </div>
          </div>

          {/* Metric 3 */}
          <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                Mock Exam
              </span>
              <div className="w-8 h-8 rounded-lg bg-tertiary-fixed/60 flex items-center justify-center text-tertiary">
                <span className="material-symbols-outlined text-lg">school</span>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black font-headline text-primary tracking-tight">
                  {studentProfile.completedMocksCount} Đề
                </span>
                <span className="text-xs text-on-surface-variant">đã hoàn thành</span>
              </div>
              <div className="flex items-center gap-2 mt-2.5 text-[11px]">
                <span className="text-on-surface-variant font-medium">Điểm TB:</span>
                <span className="font-bold text-primary px-1.5 py-0.5 rounded bg-surface-container text-xs">
                  {studentProfile.averageScorePercentage}%
                </span>
              </div>
            </div>
          </div>

          {/* Metric 4 */}
          <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                Chuỗi kỷ luật
              </span>
              <div className="w-8 h-8 rounded-lg bg-tertiary-fixed/40 flex items-center justify-center text-tertiary-container">
                <span className="text-base">🔥</span>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black font-headline text-primary tracking-tight">
                  {studentProfile.streakDays}
                </span>
                <span className="text-xs font-semibold text-on-surface-variant">ngày liên tục</span>
              </div>
              <div className="inline-flex items-center gap-1 mt-2.5 px-2 py-0.5 rounded-full bg-tertiary-fixed/40 text-[10px] font-bold text-tertiary-container">
                <span>Siêu phong độ duy trì</span>
              </div>
            </div>
          </div>

          {/* Metric 5 */}
          <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                Chỉ số sẵn sàng
              </span>
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-lg">speed</span>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center gap-2">
                <span className="text-xl font-black font-headline text-secondary tracking-tight">
                  ON TRACK
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-secondary mt-2.5">
                <span className="material-symbols-outlined text-sm">arrow_upward</span>
                <span>Vượt MPS dự kiến +6.2%</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Section: "Tiếp tục học & Luyện tập gần đây" */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-6 bg-primary rounded-full"></div>
              <h2 className="text-lg font-bold font-headline text-on-surface tracking-tight">
                Tiếp tục học &amp; Luyện tập gần đây
              </h2>
            </div>
            <button
              onClick={() => navigateToTab('my-courses')}
              className="text-xs font-semibold text-secondary hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
            >
              Xem tất cả bài học
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Learning Item 1 */}
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-6">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-primary-fixed text-on-primary-fixed">
                      Reading Topic
                    </span>
                    <span className="text-xs font-semibold text-secondary">CFA Level I • FRA</span>
                  </div>
                  <h3 className="text-base font-bold text-primary font-headline">
                    Financial Reporting &amp; Analysis: Income Statement Analysis
                  </h3>
                  <p className="text-xs text-on-surface-variant font-light line-clamp-1">
                    Phân tích doanh thu dồn tích, EPS diluted, non-recurring items và biên lợi nhuận hoạt động.
                  </p>
                </div>
                <div className="w-12 h-12 flex-shrink-0 rounded-xl bg-surface-container-low flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-2xl text-secondary">menu_book</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-on-surface-variant flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-outline">timelapse</span>
                    Còn khoảng 15 phút học
                  </span>
                  <span className="font-bold text-primary font-mono">75% hoàn thành</span>
                </div>
                <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                  <div className="bg-secondary h-full rounded-full transition-all duration-500" style={{ width: '75%' }}></div>
                </div>
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[11px] text-outline font-medium">Lần cuối học: Hôm nay, 10:15 SA</span>
                  <button
                    onClick={() => openLessonVideo('cfa-l1-fra', 'fra-m01-l03', 1475)}
                    className="px-5 py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-bold text-xs flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
                    title="Tiếp tục bài giảng video từ 24:35"
                  >
                    <span>Học tiếp</span>
                    <span className="material-symbols-outlined text-sm">play_arrow</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Learning Item 2 */}
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-6">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-tertiary-fixed text-on-tertiary-fixed">
                      Practice Quiz
                    </span>
                    <span className="text-xs font-semibold text-secondary">CFA Level I • Quants</span>
                  </div>
                  <h3 className="text-base font-bold text-primary font-headline">
                    Quantitative Methods: Time Value of Money &amp; DCF
                  </h3>
                  <p className="text-xs text-on-surface-variant font-light line-clamp-1">
                    Tính toán NPV, IRR, Annual Percentage Rate (APR) và Effective Annual Rate (EAR).
                  </p>
                </div>
                <div className="w-12 h-12 flex-shrink-0 rounded-xl bg-surface-container-low flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-2xl text-tertiary-container">calculate</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-on-surface-variant flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-outline">help_outline</span>
                    Còn 8 / 10 câu hỏi chưa trả lời
                  </span>
                  <span className="font-bold text-primary font-mono">20% hoàn thành</span>
                </div>
                <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                  <div className="bg-tertiary-fixed-dim h-full rounded-full transition-all duration-500" style={{ width: '20%' }}></div>
                </div>
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[11px] text-outline font-medium">Lần cuối làm: Hôm qua, 21:40</span>
                  <button
                    onClick={() => navigateToTab('practice-questions')}
                    className="px-5 py-2 rounded-lg bg-tertiary-fixed-dim hover:bg-tertiary-fixed text-on-tertiary-fixed font-bold text-xs flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
                  >
                    <span>Làm tiếp</span>
                    <span className="material-symbols-outlined text-sm">edit_note</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Section: "Mock Exam Đề xuất & Sắp diễn ra" */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-6 bg-secondary rounded-full"></div>
              <div>
                <h2 className="text-lg font-bold font-headline text-on-surface tracking-tight">
                  Mock Exam Đề xuất &amp; Sắp diễn ra
                </h2>
                <p className="text-xs text-on-surface-variant">
                  Hệ thống đề thi mô phỏng tiêu chuẩn CFA Institute với áp lực phòng thi thật
                </p>
              </div>
            </div>
            <button
              onClick={() => navigateToView('mock-library')}
              className="text-xs font-semibold px-2.5 py-1 rounded bg-secondary-container text-on-secondary-container cursor-pointer hover:bg-secondary-container/80 transition-colors"
            >
              Level I Updated 2026 • Xem tất cả
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Mock 1: Major Exam Card */}
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none"></div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-tertiary-fixed text-on-tertiary-fixed tracking-wide uppercase">
                    Đề chuẩn Format 2026
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-error-container text-on-error-container">
                    Độ khó: Advanced
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-primary font-headline leading-snug">
                    FES Mock Exam 03 - Full Diagnostic (Session 1 &amp; 2)
                  </h3>
                  <p className="text-xs text-on-surface-variant font-light mt-1.5">
                    Mô phỏng toàn diện 10 chủ đề theo đúng phân bổ trọng số kỳ thi tháng 11/2026.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 py-3 px-3 bg-surface-container-low rounded-lg text-xs">
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <span className="material-symbols-outlined text-sm text-secondary">
                      format_list_numbered
                    </span>
                    <span>180 câu hỏi</span>
                  </div>
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <span className="material-symbols-outlined text-sm text-secondary">timer</span>
                    <span>270 phút</span>
                  </div>
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <span className="material-symbols-outlined text-sm text-secondary">layers</span>
                    <span>2 Sessions</span>
                  </div>
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <span className="material-symbols-outlined text-sm text-secondary">analytics</span>
                    <span>Chấm điểm tức thì</span>
                  </div>
                </div>
              </div>
              <div className="pt-5 mt-4 border-t border-surface-container">
                <button
                  onClick={() => openExamInstructions(mock03)}
                  className="w-full py-2.5 px-4 rounded-lg bg-tertiary-fixed-dim hover:bg-tertiary-fixed text-on-tertiary-fixed font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">rocket_launch</span>
                  <span>Bắt đầu làm bài</span>
                </button>
              </div>
            </div>

            {/* Mock 2: In Progress Exam */}
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary-fixed text-on-primary-fixed tracking-wide uppercase">
                    Session 1 • Morning
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-surface-container text-on-surface-variant">
                    Độ khó: Medium
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-primary font-headline leading-snug">
                    FES Mock Exam 02 - Session 1 (Morning Exam)
                  </h3>
                  <p className="text-xs text-on-surface-variant font-light mt-1.5">
                    Tập trung: Ethical &amp; Professional Standards, Quant, Economics, FRA.
                  </p>
                </div>
                <div className="py-3 px-3.5 bg-surface-container-low rounded-lg space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-on-surface-variant font-medium">Trạng thái làm bài:</span>
                    <span className="font-bold text-primary">Chưa hoàn thành</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-outline">
                    <span>Tiến độ: 43 / 90 câu</span>
                    <span>Thời gian còn: 68:15</span>
                  </div>
                  <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                    <div className="bg-primary h-full rounded-full" style={{ width: '48%' }}></div>
                  </div>
                </div>
              </div>
              <div className="pt-5 mt-4 border-t border-surface-container">
                <button
                  onClick={resumeInProgressExam}
                  className="w-full py-2.5 px-4 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">restart_alt</span>
                  <span>Làm tiếp bài thi</span>
                </button>
              </div>
            </div>

            {/* Mock 3: Quick Mini-Mock */}
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-secondary-fixed text-on-secondary-fixed tracking-wide uppercase">
                    Chuyên đề đạo đức
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-tertiary-fixed/60 text-tertiary-container">
                    High Priority
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-primary font-headline leading-snug">
                    Ethics &amp; Professional Standards Mini-Mock
                  </h3>
                  <p className="text-xs text-on-surface-variant font-light mt-1.5">
                    30 tình huống thực tế về Code of Ethics và Standards of Professional Conduct.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 py-3 px-3 bg-surface-container-low rounded-lg text-xs">
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <span className="material-symbols-outlined text-sm text-secondary">quiz</span>
                    <span>30 câu trắc nghiệm</span>
                  </div>
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <span className="material-symbols-outlined text-sm text-secondary">alarm</span>
                    <span>45 phút làm bài</span>
                  </div>
                  <div className="col-span-2 flex items-center gap-1.5 text-xs text-secondary font-medium">
                    <span className="material-symbols-outlined text-sm">stars</span>
                    <span>Yêu cầu tối thiểu đạt: 80%</span>
                  </div>
                </div>
              </div>
              <div className="pt-5 mt-4 border-t border-surface-container">
                <button
                  onClick={() => openExamInstructions(mock02)}
                  className="w-full py-2.5 px-4 rounded-lg bg-surface-container text-primary hover:bg-surface-container-high font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">play_arrow</span>
                  <span>Luyện tập ngay</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 5. Performance & Weak Areas (Fintech Analytics 2-Column Split) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Topic Mastery Analysis (7 Cols) */}
          <div className="lg:col-span-7 bg-surface-container-lowest rounded-xl p-6 sm:p-7 shadow-sm space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-xl">bar_chart</span>
                  <h2 className="text-lg font-bold font-headline text-primary">
                    Phân tích năng lực 10 chủ đề CFA
                  </h2>
                </div>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Dựa trên kết quả tổng hợp 1,420 câu hỏi luyện tập và 4 bài Mock Exam
                </p>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-semibold">
                <span className="inline-flex items-center gap-1 text-secondary">
                  <span className="w-2.5 h-2.5 rounded-sm bg-secondary"></span> ≥70% Đạt
                </span>
                <span className="inline-flex items-center gap-1 text-error">
                  <span className="w-2.5 h-2.5 rounded-sm bg-error"></span> &lt;65% Cảnh báo
                </span>
              </div>
            </div>

            {/* 10 Topics Bars */}
            <div className="space-y-3.5">
              {/* Topic 1 */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-primary">Ethics &amp; Professional Standards</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-secondary">Strong - Vượt chuẩn</span>
                    <span className="font-mono font-bold text-primary w-10 text-right">84%</span>
                  </div>
                </div>
                <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                  <div className="bg-secondary h-full rounded-full" style={{ width: '84%' }}></div>
                </div>
              </div>

              {/* Topic 2 */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-primary">Quantitative Methods</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium text-secondary">Tốt</span>
                    <span className="font-mono font-bold text-primary w-10 text-right">78%</span>
                  </div>
                </div>
                <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                  <div className="bg-secondary h-full rounded-full" style={{ width: '78%' }}></div>
                </div>
              </div>

              {/* Topic 3 */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-primary">Economics</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium text-secondary">Khá</span>
                    <span className="font-mono font-bold text-primary w-10 text-right">76%</span>
                  </div>
                </div>
                <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                  <div className="bg-secondary h-full rounded-full" style={{ width: '76%' }}></div>
                </div>
              </div>

              {/* Topic 4: Weak FRA */}
              <div className="space-y-1 p-2 -mx-2 rounded-lg bg-error-container/20">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-on-error-container flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-error">warning</span>
                    Financial Reporting &amp; Analysis (FRA)
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-error">⚠️ Cần cải thiện</span>
                    <span className="font-mono font-black text-error w-10 text-right">62%</span>
                  </div>
                </div>
                <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                  <div className="bg-error h-full rounded-full" style={{ width: '62%' }}></div>
                </div>
              </div>

              {/* Topic 5 */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-primary">Corporate Issuers</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium text-secondary">Khá</span>
                    <span className="font-mono font-bold text-primary w-10 text-right">71%</span>
                  </div>
                </div>
                <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                  <div className="bg-secondary h-full rounded-full" style={{ width: '71%' }}></div>
                </div>
              </div>

              {/* Topic 6 */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-primary">Equity Investments</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium text-tertiary-container">Cần ôn thêm</span>
                    <span className="font-mono font-bold text-primary w-10 text-right">69%</span>
                  </div>
                </div>
                <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                  <div className="bg-secondary-container h-full rounded-full" style={{ width: '69%' }}></div>
                </div>
              </div>

              {/* Topic 7: Very Weak Fixed Income */}
              <div className="space-y-1 p-2 -mx-2 rounded-lg bg-error-container/20">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-on-error-container flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-error">warning</span>
                    Fixed Income
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-error">⚠️ Vùng yếu</span>
                    <span className="font-mono font-black text-error w-10 text-right">58%</span>
                  </div>
                </div>
                <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                  <div className="bg-error h-full rounded-full" style={{ width: '58%' }}></div>
                </div>
              </div>

              {/* Topic 8 */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-primary">Derivatives</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium text-outline">Cần rèn luyện</span>
                    <span className="font-mono font-bold text-primary w-10 text-right">64%</span>
                  </div>
                </div>
                <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                  <div className="bg-surface-tint h-full rounded-full" style={{ width: '64%' }}></div>
                </div>
              </div>

              {/* Topic 9 */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-primary">Alternative Investments</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium text-secondary">Tốt</span>
                    <span className="font-mono font-bold text-primary w-10 text-right">80%</span>
                  </div>
                </div>
                <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                  <div className="bg-secondary h-full rounded-full" style={{ width: '80%' }}></div>
                </div>
              </div>

              {/* Topic 10 */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-primary">Portfolio Management</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium text-secondary">Khá</span>
                    <span className="font-mono font-bold text-primary w-10 text-right">75%</span>
                  </div>
                </div>
                <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                  <div className="bg-secondary h-full rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Weak Areas & Smart Remediation (5 Cols) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-error text-xl">psychology_alt</span>
                  <h2 className="text-base font-bold font-headline text-primary">
                    Vùng yếu &amp; Gợi ý cải thiện
                  </h2>
                </div>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-error-container text-on-error-container">
                  AI Remediation
                </span>
              </div>
              <p className="text-xs text-on-surface-variant font-light">
                Thuật toán phát hiện 3 sub-topics có tỷ lệ sai cao nhất cần ôn tập cấp tốc trước khi làm Mock tiếp theo:
              </p>
              <div className="space-y-3.5 pt-1">
                {/* Weak Area 1 */}
                <div className="p-3.5 rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-primary leading-snug">
                      Fixed Income: Duration &amp; Convexity
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-error/10 text-error">
                      Chính xác: 45%
                    </span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant font-light">
                    Thường nhầm lẫn giữa Modified Duration và Effective Duration khi có embedded option.
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] font-medium text-secondary flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">lightbulb</span>
                      Gợi ý: Làm 20 câu hỏi trọng điểm
                    </span>
                    <button
                      onClick={() => navigateToTab('practice-questions')}
                      className="px-3 py-1 bg-primary text-on-primary rounded text-[11px] font-bold hover:bg-primary-container transition-all cursor-pointer"
                    >
                      Luyện ngay
                    </button>
                  </div>
                </div>

                {/* Weak Area 2 */}
                <div className="p-3.5 rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-primary leading-snug">
                      FRA: Non-Current Liabilities &amp; Lease Accounting
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-error/10 text-error">
                      Chính xác: 52%
                    </span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant font-light">
                    Khó khăn trong phân loại IFRS 16 và US GAAP Finance vs Operating Lease.
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] font-medium text-secondary flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">play_lesson</span>
                      Gợi ý: Xem bài giảng tóm tắt &amp; Quiz
                    </span>
                    <button
                      onClick={() => navigateToTab('my-courses')}
                      className="px-3 py-1 bg-primary text-on-primary rounded text-[11px] font-bold hover:bg-primary-container transition-all cursor-pointer"
                    >
                      Học lại
                    </button>
                  </div>
                </div>

                {/* Weak Area 3 */}
                <div className="p-3.5 rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-primary leading-snug">
                      Derivatives: Option Pricing Binomial Models
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-error/10 text-error">
                      Chính xác: 54%
                    </span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant font-light">
                    Chậm ở bước lập bảng tỷ lệ rủi ro trung lập (risk-neutral probability).
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] font-medium text-secondary flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">quiz</span>
                      Gợi ý: Bộ 15 công thức &amp; bài tập
                    </span>
                    <button
                      onClick={() => navigateToTab('practice-questions')}
                      className="px-3 py-1 bg-primary text-on-primary rounded text-[11px] font-bold hover:bg-primary-container transition-all cursor-pointer"
                    >
                      Thực hành
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Study Advisor Mini Banner */}
            <div className="bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <img
                  className="w-10 h-10 rounded-full object-cover shadow-md flex-shrink-0"
                  alt="Mentor Hoàng Nam, CFA"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBu8spUG5FkPq-0hWrNzsdttkJ0xt6SBWtc1SQndcT4Ju9lP3ywSy2tJBFqmV9sqQ4gGdbvzRoM32moPmJsS0YJIWfiaiRPiH3xeknOPzQuakuL5x9cr4EdhCiS4eDMpTEVQvfHWU5RCBLKLOEOCuFygA_VfkkmkPd1ae0Y1zup2f_Ctfn3FYJfon4H6VrD8epNqex3oy5-lPPtmOtRfpYxa5XrCCJLzJCulgiR2XhJyLRWQk27qeSp"
                />
                <div>
                  <div className="text-xs font-bold text-surface-container-lowest">
                    Lời khuyên từ Mentor FES: Thầy Hoàng Nam, CFA
                  </div>
                  <div className="text-[10px] text-primary-fixed">
                    Senior Lecturer • Head of CFA Curriculum
                  </div>
                </div>
              </div>
              <p className="text-xs text-on-primary-container leading-relaxed font-light">
                “Minh Quân đang làm rất tốt ở mảng Ethics và Quants. Để đảm bảo vượt ngưỡng MPS 70% một cách an toàn, em nên dành trọn 2 ngày cuối tuần tới để dứt điểm phần Duration trong Fixed Income.”
              </p>
              <div className="pt-1 flex items-center justify-between text-xs">
                <span className="text-[11px] text-tertiary-fixed font-semibold">Cố vấn học tập 1-1</span>
                <button
                  onClick={() => navigateToTab('study-resources')}
                  className="text-tertiary-fixed-dim hover:text-surface-container-lowest font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  Đặt lịch coaching
                  <span className="material-symbols-outlined text-xs">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 6. Section: Recent Exam History Summary Table */}
        <div className="bg-surface-container-lowest rounded-xl p-6 sm:p-7 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-6 bg-tertiary-fixed-dim rounded-full"></div>
              <div>
                <h2 className="text-lg font-bold font-headline text-primary">
                  Lịch sử thi &amp; Đánh giá gần đây
                </h2>
                <p className="text-xs text-on-surface-variant">
                  Lưu trữ toàn bộ bài kiểm tra và báo cáo phân tích chi tiết
                </p>
              </div>
            </div>
            <button
              onClick={() => navigateToTab('exam-history')}
              className="text-xs font-bold text-secondary hover:text-primary transition-colors flex items-center gap-1 self-start sm:self-auto cursor-pointer"
            >
              Xem toàn bộ lịch sử thi
              <span className="material-symbols-outlined text-sm">open_in_new</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                  <th className="py-3 px-4 rounded-l-lg">Tên bài thi / Kiểm tra</th>
                  <th className="py-3 px-4">Ngày hoàn thành</th>
                  <th className="py-3 px-4">Thời gian</th>
                  <th className="py-3 px-4">Điểm số đạt</th>
                  <th className="py-3 px-4">Đánh giá chuẩn MPS</th>
                  <th className="py-3 px-4 text-right rounded-r-lg">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container text-xs">
                {/* Row 1 */}
                <tr className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="py-4 px-4 font-semibold text-primary">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary-fixed/40 text-primary flex items-center justify-center font-bold text-xs flex-shrink-0">
                        M01
                      </div>
                      <div>
                        <div className="font-bold text-primary">FES Mock Exam 01 (Full Session 1 &amp; 2)</div>
                        <div className="text-[10px] text-outline">180 câu hỏi • Chuẩn format CFA Institute</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-on-surface-variant font-medium">20/09/2026</td>
                  <td className="py-4 px-4 text-on-surface-variant font-mono">180 phút</td>
                  <td className="py-4 px-4">
                    <span className="font-mono text-sm font-black text-secondary">78.0%</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-secondary-fixed/50 text-secondary">
                      <span className="material-symbols-outlined text-xs">verified</span>
                      Pass Target (Đạt mục tiêu)
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={() => viewCompletedExamResult('fes-cfa-l1-mock-01')}
                      className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-primary hover:text-on-primary text-primary font-bold text-xs transition-colors cursor-pointer"
                    >
                      Xem kết quả
                    </button>
                  </td>
                </tr>

                {/* Row 2 */}
                <tr className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="py-4 px-4 font-semibold text-primary">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-tertiary-fixed/40 text-tertiary flex items-center justify-center font-bold text-xs flex-shrink-0">
                        ETH
                      </div>
                      <div>
                        <div className="font-bold text-primary">Ethics Topic Test - Level I Comprehensive</div>
                        <div className="text-[10px] text-outline">35 câu hỏi • Code of Ethics &amp; GIPS Overview</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-on-surface-variant font-medium">18/09/2026</td>
                  <td className="py-4 px-4 text-on-surface-variant font-mono">40 phút</td>
                  <td className="py-4 px-4">
                    <span className="font-mono text-sm font-black text-secondary">86.0%</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-secondary-fixed/50 text-secondary">
                      <span className="material-symbols-outlined text-xs">star</span>
                      Xuất sắc (&gt;80%)
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={() => viewCompletedExamResult('fes-cfa-l1-mock-01')}
                      className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-primary hover:text-on-primary text-primary font-bold text-xs transition-colors cursor-pointer"
                    >
                      Xem kết quả
                    </button>
                  </td>
                </tr>

                {/* Row 3 */}
                <tr className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="py-4 px-4 font-semibold text-primary">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-error-container text-on-error-container flex items-center justify-center font-bold text-xs flex-shrink-0">
                        FRA
                      </div>
                      <div>
                        <div className="font-bold text-primary">FRA Mid-Term Review Mock Exam</div>
                        <div className="text-[10px] text-outline">60 câu hỏi • Báo cáo tài chính chuyên sâu</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-on-surface-variant font-medium">12/09/2026</td>
                  <td className="py-4 px-4 text-on-surface-variant font-mono">90 phút</td>
                  <td className="py-4 px-4">
                    <span className="font-mono text-sm font-black text-error">64.0%</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-error-container text-on-error-container">
                      <span className="material-symbols-outlined text-xs">error</span>
                      Dưới ngưỡng MPS (Cần ôn)
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={() => viewCompletedExamResult('fes-cfa-l1-mock-01')}
                      className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-primary hover:text-on-primary text-primary font-bold text-xs transition-colors cursor-pointer"
                    >
                      Xem chi tiết
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 7. Footer Motivation Banner */}
        <div className="bg-surface-container-low rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left border border-surface-container/60">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-surface-container-lowest shadow-xs flex items-center justify-center flex-shrink-0 p-1.5 border border-surface-container">
              <FesLogo variant="mark" size="sm" />
            </div>
            <div>
              <div className="text-sm font-bold text-primary flex items-center gap-2">
                <span>Cam kết đầu ra CFA Level I từ FES Academy</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-secondary bg-secondary-fixed/30 px-2 py-0.5 rounded">
                  Guarantee
                </span>
              </div>
              <div className="text-xs text-on-surface-variant">
                Hoàn thành 100% Mock Exam với điểm TB &gt;70% để kích hoạt bảo hiểm đỗ kỳ thi tháng 11/2026.
              </div>
            </div>
          </div>
          <button
            onClick={() => navigateToTab('study-resources')}
            className="px-4 py-2 bg-surface-container-lowest text-primary font-semibold text-xs rounded-lg shadow-sm hover:shadow transition-shadow flex-shrink-0 cursor-pointer"
          >
            Quy chế đào tạo &amp; MPS Guarantee
          </button>
        </div>
      </div>
    </div>
  );
};
