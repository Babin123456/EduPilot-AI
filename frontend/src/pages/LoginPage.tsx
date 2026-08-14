import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../api/client';
import { motion } from 'framer-motion';
import { ShieldCheck, GraduationCap, ArrowRight, Lock, Mail, Sparkles, CheckCircle2, UserCheck, Sun, Moon, ArrowLeft } from 'lucide-react';

const DEMO_FACULTY = [
  { faculty_id: 'FAC-UNIV-004', name: 'Sunita Devi', email: 'sunita.devi@edupilot.ai', password: 'demo@1234', designation: 'Assistant Professor', specialization: 'Computer Networks & Security' },
  { faculty_id: 'FAC-UNIV-001', name: 'Rajesh Banerjee', email: 'rajesh.banerjee@edupilot.ai', password: 'demo@1234', designation: 'Associate Professor', specialization: 'Algorithms & Data Structures' },
  { faculty_id: 'FAC-UNIV-002', name: 'Priya Nair', email: 'priya.nair@edupilot.ai', password: 'demo@1234', designation: 'Assistant Professor', specialization: 'Database Systems & Data Mining' },
  { faculty_id: 'FAC-UNIV-003', name: 'Amitava Chatterjee', email: 'amitava.chatterjee@edupilot.ai', password: 'demo@1234', designation: 'Professor', specialization: 'Artificial Intelligence & Machine Learning' },
  { faculty_id: 'FAC-UNIV-005', name: 'Debashis Ghosh', email: 'debashis.ghosh@edupilot.ai', password: 'demo@1234', designation: 'Associate Professor', specialization: 'Operating Systems & Cloud Computing' },
  { faculty_id: 'FAC-UNIV-006', name: 'Meenakshi Iyer', email: 'meenakshi.iyer@edupilot.ai', password: 'demo@1234', designation: 'Assistant Professor', specialization: 'Software Engineering & Web Technologies' },
  { faculty_id: 'FAC-UNIV-007', name: 'Arpan Mukherjee', email: 'arpan.mukherjee@edupilot.ai', password: 'demo@1234', designation: 'Professor', specialization: 'Deep Learning & NLP' },
  { faculty_id: 'FAC-UNIV-008', name: 'Kavita Sharma', email: 'kavita.sharma@edupilot.ai', password: 'demo@1234', designation: 'Assistant Professor', specialization: 'Mathematics & Discrete Structures' },
  { faculty_id: 'FAC-UNIV-009', name: 'Subhashis Roy', email: 'subhashis.roy@edupilot.ai', password: 'demo@1234', designation: 'Associate Professor', specialization: 'Blockchain & Cyber Security' },
  { faculty_id: 'FAC-UNIV-010', name: 'Ananya Sengupta', email: 'ananya.sengupta@edupilot.ai', password: 'demo@1234', designation: 'Assistant Professor', specialization: 'Internet of Things & Embedded Systems' },
];

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoAccounts, setDemoAccounts] = useState<any[]>(DEMO_FACULTY);
  const { token, login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is already authenticated, redirect to dashboard
    if (token) {
      navigate('/dashboard', { replace: true });
      return;
    }

    const orderMap: Record<string, number> = {
      'FAC-UNIV-004': 0,
      'FAC-UNIV-001': 1,
      'FAC-UNIV-002': 2,
      'FAC-UNIV-003': 3,
      'FAC-UNIV-005': 4,
      'FAC-UNIV-006': 5,
      'FAC-UNIV-007': 6,
      'FAC-UNIV-008': 7,
      'FAC-UNIV-009': 8,
      'FAC-UNIV-010': 9,
    };

    api.get('/auth/demo-accounts')
      .then(res => {
        if (res.data && res.data.length > 0) {
          const sorted = [...res.data].sort((a, b) => (orderMap[a.faculty_id] ?? 99) - (orderMap[b.faculty_id] ?? 99));
          setDemoAccounts(sorted);
        }
      })
      .catch(() => {});
  }, [token, navigate]);

  const doLogin = async (loginEmail: string, loginPass: string) => {
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', {
        email: loginEmail.trim().toLowerCase(),
        password: loginPass.trim(),
      });
      login(res.data.access_token, res.data.teacher);
      navigate('/dashboard');
    } catch (err: any) {
      if (!err.response) {
        setError('Unable to connect to EduPilot backend server. If using Render free tier, please wait 30 seconds while the server spins up and try again.');
      } else {
        setError(err.response.data?.detail || 'Invalid email or password');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }
    doLogin(email, password);
  };

  const handleOneClickDemoLogin = (demoEmail: string, demoPass: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setEmail(demoEmail);
    setPassword(demoPass);
    doLogin(demoEmail, demoPass);
  };

  return (
    <motion.div
      initial={{ opacity: 0, filter: 'blur(16px)', scale: 0.98 }}
      animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="min-h-screen bg-slate-50 dark:bg-[#071426] flex flex-col justify-between p-4 sm:p-6 lg:p-8 transition-colors duration-200"
    >
      
      {/* Top Header Bar with Back to Home & Theme Toggle */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between py-2">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:text-[#005BAC] dark:hover:text-[#8CC63F] text-xs font-bold shadow-sm transition-all hover:scale-105 active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-[#005BAC] dark:text-[#8CC63F]" />
          <span>Back to Home</span>
        </Link>

        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm"
          aria-label="Toggle light and dark mode"
        >
          {theme === 'light' ? <Moon className="w-4 h-4 text-slate-700" /> : <Sun className="w-4 h-4 text-amber-400" />}
        </button>
      </div>

      {/* 2-Column Split Card (One Half Hero Image Visual, One Half Login Form) */}
      <div className="w-full max-w-5xl mx-auto my-auto rounded-3xl overflow-hidden glass-card border border-slate-200 dark:border-slate-800 shadow-2xl grid grid-cols-1 lg:grid-cols-12 bg-white dark:bg-slate-900">
        
        {/* ─── LEFT HALF: BRAND VISUAL & ILLUSTRATION ─── */}
        <div className="lg:col-span-6 relative p-8 sm:p-12 bg-gradient-to-br from-[#005BAC] via-[#0A6FD8] to-[#071426] text-white flex flex-col justify-between overflow-hidden">
          
          {/* Background Pattern + Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#8CC63F]/20 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-blue-400/20 blur-3xl pointer-events-none" />

          {/* Top Brand Tag */}
          <div className="relative z-10 space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 backdrop-blur-md text-white border border-white/20">
                <ShieldCheck className="w-4 h-4 text-[#8CC63F]" />
                <span>Next-Gen Academic OS</span>
              </span>

            <div className="pt-4 space-y-2">
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                Welcome to <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-[#8CC63F]">
                  EduPilot AI
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                Empowering faculty members with 1-click attendance, syllabus breakdown, assessment generation, and classroom RAG copiloting.
              </p>
            </div>
          </div>

          {/* Center Isolated Product Showcase Graphic */}
          <div className="relative z-10 my-6 flex justify-center">
            <img
              src="/images/login_hero_illustration.webp"
              alt="EduPilot Academic OS Visual"
              className="w-full h-auto object-contain max-h-64 drop-shadow-[0_15px_35px_rgba(0,0,0,0.35)]"
            />
          </div>


          {/* Bottom Trust Badges */}
          <div className="relative z-10 pt-2 flex flex-wrap items-center gap-4 text-[11px] font-semibold text-slate-200">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#8CC63F]" /> FERPA Compliant</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#8CC63F]" /> 1-Click Class Context</span>
          </div>

        </div>

        {/* ─── RIGHT HALF: LOGIN FORM & 1-CLICK DEMO FACULTY ─── */}
        <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-between space-y-6">
          
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-extrabold text-[#005BAC] dark:text-[#8CC63F] uppercase tracking-wider mb-1">
                <GraduationCap className="w-4 h-4" /> Faculty Portal Access
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                Sign In to Your Account
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Enter your institutional credentials below.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-[#005BAC] dark:text-[#8CC63F]" />
                  <span>Institutional Email</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-[#005BAC] dark:focus:ring-[#8CC63F] focus:outline-none transition-shadow"
                  placeholder="faculty@university.edu"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-[#005BAC] dark:text-[#8CC63F]" />
                  <span>Password</span>
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-[#005BAC] dark:focus:ring-[#8CC63F] focus:outline-none transition-shadow"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-magnetic w-full py-3.5 px-4 bg-[#005BAC] hover:bg-[#0A6FD8] text-white text-sm font-extrabold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In to Portal'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* 1-Click Instant Demo Login Roster */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#8CC63F]" />
                1-Click Instant Demo Access
              </span>
              <span className="text-[10px] font-bold text-[#005BAC] dark:text-[#8CC63F]">
                {demoAccounts.length} Faculty Profiles
              </span>
            </div>

            <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
              {demoAccounts.map((acc) => (
                <button
                  type="button"
                  key={acc.faculty_id}
                  onClick={(e) => handleOneClickDemoLogin(acc.email, acc.password, e)}
                  disabled={loading}
                  className="w-full text-left p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-[#005BAC] dark:hover:border-[#8CC63F] bg-slate-50 dark:bg-slate-800/60 transition-all flex items-center justify-between group"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#005BAC] dark:group-hover:text-[#8CC63F]">
                      {acc.name}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{acc.specialization}</p>
                  </div>
                  <span className="text-[10px] font-bold bg-[#005BAC]/10 text-[#005BAC] dark:bg-[#8CC63F]/20 dark:text-[#8CC63F] px-2.5 py-1 rounded-lg group-hover:bg-[#005BAC] group-hover:text-white dark:group-hover:bg-[#8CC63F] dark:group-hover:text-slate-950 transition-colors flex items-center gap-1">
                    <UserCheck className="w-3 h-3" />
                    Demo Login
                  </span>
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

    </motion.div>
  );
};
