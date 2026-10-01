import React, { useEffect, useState } from 'react';
import {
  Activity,
  AlertCircle,
  Award,
  BarChart2,
  BookOpen,
  Calendar,
  Check,
  CheckCircle,
  CheckSquare,
  Clock,
  Copy,
  Edit,
  Eye,
  Flame,
  GraduationCap,
  Lock,
  Mail,
  Phone,
  Plus,
  Search,
  Shield,
  Square,
  TrendingUp,
  Unlock,
  User,
  UserPlus,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import { apiClient } from '../../services/apiClient';

export const AdminStudentsView: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [targetDateFilter, setTargetDateFilter] = useState('ALL');

  // Multi-select state
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Selected student for detail/edit
  const [currentStudentId, setCurrentStudentId] = useState<string | null>(null);
  const [studentDetail, setStudentDetail] = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailActiveTab, setDetailActiveTab] = useState<
    'overview' | 'progress' | 'mock-exams' | 'performance' | 'courses' | 'activity'
  >('overview');

  // Add Student Form State
  const [addForm, setAddForm] = useState({
    fullName: '',
    email: '',
    cfaLevel: 'Level I' as 'Level I' | 'Level II' | 'Level III',
    targetExamDate: 'Nov 2026',
    phoneNumber: '',
    isActive: true,
  });
  const [addFormErrors, setAddFormErrors] = useState<Record<string, string>>({});
  const [addFormSubmitting, setAddFormSubmitting] = useState(false);
  const [createdStudentResult, setCreatedStudentResult] = useState<any | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Edit Student Form State
  const [editForm, setEditForm] = useState({
    fullName: '',
    phoneNumber: '',
    cfaLevel: 'Level I' as 'Level I' | 'Level II' | 'Level III',
    targetExamDate: 'Nov 2026',
    studyTitle: '',
    isActive: true,
  });
  const [editFormErrors, setEditFormErrors] = useState<Record<string, string>>({});
  const [editFormSubmitting, setEditFormSubmitting] = useState(false);

  // Global Notification Banner
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  useEffect(() => {
    loadStudents();
  }, [search, levelFilter, statusFilter, targetDateFilter]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getAdminStudents({
        search: search || undefined,
        cfaLevel: levelFilter !== 'ALL' ? levelFilter : undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        targetDate: targetDateFilter !== 'ALL' ? targetDateFilter : undefined,
      });
      setStudents(data);
    } catch (err: any) {
      console.error('Failed to load students:', err);
      showNotice('error', 'Không thể tải danh sách học viên: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const showNotice = (type: 'success' | 'error', message: string) => {
    setActionNotice({ type, message });
    setTimeout(() => setActionNotice(null), 5000);
  };

  // --- Bulk Selection ---
  const handleSelectAll = () => {
    if (selectedStudentIds.length === students.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(students.map((s) => s.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkStatusChange = async (newStatus: boolean) => {
    if (selectedStudentIds.length === 0) return;
    try {
      setBulkLoading(true);
      await apiClient.bulkSetAdminStudentStatus(selectedStudentIds, newStatus);
      showNotice(
        'success',
        `Đã ${newStatus ? 'kích hoạt' : 'tạm khóa'} thành công ${selectedStudentIds.length} học viên.`
      );
      setSelectedStudentIds([]);
      await loadStudents();
    } catch (err: any) {
      showNotice('error', 'Lỗi khi cập nhật hàng loạt: ' + err.message);
    } finally {
      setBulkLoading(false);
    }
  };

  // --- Toggle Single Student Status ---
  const handleToggleSingleStatus = async (student: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = !student.isActive;
    try {
      await apiClient.setAdminStudentStatus(student.id, newStatus);
      showNotice(
        'success',
        `Đã ${newStatus ? 'kích hoạt' : 'tạm khóa'} tài khoản học viên ${student.name}.`
      );
      await loadStudents();
      if (currentStudentId === student.id && studentDetail) {
        setStudentDetail((prev: any) => ({
          ...prev,
          overview: { ...prev.overview, isActive: newStatus },
        }));
      }
    } catch (err: any) {
      showNotice('error', 'Lỗi khi đổi trạng thái: ' + err.message);
    }
  };

  // --- Add Student Handlers ---
  const handleOpenAddModal = () => {
    setAddForm({
      fullName: '',
      email: '',
      cfaLevel: 'Level I',
      targetExamDate: 'Nov 2026',
      phoneNumber: '',
      isActive: true,
    });
    setAddFormErrors({});
    setCreatedStudentResult(null);
    setCopiedLink(false);
    setIsAddModalOpen(true);
  };

  const validateAddForm = () => {
    const errors: Record<string, string> = {};
    if (!addForm.fullName.trim()) errors.fullName = 'Họ và tên học viên là bắt buộc';
    if (!addForm.email.trim()) {
      errors.email = 'Email là bắt buộc';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addForm.email.trim())) {
      errors.email = 'Địa chỉ email không hợp lệ';
    }
    if (!addForm.targetExamDate.trim()) errors.targetExamDate = 'Kỳ thi mục tiêu là bắt buộc';
    setAddFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAddForm()) return;

    try {
      setAddFormSubmitting(true);
      const res = await apiClient.createAdminStudent({
        fullName: addForm.fullName.trim(),
        email: addForm.email.trim(),
        cfaLevel: addForm.cfaLevel,
        targetExamDate: addForm.targetExamDate.trim(),
        phoneNumber: addForm.phoneNumber.trim() || undefined,
        isActive: addForm.isActive,
      });

      setCreatedStudentResult(res);
      showNotice('success', `Đã tạo tài khoản học viên ${res.student.name} thành công!`);
      await loadStudents();
    } catch (err: any) {
      setAddFormErrors({ general: err.message });
      showNotice('error', err.message);
    } finally {
      setAddFormSubmitting(false);
    }
  };

  const handleCopyInvitationLink = () => {
    if (createdStudentResult?.invitationUrl) {
      navigator.clipboard.writeText(createdStudentResult.invitationUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  // --- View Student Detail ---
  const handleOpenDetailModal = async (studentId: string) => {
    setCurrentStudentId(studentId);
    setDetailActiveTab('overview');
    setIsDetailModalOpen(true);
    setDetailLoading(true);
    try {
      const detail = await apiClient.getAdminStudentDetail(studentId);
      setStudentDetail(detail);
    } catch (err: any) {
      showNotice('error', 'Lỗi khi tải chi tiết học viên: ' + err.message);
    } finally {
      setDetailLoading(false);
    }
  };

  // --- Edit Student Handlers ---
  const handleOpenEditModal = (student: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentStudentId(student.id);
    setEditForm({
      fullName: student.name || '',
      phoneNumber: student.phone || '',
      cfaLevel: (student.cfaLevel as any) || 'Level I',
      targetExamDate: student.targetDate || 'Nov 2026',
      studyTitle: student.studyTitle || '',
      isActive: student.isActive !== false,
    });
    setEditFormErrors({});
    setIsEditModalOpen(true);
  };

  const handleEditStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStudentId) return;

    if (!editForm.fullName.trim()) {
      setEditFormErrors({ fullName: 'Họ và tên là bắt buộc' });
      return;
    }

    try {
      setEditFormSubmitting(true);
      await apiClient.updateAdminStudent(currentStudentId, {
        fullName: editForm.fullName.trim(),
        phoneNumber: editForm.phoneNumber.trim() || undefined,
        cfaLevel: editForm.cfaLevel,
        targetExamDate: editForm.targetExamDate.trim(),
        studyTitle: editForm.studyTitle.trim() || undefined,
        isActive: editForm.isActive,
      });

      showNotice('success', 'Đã cập nhật hồ sơ học viên thành công!');
      setIsEditModalOpen(false);
      await loadStudents();
      if (isDetailModalOpen) {
        handleOpenDetailModal(currentStudentId);
      }
    } catch (err: any) {
      setEditFormErrors({ general: err.message });
      showNotice('error', err.message);
    } finally {
      setEditFormSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification Banner */}
      {actionNotice && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-medium animate-fadeIn ${
            actionNotice.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionNotice.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{actionNotice.message}</span>
          </div>
          <button
            onClick={() => setActionNotice(null)}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Header & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-white tracking-tight">
              Quản Lý Học Viên CFA (Student Management)
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-bold">
              {students.length} học viên
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Quản trị danh tính học viên, cấp quyền chuẩn bị Firebase Auth, theo dõi chuỗi streak, kết quả thi thử và chỉ số sẵn sàng.
          </p>
        </div>

        {/* Primary "+ Thêm học viên" Button */}
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-lg shadow-emerald-950/40 active:scale-95 shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Thêm học viên</span>
        </button>
      </div>

      {/* Filters and Search Toolbar */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 shadow-xl space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* 1. Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo họ tên hoặc email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          {/* 2. Filter CFA Level */}
          <div>
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition"
            >
              <option value="ALL">Tất cả CFA Level</option>
              <option value="Level I">CFA Level I</option>
              <option value="Level II">CFA Level II</option>
              <option value="Level III">CFA Level III</option>
            </select>
          </div>

          {/* 3. Filter Status */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="ACTIVE">Đang hoạt động</option>
              <option value="INACTIVE">Đã tạm khóa</option>
            </select>
          </div>

          {/* 4. Filter Target Date */}
          <div>
            <select
              value={targetDateFilter}
              onChange={(e) => setTargetDateFilter(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition"
            >
              <option value="ALL">Tất cả kỳ thi mục tiêu</option>
              <option value="Nov 2026">Kỳ thi Nov 2026</option>
              <option value="May 2027">Kỳ thi May 2027</option>
              <option value="Aug 2027">Kỳ thi Aug 2027</option>
            </select>
          </div>
        </div>

        {/* Bulk Action Bar (when students are selected) */}
        {selectedStudentIds.length > 0 && (
          <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs bg-emerald-500/5 p-2.5 rounded-lg border border-emerald-500/20 animate-fadeIn">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <CheckSquare className="w-4 h-4" />
              <span>Đã chọn {selectedStudentIds.length} học viên</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={bulkLoading}
                onClick={() => handleBulkStatusChange(true)}
                className="px-3 py-1.5 rounded-md bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 text-[11px] font-semibold transition disabled:opacity-50"
              >
                Kích hoạt hàng loạt
              </button>
              <button
                disabled={bulkLoading}
                onClick={() => handleBulkStatusChange(false)}
                className="px-3 py-1.5 rounded-md bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 border border-rose-500/40 text-[11px] font-semibold transition disabled:opacity-50"
              >
                Tạm khóa hàng loạt
              </button>
              <button
                onClick={() => setSelectedStudentIds([])}
                className="px-2.5 py-1.5 text-slate-400 hover:text-white text-[11px] transition"
              >
                Bỏ chọn
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Students Data Table */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/90 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4 w-10 text-center">
                  <button
                    onClick={handleSelectAll}
                    className="text-slate-400 hover:text-white transition"
                    title={selectedStudentIds.length === students.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                  >
                    {students.length > 0 && selectedStudentIds.length === students.length ? (
                      <CheckSquare className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-4">Học viên</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4">CFA Level</th>
                <th className="py-3 px-4">Kỳ thi mục tiêu</th>
                <th className="py-3 px-4">Chuỗi Streak</th>
                <th className="py-3 px-4">Dự báo điểm</th>
                <th className="py-3 px-4">Chỉ số sẵn sàng</th>
                <th className="py-3 px-4">Thi Mock</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                      <span>Đang tải danh sách học viên...</span>
                    </div>
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users className="w-8 h-8 text-slate-600" />
                      <span className="font-semibold text-slate-300">Không tìm thấy học viên nào</span>
                      <p className="text-[11px] text-slate-500">
                        Thử điều chỉnh bộ lọc hoặc nhấn nút "+ Thêm học viên" để tạo hồ sơ mới.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                students.map((s) => {
                  const isSelected = selectedStudentIds.includes(s.id);
                  return (
                    <tr
                      key={s.id}
                      onClick={() => handleOpenDetailModal(s.id)}
                      className={`hover:bg-slate-900/60 transition cursor-pointer ${
                        isSelected ? 'bg-emerald-950/20' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td
                        className="py-3 px-4 text-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleSelect(s.id);
                        }}
                      >
                        <button className="text-slate-400 hover:text-white transition">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Student Info */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-emerald-400 shrink-0">
                            {s.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-white flex items-center gap-1.5">
                              <span>{s.name}</span>
                            </div>
                            <div className="text-[11px] text-slate-400">{s.email}</div>
                            {s.phone && (
                              <div className="text-[10px] text-slate-500">{s.phone}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        {s.isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Hoạt động
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                            Đã khóa
                          </span>
                        )}
                      </td>

                      {/* CFA Level */}
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                          {s.cfaLevel}
                        </span>
                      </td>

                      {/* Target Date */}
                      <td className="py-3 px-4 text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{s.targetDate}</span>
                        </div>
                      </td>

                      {/* Streak */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 font-bold text-amber-400">
                          <Flame className="w-3.5 h-3.5" />
                          <span>{s.streakDays} ngày</span>
                        </div>
                      </td>

                      {/* Forecast Score */}
                      <td className="py-3 px-4 font-bold text-emerald-400">
                        {s.forecastScore ? `${s.forecastScore}%` : 'Chưa có'}
                      </td>

                      {/* Readiness Index */}
                      <td className="py-3 px-4">
                        <div className="w-24 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${s.readinessIndex}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 inline-block font-medium">
                          {s.readinessIndex}% Readiness
                        </span>
                      </td>

                      {/* Mock Exams Completed */}
                      <td className="py-3 px-4">
                        <span className="font-semibold text-white">
                          {s.completedAttempts} / {s.totalAttempts} bài
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleOpenDetailModal(s.id)}
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition"
                            title="Xem chi tiết học viên"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleOpenEditModal(s, e)}
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition"
                            title="Chỉnh sửa hồ sơ"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleToggleSingleStatus(s, e)}
                            className={`p-1.5 rounded-lg transition ${
                              s.isActive
                                ? 'bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400'
                                : 'bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-400'
                            }`}
                            title={s.isActive ? 'Tạm khóa tài khoản' : 'Kích hoạt tài khoản'}
                          >
                            {s.isActive ? (
                              <Lock className="w-3.5 h-3.5" />
                            ) : (
                              <Unlock className="w-3.5 h-3.5" />
                            )}
                          </button>
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

      {/* ========================================================================= */}
      {/* ADD STUDENT MODAL                                                         */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl my-8">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Thêm Học Viên Mới (Add Student)</h3>
                  <p className="text-[11px] text-slate-400">
                    Khởi tạo danh tính học viên CFA và cấu hình liên kết kích hoạt Firebase Auth.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5">
              {/* Firebase Authentication Security Notice */}
              <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs flex items-start gap-2.5">
                <Shield className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-semibold text-blue-200">
                    Bảo mật chuẩn bị cho Firebase Authentication
                  </div>
                  <p className="text-[11px] text-blue-300/90 leading-relaxed">
                    Admin tuyệt đối <strong>không tạo hoặc lưu mật khẩu</strong> của học viên. Sau khi lưu hồ sơ, hệ thống tự động sinh luồng mời kích hoạt tài khoản an toàn qua Email.
                  </p>
                </div>
              </div>

              {/* Success Result View */}
              {createdStudentResult ? (
                <div className="space-y-4 animate-fadeIn">
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-sm text-emerald-200">
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                      <span>Học viên đã được tạo thành công!</span>
                    </div>
                    <p className="text-xs text-emerald-300/90">
                      Hồ sơ của <strong>{createdStudentResult.student.name}</strong> ({createdStudentResult.student.email}) đã được kích hoạt trong hệ thống.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-300">
                      Liên kết kích hoạt & tạo mật khẩu (Firebase Auth Setup Link):
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={createdStudentResult.invitationUrl}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 font-mono focus:outline-none"
                      />
                      <button
                        onClick={handleCopyInvitationLink}
                        className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shrink-0"
                      >
                        {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        <span>{copiedLink ? 'Đã sao chép' : 'Sao chép'}</span>
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Học viên sẽ truy cập liên kết trên để tự thiết lập mật khẩu cá nhân và đăng nhập.
                    </p>
                  </div>

                  <div className="pt-4 flex justify-end gap-2">
                    <button
                      onClick={() => setIsAddModalOpen(false)}
                      className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition"
                    >
                      Đóng
                    </button>
                    <button
                      onClick={() => {
                        setCreatedStudentResult(null);
                        setAddForm({
                          fullName: '',
                          email: '',
                          cfaLevel: 'Level I',
                          targetExamDate: 'Nov 2026',
                          phoneNumber: '',
                          isActive: true,
                        });
                      }}
                      className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition"
                    >
                      + Thêm học viên khác
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleAddStudentSubmit} className="space-y-4">
                  {addFormErrors.general && (
                    <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>{addFormErrors.general}</span>
                    </div>
                  )}

                  {/* Required: Full Name */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">
                      Họ và tên học viên <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: Nguyễn Văn An"
                      value={addForm.fullName}
                      onChange={(e) => setAddForm({ ...addForm, fullName: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                    {addFormErrors.fullName && (
                      <p className="text-[11px] text-rose-400">{addFormErrors.fullName}</p>
                    )}
                  </div>

                  {/* Required: Email */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">
                      Email đăng nhập <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="hocvien@fesacademy.com.vn"
                      value={addForm.email}
                      onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                    {addFormErrors.email && (
                      <p className="text-[11px] text-rose-400">{addFormErrors.email}</p>
                    )}
                  </div>

                  {/* Row: CFA Level & Target Date */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Required: CFA Level */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300">
                        CFA Level <span className="text-rose-400">*</span>
                      </label>
                      <select
                        value={addForm.cfaLevel}
                        onChange={(e) => setAddForm({ ...addForm, cfaLevel: e.target.value as any })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="Level I">CFA Level I</option>
                        <option value="Level II">CFA Level II</option>
                        <option value="Level III">CFA Level III</option>
                      </select>
                    </div>

                    {/* Required: Target Exam Date */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300">
                        Kỳ thi mục tiêu <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Ví dụ: Nov 2026, May 2027"
                        value={addForm.targetExamDate}
                        onChange={(e) => setAddForm({ ...addForm, targetExamDate: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                      {addFormErrors.targetExamDate && (
                        <p className="text-[11px] text-rose-400">{addFormErrors.targetExamDate}</p>
                      )}
                    </div>
                  </div>

                  {/* Optional: Phone Number */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">
                      Số điện thoại liên hệ <span className="text-slate-500">(Tùy chọn)</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="+84 901 234 567"
                      value={addForm.phoneNumber}
                      onChange={(e) => setAddForm({ ...addForm, phoneNumber: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Optional: Initial Account Status */}
                  <div className="flex items-center gap-3 pt-2">
                    <label className="text-xs font-semibold text-slate-300">
                      Trạng thái tài khoản:
                    </label>
                    <div className="flex items-center gap-4 text-xs">
                      <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                        <input
                          type="radio"
                          name="addStatus"
                          checked={addForm.isActive}
                          onChange={() => setAddForm({ ...addForm, isActive: true })}
                          className="accent-emerald-500"
                        />
                        <span>Đang hoạt động (Active)</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer text-slate-400">
                        <input
                          type="radio"
                          name="addStatus"
                          checked={!addForm.isActive}
                          onChange={() => setAddForm({ ...addForm, isActive: false })}
                          className="accent-emerald-500"
                        />
                        <span>Tạm khóa (Inactive)</span>
                      </label>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4 border-t border-slate-800/80 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(false)}
                      className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="submit"
                      disabled={addFormSubmitting}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition disabled:opacity-50"
                    >
                      {addFormSubmitting ? (
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                      <span>Lưu & Tạo liên kết mời</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EDIT STUDENT MODAL                                                        */}
      {/* ========================================================================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl my-8">
            <div className="px-6 py-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <Edit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Chỉnh Sửa Hồ Sơ Học Viên</h3>
                  <p className="text-[11px] text-slate-400">Cập nhật thông tin học viên và kỳ thi mục tiêu.</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditStudentSubmit} className="p-6 space-y-4">
              {editFormErrors.general && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{editFormErrors.general}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Họ và tên học viên <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
                {editFormErrors.fullName && (
                  <p className="text-[11px] text-rose-400">{editFormErrors.fullName}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Số điện thoại</label>
                <input
                  type="tel"
                  value={editForm.phoneNumber}
                  onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">CFA Level</label>
                  <select
                    value={editForm.cfaLevel}
                    onChange={(e) => setEditForm({ ...editForm, cfaLevel: e.target.value as any })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Level I">Level I</option>
                    <option value="Level II">Level II</option>
                    <option value="Level III">Level III</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Kỳ thi mục tiêu</label>
                  <input
                    type="text"
                    value={editForm.targetExamDate}
                    onChange={(e) => setEditForm({ ...editForm, targetExamDate: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Tiêu đề học tập (Study Title)</label>
                <input
                  type="text"
                  value={editForm.studyTitle}
                  onChange={(e) => setEditForm({ ...editForm, studyTitle: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <label className="text-xs font-semibold text-slate-300">Trạng thái:</label>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={editForm.isActive}
                    onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                    className="accent-emerald-500"
                  />
                  <span>Tài khoản đang hoạt động (Active)</span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={editFormSubmitting}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition disabled:opacity-50"
                >
                  {editFormSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STUDENT DETAIL MODAL (6 Tabs)                                             */}
      {/* ========================================================================= */}
      {isDetailModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl my-8">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-sm font-bold text-emerald-400">
                  {studentDetail?.overview?.fullName?.charAt(0) || 'H'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">
                      {studentDetail?.overview?.fullName || 'Chi tiết học viên'}
                    </h3>
                    {studentDetail?.overview?.isActive ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                        Hoạt động
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-bold">
                        Đã khóa
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                      {studentDetail?.overview?.cfaLevel}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {studentDetail?.overview?.email} • {studentDetail?.overview?.studyTitle}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {studentDetail?.overview && (
                  <button
                    onClick={() => handleOpenEditModal(studentDetail.overview)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Sửa hồ sơ</span>
                  </button>
                )}
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Tabs Navigation */}
            <div className="px-6 border-b border-slate-800 bg-slate-900/50 flex gap-2 overflow-x-auto text-xs font-semibold shrink-0">
              <button
                onClick={() => setDetailActiveTab('overview')}
                className={`py-3 px-3 border-b-2 transition flex items-center gap-1.5 ${
                  detailActiveTab === 'overview'
                    ? 'border-emerald-500 text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Tổng quan (Overview)</span>
              </button>

              <button
                onClick={() => setDetailActiveTab('progress')}
                className={`py-3 px-3 border-b-2 transition flex items-center gap-1.5 ${
                  detailActiveTab === 'progress'
                    ? 'border-emerald-500 text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Tiến độ học (Learning Progress)</span>
              </button>

              <button
                onClick={() => setDetailActiveTab('mock-exams')}
                className={`py-3 px-3 border-b-2 transition flex items-center gap-1.5 ${
                  detailActiveTab === 'mock-exams'
                    ? 'border-emerald-500 text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Award className="w-4 h-4" />
                <span>Lịch sử thi Mock (Mock Exams)</span>
              </button>

              <button
                onClick={() => setDetailActiveTab('performance')}
                className={`py-3 px-3 border-b-2 transition flex items-center gap-1.5 ${
                  detailActiveTab === 'performance'
                    ? 'border-emerald-500 text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <BarChart2 className="w-4 h-4" />
                <span>Năng lực chuyên đề (Performance)</span>
              </button>

              <button
                onClick={() => setDetailActiveTab('courses')}
                className={`py-3 px-3 border-b-2 transition flex items-center gap-1.5 ${
                  detailActiveTab === 'courses'
                    ? 'border-emerald-500 text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Khóa học (Courses)</span>
              </button>

              <button
                onClick={() => setDetailActiveTab('activity')}
                className={`py-3 px-3 border-b-2 transition flex items-center gap-1.5 ${
                  detailActiveTab === 'activity'
                    ? 'border-emerald-500 text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Activity className="w-4 h-4" />
                <span>Hoạt động (Activity)</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {detailLoading ? (
                <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
                  <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  <span>Đang tải thông tin học viên...</span>
                </div>
              ) : !studentDetail ? (
                <div className="py-12 text-center text-slate-400">
                  Không tìm thấy dữ liệu học viên.
                </div>
              ) : (
                <>
                  {/* TAB 1: OVERVIEW */}
                  {detailActiveTab === 'overview' && (
                    <div className="space-y-6 animate-fadeIn">
                      {/* 4 Stat Cards */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Readiness Index</span>
                          </div>
                          <div className="text-xl font-bold text-white mt-1">
                            {studentDetail.overview.readinessIndex}%
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2">
                            <div
                              className="bg-emerald-500 h-full rounded-full"
                              style={{ width: `${studentDetail.overview.readinessIndex}%` }}
                            />
                          </div>
                        </div>

                        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                            <Award className="w-3.5 h-3.5 text-blue-400" />
                            <span>Dự báo điểm (Forecast)</span>
                          </div>
                          <div className="text-xl font-bold text-blue-400 mt-1">
                            {studentDetail.overview.forecastScore || 0}%
                          </div>
                          <div className="text-[10px] text-slate-500 mt-1">
                            Target MPS: {studentDetail.overview.targetMps}%
                          </div>
                        </div>

                        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                            <Flame className="w-3.5 h-3.5 text-amber-400" />
                            <span>Chuỗi Streak</span>
                          </div>
                          <div className="text-xl font-bold text-amber-400 mt-1">
                            {studentDetail.overview.streakDays} ngày
                          </div>
                          <div className="text-[10px] text-slate-500 mt-1">Học liên tục</div>
                        </div>

                        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                            <Calendar className="w-3.5 h-3.5 text-purple-400" />
                            <span>Kỳ thi mục tiêu</span>
                          </div>
                          <div className="text-base font-bold text-purple-300 mt-1">
                            {studentDetail.overview.targetExamDate}
                          </div>
                          <div className="text-[10px] text-slate-500 mt-1">
                            {studentDetail.overview.cfaLevel}
                          </div>
                        </div>
                      </div>

                      {/* Profile Information Breakdown */}
                      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                          Thông tin định danh & liên hệ
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="text-slate-400 block text-[11px]">Họ và tên:</span>
                            <span className="font-semibold text-white">
                              {studentDetail.overview.fullName}
                            </span>
                          </div>

                          <div>
                            <span className="text-slate-400 block text-[11px]">Email đăng nhập:</span>
                            <span className="font-semibold text-white">
                              {studentDetail.overview.email}
                            </span>
                          </div>

                          <div>
                            <span className="text-slate-400 block text-[11px]">Số điện thoại:</span>
                            <span className="font-semibold text-white">
                              {studentDetail.overview.phoneNumber || 'Chưa cập nhật'}
                            </span>
                          </div>

                          <div>
                            <span className="text-slate-400 block text-[11px]">Trạng thái tài khoản:</span>
                            <span
                              className={`font-semibold ${
                                studentDetail.overview.isActive ? 'text-emerald-400' : 'text-rose-400'
                              }`}
                            >
                              {studentDetail.overview.isActive ? 'Đang hoạt động (Active)' : 'Đã tạm khóa (Inactive)'}
                            </span>
                          </div>

                          <div>
                            <span className="text-slate-400 block text-[11px]">Ngày tạo hồ sơ:</span>
                            <span className="text-slate-300">
                              {new Date(studentDetail.overview.createdAt).toLocaleString('vi-VN')}
                            </span>
                          </div>

                          <div>
                            <span className="text-slate-400 block text-[11px]">Hoạt động gần nhất:</span>
                            <span className="text-slate-300">
                              {new Date(studentDetail.overview.lastActiveDate).toLocaleString('vi-VN')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: LEARNING PROGRESS */}
                  {detailActiveTab === 'progress' && (
                    <div className="space-y-6 animate-fadeIn">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                          <div className="text-[11px] font-semibold text-slate-400">Thời gian xem video</div>
                          <div className="text-xl font-bold text-white mt-1">
                            {studentDetail.learningProgress.totalWatchMinutes} phút
                          </div>
                        </div>

                        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                          <div className="text-[11px] font-semibold text-slate-400">Bài học đã hoàn thành</div>
                          <div className="text-xl font-bold text-emerald-400 mt-1">
                            {studentDetail.learningProgress.completedLessonsCount} bài
                          </div>
                        </div>

                        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                          <div className="text-[11px] font-semibold text-slate-400">Khóa học đăng ký</div>
                          <div className="text-xl font-bold text-blue-400 mt-1">
                            {studentDetail.learningProgress.totalEnrolledCourses} khóa
                          </div>
                        </div>
                      </div>

                      {/* Course progress bars */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                          Tiến độ theo từng khóa học
                        </h4>

                        <div className="space-y-3">
                          {studentDetail.learningProgress.courses.map((course: any) => (
                            <div
                              key={course.courseId}
                              className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2"
                            >
                              <div className="flex items-center justify-between text-xs">
                                <div>
                                  <div className="font-bold text-white">{course.title}</div>
                                  <div className="text-[11px] text-slate-400">
                                    {course.instructor} • {course.level}
                                  </div>
                                </div>
                                <span className="font-bold text-emerald-400">
                                  {course.progressPercentage}%
                                </span>
                              </div>

                              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                                <div
                                  className="bg-emerald-500 h-full rounded-full transition-all"
                                  style={{ width: `${course.progressPercentage}%` }}
                                />
                              </div>

                              <div className="text-[11px] text-slate-400 flex justify-between">
                                <span>
                                  Đã học: {course.completedLessons} / {course.totalLessons} bài học
                                </span>
                                {course.isCompleted && (
                                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                                    <Check className="w-3.5 h-3.5" /> Hoàn thành
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: MOCK EXAMS HISTORY */}
                  {detailActiveTab === 'mock-exams' && (
                    <div className="space-y-4 animate-fadeIn">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        Lịch sử bài thi thử Mock Exam ({studentDetail.mockExams.length} lượt thi)
                      </h4>

                      {studentDetail.mockExams.length === 0 ? (
                        <div className="py-12 text-center text-slate-400 bg-slate-900/50 rounded-xl border border-slate-800">
                          Học viên chưa thực hiện bài thi thử nào.
                        </div>
                      ) : (
                        <div className="overflow-x-auto border border-slate-800 rounded-xl">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-900 text-slate-400 uppercase text-[10px]">
                              <tr>
                                <th className="p-3">Bài thi</th>
                                <th className="p-3">Trạng thái</th>
                                <th className="p-3">Điểm số</th>
                                <th className="p-3">Kết quả MPS</th>
                                <th className="p-3">Số câu đúng</th>
                                <th className="p-3">Thời gian làm</th>
                                <th className="p-3 text-right">Ngày nộp bài</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                              {studentDetail.mockExams.map((att: any) => (
                                <tr key={att.attemptId} className="hover:bg-slate-900/50">
                                  <td className="p-3 font-semibold text-white">
                                    <div>{att.examTitle}</div>
                                    <div className="text-[10px] text-slate-400">{att.examLevel}</div>
                                  </td>
                                  <td className="p-3">
                                    <span
                                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                        att.status === 'completed'
                                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                      }`}
                                    >
                                      {att.status === 'completed' ? 'Đã hoàn thành' : 'Đang làm'}
                                    </span>
                                  </td>
                                  <td className="p-3 font-bold text-emerald-400 text-sm">
                                    {att.scorePercentage}%
                                  </td>
                                  <td className="p-3">
                                    {att.passedMps ? (
                                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                                        ĐẠT MPS
                                      </span>
                                    ) : (
                                      <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-bold">
                                        DƯỚI MPS
                                      </span>
                                    )}
                                  </td>
                                  <td className="p-3 text-slate-300">
                                    {att.correctCount} / {att.totalQuestions} câu
                                  </td>
                                  <td className="p-3 text-slate-300">
                                    {att.timeSpentMinutes} phút
                                  </td>
                                  <td className="p-3 text-right text-slate-400">
                                    {att.completedAt
                                      ? new Date(att.completedAt).toLocaleDateString('vi-VN')
                                      : 'Chưa nộp'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 4: PERFORMANCE BY TOPIC */}
                  {detailActiveTab === 'performance' && (
                    <div className="space-y-4 animate-fadeIn">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                          Năng lực theo 10 chuyên đề CFA (Topic Performance)
                        </h4>
                        <span className="text-[11px] text-slate-400">
                          Chuẩn Minimum Passing Score (MPS): <strong className="text-emerald-400">70%</strong>
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {studentDetail.topicPerformance.map((topic: any) => (
                          <div
                            key={topic.topicId}
                            className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2"
                          >
                            <div className="flex items-center justify-between text-xs">
                              <div>
                                <span className="font-bold text-white">{topic.topicName}</span>
                                <span className="text-[10px] text-slate-400 ml-1.5">
                                  ({topic.weightRange})
                                </span>
                              </div>
                              <span
                                className={`font-bold ${
                                  topic.passedMps ? 'text-emerald-400' : 'text-rose-400'
                                }`}
                              >
                                {topic.percentage}%
                              </span>
                            </div>

                            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  topic.passedMps ? 'bg-emerald-500' : 'bg-rose-500'
                                }`}
                                style={{ width: `${Math.min(100, topic.percentage)}%` }}
                              />
                            </div>

                            <div className="flex items-center justify-between text-[10px]">
                              <span
                                className={`px-2 py-0.5 rounded font-bold ${
                                  topic.passedMps
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                }`}
                              >
                                {topic.statusBadge}
                              </span>
                              <span className="text-slate-500">
                                {topic.sampleSize > 0
                                  ? `${topic.sampleSize} bài kiểm tra`
                                  : 'Ước lượng ban đầu'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB 5: COURSES */}
                  {detailActiveTab === 'courses' && (
                    <div className="space-y-4 animate-fadeIn">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        Danh sách khóa học đã cấp quyền truy cập
                      </h4>

                      <div className="space-y-3">
                        {studentDetail.courses.map((course: any) => (
                          <div
                            key={course.courseId}
                            className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                                <BookOpen className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="font-bold text-white text-sm">{course.title}</div>
                                <div className="text-slate-400 text-[11px] mt-0.5">
                                  Giảng viên: {course.instructor} • Cấp độ: {course.level}
                                </div>
                              </div>
                            </div>

                            <div className="text-right">
                              <span className="font-bold text-emerald-400 text-sm">
                                {course.progressPercentage}%
                              </span>
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                {course.completedLessons}/{course.totalLessons} bài học
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB 6: ACTIVITY TIMELINE */}
                  {detailActiveTab === 'activity' && (
                    <div className="space-y-4 animate-fadeIn">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        Dòng thời gian hoạt động học viên (Activity Timeline)
                      </h4>

                      {studentDetail.activities.length === 0 ? (
                        <div className="py-12 text-center text-slate-400 bg-slate-900/50 rounded-xl border border-slate-800">
                          Chưa có ghi nhận hoạt động nào.
                        </div>
                      ) : (
                        <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-800">
                          {studentDetail.activities.map((act: any) => (
                            <div key={act.id} className="relative flex items-start gap-3 pl-1">
                              <div className="w-6 h-6 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0 z-10 text-emerald-400">
                                <Activity className="w-3.5 h-3.5" />
                              </div>
                              <div className="flex-1 p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-white">{act.title}</span>
                                  <span className="text-[10px] text-slate-400">
                                    {new Date(act.timestamp).toLocaleString('vi-VN')}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-300 mt-1">{act.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
