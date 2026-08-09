import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot, Send, Sparkles, Paperclip, FileText, Image as ImageIcon,
  FileSpreadsheet, Presentation, File, X, Loader2, CheckCircle2, Cpu
} from 'lucide-react';

interface AttachedFile {
  filename: string;
  file_type: string;
  extracted_text: string;
  summary: string;
}

export const AIPage: React.FC = () => {
  const { activeClass } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [attachedFile, setAttachedFile] = useState<AttachedFile | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/ai/upload-file', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setAttachedFile(res.data);
    } catch (err) {
      console.error('File upload error:', err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if ((!query.trim() && !attachedFile) || loading) return;

    const userMsgContent = query.trim() + (attachedFile ? `\n\n📎 [Attached File: ${attachedFile.filename}]` : '');
    const userMsg = { role: 'user', content: userMsgContent };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    const fileContext = attachedFile ? attachedFile.extracted_text : null;
    setAttachedFile(null); // Reset file attachment after sending

    try {
      const res = await api.post('/ai/chat', {
        message: query || `Please analyze the attached ${attachedFile?.file_type} file: ${attachedFile?.filename}`,
        conversation_id: conversationId,
        class_id: activeClass?.id,
        file_context: fileContext,
      });

      setConversationId(res.data.conversation_id);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: res.data.message.content,
          model_used: res.data.message.model_used || 'Groq & Gemini Copilot',
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'I encountered an issue connecting to the AI engine. Please verify backend services and try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    'Which students in my active class have attendance below 75%?',
    'What classes do I have scheduled for today?',
    'Explain the TCP/IP protocol suite vs OSI model',
    'Generate a quiz topic outline for Operating Systems',
  ];

  const getFileIcon = (type?: string) => {
    if (type === 'pdf') return <FileText className="w-4 h-4 text-red-500" />;
    if (type === 'spreadsheet') return <FileSpreadsheet className="w-4 h-4 text-emerald-500" />;
    if (type === 'presentation') return <Presentation className="w-4 h-4 text-amber-500" />;
    if (type === 'image') return <ImageIcon className="w-4 h-4 text-blue-500" />;
    return <File className="w-4 h-4 text-slate-500" />;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#005BAC] via-[#0A6FD8] to-[#8CC63F] p-5 sm:p-6 rounded-t-2xl text-white shadow-md flex items-center justify-between gap-6 relative overflow-hidden flex-shrink-0">
        <div className="space-y-1 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-extrabold text-white">
            <Bot className="w-3.5 h-3.5 text-[#8CC63F]" /> Classroom RAG Intelligence Engine
          </div>
          <h1 className="text-xl sm:text-2xl font-black">EduPilot AI Copilot Workspace</h1>
          <p className="text-xs text-slate-100 font-medium">
            Academic Operations • Multi-file Analysis (PDF, PPT, Excel, Images) • RAG Context Query
          </p>
        </div>
        <div className="w-32 h-20 flex items-center justify-center hidden sm:flex flex-shrink-0 relative z-10">
          <img src="/images/login_hero_illustration.png" alt="EduPilot AI Copilot Banner" className="w-full h-auto max-h-20 object-contain drop-shadow-[0_10px_25px_rgba(0,0,0,0.4)]" />
        </div>
      </div>



      {/* Messages Window */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-adamas-blue/10 text-adamas-blue dark:text-adamas-green flex items-center justify-center shadow-inner">
              <Sparkles className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">How can EduPilot assist your teaching today?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Ask about attendance metrics, timetable routines, student performance, or upload any PDF, PPT, Excel, or Image file for instant AI explanation!
              </p>
            </div>
            <div className="grid grid-cols-1 gap-2 w-full pt-2">
              {samplePrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(prompt)}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-adamas-blue hover:bg-adamas-blue/5 text-left transition-all duration-200"
                >
                  "{prompt}"
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-adamas-green text-slate-950 flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-sm">
                  AI
                </div>
              )}
              <div className="space-y-1 max-w-2xl">
                <div
                  className={`p-4 rounded-2xl text-xs font-medium whitespace-pre-wrap leading-relaxed shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-adamas-blue text-white rounded-tr-none'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-none border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {msg.role === 'user' ? (
                    msg.content
                  ) : (
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-2 space-y-1" {...props} />,
                        li: ({node, ...props}) => <li className="" {...props} />,
                        h1: ({node, ...props}) => <h1 className="text-lg font-extrabold mb-2 mt-4 first:mt-0" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-base font-extrabold mb-2 mt-4 first:mt-0" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-sm font-bold mb-2 mt-3 first:mt-0" {...props} />,
                        a: ({node, ...props}) => <a className="text-adamas-blue dark:text-adamas-green hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                        strong: ({node, ...props}) => <strong className="font-bold text-slate-900 dark:text-white" {...props} />,
                        table: ({node, ...props}) => <div className="overflow-x-auto mb-2"><table className="min-w-full divide-y divide-slate-300 dark:divide-slate-700" {...props} /></div>,
                        thead: ({node, ...props}) => <thead className="bg-slate-200 dark:bg-slate-800" {...props} />,
                        tbody: ({node, ...props}) => <tbody className="divide-y divide-slate-200 dark:divide-slate-800" {...props} />,
                        tr: ({node, ...props}) => <tr {...props} />,
                        th: ({node, ...props}) => <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider" {...props} />,
                        td: ({node, ...props}) => <td className="px-3 py-2 text-xs border-t border-slate-200 dark:border-slate-800" {...props} />,
                        code: ({node, inline, className, children, ...props}: any) => 
                          inline ? (
                            <code className="bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-[11px] font-mono text-slate-800 dark:text-slate-200" {...props}>{children}</code>
                          ) : (
                            <pre className="bg-slate-800 dark:bg-slate-950 text-slate-100 p-3 rounded-xl overflow-x-auto text-[11px] font-mono my-2 shadow-inner"><code {...props}>{children}</code></pre>
                          )
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  )}
                </div>
                {msg.model_used && (
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 px-1">
                    <Cpu className="w-3 h-3 text-adamas-blue" />
                    <span>Powered by {msg.model_used}</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
        {loading && (
          <div className="flex gap-3 items-center text-xs text-slate-400 font-semibold animate-pulse">
            <div className="w-8 h-8 rounded-lg bg-adamas-green/20 text-adamas-green flex items-center justify-center">
              AI
            </div>
            EduPilot AI is processing your query...
          </div>
        )}
      </div>

      {/* Attached File Preview Bar */}
      <AnimatePresence>
        {attachedFile && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-6 py-2 bg-slate-100 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between"
          >
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
              {getFileIcon(attachedFile.file_type)}
              <span>{attachedFile.filename}</span>
              <span className="text-[10px] text-slate-400 uppercase">({attachedFile.file_type})</span>
            </div>
            <button
              onClick={() => setAttachedFile(null)}
              className="text-slate-400 hover:text-red-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Form */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          {/* File Upload Input Button */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf,.pptx,.ppt,.xlsx,.xls,.csv,.png,.jpg,.jpeg,.webp"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            title="Attach file (PDF, PPT, Excel, Image)"
            className="p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin text-adamas-blue" />
            ) : (
              <Paperclip className="w-4 h-4" />
            )}
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about attendance, routine, or upload PDF/PPT/Excel/Image files for AI explanation..."
            className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-adamas-blue"
          />

          <button
            type="submit"
            disabled={(!input.trim() && !attachedFile) || loading}
            className="p-3 bg-adamas-blue hover:bg-adamas-blue-dark text-white rounded-xl shadow disabled:opacity-50 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
