import React from 'react';
import { useLms } from '../../context/LmsContext';
import { FesLogo } from '../common/FesLogo';

export const ExamInstructionsModal: React.FC = () => {
  const {
    isInstructionsModalOpen,
    closeExamInstructions,
    selectedExamForInstructions,
    startExam,
  } = useLms();

  if (!isInstructionsModalOpen || !selectedExamForInstructions) return null;

  const exam = selectedExamForInstructions;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-surface-container-lowest text-on-surface w-full max-w-2xl rounded-2xl shadow-2xl border border-surface-container overflow-hidden flex flex-col max-h-[90vh] zoom-in-95">
        {/* Header */}
        <div className="bg-primary text-on-primary p-6 flex items-start justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <FesLogo size="xs" textColor="#ffffff" />
              <span className="text-white/40">•</span>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-tertiary-fixed text-on-tertiary-fixed">
                Hướng dẫn phòng thi mô phỏng
              </span>
              <span className="text-xs text-primary-fixed font-semibold">{exam.formatYear}</span>
            </div>
            <h2 className="font-headline font-black text-xl text-surface-container-lowest mt-1">
              {exam.title}
            </h2>
            <p className="text-xs text-on-primary-container">{exam.subtitle}</p>
          </div>
          <button
            onClick={closeExamInstructions}
            className="text-on-primary/70 hover:text-on-primary transition-colors p-1"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Body content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-on-surface">
          {/* Quick Specifications Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-surface-container-low flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-outline">Số lượng câu</span>
              <span className="text-lg font-black text-primary mt-0.5">{exam.totalQuestions} câu</span>
              <span className="text-[10px] text-on-surface-variant">Trắc nghiệm A, B, C</span>
            </div>
            <div className="p-3 rounded-xl bg-surface-container-low flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-outline">Thời gian làm</span>
              <span className="text-lg font-black text-secondary mt-0.5">{exam.durationMinutes} phút</span>
              <span className="text-[10px] text-on-surface-variant">~90 giây / câu</span>
            </div>
            <div className="p-3 rounded-xl bg-surface-container-low flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-outline">Mục tiêu MPS</span>
              <span className="text-lg font-black text-tertiary-container mt-0.5">
                {exam.passingScoreMps}%+
              </span>
              <span className="text-[10px] text-on-surface-variant">Chuẩn CFA Institute</span>
            </div>
            <div className="p-3 rounded-xl bg-surface-container-low flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-outline">Chế độ chấm</span>
              <span className="text-lg font-black text-primary mt-0.5">Tức thì</span>
              <span className="text-[10px] text-on-surface-variant">Phân tích LOS chi tiết</span>
            </div>
          </div>

          {/* Key Prometric & Exam Rules */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-primary flex items-center gap-1.5">
              <span className="material-symbols-outlined text-secondary text-base">rule</span>
              Quy chế thi thử &amp; Hướng dẫn giao diện
            </h4>
            <ul className="space-y-2 text-on-surface-variant leading-relaxed list-disc list-inside">
              <li>
                <strong>Đồng hồ bấm giờ thực tế:</strong> Đếm ngược liên tục khi bạn chuyển đổi giữa các câu hỏi. Nếu hết giờ, bài thi sẽ tự động được thu và chấm điểm.
              </li>
              <li>
                <strong>Palette câu hỏi:</strong> Hiển thị trạng thái các câu: <span className="text-primary font-bold">Đã làm</span>, <span className="text-outline font-bold">Chưa làm</span>, và <span className="text-tertiary-container font-bold">Gắn cờ (Flagged)</span> để rà soát lại trước khi nộp.
              </li>
              <li>
                <strong>Máy tính tài chính BA II Plus tích hợp:</strong> Bạn có thể mở trực tiếp bảng tính tài chính ảo (TVM, N, I/Y, PV, PMT, FV) ngay trong phòng thi.
              </li>
              <li>
                <strong>Không trừ điểm câu sai:</strong> Kỳ thi CFA không áp dụng trừ điểm cho câu trả lời sai. Hãy cố gắng hoàn thành 100% câu hỏi trước khi bấm nộp bài.
              </li>
              <li>
                <strong>Lưu bài làm dở dang:</strong> Bạn có thể quay lại Dashboard bất cứ lúc nào, bài thi sẽ lưu lại câu đang làm và thời gian còn lại để bạn tiếp tục sau.
              </li>
            </ul>
          </div>

          {/* Honor Code & CFA Ethics Pledge */}
          <div className="p-4 bg-tertiary-fixed/20 border border-tertiary-fixed rounded-xl flex items-start gap-3">
            <span className="material-symbols-outlined text-tertiary-container text-xl flex-shrink-0 mt-0.5">
              verified_user
            </span>
            <div className="text-[11px] text-on-tertiary-fixed leading-relaxed">
              <strong>Cam kết liêm chính học thuật (CFA Ethics Pledge):</strong> Bằng việc bắt đầu bài thi này, bạn cam kết tự mình hoàn thành bài làm độc lập, tuân thủ đúng giới hạn thời gian thực tế để đánh giá năng lực một cách khách quan nhất.
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-surface-container-low p-4 sm:p-5 flex items-center justify-between gap-3 border-t border-surface-container">
          <button
            onClick={closeExamInstructions}
            className="py-2.5 px-4 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-bold text-xs transition-colors"
          >
            Quay lại Thư viện
          </button>
          <button
            onClick={() => startExam(exam, exam.status === 'in-progress')}
            className="py-2.5 px-6 rounded-lg bg-tertiary-fixed-dim hover:bg-tertiary-fixed text-on-tertiary-fixed font-bold text-xs uppercase tracking-wider shadow-md transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">play_arrow</span>
            <span>
              {exam.status === 'in-progress' ? 'Tiếp tục làm bài thi' : 'Bắt đầu làm bài thi'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
