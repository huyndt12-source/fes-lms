import React, { useEffect, useState } from 'react';
import {
  FileCheck,
  Plus,
  Edit,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Award,
  Layers,
  Search,
  MoveUp,
  MoveDown,
  Trash2,
  Sparkles,
  Save,
  X,
  ShieldCheck,
} from 'lucide-react';
import { apiClient } from '../../services/apiClient';

export const AdminMockExamBuilderView: React.FC = () => {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Builder Modal State
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [editingExamId, setEditingExamId] = useState<string | null>(null);

  // Form State
  const [examForm, setExamForm] = useState({
    title: '',
    subtitle: '',
    level: 'Level I' as 'Level I' | 'Level II' | 'Level III',
    format_year: '2026',
    difficulty: 'Standard CFA' as any,
    duration_minutes: 135,
    passing_score_mps: 70.0,
    is_recommended: true,
  });

  // Selected Question Versions for the exam
  const [selectedItems, setSelectedItems] = useState<any[]>([]);

  // Question Picker modal
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [availableQuestions, setAvailableQuestions] = useState<any[]>([]);
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerTopic, setPickerTopic] = useState('');

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getAdminMockExams();
      setExams(data);
    } catch (err) {
      console.error('Failed to load mock exams:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingExamId(null);
    setExamForm({
      title: 'CFA® Level I - Mock Exam Session Mới',
      subtitle: 'Đề thi thử chuẩn cấu trúc CFA Institute 2026',
      level: 'Level I',
      format_year: '2026',
      difficulty: 'Standard CFA',
      duration_minutes: 135,
      passing_score_mps: 70.0,
      is_recommended: false,
    });
    setSelectedItems([]);
    setIsBuilderOpen(true);
  };

  const handleOpenEdit = async (examId: string) => {
    try {
      const fullExam = await apiClient.getAdminMockExamById(examId);
      setEditingExamId(examId);
      setExamForm({
        title: fullExam.exam.title,
        subtitle: fullExam.exam.subtitle || '',
        level: fullExam.exam.level,
        format_year: fullExam.exam.format_year,
        difficulty: fullExam.exam.difficulty,
        duration_minutes: fullExam.exam.duration_minutes,
        passing_score_mps: fullExam.exam.passing_score_mps,
        is_recommended: fullExam.exam.is_recommended,
      });

      setSelectedItems(
        fullExam.items.map((it: any) => ({
          versionId: it.version.id,
          questionId: it.question.id,
          code: it.question.question_code,
          topicId: it.question.topic_id,
          prompt: it.version.prompt,
          versionNumber: it.version.version_number,
        }))
      );

      setIsBuilderOpen(true);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleOpenPicker = async () => {
    try {
      const qList = await apiClient.getAdminQuestions();
      setAvailableQuestions(qList);
      setIsPickerOpen(true);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAddQuestionToExam = (item: any) => {
    if (!item.currentVersion) return;
    const isAlreadyAdded = selectedItems.some((s) => s.versionId === item.currentVersion.id);
    if (isAlreadyAdded) return;

    setSelectedItems([
      ...selectedItems,
      {
        versionId: item.currentVersion.id,
        questionId: item.question.id,
        code: item.question.question_code,
        topicId: item.question.topic_id,
        prompt: item.currentVersion.prompt,
        versionNumber: item.currentVersion.version_number,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    const next = [...selectedItems];
    next.splice(index, 1);
    setSelectedItems(next);
  };

  const handleMoveItem = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === selectedItems.length - 1)
    )
      return;

    const next = [...selectedItems];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const temp = next[index];
    next[index] = next[targetIdx];
    next[targetIdx] = temp;
    setSelectedItems(next);
  };

  const handleSaveExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItems.length === 0) {
      alert('Vui lòng chọn ít nhất 1 câu hỏi vào đề thi.');
      return;
    }

    try {
      if (editingExamId) {
        await apiClient.updateMockExamQuestions(
          editingExamId,
          selectedItems.map((s) => s.versionId)
        );
      } else {
        await apiClient.createMockExam({
          title: examForm.title,
          subtitle: examForm.subtitle,
          level: examForm.level,
          format_year: examForm.format_year,
          difficulty: examForm.difficulty,
          duration_minutes: examForm.duration_minutes,
          passing_score_mps: examForm.passing_score_mps,
          is_recommended: examForm.is_recommended,
          question_version_ids: selectedItems.map((s) => s.versionId),
        });
      }
      setIsBuilderOpen(false);
      loadExams();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleTogglePublish = async (examId: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    if (
      nextStatus &&
      !confirm(
        'ĐÓNG BĂNG PHIÊN BẢN (VERSION FREEZING):\nKhi xuất bản, toàn bộ câu hỏi trong đề thi này sẽ được cố định phiên bản bất biến. Các chỉnh sửa trong Question Bank sau này sẽ không làm thay đổi đề thi này. Bạn có muốn tiếp tục?'
      )
    ) {
      return;
    }

    try {
      await apiClient.setMockExamPublishStatus(examId, nextStatus);
      loadExams();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Quản Lý & Xây Dựng Mock Exams</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Lắp ráp đề thi từ Question Bank độc lập, cấu hình thời gian thi, điểm chuẩn MPS và cơ chế Đóng Băng Phiên Bản (Version Freezing).
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-lg shadow-emerald-900/30 transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          Tạo Đề Thi Mới
        </button>
      </div>

      {/* Mock Exams List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 py-12 text-center text-slate-400">
            Đang tải danh sách đề thi...
          </div>
        ) : exams.length === 0 ? (
          <div className="col-span-2 py-12 text-center text-slate-400">
            Chưa có đề thi nào được tạo. Nhấp "Tạo Đề Thi Mới" để bắt đầu.
          </div>
        ) : (
          exams.map((exam) => (
            <div
              key={exam.id}
              className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 space-y-4 hover:border-slate-700 transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-400 font-mono">
                      {exam.id}
                    </span>
                    {exam.is_published ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Đã Xuất Bản (Published)
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Bản Nháp (Draft)
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-white mt-1.5">{exam.title}</h3>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{exam.subtitle}</p>
                </div>

                <button
                  onClick={() => handleTogglePublish(exam.id, exam.is_published)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 ${
                    exam.is_published
                      ? 'bg-rose-950/40 text-rose-300 hover:bg-rose-900/60 border border-rose-800/40'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  {exam.is_published ? 'Hủy xuất bản' : 'Xuất bản (Freeze)'}
                </button>
              </div>

              {/* Stats badges */}
              <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-800/80 text-center text-xs">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Số câu hỏi</div>
                  <div className="font-bold text-white mt-0.5">{exam.total_questions} câu</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Thời lượng</div>
                  <div className="font-bold text-white mt-0.5">{exam.duration_minutes} phút</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Chuẩn MPS</div>
                  <div className="font-bold text-emerald-400 mt-0.5">{exam.passing_score_mps}%</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-[11px] text-slate-500">
                  Cập nhật: {new Date(exam.updated_at).toLocaleDateString('vi-VN')}
                </span>

                <button
                  onClick={() => handleOpenEdit(exam.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition"
                >
                  <Edit className="w-3.5 h-3.5 text-blue-400" />
                  Chỉnh sửa câu hỏi
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* --- EXAM BUILDER MODAL --- */}
      {isBuilderOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-4xl w-full p-6 space-y-4 my-8 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  {editingExamId ? `Sửa Đề Thi: ${editingExamId}` : 'Xây Dựng Đề Thi Mock Exam Mới'}
                </h2>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Chọn câu hỏi từ Ngân hàng và sắp xếp thứ tự hiển thị cho thí sinh.
                </div>
              </div>
              <button
                onClick={() => setIsBuilderOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExam} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Tên bài thi (Title)*</label>
                  <input
                    type="text"
                    required
                    value={examForm.title}
                    onChange={(e) => setExamForm({ ...examForm, title: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Mô tả phụ (Subtitle)</label>
                  <input
                    type="text"
                    value={examForm.subtitle}
                    onChange={(e) => setExamForm({ ...examForm, subtitle: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Thời lượng (Phút)*</label>
                  <input
                    type="number"
                    min={10}
                    max={300}
                    value={examForm.duration_minutes}
                    onChange={(e) =>
                      setExamForm({ ...examForm, duration_minutes: Number(e.target.value) })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Điểm chuẩn MPS (%)*</label>
                  <input
                    type="number"
                    min={40}
                    max={90}
                    value={examForm.passing_score_mps}
                    onChange={(e) =>
                      setExamForm({ ...examForm, passing_score_mps: Number(e.target.value) })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Mức độ bài thi</label>
                  <select
                    value={examForm.difficulty}
                    onChange={(e) => setExamForm({ ...examForm, difficulty: e.target.value as any })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-emerald-500 outline-none"
                  >
                    <option value="Foundational">Foundational</option>
                    <option value="Standard CFA">Standard CFA</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Challenging">Challenging</option>
                  </select>
                </div>
              </div>

              {/* Selected Questions Header & Picker Trigger */}
              <div className="pt-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="font-bold text-white flex items-center gap-2">
                    <span>Danh sách câu hỏi trong đề</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[11px]">
                      {selectedItems.length} câu đã chọn
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleOpenPicker}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Thêm câu từ Question Bank
                  </button>
                </div>

                {/* Ordered Items List */}
                <div className="mt-3 max-h-64 overflow-y-auto space-y-2 pr-2">
                  {selectedItems.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl">
                      Chưa có câu hỏi nào trong đề thi. Nhấn "Thêm câu từ Question Bank" ở trên.
                    </div>
                  ) : (
                    selectedItems.map((it, idx) => (
                      <div
                        key={it.versionId}
                        className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center font-mono font-bold text-emerald-400 text-xs shrink-0">
                            {idx + 1}
                          </span>
                          <div>
                            <div className="flex items-center gap-2 font-mono font-bold text-slate-200">
                              <span>{it.code}</span>
                              <span className="text-[10px] text-slate-500 uppercase font-sans font-normal">
                                • {it.topicId} • ver {it.versionNumber}
                              </span>
                            </div>
                            <div className="text-slate-400 text-[11px] truncate max-w-lg mt-0.5">
                              {it.prompt}
                            </div>
                          </div>
                        </div>

                        {/* Reorder and Delete controls */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleMoveItem(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300"
                            title="Di chuyển lên"
                          >
                            <MoveUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveItem(idx, 'down')}
                            disabled={idx === selectedItems.length - 1}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300"
                            title="Di chuyển xuống"
                          >
                            <MoveDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="p-1 rounded bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 transition"
                            title="Xóa khỏi đề"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsBuilderOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Lưu Đề Thi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- QUESTION PICKER SUB-MODAL --- */}
      {isPickerOpen && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 my-8 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Search className="w-4 h-4 text-emerald-400" />
                Chọn Câu Hỏi Từ Question Bank
              </h2>
              <button
                onClick={() => setIsPickerOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Tìm nhanh theo mã câu hoặc nội dung..."
                value={pickerSearch}
                onChange={(e) => setPickerSearch(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
              />
            </div>

            <div className="max-h-80 overflow-y-auto space-y-2 pr-2 text-xs">
              {availableQuestions
                .filter((q) => {
                  const qLower = pickerSearch.toLowerCase();
                  const matchCode = q.question.question_code.toLowerCase().includes(qLower);
                  const matchPrompt = q.currentVersion?.prompt.toLowerCase().includes(qLower);
                  return !pickerSearch || matchCode || matchPrompt;
                })
                .map((q) => {
                  const isAdded = selectedItems.some((s) => s.versionId === q.currentVersion?.id);

                  return (
                    <div
                      key={q.question.id}
                      className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between gap-3"
                    >
                      <div className="max-w-md">
                        <div className="font-mono font-bold text-emerald-400">
                          {q.question.question_code}
                          <span className="text-[10px] text-slate-500 font-sans font-normal ml-2">
                            {q.question.topic_id.toUpperCase()} • ver {q.currentVersion?.version_number}
                          </span>
                        </div>
                        <div className="text-slate-300 text-[11px] truncate mt-0.5">
                          {q.currentVersion?.prompt}
                        </div>
                      </div>

                      <button
                        onClick={() => handleAddQuestionToExam(q)}
                        disabled={isAdded}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 ${
                          isAdded
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        }`}
                      >
                        {isAdded ? 'Đã thêm' : 'Chọn câu'}
                      </button>
                    </div>
                  );
                })}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsPickerOpen(false)}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-bold text-xs"
              >
                Xong
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
