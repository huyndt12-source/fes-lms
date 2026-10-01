import React, { useEffect, useState } from 'react';
import {
  HelpCircle,
  FileCheck,
  Users,
  Award,
  PlusCircle,
  FileSpreadsheet,
  CheckCircle2,
  TrendingUp,
  Layers,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { apiClient } from '../../services/apiClient';

interface AdminDashboardViewProps {
  onNavigateTab: (tab: any) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ onNavigateTab }) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getAdminStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mr-3" />
        Đang tải dữ liệu Bảng điều khiển Quản trị...
      </div>
    );
  }

  const cards = [
    {
      title: 'Ngân hàng câu hỏi',
      value: stats?.totalQuestions || 0,
      subtext: `${stats?.totalQuestionVersions || 0} phiên bản (Versions)`,
      icon: HelpCircle,
      color: 'emerald',
      action: () => onNavigateTab('question-bank'),
    },
    {
      title: 'Đề thi Mock Exam',
      value: stats?.totalMockExams || 0,
      subtext: `${stats?.publishedMockExams || 0} đề đã xuất bản`,
      icon: FileCheck,
      color: 'blue',
      action: () => onNavigateTab('mock-exams'),
    },
    {
      title: 'Học viên CFA',
      value: stats?.totalStudents || 0,
      subtext: 'Ứng viên đang theo học',
      icon: Users,
      color: 'purple',
      action: () => onNavigateTab('students'),
    },
    {
      title: 'Lượt nộp bài thi',
      value: stats?.completedAttempts || 0,
      subtext: `Điểm TB: ${stats?.averageScore || 0}% | Đạt MPS: ${stats?.passRate || 0}%`,
      icon: Award,
      color: 'amber',
      action: () => onNavigateTab('results'),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Bảng Điều Khiển Hệ Thống (CMS Dashboard)</h1>
        <p className="text-xs text-slate-400 mt-1">
          Theo dõi tổng quan tài nguyên học liệu CFA Level I, trạng thái xuất bản đề thi và phân tích hiệu suất học viên.
        </p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div
              key={i}
              onClick={c.action}
              className="bg-slate-950/70 border border-slate-800 hover:border-slate-700 rounded-xl p-5 cursor-pointer transition hover:bg-slate-800/40 group relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">{c.title}</span>
                <div className="p-2 rounded-lg bg-slate-800 text-slate-300 group-hover:scale-110 transition">
                  <Icon className="w-4 h-4 text-emerald-400" />
                </div>
              </div>
              <div className="mt-3 text-2xl font-black text-white">{c.value}</div>
              <div className="mt-1 text-[11px] text-slate-400 flex items-center justify-between">
                <span>{c.subtext}</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition text-emerald-400" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions Panel */}
      <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-6">
        <h2 className="text-sm font-bold text-white mb-3">Tác Vụ Quản Trị Nhanh</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => onNavigateTab('question-bank')}
            className="flex items-center gap-3 p-3.5 rounded-lg bg-slate-900 hover:bg-slate-800/80 border border-slate-800 text-left transition"
          >
            <PlusCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-white">Thêm Câu Hỏi Mới</div>
              <div className="text-[11px] text-slate-400">Soạn thảo stem, options, giải thích</div>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('question-import')}
            className="flex items-center gap-3 p-3.5 rounded-lg bg-slate-900 hover:bg-slate-800/80 border border-slate-800 text-left transition"
          >
            <FileSpreadsheet className="w-5 h-5 text-blue-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-white">Import Excel / CSV</div>
              <div className="text-[11px] text-slate-400">Tải lên ngân hàng câu hỏi hàng loạt</div>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('mock-exams')}
            className="flex items-center gap-3 p-3.5 rounded-lg bg-slate-900 hover:bg-slate-800/80 border border-slate-800 text-left transition"
          >
            <Layers className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-white">Tạo Mock Exam Mới</div>
              <div className="text-[11px] text-slate-400">Đóng gói đề thi và đóng băng version</div>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('test-suite')}
            className="flex items-center gap-3 p-3.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/30 border border-emerald-800/40 text-left transition"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-emerald-300">Chạy Test 10 Kịch Bản</div>
              <div className="text-[11px] text-emerald-400/80">Kiểm thử tự động tính bất biến & an toàn</div>
            </div>
          </button>
        </div>
      </div>

      {/* Production Architecture Safeguards Notice */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>Cam Kết An Toàn & Bảo Mật Kỳ Thi (Exam Security)</span>
          </div>
          <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
            <li>
              <strong className="text-white">Không lộ đáp án (Zero Leak):</strong> Phía client học viên trong lúc làm bài thi không nhận được trường <code className="text-emerald-400">correct_answer</code> hay <code className="text-emerald-400">explanation</code>.
            </li>
            <li>
              <strong className="text-white">Chấm điểm Server-Authoritative:</strong> Quá trình tính điểm và xếp loại topic diễn ra trong giao dịch backend khép kín.
            </li>
            <li>
              <strong className="text-white">Đóng băng phiên bản (Mock Exam Freezing):</strong> Khi đề thi được Publish, toàn bộ câu hỏi liên kết chặt chẽ qua <code className="text-emerald-400">question_version_id</code>, không bị thay đổi bởi các chỉnh sửa tương lai.
            </li>
          </ul>
        </div>

        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
            <TrendingUp className="w-4 h-4" />
            <span>Vòng Lặp Cá Nhân Hóa (Adaptive Diagnostic)</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Hệ thống tự động phát hiện các chủ đề yếu (điểm &lt; 70% MPS) từ kết quả thi thử của học viên, kích hoạt các khuyến nghị bài giảng video tương ứng và bài tập bù hổng kiến thức trực tiếp trong Student Portal.
          </p>
          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Trạng thái kết nối Student LMS:</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Đang hoạt động đồng bộ
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
