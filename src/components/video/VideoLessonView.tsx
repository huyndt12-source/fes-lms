import React, { useState } from 'react';
import { useLms } from '../../context/LmsContext';
import { CustomVideoPlayer } from './CustomVideoPlayer';
import { Lesson, LessonNote, LessonPracticeQuestion } from '../../types';

export const VideoLessonView: React.FC = () => {
  const {
    selectedCourse,
    selectedLesson,
    selectedCourseId,
    openLessonVideo,
    openCourseDetail,
    lessonNotes,
    addLessonNote,
    editLessonNote,
    deleteLessonNote,
    currentPlaybackSeconds,
    seekVideo,
    activeVideoTab,
    setActiveVideoTab,
    navigateToView,
    navigateToTab,
  } = useLms();

  const [newNoteText, setNewNoteText] = useState('');
  const [includeTimestamp, setIncludeTimestamp] = useState(true);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = useState('');

  // Practice questions local state for interactive testing
  const [practiceAnswers, setPracticeAnswers] = useState<Record<number, 'A' | 'B' | 'C'>>({});
  const [showPracticeExplanations, setShowPracticeExplanations] = useState<Record<number, boolean>>({});

  if (!selectedCourse || !selectedLesson) {
    return (
      <div className="p-12 text-center space-y-4">
        <h2 className="text-xl font-bold text-primary">Không tìm thấy bài học video</h2>
        <button
          onClick={() => navigateToView('my-courses')}
          className="px-4 py-2 bg-primary text-on-primary rounded-lg text-xs font-bold"
        >
          Quay lại Khóa học
        </button>
      </div>
    );
  }

  const course = selectedCourse;
  const lesson = selectedLesson;

  // Notes filtered for this lesson
  const currentLessonNotes = lessonNotes.filter((n) => n.lessonId === lesson.id);

  const formatSeconds = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    const time = includeTimestamp ? Math.floor(currentPlaybackSeconds) : 0;
    addLessonNote(lesson.id, newNoteText.trim(), time);
    setNewNoteText('');
  };

  const handleSelectPracticeAnswer = (qId: number, opt: 'A' | 'B' | 'C') => {
    setPracticeAnswers((prev) => ({ ...prev, [qId]: opt }));
    setShowPracticeExplanations((prev) => ({ ...prev, [qId]: true }));
  };

  return (
    <div className="flex flex-col w-full">
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto space-y-6">
        {/* Course / Module Breadcrumb Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-surface-container/60">
          <nav className="flex flex-wrap items-center gap-2 text-xs text-on-surface-variant font-medium">
            <button
              onClick={() => navigateToView('my-courses')}
              className="hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">menu_book</span>
              My Courses
            </button>
            <span className="text-outline-variant">/</span>
            <button
              onClick={() => openCourseDetail(course.id)}
              className="hover:text-primary transition-colors cursor-pointer font-semibold text-primary"
            >
              {course.title}
            </button>
            <span className="text-outline-variant">/</span>
            <span className="text-on-surface truncate max-w-xs">{lesson.title}</span>
          </nav>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <span className="text-xs text-on-surface-variant font-medium">
              Tiến độ khóa học: <strong className="text-primary font-bold">{course.progressPercentage}%</strong>
            </span>
            <div className="w-20 bg-surface-container h-1.5 rounded-full overflow-hidden">
              <div className="bg-secondary h-full rounded-full" style={{ width: `${course.progressPercentage}%` }}></div>
            </div>
          </div>
        </div>

        {/* Main 2-Column Split: Video + Tabs (8 Cols) vs Curriculum Sidebar (4 Cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Area: Video Player & Tabs (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Custom Educational Video Player */}
            <CustomVideoPlayer lesson={lesson} courseTitle={course.title} />

            {/* Lesson Title & Quick Progress Banner */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-surface-container/60 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-primary text-surface-container-lowest">
                    {lesson.losCode}
                  </span>
                  <span className="text-xs font-semibold text-secondary">{course.title}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                  <span className="material-symbols-outlined text-sm text-tertiary-fixed-dim">
                    timelapse
                  </span>
                  <span>
                    Tiến độ bài học: <strong className="text-primary font-bold">{lesson.watchedPercentage}% đã xem</strong>
                  </span>
                </div>
              </div>

              <h1 className="text-xl sm:text-2xl font-black font-headline text-primary leading-snug">
                {lesson.title}
              </h1>

              <p className="text-xs sm:text-sm text-on-surface-variant font-light leading-relaxed">
                {lesson.description}
              </p>
            </div>

            {/* Below Video Navigation Tabs: Overview / Notes / Resources / Practice Questions */}
            <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-container/60 overflow-hidden">
              {/* Tabs Bar */}
              <div className="flex items-center border-b border-surface-container/60 px-4 bg-surface-container-low/50 overflow-x-auto">
                {(
                  [
                    { id: 'overview', label: 'Overview', icon: 'info' },
                    { id: 'notes', label: `Notes (${currentLessonNotes.length})`, icon: 'edit_note' },
                    { id: 'resources', label: `Resources (${lesson.resources.length})`, icon: 'folder_open' },
                    { id: 'practice', label: `Practice Questions (${lesson.practiceQuestions.length})`, icon: 'quiz' },
                  ] as const
                ).map((tab) => {
                  const isActive = activeVideoTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveVideoTab(tab.id)}
                      className={`flex items-center gap-2 px-5 py-3.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                        isActive
                          ? 'border-primary text-primary bg-surface-container-lowest'
                          : 'border-transparent text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Tab 1: Overview */}
              {activeVideoTab === 'overview' && (
                <div className="p-6 space-y-6 text-xs text-on-surface">
                  <div className="space-y-3">
                    <h3 className="font-bold text-sm text-primary flex items-center gap-2">
                      <span className="material-symbols-outlined text-secondary text-base">checklist</span>
                      Mục tiêu trọng tâm CFA (Core Learning Outcomes)
                    </h3>
                    <ul className="space-y-2 text-on-surface-variant leading-relaxed list-disc list-inside">
                      {lesson.keyTakeaways.map((k, i) => (
                        <li key={i}>{k}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Instructor Card */}
                  <div className="p-4 rounded-xl bg-surface-container-low flex items-center gap-4 border border-surface-container/60">
                    <img
                      src={
                        lesson.instructor.avatarUrl ||
                        'https://lh3.googleusercontent.com/aida-public/AB6AXuAmzJZcaVtq_o8UsL4duTw0bBG48aKCIDbOLS8rme4SEu-eVXMSFdfaXv-ONRv-7UHFClJxPqvEp7d4ISnwEDqPy2aCmP_JNl7smlerZKc1QYVktweYL5nenXAnemD3_gPSx29_G3Ihpksp6P-XL54PZ3txzbNEBFmKkJOSFtumA_G6gXu-A-wBIkaM5EUjta1QcwDI2A_dxx-5W14CYuC74yEAER92z6gy969woq-0IWwgb3lYjRN2'
                      }
                      alt={lesson.instructor.name}
                      className="w-12 h-12 rounded-xl object-cover border border-secondary shrink-0"
                    />
                    <div>
                      <div className="text-xs font-bold text-primary">{lesson.instructor.name}</div>
                      <div className="text-[11px] text-secondary font-semibold">{lesson.instructor.title}</div>
                      <p className="text-[10px] text-outline mt-0.5">
                        Chuyên gia CFA Charterholder với hơn 10 năm kinh nghiệm giảng dạy tài chính doanh nghiệp và định giá.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Notes */}
              {activeVideoTab === 'notes' && (
                <div className="p-6 space-y-6">
                  {/* Create Note Input Form */}
                  <form onSubmit={handleCreateNote} className="space-y-3 bg-surface-container-low p-4 rounded-xl border border-surface-container">
                    <div className="flex items-center justify-between text-xs font-bold text-primary">
                      <span>Tạo ghi chú mới</span>
                      <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-secondary font-semibold">
                        <input
                          type="checkbox"
                          checked={includeTimestamp}
                          onChange={(e) => setIncludeTimestamp(e.target.checked)}
                          className="accent-primary rounded"
                        />
                        <span>Gắn timestamp ({formatSeconds(currentPlaybackSeconds)})</span>
                      </label>
                    </div>

                    <textarea
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      rows={3}
                      placeholder="Ghi lại công thức, bẫy trắc nghiệm hoặc điểm cần ghi nhớ tại thời điểm này..."
                      className="w-full p-3 text-xs bg-surface-container-lowest border border-surface-container rounded-lg outline-none text-on-surface focus:border-secondary transition-all resize-none"
                    />

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={!newNoteText.trim()}
                        className="px-4 py-2 bg-primary text-on-primary text-xs font-bold rounded-lg hover:bg-primary-container disabled:opacity-40 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <span className="material-symbols-outlined text-sm">add</span>
                        <span>Lưu ghi chú</span>
                      </button>
                    </div>
                  </form>

                  {/* Notes List */}
                  <div className="space-y-3">
                    {currentLessonNotes.length === 0 ? (
                      <div className="text-center py-8 text-outline text-xs">
                        Chưa có ghi chú nào cho bài học này. Hãy tạo ghi chú để ôn tập dễ dàng hơn!
                      </div>
                    ) : (
                      currentLessonNotes.map((note) => (
                        <div
                          key={note.id}
                          className="p-4 rounded-xl bg-surface-container-low border border-surface-container/60 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {note.timestampSeconds > 0 && (
                                <button
                                  onClick={() => seekVideo(note.timestampSeconds)}
                                  className="px-2 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed font-mono font-bold text-[11px] hover:brightness-105 transition-all flex items-center gap-1 cursor-pointer"
                                  title="Nhảy đến thời điểm này trên video"
                                >
                                  <span className="material-symbols-outlined text-xs">play_arrow</span>
                                  {note.timestampFormatted}
                                </button>
                              )}
                              <span className="text-[10px] text-outline">{note.createdAt}</span>
                            </div>

                            <div className="flex items-center gap-2 text-outline">
                              <button
                                onClick={() => {
                                  setEditingNoteId(note.id);
                                  setEditingNoteText(note.text);
                                }}
                                className="hover:text-primary transition-colors text-xs font-semibold cursor-pointer"
                              >
                                Sửa
                              </button>
                              <span>•</span>
                              <button
                                onClick={() => deleteLessonNote(note.id)}
                                className="hover:text-error transition-colors text-xs font-semibold cursor-pointer"
                              >
                                Xóa
                              </button>
                            </div>
                          </div>

                          {editingNoteId === note.id ? (
                            <div className="space-y-2 pt-1">
                              <textarea
                                value={editingNoteText}
                                onChange={(e) => setEditingNoteText(e.target.value)}
                                rows={2}
                                className="w-full p-2 text-xs bg-surface-container-lowest border border-secondary rounded-lg outline-none"
                              />
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => setEditingNoteId(null)}
                                  className="px-3 py-1 text-xs text-outline"
                                >
                                  Hủy
                                </button>
                                <button
                                  onClick={() => {
                                    editLessonNote(note.id, editingNoteText);
                                    setEditingNoteId(null);
                                  }}
                                  className="px-3 py-1 bg-primary text-on-primary text-xs font-bold rounded"
                                >
                                  Cập nhật
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs text-on-surface leading-relaxed">{note.text}</p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Tab 3: Resources */}
              {activeVideoTab === 'resources' && (
                <div className="p-6 space-y-4">
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-2">
                    Tài liệu bài giảng đính kèm
                  </div>
                  <div className="space-y-3">
                    {lesson.resources.map((res) => (
                      <div
                        key={res.id}
                        className="p-4 rounded-xl bg-surface-container-low border border-surface-container flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary-fixed/40 text-primary flex items-center justify-center font-bold">
                            <span className="material-symbols-outlined text-xl">description</span>
                          </div>
                          <div>
                            <div className="text-xs font-bold text-primary">{res.title}</div>
                            <div className="text-[11px] text-on-surface-variant font-light">
                              {res.type} • {res.size}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => alert(`Đang mở xem trực tiếp: ${res.title}`)}
                            className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-bold text-xs cursor-pointer"
                          >
                            Xem trực tiếp
                          </button>
                          <button
                            onClick={() => alert(`Đang tải file: ${res.title}`)}
                            className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-bold text-xs flex items-center gap-1 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-sm">download</span>
                            <span>Tải về</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 4: Practice Questions */}
              {activeVideoTab === 'practice' && (
                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between pb-2 border-b border-surface-container">
                    <div>
                      <h3 className="font-bold text-sm text-primary">
                        Câu Hỏi Luyện Tập Nhanh (In-Lesson Practice)
                      </h3>
                      <p className="text-xs text-on-surface-variant">
                        Củng cố ngay kiến thức vừa xem trước khi chuyển sang bài học tiếp theo
                      </p>
                    </div>
                    <button
                      onClick={() => navigateToTab('practice-questions')}
                      className="px-4 py-2 rounded-lg bg-tertiary-fixed-dim hover:bg-tertiary-fixed text-on-tertiary-fixed font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <span className="material-symbols-outlined text-sm">quiz</span>
                      <span>Start Practice</span>
                    </button>
                  </div>

                  <div className="space-y-6">
                    {lesson.practiceQuestions.map((q) => {
                      const selected = practiceAnswers[q.id];
                      const isAnswered = selected !== undefined;
                      const isCorrect = selected === q.correctAnswer;
                      const showExpl = showPracticeExplanations[q.id];

                      return (
                        <div
                          key={q.id}
                          className="p-5 rounded-xl bg-surface-container-low border border-surface-container/60 space-y-4"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black uppercase tracking-wider text-primary">
                              Câu hỏi #{q.questionNumber}
                            </span>
                            {isAnswered && (
                              <span
                                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                                  isCorrect
                                    ? 'bg-secondary text-white'
                                    : 'bg-error text-white'
                                }`}
                              >
                                {isCorrect ? 'Chính xác ✓' : 'Không chính xác ✗'}
                              </span>
                            )}
                          </div>

                          <p className="text-xs sm:text-sm font-semibold text-on-surface leading-relaxed">
                            {q.prompt}
                          </p>

                          <div className="space-y-2">
                            {q.options.map((opt) => {
                              const isThisSelected = selected === opt.id;
                              const isThisCorrect = q.correctAnswer === opt.id;

                              let btnStyle = 'bg-surface-container-lowest hover:bg-surface-container border-surface-container text-on-surface';
                              if (isAnswered) {
                                if (isThisCorrect) {
                                  btnStyle = 'bg-secondary/15 border-secondary text-primary font-bold';
                                } else if (isThisSelected && !isThisCorrect) {
                                  btnStyle = 'bg-error-container/40 border-error text-error font-medium';
                                }
                              }

                              return (
                                <button
                                  key={opt.id}
                                  onClick={() => handleSelectPracticeAnswer(q.id, opt.id)}
                                  className={`w-full p-3 rounded-lg border text-left text-xs transition-all flex items-start gap-2.5 cursor-pointer ${btnStyle}`}
                                >
                                  <span className="font-bold uppercase tracking-wider">
                                    {opt.id}.
                                  </span>
                                  <span>{opt.text}</span>
                                </button>
                              );
                            })}
                          </div>

                          {showExpl && (
                            <div className="p-3.5 bg-surface-container rounded-lg text-xs space-y-1 animate-in fade-in">
                              <span className="font-bold text-secondary uppercase tracking-wider text-[10px]">
                                Giải thích:
                              </span>
                              <p className="text-on-surface-variant leading-relaxed">
                                {q.explanation}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Course Curriculum Sidebar (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-surface-container/60 space-y-4 sticky top-20">
              <div className="flex items-center justify-between pb-3 border-b border-surface-container/60">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-secondary text-base">format_list_bulleted</span>
                    Course Curriculum
                  </h3>
                  <span className="text-[11px] text-on-surface-variant">{course.title}</span>
                </div>
                <button
                  onClick={() => openCourseDetail(course.id)}
                  className="text-xs font-bold text-secondary hover:underline cursor-pointer"
                >
                  Xem tổng quan
                </button>
              </div>

              {/* Modules Accordion / List */}
              <div className="space-y-4 max-h-[640px] overflow-y-auto pr-1">
                {course.modules.map((mod) => (
                  <div key={mod.id} className="space-y-2">
                    <div className="text-[11px] font-bold text-outline uppercase tracking-wider px-1">
                      {mod.title}
                    </div>
                    <div className="space-y-1">
                      {mod.lessons.map((les) => {
                        const isCurrent = les.id === lesson.id;
                        const isCompleted = les.status === 'completed';
                        const isInProg = les.status === 'in-progress';

                        return (
                          <div
                            key={les.id}
                            onClick={() => openLessonVideo(course.id, les.id)}
                            className={`p-2.5 rounded-xl transition-all flex items-center justify-between gap-3 cursor-pointer ${
                              isCurrent
                                ? 'bg-primary text-on-primary shadow-sm font-semibold'
                                : 'hover:bg-surface-container-low text-on-surface'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 flex-1 min-w-0">
                              <span className="text-xs flex-shrink-0">
                                {isCompleted ? '✓' : isInProg ? '▶' : '○'}
                              </span>
                              <span className="text-xs truncate">{les.title}</span>
                            </div>
                            <span
                              className={`text-[10px] font-mono flex-shrink-0 ${
                                isCurrent ? 'text-primary-fixed' : 'text-outline'
                              }`}
                            >
                              {les.durationMinutes}m
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Learning Loop Next Step CTA */}
              <div className="pt-3 border-t border-surface-container/60">
                <button
                  onClick={() => navigateToTab('mock-exams')}
                  className="w-full py-2.5 px-3 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">quiz</span>
                  <span>Kiểm tra năng lực Mock Exam</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
