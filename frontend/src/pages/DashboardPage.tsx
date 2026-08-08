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
  BookOpen,
  BarChart3
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

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
  const [todaySchedule, setTodaySchedule] = useState<any[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setSummary(null);
    setAnalyticsData(null);
    
    const fetchPromises: Promise<any>[] = [
      api.get('/dashboard/summary'),
      api.get('/timetable/today')
    ];

    if (activeClass) {
      fetchPromises.push(api.get(`/analytics/classes/${activeClass.id}/overview`));
    }

    Promise.all(fetchPromises).then(([sumRes, ttRes, analyticsRes]) => {
      setSummary(sumRes?.data || null);
      setTodaySchedule(ttRes?.data || []);
      if (analyticsRes) {
        setAnalyticsData(analyticsRes.data);
      }
    }).finally(() => setLoading(false));
  }, [activeClass]);

  const metrics = [
    { label: "Today's Classes", value: summary?.today_classes ?? 0, icon: Calendar, color: 'blue' },
    { label: 'Pending Attendance', value: summary?.pending_attendance ?? 0, icon: CheckSquare, color: 'amber' },
    { label: 'Pending Grading', value: summary?.pending_grading ?? 0, icon: FileText, color: 'purple' },
    { label: 'At-Risk Students', value: summary?.at_risk_students ?? 0, icon: AlertTriangle, color: 'red', isRisk: true },
  ];

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 dark:bg-blue-950/50 text-[#005BAC] dark:text-[#0A6FD8]',
    amber: 'bg-amber-50 dark:bg-amber-950/50 text-amber-500',
    purple: 'bg-purple-50 dark:bg-purple-950/50 text-purple-500',
    red: 'bg-red-50 dark:bg-red-950/50 text-red-500',
  };

  const scoreData = analyticsData ? Object.entries(analyticsData.score_distribution || {}).map(([grade, count]) => ({
    grade,
    count
  })) : [];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-gradient-to-r from-[#005BAC] via-[#0A6FD8] to-slate-900 rounded-2xl p-6 lg:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6"
      >
        <div className="relative z-10 max-w-xl">
          <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold tracking-wide uppercase">
            Teacher Command Center
          </span>
          <h1 className="text-2xl lg:text-3xl font-extrabold mt-3">
            Welcome back, {user?.full_name}
          </h1>
          <p className="text-blue-100 text-sm mt-1">
            {activeClass
              ? `Currently managing ${activeClass.course_name} (${activeClass.course_code}) for ${activeClass.year_label} Section ${activeClass.section_name}.`
              : 'Select a class to view targeted insights and manage attendance.'}
          </p>
        </div>
        <div className="relative z-10 w-full md:w-64 h-32 md:h-40 rounded-xl overflow-hidden shadow-lg border border-white/20 flex-shrink-0 bg-white/10 backdrop-blur-sm">
          <img
            src="/images/hero_illustration.png"
            alt="Academic Operations"
            className="w-full h-full object-cover bg-white/5"
          />
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
                className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between hover:shadow-md transition-all duration-200"
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

      {/* Embedded Class Analytics Section */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6"
      >
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-500 flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Class Analytics & Performance Intelligence</h2>
              <p className="text-xs text-slate-500">Live metrics & distribution diagnostics for active class</p>
            </div>
          </div>
          {analyticsData && (
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#005BAC]/10 text-[#005BAC] dark:bg-[#8CC63F]/20 dark:text-[#8CC63F]">
              {activeClass?.year_label} - Sec {activeClass?.section_name}
            </span>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SkeletonBlock className="h-64 rounded-xl" />
            <SkeletonBlock className="h-64 rounded-xl" />
          </div>
        ) : !analyticsData ? (
          <div className="p-8 text-center text-slate-500 text-xs bg-slate-50 dark:bg-slate-800/50 rounded-xl">
            Select a class from the top menu to view detailed analytics distribution.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Grade Bar Chart */}
            <div className="bg-slate-50/50 dark:bg-slate-800/40 p-5 rounded-xl border border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-4">Grade Distribution</h4>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scoreData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="grade" stroke="#888888" fontSize={11} />
                    <YAxis stroke="#888888" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                    <Bar dataKey="count" fill="#005BAC" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Performance Metric Cards */}
            <div className="space-y-4 flex flex-col justify-center">
              <div className="p-5 bg-slate-50/50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Average Class Attendance</span>
                  <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">{analyticsData.average_attendance}%</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-500 flex items-center justify-center font-bold text-sm">
                  {analyticsData.average_attendance >= 75 ? 'Good' : 'Warning'}
                </div>
              </div>

              <div className="p-5 bg-slate-50/50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Average Assessment Score</span>
                  <p className="text-3xl font-black text-[#005BAC] dark:text-[#8CC63F] mt-1">{analyticsData.average_score} / 100</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-[#005BAC] dark:text-[#8CC63F] flex items-center justify-center font-bold text-sm">
                  Score
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>

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
                <Clock className="w-5 h-5 text-[#005BAC] dark:text-[#8CC63F]" />
                Today's Teaching Schedule
              </h2>
              <Link to="/timetable" className="text-xs font-bold text-[#005BAC] dark:text-[#8CC63F] hover:underline flex items-center gap-1">
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
                    className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between hover:border-[#005BAC]/30 transition-colors duration-200"
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/50 text-[#005BAC] dark:text-blue-300">
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
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#005BAC] text-white hover:bg-[#0A6FD8] transition-colors"
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
            className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-2xl text-white shadow-md border border-slate-700/50"
          >
            <div className="flex items-center gap-2 text-[#8CC63F] font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4" /> EduPilot AI Copilot
            </div>
            <h3 className="font-extrabold text-lg mt-2">Ask EduPilot Anything</h3>
            <p className="text-slate-300 text-xs mt-1">
              "Show students with attendance under 75% in 3rd Year Sec B" or "Generate quiz on Operating Systems".
            </p>
            <Link
              to="/ai"
              className="mt-4 w-full py-2.5 px-4 bg-[#8CC63F] hover:bg-[#6FAF2E] text-slate-950 text-xs font-extrabold rounded-lg flex items-center justify-center gap-2 transition-colors shadow"
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
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <Link to="/attendance" className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 flex flex-col items-center gap-1.5 text-center transition-colors">
                <CheckSquare className="w-5 h-5 text-[#005BAC]" /> Take Attendance
              </Link>
              <Link to="/assignments" className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 flex flex-col items-center gap-1.5 text-center transition-colors">
                <FileText className="w-5 h-5 text-purple-500" /> Create Assignment
              </Link>
              <Link to="/daily-notes" className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 flex flex-col items-center gap-1.5 text-center transition-colors">
                <BookOpen className="w-5 h-5 text-emerald-500" /> Daily Notes
              </Link>
              <Link to="/documents" className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 flex flex-col items-center gap-1.5 text-center transition-colors">
                <Users className="w-5 h-5 text-amber-500" /> Document Studio
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
