import React, { useRef, useState } from 'react';
import { useLms } from '../../context/LmsContext';
import { Lesson } from '../../types';
import { FesLogo } from '../common/FesLogo';

interface CustomVideoPlayerProps {
  lesson: Lesson;
  courseTitle: string;
}

export const CustomVideoPlayer: React.FC<CustomVideoPlayerProps> = ({ lesson, courseTitle }) => {
  const {
    currentPlaybackSeconds,
    isVideoPlaying,
    playbackSpeed,
    videoVolume,
    togglePlayVideo,
    seekVideo,
    setPlaybackSpeed,
    setVideoVolume,
    markLessonCompleted,
  } = useLms();

  const [isSpeedMenuOpen, setIsSpeedMenuOpen] = useState(false);
  const [showResumeBanner, setShowResumeBanner] = useState(
    lesson.lastPlaybackSeconds > 60 && lesson.lastPlaybackSeconds < lesson.durationSeconds - 30
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const duration = lesson.durationSeconds || 1800;
  const progressPercent = Math.min(100, (currentPlaybackSeconds / duration) * 100);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    seekVideo((val / 100) * duration);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full bg-[#0a141d] rounded-2xl overflow-hidden shadow-2xl flex flex-col group select-none border border-secondary/30 ${
        isFullscreen ? 'h-screen rounded-none' : 'aspect-video max-h-[580px]'
      }`}
    >
      {/* Video Content Canvas (Simulated High-Definition CFA Lecture Presentation) */}
      <div
        onClick={togglePlayVideo}
        className="relative flex-1 bg-gradient-to-br from-[#0c1f2d] via-[#091722] to-[#040a0f] flex items-center justify-center overflow-hidden cursor-pointer"
      >
        {/* Ambient lecture background elements */}
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <div className="absolute top-10 left-10 w-96 h-96 rounded-full bg-secondary/30 blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-tertiary-fixed-dim/20 blur-3xl"></div>
          <div className="absolute inset-0 bg-[radial-gradient(#153953_1px,transparent_1px)] [background-size:24px_24px]"></div>
        </div>

        {/* Dynamic Presentation Slide Canvas */}
        <div className="relative z-10 w-full max-w-3xl p-6 sm:p-10 mx-auto flex flex-col justify-between h-full text-white pointer-events-none">
          {/* Slide Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-3">
              <FesLogo size="xs" textColor="#ffffff" />
              <span className="text-[11px] text-white/60 font-medium">• {courseTitle}</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary-container text-primary-fixed border border-secondary/30">
              {lesson.losCode}
            </span>
          </div>

          {/* Slide Body: Academic Content Preview based on playback */}
          <div className="space-y-4 my-auto py-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/20 text-secondary-fixed text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary-fixed animate-ping"></span>
              {lesson.title}
            </div>

            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black font-headline tracking-tight text-white leading-snug drop-shadow-md">
              {currentPlaybackSeconds < 600
                ? 'Core Framework & Conceptual Foundation'
                : currentPlaybackSeconds < 1400
                ? 'Analytical Equations & Step-by-Step Accounting Impact'
                : 'Advanced Case Studies & CFA Exam Pitfalls'}
            </h2>

            {/* Lecture Key Bullet Items with interactive active indicator */}
            <div className="space-y-2 pt-2 text-xs sm:text-sm text-white/80 max-w-2xl font-light">
              {lesson.keyTakeaways.map((takeaway, idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <span className="text-tertiary-fixed font-bold text-sm">▶</span>
                  <span className="leading-relaxed">{takeaway}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Instructor Camera PiP Overlay in bottom-right */}
          <div className="self-end flex items-center gap-3 bg-black/60 backdrop-blur-md p-2 rounded-xl border border-white/10 shadow-lg">
            <img
              src={
                lesson.instructor.avatarUrl ||
                'https://lh3.googleusercontent.com/aida-public/AB6AXuAmzJZcaVtq_o8UsL4duTw0bBG48aKCIDbOLS8rme4SEu-eVXMSFdfaXv-ONRv-7UHFClJxPqvEp7d4ISnwEDqPy2aCmP_JNl7smlerZKc1QYVktweYL5nenXAnemD3_gPSx29_G3Ihpksp6P-XL54PZ3txzbNEBFmKkJOSFtumA_G6gXu-A-wBIkaM5EUjta1QcwDI2A_dxx-5W14CYuC74yEAER92z6gy969woq-0IWwgb3lYjRN2'
              }
              alt={lesson.instructor.name}
              className="w-10 h-10 rounded-lg object-cover border border-secondary"
            />
            <div className="pr-2 text-left">
              <div className="text-[11px] font-bold text-white leading-tight">
                {lesson.instructor.name}
              </div>
              <div className="text-[9px] text-tertiary-fixed font-medium">FES Lead Charterholder</div>
            </div>
          </div>
        </div>

        {/* Center Large Play/Pause Button on Pause */}
        {!isVideoPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-2xs transition-all pointer-events-auto">
            <button
              onClick={togglePlayVideo}
              className="w-20 h-20 rounded-full bg-tertiary-fixed-dim hover:bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center shadow-2xl transition-all transform hover:scale-110 active:scale-95 cursor-pointer"
              title="Phát bài giảng"
            >
              <span className="material-symbols-outlined text-4xl ml-1">play_arrow</span>
            </button>
          </div>
        )}

        {/* Resume from last playback toast banner */}
        {showResumeBanner && (
          <div className="absolute top-4 left-4 right-4 sm:left-auto sm:right-4 z-30 bg-primary/95 text-white px-4 py-2.5 rounded-xl shadow-xl border border-secondary/40 flex items-center gap-3 animate-in fade-in slide-in-from-top-3">
            <span className="material-symbols-outlined text-tertiary-fixed text-lg">history</span>
            <span className="text-xs">
              Tiếp tục từ lần trước: <strong>{formatTime(lesson.lastPlaybackSeconds)}</strong>
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                seekVideo(lesson.lastPlaybackSeconds);
                setShowResumeBanner(false);
              }}
              className="px-2.5 py-1 rounded bg-tertiary-fixed text-on-tertiary-fixed text-[11px] font-bold hover:brightness-105 transition-all cursor-pointer"
            >
              Tiếp tục
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowResumeBanner(false);
              }}
              className="text-white/60 hover:text-white"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>
        )}
      </div>

      {/* Video Control Bar */}
      <div className="bg-gradient-to-t from-black via-black/85 to-transparent px-4 py-3 flex flex-col gap-2 z-20">
        {/* Seekable Progress Bar */}
        <div className="relative flex items-center group/scrubber">
          <input
            type="range"
            min="0"
            max="100"
            value={progressPercent}
            onChange={handleSeek}
            className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-tertiary-fixed-dim hover:h-2.5 transition-all"
          />
        </div>

        {/* Controls row */}
        <div className="flex items-center justify-between text-white text-xs gap-3">
          {/* Left: Play/Pause, Volume, Time Display */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={togglePlayVideo}
              className="text-white hover:text-tertiary-fixed transition-colors cursor-pointer"
              title={isVideoPlaying ? 'Tạm dừng (Space)' : 'Phát (Space)'}
            >
              <span className="material-symbols-outlined text-2xl">
                {isVideoPlaying ? 'pause' : 'play_arrow'}
              </span>
            </button>

            {/* Jump forward/backward 10s */}
            <button
              onClick={() => seekVideo(currentPlaybackSeconds - 10)}
              className="text-white/80 hover:text-white transition-colors cursor-pointer hidden sm:inline-flex"
              title="Tua lùi 10s"
            >
              <span className="material-symbols-outlined text-xl">replay_10</span>
            </button>
            <button
              onClick={() => seekVideo(currentPlaybackSeconds + 10)}
              className="text-white/80 hover:text-white transition-colors cursor-pointer hidden sm:inline-flex"
              title="Tua tới 10s"
            >
              <span className="material-symbols-outlined text-xl">forward_10</span>
            </button>

            {/* Volume */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setVideoVolume(videoVolume > 0 ? 0 : 0.8)}
                className="text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-xl">
                  {videoVolume === 0 ? 'volume_off' : videoVolume < 0.5 ? 'volume_down' : 'volume_up'}
                </span>
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={videoVolume}
                onChange={(e) => setVideoVolume(parseFloat(e.target.value))}
                className="w-16 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-secondary hidden sm:inline-block"
              />
            </div>

            {/* Time Stamp */}
            <div className="text-[11px] font-mono text-white/80">
              <span className="text-white font-bold">{formatTime(currentPlaybackSeconds)}</span>
              <span className="text-white/40"> / </span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right: Mark Complete, Speed, Fullscreen */}
          <div className="flex items-center gap-3">
            {/* Mark as Completed action */}
            <button
              onClick={() => markLessonCompleted(lesson.courseId, lesson.id)}
              className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                lesson.status === 'completed'
                  ? 'bg-secondary text-white'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
              title="Đánh dấu hoàn thành bài học"
            >
              <span className="material-symbols-outlined text-sm">
                {lesson.status === 'completed' ? 'check_circle' : 'check'}
              </span>
              <span className="hidden md:inline">
                {lesson.status === 'completed' ? 'Đã hoàn thành' : 'Đánh dấu xong'}
              </span>
            </button>

            {/* Speed selector menu */}
            <div className="relative">
              <button
                onClick={() => setIsSpeedMenuOpen(!isSpeedMenuOpen)}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-mono font-bold transition-colors cursor-pointer"
              >
                {playbackSpeed}x
              </button>
              {isSpeedMenuOpen && (
                <div className="absolute bottom-9 right-0 bg-[#12212f] text-white rounded-xl shadow-xl border border-secondary/40 py-1 z-40 w-24">
                  {[0.75, 1, 1.25, 1.5, 2].map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setPlaybackSpeed(s);
                        setIsSpeedMenuOpen(false);
                      }}
                      className={`w-full px-3 py-1.5 text-left text-xs font-mono font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                        playbackSpeed === s
                          ? 'bg-secondary text-white font-bold'
                          : 'hover:bg-white/10 text-white/80'
                      }`}
                    >
                      <span>{s}x</span>
                      {playbackSpeed === s && <span>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="text-white/80 hover:text-white transition-colors cursor-pointer"
              title="Toàn màn hình"
            >
              <span className="material-symbols-outlined text-xl">
                {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
