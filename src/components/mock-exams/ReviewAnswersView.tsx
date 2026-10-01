import React, { useState } from 'react';
import { useLms } from '../../context/LmsContext';
import { Question } from '../../types';

export const ReviewAnswersView: React.FC = () => {
  const {
    latestResult,
    activeExam,
    mockExams,
    reviewFilter,
    setReviewFilter,
    selectedReviewQuestionIndex,
    setSelectedReviewQuestionIndex,
    bookmarks,
    toggleBookmark,
    notes,
    saveQuestionNote,
    navigateToView,
  } = useLms();

  const [noteInput, setNoteInput] = useState<string>('');
  const [isEditingNote, setIsEditingNote] = useState<boolean>(false);

  const exam = activeExam || mockExams.find((e) => e.id === latestResult?.examId) || mockExams[0];
  const allQuestions: Question[] = exam.questions;
  const userAnswers = latestResult?.answers || {};
  const flaggedIds = latestResult?.flaggedIds || [];

  // Filter questions based on selected filter
  const filteredQuestions = allQuestions.filter((q) => {
    const userAns = userAnswers[q.id];
    const isCorrect = userAns === q.correctAnswer;
    const isFlagged = flaggedIds.includes(q.id);
    const isUnanswered = !userAns;

    if (reviewFilter === 'incorrect') return userAns && !isCorrect;
    if (reviewFilter === 'correct') return isCorrect;
    if (reviewFilter === 'flagged') return isFlagged;
    if (reviewFilter === 'unanswered') return isUnanswered;
    return true; // 'all'
  });

  const activeQuestionList = filteredQuestions.length > 0 ? filteredQuestions : allQuestions;
  const safeIdx = Math.min(selectedReviewQuestionIndex, activeQuestionList.length - 1);
  const currentQ: Question = activeQuestionList[Math.max(0, safeIdx)] || allQuestions[0];

  const currentUserAns = userAnswers[currentQ.id];
  const isCorrect = currentUserAns === currentQ.correctAnswer;
  const isBookmarked = bookmarks.includes(currentQ.id);
  const currentNote = notes[currentQ.id] || '';

  const handleNext = () => {
    if (safeIdx < activeQuestionList.length - 1) {
      setSelectedReviewQuestionIndex(safeIdx + 1);
      setIsEditingNote(false);
    }
  };

  const handlePrev = () => {
    if (safeIdx > 0) {
      setSelectedReviewQuestionIndex(safeIdx - 1);
      setIsEditingNote(false);
    }
  };

  return (
    <div className="w-full bg-surface min-h-screen py-8 px-4 sm:px-6 max-w-[1360px] mx-auto space-y-6">
      {/* Top Bar with Navigation Back to Result & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-surface-container/60">
        <div>
          <button
            onClick={() => navigateToView('exam-result')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-secondary hover:text-primary transition-colors cursor-pointer mb-2"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Quay lại Báo cáo kết quả
          </button>
          <h1 className="text-xl sm:text-2xl font-black text-primary font-headline">
            Xem Lại Đáp Án &amp; Giải Thích Chi Tiết
          </h1>
          <p className="text-xs text-on-surface-variant mt-0.5">{exam.title}</p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              { id: 'all', label: 'Tất cả' },
              { id: 'incorrect', label: 'Câu sai' },
              { id: 'correct', label: 'Câu đúng' },
              { id: 'flagged', label: 'Đã gắn cờ' },
              { id: 'unanswered', label: 'Chưa làm' },
            ] as const
          ).map((f) => (
            <button
              key={f.id}
              onClick={() => {
                setReviewFilter(f.id);
                setSelectedReviewQuestionIndex(0);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                reviewFilter === f.id
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container border border-surface-container'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Review Section Split: Left Question & Solution, Right Navigator Palette */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Question Details & In-depth Explanation (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-sm border border-surface-container/60 space-y-6">
            {/* Question Header & Status Indicators */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-surface-container/60">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black px-2.5 py-1 rounded bg-primary text-surface-container-lowest uppercase tracking-wider">
                  CÂU HỎI {currentQ.questionNumber} / {allQuestions.length}
                </span>
                <span className="text-xs font-bold text-secondary">{currentQ.topic}</span>
                {currentUserAns ? (
                  isCorrect ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-secondary/10 text-secondary">
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      Chính xác
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-error/10 text-error">
                      <span className="material-symbols-outlined text-sm">cancel</span>
                      Không chính xác
                    </span>
                  )
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-surface-container-high text-outline">
                    <span className="material-symbols-outlined text-sm">help</span>
                    Chưa trả lời
                  </span>
                )}
              </div>

              {/* Bookmark & Note Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleBookmark(currentQ.id)}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer border ${
                    isBookmarked
                      ? 'bg-tertiary-fixed text-on-tertiary-fixed border-tertiary-fixed-dim'
                      : 'bg-surface-container-low text-on-surface-variant border-surface-container hover:text-on-surface'
                  }`}
                  title="Lưu vào danh sách đánh dấu"
                >
                  <span
                    className="material-symbols-outlined text-sm"
                    style={{ fontVariationSettings: isBookmarked ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    bookmark
                  </span>
                  <span>{isBookmarked ? 'Đã lưu' : 'Bookmark'}</span>
                </button>

                <button
                  onClick={() => {
                    setNoteInput(currentNote);
                    setIsEditingNote(!isEditingNote);
                  }}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer border ${
                    currentNote
                      ? 'bg-secondary/10 text-secondary border-secondary/30'
                      : 'bg-surface-container-low text-on-surface-variant border-surface-container hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">note_add</span>
                  <span>{currentNote ? 'Xem ghi chú' : 'Thêm ghi chú'}</span>
                </button>
              </div>
            </div>

            {/* Note Editor Area */}
            {isEditingNote && (
              <div className="p-4 bg-tertiary-fixed/20 border border-tertiary-fixed rounded-xl space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between text-xs font-bold text-tertiary-container">
                  <span>Ghi chú cá nhân cho câu hỏi này:</span>
                  <span className="text-[10px] text-outline">Tự động lưu vào Bookmarks &amp; Notes</span>
                </div>
                <textarea
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 text-xs bg-surface-container-lowest border border-tertiary-fixed rounded-lg outline-none text-on-surface focus:ring-1 focus:ring-secondary"
                  placeholder="Ghi lại lưu ý, bẫy trắc nghiệm hoặc công thức cần nhớ..."
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => setIsEditingNote(false)}
                    className="px-3 py-1 text-xs text-outline hover:text-on-surface"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={() => {
                      saveQuestionNote(currentQ.id, noteInput);
                      setIsEditingNote(false);
                    }}
                    className="px-4 py-1 bg-primary text-on-primary text-xs font-bold rounded-md hover:bg-primary-container transition-colors"
                  >
                    Lưu ghi chú
                  </button>
                </div>
              </div>
            )}

            {/* Question Text */}
            <div className="space-y-4 text-sm leading-relaxed text-on-surface">
              {currentQ.scenarioText && (
                <p className="text-justify font-normal text-on-surface">
                  {currentQ.scenarioText}
                </p>
              )}

              {/* Exhibit Table if available */}
              {currentQ.exhibit && (
                <div className="bg-surface-container-low rounded-xl p-4 flex flex-col gap-2 border border-surface-container">
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-secondary">
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm">table_chart</span>
                      {currentQ.exhibit.title}
                    </span>
                    {currentQ.exhibit.subtitle && (
                      <span className="text-[11px] font-normal text-outline lowercase">
                        {currentQ.exhibit.subtitle}
                      </span>
                    )}
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-surface-container-high text-primary font-bold">
                          {currentQ.exhibit.headers.map((h, i) => (
                            <th key={i} className="py-2 px-3">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-surface-container">
                        {currentQ.exhibit.rows.map((row, rIdx) => (
                          <tr key={rIdx} className="bg-surface-container-lowest">
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className="py-2 px-3 font-mono">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="p-3.5 rounded-lg bg-surface-container-high/60 text-primary font-bold text-sm border-l-4 border-primary">
                {currentQ.prompt}
              </div>
            </div>

            {/* Answer Options with Clear Right/Wrong Highlighting */}
            <div className="space-y-3 pt-2">
              {currentQ.options.map((opt) => {
                const isSelectedByStudent = currentUserAns === opt.id;
                const isTheCorrectAnswer = currentQ.correctAnswer === opt.id;

                let cardStyle = 'bg-surface-container border-transparent text-on-surface';
                let badge = null;

                if (isTheCorrectAnswer) {
                  cardStyle = 'bg-secondary/10 border-secondary text-primary font-semibold';
                  badge = (
                    <span className="text-[11px] font-extrabold uppercase px-2 py-0.5 rounded bg-secondary text-on-secondary flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">check</span>
                      Đáp án chính xác
                    </span>
                  );
                } else if (isSelectedByStudent && !isTheCorrectAnswer) {
                  cardStyle = 'bg-error-container/30 border-error text-error font-medium';
                  badge = (
                    <span className="text-[11px] font-extrabold uppercase px-2 py-0.5 rounded bg-error text-on-error flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">close</span>
                      Lựa chọn của bạn (Sai)
                    </span>
                  );
                }

                return (
                  <div
                    key={opt.id}
                    className={`p-4 rounded-xl border flex flex-col gap-1 transition-all ${cardStyle}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black uppercase tracking-wider">
                        Lựa chọn {opt.id}
                      </span>
                      {badge}
                    </div>
                    <div className="text-sm font-medium mt-0.5">{opt.text}</div>
                    {opt.subtext && (
                      <div className="text-xs text-on-surface-variant font-normal mt-1 leading-snug">
                        {opt.subtext}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Comprehensive Explanation & LOS Breakdown Box */}
            <div className="mt-6 p-5 bg-surface-container-low rounded-xl border border-secondary/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-secondary flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base">psychology</span>
                  Giải Thích Chi Tiết &amp; Căn Cứ Học Thuật
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary text-primary-fixed">
                  {currentQ.losCode || 'CFAI Curriculum'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-on-surface leading-relaxed">
                {currentQ.explanation}
              </p>
              <div className="pt-2 flex items-center justify-between text-[11px] text-outline border-t border-surface-container">
                <span>Tham chiếu: {currentQ.reading}</span>
                <span>Mức độ câu hỏi: {currentQ.difficulty || 'Medium'}</span>
              </div>
            </div>

            {/* Pagination / Prev / Next Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-surface-container">
              <button
                disabled={safeIdx === 0}
                onClick={handlePrev}
                className="px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-bold text-xs flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">arrow_back</span>
                <span>Câu trước</span>
              </button>

              <span className="text-xs font-bold text-on-surface-variant">
                {safeIdx + 1} / {activeQuestionList.length}
              </span>

              <button
                disabled={safeIdx === activeQuestionList.length - 1}
                onClick={handleNext}
                className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-bold text-xs flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>Câu tiếp theo</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Question Navigator Matrix (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-surface-container/60 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
                <span className="material-symbols-outlined text-secondary text-base">grid_view</span>
                Ma Trận Câu Hỏi ({activeQuestionList.length})
              </h3>
              <span className="text-[10px] font-semibold text-outline">
                Lọc: {reviewFilter.toUpperCase()}
              </span>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="flex items-center gap-1.5 text-secondary font-semibold">
                <span className="w-3 h-3 rounded bg-secondary"></span> Câu đúng
              </div>
              <div className="flex items-center gap-1.5 text-error font-semibold">
                <span className="w-3 h-3 rounded bg-error"></span> Câu sai
              </div>
              <div className="flex items-center gap-1.5 text-outline font-semibold">
                <span className="w-3 h-3 rounded bg-surface-container-high"></span> Chưa làm
              </div>
              <div className="flex items-center gap-1.5 text-tertiary-container font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-tertiary-fixed-dim"></span> Gắn cờ
              </div>
            </div>

            {/* Question Buttons Matrix */}
            <div className="grid grid-cols-6 gap-1.5 max-h-[420px] overflow-y-auto p-1 bg-surface-container-low rounded-xl">
              {activeQuestionList.map((q, idx) => {
                const isCur = idx === safeIdx;
                const userAns = userAnswers[q.id];
                const isRight = userAns === q.correctAnswer;
                const isFlag = flaggedIds.includes(q.id);

                let bgStyle = 'bg-surface-container-high text-on-surface-variant';
                if (userAns) {
                  bgStyle = isRight ? 'bg-secondary text-on-secondary' : 'bg-error text-on-error';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      setSelectedReviewQuestionIndex(idx);
                      setIsEditingNote(false);
                    }}
                    className={`relative h-9 rounded-lg text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${bgStyle} ${
                      isCur ? 'ring-2 ring-primary ring-offset-2 scale-105 z-10' : 'hover:opacity-90'
                    }`}
                  >
                    <span>{q.questionNumber}</span>
                    {isFlag && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-tertiary-fixed-dim shadow-xs"></span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Bottom Button to Result */}
            <button
              onClick={() => navigateToView('exam-result')}
              className="w-full py-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">assessment</span>
              <span>Trở về Trang Kết Quả</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
