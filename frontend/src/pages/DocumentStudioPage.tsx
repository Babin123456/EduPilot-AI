import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../api/client';
import { motion } from 'framer-motion';
import {
  Download, FileText, BookOpen,
  Users, HelpCircle, Loader2, Clock, File
} from 'lucide-react';
import { generateQuizPDF, generateClassReportPDF, generateDailyNotePDF } from '../utils/pdfGenerator';

interface DocCard {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
  action: () => void;
  loading: boolean;
}

export const DocumentStudioPage: React.FC = () => {
  const { activeClass, user } = useAuth();
  const toast = useToast();
  const [documents, setDocuments] = useState<any[]>([]);
  const [generating, setGenerating] = useState<string | null>(null);

  useEffect(() => {
    if (!activeClass) return;
    api.get('/documents', { params: { class_id: activeClass.id } })
      .then(res => setDocuments(res.data))
      .catch(() => {});
  }, [activeClass]);

  const generateQuiz = async () => {
    if (!activeClass) return;
    setGenerating('quiz');
    try {
      const res = await api.get(`/assessments?class_id=${activeClass.id}`);
      const assessments = res.data || [];
      const assessment = assessments[0];

      generateQuizPDF({
        title: assessment?.title || `Sample Quiz — ${activeClass.course_name}`,
        courseName: activeClass.course_name,
        courseCode: activeClass.course_code,
        yearLabel: activeClass.year_label,
        sectionName: activeClass.section_name,
        teacherName: user?.full_name || '',
        topic: assessment?.topic || activeClass.course_name,
        difficulty: assessment?.difficulty || 'medium',
        totalMarks: assessment?.total_marks || 25,
        duration: assessment?.duration_minutes || 30,
        questions: Array.from({ length: 10 }, (_, i) => ({
          number: i + 1,
          text: `Question ${i + 1} related to ${assessment?.topic || activeClass.course_name}`,
          type: i % 3 === 0 ? 'mcq' : 'short',
          options: i % 3 === 0 ? ['Option A', 'Option B', 'Option C', 'Option D'] : undefined,
          marks: Math.ceil((assessment?.total_marks || 25) / 10),
        })),
      });
      toast.success('Generated & Downloaded Quiz Paper PDF', `File saved for ${activeClass.course_code} ${activeClass.year_label}.`);
    } catch (err) {
      toast.error('Failed to generate Quiz PDF');
    } finally {
      setGenerating(null);
    }
  };

  const generateClassReport = async () => {
    if (!activeClass) return;
    setGenerating('report');
    try {
      const res = await api.get('/students', { params: { class_id: activeClass.id, limit: 100 } });
      const students = res.data.students || [];

      generateClassReportPDF({
        courseName: activeClass.course_name,
        courseCode: activeClass.course_code,
        yearLabel: activeClass.year_label,
        sectionName: activeClass.section_name,
        teacherName: user?.full_name || '',
        students: students.map((s: any) => ({
          rollNumber: s.roll_number,
          name: s.full_name,
          email: s.email,
          attendance: s.attendance_percentage,
          avgScore: s.average_score,
          cgpa: s.cgpa,
          riskLevel: s.risk_level,
        })),
      });
      toast.success('Generated & Downloaded Class Report PDF', `Included ${students.length} student records with attendance and CGPA.`);
    } catch (err) {
      toast.error('Failed to generate Class Report PDF');
    } finally {
      setGenerating(null);
    }
  };

  const generateNotes = async () => {
    if (!activeClass) return;
    setGenerating('notes');
    try {
      const res = await api.get('/daily-notes', { params: { class_id: activeClass.id } });
      const notes = res.data || [];
      if (notes.length > 0) {
        const note = notes[0];
        generateDailyNotePDF({
          topic: note.topic,
          courseName: note.course_name,
          courseCode: note.course_code,
          yearLabel: note.year_label,
          sectionName: note.section_name,
          teacherName: user?.full_name || '',
          date: new Date(note.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }),
          duration: note.duration_minutes,
          content: note.content,
          keyConcepts: note.key_concepts || [],
          discussionPoints: note.discussion_points || [],
          summary: note.summary || '',
          practiceQuestions: note.practice_questions || [],
        });
        toast.success('Downloaded Daily Notes PDF', `Saved "${note.topic}.pdf" with Adamas University branding.`);
      } else {
        toast.info('No daily notes found', 'Generate lecture notes in the Daily Notes module first.');
      }
    } catch (err) {
      toast.error('Failed to generate Discussion Notes PDF');
    } finally {
      setGenerating(null);
    }
  };

  const docCards: DocCard[] = [
    {
      id: 'quiz',
      icon: HelpCircle,
      title: 'Quiz Paper PDF',
      description: 'Generate a professional quiz paper with questions, marks, and instructions',
      color: 'purple',
      action: generateQuiz,
      loading: generating === 'quiz',
    },
    {
      id: 'report',
      icon: Users,
      title: 'Class Report PDF',
      description: 'Complete student roster with attendance, scores, CGPA, and risk levels',
      color: 'blue',
      action: generateClassReport,
      loading: generating === 'report',
    },
    {
      id: 'notes',
      icon: BookOpen,
      title: 'Discussion Notes PDF',
      description: 'Export the latest daily discussion notes as a formatted PDF document',
      color: 'emerald',
      action: generateNotes,
      loading: generating === 'notes',
    },
  ];

  const colorStyles: Record<string, { bg: string; icon: string; border: string }> = {
    purple: { bg: 'bg-purple-50 dark:bg-purple-950/50', icon: 'text-purple-500', border: 'hover:border-purple-300' },
    blue: { bg: 'bg-blue-50 dark:bg-blue-950/50', icon: 'text-adamas-blue', border: 'hover:border-blue-300' },
    emerald: { bg: 'bg-emerald-50 dark:bg-emerald-950/50', icon: 'text-emerald-500', border: 'hover:border-emerald-300' },
    amber: { bg: 'bg-amber-50 dark:bg-amber-950/50', icon: 'text-amber-500', border: 'hover:border-amber-300' },
  return (
    <div className="space-y-6">

      <div className="bg-gradient-to-r from-[#005BAC] via-[#0A6FD8] to-[#8CC63F] p-6 sm:p-8 rounded-3xl text-white shadow-xl flex items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-extrabold text-white">
            <FileText className="w-3.5 h-3.5 text-[#8CC63F]" /> PDF Export & Publishing Engine
          </div>
          <h1 className="text-2xl font-black">Document Studio & Publishing Engine</h1>
          <p className="text-xs text-slate-100 font-medium">
            Generate, customize, and export institutional PDF question papers, class rosters, and daily lecture notes.
          </p>
        </div>
        <div className="w-36 h-24 flex items-center justify-center hidden sm:flex flex-shrink-0 relative z-10">
          <img src="/images/document_studio.png" alt="Document Studio Banner" className="w-full h-auto max-h-24 object-contain drop-shadow-[0_10px_25px_rgba(0,0,0,0.4)]" />
        </div>
      </div>




      {/* Generate Cards */}
      <div>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Generate Documents</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {docCards.map((card, i) => {
            const Icon = card.icon;
            const style = colorStyles[card.color];
            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.3 }}
                className={`bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm ${style.border} transition-all duration-200 cursor-pointer group`}
                onClick={card.loading ? undefined : card.action}
              >
                <div className={`w-12 h-12 rounded-xl ${style.bg} ${style.icon} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">{card.title}</h3>
                <p className="text-xs text-slate-500 mt-1">{card.description}</p>
                <button
                  disabled={card.loading}
                  className="mt-4 w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  {card.loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                  ) : (
                    <><Download className="w-4 h-4" /> Generate & Download</>
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Recent Documents */}
      <div>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Recent Documents</h2>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {documents.length === 0 ? (
            <div className="p-12 text-center">
              <File className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-xs text-slate-500">No documents generated yet. Use the cards above to create PDF documents.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {documents.map((doc, i) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{doc.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded uppercase">{doc.document_type}</span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {doc.created_at ? new Date(doc.created_at).toLocaleDateString('en-IN') : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    doc.generation_status === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                    'bg-amber-50 text-amber-600'
                  }`}>
                    {doc.generation_status}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
