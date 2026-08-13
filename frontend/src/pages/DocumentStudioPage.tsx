import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../api/client';
import { motion } from 'framer-motion';
import {
  FileText, Clock, File, Send
} from 'lucide-react';

import { SkeletonPageLoader } from '../components/SkeletonPageLoader';

export const DocumentStudioPage: React.FC = () => {
  const { activeClass, user } = useAuth();
  const toast = useToast();
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeClass) return;
    setLoading(true);
    api.get('/documents', { params: { class_id: activeClass.id } })
      .then(res => setDocuments(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeClass]);

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
    } catch (err) {
      toast.error('Failed to dispatch email to students');
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
            Generate polished, professional PDF, Excel CSV, and PPT Presentation Outlines tailored to your topic and course syllabus.
          </p>
        </div>
        <div className="w-36 h-24 hidden sm:flex items-center justify-center flex-shrink-0 relative z-10">
          <img src="/images/document_studio.webp" alt="Document Studio Banner" className="w-full h-auto max-h-24 object-contain drop-shadow-[0_10px_25px_rgba(0,0,0,0.4)]" />
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
    </div>
  );
};
