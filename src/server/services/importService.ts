import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { db } from '../db/database';
import { Question, QuestionImportJob, QuestionOption, QuestionVersion, Topic } from '../db/schema';
import { recordAuditLog } from './auditService';
import { getCurrentUserContext } from './authService';

export interface RawImportRow {
  code?: string;
  topic?: string;
  subtopic?: string;
  los_code?: string;
  reading?: string;
  difficulty?: string;
  scenario?: string;
  prompt: string;
  option_a: string;
  option_b: string;
  option_c: string;
  correct_answer: string;
  explanation: string;
}

export interface RowValidationError {
  rowNumber: number;
  questionCode: string;
  field: string;
  error: string;
}

export interface ImportValidationResult {
  fileName: string;
  totalRows: number;
  validRowsCount: number;
  invalidRowsCount: number;
  errors: RowValidationError[];
  previewRows: Array<{
    rowNumber: number;
    code: string;
    topic: string;
    prompt: string;
    correctAnswer: string;
    status: 'VALID' | 'INVALID';
    error?: string;
  }>;
  validRowsData: RawImportRow[];
}

export function parseFileContent(
  fileBuffer: Buffer | string,
  fileName: string
): RawImportRow[] {
  const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');

  if (isExcel) {
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' }) as any[];

    return jsonData.map((row) => normalizeRowKeys(row));
  } else {
    const csvString = typeof fileBuffer === 'string' ? fileBuffer : fileBuffer.toString('utf-8');
    const parsed = Papa.parse(csvString, { header: true, skipEmptyLines: true });
    return (parsed.data as any[]).map((row) => normalizeRowKeys(row));
  }
}

function normalizeRowKeys(rawRow: any): RawImportRow {
  const norm: Record<string, string> = {};
  for (const [k, v] of Object.entries(rawRow)) {
    const cleanKey = k.trim().toLowerCase().replace(/[\s_-]+/g, '');
    norm[cleanKey] = String(v || '').trim();
  }

  return {
    code: norm['code'] || norm['questioncode'] || norm['id'] || '',
    topic: norm['topic'] || norm['topicid'] || norm['cfatopic'] || '',
    subtopic: norm['subtopic'] || norm['readingnumber'] || '',
    los_code: norm['loscode'] || norm['los'] || 'LOS 1.a',
    reading: norm['reading'] || 'Reading General',
    difficulty: norm['difficulty'] || 'Medium',
    scenario: norm['scenario'] || norm['vignette'] || '',
    prompt: norm['prompt'] || norm['question'] || norm['questionprompt'] || norm['stem'] || '',
    option_a: norm['optiona'] || norm['a'] || '',
    option_b: norm['optionb'] || norm['b'] || '',
    option_c: norm['optionc'] || norm['c'] || '',
    correct_answer: (norm['correctanswer'] || norm['answer'] || norm['correct'] || '').toUpperCase(),
    explanation: norm['explanation'] || norm['rationale'] || '',
  };
}

export function validateQuestionImport(
  fileName: string,
  rawRows: RawImportRow[]
): ImportValidationResult {
  const validTopics = db.getTable('topics');
  const existingQuestions = db.getTable('questions');
  const existingCodes = new Set(existingQuestions.map((q) => q.question_code.toLowerCase()));

  const errors: RowValidationError[] = [];
  const validRowsData: RawImportRow[] = [];
  const previewRows: ImportValidationResult['previewRows'] = [];
  const seenCodesInBatch = new Set<string>();

  rawRows.forEach((row, idx) => {
    const rowNum = idx + 2; // 1-based, considering header as row 1
    const code = row.code || `Q-IMP-${rowNum}`;
    const rowErrors: string[] = [];

    // 1. Required prompt
    if (!row.prompt) {
      rowErrors.push('Thiếu nội dung câu hỏi (Question Prompt)');
    }

    // 2. Options check
    if (!row.option_a || !row.option_b || !row.option_c) {
      rowErrors.push('Thiếu một trong ba đáp án (Option A, B, C bắt buộc)');
    }

    // 3. Correct answer validation
    if (!['A', 'B', 'C'].includes(row.correct_answer)) {
      rowErrors.push(`Đáp án đúng không hợp lệ: "${row.correct_answer}". Bắt buộc phải là A, B, hoặc C.`);
    }

    // 4. Topic check
    const rowTopic = (row.topic || '').trim();
    const matchedTopic = validTopics.find(
      (t) =>
        t.id.toLowerCase() === rowTopic.toLowerCase() ||
        t.code.toLowerCase() === rowTopic.toLowerCase() ||
        t.name.toLowerCase().includes(rowTopic.toLowerCase())
    );
    if (!matchedTopic && rowTopic) {
      rowErrors.push(`Chủ đề Topic không tồn tại: "${rowTopic}". Chỉ chấp nhận 10 Topic CFA chuẩn.`);
    }

    // 5. Difficulty check
    if (row.difficulty && !['Easy', 'Medium', 'Hard'].includes(row.difficulty)) {
      rowErrors.push(`Mức độ khó không hợp lệ: "${row.difficulty}". Phải là Easy, Medium, hoặc Hard.`);
    }

    // 6. Duplicate code check
    if (existingCodes.has(code.toLowerCase())) {
      rowErrors.push(`Mã câu hỏi "${code}" đã tồn tại trong Question Bank.`);
    }
    if (seenCodesInBatch.has(code.toLowerCase())) {
      rowErrors.push(`Mã câu hỏi trùng lặp trong chính file import: "${code}".`);
    } else {
      seenCodesInBatch.add(code.toLowerCase());
    }

    // Record
    if (rowErrors.length > 0) {
      rowErrors.forEach((err) => {
        errors.push({
          rowNumber: rowNum,
          questionCode: code,
          field: 'Row',
          error: err,
        });
      });
      previewRows.push({
        rowNumber: rowNum,
        code,
        topic: rowTopic || 'N/A',
        prompt: row.prompt.substring(0, 60) + (row.prompt.length > 60 ? '...' : ''),
        correctAnswer: row.correct_answer,
        status: 'INVALID',
        error: rowErrors.join(' | '),
      });
    } else {
      const normalizedRow: RawImportRow = {
        ...row,
        code,
        topic: matchedTopic ? matchedTopic.id : 'fra',
        difficulty: (row.difficulty as any) || 'Medium',
      };
      validRowsData.push(normalizedRow);
      previewRows.push({
        rowNumber: rowNum,
        code,
        topic: matchedTopic ? matchedTopic.name : 'FRA',
        prompt: row.prompt.substring(0, 60) + (row.prompt.length > 60 ? '...' : ''),
        correctAnswer: row.correct_answer,
        status: 'VALID',
      });
    }
  });

  return {
    fileName,
    totalRows: rawRows.length,
    validRowsCount: validRowsData.length,
    invalidRowsCount: errors.length,
    errors,
    previewRows,
    validRowsData,
  };
}

export function commitQuestionImport(params: {
  fileName: string;
  validRows: RawImportRow[];
}) {
  const { user } = getCurrentUserContext();
  const now = new Date().toISOString();

  return db.runInTransaction(() => {
    let successCount = 0;

    params.validRows.forEach((row, idx) => {
      const qId = `q-imp-${Date.now()}-${idx + 1}`;
      const vId = `qv-${qId}-v1`;

      const question: Question = {
        id: qId,
        question_code: row.code!,
        topic_id: row.topic || 'fra',
        los_code: row.los_code || 'LOS 19.b',
        reading: row.reading || 'Reading General',
        difficulty: (row.difficulty as any) || 'Medium',
        current_version_id: vId,
        status: 'Active',
        created_by: user.id,
        created_at: now,
        updated_at: now,
      };
      db.insert('questions', question);

      const version: QuestionVersion = {
        id: vId,
        question_id: qId,
        version_number: 1,
        scenario_text: row.scenario,
        prompt: row.prompt,
        correct_answer: row.correct_answer as 'A' | 'B' | 'C',
        explanation: row.explanation || 'No detailed explanation provided in import.',
        change_summary: `Imported from ${params.fileName}`,
        is_published: true,
        published_at: now,
        created_by: user.id,
        created_at: now,
      };
      db.insert('question_versions', version);

      const options = [
        { key: 'A', text: row.option_a },
        { key: 'B', text: row.option_b },
        { key: 'C', text: row.option_c },
      ];

      options.forEach((opt) => {
        db.insert('question_options', {
          id: `opt-${vId}-${opt.key}`,
          question_version_id: vId,
          option_key: opt.key as 'A' | 'B' | 'C',
          option_text: opt.text,
        });
      });

      successCount += 1;
    });

    const job: QuestionImportJob = {
      id: `job-${Date.now()}`,
      admin_id: user.id,
      file_name: params.fileName,
      total_rows: params.validRows.length,
      successful_rows: successCount,
      failed_rows: 0,
      error_log: [],
      status: 'COMPLETED',
      created_at: now,
    };
    db.insert('question_import_jobs', job);

    recordAuditLog({
      actor_id: user.id,
      actor_name: user.email,
      action: 'QUESTIONS_BULK_IMPORTED',
      entity_type: 'questions',
      entity_id: job.id,
      new_values: { fileName: params.fileName, importedCount: successCount },
    });

    return {
      success: true,
      importedCount: successCount,
      jobId: job.id,
    };
  });
}
