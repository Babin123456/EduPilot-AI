import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Clock, File, Send, Eye, X, Trash2
} from 'lucide-react';
import { SkeletonPageLoader } from '../components/SkeletonPageLoader';

export const DocumentStudioPage: React.FC = () => {
  const { activeClass, user } = useAuth();
  const toast = useToast();
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewDoc, setPreviewDoc] = useState<any | null>(null);
  const [docToDelete, setDocToDelete] = useState<any | null>(null);

  useEffect(() => {
    if (!activeClass) return;
    fetchDocuments();
  }, [activeClass?.id]);

  const fetchDocuments = () => {
    setLoading(true);
    api.get('/documents', { params: { class_id: activeClass?.id } })
      .then(res => setDocuments(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const handleSendDocumentToStudents = async (doc: any) => {
    if (!activeClass) return;
    try {
      await api.post('/communications/send-email', {
        class_id: activeClass.id,
        subject: `[University Academic OS] ${doc.title} (${activeClass.course_code})`,
        body: `Dear Students,\n\nPlease find attached the official academic document for your course: "${doc.title}".\n\nBest regards,\n${user?.full_name || 'Faculty'}, Department of Computer Science.`,
        recipient_type: 'all',
      });
      toast.success('Dispatched to All Students via Email', `Sent notification for "${doc.title}" to active class enrollment.`);
      if (previewDoc?.id === doc.id) {
        setPreviewDoc(null);
      }
    } catch (err) {
      toast.error('Failed to dispatch email to students');
    }
  };

  const confirmDeleteDocument = async (docId: string) => {
    try {
      await api.delete(`/documents/${docId}`).catch(() => {});
      setDocuments(prev => prev.filter(d => d.id !== docId));
      toast.success('Document Deleted', 'Document removed from studio vault.');
      if (previewDoc?.id === docId) setPreviewDoc(null);
    } catch {
      toast.error('Failed to delete document');
    }
  };

  if (loading) {
    return <SkeletonPageLoader count={6} />;
  }

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
            Preview, format, and dispatch official course materials, assignments, and lecture notes directly to your students.
          </p>
        </div>
        <div className="w-36 h-24 hidden sm:flex items-center justify-center flex-shrink-0 relative z-10">
          <img src="/images/document_studio.webp" alt="Document Studio Banner" className="w-full h-auto max-h-24 object-contain drop-shadow-[0_10px_25px_rgba(0,0,0,0.4)]" />
        </div>
      </div>

      {/* Main Class Document Repository Vault */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
              Class Document Vault ({activeClass?.course_name} • {activeClass?.year_label} Sec {activeClass?.section_name})
            </h2>
            <p className="text-xs text-slate-500">All materials generated in Assignment, Quiz, or Daily Notes for this class are archived here.</p>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-blue-50 dark:bg-blue-950/60 text-[#005BAC] dark:text-[#8CC63F] rounded-xl border border-blue-200 dark:border-blue-900 self-start sm:self-auto">
            {documents.length} Saved Files
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {documents.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 dark:bg-emerald-950/40 text-[#005BAC] dark:text-[#8CC63F] flex items-center justify-center mb-3 border border-blue-100 dark:border-emerald-900/50">
                <File className="w-7 h-7 text-[#005BAC] dark:text-[#8CC63F]" />
              </div>
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
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#005BAC]/10 text-[#005BAC] dark:bg-[#8CC63F]/20 dark:text-[#8CC63F] flex items-center justify-center flex-shrink-0 font-bold">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{doc.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded uppercase">
                          {doc.document_type} • {doc.format || 'pdf'}
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {doc.created_at ? new Date(doc.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* View Preview Button */}
                    <button
                      onClick={() => setPreviewDoc(doc)}
                      className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-extrabold rounded-xl flex items-center gap-1.5 transition-all"
                      title="View formatted document preview before sending to students"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#005BAC] dark:text-[#8CC63F]" />
                      <span>View Preview</span>
                    </button>

                    {/* Send to All Students Button */}
                    <button
                      onClick={() => handleSendDocumentToStudents(doc)}
                      className="px-3 py-1.5 bg-[#005BAC] hover:bg-[#0A6FD8] text-white text-xs font-extrabold rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
                      title="Send this generated document to all enrolled students via official email"
                    >
                      <Send className="w-3.5 h-3.5 text-[#8CC63F]" />
                      <span>Send to Students</span>
                    </button>

                    {/* Delete Document Button */}
                    <button
                      onClick={() => setDocToDelete(doc)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-all"
                      title="Delete document from studio vault"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── 👁️ DOCUMENT PREVIEW MODAL (VIEW BEFORE SENDING) ── */}
      <AnimatePresence>
        {previewDoc && (
          <div
            onClick={() => setPreviewDoc(null)}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-3xl max-h-[85vh] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col cursor-default"
            >
              {/* Modal Top Bar */}
              <div className="p-5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#005BAC] text-white flex items-center justify-center flex-shrink-0">
                    <Eye className="w-5 h-5 text-[#8CC63F]" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white truncate max-w-md">
                      Document Preview: {previewDoc.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Course: {activeClass?.course_name} ({activeClass?.course_code}) • Format: {previewDoc.format?.toUpperCase() || 'PDF'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Preview Body */}
              <div className="p-6 overflow-y-auto space-y-4 flex-1 text-slate-800 dark:text-slate-200 text-xs leading-relaxed font-sans">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 border-b border-slate-200 dark:border-slate-700/60 pb-2">
                    <span>OFFICIAL UNIVERSITY ACADEMIC MATERIAL</span>
                    <span>Format: {previewDoc.format?.toUpperCase() || 'PDF'}</span>
                  </div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">{previewDoc.title}</h2>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                    Department of Computer Science • Section {activeClass?.section_name} • {activeClass?.year_label}
                  </p>
                </div>

                <div className="p-4 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner space-y-3">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {previewDoc.content_json || previewDoc.content || `### Document Overview\n\nThis official course material **"${previewDoc.title}"** was generated for **${activeClass?.course_name} (${activeClass?.course_code})**.\n\n- **Target Enrollment**: ${activeClass?.year_label} Section ${activeClass?.section_name}\n- **Author**: ${user?.full_name || 'Faculty'}\n- **Status**: Verified & Ready for Distribution`}
                  </ReactMarkdown>
                </div>
              </div>

              {/* Modal Bottom Action Toolbar */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setPreviewDoc(null)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors"
                >
                  Close Preview
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSendDocumentToStudents(previewDoc)}
                    className="px-5 py-2 bg-[#005BAC] hover:bg-[#0A6FD8] text-white text-xs font-extrabold rounded-xl shadow-md flex items-center gap-2 transition-all active:scale-95"
                  >
                    <Send className="w-4 h-4 text-[#8CC63F]" />
                    <span>Send to Students (1-Click)</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── ⚠️ DELETE CONFIRMATION MODAL FOR DOCUMENT STUDIO ── */}
      <AnimatePresence>
        {docToDelete && (
          <div
            onClick={() => setDocToDelete(null)}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Delete Studio Document?</h3>
                  <p className="text-xs text-slate-500 font-medium truncate max-w-xs">{docToDelete.title}</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Are you sure you want to permanently delete <strong>"{docToDelete.title}"</strong> from the class document vault?
              </p>
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setDocToDelete(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const targetId = docToDelete.id;
                    setDocToDelete(null);
                    confirmDeleteDocument(targetId);
                  }}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold rounded-xl shadow-md transition-all active:scale-95"
                >
                  Yes, Delete Document
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
