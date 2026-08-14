import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  BookOpen,
  Award,
  Sparkles,
  Mail,
  Building,
  CheckCircle2,
  Save,
  Upload,
  FileText,
  FileSpreadsheet,
  File,
  Download,
  Trash2,
  FolderOpen,
  Clock,
  HardDrive,
  LogOut,
  Eye,
  X
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface PersonalFile {
  id: string;
  original_filename: string;
  file_type: string;
  file_size_bytes: number;
  download_url: string;
  created_at: string;
}

const FILE_ICON_MAP: Record<string, { icon: typeof FileText; color: string }> = {
  pdf: { icon: FileText, color: 'text-red-500 bg-red-500/10 border-red-500/20' },
  docx: { icon: File, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
  csv: { icon: FileSpreadsheet, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(iso: string | null): string {
  if (!iso) return 'N/A';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) +
      ' • ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  } catch { return iso; }
}

export const ProfilePage: React.FC = () => {
  const { user, updateUser, performLogout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    performLogout(navigate);
  };
  
  const [selectedAvatar, setSelectedAvatar] = useState<string>(user?.avatar_url || '/images/hero_illustration.webp');
  const [phone, setPhone] = useState(user?.phone || '+91 98301 23456');
  const [specialization, setSpecialization] = useState(user?.specialization || 'Distributed Systems & Cybersecurity');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // ── Personal Files State ──
  const [personalFiles, setPersonalFiles] = useState<PersonalFile[]>([]);
  const [filesLoading, setFilesLoading] = useState(true);
  const [fileUploading, setFileUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.avatar_url) setSelectedAvatar(user.avatar_url);
  }, [user?.avatar_url]);

  // Fetch personal files on mount
  const fetchFiles = useCallback(() => {
    setFilesLoading(true);
    api.get('/personal-files/')
      .then(res => setPersonalFiles(res.data || []))
      .catch(() => {})
      .finally(() => setFilesLoading(false));
  }, []);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const response = await api.patch('/auth/me', {
        avatar_url: selectedAvatar,
        phone,
        specialization,
      });
      updateUser(response.data);
      toast.success('Teacher Profile Saved Successfully!', 'Selected Avatar & Profile options updated across EduPilot OS.');
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const compressImageFile = (file: File, maxDim = 400, quality = 0.85): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob(
              (blob) => {
                if (blob) resolve(blob);
                else reject(new Error('Canvas to Blob failed'));
              },
              'image/jpeg',
              quality
            );
          } else {
            reject(new Error('Canvas context failed'));
          }
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      let uploadPayload: Blob = file;
      try {
        uploadPayload = await compressImageFile(file, 400, 0.85);
      } catch (cErr) {
        console.warn('Client compression fallback to raw file:', cErr);
      }

      const formData = new FormData();
      formData.append('image', uploadPayload, 'avatar.jpg');
      const response = await api.post('/auth/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const newAvatar = response.data.avatar_url;
      setSelectedAvatar(newAvatar);
      updateUser({ avatar_url: newAvatar });
      toast.success('Profile photo uploaded', 'Your new photo is now active across EduPilot AI.');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to upload profile photo');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  // ── Personal File Handlers ──
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    const allowed = ['pdf', 'docx', 'doc', 'csv', 'xlsx', 'xls', 'ppt', 'pptx', 'txt', 'png', 'jpg', 'jpeg', 'webp', 'gif'];
    if (!ext || !allowed.includes(ext)) {
      toast.error('Unsupported file type. Please upload a PDF, DOCX, Excel, PPT, TXT, or Image file.');
      event.target.value = '';
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      toast.error('File is too large. Maximum allowed size is 15 MB.');
      event.target.value = '';
      return;
    }

    setFileUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      await api.post('/personal-files/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('File uploaded successfully!', `"${file.name}" has been saved to your personal vault.`);
      fetchFiles();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to upload file');
    } finally {
      setFileUploading(false);
      event.target.value = '';
    }
  };

  const handlePreviewFile = (file: PersonalFile) => {
    const baseURL = import.meta.env.VITE_API_URL || '';
    const serverOrigin = baseURL.startsWith('http')
      ? baseURL.replace(/\/api\/v1\/?$/, '')
      : window.location.origin;
    const viewUrl = `${serverOrigin}/api/v1/personal-files/view/${file.id}`;
    window.open(viewUrl, '_blank');
  };

  const handleDownload = async (file: PersonalFile) => {
    try {
      const response = await api.get(`/personal-files/download/${file.id}`, { responseType: 'blob' });
      const blob = response.data instanceof Blob ? response.data : new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.original_filename || 'downloaded_file';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        a.remove();
      }, 100);
      toast.success('Download Started', `Downloading "${file.original_filename}"...`);
    } catch (err: any) {
      console.error('Download error:', err);
      toast.error('Download Failed', 'Failed to download file from vault.');
    }
  };

  const [fileToDelete, setFileToDelete] = useState<PersonalFile | null>(null);

  const confirmDeleteFile = async (fileId: string) => {
    setDeletingId(fileId);
    try {
      await api.delete(`/personal-files/${fileId}`);
      setPersonalFiles(prev => prev.filter(f => f.id !== fileId));
      toast.success('File Deleted', 'Personal document removed from vault.');
    } catch {
      toast.error('Failed to delete file');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-6xl mx-auto">
      
      {/* ─── Header Banner ─── */}
      <div className="bg-gradient-to-r from-[#005BAC] via-[#0A6FD8] to-[#8CC63F] p-6 sm:p-8 rounded-3xl text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-extrabold text-white">
            <ShieldCheck className="w-3.5 h-3.5 text-[#8CC63F]" /> Faculty Identity Command
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Personalized Teacher Profile</h1>
          <p className="text-xs text-slate-100 font-medium">Upload your profile photo, manage official contact info, and review teaching context portfolio.</p>
        </div>
        
        <div className="flex items-center gap-4 relative z-10 flex-shrink-0 self-end sm:self-center">
          <div className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center flex-shrink-0">
            <img src={user?.avatar_url || '/images/hero_illustration.webp'} alt="Teacher profile avatar" className="w-full h-full object-contain" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* ─── Left Column: Active Avatar & Bio Badge ─── */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 text-center space-y-4 shadow-sm">
             <div className="relative w-28 h-28 mx-auto">
              <img
                src={selectedAvatar}
                alt="Selected Teacher Avatar"
                className="w-full h-full rounded-3xl object-contain"
              />
              <span className="absolute -bottom-2 -right-2 p-1.5 bg-[#8CC63F] text-slate-950 rounded-full shadow-md">
                <Sparkles className="w-4 h-4" />
              </span>
            </div>
            <label className="mx-auto inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:border-[#005BAC] hover:text-[#005BAC]">
              <Upload className="w-3.5 h-3.5" />
              {uploading ? 'Uploading...' : 'Upload your photo'}
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleAvatarUpload} disabled={uploading} className="sr-only" />
            </label>

            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">{user?.full_name}</h2>
              <p className="text-xs font-bold text-[#005BAC] dark:text-[#8CC63F] mt-0.5">{user?.designation}</p>
              <p className="text-[11px] text-slate-500 font-mono mt-1">{user?.faculty_id} • {user?.department || 'Computer Science & Engineering'}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-around text-center text-xs">
              <div>
                <p className="text-base font-black text-slate-900 dark:text-white">{user?.classes?.length || 4}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Active Classes</p>
              </div>
              <div>
                <p className="text-base font-black text-slate-900 dark:text-white">180+</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Students</p>
              </div>
              <div>
                <p className="text-base font-black text-emerald-600 dark:text-emerald-400">94%</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Avg Attendance</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={handleLogout}
                className="w-full py-2.5 rounded-xl border border-red-200 dark:border-red-800/60 bg-red-50 dark:bg-red-950/40 hover:bg-red-600 dark:hover:bg-red-600 hover:text-white dark:hover:text-white text-red-600 dark:text-red-400 text-xs font-bold flex items-center justify-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md hover:border-red-600 dark:hover:border-red-600"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out of Session</span>
              </button>
            </div>
          </div>

          {/* Assigned Classes List */}
           <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#005BAC]" />
              <span>Assigned Teaching Portfolio</span>
            </h3>
            <div className="space-y-2.5">
              {(user?.classes || []).map((cls) => (
                <div key={cls.id} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{cls.course_name}</p>
                    <p className="text-[10px] text-slate-400">{cls.course_code} • {cls.year_label} Sec {cls.section_name}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-[#005BAC] dark:text-[#8CC63F] text-[10px] font-bold">
                    Room {cls.room}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Right Column: Contact Form + Personal Files Vault ─── */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Faculty Identity Status Card */}
          <div className="rounded-3xl border border-[#005BAC]/20 bg-gradient-to-br from-[#005BAC]/5 via-white to-[#8CC63F]/10 dark:from-[#005BAC]/20 dark:via-slate-900 dark:to-[#8CC63F]/10 p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-[#005BAC] dark:text-[#8CC63F]">Faculty Identity</p>
                <h3 className="mt-1 text-base font-black text-slate-900 dark:text-white leading-snug">Your profile is ready to represent you</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">Keep your contact details and profile photo current so students and dashboard tools always see the right faculty information.</p>
              </div>
              <CheckCircle2 className="w-6 h-6 flex-shrink-0 text-emerald-500" />
            </div>
            <div className="mt-5 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-2xl bg-white/70 dark:bg-slate-800/70 p-2.5">
                <p className="text-base font-black text-slate-900 dark:text-white">{user?.classes?.length || 0}</p>
                <p className="text-[9px] font-bold uppercase text-slate-400">Classes</p>
              </div>
              <div className="rounded-2xl bg-white/70 dark:bg-slate-800/70 p-2.5">
                <p className="text-base font-black text-slate-900 dark:text-white truncate">CSE</p>
                <p className="text-[9px] font-bold uppercase text-slate-400">Dept</p>
              </div>
              <div className="rounded-2xl bg-white/70 dark:bg-slate-800/70 p-2.5">
                <p className="text-base font-black text-emerald-600 dark:text-emerald-400">Active</p>
                <p className="text-[9px] font-bold uppercase text-slate-400">Status</p>
              </div>
            </div>
          </div>
          
          {/* Contact Details & Specialization Form */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-[#005BAC]" />
              <span>Faculty Information & Preferences</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Official Email</label>
                <div className="px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{user?.email || 'faculty@university.edu'}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Department</label>
                <div className="px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-2">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  <span>{user?.department || 'Computer Science & Engineering'}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Phone Number *</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Academic Specialization *</label>
                <input
                  type="text"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="px-6 py-2.5 bg-[#005BAC] hover:bg-[#0A6FD8] text-white text-xs font-black rounded-xl shadow-lg flex items-center gap-2 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
            </div>
           </div>

           {/* ═══════════════════════════════════════════════
               ─── PERSONAL FILES VAULT (NEW SECTION) ───
               ═══════════════════════════════════════════════ */}
           <motion.div
             initial={{ opacity: 0, y: 16 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.15, duration: 0.35 }}
             className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 shadow-sm"
           >
             {/* Header Row */}
             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#005BAC] to-[#8CC63F] text-white flex items-center justify-center font-black shadow-md">
                   <FolderOpen className="w-5 h-5" />
                 </div>
                 <div>
                   <h3 className="text-sm font-black text-slate-900 dark:text-white">My Files Vault</h3>
                   <p className="text-[11px] text-slate-500 font-medium">Private document storage — upload timetables, notes, spreadsheets & more.</p>
                 </div>
               </div>

               {/* Upload Button */}
               <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 bg-[#005BAC] hover:bg-[#0A6FD8] text-white text-xs font-black rounded-xl shadow-lg transition-all flex-shrink-0">
                 <Upload className="w-4 h-4" />
                 <span>{fileUploading ? 'Uploading...' : 'Upload File'}</span>
                 <input
                   type="file"
                   accept=".pdf,.docx,.doc,.csv,.xlsx,.xls,.ppt,.pptx,.txt,.png,.jpg,.jpeg,.webp,.gif"
                   onChange={handleFileUpload}
                   disabled={fileUploading}
                   className="sr-only"
                 />
               </label>
             </div>

             {/* Upload hint */}
             <div className="flex items-center gap-2 px-3 py-2 bg-[#005BAC]/5 dark:bg-[#005BAC]/15 rounded-xl border border-[#005BAC]/15 text-[11px] font-medium text-slate-600 dark:text-slate-300">
               <HardDrive className="w-3.5 h-3.5 text-[#005BAC] dark:text-[#8CC63F] flex-shrink-0" />
               <span>Supported: <strong>PDF</strong>, <strong>DOCX</strong>, <strong>Excel</strong>, <strong>PPT</strong>, <strong>TXT</strong>, <strong>Images</strong> — Max 15 MB per file. Files are stored securely in your private vault.</span>
             </div>

             {/* File List */}
             {filesLoading ? (
               <div className="space-y-3">
                 {[1, 2, 3].map(i => (
                   <div key={i} className="animate-pulse flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                     <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-xl" />
                     <div className="flex-1 space-y-2">
                       <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-48" />
                       <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-28" />
                     </div>
                   </div>
                 ))}
               </div>
             ) : personalFiles.length === 0 ? (
               <div className="py-10 text-center text-slate-400 text-xs bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                 <FolderOpen className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                 <p className="font-bold">No files uploaded yet</p>
                 <p className="mt-1">Upload your first document using the button above.</p>
               </div>
             ) : (
               <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
                 <AnimatePresence>
                   {personalFiles.map((file, i) => {
                     const ft = FILE_ICON_MAP[file.file_type] || FILE_ICON_MAP['pdf'];
                     const Icon = ft.icon;
                     return (
                       <motion.div
                         key={file.id}
                         initial={{ opacity: 0, x: -10 }}
                         animate={{ opacity: 1, x: 0 }}
                         exit={{ opacity: 0, x: 10, height: 0 }}
                         transition={{ delay: i * 0.04, duration: 0.25 }}
                         className="group p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 flex items-center gap-4 hover:border-[#005BAC]/50 dark:hover:border-[#8CC63F]/40 transition-all"
                       >
                         {/* File Icon */}
                         <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${ft.color} flex-shrink-0`}>
                           <Icon className="w-5 h-5" />
                         </div>

                         {/* File Info */}
                         <div className="flex-1 min-w-0">
                           <p className="text-xs font-bold text-slate-900 dark:text-white truncate" title={file.original_filename}>
                             {file.original_filename}
                           </p>
                           <div className="flex items-center gap-3 mt-0.5 text-[10px] text-slate-400 font-medium">
                             <span className="uppercase font-bold">{file.file_type}</span>
                             <span>{formatFileSize(file.file_size_bytes)}</span>
                             <span className="flex items-center gap-0.5">
                               <Clock className="w-3 h-3" />
                               {formatDate(file.created_at)}
                             </span>
                           </div>
                         </div>

                         {/* Action Buttons */}
                         <div className="flex items-center gap-1.5 flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button
                               onClick={() => handlePreviewFile(file)}
                               className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                               title="Preview file in new window / document viewer"
                             >
                              <Eye className="w-4 h-4 text-[#005BAC] dark:text-[#8CC63F]" />
                            </button>
                           <button
                             onClick={() => handleDownload(file)}
                             className="p-2 rounded-xl bg-[#005BAC]/10 hover:bg-[#005BAC]/20 text-[#005BAC] dark:bg-[#8CC63F]/10 dark:hover:bg-[#8CC63F]/20 dark:text-[#8CC63F] transition-colors"
                             title="Download file"
                           >
                             <Download className="w-4 h-4" />
                           </button>
                           <button
                             onClick={() => setFileToDelete(file)}
                             disabled={deletingId === file.id}
                             className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors disabled:opacity-40"
                             title="Delete file"
                           >
                             <Trash2 className="w-4 h-4" />
                           </button>
                         </div>
                       </motion.div>
                     );
                   })}
                 </AnimatePresence>
               </div>
             )}

             {/* File count footer */}
             {personalFiles.length > 0 && (
               <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                 <span>{personalFiles.length} file{personalFiles.length !== 1 ? 's' : ''} stored</span>
                 <span>{formatFileSize(personalFiles.reduce((sum, f) => sum + f.file_size_bytes, 0))} total</span>
               </div>
             )}
          </motion.div>

          {/* ── ⚠️ Delete File Confirmation Modal ── */}
          <AnimatePresence>
            {fileToDelete && (
              <div
                onClick={() => setFileToDelete(null)}
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
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Delete Personal File?</h3>
                      <p className="text-xs text-slate-500 font-medium truncate max-w-xs">{fileToDelete.original_filename}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Are you sure you want to permanently delete <strong>"{fileToDelete.original_filename}"</strong> from your personal vault? This action cannot be undone.
                  </p>
                  <div className="flex items-center justify-end gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setFileToDelete(null)}
                      className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const targetId = fileToDelete.id;
                        setFileToDelete(null);
                        confirmDeleteFile(targetId);
                      }}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold rounded-xl shadow-md transition-all active:scale-95"
                    >
                      Yes, Delete File
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
};
