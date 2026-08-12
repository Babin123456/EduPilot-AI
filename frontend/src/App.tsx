import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { MainLayout } from './components/MainLayout';
import { EduPilotLoader } from './components/EduPilotLoader';
import { LandingPage } from './pages/landing/LandingPage';
import { FAQPage } from './pages/landing/FAQPage';
import { TermsPage } from './pages/landing/TermsPage';
import { PrivacyPage } from './pages/landing/PrivacyPage';
import { DocumentationPage } from './pages/landing/DocumentationPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { AttendancePage } from './pages/AttendancePage';
import { AIPage } from './pages/AIPage';
import { StudentsPage } from './pages/StudentsPage';
import { TimetablePage } from './pages/TimetablePage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AssignmentsPage } from './pages/AssignmentsPage';
import { AssessmentsPage } from './pages/AssessmentsPage';
import { DailyNotesPage } from './pages/DailyNotesPage';
import { DocumentStudioPage } from './pages/DocumentStudioPage';
import { CommunicationsPage } from './pages/CommunicationsPage';
import { ProfilePage } from './pages/ProfilePage';

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: any}> {
  constructor(props: any) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error: any) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, color: 'red', backgroundColor: '#fee' }}>
          <h2>Frontend Crash!</h2>
          <pre>{this.state.error?.toString()}</pre>
          <pre>{this.state.error?.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-3 border-slate-300 dark:border-slate-700 border-t-[#005BAC] dark:border-t-[#8CC63F] rounded-full animate-spin" />
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Loading workspace...</span>
      </div>
    );
  }
  if (!token) return <Navigate to="/login" replace />;
  return <MainLayout>{children}</MainLayout>;
};

export const App: React.FC = () => {
  const [isAppLoaded, setIsAppLoaded] = useState(false);

  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <ErrorBoundary>
            {!isAppLoaded && (
              <EduPilotLoader onComplete={() => setIsAppLoaded(true)} />
            )}
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<LandingPage isAppLoaded={isAppLoaded} />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/docs" element={<DocumentationPage />} />

                <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                <Route path="/attendance" element={<ProtectedRoute><AttendancePage /></ProtectedRoute>} />
                <Route path="/ai" element={<ProtectedRoute><AIPage /></ProtectedRoute>} />
                <Route path="/students" element={<ProtectedRoute><StudentsPage /></ProtectedRoute>} />
                <Route path="/timetable" element={<ProtectedRoute><TimetablePage /></ProtectedRoute>} />
                <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
                <Route path="/assignments" element={<ProtectedRoute><AssignmentsPage /></ProtectedRoute>} />
                <Route path="/assessments" element={<ProtectedRoute><AssessmentsPage /></ProtectedRoute>} />
                <Route path="/daily-notes" element={<ProtectedRoute><DailyNotesPage /></ProtectedRoute>} />
                <Route path="/documents" element={<ProtectedRoute><DocumentStudioPage /></ProtectedRoute>} />
                <Route path="/communications" element={<ProtectedRoute><CommunicationsPage /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </ErrorBoundary>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;

