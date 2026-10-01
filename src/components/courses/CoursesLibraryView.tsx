import React, { useState } from 'react';
import { useLms } from '../../context/LmsContext';
import { Course } from '../../types';

export const CoursesLibraryView: React.FC = () => {
  const { courses, openCourseDetail, openLessonVideo, studentProfile } = useLms();
  const [filterTopic, setFilterTopic] = useState<'all' | 'in-progress' | 'weak-areas'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCourses = courses.filter((course) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!course.title.toLowerCase().includes(q) && !course.cfaTopic.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (filterTopic === 'in-progress' && (course.progressPercentage === 0 || course.progressPercentage === 100)) {
      return false;
    }
    if (filterTopic === 'weak-areas' && !course.isWeakArea) {
      return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col w-full">
      <div className="p-4 sm:p-8 max-w-[1400px] w-full mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-4 border-b border-surface-container-high/60">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-primary-container text-on-primary-container">
                CFA® Curriculum 2026
              </span>
              <span className="text-xs font-semibold text-secondary">
                10 Môn Học Trọng Tâm
              </span>
            </div>
            <h1 className="font-headline text-3xl sm:text-4xl font-black text-primary tracking-tight leading-tight">
              My Courses &amp; Video Lectures
            </h1>
            <p className="mt-2 text-sm text-on-surface-variant font-light leading-relaxed">
              Hệ thống bài giảng video chuyên sâu 10 môn CFA Level I do các giảng viên CFA Charterholder biên soạn, tích hợp trắc nghiệm LOS và ghi chú cá nhân.
            </p>
          </div>

          {/* Quick Learning Stats */}
          <div className="flex items-center gap-4 bg-surface-container-lowest p-3.5 rounded-xl shadow-sm border border-surface-container/60 self-start lg:self-auto">
            <div className="w-10 h-10 rounded-xl bg-secondary-fixed/40 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-2xl">smart_display</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-outline">
                Tổng tiến độ khóa học
              </span>
              <div className="text-lg font-black text-primary leading-tight">
                {studentProfile.overallProgressPercentage}%{' '}
                <span className="text-xs font-normal text-on-surface-variant">hoàn thành</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter & Search Strip */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-surface-container-lowest p-4 rounded-xl shadow-sm border border-surface-container/60">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm môn học, chủ đề (ví dụ: FRA, Fixed Income)..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-surface-container-low rounded-lg outline-none text-on-surface focus:bg-surface-container transition-all"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {(
              [
                { id: 'all', label: 'Tất cả 10 môn' },
                { id: 'in-progress', label: 'Đang học' },
                { id: 'weak-areas', label: '⚠️ Vùng yếu cần ôn' },
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterTopic(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filterTopic === f.id
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            // Find active or first lesson
            const firstLesson = course.modules[0]?.lessons[0];

            return (
              <div
                key={course.id}
                className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-surface-container/60 flex flex-col justify-between gap-5 hover:shadow-md transition-all group relative overflow-hidden"
              >
                {course.isWeakArea && (
                  <div className="absolute top-0 right-0 w-28 h-28 bg-error-container/20 rounded-bl-full pointer-events-none"></div>
                )}

                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed">
                      {course.level}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {course.isWeakArea && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-error-container text-on-error-container flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">warning</span>
                          Cần ưu tiên
                        </span>
                      )}
                      {course.badge && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-surface-container text-secondary">
                          {course.badge}
                        </span>
                      )}
                    </div>
                  </div>

                  <h3
                    onClick={() => openCourseDetail(course.id)}
                    className="font-headline font-bold text-lg text-primary group-hover:text-secondary transition-colors cursor-pointer leading-snug"
                  >
                    {course.title}
                  </h3>

                  <p className="text-xs text-on-surface-variant font-light mt-2 line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>

                  {/* Modules & Lessons Metas */}
                  <div className="grid grid-cols-3 gap-2 mt-4 p-2.5 rounded-xl bg-surface-container-low text-center text-xs">
                    <div>
                      <span className="block text-[10px] text-outline uppercase font-semibold">Modules</span>
                      <strong className="text-primary font-bold">{course.modulesCount}</strong>
                    </div>
                    <div>
                      <span className="block text-[10px] text-outline uppercase font-semibold">Lessons</span>
                      <strong className="text-primary font-bold">{course.totalLessonsCount}</strong>
                    </div>
                    <div>
                      <span className="block text-[10px] text-outline uppercase font-semibold">Q-Bank</span>
                      <strong className="text-secondary font-bold">{course.practiceQuestionsCount} Qs</strong>
                    </div>
                  </div>
                </div>

                {/* Progress bar and CTAs */}
                <div className="space-y-3 pt-3 border-t border-surface-container/60">
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="text-on-surface-variant font-medium">
                      Đã hoàn thành: <strong>{course.completedLessonsCount} / {course.totalLessonsCount}</strong> bài
                    </span>
                    <span className="font-bold text-primary font-mono">{course.progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        course.progressPercentage >= 80
                          ? 'bg-secondary'
                          : course.progressPercentage >= 60
                          ? 'bg-secondary'
                          : 'bg-tertiary-fixed-dim'
                      }`}
                      style={{ width: `${course.progressPercentage}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => {
                        if (firstLesson) {
                          openLessonVideo(course.id, firstLesson.id);
                        } else {
                          openCourseDetail(course.id);
                        }
                      }}
                      className="flex-1 py-2.5 px-3 rounded-lg bg-tertiary-fixed-dim hover:bg-tertiary-fixed text-on-tertiary-fixed font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <span className="material-symbols-outlined text-base">play_arrow</span>
                      <span>Continue Learning</span>
                    </button>
                    <button
                      onClick={() => openCourseDetail(course.id)}
                      className="p-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary transition-colors cursor-pointer"
                      title="Xem danh mục bài học (Syllabus)"
                    >
                      <span className="material-symbols-outlined text-[18px]">list_alt</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
