import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Send, Users, Search, CheckCircle2, Loader2,
  FileText, Clock, ChevronDown, ChevronUp, Inbox, AlertCircle
} from 'lucide-react';

export const CommunicationsPage: React.FC = () => {
  const { activeClass, user } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [sendMode, setSendMode] = useState<'all' | 'selected'>('all');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [expandedHistory, setExpandedHistory] = useState<string | null>(null);

  // Compose form
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');

  useEffect(() => {
    if (!activeClass) return;
    fetchData();
  }, [activeClass]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [studRes, tmplRes, histRes] = await Promise.all([
        api.get('/communications/student-emails', { params: { class_id: activeClass?.id } }),
        api.get('/communications/templates'),
        api.get('/communications', { params: { class_id: activeClass?.id } }),
      ]);
      setStudents(studRes.data.students || []);
      setTemplates(tmplRes.data || []);
      setHistory(histRes.data || []);
    } catch (err) {
      console.error('Failed to load communications data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const tmpl = templates.find(t => t.id === templateId);
    if (tmpl) {
      setSubject(tmpl.subject);
      setBody(tmpl.body
        .replace('{teacher_name}', user?.full_name || '')
        .replace('{designation}', user?.designation || 'Faculty')
      );
    }
  };

  const toggleStudentSelect = (studentId: string) => {
    const next = new Set(selectedStudents);
    if (next.has(studentId)) next.delete(studentId);
    else next.add(studentId);
    setSelectedStudents(next);
  };

  const toggleSelectAll = () => {
    if (selectedStudents.size === filteredStudents.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(filteredStudents.map(s => s.id)));
    }
  };

  const filteredStudents = students.filter(s =>
    !searchTerm ||
    s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.roll_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSend = async () => {
    if (!subject.trim() || !body.trim() || !activeClass) return;
    setSending(true);
    try {
      const res = await api.post('/communications/send-email', {
        class_id: activeClass.id,
        subject,
        body,
        recipient_type: sendMode,
        student_ids: sendMode === 'selected' ? Array.from(selectedStudents) : null,
        template_type: selectedTemplate || 'general',
      });
      setSuccessMsg(`✅ ${res.data.message}`);
      setSubject('');
      setBody('');
      setSelectedTemplate('');
      setSelectedStudents(new Set());
      fetchData(); // Refresh history
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      console.error('Failed to send email:', err);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {Array(3).fill(0).map((_, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 animate-pulse">
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-48 mb-3" />
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-80" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-adamas-blue flex items-center justify-center">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">Academic Communications</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Send emails to students — {activeClass?.course_name} ({activeClass?.course_code}) • {activeClass?.year_label} Sec {activeClass?.section_name}
            </p>
          </div>
        </div>
      </div>

      {/* Success Toast */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 p-4 rounded-xl text-emerald-800 dark:text-emerald-300 text-sm font-bold flex items-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            {successMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Student Directory */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-adamas-blue" /> Student Emails
                <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px]">{students.length}</span>
              </h3>
              <button
                onClick={toggleSelectAll}
                className="text-[10px] font-bold text-adamas-blue hover:underline"
              >
                {selectedStudents.size === filteredStudents.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search students..."
                className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-adamas-blue"
              />
            </div>
          </div>
          <div className="max-h-[400px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {filteredStudents.map(s => (
              <label
                key={s.id}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedStudents.has(s.id)}
                  onChange={() => toggleStudentSelect(s.id)}
                  className="w-3.5 h-3.5 rounded border-slate-300 text-adamas-blue focus:ring-adamas-blue"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{s.full_name}</p>
                  <p className="text-[10px] text-slate-500 truncate">{s.email}</p>
                </div>
                <span className="text-[10px] text-slate-400 font-mono flex-shrink-0">{s.roll_number}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Center: Compose */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-purple-500" /> Compose Email
            </h3>
          </div>
          <div className="p-4 flex-1 space-y-3">
            {/* Template Selector */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Template</label>
              <select
                value={selectedTemplate}
                onChange={(e) => handleTemplateSelect(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-adamas-blue"
              >
                <option value="">Custom Email</option>
                {templates.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            {/* Send Mode */}
            <div className="flex gap-2">
              <button
                onClick={() => setSendMode('all')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
                  sendMode === 'all'
                    ? 'bg-adamas-blue text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                All Students ({students.length})
              </button>
              <button
                onClick={() => setSendMode('selected')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
                  sendMode === 'selected'
                    ? 'bg-adamas-blue text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                Selected ({selectedStudents.size})
              </button>
            </div>

            {/* Subject */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Subject *</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email subject..."
                className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-adamas-blue"
              />
            </div>

            {/* Body */}
            <div className="flex-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Message *</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Type your message..."
                rows={8}
                className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-adamas-blue resize-none"
              />
            </div>

            {sendMode === 'selected' && selectedStudents.size === 0 && (
              <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/50 p-2 rounded-lg">
                <AlertCircle className="w-4 h-4" />
                Select students from the directory panel
              </div>
            )}

            <button
              onClick={handleSend}
              disabled={!subject.trim() || !body.trim() || sending || (sendMode === 'selected' && selectedStudents.size === 0)}
              className="w-full py-3 bg-adamas-blue hover:bg-adamas-blue-dark text-white text-xs font-extrabold rounded-xl flex items-center justify-center gap-2 shadow disabled:opacity-50 transition-colors"
            >
              {sending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
              ) : (
                <><Send className="w-4 h-4" /> Send Email</>
              )}
            </button>
          </div>
        </div>

        {/* Right: Sent History */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Inbox className="w-4 h-4 text-emerald-500" /> Sent History
              <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px]">{history.length}</span>
            </h3>
          </div>
          <div className="max-h-[500px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {history.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No emails sent yet
              </div>
            ) : (
              history.map(h => (
                <div key={h.id} className="p-3">
                  <button
                    onClick={() => setExpandedHistory(expandedHistory === h.id ? null : h.id)}
                    className="w-full text-left"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{h.subject}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            h.template_type === 'daily_notes' ? 'bg-emerald-50 text-emerald-600' :
                            h.template_type === 'attendance_warning' ? 'bg-red-50 text-red-600' :
                            'bg-blue-50 text-adamas-blue'
                          }`}>
                            {h.template_type || 'general'}
                          </span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {h.sent_at ? new Date(h.sent_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : ''}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                          {h.sent_count} sent
                        </span>
                        {expandedHistory === h.id ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                      </div>
                    </div>
                  </button>
                  <AnimatePresence>
                    {expandedHistory === h.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-2 p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                          {h.body}
                        </div>
                        {h.course_name && (
                          <p className="text-[10px] text-slate-400 mt-1">
                            {h.course_code} — {h.year_label} Sec {h.section_name}
                          </p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
