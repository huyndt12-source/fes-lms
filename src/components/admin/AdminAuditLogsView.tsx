import React, { useEffect, useState } from 'react';
import { History, Shield, Clock, FileCode } from 'lucide-react';
import { apiClient } from '../../services/apiClient';

export const AdminAuditLogsView: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getAdminAuditLogs();
      setLogs(data);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Nhật Ký Hoạt Động Hệ Thống (Audit Logs)</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Ghi nhận toàn bộ thao tác thêm mới câu hỏi, tạo version, xuất bản đề thi và nộp bài kiểm tra để đảm bảo tính minh bạch và bảo mật.
        </p>
      </div>

      {/* Logs Table */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/90 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Thời gian (UTC)</th>
                <th className="py-3 px-4">Người thực hiện (Actor)</th>
                <th className="py-3 px-4">Hành động (Action)</th>
                <th className="py-3 px-4">Đối tượng (Entity)</th>
                <th className="py-3 px-4">Mã định danh (Entity ID)</th>
                <th className="py-3 px-4">Chi tiết dữ liệu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono text-[11px]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-sans">
                    Đang tải nhật ký audit...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-sans">
                    Chưa có nhật ký hoạt động nào.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/50 transition">
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(log.created_at).toLocaleString('vi-VN')}
                    </td>

                    <td className="py-3 px-4 font-sans font-bold text-slate-200">
                      {log.actor_name || log.actor_id || 'System Engine'}
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-300">
                      {log.entity_type}
                    </td>

                    <td className="py-3 px-4 text-slate-400">
                      {log.entity_id}
                    </td>

                    <td className="py-3 px-4 max-w-xs truncate text-slate-400">
                      {log.new_values ? JSON.stringify(log.new_values) : '-'}
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
