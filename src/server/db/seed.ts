import { db } from './database';
import {
  Course,
  CourseModule,
  Lesson,
  MockExam,
  MockExamQuestion,
  Permission,
  Question,
  QuestionOption,
  QuestionVersion,
  Role,
  RolePermission,
  Subtopic,
  Topic,
  User,
  UserProfile,
  Video,
} from './schema';

export function seedDatabaseIfNeeded(force = false): void {
  const users = db.getTable('users');
  if (users.length > 0 && !force) {
    return; // Already seeded
  }

  if (force) {
    db.resetDatabase();
  }

  const now = new Date().toISOString();

  // 1. Roles
  const roles: Role[] = [
    {
      id: 'ADMIN',
      name: 'Super Administrator',
      description: 'Full access to Admin CMS, user management, and Q-Bank',
      created_at: now,
    },
    {
      id: 'CONTENT_MANAGER',
      name: 'Content Manager',
      description: 'Manage Question Bank, import questions, and build Mock Exams',
      created_at: now,
    },
    {
      id: 'INSTRUCTOR',
      name: 'Course Instructor',
      description: 'Author courses, upload video lectures, and review student progress',
      created_at: now,
    },
    {
      id: 'STUDENT',
      name: 'CFA Candidate',
      description: 'Access Student LMS, take Mock Exams, watch videos, view personal results',
      created_at: now,
    },
  ];
  roles.forEach((r) => db.insert('roles', r));

  // 2. Permissions
  const permissions: Permission[] = [
    { id: 'qbank:view', category: 'QBANK', description: 'View question bank', created_at: now },
    { id: 'qbank:edit', category: 'QBANK', description: 'Create and edit questions', created_at: now },
    { id: 'qbank:publish', category: 'QBANK', description: 'Publish question versions', created_at: now },
    { id: 'qbank:import', category: 'QBANK', description: 'Import questions via CSV/Excel', created_at: now },
    { id: 'exam:manage', category: 'EXAMS', description: 'Build and configure mock exams', created_at: now },
    { id: 'exam:publish', category: 'EXAMS', description: 'Publish/unpublish exams', created_at: now },
    { id: 'course:manage', category: 'COURSES', description: 'Manage courses and lectures', created_at: now },
    { id: 'students:view', category: 'STUDENTS', description: 'View student cohorts and attempts', created_at: now },
    { id: 'system:audit', category: 'SYSTEM', description: 'View audit logs', created_at: now },
  ];
  permissions.forEach((p) => db.insert('permissions', p));

  // Role Permissions
  const rolePerms: RolePermission[] = [
    // ADMIN has all
    ...permissions.map((p) => ({ role_id: 'ADMIN' as const, permission_id: p.id, granted_at: now })),
    // CONTENT_MANAGER
    { role_id: 'CONTENT_MANAGER', permission_id: 'qbank:view', granted_at: now },
    { role_id: 'CONTENT_MANAGER', permission_id: 'qbank:edit', granted_at: now },
    { role_id: 'CONTENT_MANAGER', permission_id: 'qbank:publish', granted_at: now },
    { role_id: 'CONTENT_MANAGER', permission_id: 'qbank:import', granted_at: now },
    { role_id: 'CONTENT_MANAGER', permission_id: 'exam:manage', granted_at: now },
    { role_id: 'CONTENT_MANAGER', permission_id: 'exam:publish', granted_at: now },
    // INSTRUCTOR
    { role_id: 'INSTRUCTOR', permission_id: 'course:manage', granted_at: now },
    { role_id: 'INSTRUCTOR', permission_id: 'students:view', granted_at: now },
  ];
  rolePerms.forEach((rp) => db.insert('role_permissions', rp));

  // 3. Users & User Profiles
  const defaultUsers: { user: User; profile: UserProfile }[] = [
    {
      user: {
        id: 'usr-admin-01',
        role_id: 'ADMIN',
        email: 'admin@fes.edu.vn',
        password_hash: 'admin123', // In production: argon2id
        is_active: true,
        is_email_verified: true,
        last_login_at: now,
        created_at: now,
        updated_at: now,
      },
      profile: {
        user_id: 'usr-admin-01',
        full_name: 'FES System Admin',
        phone_number: '+84 901 234 567',
        cfa_level: 'Level I',
        study_title: 'System Administrator',
        target_mps: 70,
        forecast_score: 85,
        readiness_index: 95,
        streak_days: 45,
        updated_at: now,
      },
    },
    {
      user: {
        id: 'usr-content-01',
        role_id: 'CONTENT_MANAGER',
        email: 'content@fes.edu.vn',
        password_hash: 'content123',
        is_active: true,
        is_email_verified: true,
        last_login_at: now,
        created_at: now,
        updated_at: now,
      },
      profile: {
        user_id: 'usr-content-01',
        full_name: 'Trần Thị Thu Thảo, CFA',
        phone_number: '+84 912 345 678',
        cfa_level: 'Level I',
        study_title: 'Head of Content & Examinations',
        target_mps: 70,
        forecast_score: 90,
        readiness_index: 98,
        streak_days: 60,
        updated_at: now,
      },
    },
    {
      user: {
        id: 'usr-instructor-01',
        role_id: 'INSTRUCTOR',
        email: 'instructor@fes.edu.vn',
        password_hash: 'instructor123',
        is_active: true,
        is_email_verified: true,
        last_login_at: now,
        created_at: now,
        updated_at: now,
      },
      profile: {
        user_id: 'usr-instructor-01',
        full_name: 'Nguyễn Tiến Dũng, CFA',
        phone_number: '+84 987 654 321',
        cfa_level: 'Level I',
        study_title: 'Senior Portfolio Manager & Lead Lecturer',
        target_mps: 70,
        forecast_score: 92,
        readiness_index: 99,
        streak_days: 120,
        updated_at: now,
      },
    },
    {
      user: {
        id: 'usr-student-01',
        role_id: 'STUDENT',
        email: 'student@fes.edu.vn',
        password_hash: 'student123',
        is_active: true,
        is_email_verified: true,
        last_login_at: now,
        created_at: now,
        updated_at: now,
      },
      profile: {
        user_id: 'usr-student-01',
        full_name: 'Nguyễn Văn An',
        phone_number: '+84 933 111 222',
        target_exam_date: '2026-11-15',
        cfa_level: 'Level I',
        study_title: 'CFA® Candidate (Nov 2026 Sitting)',
        target_mps: 70.0,
        forecast_score: 74.4,
        readiness_index: 78.0,
        streak_days: 14,
        last_active_date: now.split('T')[0],
        updated_at: now,
      },
    },
  ];

  defaultUsers.forEach(({ user, profile }) => {
    db.insert('users', user);
    db.insert('user_profiles', profile);
  });

  // 4. CFA Level I Topics
  const topics: Topic[] = [
    { id: 'ethics', cfa_level: 'Level I', name: 'Ethical & Professional Standards', code: 'ETH', weight_min: 15, weight_max: 20, display_order: 1, created_at: now },
    { id: 'quant', cfa_level: 'Level I', name: 'Quantitative Methods', code: 'QM', weight_min: 6, weight_max: 9, display_order: 2, created_at: now },
    { id: 'econ', cfa_level: 'Level I', name: 'Economics', code: 'ECON', weight_min: 6, weight_max: 9, display_order: 3, created_at: now },
    { id: 'fra', cfa_level: 'Level I', name: 'Financial Reporting & Analysis (FRA)', code: 'FRA', weight_min: 11, weight_max: 14, display_order: 4, created_at: now },
    { id: 'corp-issuers', cfa_level: 'Level I', name: 'Corporate Issuers', code: 'CI', weight_min: 6, weight_max: 9, display_order: 5, created_at: now },
    { id: 'equity', cfa_level: 'Level I', name: 'Equity Investments', code: 'EQ', weight_min: 11, weight_max: 14, display_order: 6, created_at: now },
    { id: 'fixed-income', cfa_level: 'Level I', name: 'Fixed Income', code: 'FI', weight_min: 11, weight_max: 14, display_order: 7, created_at: now },
    { id: 'derivatives', cfa_level: 'Level I', name: 'Derivatives', code: 'DER', weight_min: 5, weight_max: 8, display_order: 8, created_at: now },
    { id: 'alt-investments', cfa_level: 'Level I', name: 'Alternative Investments', code: 'AI', weight_min: 7, weight_max: 10, display_order: 9, created_at: now },
    { id: 'portfolio-mgmt', cfa_level: 'Level I', name: 'Portfolio Management', code: 'PM', weight_min: 8, weight_max: 12, display_order: 10, created_at: now },
  ];
  topics.forEach((t) => db.insert('topics', t));

  // 5. Subtopics
  const subtopics: Subtopic[] = [
    { id: 'sub-fra-19', topic_id: 'fra', reading_number: 19, name: 'Leases & Long-Term Liabilities', los_code: 'LOS 19.a', display_order: 1, created_at: now },
    { id: 'sub-fra-20', topic_id: 'fra', reading_number: 20, name: 'Income Taxes & Deferred Tax Assets', los_code: 'LOS 20.b', display_order: 2, created_at: now },
    { id: 'sub-fi-42', topic_id: 'fixed-income', reading_number: 42, name: 'Duration, Convexity and Immunization', los_code: 'LOS 42.c', display_order: 1, created_at: now },
    { id: 'sub-fi-43', topic_id: 'fixed-income', reading_number: 43, name: 'Credit Analysis Models & Spreads', los_code: 'LOS 43.a', display_order: 2, created_at: now },
    { id: 'sub-eq-35', topic_id: 'equity', reading_number: 35, name: 'Discounted Dividend Valuation', los_code: 'LOS 35.d', display_order: 1, created_at: now },
    { id: 'sub-eth-01', topic_id: 'ethics', reading_number: 1, name: 'Code of Ethics & Standards of Professional Conduct', los_code: 'LOS 1.b', display_order: 1, created_at: now },
    { id: 'sub-qm-06', topic_id: 'quant', reading_number: 6, name: 'Time Value of Money & Cash Flow Additivity', los_code: 'LOS 6.a', display_order: 1, created_at: now },
  ];
  subtopics.forEach((st) => db.insert('subtopics', st));

  // 6. Courses, Modules, Lessons, Videos
  const fraCourse: Course = {
    id: 'cfa-l1-fra',
    topic_id: 'fra',
    title: 'Financial Statement Analysis (FRA)',
    level: 'Level I',
    description: 'Chinh phục chuyên sâu Báo cáo Tài chính, IFRS vs US GAAP, Phân tích Thuế hoãn lại và Thuê tài sản.',
    instructor_name: 'Nguyễn Tiến Dũng, CFA',
    instructor_title: 'Senior Portfolio Manager',
    badge: 'Trọng số cao (11-14%)',
    is_published: true,
    display_order: 1,
    created_at: now,
    updated_at: now,
  };
  db.insert('courses', fraCourse);

  const modFra1: CourseModule = {
    id: 'mod-fra-01',
    course_id: 'cfa-l1-fra',
    title: 'Module 01: Giới thiệu Phân tích Báo cáo Tài chính',
    description: 'Nền tảng các chuẩn mực kế toán IFRS & US GAAP, cấu trúc bộ BCTC hợp nhất.',
    display_order: 1,
    created_at: now,
  };
  db.insert('course_modules', modFra1);

  const modFra2: CourseModule = {
    id: 'mod-fra-02',
    course_id: 'cfa-l1-fra',
    title: 'Module 02: Báo cáo Kết quả Kinh doanh & Lưu chuyển Tiền tệ',
    description: 'Ghi nhận doanh thu, phân loại chi phí, chiết khấu và phân tích dòng tiền hoạt động.',
    display_order: 2,
    created_at: now,
  };
  db.insert('course_modules', modFra2);

  const modFra3: CourseModule = {
    id: 'mod-fra-03',
    course_id: 'cfa-l1-fra',
    title: 'Module 03: Thuê tài sản (Leases) & Nợ dài hạn',
    description: 'IFRS 16 vs US GAAP Topic 842, quyền sử dụng tài sản (ROU Asset) và nghĩa vụ nợ thuê.',
    display_order: 3,
    created_at: now,
  };
  db.insert('course_modules', modFra3);

  // Lessons for FRA
  const lessons: Lesson[] = [
    {
      id: 'les-fra-01',
      module_id: 'mod-fra-01',
      course_id: 'cfa-l1-fra',
      subtopic_id: 'sub-fra-19',
      title: 'Lesson 01: Tổng quan Khung pháp lý & Chuẩn mực IFRS',
      los_code: 'LOS 18.a',
      description: 'Hiểu rõ các nguyên tắc cốt lõi của IFRS Framework và US GAAP Conceptual Framework.',
      key_takeaways: [
        'Tính hữu ích của thông tin: Trung thực và Thích hợp',
        'Sự khác biệt chính giữa US GAAP và IFRS về việc đánh giá lại tài sản (Revaluation)',
      ],
      display_order: 1,
      is_free_preview: true,
      is_published: true,
      created_at: now,
      updated_at: now,
    },
    {
      id: 'les-fra-02',
      module_id: 'mod-fra-02',
      course_id: 'cfa-l1-fra',
      title: 'Lesson 02: Revenue Recognition Under IFRS 15',
      los_code: 'LOS 19.a',
      description: 'Mô hình 5 bước ghi nhận doanh thu từ hợp đồng với khách hàng.',
      key_takeaways: [
        'Xác định nghĩa vụ thực hiện riêng biệt (Performance Obligations)',
        'Phân bổ giá giao dịch dựa trên giá bán độc lập tương đối (Standalone Selling Price)',
      ],
      display_order: 2,
      is_free_preview: false,
      is_published: true,
      created_at: now,
      updated_at: now,
    },
    {
      id: 'les-fra-03',
      module_id: 'mod-fra-03',
      course_id: 'cfa-l1-fra',
      subtopic_id: 'sub-fra-19',
      title: 'Lesson 03: Phân tích Chuyên sâu Kế toán Thuê tài sản (IFRS 16)',
      los_code: 'LOS 19.b',
      description: 'Xử lý Right-of-Use Asset (ROU) và Lease Liability trên bảng cân đối kế toán.',
      key_takeaways: [
        'IFRS 16 yêu cầu ghi nhận toàn bộ hợp đồng thuê vào Bảng CĐKT (trừ giá trị nhỏ / ngắn hạn)',
        'EBITDA tăng lên vì chi phí thuê chuyển thành khấu hao ROU và chi phí lãi vay',
        'Dòng tiền hoạt động CFO tăng do phần hoàn trả nợ gốc thuộc CFF',
      ],
      display_order: 3,
      is_free_preview: false,
      is_published: true,
      created_at: now,
      updated_at: now,
    },
  ];
  lessons.forEach((l) => db.insert('lessons', l));

  // Videos
  const videos: Video[] = [
    {
      id: 'vid-fra-01',
      lesson_id: 'les-fra-01',
      provider: 'hls',
      video_url: 'https://storage.googleapis.com/fes-lms-assets/videos/fra-les-01.m3u8',
      duration_seconds: 2400, // 40m
      resolution_modes: ['360p', '720p', '1080p'],
      status: 'ready',
      created_at: now,
    },
    {
      id: 'vid-fra-02',
      lesson_id: 'les-fra-02',
      provider: 'hls',
      video_url: 'https://storage.googleapis.com/fes-lms-assets/videos/fra-les-02.m3u8',
      duration_seconds: 2700, // 45m
      resolution_modes: ['360p', '720p', '1080p'],
      status: 'ready',
      created_at: now,
    },
    {
      id: 'vid-fra-03',
      lesson_id: 'les-fra-03',
      provider: 'hls',
      video_url: 'https://storage.googleapis.com/fes-lms-assets/videos/fra-les-03.m3u8',
      duration_seconds: 2950, // 49m 10s
      resolution_modes: ['360p', '720p', '1080p'],
      status: 'ready',
      created_at: now,
    },
  ];
  videos.forEach((v) => db.insert('videos', v));

  // Initial video progress for student resuming at 24:35 (1475 seconds)
  db.insert('video_progress', {
    id: 'vp-student-fra-03',
    user_id: 'usr-student-01',
    video_id: 'vid-fra-03',
    last_playback_seconds: 1475, // 24:35
    max_watched_seconds: 1520,
    watched_percentage: 51.5,
    is_completed: false,
    last_heartbeat_at: now,
  });

  // 7. Question Bank Seeding with Immutable Versions
  interface SeedQuestionItem {
    code: string;
    topic_id: string;
    subtopic_id: string;
    los_code: string;
    reading: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    prompt: string;
    scenario_text?: string;
    options: { key: 'A' | 'B' | 'C'; text: string; subtext?: string }[];
    correct_answer: 'A' | 'B' | 'C';
    explanation: string;
  }

  const seedQuestions: SeedQuestionItem[] = [
    {
      code: 'Q-FRA-001',
      topic_id: 'fra',
      subtopic_id: 'sub-fra-19',
      los_code: 'LOS 19.b',
      reading: 'Reading 19: Leases & Long-Term Liabilities',
      difficulty: 'Medium',
      prompt: 'Under IFRS 16, compared to treating a lease as an operating lease under prior standards, recognizing the lease on the lessee’s balance sheet will most likely cause which of the following metrics to increase in the early years of the lease?',
      options: [
        { key: 'A', text: 'Interest coverage ratio (EBIT / Interest expense)' },
        { key: 'B', text: 'Operating cash flow (CFO)' },
        { key: 'C', text: 'Return on assets (ROA)' },
      ],
      correct_answer: 'B',
      explanation: 'Under IFRS 16, lease payments are partitioned into interest expense (which reduces CFO or CFF depending on accounting policy) and principal repayment (which is classified as financing cash outflow, CFF). Previously, the entire operating lease payment was a deduction from CFO. Moving principal payments from CFO to CFF causes reported CFO to increase.',
    },
    {
      code: 'Q-FRA-002',
      topic_id: 'fra',
      subtopic_id: 'sub-fra-20',
      los_code: 'LOS 20.b',
      reading: 'Reading 20: Income Taxes',
      difficulty: 'Hard',
      prompt: 'A company reports accounting depreciation of $45,000 and tax depreciation of $65,000 for the current year. Assuming an enacted statutory tax rate of 25%, the effect of this temporary difference on the balance sheet is most accurately described as:',
      options: [
        { key: 'A', text: 'An increase in a Deferred Tax Liability (DTL) of $5,000.' },
        { key: 'B', text: 'An increase in a Deferred Tax Asset (DTA) of $5,000.' },
        { key: 'C', text: 'A decrease in Taxes Payable of $20,000.' },
      ],
      correct_answer: 'A',
      explanation: 'Tax depreciation ($65,000) exceeds financial statement depreciation ($45,000) by $20,000. This creates a taxable temporary difference because the carrying amount of the asset exceeds its tax base. Temporary difference of $20,000 × 25% tax rate = $5,000 increase in Deferred Tax Liability (DTL).',
    },
    {
      code: 'Q-FI-001',
      topic_id: 'fixed-income',
      subtopic_id: 'sub-fi-42',
      los_code: 'LOS 42.c',
      reading: 'Reading 42: Duration & Convexity',
      difficulty: 'Medium',
      prompt: 'An investor holds an 8-year annual-pay coupon bond with an annual modified duration of 6.2 years and an annual convexity of 48.0. If market yields increase by 100 basis points (+1.00%), the estimated percentage price change of the bond using both duration and convexity is closest to:',
      options: [
        { key: 'A', text: '-6.20%' },
        { key: 'B', text: '-5.96%' },
        { key: 'C', text: '-6.44%' },
      ],
      correct_answer: 'B',
      explanation: '%ΔPrice ≈ -ModDur × Δy + 0.5 × Convexity × (Δy)^2 = -6.2 × (0.01) + 0.5 × 48.0 × (0.01)^2 = -0.0620 + 0.0024 = -0.0596, or -5.96%. Convexity mitigates the price decline resulting from an interest rate increase.',
    },
    {
      code: 'Q-ETH-001',
      topic_id: 'ethics',
      subtopic_id: 'sub-eth-01',
      los_code: 'LOS 1.b',
      reading: 'Reading 01: Code of Ethics and Standards',
      difficulty: 'Easy',
      prompt: 'According to Standard I(A) Knowledge of the Law, if an applicable local law or regulation conflicts with the CFA Institute Code and Standards, members and candidates must comply with:',
      options: [
        { key: 'A', text: 'The local law or regulation in all cases.' },
        { key: 'B', text: 'The stricter of the applicable law, regulation, or the Code and Standards.' },
        { key: 'C', text: 'The Code and Standards regardless of local legal penalties.' },
      ],
      correct_answer: 'B',
      explanation: 'Under Standard I(A), members and candidates must obey the more strict law, rule, or regulation (including the Code and Standards).',
    },
    {
      code: 'Q-EQ-001',
      topic_id: 'equity',
      subtopic_id: 'sub-eq-35',
      los_code: 'LOS 35.d',
      reading: 'Reading 35: Discounted Dividend Valuation',
      difficulty: 'Medium',
      prompt: 'A company recently paid an annual dividend of $2.50 per share (D0). Dividends are projected to grow indefinitely at a constant rate of 4.5% per year. If the required return on equity is 9.5%, the intrinsic value of the share using the Gordon Growth Model is closest to:',
      options: [
        { key: 'A', text: '$50.00' },
        { key: 'B', text: '$52.25' },
        { key: 'C', text: '$55.00' },
      ],
      correct_answer: 'B',
      explanation: 'D1 = D0 × (1 + g) = $2.50 × 1.045 = $2.6125. P0 = D1 / (r - g) = $2.6125 / (0.095 - 0.045) = $2.6125 / 0.05 = $52.25.',
    },
  ];

  seedQuestions.forEach((sq, idx) => {
    const qId = `q-seed-${idx + 1}`;
    const vId = `qv-seed-${idx + 1}-v1`;

    const question: Question = {
      id: qId,
      question_code: sq.code,
      topic_id: sq.topic_id,
      subtopic_id: sq.subtopic_id,
      los_code: sq.los_code,
      reading: sq.reading,
      difficulty: sq.difficulty,
      current_version_id: vId,
      status: 'Active',
      created_by: 'usr-content-01',
      created_at: now,
      updated_at: now,
    };
    db.insert('questions', question);

    const version: QuestionVersion = {
      id: vId,
      question_id: qId,
      version_number: 1,
      scenario_text: sq.scenario_text,
      prompt: sq.prompt,
      correct_answer: sq.correct_answer,
      explanation: sq.explanation,
      change_summary: 'Initial release from CFA 2026 Core Syllabus.',
      is_published: true,
      published_at: now,
      created_by: 'usr-content-01',
      created_at: now,
    };
    db.insert('question_versions', version);

    sq.options.forEach((opt) => {
      const optionRecord: QuestionOption = {
        id: `opt-${vId}-${opt.key}`,
        question_version_id: vId,
        option_key: opt.key,
        option_text: opt.text,
        subtext: opt.subtext,
      };
      db.insert('question_options', optionRecord);
    });
  });

  // 8. Mock Exam 01
  const mockExam01: MockExam = {
    id: 'cfa-mock-2026-am',
    title: 'CFA® Level I - Mock Exam AM Session (Standard)',
    subtitle: 'Đề thi thử toàn diện 10 Topic chuẩn cấu trúc CFA Institute 2026',
    scope: 'Toàn diện 10 Topic CFA Level I',
    level: 'Level I',
    format_year: '2026',
    difficulty: 'Standard CFA',
    duration_minutes: 135,
    total_questions: 5, // Representative seed items
    passing_score_mps: 70.0,
    is_published: true,
    is_recommended: true,
    priority_label: 'Khuyên dùng',
    is_nationwide: false,
    created_by: 'usr-content-01',
    created_at: now,
    updated_at: now,
  };
  db.insert('mock_exams', mockExam01);

  // Link questions to Mock Exam 01 with FROZEN question_version_id
  const examItems: MockExamQuestion[] = [
    { id: 'meq-1', mock_exam_id: 'cfa-mock-2026-am', question_version_id: 'qv-seed-1-v1', question_order: 1, points: 1, created_at: now },
    { id: 'meq-2', mock_exam_id: 'cfa-mock-2026-am', question_version_id: 'qv-seed-2-v1', question_order: 2, points: 1, created_at: now },
    { id: 'meq-3', mock_exam_id: 'cfa-mock-2026-am', question_version_id: 'qv-seed-3-v1', question_order: 3, points: 1, created_at: now },
    { id: 'meq-4', mock_exam_id: 'cfa-mock-2026-am', question_version_id: 'qv-seed-4-v1', question_order: 4, points: 1, created_at: now },
    { id: 'meq-5', mock_exam_id: 'cfa-mock-2026-am', question_version_id: 'qv-seed-5-v1', question_order: 5, points: 1, created_at: now },
  ];
  examItems.forEach((meq) => db.insert('mock_exam_questions', meq));

  // 9. Historical Student Exam Attempt (Seed data to prove past exam review immutability)
  const attemptId = 'att-student-mock-01';
  db.insert('exam_attempts', {
    id: attemptId,
    user_id: 'usr-student-01',
    mock_exam_id: 'cfa-mock-2026-am',
    status: 'completed',
    current_question_index: 4,
    remaining_seconds: 3200,
    total_duration_seconds: 8100,
    time_spent_seconds: 4900,
    is_paused: false,
    font_size_preference: 'normal',
    score_percentage: 60.0,
    passed_mps: false,
    correct_count: 3,
    incorrect_count: 2,
    unanswered_count: 0,
    percentile_rank: 64.5,
    started_at: new Date(Date.now() - 86400000).toISOString(),
    last_heartbeat_at: new Date(Date.now() - 86400000).toISOString(),
    completed_at: new Date(Date.now() - 86400000 + 4900000).toISOString(),
  });

  // Student Answers pointing immutably to qv-seed-*-v1
  db.insert('exam_answers', {
    id: 'ans-1',
    attempt_id: attemptId,
    question_version_id: 'qv-seed-1-v1',
    question_order: 1,
    selected_option: 'A', // Incorrect (Correct is B) -> Identifies FRA as weak!
    is_correct: false,
    is_flagged: false,
    time_spent_seconds: 90,
  });
  db.insert('exam_answers', {
    id: 'ans-2',
    attempt_id: attemptId,
    question_version_id: 'qv-seed-2-v1',
    question_order: 2,
    selected_option: 'A', // Correct
    is_correct: true,
    is_flagged: false,
    time_spent_seconds: 110,
  });
  db.insert('exam_answers', {
    id: 'ans-3',
    attempt_id: attemptId,
    question_version_id: 'qv-seed-3-v1',
    question_order: 3,
    selected_option: 'B', // Correct
    is_correct: true,
    is_flagged: true,
    time_spent_seconds: 85,
  });
  db.insert('exam_answers', {
    id: 'ans-4',
    attempt_id: attemptId,
    question_version_id: 'qv-seed-4-v1',
    question_order: 4,
    selected_option: 'B', // Correct
    is_correct: true,
    is_flagged: false,
    time_spent_seconds: 45,
  });
  db.insert('exam_answers', {
    id: 'ans-5',
    attempt_id: attemptId,
    question_version_id: 'qv-seed-5-v1',
    question_order: 5,
    selected_option: 'A', // Incorrect (Correct is B)
    is_correct: false,
    is_flagged: false,
    time_spent_seconds: 70,
  });

  // Exam Result
  db.insert('exam_results', {
    attempt_id: attemptId,
    total_questions: 5,
    score_percentage: 60.0,
    mps_percentage: 70.0,
    passed_mps: false,
    confidence_band_min: 55.5,
    confidence_band_max: 64.5,
    percentile_rank: 64.5,
    avg_seconds_per_question: 80,
    mentor_note: 'Bạn đạt 60.0% trong bài thi thử gần nhất. Cần chú trọng cải thiện chuyên sâu mảng FRA (Leases & ROU Asset) và Equity Valuation để vượt ngưỡng MPS 70%.',
    created_at: now,
  });

  // Topic Performance breakdown
  db.insert('topic_performance', {
    id: 'tp-1',
    attempt_id: attemptId,
    topic_id: 'fra',
    total_questions: 2,
    correct_count: 1,
    percentage: 50.0,
    target_mps: 70.0,
    performance_status: 'Cần cải thiện',
    status_badge: 'Cần cải thiện (50%)',
    action_recommendation: 'Học lại bài giảng: Leases & Long-Term Liabilities (Lesson 03)',
    created_at: now,
  });

  db.insert('topic_performance', {
    id: 'tp-2',
    attempt_id: attemptId,
    topic_id: 'fixed-income',
    total_questions: 1,
    correct_count: 1,
    percentage: 100.0,
    target_mps: 70.0,
    performance_status: 'Vượt trội',
    status_badge: 'Vượt trội (100%)',
    action_recommendation: 'Duy trì luyện tập nâng cao các câu hỏi Convexity đa biến.',
    created_at: now,
  });

  db.insert('topic_performance', {
    id: 'tp-3',
    attempt_id: attemptId,
    topic_id: 'ethics',
    total_questions: 1,
    correct_count: 1,
    percentage: 100.0,
    target_mps: 70.0,
    performance_status: 'Vượt trội',
    status_badge: 'Vượt trội (100%)',
    action_recommendation: 'Nắm vững các tình huống thực tế áp dụng Standard I-VII.',
    created_at: now,
  });

  // 10. Audit Logs
  db.insert('audit_logs', {
    id: 'aud-seed-1',
    actor_id: 'usr-admin-01',
    actor_name: 'FES System Admin',
    action: 'SYSTEM_BOOTSTRAP',
    entity_type: 'system',
    entity_id: '0',
    new_values: { message: 'Database initialized with 10 CFA Topics and core Question Bank.' },
    created_at: now,
  });
}
