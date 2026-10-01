import React from 'react';
import { useLms } from '../../context/LmsContext';

export const SubmitConfirmModal: React.FC = () => {
  const {
    isSubmitModalOpen,
    closeSubmitModal,
    submitExam,
    activeSession,
  } = useLms();

  if (!isSubmitModalOpen || !activeSession) return null;

  const total = activeSession.totalQuestions;
  const answeredCount = Object.keys(activeSession.answers).length;
  const unansweredCount = Math.max(0, total - answeredCount);
  const flaggedCount = activeSession.flaggedQuestionIds.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-surface-container-lowest text-on-surface w-full max-w-md rounded-2xl shadow-2xl border border-surface-container overflow-hidden flex flex-col zoom-in-95">
        {/* Header */}
        <div className="bg-primary text-on-primary px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-tertiary-fixed text-2xl">
              assignment_turned_in
            </span>
            <div>
              <h3 className="font-headline font-bold text-base leading-snug">
                Xác Nhận Nộp Bài Thi Mock Exam
              </h3>
              <p className="text-[11px] text-primary-fixed">Kiểm tra lại trạng thái bài làm trước khi nộp</p>
            </div>
          </div>
          <button
            onClick={closeSubmitModal}
            className="text-on-primary/70 hover:text-on-primary transition-colors"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Content & Metrics */}
        <div className="p-6 space-y-5">
          <div className="text-xs text-on-surface-variant leading-relaxed">
            Bạn đang làm bài <strong className="text-primary">{activeSession.examTitle}</strong>. Khi nộp bài, hệ thống sẽ chấm điểm tự động và xuất báo cáo phân tích năng lực chi tiết.
          </div>

          {/* 3 Metric Cards */}
          <div className="grid grid-cols-3 gap-3 text-center">
            {/* Answered */}
            <div className="p-3 bg-secondary-container/40 border border-secondary/20 rounded-xl flex flex-col items-center">
              <span className="text-[11px] font-bold uppercase text-secondary tracking-wider">Đã làm</span>
              <span className="text-2xl font-black font-headline text-primary mt-1">
                {answeredCount}
              </span>
              <span className="text-[10px] text-outline">/ {total} câu</span>
            </div>

            {/* Unanswered */}
            <div className="p-3 bg-error-container/40 border border-error/20 rounded-xl flex flex-col items-center">
              <span className="text-[11px] font-bold uppercase text-error tracking-wider">Chưa làm</span>
              <span className="text-2xl font-black font-headline text-error mt-1">
                {unansweredCount}
              </span>
              <span className="text-[10px] text-outline">câu hỏi</span>
            </div>

            {/* Flagged */}
            <div className="p-3 bg-tertiary-fixed/30 border border-tertiary-fixed-dim/40 rounded-xl flex flex-col items-center">
              <span className="text-[11px] font-bold uppercase text-tertiary-container tracking-wider">Gắn cờ</span>
              <span className="text-2xl font-black font-headline text-tertiary-container mt-1">
                {flaggedCount}
              </span>
              <span className="text-[10px] text-outline">cần xem lại</span>
            </div>
          </div>

          {unansweredCount > 0 && (
            <div className="p-3 bg-error-container/30 rounded-xl border border-error/20 flex items-start gap-2.5 text-xs text-on-error-container">
              <span className="material-symbols-outlined text-base text-error flex-shrink-0 mt-0.5">
                warning
              </span>
              <span>
                Bạn còn <strong>{unansweredCount} câu hỏi chưa trả lời</strong>. Trong kỳ thi CFA không có điểm trừ cho câu sai, hãy chọn đáp án cho tất cả câu hỏi trước khi nộp!
              </span>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="bg-surface-container-low px-6 py-4 flex items-center justify-between gap-3 border-t border-surface-container">
          <button
            onClick={closeSubmitModal}
            className="flex-1 py-2.5 px-4 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-bold text-xs transition-colors"
          >
            Tiếp tục làm bài (Continue Exam)
          </button>
          <button
            onClick={submitExam}
            className="flex-1 py-2.5 px-4 rounded-lg bg-tertiary-fixed-dim hover:bg-tertiary-fixed text-on-tertiary-fixed font-bold text-xs uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">check_circle</span>
            <span>Nộp bài ngay (Submit Exam)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
