import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../api/client';
import {
  Mail, Send, Users, Search, CheckCircle2, Loader2,
  Clock, ChevronDown, ChevronUp, Inbox, FileText
} from 'lucide-react';

export const CommunicationsPage: React.FC = () => {
  const location = useLocation();
  const { activeClass, user } = useAuth();
  const toast = useToast();
  const [students, setStudents] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
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
    try {
      const [studRes, tmplRes, histRes] = await Promise.all([
        api.get('/communications/student-emails', { params: { class_id: activeClass?.id } }),
        api.get('/communications/templates'),
        api.get('/communications', { params: { class_id: activeClass?.id } }),
      ]);
      const fetchedStudents: any[] = studRes.data.students || [];
      setStudents(fetchedStudents);
      setTemplates(tmplRes.data || []);
      setHistory(histRes.data || []);

      // Check if navigated with pre-selected student target
      const navState = location.state as { targetEmail?: string; targetName?: string; attendancePct?: number } | null;
      if (navState?.targetEmail) {
        const matched = fetchedStudents.find((s: any) => s.email === navState.targetEmail);
        if (matched) {
          setSelectedStudents(new Set([matched.id]));
          setSendMode('selected');
          
          if (navState.attendancePct !== undefined && navState.attendancePct < 75) {
            // Auto-load attendance warning template
            const attTmpl = (tmplRes.data || []).find((t: any) => t.id === 'attendance-warning');
            if (attTmpl) {
              setSelectedTemplate(attTmpl.id);
              setSubject(attTmpl.subject);
              setBody(attTmpl.body
                .replace('{teacher_name}', user?.full_name || '')
                .replace('{designation}', user?.designation || 'Faculty')
              );
            } else {
              setSubject(`Attendance Warning Notice — ${activeClass.course_code}`);
              setBody(`Dear ${navState.targetName || 'Student'},\n\nYour current attendance in ${activeClass.course_name} (${activeClass.course_code}) is ${navState.attendancePct}%, which is below the required 75% threshold. Please meet me during office hours to discuss your attendance recovery plan.\n\nRegards,\n${user?.full_name || 'Faculty'}\n${user?.designation || 'Department of Computer Science'}`);
            }
          } else {
            setSubject(`Academic Notice — ${activeClass.course_code}`);
            setBody(`Dear ${navState.targetName || 'Student'},\n\n[Type your message here]\n\nRegards,\n${user?.full_name || 'Faculty'}`);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load communications data:', err);
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
      toast.info(`Loaded Template: "${tmpl.title || tmpl.name}"`, 'Subject and body updated in composer.');
    }
  };

  const handleToggleStudent = (studentId: string) => {
    setSelectedStudents(prev => {
      const next = new Set(prev);
      if (next.has(studentId)) next.delete(studentId);
      else next.add(studentId);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedStudents.size === filteredStudents.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(filteredStudents.map(s => s.id)));
    }
  };

  const handleSendEmail = async () => {
    if (!subject.trim() || !body.trim() || !activeClass) return;

    if (sendMode === 'selected' && selectedStudents.size === 0) {
      toast.warning('No students selected', 'Please select at least one student or choose "All Enrolled Students".');
      return;
    }

    setSending(true);
    try {
      const res = await api.post('/communications/send-email', {
        class_id: activeClass.id,
        subject: subject.trim(),
        body: body.trim(),
        target_group: sendMode === 'all' ? 'all' : 'selected',
        selected_student_ids: sendMode === 'selected' ? Array.from(selectedStudents) : [],
        template_id: selectedTemplate || null,
      });

      setSuccessMsg(`Email dispatched to ${res.data.sent_count} students!`);
      toast.success(`Dispatched email to ${res.data.sent_count} students!`, `Subject: "${subject.trim()}"`);
      setHistory(prev => [res.data.communication, ...prev]);

      // Reset form
      setSubject('');
      setBody('');
      setSelectedTemplate('');
      setSelectedStudents(new Set());

      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      toast.error('Failed to send email', 'Please try again.');
    } finally {
      setSending(false);
    }
  };

  const filteredStudents = students.filter(s => {
    const sName = (s.name || s.full_name || '').toLowerCase();
    const sRoll = (s.roll_number || '').toLowerCase();
    const sEmail = (s.email || '').toLowerCase();
    const query = (searchTerm || '').toLowerCase();
    return sName.includes(query) || sRoll.includes(query) || sEmail.includes(query);
  });

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#005BAC] via-[#0A6FD8] to-[#8CC63F] p-6 sm:p-8 rounded-3xl text-white shadow-xl flex items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-extrabold text-white">
            <Mail className="w-3.5 h-3.5 text-[#8CC63F]" /> Institutional Email Dispatcher
          </div>
          <h1 className="text-2xl font-black">Student Mail & Communications Hub</h1>
          <p className="text-xs text-slate-100 font-medium">
            {activeClass ? `${activeClass.course_name} (${activeClass.course_code}) • ${activeClass.year_label} Sec ${activeClass.section_name}` : 'Send official announcements, warning alerts, and course materials.'}
          </p>
        </div>
        <div className="w-36 h-24 hidden sm:flex items-center justify-center flex-shrink-0 relative z-10">
          <img src="/images/communication.png" alt="Student Mail & Communications Hub Banner" className="w-full h-auto max-h-24 object-contain drop-shadow-[0_10px_25px_rgba(0,0,0,0.4)]" />
        </div>

      </div>



      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel: Student Directory & Selection */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-blue dark:text-brand-green" />
              Student Directory ({students.length})
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-500 uppercase">
              {sendMode === 'all' ? 'All Enrolled' : `${selectedStudents.size} Selected`}
            </span>
          </div>

          {/* Mode Switcher */}
          <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setSendMode('all')}
              className={`py-1.5 rounded-lg transition-colors ${
                sendMode === 'all' ? 'bg-white dark:bg-slate-900 text-brand-blue dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              All Students ({students.length})
            </button>
            <button
              onClick={() => setSendMode('selected')}
              className={`py-1.5 rounded-lg transition-colors ${
                sendMode === 'selected' ? 'bg-white dark:bg-slate-900 text-brand-blue dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Selected ({selectedStudents.size})
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, roll number, or email..."
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
          </div>

          {sendMode === 'selected' && (
            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <button onClick={handleSelectAll} className="font-bold text-brand-blue hover:underline">
                {selectedStudents.size === filteredStudents.length ? 'Deselect All' : 'Select All'}
              </button>
              <span>{selectedStudents.size} of {filteredStudents.length} selected</span>
            </div>
          )}

          {/* Student List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 pr-1">
            {filteredStudents.map((student) => {
              const isSelected = selectedStudents.has(student.id);
              return (
                <div
                  key={student.id}
                  onClick={() => {
                    setSendMode('selected');
                    handleToggleStudent(student.id);
                  }}
                  className={`p-3 rounded-xl flex items-center justify-between transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                    isSelected ? 'bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800' : ''
                  }`}
                >
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{student.name || student.full_name}</p>
                    <p className="text-[10px] text-slate-500">{student.roll_number}</p>
                    <p className="text-[10px] text-[#005BAC] dark:text-[#8CC63F] font-mono">{student.email}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    readOnly
                    className="w-4 h-4 rounded text-[#005BAC] focus:ring-[#005BAC] cursor-pointer"
                  />
                </div>


              );
            })}
          </div>
        </div>

        {/* Right Panel: Compose & Send Email */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <Send className="w-4 h-4 text-brand-blue dark:text-brand-green" />
              Compose Email Message
            </h3>

            {/* Template Selector */}
            {templates.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Quick Email Template
                </label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => handleTemplateSelect(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
                >
                  <option value="">-- Choose a Pre-formatted Template --</option>
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>{t.title || t.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Subject */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Email Subject Line *
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Attendance Alert / Assignment 2 Submission Reminder"
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>

            {/* Body */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">
                  Email Message Content *
                </label>
                {/* 1-Click Knowledge Base Material Picker */}
                <button
                  type="button"
                  onClick={async () => {
                    if (!activeClass) return;
                    try {
                      const res = await api.get('/documents', { params: { class_id: activeClass.id } });
                      const docs = res.data || [];
                      if (docs.length === 0) {
                        toast.info('No Saved Documents', 'Generate a document in Daily Notes or Document Studio first.');
                        return;
                      }
                      const latestDoc = docs[0];
                      setSubject(`[${activeClass.course_code}] Course Material: ${latestDoc.title}`);
                      setBody(`Dear Students,\n\nPlease review the attached official course document for ${activeClass.course_name} (${activeClass.course_code}):\n\n📌 Title: ${latestDoc.title}\n📅 Date: ${new Date(latestDoc.created_at || Date.now()).toLocaleDateString()}\n\n---\nSummary / Outline:\n${latestDoc.content?.substring(0, 500) || 'Official material generated via EduPilot AI.'}\n\nBest regards,\n${user?.full_name || 'Faculty'}, Department of Computer Science.`);
                      toast.success('Attached Knowledge Base Document', `Inserted "${latestDoc.title}" into email draft.`);
                    } catch (err) {
                      toast.error('Could not load Knowledge Base files');
                    }
                  }}
                  className="text-[11px] font-bold text-[#005BAC] dark:text-[#8CC63F] hover:underline flex items-center gap-1"
                >
                  <FileText className="w-3 h-3 text-[#8CC63F]" /> Attach Latest Knowledge Base File
                </button>
              </div>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={6}
                placeholder="Type your message content here or click 'Attach Latest Knowledge Base File'..."
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>

            {successMsg && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-xl flex items-center gap-2 border border-emerald-200">
                <CheckCircle2 className="w-4 h-4" /> {successMsg}
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500 font-semibold">
                Target: {sendMode === 'all' ? `All ${students.length} students` : `${selectedStudents.size} selected student(s)`}
              </span>
              <button
                onClick={handleSendEmail}
                disabled={!subject.trim() || !body.trim() || sending}
                className="px-6 py-2.5 bg-[#005BAC] hover:bg-[#0A6FD8] text-white text-xs font-bold rounded-xl shadow transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {sending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Dispatching Emails...</>
                ) : (
                  <><Send className="w-4 h-4 text-[#8CC63F]" /> Send Email Now</>
                )}
              </button>
            </div>
          </div>

          {/* History Section */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <Inbox className="w-4 h-4 text-brand-blue dark:text-brand-green" />
              Sent Mail History ({history.length})
            </h3>

            {history.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No emails sent for this class section yet.</p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {history.map((item) => {
                  const isExpanded = expandedHistory === item.id;
                  return (
                    <div key={item.id} className="py-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{item.subject}</p>
                          <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-0.5">
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(item.sent_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                            <span className="font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded">Sent to {item.recipient_count} student(s)</span>
                          </div>
                        </div>
                        <button
                          onClick={() => setExpandedHistory(isExpanded ? null : item.id)}
                          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>

                      {isExpanded && (
                        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap mt-2">
                          {item.body}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
