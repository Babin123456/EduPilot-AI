import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import {
  ArrowLeft, Sun, Moon, BookOpen, LayoutDashboard, CheckSquare, Users, BarChart3,
  Bot, FileText, Mail, Calendar, Notebook, Folder, BrainCircuit, Cpu, Database,
  Shield, Zap, Layers, ArrowRight, Code2, Server,
} from 'lucide-react';

const docSections = [
  {
    category: 'Platform Overview',
    icon: Layers,
    items: [
      {
        icon: BookOpen,
        title: 'What is EduPilot AI?',
        content: 'EduPilot AI is an Academic Operating System built for Adamas University faculty. It combines a React + TypeScript frontend with a FastAPI Python backend, SQLite WAL database, and dual-LLM AI pipeline (Groq + Gemini) to automate teaching workflows including attendance, lesson planning, quiz generation, analytics, and document management.',
      },
      {
        icon: Code2,
        title: 'Technology Stack',
        content: 'Frontend: React 18 + TypeScript + Vite + Tailwind CSS 3 + Framer Motion + Recharts + Lucide Icons. Backend: FastAPI (Python 3.11+) + SQLite with WAL mode + Pydantic v2 models. AI: Groq LLM (dual API keys) as primary, Google Gemini as fallback, with RAG context injection. Deployment: Vercel (frontend) + Railway/Render (backend). Smooth scrolling: Lenis. Scroll animations: GSAP ScrollTrigger.',
      },
      {
        icon: Database,
        title: 'Database Architecture',
        content: 'EduPilot uses SQLite with WAL (Write-Ahead Logging) for concurrent read performance. Key tables: teachers (faculty profiles & credentials), students (720 students across 12 sections), classes (course assignments with year/section mappings), attendance_records (per-student per-class daily records), timetable_slots (weekly teaching schedule), assessments, assignments, daily_notes, and generated_documents. All tables use integer primary keys with foreign key relationships.',
      },
    ],
  },
  {
    category: 'Core Modules',
    icon: LayoutDashboard,
    items: [
      {
        icon: LayoutDashboard,
        title: 'Dashboard (Command Center)',
        content: 'The Teacher Command Center provides a real-time overview: today\'s teaching schedule from the timetable, metric cards (today\'s classes, pending attendance, pending grading, at-risk students), quick action shortcuts, and EduPilot AI copilot launcher. All data is scoped to the teacher\'s active class context which persists via localStorage.',
      },
      {
        icon: CheckSquare,
        title: 'Attendance Module',
        content: 'Supports batch attendance marking with "Mark All Present" and individual toggling (Present/Absent/Late). Automatically calculates per-student attendance percentages, flags students below 75% threshold, and tracks attendance velocity trends. Teachers can view historical attendance records filtered by date ranges and export attendance summaries as PDF reports.',
      },
      {
        icon: Users,
        title: 'Students Module',
        content: 'Displays a complete student roster for the active class context (year + section). Shows student details including roll number, name, email, attendance percentage, and risk status. Supports searching, sorting, and filtering. Students are organized into 12 sections (4 years x 3 sections) with 60 students each, totaling 720 students across the CSE department.',
      },
      {
        icon: Calendar,
        title: 'Timetable Module',
        content: 'Displays the teacher\'s weekly teaching schedule with time slots, course names, section assignments, and room allocations. Highlights today\'s classes and shows quick attendance status indicators. The timetable data is pre-loaded from the institutional scheduling system.',
      },
      {
        icon: BarChart3,
        title: 'Analytics Module',
        content: 'Provides interactive charts and visualizations: attendance trend lines (weekly/monthly), quiz score distributions (bar charts), section comparison matrices, at-risk student lists with attendance percentages, and grade distribution pie charts. All charts are built with Recharts and update dynamically based on the active class context.',
      },
      {
        icon: Bot,
        title: 'EduPilot AI Module',
        content: 'The AI workspace features a chat interface where teachers can interact with the AI assistant using natural language. The system uses RAG to inject active class data (attendance, students, syllabus) into AI prompts. Supports intent-driven workflows: "Generate a quiz on [topic]", "Show students below 75% attendance", "Create a lesson plan for [chapter]". Responses are streamed in real-time with markdown rendering.',
      },
      {
        icon: Notebook,
        title: 'Daily Notes Module',
        content: 'Allows teachers to create structured daily lecture notes with rich text formatting. Notes are tagged by course, section, and topic. Supports AI-assisted note generation where EduPilot can draft notes based on syllabus topics. Notes can be exported as PDF/DOCX and shared via email.',
      },
      {
        icon: Folder,
        title: 'Document Studio',
        content: 'A unified document management workspace that stores all AI-generated and teacher-created content: lesson plans, quiz papers, assignments, daily notes, and assessment reports. Supports preview, editing, multi-format export (PDF, PPTX, DOCX), and direct distribution via institutional email or WhatsApp workflows. Documents are auto-tagged with metadata (course, section, date, type).',
      },
      {
        icon: Mail,
        title: 'Communications Module',
        content: 'Enables faculty to send structured communications to students and parents/guardians. Supports email templates for common scenarios (attendance warnings, quiz notifications, parent updates). Integrates with Gmail SMTP for institutional email delivery and provides WhatsApp sharing workflows for quick parent notification distribution.',
      },
      {
        icon: FileText,
        title: 'Assignments & Assessments',
        content: 'Create, manage, and track assignments and assessments. Supports setting due dates, marking schemes, and rubric criteria. AI-assisted question generation creates diverse question banks. Grade entry with automatic percentage calculation and performance analytics integration.',
      },
    ],
  },
  {
    category: 'AI Architecture',
    icon: BrainCircuit,
    items: [
      {
        icon: BrainCircuit,
        title: 'RAG Pipeline',
        content: 'EduPilot implements Retrieval Augmented Generation (RAG) by injecting live database context into every AI prompt. When a teacher asks a question, the system automatically retrieves relevant data (active class roster, attendance records, syllabus topics, prior quiz scores) and includes it as structured context in the LLM prompt. This ensures AI responses are grounded in actual institutional data rather than generic knowledge.',
      },
      {
        icon: Cpu,
        title: 'Multi-LLM Failover',
        content: 'The AI engine uses Groq as the primary LLM provider with dual API keys for load balancing and rate limit distribution. If Groq is unavailable or rate-limited, the system automatically falls back to Google Gemini. This dual-provider architecture ensures 99.9% AI availability. All LLM interactions are logged for quality monitoring.',
      },
      {
        icon: Zap,
        title: 'Intent Classification',
        content: 'User prompts are classified into intent categories: LESSON_PLAN (generate lesson outlines), QUIZ_GEN (create quizzes/question papers), ANALYTICS_QUERY (data questions about attendance/performance), DAILY_NOTES (lecture note generation), GENERAL_CHAT (open-ended conversation). Each intent triggers a specialized agent workflow with appropriate data retrieval and response formatting.',
      },
    ],
  },
  {
    category: 'Infrastructure',
    icon: Server,
    items: [
      {
        icon: Shield,
        title: 'Authentication & Authorization',
        content: 'Uses JWT (JSON Web Tokens) for stateless authentication. Login validates institutional email + hashed password against the teachers table. Tokens expire after configurable duration (default 24h). All API routes (except /auth/login) require valid Bearer tokens. Teachers can only access data for classes assigned to them via the classes table.',
      },
      {
        icon: Server,
        title: 'API Architecture',
        content: 'The backend exposes a RESTful API organized into route modules: /auth (login, demo accounts), /dashboard (summary metrics), /timetable (schedule), /attendance (CRUD operations), /students (roster), /analytics (chart data), /ai (chat completion), /documents (CRUD + export), /communications (email dispatch). All endpoints return JSON with consistent error handling.',
      },
    ],
  },
];

export const DocumentationPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [activeCategory, setActiveCategory] = useState(docSections[0].category);

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);


  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0F172A] transition-colors duration-200">
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 py-4">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-[#005BAC] dark:hover:text-[#8CC63F] transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <button onClick={toggleTheme} className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" aria-label="Toggle theme">
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-amber-400" />}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-16">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#005BAC]/10 text-[#005BAC] dark:bg-[#8CC63F]/15 dark:text-[#8CC63F] mx-auto">
            <BookOpen className="w-8 h-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">Platform Documentation</h1>
          <p className="text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Complete technical reference and feature guide for the EduPilot AI Academic Operating System.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-3">
            <div className="sticky top-24 space-y-2">
              {docSections.map((section) => {
                const Icon = section.icon;
                const isActive = activeCategory === section.category;
                return (
                  <button
                    key={section.category}
                    onClick={() => setActiveCategory(section.category)}
                    className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-[#005BAC]/10 dark:bg-[#8CC63F]/15 text-[#005BAC] dark:text-[#8CC63F] shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {section.category}
                    <ArrowRight className={`w-3 h-3 ml-auto transition-transform ${isActive ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0'}`} />
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-9 space-y-6">
            {docSections
              .filter((s) => s.category === activeCategory)
              .map((section) => (
                <div key={section.category}>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                    <span className="w-1 h-8 rounded-full bg-gradient-to-b from-[#005BAC] to-[#8CC63F]" />
                    {section.category}
                  </h2>
                  <div className="space-y-5">
                    {section.items.map((item, idx) => {
                      const Icon = item.icon;
                      return (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: idx * 0.06 }}
                          className="glass-card rounded-2xl p-6 space-y-3 border border-slate-200 dark:border-slate-800 hover:border-[#005BAC] dark:hover:border-[#8CC63F] hover:-translate-y-1.5 hover:shadow-2xl dark:hover:shadow-[0_10px_30px_rgba(140,198,63,0.15)] transition-all duration-300 group cursor-default"

                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#005BAC]/10 text-[#005BAC] dark:bg-[#8CC63F]/15 dark:text-[#8CC63F] flex items-center justify-center flex-shrink-0">
                              <Icon className="w-5 h-5" />
                            </div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">{item.title}</h3>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed pl-[52px]">{item.content}</p>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </main>
    </div>
  );
};
