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
  Upload, Database, Users, Calendar, HelpCircle
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface AttachedFile {
  filename: string;
  file_type: string;
  extracted_text: string;
  text_content?: string;
  summary: string;
  image_url?: string | null;
  image_b64?: string | null;
  mime_type?: string | null;
}

interface RagDocument {
  id: string;
  filename: string;
  file_type: string;
  chunk_count: number;
  file_size_bytes: number;
  status: string;
  image_url?: string | null;
  image_b64?: string | null;
  mime_type?: string | null;
  extracted_text?: string | null;
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
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // ── Confirmation Modal State ──
  const [convoToDelete, setConvoToDelete] = useState<{ id: string; title: string } | null>(null);
  const [docToDelete, setDocToDelete] = useState<{ id: string; filename: string } | null>(null);

  const handleCopyCode = (codeText: string, codeId: string) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCodeId(codeId);
    toast.success('Copied!', 'Code snippet copied to clipboard.');
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  // RAG Document Library state & Teacher Profile Personal Vault state
  const [ragDocuments, setRagDocuments] = useState<RagDocument[]>([]);
  const [personalFiles, setPersonalFiles] = useState<any[]>([]);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const imageInputRef = React.useRef<HTMLInputElement>(null);
  const ragFileInputRef = React.useRef<HTMLInputElement>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
    fetchRagDocuments();
    fetchPersonalFiles();
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

  const fetchPersonalFiles = async () => {
    try {
      const res = await api.get('/personal-files');
      setPersonalFiles(res.data || []);
    } catch (err) {
      console.error('Failed to fetch personal files from teacher profile:', err);
    }
  };

  // ── Mobile Responsive View State ──
  const [mobileTab, setMobileTab] = useState<'chat' | 'knowledge'>('chat');
  const [imageModalUrl, setImageModalUrl] = useState<string | null>(null);

  const handleNewChat = () => {
    setConversationId(null);
    setMessages([]);
    setAttachedFile(null);
    setInput('');
    setMobileTab('chat');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const handleLoadConversation = async (id: string) => {
    try {
      const res = await api.get(`/ai/conversations/${id}`);
      setConversationId(res.data.id);
      setMessages(res.data.messages || []);
      setMobileTab('chat');
    } catch (err) {}
  };

  const promptDeleteConversation = (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConvoToDelete({ id, title });
  };

  const confirmDeleteConversation = async (id: string) => {
    try {
      await api.delete(`/ai/conversations/${id}`);
      if (conversationId === id || !conversationId) {
        handleNewChat();
      }
      fetchConversations();
      toast.success('Chat Thread Deleted', 'Conversation history removed.');
    } catch (err) {
      console.error('Delete conversation error:', err);
      toast.error('Failed to delete chat thread.');
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

  // ── Universal Knowledge Base Upload (Images, PDFs, DOCX, PPT, Excel) ──
  const handleRagUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      toast.error('File Too Large', 'File size exceeds the 15MB limit.');
      return;
    }

    setRagUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/ai/upload-file', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000,
      });

      const fileData = res.data;
      if (fileData && fileData.image_url && fileData.image_url.startsWith('/media')) {
        const baseURL = import.meta.env.VITE_API_URL || '';
        if (baseURL.startsWith('http')) {
          const serverOrigin = baseURL.replace(/\/api\/v1\/?$/, '');
          fileData.image_url = `${serverOrigin}${fileData.image_url}`;
        }
      }

      setAttachedFile(fileData);
      fetchRagDocuments();
      toast.success('Stored in Knowledge Base & Attached', `Successfully stored "${file.name}" in Knowledge Base.`);
    } catch (err: any) {
      const detail = err?.response?.data?.detail || 'Failed to upload document to Knowledge Base.';
      toast.error('Upload Failed', detail);
    } finally {
      setRagUploading(false);
      if (ragFileInputRef.current) ragFileInputRef.current.value = '';
    }
  };

  const promptDeleteRagDocument = (docId: string, filename: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDocToDelete({ id: docId, filename });
  };

  const confirmDeleteRagDocument = async (docId: string) => {
    setRagDocuments((prev) => prev.filter((d) => d.id !== docId));
    try {
      await api.delete(`/ai/rag/documents/${docId}`);
      toast.success('Document Removed', 'File removed from Knowledge Base.');
      fetchRagDocuments();
      fetchPersonalFiles();
    } catch (err) {
      toast.error('Failed to delete document from Knowledge Base');
      fetchRagDocuments();
      fetchPersonalFiles();
    }
  };

  const deletePersonalFileInChat = async (fileId: string, filename: string) => {
    try {
      await api.delete(`/personal-files/${fileId}`);
      toast.success('File Deleted', `"${filename}" removed from Vault and Chatbot Knowledge Base.`);
      fetchPersonalFiles();
      fetchRagDocuments();
      if (attachedFile?.filename === filename) {
        setAttachedFile(null);
      }
    } catch (err) {
      toast.error('Delete Failed', 'Failed to remove file from vault.');
    }
  };

  // ── Regular file upload (PPT, Excel, Image — non-RAG) ──
  const uploadPromiseRef = React.useRef<Promise<any> | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const inputTarget = e.target;
    setUploading(true);

    // Instant local image preview using FileReader before upload completes
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const localDataUrl = ev.target?.result as string;
        setAttachedFile({
          filename: file.name,
          file_type: 'image',
          extracted_text: `Image File: ${file.name}`,
          summary: `Attached image: ${file.name}`,
          image_url: localDataUrl,
          image_b64: localDataUrl.includes(',') ? localDataUrl.split(',')[1] : localDataUrl,
          mime_type: file.type,
        });
      };
      reader.readAsDataURL(file);
    }

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
        const baseURL = import.meta.env.VITE_API_URL || '';
        if (baseURL.startsWith('http')) {
          const serverOrigin = baseURL.replace(/\/api\/v1\/?$/, '');
          fileData.image_url = `${serverOrigin}${fileData.image_url}`;
        }
      }
      // Preserve local preview url if available
      setAttachedFile((prev) => ({
        ...fileData,
        image_url: fileData.image_url || prev?.image_url || null,
        image_b64: fileData.image_b64 || prev?.image_b64 || null,
      }));
      setTimeout(fetchRagDocuments, 1000);
      return fileData;
    } catch (err) {
      console.error('File upload error:', err);
    } finally {
      setUploading(false);
      uploadPromiseRef.current = null;
      if (inputTarget) inputTarget.value = '';
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (uploading) return;
    if ((!query.trim() && !attachedFile) || loading) return;

    const currentAttached = attachedFile;
    const userMsgContent = query.trim() + (currentAttached ? `\n\n[Attached File: ${currentAttached.filename}]` : '');
    const userMsg = {
      role: 'user',
      content: userMsgContent,
      image_url: currentAttached?.image_url || null,
    };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    const fileContext = currentAttached ? (currentAttached.text_content || currentAttached.extracted_text) : null;
    setAttachedFile(null);

    try {
      const res = await api.post('/ai/chat', {
        message: query || `Please analyze the attached ${currentAttached?.file_type} file: ${currentAttached?.filename}`,
        conversation_id: conversationId,
        class_id: activeClass?.id,
        file_context: fileContext,
        image_b64: currentAttached?.image_b64 || null,
        mime_type: currentAttached?.mime_type || null,
      });

      const replyContent = res.data.message?.content || res.data.response || res.data.content || 'I have processed your query.';
      const replySources = res.data.message?.sources || res.data.sources || [];
      const replyModel = res.data.message?.model_used || res.data.model_used || 'EduPilot AI';

      setConversationId(res.data.conversation_id);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: replyContent,
          sources: replySources,
          model_used: replyModel,
        },
      ]);
      fetchConversations();
    } catch (err: any) {
      toast.error('AI Processing Error', 'Failed to generate response. Please try again.');
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an issue processing your request. Please try sending your prompt again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = () => {
    if (messages.length < 2 || loading) return;
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMsg) {
      setMessages((prev) => prev.slice(0, -1));
      handleSend(lastUserMsg.content);
    }
  };

  const handleCopy = (content: string, index: number) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    toast.success('Copied!', 'Message copied to clipboard.');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'presentation':
      case 'pptx':
      case 'ppt':
        return <Presentation className="w-4 h-4 text-orange-500" />;
      case 'spreadsheet':
      case 'xlsx':
      case 'xls':
      case 'csv':
        return <FileSpreadsheet className="w-4 h-4 text-emerald-500" />;
      case 'pdf':
        return <FileText className="w-4 h-4 text-rose-500" />;
      case 'image':
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'webp':
        return <ImageIcon className="w-4 h-4 text-[#005BAC]" />;
      default:
        return <File className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="h-[calc(100vh-6.5rem)] flex flex-col space-y-4">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#005BAC] via-[#0A6FD8] to-[#8CC63F] p-4 sm:p-6 rounded-3xl text-white shadow-xl relative overflow-hidden flex-shrink-0">
        <div className="space-y-1 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-extrabold text-white">
            <Sparkles className="w-3.5 h-3.5 text-[#8CC63F]" /> Academic Copilot & Knowledge Library
          </div>
          <h1 className="text-xl sm:text-2xl font-black">EduPilot AI Assistant</h1>
          <p className="text-xs text-slate-100 font-medium">
            {activeClass ? `Active Context: ${activeClass.course_name} (${activeClass.year_label} Sec ${activeClass.section_name})` : 'General Workspace Context'}
          </p>
        </div>

        <div className="flex items-center gap-2 relative z-10">
          {messages.length > 0 && (
            <button
              onClick={handleExportChatTXT}
              className="px-3 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-extrabold backdrop-blur-md transition-all flex items-center gap-1.5 border border-white/20"
              title="Export conversation history to TXT file"
            >
              <Download className="w-3.5 h-3.5" /> Export
            </button>
          )}

          <button
            onClick={handleNewChat}
            className="px-4 py-2 bg-white text-[#005BAC] hover:bg-slate-100 rounded-xl text-xs font-black shadow-md transition-all flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" /> New Chat
          </button>
        </div>
      </div>

      {/* ── Mobile Tab Segmented Switcher (Visible on small screens < lg) ── */}
      <div className="flex lg:hidden bg-slate-100 dark:bg-slate-800/90 p-1 rounded-2xl text-xs font-extrabold flex-shrink-0 border border-slate-200 dark:border-slate-700 shadow-sm">
        <button
          type="button"
          onClick={() => setMobileTab('chat')}
          className={`flex-1 py-2 rounded-xl text-center transition-all flex items-center justify-center gap-2 ${
            mobileTab === 'chat'
              ? 'bg-white dark:bg-slate-900 text-[#005BAC] dark:text-[#8CC63F] shadow-md font-black'
              : 'text-slate-500 dark:text-slate-400 font-bold'
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          <span>Chat Workspace</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('knowledge')}
          className={`flex-1 py-2 rounded-xl text-center transition-all flex items-center justify-center gap-2 ${
            mobileTab === 'knowledge'
              ? 'bg-white dark:bg-slate-900 text-[#005BAC] dark:text-[#8CC63F] shadow-md font-black'
              : 'text-slate-500 dark:text-slate-400 font-bold'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Library & History ({ragDocuments.length + conversations.length})</span>
        </button>
      </div>

      {/* Main Grid: Sidebar + Chat Area */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">
        {/* Left Sidebar: Knowledge Base & Conversations */}
        <div className={`lg:col-span-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-4 shadow-sm overflow-hidden min-h-0 ${mobileTab === 'knowledge' ? 'flex flex-col flex-1' : 'hidden lg:flex lg:flex-col'}`}>
          {/* Knowledge Base Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-[#005BAC] dark:text-[#8CC63F]" /> Knowledge Base
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                {ragDocuments.length} files
              </span>
            </div>

            {/* Knowledge Base Upload Trigger */}
            <input
              type="file"
              ref={ragFileInputRef}
              onChange={handleRagUpload}
              accept=".pdf,.docx,.pptx,.ppt,.xlsx,.xls,.csv,image/*"
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
                  <span>Upload Document / Image</span>
                </>
              )}
            </button>

            {/* Knowledge Base Document List */}
            <div className="space-y-1 max-h-36 overflow-y-auto pr-1 custom-scrollbar">
              {ragDocuments.length === 0 ? (
                <p className="py-2 text-[10px] text-slate-400 dark:text-slate-500 text-center leading-relaxed">
                  Upload documents to power AI context search.
                </p>
              ) : (
                ragDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="group flex items-center justify-between px-2 py-1.5 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/50 hover:border-emerald-400 dark:hover:border-emerald-600 transition-all"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {getFileIcon(doc.file_type)}
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 truncate" title={doc.filename}>
                          {doc.filename}
                        </p>
                        <p className="text-[9px] text-slate-400">
                          {formatFileSize(doc.file_size_bytes)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => {
                          setAttachedFile({
                            filename: doc.filename,
                            file_type: doc.file_type,
                            image_url: doc.image_url || null,
                            image_b64: doc.image_b64 || null,
                            mime_type: doc.mime_type || null,
                            extracted_text: doc.extracted_text || `Knowledge Base Document: ${doc.filename}`,
                            summary: `Attached from Knowledge Base: ${doc.filename}`,
                          });
                          toast.success('Attached to Prompt', `Attached "${doc.filename}" from Knowledge Base for chat analysis.`);
                        }}
                        className="px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-950 hover:bg-emerald-500 text-emerald-700 dark:text-emerald-300 hover:text-white rounded text-[9px] font-bold border border-emerald-200 dark:border-emerald-800 transition-all flex items-center gap-0.5"
                        title="Attach this file/image to current chat prompt"
                      >
                        <Paperclip className="w-2.5 h-2.5" /> Attach
                      </button>

                      <button
                        onClick={(e) => promptDeleteRagDocument(doc.id, doc.filename, e)}
                        className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-md transition-colors"
                        title="Delete document from Knowledge Base"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Teacher Profile Personal Vault Section */}
          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <File className="w-3.5 h-3.5 text-[#005BAC] dark:text-[#8CC63F]" /> Teacher Profile Vault
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                {personalFiles.length} files
              </span>
            </div>

            <div className="space-y-1 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
              {personalFiles.length === 0 ? (
                <p className="py-2 text-[10px] text-slate-400 dark:text-slate-500 text-center leading-relaxed">
                  No personal files uploaded in Profile.
                </p>
              ) : (
                personalFiles.map((pfile) => {
                  const baseURL = import.meta.env.VITE_API_URL || '';
                  const serverOrigin = baseURL.startsWith('http')
                    ? baseURL.replace(/\/api\/v1\/?$/, '')
                    : window.location.origin;
                  const fileViewUrl = `${serverOrigin}/api/v1/personal-files/view/${pfile.id}`;
                  const isImg = ['png', 'jpg', 'jpeg', 'webp', 'gif'].includes((pfile.file_type || '').toLowerCase());

                  return (
                    <div
                      key={pfile.id}
                      className="group flex items-center justify-between px-2 py-1.5 rounded-lg bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-emerald-600 transition-all"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {getFileIcon(pfile.file_type)}
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 truncate" title={pfile.original_filename}>
                            {pfile.original_filename}
                          </p>
                          <p className="text-[9px] text-slate-400">
                            {formatFileSize(pfile.file_size_bytes)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => {
                            setAttachedFile({
                              filename: pfile.original_filename,
                              file_type: pfile.file_type,
                              image_url: isImg ? fileViewUrl : null,
                              image_b64: null,
                              mime_type: isImg ? `image/${pfile.file_type}` : null,
                              extracted_text: pfile.extracted_text || `Teacher Profile Personal Vault File: ${pfile.original_filename}`,
                              summary: `Attached from Teacher Profile Vault: ${pfile.original_filename}`,
                            });
                            setMobileTab('chat');
                            toast.success('Attached to Prompt', `Attached "${pfile.original_filename}" from Teacher Profile Vault.`);
                          }}
                          className="px-1.5 py-0.5 bg-blue-50 dark:bg-blue-950 hover:bg-[#005BAC] text-[#005BAC] dark:text-blue-300 hover:text-white rounded text-[9px] font-bold border border-blue-200 dark:border-blue-800 transition-all flex items-center gap-0.5"
                          title="Attach this file from Profile Vault to chat prompt"
                        >
                          <Paperclip className="w-2.5 h-2.5" /> Attach
                        </button>
                        <button
                          onClick={() => deletePersonalFileInChat(pfile.id, pfile.original_filename)}
                          className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded transition-colors"
                          title="Delete file from Vault & Chatbot"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })
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
                      onClick={(e) => promptDeleteConversation(c.id, c.title, e)}
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

        {/* Right Area: Chat Workspace */}
        <div className={`lg:col-span-9 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm min-h-0 overflow-hidden ${mobileTab === 'chat' ? 'flex flex-col flex-1' : 'hidden lg:flex lg:flex-col'}`}>
          {/* Chat Messages Log */}
          <div className="flex-1 p-4 lg:p-6 overflow-y-auto space-y-6">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6 max-w-xl mx-auto my-auto py-8">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#005BAC]/20 to-[#8CC63F]/20 text-[#005BAC] dark:text-[#8CC63F] flex items-center justify-center shadow-lg">
                  <Bot className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">EduPilot AI Assistant</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
                    Ask questions about your classes, analyze uploaded PDF/DOCX/image documents, or select a starter query below.
                  </p>
                </div>

                {/* 4 Default Starter Suggested Queries */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full pt-2">
                  {[
                    {
                      icon: <Users className="w-4 h-4 text-[#005BAC] dark:text-[#8CC63F]" />,
                      title: 'Student Risk Shortage',
                      query: 'Which students in my active class have attendance below 75%?',
                    },
                    {
                      icon: <Calendar className="w-4 h-4 text-[#005BAC] dark:text-[#8CC63F]" />,
                      title: "Today's Schedule",
                      query: 'What is my teaching schedule and upcoming classes for today?',
                    },
                    {
                      icon: <HelpCircle className="w-4 h-4 text-[#005BAC] dark:text-[#8CC63F]" />,
                      title: 'Quiz Generation',
                      query: 'Generate a 5-question multiple choice quiz on Blockchain Technology with answers.',
                    },
                    {
                      icon: <FileText className="w-4 h-4 text-[#005BAC] dark:text-[#8CC63F]" />,
                      title: 'Document Analysis',
                      query: 'Analyze my uploaded course documents and summarize key teaching topics.',
                    },
                  ].map((q, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSend(q.query)}
                      className="p-3.5 bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 hover:border-[#005BAC] dark:hover:border-[#8CC63F] rounded-2xl text-left transition-all duration-200 shadow-xs hover:shadow-md group flex flex-col justify-between space-y-1.5"
                    >
                      <div className="flex items-center gap-2">
                        {q.icon}
                        <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#005BAC] dark:group-hover:text-[#8CC63F]">
                          {q.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-snug">
                        "{q.query}"
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-xl bg-[#005BAC] text-white flex items-center justify-center flex-shrink-0 shadow-md">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-4 space-y-2 text-xs leading-relaxed shadow-sm ${
                      msg.role === 'user'
                        ? 'bg-[#005BAC] text-white font-medium rounded-tr-none'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-none border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {msg.role === 'user' ? (
                      <div className="space-y-2">
                        {msg.image_url && (
                          <div
                            onClick={() => setImageModalUrl(msg.image_url)}
                            className="relative group/img cursor-pointer overflow-hidden rounded-xl border border-white/30 shadow-md max-w-xs"
                            title="Click to view image"
                          >
                            <img
                              src={msg.image_url}
                              alt="Uploaded attachment"
                              className="w-full max-h-48 object-cover group-hover/img:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover/img:opacity-100 flex items-center justify-center text-white text-[11px] font-extrabold backdrop-blur-[2px] transition-opacity">
                              <span>Click to view image ↗</span>
                            </div>
                          </div>
                        )}
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                      </div>
                    ) : (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
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

                    <div className="flex items-center justify-between text-[10px] text-slate-400 px-1 pt-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <div className="flex items-center gap-2">
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

          {/* Attached File & Image Preview Bar */}
          <AnimatePresence>
            {attachedFile && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="px-6 py-2.5 bg-blue-50/90 dark:bg-slate-800/90 border-t border-blue-200 dark:border-slate-700 flex items-center justify-between shadow-inner"
              >
                <div className="flex items-center gap-3 text-xs font-bold text-slate-800 dark:text-slate-100">
                  {(attachedFile.file_type === 'image' || attachedFile.image_url || attachedFile.image_b64) ? (
                    <div
                      onClick={() => {
                        const src = attachedFile.image_url || (attachedFile.image_b64 ? (attachedFile.image_b64.startsWith('data:') ? attachedFile.image_b64 : `data:${attachedFile.mime_type || 'image/png'};base64,${attachedFile.image_b64}`) : null);
                        if (src) setImageModalUrl(src);
                      }}
                      className="relative group/thumb cursor-pointer overflow-hidden rounded-xl border border-slate-300 dark:border-slate-600 shadow-md"
                      title="Click to view image"
                    >
                      <img
                        src={
                          attachedFile.image_url ||
                          (attachedFile.image_b64
                            ? (attachedFile.image_b64.startsWith('data:')
                                ? attachedFile.image_b64
                                : `data:${attachedFile.mime_type || 'image/png'};base64,${attachedFile.image_b64}`)
                            : '/images/hero_illustration.webp')
                        }
                        alt={attachedFile.filename}
                        className="w-12 h-12 object-cover group-hover/thumb:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center text-white text-[9px] font-extrabold text-center leading-tight p-0.5 transition-opacity">
                        <span>Click to view image</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-xs">
                      {getFileIcon(attachedFile.file_type)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate max-w-xs font-extrabold">{attachedFile.filename}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-slate-700 text-[#005BAC] dark:text-[#8CC63F] font-mono font-bold uppercase">
                        {attachedFile.file_type}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                      {(attachedFile.file_type === 'image' || attachedFile.image_url || attachedFile.image_b64)
                        ? 'Image Attached — Gemini 2.5 Flash Vision Ready'
                        : 'File Attached — Stored in Knowledge Base for AI Context'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAttachedFile(null)}
                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all"
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
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*,.png,.jpg,.jpeg,.webp,.gif,.pdf,.docx,.pptx,.ppt,.xlsx,.xls,.csv"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                title="Attach File or Image (PNG, JPG, PDF, DOCX, PPT, Excel)"
                className="p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center"
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
                    if (!uploading && (input.trim() || attachedFile) && !loading) {
                      handleSend();
                    }
                  }
                }}
                placeholder={attachedFile
                  ? `Ask a question about ${attachedFile.filename} or press Send...`
                  : uploading
                  ? "Uploading file, please wait..."
                  : ragDocuments.length > 0
                  ? "Ask about your documents or any academic topic... (Shift+Enter for new line)"
                  : "Message EduPilot AI... (Shift+Enter for new line)"
                }
                className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#005BAC] resize-none min-h-[44px] max-h-36 overflow-y-auto leading-relaxed"
              />

              <button
                type="submit"
                disabled={uploading || (!input.trim() && !attachedFile) || loading}
                className="p-3 bg-[#005BAC] hover:bg-[#0A6FD8] text-white rounded-xl shadow disabled:opacity-40 disabled:cursor-not-allowed transition-all self-end"
                title={uploading ? 'File uploading, please wait...' : (!input.trim() && !attachedFile) ? 'Type a message or attach a file to send' : 'Send message'}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* ── ⚠️ Delete Chat Thread Confirmation Modal ── */}
        <AnimatePresence>
          {convoToDelete && (
            <div
              onClick={() => setConvoToDelete(null)}
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
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Delete Chat Thread?</h3>
                    <p className="text-xs text-slate-500 font-medium truncate max-w-xs">{convoToDelete.title}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Are you sure you want to permanently delete this chat thread? All saved conversation messages and context history will be removed. This action cannot be undone.
                </p>
                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setConvoToDelete(null)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const targetId = convoToDelete.id;
                      setConvoToDelete(null);
                      confirmDeleteConversation(targetId);
                    }}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold rounded-xl shadow-md transition-all active:scale-95"
                  >
                    Yes, Delete Thread
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ── ⚠️ Delete Knowledge Base File Confirmation Modal ── */}
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
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Delete Document from Knowledge Base?</h3>
                    <p className="text-xs text-slate-500 font-medium truncate max-w-xs">{docToDelete.filename}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Are you sure you want to remove <strong>"{docToDelete.filename}"</strong> from your AI Knowledge Library? Vector embeddings for this document will be erased.
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
                      confirmDeleteRagDocument(targetId);
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

        {/* ── 🖼️ FULL SCREEN IMAGE PREVIEW MODAL WINDOW ── */}
        <AnimatePresence>
          {imageModalUrl && (
            <div
              onClick={() => setImageModalUrl(null)}
              className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="relative max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col cursor-default"
              >
                <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-slate-900 dark:text-white">
                    <ImageIcon className="w-4 h-4 text-[#005BAC] dark:text-[#8CC63F]" />
                    <span>Image Inspection View</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setImageModalUrl(null)}
                    className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-4 flex items-center justify-center overflow-auto max-h-[75vh]">
                  <img
                    src={imageModalUrl}
                    alt="Full preview"
                    className="max-w-full max-h-[70vh] object-contain rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg"
                  />
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-500">EduPilot AI Visual Inspection</span>
                  <button
                    type="button"
                    onClick={() => {
                      const a = document.createElement('a');
                      a.href = imageModalUrl;
                      a.download = `edupilot_image_${Date.now()}.png`;
                      a.click();
                    }}
                    className="px-4 py-1.5 bg-[#005BAC] text-white rounded-xl text-xs font-extrabold shadow-sm hover:bg-[#0A6FD8] transition-colors flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5 text-[#8CC63F]" />
                    <span>Download Image</span>
                  </button>
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
