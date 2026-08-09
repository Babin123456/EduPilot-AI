import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download, FileText, BookOpen,
  Users, HelpCircle, Loader2, Clock, File, Presentation, FileSpreadsheet, Sparkles, X
} from 'lucide-react';
import { generateQuizPDF, generateClassReportPDF, generateDailyNotePDF } from '../utils/pdfGenerator';
import { downloadExcelSheet, downloadPresentationOutline } from '../utils/exportUtils';

export const DocumentStudioPage: React.FC = () => {
  const { activeClass, user } = useAuth();
  const toast = useToast();
  const [documents, setDocuments] = useState<any[]>([]);
  const [generating, setGenerating] = useState<string | null>(null);

  // AI Generator Modal Form State
  const [modalType, setModalType] = useState<'assignment' | 'assessment' | 'ppt' | 'excel' | null>(null);
  const [topic, setTopic] = useState('');
  const [format, setFormat] = useState<'pdf' | 'excel' | 'ppt'>('pdf');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [numItems, setNumItems] = useState(10);
  const [customInstructions, setCustomInstructions] = useState('');

  useEffect(() => {
    if (!activeClass) return;
    api.get('/documents', { params: { class_id: activeClass.id } })
      .then(res => setDocuments(res.data))
      .catch(() => {});
  }, [activeClass]);

  const handleOpenGenerator = (type: 'assignment' | 'assessment' | 'ppt' | 'excel') => {
    setModalType(type);
    setTopic(activeClass?.course_name ? `${activeClass.course_name} Module 1` : '');
    setFormat(type === 'ppt' ? 'ppt' : type === 'excel' ? 'excel' : 'pdf');
  };

  const handleGenerateDocument = async () => {
    if (!activeClass || !topic.trim()) return;
    setGenerating(modalType);

    try {
      if (modalType === 'assessment' || modalType === 'assignment') {
        if (format === 'pdf') {
          generateQuizPDF({
            title: `${modalType === 'assignment' ? 'Assignment Task Sheet' : 'Assessment Quiz'} — ${topic}`,
            courseName: activeClass.course_name,
            courseCode: activeClass.course_code,
            yearLabel: activeClass.year_label,
            sectionName: activeClass.section_name,
            teacherName: user?.full_name || '',
            topic: topic,
            difficulty: difficulty,
            totalMarks: numItems * 5,
            duration: 45,
            questions: Array.from({ length: numItems }, (_, i) => ({
              number: i + 1,
              text: `Question ${i + 1} on ${topic}: Explain key principles and applications.`,
              type: i % 2 === 0 ? 'mcq' : 'short',
              options: i % 2 === 0 ? ['Option A', 'Option B', 'Option C', 'Option D'] : undefined,
              marks: 5,
            })),
          });
          toast.success(`Generated & Downloaded ${modalType.toUpperCase()} PDF`, `Saved PDF for ${activeClass.course_code}.`);
        } else if (format === 'excel') {
          const headers = ['Question No', 'Question Text', 'Question Type', 'Marks', 'Topic'];
          const rows = Array.from({ length: numItems }, (_, i) => [
            i + 1,
            `Question ${i + 1} on ${topic}: Explain key principles`,
            i % 2 === 0 ? 'MCQ' : 'Short Answer',
            5,
            topic,
          ]);
          downloadExcelSheet(`${topic}_${modalType}_Sheet`, headers, rows);
          toast.success(`Downloaded ${modalType.toUpperCase()} Excel CSV`, `Exported CSV sheet for ${topic}.`);
        }
      } else if (modalType === 'ppt') {
        const slides = Array.from({ length: numItems }, (_, i) => ({
          title: i === 0 ? `Introduction to ${topic}` : `Key Concept ${i}: ${topic} Advanced Principles`,
          bullets: [
            `Core theoretical foundation of ${topic}`,
            `Practical application in ${activeClass.course_name}`,
            `Industry standards and system execution details`,
            `Summary and review question for students`,
          ],
        }));
        downloadPresentationOutline(`${topic}_Presentation`, slides);
        toast.success('Downloaded PPT Slide Outline', `Saved presentation outline for ${topic}.`);
      } else if (modalType === 'excel') {
        const res = await api.get('/students', { params: { class_id: activeClass.id, limit: 100 } });
        const students = res.data.students || [];
        const headers = ['Roll Number', 'Full Name', 'Email', 'Attendance %', 'Average Score', 'CGPA', 'Risk Level'];
        const rows = students.map((s: any) => [
          s.roll_number,
          s.full_name,
          s.email,
          `${s.attendance_percentage}%`,
          s.average_score,
          s.cgpa,
          s.risk_level.toUpperCase(),
        ]);
        downloadExcelSheet(`${activeClass.course_code}_Student_Roster`, headers, rows);
        toast.success('Downloaded Class Excel Roster', `Exported student analytics for ${activeClass.course_code}.`);
      }

      // Save document to backend database
      await api.post('/documents', {
        title: `${modalType?.toUpperCase()} — ${topic}`,
        document_type: modalType || 'general',
        format: format,
        class_id: activeClass.id,
      }).catch(() => {});

      // Refresh list
      const updatedDocs = await api.get('/documents', { params: { class_id: activeClass.id } });
      setDocuments(updatedDocs.data || []);

      setModalType(null);
    } catch (err) {
      toast.error('Failed to generate document');
    } finally {
      setGenerating(null);
    }
  };

  const handleSendDocumentToStudents = async (doc: any) => {
    if (!activeClass) return;
    try {
      await api.post('/communications/send-email', {
        class_id: activeClass.id,
        subject: `[Adamas University] ${doc.title} (${activeClass.course_code})`,
        body: `Dear Students,\n\nPlease find attached the official academic document for your course: "${doc.title}".\n\nBest regards,\n${user?.full_name || 'Faculty'}, Adamas University.`,
        recipient_type: 'all',
      });
      toast.success('Dispatched to All Students via Email', `Sent notification for "${doc.title}" to active class enrollment.`);
    } catch (err) {
      toast.error('Failed to dispatch email to students');
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
      toast.success('Generated & Downloaded Class Report PDF', `Included ${students.length} student records.`);
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
        toast.success('Downloaded Daily Notes PDF', `Saved "${note.topic}.pdf".`);
      } else {
        toast.info('No daily notes found', 'Generate lecture notes in the Daily Notes module first.');
      }
    } catch (err) {
      toast.error('Failed to generate Discussion Notes PDF');
    } finally {
      setGenerating(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#005BAC] via-[#0A6FD8] to-[#8CC63F] p-6 sm:p-8 rounded-3xl text-white shadow-xl flex items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-extrabold text-white">
            <FileText className="w-3.5 h-3.5 text-[#8CC63F]" /> Multi-Format AI Publishing Engine
          </div>
          <h1 className="text-2xl font-black">Document Studio & Publishing Engine</h1>
          <p className="text-xs text-slate-100 font-medium">
            Generate polished, professional PDF, Excel CSV, and PPT Presentation Outlines tailored to your topic and course syllabus.
          </p>
        </div>
        <div className="w-36 h-24 flex items-center justify-center hidden sm:flex flex-shrink-0 relative z-10">
          <img src="/images/document_studio.png" alt="Document Studio Banner" className="w-full h-auto max-h-24 object-contain drop-shadow-[0_10px_25px_rgba(0,0,0,0.4)]" />
        </div>
      </div>

      {/* Main Class Document Repository Vault */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
              Class Document Vault ({activeClass?.course_name} • {activeClass?.year_label} Sec {activeClass?.section_name})
            </h2>
            <p className="text-xs text-slate-500">All materials generated in Assignment, Quiz, or Daily Notes for this class are archived here.</p>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-blue-50 dark:bg-blue-950/60 text-[#005BAC] dark:text-[#8CC63F] rounded-xl border border-blue-200">
            {documents.length} Saved Files
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {documents.length === 0 ? (
            <div className="p-12 text-center">
              <File className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Vault Empty for {activeClass?.course_code}</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">Generate any Question Paper, Quiz, or Lecture Note in Assignment, Quiz, or Daily Notes section to auto-save them into this studio.</p>
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
                      <FileText className="w-4 h-4 text-[#005BAC]" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{doc.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded uppercase">{doc.document_type} • {doc.format || 'pdf'}</span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {doc.created_at ? new Date(doc.created_at).toLocaleDateString('en-IN') : ''}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSendDocumentToStudents(doc)}
                      className="px-3 py-1.5 bg-[#005BAC] hover:bg-[#0A6FD8] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
                      title="Send this generated document to all enrolled students via official email"
                    >
                      <Send className="w-3.5 h-3.5 text-[#8CC63F]" />
                      <span>Send to All Students (1-Click)</span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>


      {/* ─── AI Custom Generator Modal Form ─── */}
      <AnimatePresence>
        {modalType && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full overflow-hidden"
            >
              <div className="bg-gradient-to-r from-[#005BAC] via-[#0A6FD8] to-[#8CC63F] p-6 text-white flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-white/20">AI Material Customizer</span>
                  <h3 className="text-lg font-black mt-1 uppercase">Generate {modalType}</h3>
                </div>
                <button onClick={() => setModalType(null)} className="p-1 rounded-full hover:bg-white/20 text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Subject Topic / Syllabus Chapter *
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Relational Algebra & SQL Joins"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#005BAC] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                      Output Format
                    </label>
                    <select
                      value={format}
                      onChange={(e) => setFormat(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
                    >
                      <option value="pdf">PDF Document</option>
                      <option value="excel">Excel CSV Sheet</option>
                      <option value="ppt">PowerPoint (PPT Outline)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                      Difficulty Level
                    </label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
                    >
                      <option value="easy">Easy / Introductory</option>
                      <option value="medium">Medium / Standard</option>
                      <option value="hard">Hard / Advanced Exam</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Number of Questions / Slides: {numItems}
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="25"
                    step="5"
                    value={numItems}
                    onChange={(e) => setNumItems(Number(e.target.value))}
                    className="w-full accent-[#005BAC]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Custom Instructions for AI (Optional)
                  </label>
                  <textarea
                    value={customInstructions}
                    onChange={(e) => setCustomInstructions(e.target.value)}
                    placeholder="e.g. Focus on practical query writing, include 2 diagram questions, add Adamas University evaluation rubric..."
                    rows={2}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#005BAC] focus:outline-none"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => setModalType(null)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleGenerateDocument}
                    disabled={!topic.trim() || !!generating}
                    className="px-5 py-2 bg-[#005BAC] hover:bg-[#0A6FD8] text-white text-xs font-black rounded-xl shadow-md flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                    {generating ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Generating File...</>
                    ) : (
                      <><Sparkles className="w-4 h-4 text-[#8CC63F]" /> Generate & Download ({format.toUpperCase()})</>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
