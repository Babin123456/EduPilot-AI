import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Notebook, Sparkles, Download, ChevronDown, ChevronUp,
  Calendar, Clock, BookOpen, CheckCircle2, Loader2, Mail
} from 'lucide-react';
import { generateDailyNotePDF } from '../utils/pdfGenerator';


export const DailyNotesPage: React.FC = () => {
  const { activeClass, user } = useAuth();
  const toast = useToast();
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [sharing, setSharing] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [shareSuccess, setShareSuccess] = useState<string | null>(null);

  // Form state
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState(60);
  const [context, setContext] = useState('');

  useEffect(() => {
    if (!activeClass) return;
    fetchNotes();
  }, [activeClass]);

  const fetchNotes = () => {
    setLoading(true);
    api.get('/daily-notes', { params: { class_id: activeClass?.id } })
      .then(res => setNotes(res.data))
      .finally(() => setLoading(false));
  };

  const handleGenerate = async () => {
    if (!topic.trim() || !activeClass) return;
    setGenerating(true);
    try {
      const res = await api.post('/daily-notes/generate', {
        class_id: activeClass.id,
        topic: topic.trim(),
        duration_minutes: duration,
        additional_context: context.trim() || null,
      });
      setNotes(prev => [res.data, ...prev]);
      setTopic('');
      setContext('');
      setShowForm(false);
      setExpandedId(res.data.id);
      toast.success(`Generated Daily Notes for "${res.data.topic}"!`, `Ready to download PDF or share with ${activeClass.year_label} Sec ${activeClass.section_name}.`);
    } catch (err) {
      toast.error('Failed to generate notes', 'Please check your connection and try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleShare = async (note: any) => {
    setSharing(note.id);
    try {
      const res = await api.post(`/daily-notes/share`, {
        note_id: note.id,
        class_id: activeClass?.id,
      });
      setShareSuccess(note.id);
      setNotes(prev => prev.map(n => n.id === note.id ? { ...n, is_shared: true, shared_at: res.data.shared_at } : n));
      toast.success(`Notes shared to ${res.data.recipient_count} students!`, `Emailed "${note.topic}" to all students in ${activeClass?.year_label} Sec ${activeClass?.section_name}.`);
      setTimeout(() => setShareSuccess(null), 4000);
    } catch (err) {
      toast.error('Sharing failed', 'Unable to dispatch student emails.');
    } finally {
      setSharing(null);
    }
  };


  const handleDownloadPDF = (note: any) => {
    try {
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
      toast.success('Downloaded Daily Notes PDF', `Saved "${note.topic}.pdf" with institutional branding.`);
    } catch (err) {
      toast.error('PDF generation error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#005BAC] via-[#0A6FD8] to-[#8CC63F] p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-extrabold text-white">
            <Notebook className="w-3.5 h-3.5 text-[#8CC63F]" /> Classroom Discussion Log
          </div>
          <h1 className="text-2xl font-black">Daily Topic Discussion Notes</h1>
          <p className="text-xs text-slate-100 font-medium">
            {activeClass ? `${activeClass.course_name} (${activeClass.course_code}) • ${activeClass.year_label} Sec ${activeClass.section_name}` : 'AI Lecture Summarizer & Student Notes Dispatch'}
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-5 py-2.5 bg-slate-950 hover:bg-slate-900 text-white text-xs font-black rounded-xl transition-all shadow-lg active:scale-95 flex items-center gap-2 border border-slate-700"
          >
            <Sparkles className="w-4 h-4 text-[#8CC63F]" />
            <span>{showForm ? 'Cancel Form' : "Generate Note"}</span>
          </button>
          <div className="w-36 h-24 items-center justify-center hidden sm:flex flex-shrink-0">
            <img src="/images/daily_notes_banner.png" alt="Daily Notes Banner" className="w-full h-auto max-h-24 object-contain drop-shadow-[0_10px_25px_rgba(0,0,0,0.4)]" />
          </div>
        </div>
      </div>

      {/* Generate Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-brand-blue/30 shadow-md space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#005BAC] dark:text-[#8CC63F]" />
                Generate Lecture Discussion Note
              </h3>
              <span className="text-xs font-bold px-3 py-1 bg-blue-50 dark:bg-blue-950/60 text-[#005BAC] dark:text-blue-300 rounded-lg border border-blue-200">
                Subject: {activeClass?.course_name || 'Select Class Top Bar'} ({activeClass?.course_code})
              </span>
            </div>
            {/* Dynamic Syllabus Topics Selector for Active Course */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Select Course Syllabus Topic for {activeClass?.course_name || 'Subject'} *
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2 max-h-28 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-slate-800">
                {[
                  `Introduction to ${activeClass?.course_name || 'Subject'} & System Bounds`,
                  `Core Architecture & Operational Invariants in ${activeClass?.course_name || 'Course'}`,
                  `Advanced Algorithmic Design & Optimization`,
                  `Real-World Case Study Analysis & Execution`,
                  `Performance Tuning, Benchmarking & Metrics`,
                  `Security Protocols, Authentication & Authorization`,
                  `Fault Tolerance & Error Recovery Strategies`,
                ].map((recTopic, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setTopic(recTopic)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border font-semibold transition-all ${
                      topic === recTopic
                        ? 'bg-[#005BAC] text-white border-[#005BAC] shadow-sm scale-105'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-[#005BAC]'
                    }`}
                  >
                    {recTopic}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Selected Topic *
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Select a syllabus topic above or enter custom topic..."
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-blue focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Lecture Duration (Mins)
                </label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-blue focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Additional Notes or Key Points (Optional)
              </label>
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Mention specific examples, diagrams drawn on blackboard, or key textbook chapters..."
                rows={2}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-blue focus:outline-none"
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleGenerate}
                disabled={!topic.trim() || generating}
                className="px-5 py-2.5 bg-brand-blue hover:bg-brand-blue-dark text-white text-xs font-bold rounded-lg shadow transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {generating ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Generating Notes...</>
                ) : (
                  <><Sparkles className="w-4 h-4" /> Generate & Save Notes</>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notes List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center animate-pulse">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400 mx-auto mb-2" />
            <p className="text-xs text-slate-400">Loading daily discussion notes...</p>
          </div>
        ) : notes.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-800">
            <Notebook className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-xs text-slate-500 font-semibold">No daily discussion notes created yet for this class section.</p>
            <p className="text-[11px] text-slate-400 mt-1">Click "Generate Today's Notes" above to create notes for your lecture.</p>
          </div>
        ) : (
          notes.map((note, index) => {
            const isExpanded = expandedId === note.id;
            return (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
              >
                {/* Header Row */}
                <div className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/50">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-slate-900 dark:text-white text-base">{note.topic}</h3>
                      {note.is_shared && (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 rounded-md border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Shared via Email
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(note.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {note.duration_minutes} Mins</span>
                      <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> {note.course_name} ({note.course_code})</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                    <button
                      onClick={() => handleDownloadPDF(note)}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" /> PDF
                    </button>
                    <button
                      onClick={() => handleShare(note)}
                      disabled={sharing === note.id}
                      className="px-3 py-2 bg-brand-blue hover:bg-brand-blue-dark text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow transition-all disabled:opacity-50"
                    >
                      {sharing === note.id ? (
                        <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending...</>
                      ) : (
                        <><Mail className="w-3.5 h-3.5" /> {note.is_shared ? 'Resend to All' : 'Send to All Students'}</>
                      )}
                    </button>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : note.id)}
                      className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Shared Confirmation Banner */}
                {shareSuccess === note.id && (
                  <div className="px-5 py-2 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 border-t border-b border-emerald-200">
                    <CheckCircle2 className="w-4 h-4" /> Notes successfully emailed to all enrolled section students!
                  </div>
                )}

                {/* Content Preview / Details (Collapsible) */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="p-5 border-t border-slate-100 dark:border-slate-800 space-y-4"
                    >
                      <div className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-normal">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            h1: ({ node, ...props }) => <h1 className="text-sm font-extrabold text-slate-900 dark:text-white mb-2 mt-3" {...props} />,
                            h2: ({ node, ...props }) => <h2 className="text-xs font-bold text-slate-900 dark:text-white mb-1.5 mt-2" {...props} />,
                            h3: ({ node, ...props }) => <h3 className="text-xs font-bold text-[#005BAC] dark:text-[#8CC63F] mb-1 mt-2" {...props} />,
                            p: ({ node, ...props }) => <p className="mb-2 last:mb-0 leading-relaxed" {...props} />,
                            ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
                            ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mb-2 space-y-1" {...props} />,
                            li: ({ node, ...props }) => <li className="" {...props} />,
                            strong: ({ node, ...props }) => <strong className="font-bold text-slate-900 dark:text-white" {...props} />,
                          }}
                        >
                          {note.content}
                        </ReactMarkdown>
                      </div>

                      {note.summary && (
                        <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 mt-4">
                          <h4 className="text-xs font-extrabold text-[#005BAC] dark:text-[#8CC63F] uppercase tracking-wider mb-1">Executive Summary</h4>
                          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{note.summary}</p>
                        </div>
                      )}

                      {note.key_concepts && note.key_concepts.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">Key Concepts Covered</h4>
                          <div className="flex flex-wrap gap-2">
                            {note.key_concepts.map((kc: string, i: number) => (
                              <span key={i} className="text-xs px-2.5 py-1 bg-blue-50 dark:bg-blue-950/60 text-[#005BAC] dark:text-blue-300 font-bold rounded-lg border border-blue-200 dark:border-blue-800">
                                {kc}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {note.discussion_points && note.discussion_points.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">Discussion Points</h4>
                          <ul className="list-disc list-inside space-y-1 text-xs text-slate-600 dark:text-slate-400">
                            {note.discussion_points.map((dp: string, i: number) => (
                              <li key={i}>{dp}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {note.practice_questions && note.practice_questions.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">Practice & Revision Questions</h4>
                          <ol className="list-decimal list-inside space-y-1 text-xs text-slate-600 dark:text-slate-400">
                            {note.practice_questions.map((pq: string, i: number) => (
                              <li key={i}>{pq}</li>
                            ))}
                          </ol>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>


            );
          })
        )}
      </div>
    </div>
  );
};
