import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Notebook, Sparkles, Send, Download, ChevronDown, ChevronUp,
  Calendar, Clock, BookOpen, CheckCircle2, Loader2, Mail
} from 'lucide-react';
import { generateDailyNotePDF } from '../utils/pdfGenerator';

export const DailyNotesPage: React.FC = () => {
  const { activeClass, user } = useAuth();
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
    } catch (err) {
      console.error('Failed to generate notes:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleShare = async (note: any) => {
    if (!activeClass) return;
    setSharing(note.id);
    try {
      const res = await api.post('/daily-notes/share', {
        note_id: note.id,
        class_id: activeClass.id,
      });
      // Update note in state
      setNotes(prev => prev.map(n =>
        n.id === note.id ? { ...n, is_shared: true, status: 'shared', shared_at: new Date().toISOString() } : n
      ));
      setShareSuccess(`✅ Notes sent to ${res.data.total_recipients} students!`);
      setTimeout(() => setShareSuccess(null), 4000);
    } catch (err) {
      console.error('Failed to share notes:', err);
    } finally {
      setSharing(null);
    }
  };

  const handleDownloadPDF = (note: any) => {
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
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-500 flex items-center justify-center">
            <Notebook className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">Daily Discussion Notes</h1>
            <p className="text-xs text-slate-500 mt-0.5">Generate & share topic notes with your class — One click!</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2.5 bg-adamas-green hover:bg-adamas-green-dark text-slate-950 text-xs font-extrabold rounded-lg flex items-center gap-2 shadow transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          Generate Notes
        </button>
      </div>

      {/* Success Toast */}
      <AnimatePresence>
        {shareSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 p-4 rounded-xl text-emerald-800 dark:text-emerald-300 text-sm font-bold flex items-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            {shareSuccess}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generation Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-2xl text-white shadow-lg space-y-4">
              <div className="flex items-center gap-2 text-adamas-green font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4" /> Generate Discussion Notes via EduPilot AI
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">
                    Topic Discussed in Class *
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., TCP/IP Protocol Suite, Binary Trees..."
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-adamas-green"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value) || 60)}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-adamas-green"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">
                  Additional Context (Optional)
                </label>
                <textarea
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="Any additional notes about what was discussed, emphasis areas, etc."
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-adamas-green resize-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={handleGenerate}
                  disabled={!topic.trim() || generating}
                  className="px-6 py-2.5 bg-adamas-green hover:bg-adamas-green-dark text-slate-950 text-xs font-extrabold rounded-lg flex items-center gap-2 shadow disabled:opacity-50 transition-colors"
                >
                  {generating ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                  ) : (
                    <><Sparkles className="w-4 h-4" /> Generate Notes</>
                  )}
                </button>
                <span className="text-[10px] text-slate-400">
                  For: {activeClass?.course_name} ({activeClass?.course_code}) — {activeClass?.year_label} Sec {activeClass?.section_name}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notes List */}
      {loading ? (
        <div className="space-y-4">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 animate-pulse">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-48 mb-3" />
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-96" />
            </div>
          ))}
        </div>
      ) : notes.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-900 dark:text-white">No discussion notes yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            After your lecture, generate notes on the topic you discussed. Then share them with all students in one click!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notes.map((note, i) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
            >
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded">
                        {note.course_code}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        {note.year_label} • Sec {note.section_name}
                      </span>
                      {note.is_shared && (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 dark:bg-blue-950/50 text-adamas-blue dark:text-blue-400 rounded flex items-center gap-1">
                          <Mail className="w-3 h-3" /> Shared
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">{note.topic}</h3>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(note.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {note.duration_minutes} min</span>
                      <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> {note.course_name}</span>
                    </div>
                    {note.summary && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">{note.summary}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleDownloadPDF(note)}
                      className="px-3 py-1.5 bg-adamas-blue text-white text-xs font-bold rounded-lg flex items-center gap-1 hover:bg-adamas-blue-dark transition-colors"
                      title="Download PDF"
                    >
                      <Download className="w-3.5 h-3.5" /> PDF
                    </button>
                    {!note.is_shared && (
                      <button
                        onClick={() => handleShare(note)}
                        disabled={sharing === note.id}
                        className="px-3 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center gap-1 hover:bg-emerald-600 transition-colors disabled:opacity-50"
                        title="Send to all students"
                      >
                        {sharing === note.id ? (
                          <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending...</>
                        ) : (
                          <><Send className="w-3.5 h-3.5" /> Send to All</>
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => setExpandedId(expandedId === note.id ? null : note.id)}
                      className="px-2 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      {expandedId === note.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              <AnimatePresence>
                {expandedId === note.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="border-t border-slate-200 dark:border-slate-800 overflow-hidden"
                  >
                    <div className="p-5 space-y-4">
                      {/* Key Concepts */}
                      {note.key_concepts?.length > 0 && (
                        <div>
                          <h4 className="text-xs font-bold text-adamas-blue dark:text-adamas-green uppercase tracking-wider mb-2">Key Concepts</h4>
                          <ul className="space-y-1">
                            {note.key_concepts.map((c: string, idx: number) => (
                              <li key={idx} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-adamas-green mt-1.5 flex-shrink-0" />
                                {c}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Discussion Points */}
                      {note.discussion_points?.length > 0 && (
                        <div>
                          <h4 className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-2">Discussion Points</h4>
                          <ul className="space-y-1">
                            {note.discussion_points.map((d: string, idx: number) => (
                              <li key={idx} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                                <span className="text-purple-500 font-bold">{idx + 1}.</span>
                                {d}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Practice Questions */}
                      {note.practice_questions?.length > 0 && (
                        <div>
                          <h4 className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-2">Practice Questions</h4>
                          <ul className="space-y-1.5">
                            {note.practice_questions.map((q: string, idx: number) => (
                              <li key={idx} className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-2.5 rounded-lg">
                                <span className="font-bold text-slate-900 dark:text-white">Q{idx + 1}.</span> {q}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {note.shared_at && (
                        <p className="text-[10px] text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3">
                          Shared on {new Date(note.shared_at).toLocaleString('en-IN')}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
