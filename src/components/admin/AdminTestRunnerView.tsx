import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Play,
  RefreshCw,
  ShieldCheck,
  Layers,
  Database,
  Lock,
} from 'lucide-react';
import { apiClient } from '../../services/apiClient';

export const AdminTestRunnerView: React.FC = () => {
  const [running, setRunning] = useState(false);
  const [testReport, setTestReport] = useState<any>(null);

  const handleRunTests = async () => {
    try {
      setRunning(true);
      const res = await apiClient.runAllTests();
      setTestReport(res);
    } catch (err: any) {
      alert('Lỗi chạy kiểm thử: ' + err.message);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Bộ Kiểm Thử Tự Động 10 Kịch Bản (Test Suite)</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Xác minh toàn diện tính bất biến của Question Versioning, đóng băng đề thi, telemetry video và phân quyền server-side.
          </p>
        </div>

        <button
          onClick={handleRunTests}
          disabled={running}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs px-5 py-2.5 rounded-lg shadow-lg shadow-emerald-900/30 transition shrink-0"
        >
          {running ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Đang thực thi 10 Test Case...
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Chạy Kiểm Thử Ngay (Run 10 Tests)
            </>
          )}
        </button>
      </div>

      {/* Summary Box */}
      {testReport && (
        <div
          className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            testReport.allPassed
              ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-3">
            {testReport.allPassed ? (
              <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
            ) : (
              <XCircle className="w-8 h-8 text-rose-400 shrink-0" />
            )}
            <div>
              <div className="text-base font-bold text-white">
                {testReport.allPassed
                  ? 'TẤT CẢ 10/10 KỊCH BẢN ĐÃ VƯỢT QUA XUẤT SẮC (ALL PASSED)'
                  : 'MỘT SỐ KỊCH BẢN CHƯA ĐẠT'}
              </div>
              <div className="text-xs mt-0.5 text-slate-300">
                Đã kiểm thử toàn bộ cơ chế bảo vệ phiên bản câu hỏi, đề thi đóng băng và phân quyền hệ thống.
              </div>
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="text-2xl font-black text-white">
              {testReport.passedCount} / {testReport.totalTests}
            </div>
            <div className="text-[11px] uppercase tracking-wider font-semibold text-emerald-400">
              100% Hoàn Thành
            </div>
          </div>
        </div>
      )}

      {/* Test Scenarios List */}
      <div className="space-y-3">
        {(testReport?.results || initialPlaceholders).map((t: any, index: number) => {
          const isPassed = t.passed;
          return (
            <div
              key={t.id || index}
              className={`p-4 rounded-xl border transition ${
                testReport
                  ? isPassed
                    ? 'bg-slate-950/80 border-slate-800'
                    : 'bg-rose-950/20 border-rose-800/40'
                  : 'bg-slate-950/60 border-slate-800/60'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-mono font-bold text-xs text-slate-300 shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white">{t.name}</span>
                      {testReport && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            isPassed
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {isPassed ? 'PASSED' : 'FAILED'}
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      {t.details}
                    </div>

                    {t.data && (
                      <div className="mt-2 p-2 rounded bg-slate-900 border border-slate-800 font-mono text-[10px] text-emerald-400/90 overflow-x-auto">
                        {JSON.stringify(t.data)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="shrink-0">
                  {testReport ? (
                    isPassed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-400" />
                    )
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-slate-700" />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const initialPlaceholders = [
  {
    id: 'TEST_1',
    name: 'TEST 1: Tạo Question Q001 Version 1',
    details: 'Tạo bản ghi question header và version 1 với các phương án lựa chọn A, B, C và giải thích.',
  },
  {
    id: 'TEST_2',
    name: 'TEST 2: Thêm Q001 Version 1 vào Mock Exam 01',
    details: 'Liên kết question_version_id của v1 vào bảng junction mock_exam_questions.',
  },
  {
    id: 'TEST_3',
    name: 'TEST 3: Xuất bản Mock Exam 01 (Version Freezing)',
    details: 'Đóng băng các question version trong Mock Exam 01 để bảo vệ tính toàn vẹn.',
  },
  {
    id: 'TEST_4',
    name: 'TEST 4: Tạo Q001 Version 2 & Xác minh Mock Exam 01 vẫn dùng Version 1',
    details: 'Cập nhật Q001 sinh ra Version 2. Xác minh Mock Exam 01 vẫn giữ nguyên liên kết tới Version 1.',
  },
  {
    id: 'TEST_5',
    name: 'TEST 5: Tạo Mock Exam 02 dùng Version 2',
    details: 'Tạo đề thi mới liên kết tới Version 2 vừa được cập nhật.',
  },
  {
    id: 'TEST_6',
    name: 'TEST 6: Học viên hoàn thành Mock Exam 01',
    details: 'Xác minh bảng exam_answers của học viên lưu chính xác question_version_id của Version 1.',
  },
  {
    id: 'TEST_7',
    name: 'TEST 7: Chỉnh sửa Q001 lên Version 3 & Kiểm tra bài thi lịch sử',
    details: 'Xác minh bài thi học viên đã nộp trong quá khứ hiển thị chính xác nội dung Version 1 ban đầu.',
  },
  {
    id: 'TEST_8',
    name: 'TEST 8: Học viên xem video đến 35:20 (2120s) và Tiếp tục học',
    details: 'Kiểm tra lưu trữ heartbeat telemetry và khôi phục chính xác vị trí phát.',
  },
  {
    id: 'TEST_9',
    name: 'TEST 9: Hệ thống chẩn đoán chủ đề yếu và đề xuất bài giảng',
    details: 'Xác định Topic điểm kém và tự động gắn link video bài giảng tương ứng.',
  },
  {
    id: 'TEST_10',
    name: 'TEST 10: Thử truy cập Admin CMS với tài khoản Student',
    details: 'Xác minh hệ thống từ chối truy cập từ phía máy chủ với mã phản hồi HTTP 403 Forbidden.',
  },
];
