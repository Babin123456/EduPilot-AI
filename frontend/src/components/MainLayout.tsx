import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  LayoutDashboard,
  Calendar,
  Users,
  CheckSquare,
  FileText,
  HelpCircle,
  BarChart3,
  Bot,
  Folder,
  Mail,
  Sun,
  Moon,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Bell
} from 'lucide-react';

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, activeClass, setActiveClass, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [classDropdownOpen, setClassDropdownOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Timetable', path: '/timetable', icon: Calendar },
    { label: 'Attendance', path: '/attendance', icon: CheckSquare },
    { label: 'Students', path: '/students', icon: Users },
    { label: 'Assignments', path: '/assignments', icon: FileText },
    { label: 'Assessments', path: '/assessments', icon: HelpCircle },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'EduPilot AI', path: '/ai', icon: Bot },
    { label: 'Document Studio', path: '/documents', icon: Folder },
    { label: 'Communications', path: '/communications', icon: Mail },
  ];

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-transform duration-200 lg:static lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-adamas-blue text-white flex items-center justify-center font-bold text-lg shadow-sm">
                EP
              </div>
              <div>
                <h1 className="font-bold text-slate-900 dark:text-white leading-none">EduPilot AI</h1>
                <p className="text-xs text-adamas-blue dark:text-adamas-green font-medium">Adamas University</p>
              </div>
            </div>
            <button className="lg:hidden text-slate-500" onClick={() => setMobileOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-adamas-blue/10 dark:bg-adamas-blue/20 text-adamas-blue dark:text-white font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-adamas-blue dark:text-adamas-green' : ''}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Footer User Profile */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 text-xs flex-shrink-0">
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </div>
                <div className="truncate">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{user?.full_name}</p>
                  <p className="text-[10px] text-slate-500 truncate">{user?.designation}</p>
                </div>
              </div>
              <button
                onClick={logout}
                title="Logout"
                className="p-1.5 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-slate-500" onClick={() => setMobileOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>

            {/* Global Academic Context Selector */}
            {user?.classes && user.classes.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setClassDropdownOpen(!classDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-adamas-blue transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-adamas-green"></span>
                  <span>{activeClass ? `${activeClass.year_label} - Sec ${activeClass.section_name} (${activeClass.course_code})` : 'Select Class'}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {classDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 py-2">
                    <p className="px-4 py-1.5 text-[10px] font-bold tracking-wider text-slate-400 uppercase">Active Teaching Context</p>
                    {user.classes.map((cls) => (
                      <button
                        key={cls.id}
                        onClick={() => {
                          setActiveClass(cls);
                          setClassDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-xs flex flex-col hover:bg-slate-50 dark:hover:bg-slate-800 ${activeClass?.id === cls.id ? 'bg-adamas-blue/5 text-adamas-blue font-bold' : 'text-slate-700 dark:text-slate-300'}`}
                      >
                        <span className="font-semibold">{cls.course_name} ({cls.course_code})</span>
                        <span className="text-[10px] text-slate-500">{cls.year_label} | Section {cls.section_name} | {cls.room}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Toggle theme"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-amber-400" />}
            </button>
            <button className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </header>

        {/* Dynamic Page Workspace */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
