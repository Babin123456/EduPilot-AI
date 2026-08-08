import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { motion } from 'framer-motion';
import { Users, Search, Mail, Download } from 'lucide-react';
import { generateClassReportPDF } from '../utils/pdfGenerator';

const SkeletonRow: React.FC = () => (
  <tr className="animate-pulse">
    {Array(8).fill(0).map((_, i) => (
      <td key={i} className="px-6 py-3.5">
        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-16" />
      </td>
    ))}
  </tr>
);

export const StudentsPage: React.FC = () => {
  const { activeClass, user } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setLoading(true);
    api.get('/students', {
      params: {
        class_id: activeClass?.id,
        search: search || undefined
      }
    })
      .then(res => {
        setStudents(res.data.students || []);
        setTotal(res.data.total || 0);
      })
      .finally(() => setLoading(false));
  }, [activeClass, search]);

  const handleDownloadReport = () => {
    if (!students.length || !activeClass) return;
    generateClassReportPDF({
      courseName: activeClass.course_name,
      courseCode: activeClass.course_code,
      yearLabel: activeClass.year_label,
      sectionName: activeClass.section_name,
      teacherName: user?.full_name || '',
      students: students.map(s => ({
        rollNumber: s.roll_number,
        name: s.full_name,
        email: s.email,
        attendance: s.attendance_percentage,
        avgScore: s.average_score,
        cgpa: s.cgpa,
        riskLevel: s.risk_level,
      })),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#005BAC] via-[#0A6FD8] to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-extrabold text-[#8CC63F]">
            <Users className="w-3.5 h-3.5" /> Institutional Roster
          </div>
          <h1 className="text-2xl font-black">Student Directory & Performance Roster</h1>
          <p className="text-xs text-slate-200">
            360-Degree Academic Track {!loading && `(${total} Active Students)`}
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, roll, email..."
              className="pl-9 pr-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-xs text-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-[#8CC63F] w-64"
            />
          </div>
          <button
            onClick={handleDownloadReport}
            className="px-4 py-2 bg-[#8CC63F] text-slate-950 text-xs font-extrabold rounded-xl flex items-center gap-1.5 hover:bg-[#6FAF2E] transition-colors shadow-md"
          >
            <Download className="w-4 h-4" /> PDF Report
          </button>
        </div>

        <div className="w-32 h-20 rounded-xl overflow-hidden border border-white/20 bg-slate-950/80 p-1 hidden sm:block flex-shrink-0 relative z-10">
          <img src="/images/analytics_dashboard.png" alt="Students Banner" className="w-full h-full object-contain bg-slate-950 rounded-lg" />
        </div>
      </div>


      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-bold uppercase border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-3">Roll No</th>
                <th className="px-6 py-3">Student Name</th>
                <th className="px-6 py-3">University Email</th>
                <th className="px-6 py-3">Year / Sec</th>
                <th className="px-6 py-3">Attendance</th>
                <th className="px-6 py-3">Average Score</th>
                <th className="px-6 py-3">CGPA</th>
                <th className="px-6 py-3">Risk Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                Array(8).fill(0).map((_, i) => <SkeletonRow key={i} />)
              ) : (
                students.map((s, i) => (
                  <motion.tr
                    key={s.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02, duration: 0.25 }}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-6 py-3.5 font-mono font-semibold text-slate-700 dark:text-slate-300">{s.roll_number}</td>
                    <td className="px-6 py-3.5 font-bold text-slate-900 dark:text-white">{s.full_name}</td>
                    <td className="px-6 py-3.5">
                      <span className="flex items-center gap-1 text-adamas-blue dark:text-adamas-green">
                        <Mail className="w-3 h-3" />
                        <span className="truncate max-w-[180px]">{s.email}</span>
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-slate-500">{s.year_label} - Sec {s.section_name}</td>
                    <td className="px-6 py-3.5 font-semibold">
                      <span className={s.attendance_percentage < 75 ? 'text-red-600 dark:text-red-400' : ''}>
                        {s.attendance_percentage}%
                      </span>
                    </td>
                    <td className="px-6 py-3.5 font-semibold">{s.average_score}</td>
                    <td className="px-6 py-3.5 font-bold text-adamas-blue dark:text-adamas-green">{s.cgpa || 'N/A'}</td>
                    <td className="px-6 py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        s.risk_level === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400' :
                        s.risk_level === 'medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400' :
                        s.risk_level === 'low' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400' :
                        'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                      }`}>
                        {s.risk_level}
                      </span>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};
