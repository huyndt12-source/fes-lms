import React, { useState } from 'react';
import { useLms } from '../../context/LmsContext';

export const ScratchpadModal: React.FC = () => {
  const { isScratchpadOpen, toggleScratchpad } = useLms();
  const [scratchContent, setScratchContent] = useState<string>(
    '# Nháp tính toán:\n- IFRS 16: PV lease liability = $385,420\n- Year 1 interest = 6% * 385,420 = $23,125.2\n- Ending liability = $408,545\n'
  );

  if (!isScratchpadOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-surface-container-lowest text-on-surface w-full max-w-lg rounded-2xl shadow-2xl border border-surface-container overflow-hidden flex flex-col animate-in fade-in zoom-in-95">
        <div className="bg-surface-container-low px-5 py-3 flex items-center justify-between border-b border-surface-container">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-lg">edit_note</span>
            <span className="text-xs font-bold text-primary uppercase tracking-wider">
              Bảng Nháp Thi Thử (Exam Scratchpad)
            </span>
          </div>
          <button
            onClick={toggleScratchpad}
            className="text-outline hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <div className="p-4 space-y-3">
          <p className="text-[11px] text-on-surface-variant">
            Ghi chú công thức và các bước tính toán tạm thời. Nội dung nháp sẽ được giữ trong suốt phiên thi hiện tại.
          </p>
          <textarea
            value={scratchContent}
            onChange={(e) => setScratchContent(e.target.value)}
            rows={10}
            className="w-full p-3 text-xs font-mono bg-surface-container-low border border-surface-container rounded-xl outline-none focus:border-secondary transition-all resize-none"
            placeholder="Ghi công thức, giá trị PV, FV, coupon, yield..."
          />
        </div>

        <div className="bg-surface-container-low px-5 py-2.5 flex items-center justify-between">
          <button
            onClick={() => setScratchContent('')}
            className="text-xs text-error hover:underline font-semibold"
          >
            Xóa bảng nháp
          </button>
          <button
            onClick={toggleScratchpad}
            className="px-4 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-bold hover:bg-primary-container transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
