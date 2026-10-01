import React, { useEffect, useState } from 'react';
import { Award, CheckCircle, XCircle, Clock, Calendar } from 'lucide-react';
import { apiClient } from '../../services/apiClient';

export const AdminResultsView: React.FC = () => {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getAdminResults();
      setResults(data);
    } catch (err) {
      console.error('Failed to load results:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Kết Quả & Lịch Sử Thi Của Học Viên</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Tổng hợp toàn bộ các lượt nộp bài Mock Exam, phân tích độ chính xác, tỷ lệ vượt ngưỡng chuẩn MPS và thời gian làm bài.
        </p>
      </div>

      {/* Results Table */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/90 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Thí sinh</th>
                <th className="py-3 px-4">Bài thi Mock Exam</th>
                <th className="py-3 px-4">Điểm số</th>
                <th className="py-3 px-4">Kết quả MPS</th>
                <th className="py-3 px-4">Số câu đúng</th>
                <th className="py-3 px-4">Thời gian làm</th>
                <th className="py-3 px-4 text-right">Ngày hoàn thành</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Đang tải danh sách kết quả...
                  </td>
                </tr>
              ) : results.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Chưa có lượt nộp bài nào được ghi nhận.
                  </td>
                </tr>
              ) : (
                results.map((r) => (
                  <tr key={r.attemptId} className="hover:bg-slate-900/50 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{r.studentName}</div>
                      <div className="text-[11px] text-slate-400">{r.studentEmail}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-slate-200 font-semibold">{r.examTitle}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{r.examId}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-sm font-black text-emerald-400">
                        {r.scorePercentage}%
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      {r.passedMps ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 w-max">
                          <CheckCircle className="w-3 h-3" />
                          Đạt MPS (Pass)
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1 w-max">
                          <XCircle className="w-3 h-3" />
                          Chưa đạt (Fail)
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-300">
                      {r.correctCount} / {r.totalQuestions}
                    </td>

                    <td className="py-3 px-4 text-slate-300">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{r.timeSpentMinutes} phút</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right text-slate-400 text-[11px]">
                      {r.completedAt ? new Date(r.completedAt).toLocaleString('vi-VN') : 'Đang thi...'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
