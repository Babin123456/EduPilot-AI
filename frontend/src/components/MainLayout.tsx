import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { AIPage } from '../pages/AIPage';
import {
  LayoutDashboard,
  Calendar,
  Users,
  CheckSquare,
  FileText,
  HelpCircle,
  Bot,
  Folder,
  Mail,
  Sun,
  Moon,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Notebook,
  User,
  PanelLeftClose,
  PanelLeftOpen,
  Clock,
} from 'lucide-react';


export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, activeClass, setActiveClass, logout, classesByYear, classChangeKey } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [classDropdownOpen, setClassDropdownOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setClassDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Timetable', path: '/timetable', icon: Calendar },
    { label: 'Attendance', path: '/attendance', icon: CheckSquare },
    { label: 'Students', path: '/students', icon: Users },
    { label: 'Assignments', path: '/assignments', icon: FileText },
    { label: 'Quizzes & Exams', path: '/assessments', icon: HelpCircle },
    { label: 'EduPilot AI', path: '/ai', icon: Bot },

    { label: 'Daily Notes', path: '/daily-notes', icon: Notebook },
    { label: 'Document Studio', path: '/documents', icon: Folder },
    { label: 'Communications', path: '/communications', icon: Mail },
    { label: 'Faculty Profile', path: '/profile', icon: User },
  ];


  const yearOrder = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Sidebar with Combined Light Green + Azure Blue Gradient */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-gradient-to-b from-[#EEF7F6] via-[#F3FAF2] to-[#EBF4FC] dark:bg-gradient-to-b dark:from-[#061826] dark:via-[#082229] dark:to-[#041D17] border-r border-teal-200/60 dark:border-teal-900/40 transition-all duration-300 lg:static shadow-sm ${
          mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
        } ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-64'}`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="h-16 flex items-center justify-between px-5 border-b border-teal-200/50 dark:border-teal-900/30 flex-shrink-0 bg-white/40 dark:bg-slate-950/40 backdrop-blur-sm">
            <div className="flex items-center gap-3 overflow-hidden">
              <img
                src="/brand_logo.png"
                alt="EduPilot AI Logo"
                className="w-11 h-11 object-contain flex-shrink-0"
              />
              {!sidebarCollapsed && (
                <div className="truncate">
                  <h1 className="font-extrabold text-slate-900 dark:text-white leading-none text-base">EduPilot AI</h1>
                  <p className="text-[10px] text-[#005BAC] dark:text-[#8CC63F] font-bold tracking-wide">Academic OS</p>
                </div>
              )}
            </div>

            <button className="lg:hidden text-slate-500 hover:text-slate-900 dark:hover:text-white" onClick={() => setMobileOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>


          {/* Nav Links */}
          <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto custom-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  title={sidebarCollapsed ? item.label : undefined}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#005BAC] to-[#0A6FD8] text-white shadow-md font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-emerald-500/10 dark:hover:bg-emerald-500/15 hover:text-[#005BAC] dark:hover:text-[#8CC63F]'
                  } ${sidebarCollapsed ? 'justify-center px-0' : ''}`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#8CC63F]' : ''}`} />
                  {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Footer User Profile & Logout */}
          <div className="p-3.5 border-t border-teal-200/50 dark:border-teal-900/30 bg-white/50 dark:bg-slate-950/50 backdrop-blur-md">
            {sidebarCollapsed ? (
              <div className="flex flex-col items-center gap-2">
                <Link
                  to="/profile"
                  title={`${user?.full_name} — Faculty Profile`}
                  className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700/80 p-0.5 overflow-hidden group transition-transform hover:scale-105 shadow-sm"
                >
                  <img src={user?.avatar_url || '/images/avatar.png'} alt={user?.full_name || 'Teacher avatar'} className="w-full h-full object-cover rounded-lg" />
                </Link>
                <button
                  onClick={handleLogout}
                  title="Log Out of EduPilot AI"
                  className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-500 hover:bg-red-500 hover:text-white dark:hover:bg-red-600 transition-all duration-200 flex items-center justify-center shadow-sm"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2 p-1.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/50 shadow-sm">
                <Link to="/profile" className="flex items-center gap-2.5 min-w-0 flex-1 group">
                  <div className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 p-0.5 overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform">
                    <img src={user?.avatar_url || '/images/avatar.png'} alt={user?.full_name || 'Teacher avatar'} className="w-full h-full object-cover rounded-lg" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-[#005BAC] dark:group-hover:text-[#8CC63F] transition-colors">{user?.full_name}</p>
                    <p className="text-[10px] text-slate-400 font-semibold truncate">{user?.designation}</p>
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  title="Log Out of EduPilot AI"
                  className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 dark:hover:text-red-400 transition-all duration-200 flex-shrink-0"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-3">
            {/* Mobile menu trigger */}
            <button className="lg:hidden text-slate-500" onClick={() => setMobileOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>

            {/* Desktop Sidebar Toggle Button */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:flex p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={sidebarCollapsed ? 'Open Sidebar' : 'Hide Sidebar'}
              aria-label={sidebarCollapsed ? 'Open Sidebar' : 'Hide Sidebar'}
            >
              {sidebarCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
            </button>

            {/* Global Academic Context Selector — Grouped by Year */}
            {user?.classes && user.classes.length > 0 && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setClassDropdownOpen(!classDropdownOpen)}
                  className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-[#005BAC] transition-all duration-200"
                >
                  <span className="w-2 h-2 rounded-full bg-[#8CC63F] animate-pulse"></span>
                  <span>{activeClass ? `${activeClass.year_label} - Sec ${activeClass.section_name} (${activeClass.course_code})` : 'Select Class'}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${classDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {classDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-50 py-2 max-h-[420px] overflow-y-auto"
                    >
                      <p className="px-4 py-1.5 text-[10px] font-bold tracking-wider text-slate-400 uppercase">Active Teaching Context</p>
                      {yearOrder.map((yearLabel) => {
                        const classes = classesByYear[yearLabel];
                        if (!classes || classes.length === 0) return null;
                        return (
                          <div key={yearLabel}>
                            <p className="px-4 py-1.5 text-[10px] font-extrabold tracking-wider text-[#005BAC] dark:text-[#8CC63F] uppercase mt-1 border-t border-slate-100 dark:border-slate-800">
                              {yearLabel}
                            </p>
                            {classes.map((cls) => (
                              <button
                                key={cls.id}
                                onClick={() => {
                                  setActiveClass(cls);
                                  setClassDropdownOpen(false);
                                }}
                                className={`w-full text-left px-4 py-2.5 text-xs flex flex-col transition-all duration-150 hover:bg-slate-50 dark:hover:bg-slate-800 ${
                                  activeClass?.id === cls.id 
                                    ? 'bg-[#005BAC]/10 dark:bg-[#8CC63F]/20 text-[#005BAC] dark:text-[#8CC63F] font-bold border-l-2 border-[#005BAC] dark:border-[#8CC63F]' 
                                    : 'text-slate-700 dark:text-slate-300 border-l-2 border-transparent'
                                }`}
                              >
                                <span className="font-semibold">{cls.course_name} ({cls.course_code})</span>
                                <span className="text-[10px] text-slate-500 mt-0.5">Section {cls.section_name} • {cls.room}</span>
                              </button>
                            ))}
                          </div>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Live Running Clock, Date, and Day Ticker (Dark & Light Mode Compatible) */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 shadow-inner">
              <Clock className="w-3.5 h-3.5 text-[#005BAC] dark:text-[#8CC63F] animate-pulse flex-shrink-0" />
              <span className="font-mono text-xs font-black text-[#005BAC] dark:text-[#8CC63F]">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
              <span className="text-[10px] text-slate-400 font-bold opacity-60">•</span>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {currentTime.toLocaleDateString([], { weekday: 'short', day: '2-digit', month: 'short' })}
              </span>
            </div>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Toggle theme"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-amber-400" />}
            </button>
          </div>

        </header>

        {/* Dynamic Page Workspace with smooth transitions */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 relative">
          {/* Background Persistent EduPilot AI Page (Preserves text input, uploading, and active LLM streaming) */}
          <div className={location.pathname === '/ai' ? 'block h-full' : 'hidden h-full'}>
            <AIPage />
          </div>

          {/* Other Route Pages */}
          {location.pathname !== '/ai' && (
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname + classChangeKey}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          )}
        </main>
      </div>
    </div>
  );
};
