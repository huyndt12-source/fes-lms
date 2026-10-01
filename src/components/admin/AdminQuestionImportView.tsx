import React, { useState } from 'react';
import {
  FileSpreadsheet,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Download,
  ArrowRight,
  RefreshCw,
  Layers,
  FileCheck,
} from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { apiClient } from '../../services/apiClient';

export const AdminQuestionImportView: React.FC = () => {
  const [fileName, setFileName] = useState('');
  const [parsing, setParsing] = useState(false);
  const [validating, setValidating] = useState(false);
  const [committing, setCommitting] = useState(false);

  // Results
  const [validationResult, setValidationResult] = useState<any>(null);
  const [commitResult, setCommitResult] = useState<any>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setParsing(true);
    setValidationResult(null);
    setCommitResult(null);

    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

    const reader = new FileReader();

    if (isExcel) {
      reader.onload = (evt) => {
        try {
          const data = new Uint8Array(evt.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.SheetNames[0];
          const rawRows = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheet], { defval: '' });
          runValidation(file.name, rawRows);
        } catch (err: any) {
          alert('Không thể đọc file Excel: ' + err.message);
          setParsing(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      reader.onload = (evt) => {
        try {
          const text = evt.target?.result as string;
          const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
          runValidation(file.name, parsed.data);
        } catch (err: any) {
          alert('Không thể đọc file CSV: ' + err.message);
          setParsing(false);
        }
      };
      reader.readAsText(file);
    }
  };

  const runValidation = async (fName: string, rawRows: any[]) => {
    try {
      setValidating(true);
      const result = await apiClient.validateImport(fName, rawRows);
      setValidationResult(result);
    } catch (err: any) {
      alert('Lỗi kiểm tra tính hợp lệ: ' + err.message);
    } finally {
      setParsing(false);
      setValidating(false);
    }
  };

  const handleCommit = async () => {
    if (!validationResult || validationResult.validRowsData.length === 0) return;

    try {
      setCommitting(true);
      const res = await apiClient.commitImport(
        validationResult.fileName,
        validationResult.validRowsData
      );
      setCommitResult(res);
    } catch (err: any) {
      alert('Lỗi khi lưu vào cơ sở dữ liệu: ' + err.message);
    } finally {
      setCommitting(false);
    }
  };

  const downloadSampleCsv = () => {
    const sample = `Code,Topic,Subtopic,LOS_Code,Reading,Difficulty,Prompt,Option_A,Option_B,Option_C,Correct_Answer,Explanation
Q-FRA-SAMPLE-01,FRA,19,LOS 19.b,Reading 19: Leases,Medium,"Under IFRS 16, how is the principal portion of lease payments classified?","Cash flow from operating (CFO)","Cash flow from financing (CFF)","Cash flow from investing (CFI)",B,"Principal portion is classified as a financing outflow (CFF) under IFRS 16."
Q-FI-SAMPLE-02,Fixed Income,42,LOS 42.c,Reading 42: Duration,Hard,"Which measure captures bond price curvature sensitivity?","Macaulay Duration","Convexity","Effective Spread",B,"Convexity accounts for the non-linear curvature in bond price-yield relationships."
Q-ETH-SAMPLE-03,Ethics,1,LOS 1.b,Reading 01: Code of Ethics,Easy,"When local law is less strict than CFA Standards, members must:","Follow local law","Follow CFA Standards","Report conflict to SEC",B,"Members must adhere to the stricter regulation."`;

    const blob = new Blob([sample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'FES_CFA_Question_Import_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Import Ngân Hàng Câu Hỏi (Excel / CSV)</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Quy trình chuẩn: Tải lên $\rightarrow$ Kiểm định từng dòng (Row Validation) $\rightarrow$ Xem trước (Preview) $\rightarrow$ Giao dịch lưu an toàn (Atomic Commit).
          </p>
        </div>

        <button
          onClick={downloadSampleCsv}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold px-3.5 py-2 rounded-lg transition shrink-0"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          Tải file CSV mẫu chuẩn CFA
        </button>
      </div>

      {/* Upload Dropzone */}
      <div className="bg-slate-950/70 border-2 border-dashed border-slate-800 hover:border-emerald-500/50 rounded-2xl p-8 text-center transition group">
        <input
          type="file"
          id="fileImportInput"
          accept=".csv, .xlsx, .xls"
          onChange={handleFileUpload}
          className="hidden"
        />
        <label htmlFor="fileImportInput" className="cursor-pointer flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-emerald-400 group-hover:scale-110 transition shadow-inner">
            <UploadCloud className="w-7 h-7" />
          </div>
          <div className="mt-4 text-sm font-bold text-white">
            {fileName ? fileName : 'Kéo thả hoặc click để chọn file Excel (.xlsx) / CSV'}
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Hỗ trợ cấu trúc tiêu đề: Code, Topic, Reading, LOS, Prompt, Option A/B/C, Correct Answer, Explanation
          </p>
        </label>
      </div>

      {/* Parsing / Validating Spinner */}
      {(parsing || validating) && (
        <div className="p-6 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-center gap-3 text-xs text-slate-300">
          <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
          Đang quét kiểm định các trường dữ liệu và đối chiếu 10 Topic CFA...
        </div>
      )}

      {/* Validation Summary Cards */}
      {validationResult && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-xs text-slate-400">Tổng số dòng quét được</span>
              <div className="text-2xl font-black text-white mt-1">
                {validationResult.totalRows}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/40">
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Hợp lệ sẵn sàng Import
              </div>
              <div className="text-2xl font-black text-emerald-300 mt-1">
                {validationResult.validRowsCount}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-800/40">
              <div className="flex items-center gap-1.5 text-xs text-rose-400 font-semibold">
                <XCircle className="w-3.5 h-3.5" />
                Dòng chứa lỗi cần sửa
              </div>
              <div className="text-2xl font-black text-rose-300 mt-1">
                {validationResult.invalidRowsCount}
              </div>
            </div>
          </div>

          {/* Error Details if any */}
          {validationResult.errors.length > 0 && (
            <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-800/40 space-y-2 text-xs">
              <div className="font-bold text-rose-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Danh Sách Chi Tiết Lỗi Cần Khắc Phục (Row-Level Validation):
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-2">
                {validationResult.errors.map((err: any, idx: number) => (
                  <div key={idx} className="p-2 rounded bg-slate-900/80 border border-rose-900/30 text-slate-300 flex items-start gap-2">
                    <span className="font-mono text-rose-400 font-bold shrink-0">
                      Dòng {err.rowNumber} [{err.questionCode}]:
                    </span>
                    <span>{err.error}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interactive Preview Table */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-3.5 border-b border-slate-800 flex items-center justify-between text-xs font-bold text-white">
              <span>Bản Xem Trước (Import Preview - {validationResult.previewRows.length} câu)</span>
              {validationResult.validRowsCount > 0 && !commitResult && (
                <button
                  onClick={handleCommit}
                  disabled={committing}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-lg shadow-lg shadow-emerald-900/30 transition text-xs"
                >
                  <FileCheck className="w-4 h-4" />
                  {committing ? 'Đang ghi vào DB...' : `Xác Nhận Import ${validationResult.validRowsCount} Câu Hợp Lệ`}
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-400 text-[11px] uppercase font-bold sticky top-0">
                  <tr>
                    <th className="py-2.5 px-4">Dòng</th>
                    <th className="py-2.5 px-4">Mã</th>
                    <th className="py-2.5 px-4">Topic</th>
                    <th className="py-2.5 px-4">Nội dung tóm tắt</th>
                    <th className="py-2.5 px-4">Đáp án</th>
                    <th className="py-2.5 px-4">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {validationResult.previewRows.map((row: any) => (
                    <tr
                      key={row.rowNumber}
                      className={row.status === 'INVALID' ? 'bg-rose-950/10' : 'hover:bg-slate-900/40'}
                    >
                      <td className="py-2.5 px-4 font-mono text-slate-500">{row.rowNumber}</td>
                      <td className="py-2.5 px-4 font-mono font-bold text-emerald-400">{row.code}</td>
                      <td className="py-2.5 px-4 text-slate-300">{row.topic}</td>
                      <td className="py-2.5 px-4 text-slate-300 max-w-sm truncate">{row.prompt}</td>
                      <td className="py-2.5 px-4 font-mono font-bold text-slate-200">{row.correctAnswer}</td>
                      <td className="py-2.5 px-4">
                        {row.status === 'VALID' ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            Hợp lệ
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                            Lỗi
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Success Banner on Commit */}
          {commitResult && (
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <div>
                  <div className="font-bold text-white text-sm">
                    Giao dịch hoàn tất! Đã Import thành công {commitResult.importedCount} câu hỏi.
                  </div>
                  <div className="text-slate-400 mt-0.5">
                    Mã job: <code className="text-emerald-300">{commitResult.jobId}</code> • Toàn bộ câu hỏi đã sẵn sàng trong Ngân hàng câu hỏi.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
