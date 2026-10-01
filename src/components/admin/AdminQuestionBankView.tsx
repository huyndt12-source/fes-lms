import React, { useEffect, useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  Edit3,
  History,
  Archive,
  CheckCircle,
  AlertCircle,
  Eye,
  X,
  FileText,
  Save,
  Clock,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { apiClient } from '../../services/apiClient';

export const AdminQuestionBankView: React.FC = () => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedQuestionData, setSelectedQuestionData] = useState<any>(null);

  // Form State for Create Question
  const [createForm, setCreateForm] = useState({
    question_code: '',
    topic_id: 'fra',
    reading: 'Reading 19: Leases',
    los_code: 'LOS 19.b',
    difficulty: 'Medium' as 'Easy' | 'Medium' | 'Hard',
    prompt: '',
    scenario_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    correct_answer: 'A' as 'A' | 'B' | 'C',
    explanation: '',
  });

  // Form State for Edit (Creating New Version)
  const [editForm, setEditForm] = useState({
    prompt: '',
    scenario_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    correct_answer: 'A' as 'A' | 'B' | 'C',
    explanation: '',
    change_summary: '',
    publishImmediately: true,
  });

  useEffect(() => {
    loadData();
  }, [search, selectedTopic, selectedDifficulty, selectedStatus]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [qData, topicData] = await Promise.all([
        apiClient.getAdminQuestions({
          search,
          topic_id: selectedTopic || undefined,
          difficulty: selectedDifficulty || undefined,
          status: selectedStatus || undefined,
        }),
        apiClient.getAdminTopics(),
      ]);
      setQuestions(qData);
      setTopics(topicData.topics || []);
    } catch (err) {
      console.error('Failed to load question bank data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = async (qId: string) => {
    try {
      const fullQ = await apiClient.getAdminQuestionById(qId);
      setSelectedQuestionData(fullQ);

      const ver = fullQ.currentVersion;
      const optA = fullQ.options.find((o: any) => o.option_key === 'A')?.option_text || '';
      const optB = fullQ.options.find((o: any) => o.option_key === 'B')?.option_text || '';
      const optC = fullQ.options.find((o: any) => o.option_key === 'C')?.option_text || '';

      setEditForm({
        prompt: ver?.prompt || '',
        scenario_text: ver?.scenario_text || '',
        option_a: optA,
        option_b: optB,
        option_c: optC,
        correct_answer: ver?.correct_answer || 'A',
        explanation: ver?.explanation || '',
        change_summary: '',
        publishImmediately: true,
      });
      setIsEditModalOpen(true);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleOpenHistory = async (qId: string) => {
    try {
      const fullQ = await apiClient.getAdminQuestionById(qId);
      setSelectedQuestionData(fullQ);
      setIsHistoryModalOpen(true);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.createQuestion({
        question_code: createForm.question_code,
        topic_id: createForm.topic_id,
        reading: createForm.reading,
        los_code: createForm.los_code,
        difficulty: createForm.difficulty,
        prompt: createForm.prompt,
        scenario_text: createForm.scenario_text,
        options: [
          { key: 'A', text: createForm.option_a },
          { key: 'B', text: createForm.option_b },
          { key: 'C', text: createForm.option_c },
        ],
        correct_answer: createForm.correct_answer,
        explanation: createForm.explanation,
        publishImmediately: true,
      });
      setIsCreateModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuestionData) return;

    try {
      await apiClient.createNewQuestionVersion(selectedQuestionData.question.id, {
        prompt: editForm.prompt,
        scenario_text: editForm.scenario_text,
        options: [
          { key: 'A', text: editForm.option_a },
          { key: 'B', text: editForm.option_b },
          { key: 'C', text: editForm.option_c },
        ],
        correct_answer: editForm.correct_answer,
        explanation: editForm.explanation,
        change_summary: editForm.change_summary || 'Chỉnh sửa và nâng cấp nội dung',
        publishImmediately: editForm.publishImmediately,
      });
      setIsEditModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handlePublishVersion = async (versionId: string) => {
    try {
      await apiClient.publishQuestionVersion(versionId);
      if (selectedQuestionData) {
        const fullQ = await apiClient.getAdminQuestionById(selectedQuestionData.question.id);
        setSelectedQuestionData(fullQ);
      }
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleArchive = async (qId: string) => {
    if (!confirm('Bạn có chắc chắn muốn lưu trữ (Archive) câu hỏi này?')) return;
    try {
      await apiClient.archiveQuestion(qId);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Ngân Hàng Câu Hỏi (Question Bank)</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Quản lý độc lập kho câu hỏi CFA Level I với cơ chế Versioning bất biến và phân loại chuẩn syllabus.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-lg shadow-emerald-900/30 transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          Tạo Câu Hỏi Mới
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
        {/* Search */}
        <div className="relative lg:col-span-2">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo mã câu hỏi (Q-FRA-001) hoặc nội dung..."
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        {/* Topic Filter */}
        <select
          value={selectedTopic}
          onChange={(e) => setSelectedTopic(e.target.value)}
          className="bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
        >
          <option value="">Tất cả Chủ đề (Topics)</option>
          {topics.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>

        {/* Difficulty Filter */}
        <select
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value)}
          className="bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
        >
          <option value="">Mọi mức độ khó</option>
          <option value="Easy">Easy (Cơ bản)</option>
          <option value="Medium">Medium (Chuẩn CFA)</option>
          <option value="Hard">Hard (Nâng cao)</option>
        </select>

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
        >
          <option value="">Mọi trạng thái</option>
          <option value="Active">Đang hoạt động (Active)</option>
          <option value="Draft">Bản nháp (Draft)</option>
          <option value="Archived">Đã lưu trữ (Archived)</option>
        </select>
      </div>

      {/* Questions Table */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/90 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Mã & Topic</th>
                <th className="py-3 px-4">Nội dung câu hỏi (Stem)</th>
                <th className="py-3 px-4">Độ khó</th>
                <th className="py-3 px-4">Phiên bản (Ver)</th>
                <th className="py-3 px-4">Đáp án đúng</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Đang tải danh sách câu hỏi...
                  </td>
                </tr>
              ) : questions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Không tìm thấy câu hỏi nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                questions.map((item) => {
                  const q = item.question;
                  const v = item.currentVersion;
                  const difficultyColor =
                    q.difficulty === 'Hard'
                      ? 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                      : q.difficulty === 'Medium'
                      ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                      : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';

                  return (
                    <tr key={q.id} className="hover:bg-slate-900/50 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                        {q.question_code}
                        <div className="text-[10px] font-sans font-normal text-slate-400 mt-0.5">
                          {q.topic_id.toUpperCase()} • {q.los_code}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 max-w-md">
                        <div className="text-slate-200 line-clamp-2 leading-relaxed">
                          {v?.prompt || 'Chưa có nội dung phiên bản'}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{q.reading}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${difficultyColor}`}
                        >
                          {q.difficulty}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleOpenHistory(q.id)}
                          className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px] font-bold transition"
                          title="Xem lịch sử các phiên bản"
                        >
                          <History className="w-3 h-3 text-emerald-400" />
                          v{v?.version_number || 1}
                          <span className="text-[10px] text-slate-500 font-normal font-sans">
                            ({item.allVersionsCount} vers)
                          </span>
                        </button>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-emerald-400 font-mono">
                        {v?.correct_answer ? `Option ${v.correct_answer}` : 'N/A'}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            q.status === 'Active'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {q.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(q.id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                            title="Chỉnh sửa (Tạo phiên bản mới)"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                          </button>

                          <button
                            onClick={() => handleOpenHistory(q.id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                            title="Lịch sử phiên bản"
                          >
                            <History className="w-3.5 h-3.5 text-emerald-400" />
                          </button>

                          {q.status !== 'Archived' && (
                            <button
                              onClick={() => handleArchive(q.id)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 transition"
                              title="Lưu trữ câu hỏi"
                            >
                              <Archive className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- CREATE QUESTION MODAL --- */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 space-y-4 my-8 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                Tạo Câu Hỏi Mới Vào Ngân Hàng
              </h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Mã câu hỏi (Code)*</label>
                  <input
                    type="text"
                    required
                    placeholder="Q-FRA-015"
                    value={createForm.question_code}
                    onChange={(e) => setCreateForm({ ...createForm, question_code: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Chủ đề (Topic)*</label>
                  <select
                    value={createForm.topic_id}
                    onChange={(e) => setCreateForm({ ...createForm, topic_id: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-emerald-500 outline-none"
                  >
                    {topics.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Độ khó*</label>
                  <select
                    value={createForm.difficulty}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, difficulty: e.target.value as any })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-emerald-500 outline-none"
                  >
                    <option value="Easy">Easy (Cơ bản)</option>
                    <option value="Medium">Medium (Chuẩn CFA)</option>
                    <option value="Hard">Hard (Nâng cao)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Reading Title*</label>
                  <input
                    type="text"
                    required
                    value={createForm.reading}
                    onChange={(e) => setCreateForm({ ...createForm, reading: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Mã LOS (LOS Code)*</label>
                  <input
                    type="text"
                    required
                    placeholder="LOS 19.b"
                    value={createForm.los_code}
                    onChange={(e) => setCreateForm({ ...createForm, los_code: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Đoạn dẫn tình huống (Scenario / Vignette - Tùy chọn)
                </label>
                <textarea
                  rows={2}
                  value={createForm.scenario_text}
                  onChange={(e) => setCreateForm({ ...createForm, scenario_text: e.target.value })}
                  placeholder="Dữ liệu tài chính nền tảng hoặc tình huống doanh nghiệp..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nội dung câu hỏi (Prompt Stem)*</label>
                <textarea
                  rows={3}
                  required
                  value={createForm.prompt}
                  onChange={(e) => setCreateForm({ ...createForm, prompt: e.target.value })}
                  placeholder="Nhập câu hỏi..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="space-y-2.5">
                <label className="block text-slate-300 font-semibold">Các phương án trả lời (A, B, C)*</label>
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded bg-slate-800 flex items-center justify-center font-bold text-slate-300 shrink-0">
                    A
                  </span>
                  <input
                    type="text"
                    required
                    value={createForm.option_a}
                    onChange={(e) => setCreateForm({ ...createForm, option_a: e.target.value })}
                    placeholder="Phương án A..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-emerald-500 outline-none"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded bg-slate-800 flex items-center justify-center font-bold text-slate-300 shrink-0">
                    B
                  </span>
                  <input
                    type="text"
                    required
                    value={createForm.option_b}
                    onChange={(e) => setCreateForm({ ...createForm, option_b: e.target.value })}
                    placeholder="Phương án B..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-emerald-500 outline-none"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded bg-slate-800 flex items-center justify-center font-bold text-slate-300 shrink-0">
                    C
                  </span>
                  <input
                    type="text"
                    required
                    value={createForm.option_c}
                    onChange={(e) => setCreateForm({ ...createForm, option_c: e.target.value })}
                    placeholder="Phương án C..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Đáp án đúng*</label>
                  <select
                    value={createForm.correct_answer}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, correct_answer: e.target.value as any })
                    }
                    className="w-full bg-slate-900 border border-emerald-500/50 rounded-lg px-3 py-2 text-emerald-400 font-bold outline-none"
                  >
                    <option value="A">Đáp án A</option>
                    <option value="B">Đáp án B</option>
                    <option value="C">Đáp án C</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Giải thích chi tiết (Explanation)*</label>
                <textarea
                  rows={3}
                  required
                  value={createForm.explanation}
                  onChange={(e) => setCreateForm({ ...createForm, explanation: e.target.value })}
                  placeholder="Giải thích chi tiết công thức, bước tính hoặc cơ sở lý thuyết..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Lưu & Xuất Bản v1
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT QUESTION MODAL (COPY-ON-WRITE VERSIONING) --- */}
      {isEditModalOpen && selectedQuestionData && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 space-y-4 my-8 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-blue-400" />
                  Chỉnh Sửa Câu Hỏi: {selectedQuestionData.question.question_code}
                </h2>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Tạo phiên bản Version mới (Copy-on-Write) bảo vệ dữ liệu lịch sử bài thi.
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Immutability Banner */}
            <div className="p-3 rounded-lg bg-blue-950/40 border border-blue-800/40 text-[11px] text-blue-300 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Cơ chế bất biến (Immutable Versioning):</strong> Hành động chỉnh sửa này sẽ tự động sinh ra <strong>Version {(selectedQuestionData.currentVersion?.version_number || 1) + 1}</strong>. Tất cả các đề thi cũ và bài thi học viên đã nộp trong quá khứ vẫn sẽ hiển thị chính xác Version {selectedQuestionData.currentVersion?.version_number || 1} ban đầu.
              </div>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Lý do điều chỉnh (Change Summary)*</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Cập nhật công thức theo giáo trình CFA 2026..."
                  value={editForm.change_summary}
                  onChange={(e) => setEditForm({ ...editForm, change_summary: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nội dung câu hỏi (Prompt Stem)*</label>
                <textarea
                  rows={3}
                  required
                  value={editForm.prompt}
                  onChange={(e) => setEditForm({ ...editForm, prompt: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:border-blue-500 outline-none"
                />
              </div>

              <div className="space-y-2.5">
                <label className="block text-slate-300 font-semibold">Các phương án trả lời (A, B, C)*</label>
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded bg-slate-800 flex items-center justify-center font-bold text-slate-300 shrink-0">
                    A
                  </span>
                  <input
                    type="text"
                    required
                    value={editForm.option_a}
                    onChange={(e) => setEditForm({ ...editForm, option_a: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded bg-slate-800 flex items-center justify-center font-bold text-slate-300 shrink-0">
                    B
                  </span>
                  <input
                    type="text"
                    required
                    value={editForm.option_b}
                    onChange={(e) => setEditForm({ ...editForm, option_b: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded bg-slate-800 flex items-center justify-center font-bold text-slate-300 shrink-0">
                    C
                  </span>
                  <input
                    type="text"
                    required
                    value={editForm.option_c}
                    onChange={(e) => setEditForm({ ...editForm, option_c: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Đáp án đúng*</label>
                <select
                  value={editForm.correct_answer}
                  onChange={(e) =>
                    setEditForm({ ...editForm, correct_answer: e.target.value as any })
                  }
                  className="w-full bg-slate-900 border border-emerald-500/50 rounded-lg px-3 py-2 text-emerald-400 font-bold outline-none"
                >
                  <option value="A">Đáp án A</option>
                  <option value="B">Đáp án B</option>
                  <option value="C">Đáp án C</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Giải thích chi tiết (Explanation)*</label>
                <textarea
                  rows={3}
                  required
                  value={editForm.explanation}
                  onChange={(e) => setEditForm({ ...editForm, explanation: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:border-blue-500 outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="pubImm"
                  checked={editForm.publishImmediately}
                  onChange={(e) => setEditForm({ ...editForm, publishImmediately: e.target.checked })}
                  className="w-4 h-4 text-emerald-500 bg-slate-900 rounded border-slate-700"
                />
                <label htmlFor="pubImm" className="text-slate-300 font-medium cursor-pointer">
                  Xuất bản ngay phiên bản mới này (Active Version)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Lưu Version Mới
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- VERSION HISTORY MODAL --- */}
      {isHistoryModalOpen && selectedQuestionData && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 space-y-4 my-8 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <History className="w-4 h-4 text-emerald-400" />
                  Lịch Sử Phiên Bản: {selectedQuestionData.question.question_code}
                </h2>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Tổng số: {selectedQuestionData.versions.length} phiên bản đã lưu trong lịch sử.
                </div>
              </div>
              <button
                onClick={() => setIsHistoryModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 text-xs">
              {selectedQuestionData.versions.map((verItem: any, index: number) => {
                const v = verItem.version;
                const isCurrent = v.id === selectedQuestionData.question.current_version_id;

                return (
                  <div
                    key={v.id}
                    className={`p-4 rounded-xl border transition ${
                      isCurrent
                        ? 'bg-emerald-950/20 border-emerald-500/40 ring-1 ring-emerald-500/20'
                        : 'bg-slate-900/60 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white text-sm">
                          Version {v.version_number}
                        </span>
                        {isCurrent ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Đang Hoạt Động (Active)
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-slate-500">
                            Lịch sử đã đóng băng
                          </span>
                        )}
                      </div>

                      {!isCurrent && (
                        <button
                          onClick={() => handlePublishVersion(v.id)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold text-[11px] border border-slate-700 transition"
                        >
                          Kích hoạt làm Version chính
                        </button>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      Tạo ngày: {new Date(v.created_at).toLocaleString('vi-VN')}
                      {v.change_summary && (
                        <span className="italic">• {v.change_summary}</span>
                      )}
                    </div>

                    <div className="mt-3 p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 text-slate-300">
                      <div className="font-semibold text-white mb-1.5">{v.prompt}</div>
                      <div className="space-y-1 text-slate-400">
                        {verItem.options.map((opt: any) => (
                          <div
                            key={opt.id}
                            className={`flex items-start gap-2 ${
                              opt.option_key === v.correct_answer
                                ? 'text-emerald-400 font-semibold'
                                : ''
                            }`}
                          >
                            <span className="font-mono">{opt.option_key}.</span>
                            <span>{opt.option_text}</span>
                            {opt.option_key === v.correct_answer && (
                              <span className="text-[10px] px-1 bg-emerald-500/20 rounded">
                                Đáp án đúng
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-2 text-[11px] text-slate-400">
                      <strong className="text-slate-300">Giải thích:</strong> {v.explanation}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsHistoryModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
