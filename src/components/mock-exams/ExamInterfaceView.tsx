import React, { useState } from 'react';
import { useLms } from '../../context/LmsContext';
import { Question } from '../../types';
import { FesLogo } from '../common/FesLogo';

export const ExamInterfaceView: React.FC = () => {
  const {
    activeSession,
    activeExam,
    mockExams,
    selectAnswer,
    clearAnswer,
    toggleFlag,
    goToQuestion,
    nextQuestion,
    prevQuestion,
    togglePauseTimer,
    setFontSize,
    openSubmitModal,
    toggleCalculator,
    toggleScratchpad,
    navigateToView,
  } = useLms();

  const [paletteFilter, setPaletteFilter] = useState<'all' | 'unanswered' | 'flagged'>('all');

  if (!activeSession) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-xl font-bold text-primary">Không tìm thấy bài thi đang làm</h2>
        <button
          onClick={() => navigateToView('mock-library')}
          className="px-4 py-2 bg-primary text-on-primary rounded-lg text-xs font-bold"
        >
          Quay lại Thư viện
        </button>
      </div>
    );
  }

  const exam = activeExam || mockExams.find((e) => e.id === activeSession.examId) || mockExams[0];
  const questions: Question[] = exam.questions;
  const currentIdx = activeSession.currentQuestionIndex;
  const currentQuestion: Question = questions[currentIdx] || questions[0];

  // Timer format (HH:MM:SS)
  const formatTimer = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(activeSession.answers).length;
  const totalCount = activeSession.totalQuestions;
  const unansweredCount = Math.max(0, totalCount - answeredCount);
  const flaggedCount = activeSession.flaggedQuestionIds.length;
  const isCurrentFlagged = activeSession.flaggedQuestionIds.includes(currentQuestion.id);
  const currentSelectedOpt = activeSession.answers[currentQuestion.id];

  // Font size class mapping
  const fontClass =
    activeSession.fontSizeLevel === 'large'
      ? 'text-base'
      : activeSession.fontSizeLevel === 'extra-large'
      ? 'text-lg'
      : 'text-sm md:text-base';

  return (
    <div className="w-full bg-surface min-h-screen flex flex-col items-center justify-start p-3 sm:p-6">
      <div className="w-full max-w-[1440px] mx-auto flex flex-col gap-5">
        {/* Exam Header */}
        <header className="w-full bg-surface-container-lowest rounded-xl shadow-sm p-4 flex flex-col lg:flex-row items-center justify-between gap-4 border border-surface-container/60">
          {/* Logo & Title */}
          <div className="flex items-center gap-3.5 w-full lg:w-auto">
            <div
              onClick={() => navigateToView('dashboard')}
              className="cursor-pointer flex items-center pr-2"
              title="Về Dashboard (Bài làm vẫn được lưu)"
            >
              <FesLogo size="sm" />
            </div>
            <div className="flex flex-col min-w-0 border-l border-surface-container/60 pl-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-secondary bg-secondary-fixed/30 px-2 py-0.5 rounded">
                  CFA Level I Realistic Simulation
                </span>
                <span className="text-xs text-on-surface-variant font-medium">Session 1 / 2</span>
              </div>
              <h1 className="text-sm md:text-base font-bold text-primary truncate max-w-xl">
                {activeSession.examTitle}
              </h1>
            </div>
          </div>

          {/* Center: Live Timer & Font Controls */}
          <div className="flex items-center justify-center gap-2.5 bg-surface-container-low px-4 py-2 rounded-xl flex-wrap">
            {/* Countdown Badge */}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg shadow-sm transition-all ${
                activeSession.remainingSeconds < 600
                  ? 'bg-error text-white animate-pulse'
                  : 'bg-primary text-surface-container-lowest'
              }`}
            >
              <span
                className="material-symbols-outlined text-tertiary-fixed text-lg animate-pulse"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                timer
              </span>
              <span className="text-xs uppercase text-primary-fixed-dim font-medium tracking-wide">
                Thời gian:
              </span>
              <span className="font-mono text-base font-bold tracking-wider text-tertiary-fixed" id="countdown-timer">
                {formatTimer(activeSession.remainingSeconds)}
              </span>
            </div>

            {/* Pause button */}
            <button
              onClick={togglePauseTimer}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeSession.isPaused
                  ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                  : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
              }`}
              type="button"
              title={activeSession.isPaused ? 'Tiếp tục làm bài' : 'Tạm dừng đồng hồ'}
            >
              <span className="material-symbols-outlined text-base">
                {activeSession.isPaused ? 'play_arrow' : 'pause_circle'}
              </span>
              <span className="hidden sm:inline">
                {activeSession.isPaused ? 'Tiếp tục' : 'Tạm dừng'}
              </span>
            </button>

            {/* Font Sizing Controls */}
            <div className="flex items-center bg-surface-container rounded-lg p-0.5">
              <button
                onClick={() => setFontSize('normal')}
                className={`w-7 h-7 flex items-center justify-center rounded text-xs font-bold transition-colors cursor-pointer ${
                  activeSession.fontSizeLevel === 'normal'
                    ? 'bg-surface-container-lowest text-primary shadow-xs'
                    : 'text-on-surface-variant hover:bg-surface-container-lowest'
                }`}
                title="Cỡ chữ tiêu chuẩn"
                type="button"
              >
                A-
              </button>
              <button
                onClick={() =>
                  setFontSize(
                    activeSession.fontSizeLevel === 'normal'
                      ? 'large'
                      : activeSession.fontSizeLevel === 'large'
                      ? 'extra-large'
                      : 'extra-large'
                  )
                }
                className={`w-7 h-7 flex items-center justify-center rounded text-xs font-bold transition-colors cursor-pointer ${
                  activeSession.fontSizeLevel !== 'normal'
                    ? 'bg-surface-container-lowest text-primary shadow-xs'
                    : 'text-on-surface-variant hover:bg-surface-container-lowest'
                }`}
                title="Tăng cỡ chữ"
                type="button"
              >
                A+
              </button>
            </div>
          </div>

          {/* Right: Progress & Submit Button */}
          <div className="flex items-center justify-between lg:justify-end gap-3.5 w-full lg:w-auto">
            <div className="text-right">
              <div className="text-xs text-on-surface-variant font-medium">Tiến độ bài thi</div>
              <div className="text-sm font-extrabold text-primary flex items-center gap-1.5">
                <span>Câu {currentQuestion.questionNumber} / {totalCount}</span>
                <span className="text-xs font-semibold text-secondary">
                  ({Math.round((answeredCount / totalCount) * 100)}%)
                </span>
              </div>
            </div>
            <button
              onClick={openSubmitModal}
              className="px-4 py-2.5 rounded-lg bg-tertiary-fixed-dim text-on-tertiary-fixed font-bold text-xs uppercase tracking-wider shadow-sm hover:brightness-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-base">assignment_turned_in</span>
              <span>Nộp bài thi</span>
            </button>
          </div>
        </header>

        {/* Exam Main Content Grid */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: Active Question Container (8 Cols) */}
          <main className="lg:col-span-8 flex flex-col gap-4">
            <div className="bg-surface-container-lowest rounded-xl shadow-sm p-6 flex flex-col gap-6 border border-surface-container/60">
              {/* Question Meta Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-surface-container/60">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold px-2.5 py-1 rounded bg-primary text-surface-container-lowest uppercase tracking-wider">
                      CÂU HỎI {currentQuestion.questionNumber} / {totalCount}
                    </span>
                    <span className="text-xs font-semibold text-on-surface-variant">
                      {currentQuestion.topic}
                    </span>
                  </div>
                  <span className="text-xs text-outline font-medium">
                    {currentQuestion.reading} ({currentQuestion.subtopic})
                  </span>
                </div>

                {/* Question Tools */}
                <div className="flex items-center gap-2">
                  {/* Flag button */}
                  <button
                    onClick={() => toggleFlag(currentQuestion.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs shadow-sm transition-colors cursor-pointer ${
                      isCurrentFlagged
                        ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                        : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                    }`}
                    type="button"
                  >
                    <span
                      className="material-symbols-outlined text-sm"
                      style={{ fontVariationSettings: isCurrentFlagged ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      flag
                    </span>
                    <span>{isCurrentFlagged ? 'Đã gắn cờ (Flagged)' : 'Gắn cờ (Flag)'}</span>
                  </button>

                  {/* Scratchpad button */}
                  <button
                    onClick={toggleScratchpad}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container text-on-surface-variant text-xs font-semibold hover:text-on-surface transition-colors cursor-pointer"
                    type="button"
                    title="Bảng nháp"
                  >
                    <span className="material-symbols-outlined text-sm">edit_note</span>
                    <span className="hidden sm:inline">Nháp</span>
                  </button>

                  {/* BA II Plus Financial Calculator */}
                  <button
                    onClick={toggleCalculator}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container text-on-surface-variant text-xs font-semibold hover:text-primary transition-colors cursor-pointer"
                    type="button"
                    title="Mở máy tính tài chính BA II Plus"
                  >
                    <span className="material-symbols-outlined text-sm">calculate</span>
                    <span className="hidden sm:inline">BA II Plus</span>
                  </button>
                </div>
              </div>

              {/* Question Text & Exhibits */}
              <section className={`flex flex-col gap-4 text-on-surface leading-relaxed ${fontClass}`}>
                {currentQuestion.scenarioText && (
                  <p className="text-justify font-normal text-on-surface">
                    {currentQuestion.scenarioText}
                  </p>
                )}

                {/* Exhibit Table if present */}
                {currentQuestion.exhibit && (
                  <div className="bg-surface-container-low rounded-xl p-4 flex flex-col gap-2 border border-surface-container">
                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-secondary">
                      <span className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm">table_chart</span>
                        {currentQuestion.exhibit.title}
                      </span>
                      {currentQuestion.exhibit.subtitle && (
                        <span className="text-[11px] font-normal text-outline lowercase">
                          {currentQuestion.exhibit.subtitle}
                        </span>
                      )}
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs md:text-sm">
                        <thead>
                          <tr className="bg-surface-container-high text-primary font-bold">
                            {currentQuestion.exhibit.headers.map((h, i) => (
                              <th
                                key={i}
                                className={`py-2.5 px-3 ${i === 0 ? 'rounded-l-lg' : ''} ${
                                  i === currentQuestion.exhibit!.headers.length - 1
                                    ? 'rounded-r-lg text-right'
                                    : i > 0
                                    ? 'text-right'
                                    : ''
                                }`}
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-container">
                          {currentQuestion.exhibit.rows.map((row, rIdx) => (
                            <tr key={rIdx} className="bg-surface-container-lowest">
                              {row.map((cell, cIdx) => (
                                <td
                                  key={cIdx}
                                  className={`py-2 px-3 ${
                                    cIdx === 0
                                      ? 'font-semibold text-primary'
                                      : 'text-right font-mono ' +
                                        (cell !== '—' ? 'font-bold text-primary' : 'text-outline')
                                  }`}
                                >
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

                {/* Prompt box */}
                <div className="p-3.5 rounded-lg bg-surface-container-high/60 text-primary font-semibold text-sm md:text-base border-l-4 border-primary">
                  {currentQuestion.prompt}
                </div>
              </section>

              {/* Radio Options List */}
              <form className="flex flex-col gap-3 mt-1">
                {currentQuestion.options.map((opt) => {
                  const isChecked = currentSelectedOpt === opt.id;
                  return (
                    <label
                      key={opt.id}
                      onClick={() => selectAnswer(currentQuestion.id, opt.id)}
                      className={`relative flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all border ${
                        isChecked
                          ? 'bg-primary-fixed/20 border-primary shadow-sm'
                          : 'bg-surface-container hover:bg-surface-container-high border-transparent'
                      }`}
                    >
                      <input
                        checked={isChecked}
                        onChange={() => selectAnswer(currentQuestion.id, opt.id)}
                        className="mt-1 h-4 w-4 accent-primary text-primary focus:ring-0 cursor-pointer"
                        name="cfa-answer"
                        type="radio"
                        value={opt.id}
                      />
                      <div className="flex flex-col gap-0.5">
                        <span
                          className={`text-xs font-black uppercase tracking-wider ${
                            isChecked ? 'text-primary' : 'text-on-surface-variant'
                          }`}
                        >
                          Lựa chọn {opt.id}
                        </span>
                        <span
                          className={`text-sm md:text-base ${
                            isChecked ? 'font-semibold text-primary' : 'text-on-surface font-medium'
                          }`}
                        >
                          {opt.text}
                        </span>
                        {opt.subtext && (
                          <span className="text-xs text-on-surface-variant font-normal mt-1 leading-snug">
                            {opt.subtext}
                          </span>
                        )}
                      </div>
                    </label>
                  );
                })}
              </form>

              {/* Navigation Action Footer */}
              <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-surface-container">
                <div className="flex items-center gap-2">
                  <button
                    disabled={currentIdx === 0}
                    onClick={prevQuestion}
                    className="px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs transition-colors flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-base">arrow_back</span>
                    <span>Câu trước (Previous)</span>
                  </button>
                  {currentSelectedOpt && (
                    <button
                      onClick={() => clearAnswer(currentQuestion.id)}
                      className="px-3 py-2 rounded-lg text-outline hover:text-error text-xs font-medium transition-colors cursor-pointer"
                      type="button"
                    >
                      Xóa lựa chọn (Clear Answer)
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={nextQuestion}
                    disabled={currentIdx === totalCount - 1}
                    className="px-5 py-2 rounded-lg bg-primary text-on-primary font-bold text-xs uppercase tracking-wider shadow-sm hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    type="button"
                  >
                    <span>Câu tiếp theo (Next)</span>
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>
          </main>

          {/* Right Column: Question Palette (Aside - 4 Cols) */}
          <aside className="lg:col-span-4 flex flex-col gap-4">
            <div className="bg-surface-container-lowest rounded-xl shadow-sm p-5 flex flex-col gap-4 border border-surface-container/60">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-extrabold text-primary uppercase tracking-wider flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-lg">grid_view</span>
                  Bảng câu hỏi (Palette)
                </h2>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-surface-container text-on-surface-variant">
                  Tổng: {totalCount} câu
                </span>
              </div>

              {/* Status Summary Counts */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-surface-container-low">
                  <span className="w-3.5 h-3.5 rounded bg-primary flex-shrink-0"></span>
                  <span className="text-on-surface-variant font-medium">
                    Đã trả lời: <strong className="text-primary font-bold">{answeredCount}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-surface-container-low">
                  <span className="w-3.5 h-3.5 rounded bg-surface-container-highest flex-shrink-0"></span>
                  <span className="text-on-surface-variant font-medium">
                    Chưa làm: <strong className="text-primary font-bold">{unansweredCount}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-surface-container-low">
                  <span className="w-3.5 h-3.5 rounded bg-tertiary-fixed-dim flex-shrink-0"></span>
                  <span className="text-on-surface-variant font-medium">
                    Gắn cờ: <strong className="text-tertiary-container font-bold">{flaggedCount}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-surface-container-low">
                  <span className="w-3.5 h-3.5 rounded bg-secondary-fixed flex-shrink-0"></span>
                  <span className="text-on-surface-variant font-medium">
                    Đang chọn: <strong className="text-secondary font-bold">#{currentQuestion.questionNumber}</strong>
                  </span>
                </div>
              </div>

              {/* Filter Tabs for Palette */}
              <div className="flex items-center gap-1.5 p-1 rounded-lg bg-surface-container-low">
                <button
                  onClick={() => setPaletteFilter('all')}
                  className={`flex-1 py-1 text-center rounded text-xs font-bold transition-all cursor-pointer ${
                    paletteFilter === 'all'
                      ? 'bg-surface-container-lowest text-primary shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                  type="button"
                >
                  Tất cả ({totalCount})
                </button>
                <button
                  onClick={() => setPaletteFilter('unanswered')}
                  className={`flex-1 py-1 text-center rounded text-xs font-semibold transition-all cursor-pointer ${
                    paletteFilter === 'unanswered'
                      ? 'bg-surface-container-lowest text-primary shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                  type="button"
                >
                  Chưa làm ({unansweredCount})
                </button>
                <button
                  onClick={() => setPaletteFilter('flagged')}
                  className={`flex-1 py-1 text-center rounded text-xs font-semibold transition-all cursor-pointer ${
                    paletteFilter === 'flagged'
                      ? 'bg-surface-container-lowest text-primary shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                  type="button"
                >
                  Gắn cờ ({flaggedCount})
                </button>
              </div>

              {/* Matrix of Questions 1..90 */}
              <div className="grid grid-cols-10 gap-1.5 p-2 bg-surface-container-low rounded-xl max-h-[380px] overflow-y-auto">
                {questions.map((q, qIndex) => {
                  const isCurrent = qIndex === currentIdx;
                  const isAnswered = Boolean(activeSession.answers[q.id]);
                  const isFlagged = activeSession.flaggedQuestionIds.includes(q.id);

                  if (paletteFilter === 'unanswered' && isAnswered) return null;
                  if (paletteFilter === 'flagged' && !isFlagged) return null;

                  return (
                    <button
                      key={q.id}
                      onClick={() => goToQuestion(qIndex)}
                      type="button"
                      className={`relative h-8 rounded text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-secondary-container text-on-secondary-container font-extrabold shadow-sm scale-105 z-10 ring-2 ring-secondary'
                          : isAnswered
                          ? 'bg-primary text-on-primary hover:brightness-110'
                          : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-dim'
                      }`}
                    >
                      <span>{q.questionNumber}</span>
                      {isFlagged && (
                        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-tertiary-fixed-dim shadow-xs"></span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Prometric Test Lock Badge */}
              <div className="p-3.5 bg-surface-container-low rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-base">verified_user</span>
                  <span className="text-on-surface-variant">
                    Prometric Test Lock: <strong className="text-secondary font-bold">Active</strong>
                  </span>
                </div>
                <span className="text-outline text-[11px] font-mono">ID: FES-2025-CFA-0199</span>
              </div>

              {/* Summary / Review Review Button */}
              <div className="pt-1">
                <button
                  onClick={openSubmitModal}
                  className="w-full py-2.5 px-4 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-base">rule</span>
                  <span>Tổng kết &amp; Rà soát câu hỏi</span>
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
