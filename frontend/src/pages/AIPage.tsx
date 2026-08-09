import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot, Send, Sparkles, Paperclip, FileText, Image as ImageIcon,
  FileSpreadsheet, Presentation, File, X, Loader2, CheckCircle2, Cpu,
  Copy, Check, RotateCw, PlusCircle, Trash2, MessageSquare, ChevronDown, Download
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
  const [conversations, setConversations] = useState<any[]>([]);
  const [attachedFile, setAttachedFile] = useState<AttachedFile | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>('Groq Llama-3.3-70B');

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const fetchConversations = async () => {
    try {
      const res = await api.get('/ai/conversations');
      setConversations(res.data || []);
    } catch (err) {}
  };

  const handleNewChat = () => {
    setConversationId(null);
    setMessages([]);
    setAttachedFile(null);
    setInput('');
  };

  const handleLoadConversation = async (id: string) => {
    try {
      const res = await api.get(`/ai/conversations/${id}`);
      setConversationId(res.data.id);
      setMessages(res.data.messages || []);
    } catch (err) {}
  };

  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.delete(`/ai/conversations/${id}`);
      if (conversationId === id) {
        handleNewChat();
      }
      fetchConversations();
    } catch (err) {
      console.error('Delete conversation error:', err);
    }
  };

  const handleExportChatTXT = () => {
    if (messages.length === 0) return;
    const lines = messages.map((m) => {
      const roleStr = m.role === 'user' ? 'USER' : 'EDUPILOT AI';
      return `[${roleStr}]\n${m.content}\n----------------------------------------\n`;
    });
    const content = `EDUPILOT AI CHAT EXPORT\nDate: ${new Date().toLocaleString()}\nThread ID: ${conversationId || 'unsaved'}\n========================================\n\n${lines.join('\n')}`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `edupilot_chat_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };


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
          model_used: res.data.message.model_used || selectedModel,
        },
      ]);
      fetchConversations();
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

  const handleRegenerate = async () => {
    if (messages.length < 2 || loading) return;
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMsg) {
      // Remove last assistant message
      setMessages((prev) => prev.slice(0, prev.length - 1));
      handleSend(lastUserMsg.content);
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
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
    <div className="max-w-7xl mx-auto w-full">
      <div className="flex h-[calc(100vh-6.5rem)] bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden -my-3">
        {/* ─── Left Sidebar: Conversation History ─── */}
        <div className="w-64 bg-slate-50 dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 p-3 hidden md:flex flex-col justify-between flex-shrink-0">




        <div className="space-y-3 overflow-y-auto">
          <button
            onClick={handleNewChat}
            className="w-full py-2.5 px-3 bg-[#005BAC] hover:bg-[#0A6FD8] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Chat Thread</span>
          </button>

          <div className="space-y-1 pt-2">
            <p className="px-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Recent Threads</p>
            {conversations.length === 0 ? (
              <p className="px-2 py-4 text-[11px] text-slate-400 text-center">No previous threads</p>
            ) : (
              conversations.map((c) => (
                <div
                  key={c.id}
                  onClick={() => handleLoadConversation(c.id)}
                  className={`group w-full text-left px-2.5 py-2 rounded-lg text-xs font-medium truncate flex items-center justify-between gap-2 transition-all cursor-pointer ${
                    conversationId === c.id
                      ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate min-w-0">
                    <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
                    <span className="truncate">{c.title}</span>
                  </div>
                  <button
                    onClick={(e) => handleDeleteConversation(c.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-opacity"
                    title="Delete thread"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {conversationId && (
          <button
            onClick={handleNewChat}
            className="w-full py-2 px-3 text-[11px] text-slate-500 hover:text-red-500 flex items-center justify-center gap-1.5 transition-colors border-t border-slate-200 dark:border-slate-800 pt-3"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Active View</span>
          </button>
        )}
      </div>

      {/* ─── Main Chat Window ─── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#005BAC] via-[#0A6FD8] to-[#8CC63F] p-3.5 sm:p-4 text-white shadow-md flex items-center justify-between gap-4 relative overflow-hidden flex-shrink-0">
          <div className="space-y-0.5 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-extrabold text-white">
              <Bot className="w-3 h-3 text-[#8CC63F]" /> EduPilot AI Intelligence Engine
            </div>
            <h1 className="text-base sm:text-lg font-black">EduPilot AI Copilot</h1>
          </div>


          {/* Model Switcher & Export Controls */}
          <div className="flex items-center gap-2 relative z-10">
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-slate-950/80 text-white text-xs font-extrabold px-3 py-1.5 rounded-xl border border-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="Groq Llama-3.3-70B">Groq Llama-3.3 70B (Fast)</option>
              <option value="Gemini 1.5 Flash">Gemini 1.5 Flash (Deep RAG)</option>
            </select>

            {messages.length > 0 && (
              <button
                onClick={handleExportChatTXT}
                className="px-3 py-1.5 bg-slate-950 hover:bg-slate-900 text-white text-xs font-black rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all shadow active:scale-95"
                title="Export conversation to TXT file"
              >
                <Download className="w-3.5 h-3.5 text-[#8CC63F]" />
                <span className="hidden sm:inline">Export TXT</span>
              </button>
            )}
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
                  <div className="w-8 h-8 rounded-lg bg-[#8CC63F] text-slate-950 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className="space-y-1 max-w-3xl group">

                  <div
                    className={`p-3.5 rounded-2xl text-xs font-medium whitespace-pre-wrap leading-relaxed shadow-sm relative ${
                      msg.role === 'user'
                        ? 'bg-[#005BAC] text-white rounded-tr-none'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-none border border-slate-200 dark:border-slate-700'
                    }`}
                  >

                    {msg.role === 'user' ? (
                      msg.content
                    ) : (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                          ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
                          ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mb-2 space-y-1" {...props} />,
                          li: ({ node, ...props }) => <li className="" {...props} />,
                          h1: ({ node, ...props }) => <h1 className="text-lg font-extrabold mb-2 mt-4 first:mt-0" {...props} />,
                          h2: ({ node, ...props }) => <h2 className="text-base font-extrabold mb-2 mt-4 first:mt-0" {...props} />,
                          h3: ({ node, ...props }) => <h3 className="text-sm font-bold mb-2 mt-3 first:mt-0" {...props} />,
                          a: ({ node, ...props }) => <a className="text-adamas-blue dark:text-adamas-green hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                          strong: ({ node, ...props }) => <strong className="font-bold text-slate-900 dark:text-white" {...props} />,
                          table: ({ node, ...props }) => <div className="overflow-x-auto mb-2"><table className="min-w-full divide-y divide-slate-300 dark:divide-slate-700" {...props} /></div>,
                          thead: ({ node, ...props }) => <thead className="bg-slate-200 dark:bg-slate-800" {...props} />,
                          tbody: ({ node, ...props }) => <tbody className="divide-y divide-slate-200 dark:divide-slate-800" {...props} />,
                          tr: ({ node, ...props }) => <tr {...props} />,
                          th: ({ node, ...props }) => <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider" {...props} />,
                          td: ({ node, ...props }) => <td className="px-3 py-2 text-xs border-t border-slate-200 dark:border-slate-800" {...props} />,
                          code: ({ node, inline, className, children, ...props }: any) =>
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

                  {/* Message Action Bar (Copy & Regenerate) */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 px-1 pt-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    {msg.model_used && (
                      <div className="flex items-center gap-1">
                        <Cpu className="w-3 h-3 text-[#005BAC] dark:text-[#8CC63F]" />
                        <span>Powered by {msg.model_used}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 ml-auto">
                      <button
                        onClick={() => handleCopy(msg.content, i)}
                        className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                        title="Copy message"
                      >
                        {copiedIndex === i ? (
                          <><Check className="w-3 h-3 text-emerald-500" /> Copied!</>
                        ) : (
                          <><Copy className="w-3 h-3" /> Copy</>
                        )}
                      </button>

                      {msg.role === 'assistant' && i === messages.length - 1 && (
                        <button
                          onClick={handleRegenerate}
                          className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                          title="Regenerate response"
                        >
                          <RotateCw className="w-3 h-3" /> Regenerate
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
          {loading && (
            <div className="flex gap-3 items-center text-xs text-slate-400 font-semibold animate-pulse">
              <div className="w-8 h-8 rounded-lg bg-[#8CC63F]/20 text-[#8CC63F] flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              EduPilot AI is processing your query...
            </div>
          )}
          <div ref={messagesEndRef} />
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
                <Loader2 className="w-4 h-4 animate-spin text-[#005BAC]" />
              ) : (
                <Paperclip className="w-4 h-4" />
              )}
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message EduPilot AI (Groq Llama-3.3 & Gemini 1.5 Flash)..."
              className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#005BAC]"
            />

            <button
              type="submit"
              disabled={(!input.trim() && !attachedFile) || loading}
              className="p-3 bg-[#005BAC] hover:bg-[#0A6FD8] text-white rounded-xl shadow disabled:opacity-50 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
);
};







