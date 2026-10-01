import React from 'react';
import { useLms } from '../../context/LmsContext';

export const MyCoursesView: React.FC = () => {
  const { navigateToView } = useLms();

  const courses = [
    {
      topic: 'Financial Reporting & Analysis (FRA)',
      level: 'CFA Level I',
      progress: 75,
      lessons: '24/32 bài',
      estTime: 'Còn 15 phút học',
      desc: 'Phân tích doanh thu dồn tích, EPS diluted, non-recurring items và biên lợi nhuận hoạt động.',
      badge: 'Trọng số 13-17%',
    },
    {
      topic: 'Quantitative Methods',
      level: 'CFA Level I',
      progress: 88,
      lessons: '18/20 bài',
      estTime: 'Còn 45 phút học',
      desc: 'Time Value of Money, DCF, xác suất thống kê và kiểm định giả thuyết.',
      badge: 'Trọng số 6-9%',
    },
    {
      topic: 'Ethical & Professional Standards',
      level: 'CFA Level I',
      progress: 92,
      lessons: '28/30 bài',
      estTime: 'Đạt chuẩn',
      desc: 'Code of Ethics, 7 chuẩn mực đạo đức nghề nghiệp và tiêu chuẩn GIPS.',
      badge: 'Trọng số 15-20%',
    },
    {
      topic: 'Fixed Income',
      level: 'CFA Level I',
      progress: 45,
      lessons: '12/28 bài',
      estTime: 'Cần ôn thêm',
      desc: 'Cấu trúc trái phiếu, Yield curve, Duration, Convexity và đo lường rủi ro tín dụng.',
      badge: 'Trọng số 11-14%',
    },
  ];

  return (
    <div className="p-4 sm:p-8 max-w-[1400px] w-full mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-container/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-primary font-headline">
            My Courses &amp; Video Lectures
          </h1>
          <p className="text-xs text-on-surface-variant mt-1">
            Khóa học 10 môn CFA Level I theo giáo trình chuẩn CFA Institute 2026
          </p>
        </div>
        <button
          onClick={() => navigateToView('mock-library')}
          className="px-4 py-2 bg-primary text-on-primary text-xs font-bold rounded-lg hover:bg-primary-container transition-all"
        >
          Luyện thi Mock Exam
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {courses.map((c, i) => (
          <div
            key={i}
            className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-surface-container/60 flex flex-col justify-between gap-5 hover:shadow-md transition-all"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed">
                  {c.level}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-surface-container text-secondary">
                  {c.badge}
                </span>
              </div>
              <h3 className="font-headline font-bold text-base text-primary leading-snug">
                {c.topic}
              </h3>
              <p className="text-xs text-on-surface-variant font-light mt-2 line-clamp-2">
                {c.desc}
              </p>
            </div>

            <div className="space-y-3 pt-3 border-t border-surface-container/60">
              <div className="flex justify-between text-xs">
                <span className="text-on-surface-variant">{c.lessons} • {c.estTime}</span>
                <span className="font-bold text-primary">{c.progress}% hoàn thành</span>
              </div>
              <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                <div className="bg-secondary h-full rounded-full" style={{ width: `${c.progress}%` }}></div>
              </div>
              <button
                onClick={() => alert(`Đang mở bài giảng môn ${c.topic}...`)}
                className="w-full py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span className="material-symbols-outlined text-base">play_arrow</span>
                <span>Tiếp tục học</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const PracticeQuestionsView: React.FC = () => {
  const { resumeInProgressExam, navigateToView } = useLms();

  const quizzes = [
    {
      title: 'Fixed Income: Duration & Convexity Focus Quiz',
      topic: 'Fixed Income',
      questions: 20,
      time: '30 phút',
      difficulty: 'Challenging',
      rec: 'Vùng yếu cần cải thiện',
    },
    {
      title: 'FRA: Leases & Long-Lived Assets Sprint',
      topic: 'FRA',
      questions: 30,
      time: '45 phút',
      difficulty: 'Standard',
      rec: 'Chuẩn kỳ thi',
    },
    {
      title: 'Ethics: Standard I - VII Flash Quiz',
      topic: 'Ethics',
      questions: 25,
      time: '35 phút',
      difficulty: 'Standard',
      rec: 'Củng cố trọng số cao',
    },
    {
      title: 'Quantitative Methods: Time Value of Money Drills',
      topic: 'Quantitative Methods',
      questions: 15,
      time: '20 phút',
      difficulty: 'Easy',
      rec: 'Luyện tốc độ bấm máy BA II Plus',
    },
  ];

  return (
    <div className="p-4 sm:p-8 max-w-[1400px] w-full mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-container/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-primary font-headline">
            Practice Questions &amp; Topic Quizzes
          </h1>
          <p className="text-xs text-on-surface-variant mt-1">
            Ngân hàng 2,200 câu hỏi trắc nghiệm chia theo từng Reading LOS
          </p>
        </div>
        <button
          onClick={resumeInProgressExam}
          className="px-4 py-2 bg-tertiary-fixed-dim hover:bg-tertiary-fixed text-on-tertiary-fixed text-xs font-bold rounded-lg transition-all"
        >
          Làm tiếp Mock 02
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {quizzes.map((q, idx) => (
          <div
            key={idx}
            className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-surface-container/60 flex flex-col justify-between gap-4 hover:shadow-md transition-all"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed">
                  {q.topic}
                </span>
                <span className="text-[10px] font-semibold text-outline">{q.difficulty}</span>
              </div>
              <h3 className="font-headline font-bold text-base text-primary">{q.title}</h3>
              <p className="text-xs text-secondary font-medium mt-1">💡 {q.rec}</p>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-surface-container/60 text-xs">
              <span className="text-on-surface-variant">
                {q.questions} câu hỏi • {q.time}
              </span>
              <button
                onClick={() => navigateToView('exam-interface')}
                className="px-4 py-2 bg-primary hover:bg-primary-container text-on-primary text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Bắt đầu làm
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ExamHistoryView: React.FC = () => {
  const { viewCompletedExamResult, mockExams } = useLms();

  const history = [
    {
      id: 'fes-cfa-l1-mock-01',
      title: 'FES CFA Level I - Mock Exam 01 (Full 180 Qs)',
      date: '20/09/2026',
      duration: '254 phút',
      score: '78.0%',
      mpsStatus: 'Pass Target (Đạt mục tiêu)',
      correct: '140/180',
    },
    {
      id: 'fes-cfa-l1-ethics-topic',
      title: 'Ethics Topic Test - Level I Comprehensive',
      date: '18/09/2026',
      duration: '40 phút',
      score: '86.0%',
      mpsStatus: 'Xuất sắc (>80%)',
      correct: '30/35',
    },
    {
      id: 'fes-cfa-l1-fra-midterm',
      title: 'FRA Mid-Term Review Mock Exam',
      date: '12/09/2026',
      duration: '90 phút',
      score: '64.0%',
      mpsStatus: 'Dưới ngưỡng MPS (Cần ôn)',
      correct: '38/60',
    },
    {
      id: 'fes-cfa-l1-diagnostic',
      title: 'FES CFA Diagnostic Pre-test 2026',
      date: '02/09/2026',
      duration: '118 phút',
      score: '71.0%',
      mpsStatus: 'Đạt chuẩn đầu vào',
      correct: '64/90',
    },
  ];

  return (
    <div className="p-4 sm:p-8 max-w-[1400px] w-full mx-auto space-y-6">
      <div className="pb-4 border-b border-surface-container/60">
        <h1 className="text-2xl sm:text-3xl font-black text-primary font-headline">
          Lịch Sử Thi &amp; Lưu Trữ Bài Làm
        </h1>
        <p className="text-xs text-on-surface-variant mt-1">
          Xem lại toàn bộ kết quả, đáp án chi tiết và lịch sử các đợt thi thử CFA
        </p>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-container/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-surface-container-low text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                <th className="py-4 px-6">Tên bài thi / Kiểm tra</th>
                <th className="py-4 px-4">Ngày hoàn thành</th>
                <th className="py-4 px-4">Thời gian</th>
                <th className="py-4 px-4">Câu đúng</th>
                <th className="py-4 px-4">Điểm số</th>
                <th className="py-4 px-4">Đánh giá MPS</th>
                <th className="py-4 px-6 text-right">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {history.map((h, i) => (
                <tr key={i} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="py-4 px-6 font-bold text-primary">{h.title}</td>
                  <td className="py-4 px-4 text-on-surface-variant">{h.date}</td>
                  <td className="py-4 px-4 text-on-surface-variant font-mono">{h.duration}</td>
                  <td className="py-4 px-4 font-semibold text-primary">{h.correct}</td>
                  <td className="py-4 px-4 font-black font-headline text-secondary text-sm">
                    {h.score}
                  </td>
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-secondary-fixed/50 text-secondary">
                      {h.mpsStatus}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => viewCompletedExamResult('fes-cfa-l1-mock-01')}
                      className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-primary hover:text-on-primary text-primary font-bold text-xs transition-colors cursor-pointer"
                    >
                      Xem kết quả
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const BookmarksNotesView: React.FC = () => {
  const { bookmarks, notes, lessonNotes, openLessonVideo, startReviewAnswers } = useLms();

  return (
    <div className="p-4 sm:p-8 max-w-[1400px] w-full mx-auto space-y-6">
      <div className="pb-4 border-b border-surface-container/60">
        <h1 className="text-2xl sm:text-3xl font-black text-primary font-headline">
          Bookmarks &amp; Ghi Chú Học Tập
        </h1>
        <p className="text-xs text-on-surface-variant mt-1">
          Lưu trữ các câu hỏi trọng điểm, câu bẫy trắc nghiệm và ghi chú bài giảng video kèm timestamp
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bookmarks */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-surface-container/60 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-tertiary-container">bookmark</span>
              Câu hỏi đã đánh dấu ({bookmarks.length})
            </h3>
            <button
              onClick={() => startReviewAnswers('fes-cfa-l1-mock-01', 'flagged')}
              className="text-xs font-bold text-secondary hover:underline cursor-pointer"
            >
              Ôn lại tất cả
            </button>
          </div>

          <div className="space-y-3">
            {bookmarks.map((qId) => (
              <div
                key={qId}
                onClick={() => startReviewAnswers('fes-cfa-l1-mock-01', 'all')}
                className="p-3.5 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-bold text-primary">Câu hỏi #{qId}</span>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">
                    {qId === 43
                      ? 'IFRS 16 Leases Amortization Schedule & ROU Asset'
                      : qId === 78
                      ? 'Modified Duration & Convexity Price Change'
                      : 'Ethical & Professional Standards Compliance'}
                  </p>
                </div>
                <span className="material-symbols-outlined text-sm text-secondary">chevron_right</span>
              </div>
            ))}
          </div>
        </div>

        {/* Video Notes with timestamps */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-surface-container/60 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">smart_display</span>
              Ghi chú bài giảng Video ({lessonNotes.length})
            </h3>
          </div>

          <div className="space-y-3">
            {lessonNotes.map((note) => (
              <div
                key={note.id}
                className="p-3.5 rounded-xl bg-surface-container-low border border-surface-container space-y-2 hover:bg-surface-container transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-primary">
                    {note.lessonId === 'fra-m01-l03'
                      ? 'FRA: Income Statement Analysis'
                      : 'Fixed Income: Spot Rates & Yields'}
                  </span>
                  <button
                    onClick={() => {
                      const courseId = note.lessonId.startsWith('fra') ? 'cfa-l1-fra' : 'cfa-l1-fixed-income';
                      openLessonVideo(courseId, note.lessonId, note.timestampSeconds);
                    }}
                    className="px-2 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed font-mono font-bold text-[11px] hover:brightness-105 transition-all flex items-center gap-1 cursor-pointer"
                    title="Nhảy đến bài giảng tại thời điểm này"
                  >
                    <span className="material-symbols-outlined text-xs">play_arrow</span>
                    {note.timestampFormatted}
                  </button>
                </div>
                <p className="text-xs text-on-surface leading-relaxed">{note.text}</p>
                <div className="text-[10px] text-outline text-right">{note.createdAt}</div>
              </div>
            ))}

            {/* Exam Notes */}
            {Object.entries(notes).map(([qId, noteText]) => (
              <div key={qId} className="p-3.5 rounded-xl bg-surface-container-low border border-surface-container space-y-1.5">
                <span className="text-xs font-bold text-primary">Ghi chú cho Mock Exam #{qId}:</span>
                <p className="text-xs text-on-surface-variant font-mono bg-surface-container-lowest p-2 rounded border border-surface-container">
                  {noteText}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const StudyResourcesView: React.FC = () => {
  const resources = [
    {
      title: 'Sổ tay công thức CFA Level I 2026 (Quick Sheet)',
      category: 'Formula Sheet',
      size: '2.4 MB PDF',
      desc: 'Tổng hợp hơn 150 công thức bắt buộc trong 10 môn học kèm ví dụ minh họa.',
    },
    {
      title: 'Cẩm nang sử dụng máy tính tài chính BA II Plus',
      category: 'Guide',
      size: '1.8 MB PDF',
      desc: 'Hướng dẫn bấm TVM, CF, NPV, IRR, Amortization và chỉnh cài đặt P/Y = 1.',
    },
    {
      title: 'Chiến thuật phân bổ 135 phút cho mỗi Session thi',
      category: 'Exam Strategy',
      size: '950 KB PDF',
      desc: 'Bí quyết quản lý thời gian, tránh bẫy tâm lý và chiến thuật guessing không trừ điểm.',
    },
    {
      title: 'Bảng trọng số môn học và cập nhật Curriculum 2026',
      category: 'Curriculum',
      size: '1.2 MB PDF',
      desc: 'Chi tiết các Module LOS mới cập nhật của CFA Institute.',
    },
  ];

  return (
    <div className="p-4 sm:p-8 max-w-[1400px] w-full mx-auto space-y-6">
      <div className="pb-4 border-b border-surface-container/60">
        <h1 className="text-2xl sm:text-3xl font-black text-primary font-headline">
          Tài Nguyên Học Tập &amp; Cố Vấn CFA
        </h1>
        <p className="text-xs text-on-surface-variant mt-1">
          Tài liệu chính thống độc quyền do các giảng viên CFA Charterholder tại FES Academy biên soạn
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {resources.map((res, i) => (
          <div
            key={i}
            className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-surface-container/60 flex flex-col justify-between gap-4 hover:shadow-md transition-all"
          >
            <div>
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-secondary mb-2">
                <span>{res.category}</span>
                <span className="text-outline">{res.size}</span>
              </div>
              <h3 className="font-headline font-bold text-base text-primary">{res.title}</h3>
              <p className="text-xs text-on-surface-variant font-light mt-1.5 leading-relaxed">
                {res.desc}
              </p>
            </div>
            <div className="pt-3 border-t border-surface-container/60 flex items-center justify-between">
              <span className="text-[11px] text-outline">Bản quyền FES Academy</span>
              <button
                onClick={() => alert(`Đang tải file ${res.title}...`)}
                className="px-4 py-2 bg-primary hover:bg-primary-container text-on-primary text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">download</span>
                <span>Tải tài liệu</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const SettingsView: React.FC = () => {
  const { studentProfile } = useLms();

  return (
    <div className="p-4 sm:p-8 max-w-[900px] w-full mx-auto space-y-6">
      <div className="pb-4 border-b border-surface-container/60">
        <h1 className="text-2xl sm:text-3xl font-black text-primary font-headline">
          Cài Đặt Tài Khoản &amp; Mục Tiêu Học Tập
        </h1>
        <p className="text-xs text-on-surface-variant mt-1">
          Quản lý thông tin thí sinh, mục tiêu MPS và cấu hình nhắc nhở
        </p>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-sm border border-surface-container/60 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-primary">Họ và tên thí sinh</label>
            <input
              disabled
              value={studentProfile.name}
              className="w-full p-2.5 text-xs bg-surface-container-low rounded-lg border border-surface-container text-on-surface font-semibold"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-primary">Kỳ thi mục tiêu</label>
            <input
              disabled
              value={`CFA Level I - ${studentProfile.targetExamDate}`}
              className="w-full p-2.5 text-xs bg-surface-container-low rounded-lg border border-surface-container text-on-surface font-semibold"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-primary">Mục tiêu điểm số kỳ vọng</label>
            <input
              defaultValue={`${studentProfile.targetMps}%+ MPS`}
              className="w-full p-2.5 text-xs bg-surface-container-lowest rounded-lg border border-surface-container text-on-surface font-semibold focus:border-secondary outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-primary">Thời gian đếm ngược còn lại</label>
            <input
              disabled
              value={`${studentProfile.daysRemaining} ngày`}
              className="w-full p-2.5 text-xs bg-surface-container-low rounded-lg border border-surface-container text-on-surface font-semibold"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-surface-container flex items-center justify-end gap-3">
          <button
            onClick={() => alert('Cài đặt đã được lưu thành công!')}
            className="px-6 py-2.5 bg-primary text-on-primary font-bold text-xs rounded-lg hover:bg-primary-container transition-colors cursor-pointer"
          >
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
};
