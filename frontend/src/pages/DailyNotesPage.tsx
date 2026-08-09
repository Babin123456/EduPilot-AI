import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Notebook, Sparkles, Send, Download, ChevronDown, ChevronUp,
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
      const res = await api.post(`/daily-notes/${note.id}/share`);
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
      toast.success('Downloaded Daily Notes PDF', `Saved "${note.topic}.pdf" with Adamas University branding.`);
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
            className="px-5 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-xl border border-white/40 text-white text-xs font-black rounded-xl transition-all shadow-lg active:scale-95 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-[#8CC63F]" />
            {showForm ? 'Cancel Form' : "Generate Today's Notes"}
          </button>
        </div>


        <div className="w-36 h-24 flex items-center justify-center hidden sm:flex flex-shrink-0 relative z-10">
          <img src="/images/daily_notes_banner.png" alt="Daily Notes Banner" className="w-full h-auto max-h-24 object-contain drop-shadow-[0_10px_25px_rgba(0,0,0,0.4)]" />
        </div>
      </div>



      {/* Generate Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-adamas-blue/30 shadow-md space-y-4"
          >
            <h3 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-adamas-blue dark:text-adamas-green" />
              Generate Daily Discussion Notes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Topic Discussed in Class Today *
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., TCP/IP Protocol Suite & 3-Way Handshake"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-adamas-blue focus:outline-none"
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
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-adamas-blue focus:outline-none"
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
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-adamas-blue focus:outline-none"
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleGenerate}
                disabled={!topic.trim() || generating}
                className="px-5 py-2.5 bg-adamas-blue hover:bg-adamas-blue-dark text-white text-xs font-bold rounded-lg shadow transition-all flex items-center gap-2 disabled:opacity-50"
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
                      className="px-3 py-2 bg-adamas-blue hover:bg-adamas-blue-dark text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow transition-all disabled:opacity-50"
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

                {/* Content Preview / Details */}
                <div className="p-5 border-t border-slate-100 dark:border-slate-800 space-y-4">
                  <div className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {note.content}
                  </div>

                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4"
                    >
                      {note.key_concepts && note.key_concepts.length > 0 && (
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">Key Concepts</h4>
                          <div className="flex flex-wrap gap-2">
                            {note.key_concepts.map((kc: string, i: number) => (
                              <span key={i} className="text-xs px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-md border border-slate-200 dark:border-slate-700">
                                {kc}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {note.discussion_points && note.discussion_points.length > 0 && (
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">Discussion Points</h4>
                          <ul className="list-disc list-inside space-y-1 text-xs text-slate-600 dark:text-slate-400">
                            {note.discussion_points.map((dp: string, i: number) => (
                              <li key={i}>{dp}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {note.practice_questions && note.practice_questions.length > 0 && (
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">Practice Questions</h4>
                          <ol className="list-decimal list-inside space-y-1 text-xs text-slate-600 dark:text-slate-400">
                            {note.practice_questions.map((pq: string, i: number) => (
                              <li key={i}>{pq}</li>
                            ))}
                          </ol>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};
