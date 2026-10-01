import React from 'react';
import { LmsProvider, useLms } from './context/LmsContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './components/dashboard/DashboardView';
import { MockExamLibraryView } from './components/mock-exams/MockExamLibraryView';
import { ExamInterfaceView } from './components/mock-exams/ExamInterfaceView';
import { ExamResultView } from './components/mock-exams/ExamResultView';
import { ReviewAnswersView } from './components/mock-exams/ReviewAnswersView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { CoursesLibraryView } from './components/courses/CoursesLibraryView';
import { CourseDetailView } from './components/courses/CourseDetailView';
import { VideoLessonView } from './components/video/VideoLessonView';
import {
  BookmarksNotesView,
  ExamHistoryView,
  PracticeQuestionsView,
  SettingsView,
  StudyResourcesView,
} from './components/pages/OtherViews';
import { SubmitConfirmModal } from './components/mock-exams/SubmitConfirmModal';
import { ExamInstructionsModal } from './components/mock-exams/ExamInstructionsModal';
import { BaiiiPlusModal } from './components/calculator/BaiiiPlusModal';
import { ScratchpadModal } from './components/calculator/ScratchpadModal';
import { AdminPortal } from './components/admin/AdminPortal';

const AppContent: React.FC = () => {
  const { currentView, navigateToView } = useLms();

  if (currentView === 'admin') {
    return <AdminPortal onExitAdmin={() => navigateToView('dashboard')} />;
  }

  const isExamInterface = currentView === 'exam-interface';

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col">
      {/* If in active exam mode: distraction-free full-screen Prometric mode */}
      {isExamInterface ? (
        <div className="w-full min-h-screen">
          <ExamInterfaceView />
        </div>
      ) : (
        <>
          {/* Persistent Sidebar */}
          <Sidebar />

          {/* Main Layout Area */}
          <div className="lg:pl-72 flex flex-col min-h-screen transition-all">
            <Header />
            <main className="w-full pt-16 bg-surface min-h-[calc(100vh-4rem)] flex-1">
              {currentView === 'dashboard' && <DashboardView />}
              {currentView === 'mock-library' && <MockExamLibraryView />}
              {currentView === 'exam-result' && <ExamResultView />}
              {currentView === 'review-answers' && <ReviewAnswersView />}
              {currentView === 'analytics' && <AnalyticsView />}
              {currentView === 'my-courses' && <CoursesLibraryView />}
              {currentView === 'course-detail' && <CourseDetailView />}
              {currentView === 'video-lesson' && <VideoLessonView />}
              {currentView === 'practice-questions' && <PracticeQuestionsView />}
              {currentView === 'exam-history' && <ExamHistoryView />}
              {currentView === 'bookmarks-notes' && <BookmarksNotesView />}
              {currentView === 'study-resources' && <StudyResourcesView />}
              {currentView === 'settings' && <SettingsView />}
            </main>
          </div>
        </>
      )}

      {/* Global Modals */}
      <SubmitConfirmModal />
      <ExamInstructionsModal />
      <BaiiiPlusModal />
      <ScratchpadModal />
    </div>
  );
};

export default function App() {
  return (
    <LmsProvider>
      <AppContent />
    </LmsProvider>
  );
}
