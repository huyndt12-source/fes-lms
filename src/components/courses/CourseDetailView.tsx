import React from 'react';
import { useLms } from '../../context/LmsContext';
import { CourseModule, Lesson } from '../../types';

export const CourseDetailView: React.FC = () => {
  const { selectedCourse, openLessonVideo, navigateToView } = useLms();

  if (!selectedCourse) {
    return (
      <div className="p-12 text-center space-y-4">
        <h2 className="text-xl font-bold text-primary">Không tìm thấy khóa học</h2>
        <button
          onClick={() => navigateToView('my-courses')}
          className="px-4 py-2 bg-primary text-on-primary rounded-lg text-xs font-bold"
        >
          Quay lại Danh sách khóa học
        </button>
      </div>
    );
  }

  const course = selectedCourse;
  // Find currently in-progress lesson or first lesson
  let activeLesson: Lesson | undefined;
  for (const m of course.modules) {
    const l = m.lessons.find((les) => les.status === 'in-progress');
    if (l) {
      activeLesson = l;
      break;
    }
  }
  if (!activeLesson) {
    activeLesson = course.modules[0]?.lessons[0];
  }

  return (
    <div className="flex flex-col w-full">
      <div className="p-4 sm:p-8 max-w-[1360px] w-full mx-auto space-y-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-on-surface-variant font-medium tracking-wide">
          <button
            onClick={() => navigateToView('my-courses')}
            className="hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">menu_book</span>
            My Courses
          </button>
          <span className="text-outline-variant">/</span>
          <span className="text-primary font-bold">{course.title}</span>
        </nav>

        {/* Hero Course Overview Card */}
        <div className="bg-primary text-on-primary rounded-2xl p-6 sm:p-8 lg:p-10 shadow-lg relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-secondary/30 blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-2xl space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase bg-tertiary-fixed text-on-tertiary-fixed">
                  {course.level}
                </span>
                <span className="text-xs text-primary-fixed font-semibold">{course.badge}</span>
              </div>
              <h1 className="font-headline font-black text-2xl sm:text-3xl lg:text-4xl text-surface-container-lowest leading-tight">
                {course.title}
              </h1>
              <p className="text-xs sm:text-sm text-on-primary-container leading-relaxed font-light">
                {course.description}
              </p>

              <div className="flex items-center gap-3 pt-2 text-xs text-primary-fixed-dim">
                <span>Giảng viên: <strong className="text-white">{course.instructorName}</strong></span>
                <span>•</span>
                <span>Chuẩn giáo trình CFA Institute 2026</span>
              </div>
            </div>

            {/* Quick Continue CTA Card */}
            {activeLesson && (
              <div className="bg-primary-container/80 backdrop-blur-md p-5 rounded-xl border border-secondary/30 max-w-sm w-full space-y-3 shrink-0">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-primary-fixed font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-tertiary-fixed-dim">
                      play_circle
                    </span>
                    Bài học tiếp theo
                  </span>
                  <span className="font-mono text-tertiary-fixed text-[11px] font-bold">
                    {activeLesson.watchedPercentage}% đã xem
                  </span>
                </div>
                <div className="font-bold text-white text-sm line-clamp-1">
                  {activeLesson.title}
                </div>
                <div className="w-full bg-primary/60 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-tertiary-fixed-dim h-full rounded-full"
                    style={{ width: `${activeLesson.watchedPercentage}%` }}
                  ></div>
                </div>
                <button
                  onClick={() => openLessonVideo(course.id, activeLesson!.id)}
                  className="w-full py-2.5 px-4 rounded-lg bg-tertiary-fixed-dim hover:bg-tertiary-fixed text-on-tertiary-fixed font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <span>Học tiếp bài này</span>
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Visual Progress Dashboard Metrics (Section 10 from brief) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-surface-container/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-outline">
              Overall Progress
            </span>
            <div className="text-2xl font-black font-headline text-primary mt-1">
              {course.progressPercentage}%
            </div>
            <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden mt-2">
              <div
                className="bg-secondary h-full rounded-full"
                style={{ width: `${course.progressPercentage}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-surface-container/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-outline">
              Modules Completed
            </span>
            <div className="text-2xl font-black font-headline text-primary mt-1">
              8 <span className="text-xs font-normal text-outline">/ {course.modulesCount}</span>
            </div>
            <span className="text-[11px] text-secondary font-medium block mt-1">
              Đạt 66.7% lộ trình
            </span>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-surface-container/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-outline">
              Lessons Completed
            </span>
            <div className="text-2xl font-black font-headline text-primary mt-1">
              {course.completedLessonsCount}{' '}
              <span className="text-xs font-normal text-outline">/ {course.totalLessonsCount}</span>
            </div>
            <span className="text-[11px] text-secondary font-medium block mt-1">
              Còn {course.totalLessonsCount - course.completedLessonsCount} bài học
            </span>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-surface-container/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-outline">
              Practice Questions
            </span>
            <div className="text-2xl font-black font-headline text-secondary mt-1">
              {course.completedPracticeQuestionsCount}{' '}
              <span className="text-xs font-normal text-outline">/ {course.practiceQuestionsCount}</span>
            </div>
            <span className="text-[11px] text-tertiary-container font-medium block mt-1">
              Tỷ lệ chính xác: 76.5%
            </span>
          </div>
        </div>

        {/* Structured Curriculum Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-6 bg-primary rounded-full"></div>
              <h2 className="text-xl font-bold font-headline text-primary">
                Cấu Trúc Giáo Trình &amp; Danh Mục Bài Học (Course Curriculum)
              </h2>
            </div>
            <span className="text-xs text-on-surface-variant font-medium">
              {course.modules.length} Modules hiển thị
            </span>
          </div>

          <div className="space-y-5">
            {course.modules.map((module: CourseModule) => (
              <div
                key={module.id}
                className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-surface-container/60 space-y-4"
              >
                {/* Module Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-surface-container/60">
                  <div>
                    <h3 className="font-headline font-bold text-base text-primary">
                      {module.title}
                    </h3>
                    <p className="text-xs text-on-surface-variant font-light mt-0.5">
                      {module.description}
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded bg-surface-container-low text-primary self-start sm:self-auto">
                    {module.lessons.length} bài học
                  </span>
                </div>

                {/* Lessons List in Module */}
                <div className="divide-y divide-surface-container/60">
                  {module.lessons.map((lesson: Lesson) => {
                    const isCompleted = lesson.status === 'completed';
                    const isInProgress = lesson.status === 'in-progress';
                    const isLocked = lesson.status === 'locked';

                    return (
                      <div
                        key={lesson.id}
                        onClick={() => openLessonVideo(course.id, lesson.id)}
                        className={`py-3.5 px-3 rounded-xl transition-all flex items-center justify-between gap-4 cursor-pointer ${
                          isInProgress
                            ? 'bg-primary-fixed/20 border border-primary/20'
                            : 'hover:bg-surface-container-low'
                        }`}
                      >
                        <div className="flex items-center gap-3.5 flex-1 min-w-0">
                          {/* State Icon Indicator */}
                          <div className="flex-shrink-0">
                            {isCompleted && (
                              <div className="w-8 h-8 rounded-lg bg-secondary/15 text-secondary flex items-center justify-center font-bold">
                                <span className="material-symbols-outlined text-lg">check_circle</span>
                              </div>
                            )}
                            {isInProgress && (
                              <div className="w-8 h-8 rounded-lg bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center font-bold shadow-xs">
                                <span className="material-symbols-outlined text-lg">play_arrow</span>
                              </div>
                            )}
                            {isLocked && (
                              <div className="w-8 h-8 rounded-lg bg-surface-container text-outline flex items-center justify-center font-bold">
                                <span className="text-xs font-mono">○</span>
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs sm:text-sm text-primary truncate">
                                {lesson.title}
                              </span>
                              <span className="text-[10px] text-outline font-mono px-1.5 py-0.2 rounded bg-surface-container hidden sm:inline-block">
                                {lesson.losCode}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-[11px] text-on-surface-variant font-light mt-0.5">
                              <span>{lesson.durationMinutes} phút</span>
                              {isInProgress && (
                                <span className="text-secondary font-bold">
                                  Đang học ({lesson.watchedPercentage}% đã xem)
                                </span>
                              )}
                              {isCompleted && (
                                <span className="text-secondary font-semibold">Đã hoàn thành</span>
                              )}
                              {isLocked && <span>Chưa bắt đầu</span>}
                            </div>
                          </div>
                        </div>

                        {/* Action CTA */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {isInProgress ? (
                            <button className="px-3 py-1.5 rounded-lg bg-tertiary-fixed-dim hover:bg-tertiary-fixed text-on-tertiary-fixed font-bold text-xs uppercase tracking-wider flex items-center gap-1 shadow-xs cursor-pointer">
                              <span>Học tiếp</span>
                              <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </button>
                          ) : isCompleted ? (
                            <button className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-bold text-xs flex items-center gap-1 cursor-pointer">
                              <span>Xem lại</span>
                              <span className="material-symbols-outlined text-sm">replay</span>
                            </button>
                          ) : (
                            <button className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs flex items-center gap-1 cursor-pointer">
                              <span>Bắt đầu</span>
                              <span className="material-symbols-outlined text-sm">play_arrow</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
