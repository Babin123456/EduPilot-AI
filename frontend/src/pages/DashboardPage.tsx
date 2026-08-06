import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { motion } from 'framer-motion';
import {
  Users,
  CheckSquare,
  FileText,
  AlertTriangle,
  Calendar,
  Clock,
  ArrowRight,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { Link } from 'react-router-dom';

const SkeletonBlock: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`animate-pulse bg-slate-200 dark:bg-slate-800 rounded-lg ${className || ''}`} />
);

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.96 },
  visible: (i: number) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { delay: i * 0.08, duration: 0.35, ease: 'easeOut' },
  }),
};

export const DashboardPage: React.FC = () => {
  const { user, activeClass } = useAuth();
  const [summary, setSummary] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [todaySchedule, setTodaySchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setSummary(null);
    Promise.all([
      api.get('/dashboard/summary'),
      api.get('/dashboard/alerts'),
      api.get('/timetable/today')
    ]).then(([sumRes, alertRes, ttRes]) => {
      setSummary(sumRes.data);
      setAlerts(alertRes.data);
      setTodaySchedule(ttRes.data);
    }).finally(() => setLoading(false));
  }, [activeClass]);

  const metrics = [
    { label: "Today's Classes", value: summary?.today_classes ?? 0, icon: Calendar, color: 'blue' },
    { label: 'Pending Attendance', value: summary?.pending_attendance ?? 0, icon: CheckSquare, color: 'amber' },
    { label: 'Pending Grading', value: summary?.pending_grading ?? 0, icon: FileText, color: 'purple' },
    { label: 'At-Risk Students', value: summary?.at_risk_students ?? 0, icon: AlertTriangle, color: 'red', isRisk: true },
  ];

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 dark:bg-blue-950/50 text-adamas-blue',
    amber: 'bg-amber-50 dark:bg-amber-950/50 text-amber-500',
    purple: 'bg-purple-50 dark:bg-purple-950/50 text-purple-500',
    red: 'bg-red-50 dark:bg-red-950/50 text-red-500',
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-gradient-to-r from-adamas-blue to-adamas-blue-dark rounded-2xl p-6 lg:p-8 text-white shadow-lg relative overflow-hidden"
      >
        <div className="relative z-10">
          <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold tracking-wide uppercase">
            Teacher Command Center
          </span>
          <h1 className="text-2xl lg:text-3xl font-extrabold mt-3">
            Welcome back, {user?.full_name}
          </h1>
          <p className="text-adamas-blue-light text-sm mt-1 max-w-2xl">
            {activeClass
              ? `Currently managing ${activeClass.course_name} (${activeClass.course_code}) for ${activeClass.year_label} Section ${activeClass.section_name}.`
              : 'Select a class to view targeted insights and manage attendance.'}
          </p>
        </div>
        <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-white/5" />
        <div className="absolute -right-2 -top-10 w-28 h-28 rounded-full bg-white/5" />
      </motion.div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <SkeletonBlock className="h-3 w-24 mb-3" />
              <SkeletonBlock className="h-8 w-14" />
            </div>
          ))
        ) : (
          metrics.map((m, i) => {
            const Icon = m.icon;
            return (
              <motion.div
                key={m.label}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={cardVariants}
                className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow duration-200"
              >
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{m.label}</p>
                  <h3 className={`text-2xl font-black mt-1 ${m.isRisk ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>
                    {m.value}
                  </h3>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorMap[m.color]}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Schedule */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-adamas-blue dark:text-adamas-green" />
                Today's Teaching Schedule
              </h2>
              <Link to="/timetable" className="text-xs font-bold text-adamas-blue dark:text-adamas-green hover:underline flex items-center gap-1">
                Full Routine <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                    <SkeletonBlock className="h-3 w-20 mb-2" />
                    <SkeletonBlock className="h-4 w-48 mb-1" />
                    <SkeletonBlock className="h-3 w-36" />
                  </div>
                ))}
              </div>
            ) : todaySchedule.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-sm">
                No classes scheduled for today.
              </div>
            ) : (
              <div className="space-y-3">
                {todaySchedule.map((cls, i) => (
                  <motion.div
                    key={cls.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.06, duration: 0.3 }}
                    className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between hover:border-adamas-blue/30 transition-colors duration-200"
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/50 text-adamas-blue dark:text-blue-300">
                        {cls.start_time} - {cls.end_time}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1">
                        {cls.course_name} ({cls.course_code})
                      </h4>
                      <p className="text-xs text-slate-500">
                        {cls.year_label} • Section {cls.section_name} • Room: {cls.room}
                      </p>
                    </div>
                    <div>
                      {cls.attendance_taken ? (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                          Attendance Taken
                        </span>
                      ) : (
                        <Link
                          to="/attendance"
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-adamas-blue text-white hover:bg-adamas-blue-dark transition-colors"
                        >
                          Take Attendance
                        </Link>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Quick Actions & AI Assistant launcher */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-2xl text-white shadow-md"
          >
            <div className="flex items-center gap-2 text-adamas-green font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4" /> EduPilot AI Copilot
            </div>
            <h3 className="font-extrabold text-lg mt-2">Ask EduPilot Anything</h3>
            <p className="text-slate-300 text-xs mt-1">
              "Show students with attendance under 75% in 3rd Year Sec B" or "Generate quiz on Operating Systems".
            </p>
            <Link
              to="/ai"
              className="mt-4 w-full py-2.5 px-4 bg-adamas-green hover:bg-adamas-green-dark text-slate-950 text-xs font-extrabold rounded-lg flex items-center justify-center gap-2 transition-colors shadow"
            >
              Open AI Workspace
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
          >
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <Link to="/attendance" className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 flex flex-col items-center gap-1.5 text-center transition-colors">
                <CheckSquare className="w-5 h-5 text-adamas-blue" /> Take Attendance
              </Link>
              <Link to="/assignments" className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 flex flex-col items-center gap-1.5 text-center transition-colors">
                <FileText className="w-5 h-5 text-purple-500" /> Create Assignment
              </Link>
              <Link to="/daily-notes" className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 flex flex-col items-center gap-1.5 text-center transition-colors">
                <BookOpen className="w-5 h-5 text-emerald-500" /> Daily Notes
              </Link>
              <Link to="/analytics" className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 flex flex-col items-center gap-1.5 text-center transition-colors">
                <Users className="w-5 h-5 text-amber-500" /> Class Analytics
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
