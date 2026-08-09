import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  BookOpen,
  Award,
  Sparkles,
  Phone,
  Mail,
  Building,
  CheckCircle2,
  Save,
  Check,
  Upload
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

// 10 Curated Cartoon 3D Avatars for Teachers
const AVATARS = [
  { id: 'avatar-1', name: 'Prof. Alpha', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=ProfAlpha&backgroundColor=transparent' },
  { id: 'avatar-2', name: 'Dr. Cyber', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DrCyber&backgroundColor=transparent' },
  { id: 'avatar-3', name: 'Tech Mentor', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TechMentor&backgroundColor=transparent' },
  { id: 'avatar-4', name: 'Data Scientist', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DataScientist&backgroundColor=transparent' },
  { id: 'avatar-5', name: 'Code Architect', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=CodeArchitect&backgroundColor=transparent' },
  { id: 'avatar-6', name: 'Dept. Chair', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DeptChair&backgroundColor=transparent' },
  { id: 'avatar-7', name: 'Algo Wizard', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=AlgoWizard&backgroundColor=transparent' },
  { id: 'avatar-8', name: 'AI Specialist', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AISpecialist&backgroundColor=transparent' },
  { id: 'avatar-9', name: 'Campus Dean', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CampusDean&backgroundColor=transparent' },
  { id: 'avatar-10', name: 'Creative Educator', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=CreativeEducator&backgroundColor=transparent' },
];


export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  
  const [selectedAvatar, setSelectedAvatar] = useState<string>(user?.avatar_url || AVATARS[0].url);
  const [phone, setPhone] = useState(user?.phone || '+91 98301 23456');
  const [specialization, setSpecialization] = useState(user?.specialization || 'Distributed Systems & Cybersecurity');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user?.avatar_url) setSelectedAvatar(user.avatar_url);
  }, [user?.avatar_url]);

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

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const response = await api.post('/auth/me/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSelectedAvatar(response.data.avatar_url);
      updateUser(response.data);
      toast.success('Profile photo uploaded', 'Your new photo is now visible across the dashboard.');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to upload profile photo');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-6xl mx-auto">
      
      {/* ─── Header Banner ─── */}
      <div className="bg-gradient-to-r from-[#005BAC] via-[#0A6FD8] to-[#8CC63F] p-6 sm:p-8 rounded-3xl text-white shadow-xl flex items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-extrabold text-white">
            <ShieldCheck className="w-3.5 h-3.5 text-[#8CC63F]" /> Faculty Identity Command
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Personalized Teacher Profile</h1>
          <p className="text-xs text-slate-100 font-medium">Select your 3D academic avatar, manage official contact info, and review teaching context portfolio.</p>
        </div>
        <div className="w-24 h-24 flex items-center justify-center flex-shrink-0">
          <img src="/images/avatar.png" alt="Teacher profile avatar" className="w-full h-full object-contain" />
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

        {/* ─── Right Column: 10 Avatar Selection & Contact Form ─── */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Avatar Selector Grid */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#8CC63F]" />
                <span>Choose Your Faculty Avatar (10 Available)</span>
              </h3>
               <p className="text-xs text-slate-500 mt-1">Choose an avatar, then save your profile. It will appear in the dashboard welcome banner and teacher badge.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
              {AVATARS.map((av) => {
                const isSelected = selectedAvatar === av.url;
                return (
                  <button
                    key={av.id}
                    onClick={() => setSelectedAvatar(av.url)}
                    className={`relative rounded-2xl p-2 text-center transition-all border ${
                      isSelected
                        ? 'border-[#005BAC] dark:border-[#8CC63F] bg-blue-50/50 dark:bg-blue-950/30 ring-2 ring-[#005BAC]/30'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-400'
                    }`}
                  >
                    <div className="w-14 h-14 mx-auto rounded-xl overflow-hidden mb-1.5">
                      <img src={av.url} alt={av.name} className="w-full h-full object-contain" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 block truncate">{av.name}</span>
                    {isSelected && (
                      <span className="absolute top-1 right-1 p-0.5 bg-[#005BAC] dark:bg-[#8CC63F] text-white dark:text-slate-950 rounded-full">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </button>
                );
              })}
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
                  <span>{user?.email || 'faculty@adamasuniversity.ac.in'}</span>
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

        </div>

      </div>

    </div>
  );
};
