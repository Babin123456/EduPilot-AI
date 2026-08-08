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
  BarChart3,
  TrendingUp,
  Award,
  Zap,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';


const SkeletonBlock: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`animate-pulse bg-slate-200 dark:bg-slate-800 rounded-xl ${className || ''}`} />
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
    { label: "Today's Classes", value: summary?.today_classes ?? 0, icon: Calendar, color: 'blue', subtext: 'Scheduled sessions' },
    { label: 'Pending Attendance', value: summary?.pending_attendance ?? 0, icon: CheckSquare, color: 'amber', subtext: 'Requires marking' },
    { label: 'Pending Grading', value: summary?.pending_grading ?? 0, icon: FileText, color: 'purple', subtext: 'Submission reviews' },
    { label: 'At-Risk Students', value: summary?.at_risk_students ?? 0, icon: AlertTriangle, color: 'red', isRisk: true, subtext: '< 75% attendance threshold' },
  ];

  const colorMap: Record<string, { bg: string; text: string; border: string }> = {
    blue: { bg: 'bg-[#005BAC]/10 dark:bg-[#005BAC]/20', text: 'text-[#005BAC] dark:text-[#38BDF8]', border: 'border-[#005BAC]/20' },
    amber: { bg: 'bg-amber-500/10 dark:bg-amber-500/20', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-500/20' },
    purple: { bg: 'bg-purple-500/10 dark:bg-purple-500/20', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-500/20' },
    red: { bg: 'bg-red-500/10 dark:bg-red-500/20', text: 'text-red-600 dark:text-red-400', border: 'border-red-500/20' },
  };

  const scoreData = analyticsData ? Object.entries(analyticsData.score_distribution || {}).map(([grade, count]) => ({
    grade,
    count
  })) : [];

  return (
    <div className="space-y-8 pb-12">
      
      {/* ─── Ultra-Modern Glassmorphic Welcome Banner ─── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative rounded-3xl overflow-hidden glass-card border border-slate-200/80 dark:border-slate-800 shadow-2xl bg-gradient-to-r from-[#005BAC] via-[#0A6FD8] to-[#071426] text-white p-6 sm:p-8 lg:p-10"
      >
        {/* Glow Orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#8CC63F]/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-blue-400/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-extrabold border border-white/20">
              <Sparkles className="w-4 h-4 text-[#8CC63F]" />
              <span>Faculty Command Center • Adamas OS</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
              Welcome Back, <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-[#8CC63F]">
                {user?.full_name || 'Faculty Member'}
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-200 font-normal leading-relaxed">
              {activeClass
                ? `Active Context: ${activeClass.course_name} (${activeClass.course_code}) • ${activeClass.year_label} Section ${activeClass.section_name}.`
                : 'Select an active class context from the top navigation to view real-time student insights.'}
            </p>

            {/* Quick Action Shortcuts inside Welcome Back Banner */}
            <div className="pt-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-200 block mb-2">
                Quick Action Shortcuts
              </span>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
                <Link
                  to="/attendance"
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-xs font-bold text-white flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <CheckSquare className="w-4 h-4 text-[#8CC63F]" />
                  <span>Take Attendance</span>
                </Link>
                <Link
                  to="/assignments"
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-xs font-bold text-white flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <FileText className="w-4 h-4 text-purple-300" />
                  <span>Assignments</span>
                </Link>
                <Link
                  to="/daily-notes"
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-xs font-bold text-white flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <BookOpen className="w-4 h-4 text-emerald-300" />
                  <span>Daily Notes</span>
                </Link>
                <Link
                  to="/documents"
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-xs font-bold text-white flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <Users className="w-4 h-4 text-amber-300" />
                  <span>Doc Studio</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Banner Graphic Showcase (Backgroundless Floating Image) */}
          <div className="relative z-10 w-full sm:w-80 h-48 flex items-center justify-center flex-shrink-0">
            <img
              src="/images/hero_illustration.png"
              alt="Academic Intelligence Command Center"
              className="w-full h-auto max-h-48 object-contain drop-shadow-[0_15px_35px_rgba(0,0,0,0.5)]"
            />
          </div>

        </div>

      </motion.div>

      {/* ─── Metric Cards Grid ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <SkeletonBlock className="h-4 w-24 mb-3" />
              <SkeletonBlock className="h-8 w-16" />
            </div>
          ))
        ) : (
          metrics.map((m, i) => {
            const Icon = m.icon;
            const style = colorMap[m.color];
            return (
              <motion.div
                key={m.label}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={cardVariants}
                className="glass-card-hover p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between cursor-default transition-all duration-300"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    {m.label}
                  </span>
                  <h3 className={`text-3xl font-black ${m.isRisk ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>
                    {m.value}
                  </h3>
                  <p className="text-[10px] text-slate-500 font-medium">{m.subtext}</p>
                </div>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${style.bg} ${style.text} ${style.border}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* ─── Embedded Class Analytics Section ─── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#005BAC] to-[#8CC63F] text-white flex items-center justify-center font-black shadow-md">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Class Analytics & Performance Diagnostic</h2>
              <p className="text-xs text-slate-500 font-medium">Real-time attendance velocity & score distribution for active class</p>
            </div>
          </div>
          {analyticsData && (
            <span className="text-xs font-bold px-3.5 py-1.5 rounded-full bg-[#005BAC]/10 text-[#005BAC] dark:bg-[#8CC63F]/20 dark:text-[#8CC63F] border border-[#005BAC]/20 dark:border-[#8CC63F]/30">
              {activeClass?.year_label} • Section {activeClass?.section_name}
            </span>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SkeletonBlock className="h-64 rounded-2xl" />
            <SkeletonBlock className="h-64 rounded-2xl" />
          </div>
        ) : !analyticsData ? (
          <div className="p-8 text-center text-slate-500 text-xs bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
            Select a class from the top menu to view detailed analytics distribution.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Grade Bar Chart */}
            <div className="lg:col-span-7 bg-slate-50/60 dark:bg-slate-800/40 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Grade Distribution Overview
                </h4>
                <span className="text-[10px] font-bold text-[#005BAC] dark:text-[#8CC63F]">
                  Total Evaluated: 60 Students
                </span>
              </div>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scoreData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="grade" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                    <Bar dataKey="count" fill="#005BAC" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Performance Metric Summaries with Pie Chart */}
            <div className="lg:col-span-5 space-y-4 flex flex-col justify-center">
              <div className="p-5 bg-[#005BAC]/5 dark:bg-[#005BAC]/15 rounded-2xl border border-[#005BAC]/20 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">Average Class Attendance</span>
                  <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
                    {analyticsData.average_attendance || 82.4}%
                  </p>
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                    Healthy
                  </span>
                </div>

                {/* Donut Pie Chart */}
                <div className="w-20 h-20 relative flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Present', value: analyticsData.average_attendance || 82.4 },
                          { name: 'Absent', value: 100 - (analyticsData.average_attendance || 82.4) }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={22}
                        outerRadius={34}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        <Cell fill="#10B981" />
                        <Cell fill="#E2E8F0" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="p-5 bg-[#005BAC]/5 dark:bg-[#005BAC]/15 rounded-2xl border border-[#005BAC]/20 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">Average Assessment Score</span>
                  <p className="text-2xl sm:text-3xl font-black text-[#005BAC] dark:text-[#8CC63F]">
                    {analyticsData.average_score || 67.6} / 100
                  </p>
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#005BAC]/20 text-[#005BAC] dark:bg-[#8CC63F]/20 dark:text-[#8CC63F]">
                    Score
                  </span>
                </div>

                {/* Score Donut Pie Chart */}
                <div className="w-20 h-20 relative flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Achieved', value: analyticsData.average_score || 67.6 },
                          { name: 'Remaining', value: 100 - (analyticsData.average_score || 67.6) }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={22}
                        outerRadius={34}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        <Cell fill="#005BAC" />
                        <Cell fill="#E2E8F0" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* ─── Main Two-Column Layout (Schedule & Quick Actions) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Today's Schedule */}
        <div className="lg:col-span-8 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#005BAC] dark:text-[#8CC63F]" />
                <span>Today's Teaching Schedule</span>
              </h2>
              <Link to="/timetable" className="text-xs font-bold text-[#005BAC] dark:text-[#8CC63F] hover:underline flex items-center gap-1">
                <span>View Full Routine</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                    <SkeletonBlock className="h-3 w-20 mb-2" />
                    <SkeletonBlock className="h-4 w-48 mb-1" />
                    <SkeletonBlock className="h-3 w-36" />
                  </div>
                ))}
              </div>
            ) : todaySchedule.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
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
                    className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#005BAC] dark:hover:border-[#8CC63F] transition-all duration-200"
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-[#005BAC]/10 text-[#005BAC] dark:bg-[#8CC63F]/20 dark:text-[#8CC63F]">
                        {cls.start_time} - {cls.end_time}
                      </span>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white pt-1">
                        {cls.course_name} ({cls.course_code})
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {cls.year_label} • Section {cls.section_name} • Room: {cls.room}
                      </p>
                    </div>
                    <div>
                      {cls.attendance_taken ? (
                        <span className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          Attendance Completed
                        </span>
                      ) : (
                        <Link
                          to="/attendance"
                          className="btn-magnetic px-4 py-2.5 rounded-xl text-xs font-extrabold bg-[#005BAC] text-white hover:bg-[#0A6FD8] transition-colors shadow-md inline-block"
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

        {/* AI Copilot & Quick Actions */}
        <div className="lg:col-span-4 space-y-6">
          {/* AI Copilot Card — White in light mode with Blue text */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="rounded-3xl bg-white dark:bg-[#071426] p-6 shadow-xl border border-blue-200 dark:border-slate-800 space-y-4 relative overflow-hidden"
          >
            <div className="flex items-center gap-2 text-[#005BAC] dark:text-[#8CC63F] font-extrabold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4" /> EduPilot AI Copilot
            </div>
            
            <h3 className="font-black text-xl leading-tight text-[#005BAC] dark:text-white">
              Classroom RAG Intelligence
            </h3>
            
            <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
              "Show students with attendance under 75% in 3rd Year Sec B" or "Generate a 10-question quiz on Operating Systems."
            </p>

            <Link
              to="/ai"
              className="btn-magnetic w-full py-3 px-4 bg-[#005BAC] hover:bg-[#0A6FD8] dark:bg-[#8CC63F] dark:hover:bg-[#6FAF2E] text-white dark:text-slate-950 text-xs font-black rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg"
            >
              <span>Open AI Workspace</span>
              <ArrowRight className="w-4 h-4" />
          </motion.div>
        </div>
      </div>


    </div>
  );
};
