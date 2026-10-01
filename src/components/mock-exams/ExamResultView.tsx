import React, { useState } from 'react';
import { useLms } from '../../context/LmsContext';
import { FesLogo } from '../common/FesLogo';

export const ExamResultView: React.FC = () => {
  const {
    latestResult,
    studentProfile,
    startReviewAnswers,
    openExamInstructions,
    mockExams,
    navigateToView,
    openLessonVideo,
    openCourseDetail,
  } = useLms();

  const [sortOption, setSortOption] = useState<'default' | 'accuracy' | 'weight'>('default');

  if (!latestResult) {
    return (
      <div className="p-12 text-center space-y-4">
        <h2 className="text-xl font-bold text-primary">Chưa có kết quả bài thi nào được chọn</h2>
        <button
          onClick={() => navigateToView('mock-library')}
          className="px-4 py-2 bg-primary text-on-primary rounded-lg text-xs font-bold"
        >
          Quay lại Thư viện Đề thi
        </button>
      </div>
    );
  }

  const result = latestResult;
  const exam = mockExams.find((e) => e.id === result.examId) || mockExams[0];

  // Sorting topics
  const sortedTopics = [...result.topicBreakdown].sort((a, b) => {
    if (sortOption === 'accuracy') {
      return a.percentage - b.percentage;
    }
    return 0;
  });

  return (
    <div className="flex flex-col w-full">
      <div className="max-w-[1360px] mx-auto w-full px-4 sm:px-6 py-8 space-y-10">
        {/* Top Breadcrumb & Metadata Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <nav className="flex items-center gap-2 text-xs text-on-surface-variant font-medium tracking-wide mb-2">
              <button
                onClick={() => navigateToView('mock-library')}
                className="hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">folder_open</span>
                Mock Exam Library
              </button>
              <span className="text-outline-variant">/</span>
              <span className="text-on-surface-variant">{result.examTitle}</span>
              <span className="text-outline-variant">/</span>
              <span className="text-primary font-bold">Báo cáo kết quả</span>
            </nav>
            <h1 className="font-headline text-2xl lg:text-3xl font-extrabold tracking-tight text-primary">
              Kết Quả Bài Thi: {result.examTitle}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="hidden sm:flex items-center pr-3 border-r border-surface-container/60">
              <FesLogo size="sm" showSubtitle subtitleText="Official Report" />
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-lowest shadow-sm text-xs font-medium text-on-surface-variant border border-surface-container/60">
              <span className="material-symbols-outlined text-[18px] text-secondary">calendar_today</span>
              <span>{result.completedAt}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-lowest shadow-sm text-xs font-medium text-on-surface-variant border border-surface-container/60">
              <span className="material-symbols-outlined text-[18px] text-secondary">schedule</span>
              <span>
                {result.timeSpentFormatted} <span className="text-outline">/ 4 giờ 30 phút</span>
              </span>
            </div>
          </div>
        </div>

        {/* Hero Scorecard Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Main High-Impact Score Banner (8 Cols) */}
          <div className="lg:col-span-8 bg-surface-container-lowest rounded-xl p-6 sm:p-8 lg:p-10 shadow-sm relative overflow-hidden flex flex-col justify-between border border-surface-container/60">
            <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-gradient-to-br from-secondary-fixed/30 to-primary-fixed/20 blur-3xl pointer-events-none"></div>

            <div>
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${
                    result.passedMps
                      ? 'bg-secondary text-on-secondary'
                      : 'bg-error text-on-error'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-secondary-fixed animate-pulse"></span>
                  {result.passedMps ? 'PASSED ESTIMATED MPS (70%)' : 'BELOW ESTIMATED MPS (70%)'}
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-secondary-container bg-primary px-3 py-1.5 rounded-lg">
                  <span className="material-symbols-outlined text-[16px] text-tertiary-fixed-dim">
                    workspace_premium
                  </span>
                  <span>Top {result.percentileRank}% so với 1,480 học viên FES Academy</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center mb-8">
                {/* Numerical Highlight */}
                <div className="md:col-span-5 flex flex-col">
                  <span className="text-xs uppercase tracking-wider font-bold text-on-surface-variant">
                    Tổng Điểm Thực Tế
                  </span>
                  <div className="flex items-baseline gap-3 mt-1">
                    <span className="text-6xl lg:text-7xl font-headline font-black text-primary tracking-tight">
                      {result.scorePercentage}%
                    </span>
                    <span
                      className={`text-base font-bold px-2.5 py-1 rounded-md ${
                        result.scorePercentage >= 70
                          ? 'text-secondary bg-secondary/10'
                          : 'text-error bg-error/10'
                      }`}
                    >
                      {result.scorePercentage >= 70 ? '+' : ''}
                      {result.scorePercentage - 70}% vs MPS
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-on-surface-variant mt-2 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-secondary text-[18px]">
                      fact_check
                    </span>
                    Đúng <strong className="text-on-surface">{result.correctCount}</strong> /{' '}
                    {result.totalQuestions} câu trắc nghiệm
                  </p>
                </div>

                {/* Visual Confidence Band Graphic */}
                <div className="md:col-span-7 bg-surface-container-low rounded-xl p-5 border border-surface-container">
                  <div className="flex items-center justify-between text-xs font-semibold text-on-surface mb-2">
                    <span>Khoảng Tin Cậy Kết Quả (Confidence Band)</span>
                    <span className="text-primary font-bold">
                      {result.confidenceBand.min}% - {result.confidenceBand.max}%
                    </span>
                  </div>

                  {/* Simulated CFA Institute Result graphic */}
                  <div className="relative w-full h-8 flex items-center my-1">
                    <div className="absolute inset-0 my-auto h-2 bg-surface-container-highest rounded-full w-full"></div>
                    {/* Confidence Band */}
                    <div
                      className="absolute my-auto h-3.5 bg-secondary/30 rounded-md"
                      style={{
                        left: `${result.confidenceBand.min}%`,
                        width: `${Math.max(4, result.confidenceBand.max - result.confidenceBand.min)}%`,
                      }}
                    ></div>
                    {/* MPS line at 70% */}
                    <div className="absolute my-auto h-6 w-0.5 bg-error z-10" style={{ left: '70%' }}></div>
                    <div
                      className="absolute -bottom-1 text-[10px] font-bold text-error transform -translate-x-1/2"
                      style={{ left: '70%' }}
                    >
                      MPS 70%
                    </div>
                    {/* Candidate Score marker */}
                    <div
                      className="absolute my-auto h-5 w-5 bg-primary rounded-full shadow-md z-20 flex items-center justify-center transform -translate-x-1/2"
                      style={{ left: `${result.scorePercentage}%` }}
                    >
                      <span className="w-2 h-2 rounded-full bg-tertiary-fixed-dim"></span>
                    </div>
                  </div>
                  <p className="text-[11px] text-on-surface-variant mt-3 leading-relaxed">
                    Khoảng tin cậy thể hiện mức độ nhất quán của bạn. Đường màu đỏ là mốc chuẩn tối thiểu (Minimum Passing Score).
                  </p>
                </div>
              </div>

              <div className="bg-surface-container-low/70 rounded-xl p-4.5 mb-8 border border-surface-container/60">
                <p className="text-sm text-on-surface leading-relaxed">
                  <strong className="font-bold text-primary">Chúc mừng {studentProfile.name}!</strong>{' '}
                  {result.passedMps ? (
                    <>
                      Bạn đã vượt qua mốc điểm chuẩn tối thiểu (Minimum Passing Score dự kiến 70%) với khoảng cách an toàn{' '}
                      <strong>+{result.scorePercentage - 70}%</strong>. Hãy tập trung cải thiện môn{' '}
                      <strong>Fixed Income</strong> và <strong>FRA</strong> để bứt phá lên nhóm an toàn tuyệt đối 85%+.
                    </>
                  ) : (
                    <>
                      Bạn đang tiệm cận mốc điểm chuẩn. Hãy rà soát lại các câu sai ở phần Fixed Income và FRA để nâng điểm số lên mức an toàn &gt;70%.
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Action CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-surface-container/50">
              <button
                onClick={() => startReviewAnswers(result.examId, 'all')}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-tertiary-fixed-dim hover:bg-tertiary-fixed text-on-tertiary-fixed font-headline font-bold text-sm tracking-wide shadow-md transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">assignment_turned_in</span>
                Xem &amp; Giải Thích Chi Tiết {result.totalQuestions} Câu
              </button>
              <button
                onClick={() => alert('Đang xuất báo cáo phân tích hiệu suất chi tiết bài thi (PDF)...')}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-primary text-on-primary font-headline font-semibold text-sm tracking-wide shadow-sm hover:bg-primary-container transition-all cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">download</span>
                Tải báo cáo PDF
              </button>
              <button
                onClick={() => openExamInstructions(exam)}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-lg text-secondary text-sm font-semibold hover:bg-surface-container transition-all cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">restart_alt</span>
                Làm lại bài thi này
              </button>
            </div>
          </div>

          {/* Right Column: Visual Performance Distribution (4 Cols) */}
          <div className="lg:col-span-4 bg-primary text-on-primary rounded-xl p-7 flex flex-col justify-between shadow-sm relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs uppercase font-bold tracking-wider text-primary-fixed">
                  Phân Bổ Thang Điểm
                </span>
                <span className="text-[11px] font-semibold bg-primary-container px-2 py-0.5 rounded text-primary-fixed-dim">
                  CFA L1 Cohort
                </span>
              </div>
              <h2 className="font-headline font-extrabold text-xl text-surface-container-lowest mb-1">
                Hiệu Suất Làm Bài
              </h2>
              <p className="text-xs text-on-primary-container mb-6">
                So sánh phân vị điểm với toàn bộ học viên làm đề thi này trong 30 ngày qua.
              </p>

              {/* Compact SVG Curve Histogram */}
              <div className="bg-primary-container/40 p-4 rounded-xl mb-6">
                <div className="h-28 w-full flex items-end justify-between gap-1.5 pt-4">
                  <div className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                    <div className="w-full bg-secondary/40 rounded-t h-[15%]"></div>
                    <span className="text-[9px] text-primary-fixed-dim">&lt;50</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                    <div className="w-full bg-secondary/50 rounded-t h-[35%]"></div>
                    <span className="text-[9px] text-primary-fixed-dim">60</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                    <div className="w-full bg-secondary/60 rounded-t h-[65%]"></div>
                    <span className="text-[9px] text-primary-fixed-dim">68</span>
                  </div>
                  {/* MPS Target bar */}
                  <div className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                    <div className="w-full bg-error rounded-t h-[75%]"></div>
                    <span className="text-[9px] text-error-container font-bold">70</span>
                  </div>
                  {/* Current user's tier */}
                  <div className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                    <div className="w-full bg-tertiary-fixed-dim rounded-t h-[92%] relative">
                      <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-bold bg-tertiary-fixed-dim text-on-tertiary-fixed px-1 rounded">
                        Bạn
                      </span>
                    </div>
                    <span className="text-[9px] text-tertiary-fixed-dim font-bold">
                      {result.scorePercentage}
                    </span>
                  </div>
                  <div className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                    <div className="w-full bg-secondary/50 rounded-t h-[40%]"></div>
                    <span className="text-[9px] text-primary-fixed-dim">85</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                    <div className="w-full bg-secondary/30 rounded-t h-[18%]"></div>
                    <span className="text-[9px] text-primary-fixed-dim">90+</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[10px] text-primary-fixed-dim pt-2 border-t-0">
                  <span>Thấp nhất: 42%</span>
                  <span>Cao nhất: 91%</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-primary-fixed">Tốc độ làm bài</span>
                  <span className="font-bold text-surface-container-lowest">
                    {result.avgSecondsPerQuestion} giây / câu (Nhanh)
                  </span>
                </div>
                <div className="w-full bg-primary-container h-1.5 rounded-full overflow-hidden">
                  <div className="bg-secondary-fixed h-full rounded-full" style={{ width: '94%' }}></div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-on-primary-container">
                  <span>Định mức CFA tiêu chuẩn: 90 giây</span>
                  <span className="text-tertiary-fixed-dim font-bold">+5 giây dự phòng</span>
                </div>
              </div>
            </div>

            <div className="pt-6 relative z-10">
              <div className="p-3 bg-primary-container/70 rounded-lg flex items-center gap-3">
                <span className="material-symbols-outlined text-tertiary-fixed-dim text-2xl">verified</span>
                <div className="text-xs">
                  <p className="font-bold text-surface-container-lowest">Độ tin cậy đề thi: 99.4%</p>
                  <p className="text-[11px] text-on-primary-container">
                    Được chuẩn hóa theo cấu trúc đề thi CFA 2026
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Breakdown Stats (4 key cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Stat 1: Correct */}
          <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm flex items-center justify-between border border-surface-container/60">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Số Câu Đúng
              </span>
              <div className="text-3xl font-headline font-black text-secondary mt-1">
                {result.correctCount}{' '}
                <span className="text-sm font-semibold text-on-surface-variant">
                  / {result.totalQuestions}
                </span>
              </div>
              <span className="inline-block mt-1 text-xs font-bold text-secondary bg-secondary/10 px-2 py-0.5 rounded">
                {Math.round((result.correctCount / result.totalQuestions) * 100)}% tỷ lệ chính xác
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[26px]">check_circle</span>
            </div>
          </div>

          {/* Stat 2: Incorrect */}
          <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm flex items-center justify-between border border-surface-container/60">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Số Câu Sai
              </span>
              <div className="text-3xl font-headline font-black text-error mt-1">
                {result.incorrectCount}{' '}
                <span className="text-sm font-semibold text-on-surface-variant">
                  / {result.totalQuestions}
                </span>
              </div>
              <span className="inline-block mt-1 text-xs font-bold text-error bg-error/10 px-2 py-0.5 rounded">
                {Math.round((result.incorrectCount / result.totalQuestions) * 100)}% cần xem lại
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-error-container/40 flex items-center justify-center text-error">
              <span className="material-symbols-outlined text-[26px]">cancel</span>
            </div>
          </div>

          {/* Stat 3: Unanswered / Skipped */}
          <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm flex items-center justify-between border border-surface-container/60">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Bỏ Qua / Chưa Làm
              </span>
              <div className="text-3xl font-headline font-black text-on-surface mt-1">
                {result.unansweredCount}{' '}
                <span className="text-sm font-semibold text-on-surface-variant">
                  / {result.totalQuestions}
                </span>
              </div>
              <span className="inline-block mt-1 text-xs font-bold text-on-surface-variant bg-surface-container px-2 py-0.5 rounded">
                {Math.round((result.unansweredCount / result.totalQuestions) * 100)}% chưa đánh dấu
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-on-surface-variant">
              <span className="material-symbols-outlined text-[26px]">help_outline</span>
            </div>
          </div>

          {/* Stat 4: Average Time per Question */}
          <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm flex items-center justify-between border border-surface-container/60">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Thời Gian Trung Bình
              </span>
              <div className="text-3xl font-headline font-black text-primary mt-1">
                {result.avgSecondsPerQuestion}{' '}
                <span className="text-sm font-semibold text-on-surface-variant">giây/câu</span>
              </div>
              <span className="inline-block mt-1 text-xs font-bold text-primary bg-primary-fixed/40 px-2 py-0.5 rounded">
                Chuẩn CFA: 90s
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary-fixed/40 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[26px]">timer</span>
            </div>
          </div>
        </div>

        {/* Interactive Topic Filter Badges */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-primary">Lọc xem câu hỏi nhanh:</span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => startReviewAnswers(result.examId, 'incorrect')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-error-container/60 hover:bg-error-container text-on-error-container text-xs font-bold transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">error</span>
                {result.incorrectCount} câu làm sai
              </button>
              <button
                onClick={() => startReviewAnswers(result.examId, 'unanswered')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-xs font-bold transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">visibility_off</span>
                {result.unansweredCount} câu chưa trả lời
              </button>
              <button
                onClick={() => startReviewAnswers(result.examId, 'flagged')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-tertiary-fixed hover:bg-tertiary-fixed-dim text-on-tertiary-fixed text-xs font-bold transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">flag</span>
                {result.flaggedIds.length} câu đã gắn cờ
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant">
            <span className="w-3 h-3 rounded-sm bg-secondary inline-block"></span> Đạt hoặc Vượt MPS
            <span className="w-3 h-3 rounded-sm bg-tertiary-fixed-dim inline-block ml-2"></span> Cận MPS
            <span className="w-3 h-3 rounded-sm bg-error inline-block ml-2"></span> Dưới MPS (Cần ôn)
          </div>
        </div>

        {/* Phân Tích Chi Tiết Theo 10 Topic CFA */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden border border-surface-container/60" id="topic-breakdown">
          <div className="p-6 bg-surface-container-low/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-container/60">
            <div>
              <h2 className="font-headline font-extrabold text-xl text-primary">
                Phân Tích Chi Tiết Theo 10 Topic CFA
              </h2>
              <p className="text-xs text-on-surface-variant mt-1">
                So sánh trực tiếp kết quả của bạn với Mốc Điểm Chuẩn Tối Thiểu (Target MPS: 70%)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-on-surface-variant">Sắp xếp theo:</span>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as any)}
                className="text-xs font-semibold bg-surface-container-lowest text-on-surface rounded-lg px-3 py-1.5 outline-none shadow-sm cursor-pointer border border-surface-container"
              >
                <option value="default">Thứ tự Topic chuẩn CFA</option>
                <option value="accuracy">Độ chính xác (Từ thấp đến cao)</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-surface-container text-on-surface-variant font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-4 px-6">Topic Name</th>
                  <th className="py-4 px-4 text-center">Weight in Exam</th>
                  <th className="py-4 px-6 min-w-[220px]">Your Accuracy &amp; Benchmark</th>
                  <th className="py-4 px-4 text-center">Score Ratio</th>
                  <th className="py-4 px-4 text-center">MPS Target</th>
                  <th className="py-4 px-6 text-right">Assessment &amp; Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                {sortedTopics.map((item, idx) => {
                  const isDanger = item.percentage < 65;
                  const isWarning = item.percentage >= 65 && item.percentage < 70;
                  return (
                    <tr
                      key={idx}
                      className={`hover:bg-surface-container-low/40 transition-colors ${
                        isDanger ? 'bg-error-container/20' : isWarning ? 'bg-error-container/10' : ''
                      }`}
                    >
                      <td className="py-4 px-6">
                        <div className={`font-bold text-sm ${isDanger ? 'text-error flex items-center gap-1.5' : 'text-primary'}`}>
                          {isDanger && <span className="material-symbols-outlined text-[18px]">warning</span>}
                          {item.topic}
                        </div>
                        <div className="text-[11px] text-on-surface-variant mt-0.5">{item.subtopics}</div>
                      </td>
                      <td className="py-4 px-4 text-center font-semibold text-on-surface">{item.weight}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-between text-xs font-bold mb-1">
                          <span className={isDanger ? 'text-error font-extrabold' : 'text-secondary'}>
                            {item.percentage}%
                          </span>
                          <span className="text-outline-variant font-normal">Target: 70%</span>
                        </div>
                        <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden relative">
                          <div className="absolute left-[70%] top-0 bottom-0 w-0.5 bg-on-surface-variant/40 z-10"></div>
                          <div
                            className={`h-full rounded-full ${
                              isDanger ? 'bg-error' : isWarning ? 'bg-tertiary-fixed-dim' : 'bg-secondary'
                            }`}
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center font-bold text-on-surface">
                        {item.correct}/{item.total}
                      </td>
                      <td className="py-4 px-4 text-center font-semibold text-outline">70%</td>
                      <td className="py-4 px-6 text-right">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[11px] ${
                            isDanger
                              ? 'bg-error text-on-error shadow-sm'
                              : isWarning
                              ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                              : 'bg-secondary/10 text-secondary'
                          }`}
                        >
                          {item.statusBadge}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Personalized Study Plan */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-headline font-extrabold text-xl text-primary">
                Gợi Ý Kế Hoạch Ôn Tập Tiếp Theo (Personalized Study Plan)
              </h2>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Hệ thống AI của FES Academy tự động tối ưu hóa lộ trình dựa trên {result.incorrectCount} lỗi sai trong đề thi.
              </p>
            </div>
            <button
              onClick={() => navigateToView('analytics')}
              className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-secondary hover:underline cursor-pointer"
            >
              Xem toàn bộ báo cáo phân tích
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Action Card A: Fixed Income */}
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden border border-surface-container/60">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-error-container/60 text-error flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[28px]">trending_down</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-error bg-error/10 px-2 py-0.5 rounded">
                      Ưu tiên khẩn cấp #1
                    </span>
                    <span className="text-xs text-on-surface-variant font-medium">Fixed Income (59%)</span>
                  </div>
                  <h3 className="font-headline font-bold text-base text-primary mt-1.5">
                    Yield curve spread measures &amp; Spot rates
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
                    Bạn sai 5/7 câu về tính toán Z-spread, OAS và chiết khấu dòng tiền bằng Zero-coupon rates. Cần xem lại Reading 44 trước khi sang Mock 02.
                  </p>
                </div>
              </div>
              <div className="mt-6 pt-4 flex flex-wrap items-center justify-between gap-3 border-t border-surface-container/60">
                <span className="text-xs font-semibold text-secondary flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">menu_book</span>
                  Luyện 30 câu hỏi sai tương tự
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openCourseDetail('cfa-l1-fixed-income')}
                    className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                    type="button"
                    title="Xem khóa học Fixed Income"
                  >
                    <span className="material-symbols-outlined text-sm">smart_display</span>
                    <span>Video Fixed Income</span>
                  </button>
                  <button
                    onClick={() => startReviewAnswers(result.examId, 'incorrect')}
                    className="px-4 py-2 rounded-lg bg-primary text-on-primary text-xs font-bold hover:bg-primary-container transition-all flex items-center gap-1.5 cursor-pointer"
                    type="button"
                  >
                    <span>Ôn câu sai</span>
                    <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Action Card B: FRA */}
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden border border-surface-container/60">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-tertiary-fixed/60 text-tertiary-container flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[28px]">account_balance</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-tertiary-container bg-tertiary-fixed/40 px-2 py-0.5 rounded">
                      Cần củng cố #2
                    </span>
                    <span className="text-xs text-on-surface-variant font-medium">
                      Financial Reporting &amp; Analysis (68%)
                    </span>
                  </div>
                  <h3 className="font-headline font-bold text-base text-primary mt-1.5">
                    Impairment &amp; Revenue Recognition under IFRS vs US GAAP
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
                    Điểm mất tập trung vào sự khác biệt giữa IFRS 15 5-step model, Gross vs Net reporting và phân loại thuê tài sản theo IFRS 16.
                  </p>
                </div>
              </div>
              <div className="mt-6 pt-4 flex items-center justify-between gap-3 border-t border-surface-container/60">
                <span className="text-xs font-semibold text-secondary flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">play_circle</span>
                  Bài giảng video 38 phút (Tiếp tục từ 24:35)
                </span>
                <button
                  onClick={() => openLessonVideo('cfa-l1-fra', 'fra-m01-l03', 1475)}
                  className="px-4 py-2 rounded-lg bg-tertiary-fixed-dim hover:bg-tertiary-fixed text-on-tertiary-fixed text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  type="button"
                >
                  <span className="material-symbols-outlined text-sm">play_arrow</span>
                  <span>Xem bài giảng</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Instructor Mentorship Notes Card */}
        <div className="bg-surface-container-low rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-center gap-6 border border-surface-container/60">
          <div className="flex items-center gap-4 shrink-0">
            <img
              className="w-14 h-14 rounded-full object-cover shadow-sm"
              alt="Thầy Hoàng Nam, CFA"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAmzJZcaVtq_o8UsL4duTw0bBG48aKCIDbOLS8rme4SEu-eVXMSFdfaXv-ONRv-7UHFClJxPqvEp7d4ISnwEDqPy2aCmP_JNl7smlerZKc1QYVktweYL5nenXAnemD3_gPSx29_G3Ihpksp6P-XL54PZ3txzbNEBFmKkJOSFtumA_G6gXu-A-wBIkaM5EUjta1QcwDI2A_dxx-5W14CYuC74yEAER92z6gy969woq-0IWwgb3lYjRN2"
            />
            <div>
              <h4 className="font-headline font-bold text-sm text-primary">Thầy Hoàng Nam, CFA</h4>
              <p className="text-xs text-secondary font-semibold">Lead CFA Instructor @ FES Academy</p>
              <span className="text-[10px] text-outline">Nhận xét trực tiếp cho học viên</span>
            </div>
          </div>
          <div className="flex-1 min-w-0 md:pl-6 text-xs text-on-surface leading-relaxed">
            <p>
              "{studentProfile.name} xử lý bài thi thời gian {result.timeSpentFormatted} rất tốt, chứng tỏ khả năng phản xạ công thức đã vững. Điểm {result.scorePercentage}% là tiền đề chắc chắn để qua kỳ thi {studentProfile.targetExamDate}. Hãy duy trì nhịp độ giải 1 đề Mock/tuần và dành 2 ngày tới xử lý triệt để các câu sai ở Fixed Income!"
            </p>
          </div>
          <button
            onClick={() => alert('Đã gửi tin nhắn đến Mentor Thầy Hoàng Nam, CFA.')}
            className="shrink-0 px-4 py-2.5 rounded-lg bg-surface-container-lowest text-primary text-xs font-bold shadow-sm hover:bg-surface-container transition-all flex items-center gap-1.5 cursor-pointer border border-surface-container"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">chat</span>
            Đặt câu hỏi cho Mentor
          </button>
        </div>
      </div>
    </div>
  );
};
