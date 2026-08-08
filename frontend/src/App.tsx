import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { MainLayout } from './components/MainLayout';
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

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, isLoading } = useAuth();
  if (isLoading) return <div className="p-8 text-center text-xs">Loading...</div>;
  if (!token) return <Navigate to="/login" replace />;
  return <MainLayout>{children}</MainLayout>;
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
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

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;

