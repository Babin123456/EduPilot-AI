import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot, Send, Sparkles, Paperclip, FileText, Image as ImageIcon,
  FileSpreadsheet, Presentation, File, X, Loader2,
  Copy, Check, RotateCw, PlusCircle, Trash2, MessageSquare, Download,
  BookOpen, Upload, Database
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface AttachedFile {
  filename: string;
  file_type: string;
  extracted_text: string;
  summary: string;
  image_url?: string | null;
}

interface RagDocument {
  id: string;
  filename: string;
  file_type: string;
  chunk_count: number;
  file_size_bytes: number;
  status: string;
  created_at: string;
}

export const AIPage: React.FC = () => {
  const { activeClass } = useAuth();
  const toast = useToast();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [ragUploading, setRagUploading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [attachedFile, setAttachedFile] = useState<AttachedFile | null>(null);
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  const handleCopyCode = (codeText: string, codeId: string) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCodeId(codeId);
    toast.success('Copied!', 'Code snippet copied to clipboard.');
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  // RAG Document Library state
  const [ragDocuments, setRagDocuments] = useState<RagDocument[]>([]);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const ragFileInputRef = React.useRef<HTMLInputElement>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
    fetchRagDocuments();
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

  const fetchRagDocuments = async () => {
    try {
      const res = await api.get('/ai/rag/documents');
      setRagDocuments(res.data || []);
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

  // ── RAG Document Upload (PDF/DOCX → ingestion pipeline) ──
  const handleRagUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'docx'].includes(ext || '')) {
      alert('Only PDF and DOCX files are supported for RAG indexing.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds the 10MB limit.');
      return;
    }

    setRagUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/ai/rag/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000, // 2 min timeout for large documents
      });
      if (res.data.success) {
        fetchRagDocuments();
        // Auto-send a message about the uploaded document
        const docName = res.data.document.filename;
        const chunkCount = res.data.document.chunk_count;
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `**Document Indexed Successfully**\n\n**${docName}** has been processed and indexed into **${chunkCount} searchable chunks**.\n\nYou can now ask me questions about this document. For example:\n- *"Summarize the key points of ${docName}"*\n- *"What does this document say about [topic]?"*\n- *"Explain the main concepts covered in this file"*`,
          model_used: 'RAG Engine',
          content_type: 'rag',
        }]);
      }
    } catch (err: any) {
      const detail = err?.response?.data?.detail || 'Failed to upload document for RAG indexing.';
      alert(detail);
    } finally {
      setRagUploading(false);
      if (ragFileInputRef.current) ragFileInputRef.current.value = '';
    }
  };

  const handleDeleteRagDocument = async (docId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this document and all its indexed chunks?')) return;
    try {
      await api.delete(`/ai/rag/documents/${docId}`);
      fetchRagDocuments();
    } catch (err) {
      console.error('Delete RAG document error:', err);
    }
  };

  // ── Regular file upload (PPT, Excel, Image — non-RAG) ──
  const uploadPromiseRef = React.useRef<Promise<any> | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    const promise = api.post('/ai/upload-file', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    uploadPromiseRef.current = promise;

    try {
      const res = await promise;
      const fileData = res.data;
      if (fileData && fileData.image_url && fileData.image_url.startsWith('/media')) {
        const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
        const serverOrigin = baseURL.replace(/\/api\/v1\/?$/, '');
        fileData.image_url = `${serverOrigin}${fileData.image_url}`;
      }
      setAttachedFile(fileData);
      setTimeout(fetchRagDocuments, 1000);
      return fileData;
    } catch (err) {
      console.error('File upload error:', err);
    } finally {
      setUploading(false);
      uploadPromiseRef.current = null;
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    let currentAttached = attachedFile;

    // If a file is currently uploading while user clicks Send or presses Enter, wait for it
    if (!currentAttached && uploading && uploadPromiseRef.current) {
      try {
        const res = await uploadPromiseRef.current;
        currentAttached = res.data;
      } catch (err) {
        console.error('Pending upload error:', err);
      }
    }

    if ((!query.trim() && !currentAttached) || loading) return;

    const userMsgContent = query.trim() + (currentAttached ? `\n\n📎 [Attached File: ${currentAttached.filename}]` : '');
    const userMsg = {
      role: 'user',
      content: userMsgContent,
      image_url: currentAttached?.image_url || null,
    };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    const fileContext = currentAttached ? currentAttached.extracted_text : null;
    setAttachedFile(null);

    try {
      const res = await api.post('/ai/chat', {
        message: query || `Please analyze the attached ${currentAttached?.file_type} file: ${currentAttached?.filename}`,
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
          model_used: res.data.message.model_used || 'EduPilot AI',
          content_type: res.data.message.content_type || 'text',
          sources: res.data.message.sources || [],
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
      setMessages((prev) => prev.slice(0, prev.length - 1));
      handleSend(lastUserMsg.content);
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.info('Copied', 'Message copied to clipboard.');
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
    if (type === 'docx') return <FileText className="w-4 h-4 text-blue-600" />;
    return <File className="w-4 h-4 text-slate-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="w-full">
      <div className="flex h-[calc(100vh-10rem)] min-h-[600px] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* ─── Light & Dark Compatible Sidebar ─── */}
        <div className="w-72 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-800 p-3.5 hidden md:flex flex-col justify-between flex-shrink-0">
          <div className="space-y-4 flex-1 flex flex-col min-h-0">
            
            {/* New Chat Button */}
            <button
              onClick={handleNewChat}
              className="w-full py-2.5 px-3.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold rounded-xl flex items-center justify-between border border-slate-200 dark:border-slate-800 shadow-sm transition-all group"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#005BAC] text-white flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <span>New Chat</span>
              </div>
              <PlusCircle className="w-4 h-4 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-white transition-colors" />
            </button>

            {/* Knowledge Vault / RAG Upload Section */}
            <div className="bg-slate-100/70 dark:bg-slate-900/60 rounded-xl p-3 border border-slate-200/80 dark:border-slate-800/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <Database className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> RAG Knowledge Base
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-full border border-emerald-200 dark:border-emerald-800/50">
                  {ragDocuments.length} docs
                </span>
              </div>

              {/* Upload Document Button */}
              <input
                type="file"
                ref={ragFileInputRef}
                onChange={handleRagUpload}
                accept=".pdf,.docx"
                className="hidden"
              />
              <button
                onClick={() => ragFileInputRef.current?.click()}
                disabled={ragUploading}
                className="w-full py-2 px-3 bg-emerald-50 dark:bg-emerald-600/20 hover:bg-emerald-100 dark:hover:bg-emerald-600/30 text-emerald-700 dark:text-emerald-300 hover:text-emerald-800 dark:hover:text-emerald-200 text-xs font-bold rounded-lg flex items-center justify-center gap-2 border border-emerald-200 dark:border-emerald-500/30 transition-all disabled:opacity-50"
              >
                {ragUploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Indexing File...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload PDF / DOCX</span>
                  </>
                )}
              </button>

              {/* RAG Indexed Document List */}
              <div className="space-y-1 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                {ragDocuments.length === 0 ? (
                  <p className="py-2 text-[10px] text-slate-400 dark:text-slate-500 text-center leading-relaxed">
                    Upload documents to power AI context search.
                  </p>
                ) : (
                  ragDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="group flex items-center justify-between px-2 py-1.5 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/50 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {getFileIcon(doc.file_type)}
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[130px]" title={doc.filename}>
                            {doc.filename}
                          </p>
                          <p className="text-[9px] text-slate-400">
                            {doc.chunk_count} chunks • {formatFileSize(doc.file_size_bytes)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleDeleteRagDocument(doc.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-opacity"
                        title="Delete document"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Conversations Sidebar */}
            <div className="flex-1 flex flex-col min-h-0 space-y-1.5">
              <p className="px-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Recent Chats</p>
              <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                {conversations.length === 0 ? (
                  <p className="px-2 py-4 text-[11px] text-slate-400 dark:text-slate-500 text-center">No recent chats</p>
                ) : (
                  conversations.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => handleLoadConversation(c.id)}
                      className={`group w-full text-left px-3 py-2 rounded-xl text-xs font-medium truncate flex items-center justify-between gap-2 transition-all cursor-pointer ${
                        conversationId === c.id
                          ? 'bg-[#005BAC] text-white font-bold shadow-sm'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate min-w-0">
                        <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200" />
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

          </div>

          {conversationId && (
            <button
              onClick={handleNewChat}
              className="w-full mt-2 py-2 px-3 text-[11px] text-slate-500 dark:text-slate-400 hover:text-red-500 flex items-center justify-center gap-1.5 transition-colors border-t border-slate-200 dark:border-slate-800 pt-3"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Active Chat</span>
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
              {ragDocuments.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-emerald-500/30 rounded-full text-[9px] inline-flex items-center gap-1">
                  <FileText className="w-2.5 h-2.5" /> {ragDocuments.length} doc{ragDocuments.length !== 1 ? 's' : ''} indexed
                </span>
              )}
            </div>
            <h1 className="text-base sm:text-lg font-black">EduPilot AI Copilot</h1>
          </div>


          {/* Export Controls */}
          <div className="flex items-center gap-2 relative z-10">
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
              <div className="w-14 h-14 rounded-2xl bg-brand-blue/10 text-brand-blue dark:text-brand-green flex items-center justify-center shadow-inner">
                <Sparkles className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">How can EduPilot assist your teaching today?</h3>
                <p className="text-xs text-slate-500 max-w-md">
                  Your intelligent academic copilot. Ask about your active class, student performance, syllabus topics, or upload course documents for RAG analysis.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full pt-2">
                {samplePrompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(prompt)}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-brand-blue hover:bg-brand-blue/5 text-left transition-all duration-200"
                  >
                    {prompt}
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
                  <div className={`w-8 h-8 rounded-lg ${msg.content_type === 'rag' ? 'bg-emerald-500' : 'bg-[#8CC63F]'} text-slate-950 flex items-center justify-center flex-shrink-0 shadow-sm`}>
                    {msg.content_type === 'rag' ? <BookOpen className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                )}

                <div className="space-y-1 max-w-3xl group">

                  <div
                    className={`p-3.5 rounded-2xl text-xs font-medium leading-relaxed shadow-sm relative ${
                      msg.role === 'user'
                        ? 'bg-[#005BAC] text-white rounded-tr-none whitespace-pre-wrap'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-none border border-slate-200 dark:border-slate-700'
                    }`}
                  >

                    {msg.role === 'user' ? (
                      <div className="space-y-2">
                        {msg.image_url && (
                          <div className="relative group/img cursor-pointer max-w-xs rounded-xl overflow-hidden border border-white/30 shadow-md">
                            <img
                              src={msg.image_url}
                              alt="Uploaded Chat Attachment"
                              onClick={() => setPreviewImage({ url: msg.image_url, title: 'Chat Image Attachment' })}
                              className="w-full h-auto max-h-48 object-cover group-hover/img:scale-105 transition-transform duration-200"
                            />
                            <div
                              onClick={() => setPreviewImage({ url: msg.image_url, title: 'Chat Image Attachment' })}
                              className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center text-white text-[11px] font-bold transition-opacity"
                            >
                              🔍 Click to View Fullscreen
                            </div>
                          </div>
                        )}
                        <div>{msg.content}</div>
                      </div>
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
                          a: ({ node, ...props }) => <a className="text-brand-blue dark:text-brand-green hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                          strong: ({ node, ...props }) => <strong className="font-bold text-slate-900 dark:text-white" {...props} />,
                          table: ({ node, ...props }) => <div className="overflow-x-auto mb-2"><table className="min-w-full divide-y divide-slate-300 dark:divide-slate-700" {...props} /></div>,
                          thead: ({ node, ...props }) => <thead className="bg-slate-200 dark:bg-slate-800" {...props} />,
                          tbody: ({ node, ...props }) => <tbody className="divide-y divide-slate-200 dark:divide-slate-800" {...props} />,
                          tr: ({ node, ...props }) => <tr {...props} />,
                          th: ({ node, ...props }) => <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider" {...props} />,
                          td: ({ node, ...props }) => <td className="px-3 py-2 text-xs border-t border-slate-200 dark:border-slate-800" {...props} />,
                          code: ({ node, inline, className, children, ...props }: any) => {
                            const match = /language-(\w+)/.exec(className || '');
                            const rawCode = String(children).replace(/\n$/, '');
                            const hasNewlines = rawCode.includes('\n');
                            const isBlock = !inline && (hasNewlines || !!match);

                            if (!isBlock) {
                              return (
                                <code className="bg-slate-200 dark:bg-slate-700/80 px-1.5 py-0.5 rounded-md text-[11px] font-mono text-slate-800 dark:text-slate-200 font-semibold mx-0.5" {...props}>
                                  {children}
                                </code>
                              );
                            }

                            const codeId = `${i}-${Math.random()}`;
                            const isCopied = copiedCodeId === codeId;

                            return (
                              <div className="relative my-3 rounded-xl overflow-hidden border border-slate-700/80 shadow-md bg-slate-900 dark:bg-slate-950">
                                {/* Code Header Toolbar */}
                                <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-800/90 text-slate-300 text-[10px] font-mono border-b border-slate-700/60">
                                  <span className="font-bold text-[#8CC63F] uppercase tracking-wider">
                                    {match ? match[1] : 'code'}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleCopyCode(rawCode, codeId)}
                                    className="flex items-center gap-1.5 px-2 py-0.5 rounded-md hover:bg-slate-700/70 text-slate-300 hover:text-white transition-colors font-sans font-semibold text-[10px]"
                                    title="Copy code snippet"
                                  >
                                    {isCopied ? (
                                      <>
                                        <Check className="w-3 h-3 text-emerald-400" />
                                        <span className="text-emerald-400">Copied!</span>
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="w-3 h-3 text-slate-400" />
                                        <span>Copy code</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                                {/* Code Content */}
                                <pre className="p-3.5 overflow-x-auto text-[11px] font-mono text-slate-100 leading-relaxed">
                                  <code className={className} {...props}>
                                    {children}
                                  </code>
                                </pre>
                              </div>
                            );
                          }
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    )}
                  </div>

                  {/* Message Action Bar (Copy, Regenerate, Sources) */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 px-1 pt-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-2">
                      {/* RAG Source Badges */}
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Database className="w-3 h-3 text-emerald-500" />
                          {msg.sources.map((src: string, si: number) => (
                            <span key={si} className="px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded text-[9px] font-semibold border border-emerald-200 dark:border-emerald-800 inline-flex items-center gap-1">
                              <FileText className="w-2.5 h-2.5" /> {src}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
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
              className="px-6 py-2.5 bg-blue-50/80 dark:bg-slate-800/90 border-t border-blue-200 dark:border-slate-700 flex items-center justify-between shadow-inner"
            >
              <div className="flex items-center gap-2.5 text-xs font-bold text-slate-800 dark:text-slate-100">
                <div className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-xs">
                  {getFileIcon(attachedFile.file_type)}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="truncate max-w-xs">{attachedFile.filename}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-slate-700 text-[#005BAC] dark:text-[#8CC63F] font-mono font-bold uppercase">
                    {attachedFile.file_type}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAttachedFile(null)}
                className="p-1 text-slate-400 hover:text-red-500 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all"
                title="Remove attached file"
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
              if ((input.trim() || attachedFile) && !loading) {
                handleSend();
              }
            }}
            className="flex items-center gap-2"
          >
            {/* File Upload Input Button (PDF, DOCX, PPT, Excel, Image) */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf,.docx,.pptx,.ppt,.xlsx,.xls,.csv,.png,.jpg,.jpeg,.webp"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              title="Attach file (PDF, DOCX, PPT, Excel, Image)"
              className="p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-colors disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#005BAC]" />
              ) : (
                <Paperclip className="w-4 h-4" />
              )}
            </button>

            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if ((input.trim() || attachedFile || uploading) && !loading) {
                    handleSend();
                  }
                }
              }}
              placeholder={attachedFile
                ? `Ask a question about ${attachedFile.filename} or press Send...`
                : uploading
                ? "Uploading file... Press Enter or Send to attach and message."
                : ragDocuments.length > 0
                ? "Ask about your documents or any academic topic... (Shift+Enter for new line)"
                : "Message EduPilot AI... (Shift+Enter for new line)"
              }
              className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#005BAC] resize-none min-h-[44px] max-h-36 overflow-y-auto leading-relaxed"
            />

            <button
              type="submit"
              disabled={(!input.trim() && !attachedFile && !uploading) || loading}
              className="p-3 bg-[#005BAC] hover:bg-[#0A6FD8] text-white rounded-xl shadow disabled:opacity-40 disabled:cursor-not-allowed transition-all self-end"
              title={(!input.trim() && !attachedFile && !uploading) ? 'Type a message or attach a file to send' : 'Send message'}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* ── ChatGPT-Style Fullscreen Image Lightbox Modal ── */}
      <AnimatePresence>
        {previewImage && (
          <div
            onClick={() => setPreviewImage(null)}
            className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl max-h-[90vh] bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/80">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#8CC63F]" /> {previewImage.title}
                </span>
                <div className="flex items-center gap-2">
                  <a
                    href={previewImage.url}
                    download
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 text-xs flex items-center gap-1 font-semibold"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </a>
                  <button
                    onClick={() => setPreviewImage(null)}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-4 flex items-center justify-center overflow-auto max-h-[80vh]">
                <img
                  src={previewImage.url}
                  alt="Fullscreen Preview"
                  className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-lg"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  </div>
);
};

export default AIPage;
