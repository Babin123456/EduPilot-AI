import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { MainLayout } from './components/MainLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { AttendancePage } from './pages/AttendancePage';
import { AIPage } from './pages/AIPage';
import { StudentsPage } from './pages/StudentsPage';
import { TimetablePage } from './pages/TimetablePage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AssignmentsPage } from './pages/AssignmentsPage';
import { PlaceholderPage } from './pages/PlaceholderPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, isLoading } = useAuth();
  if (isLoading) return <div className="p-8 text-center text-xs">Loading...</div>;
  if (!token) return <Navigate to="/login" replace />;
  return <MainLayout>{children}</MainLayout>;
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/attendance" element={<ProtectedRoute><AttendancePage /></ProtectedRoute>} />
            <Route path="/ai" element={<ProtectedRoute><AIPage /></ProtectedRoute>} />
            <Route path="/students" element={<ProtectedRoute><StudentsPage /></ProtectedRoute>} />
            <Route path="/timetable" element={<ProtectedRoute><TimetablePage /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
            <Route path="/assignments" element={<ProtectedRoute><AssignmentsPage /></ProtectedRoute>} />
            <Route path="/assessments" element={<ProtectedRoute><PlaceholderPage title="Assessments & Quizzes" subtitle="AI Quiz Generation & Student Evaluation Studio" /></ProtectedRoute>} />
            <Route path="/documents" element={<ProtectedRoute><PlaceholderPage title="Document Studio" subtitle="Generate PDF, PPTX, DOCX & XLSX Reports" /></ProtectedRoute>} />
            <Route path="/communications" element={<ProtectedRoute><PlaceholderPage title="Academic Communications" subtitle="Gmail SMTP & WhatsApp Distribution Workflows" /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
