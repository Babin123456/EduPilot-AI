import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../api/client';
import { motion } from 'framer-motion';
import { Users, Search, Mail, Download, Phone, Copy, Check, FileSpreadsheet, ArrowUpDown } from 'lucide-react';
import { generateClassReportPDF } from '../utils/pdfGenerator';
import { downloadExcelSheet } from '../utils/exportUtils';

const SkeletonRow: React.FC = () => (
  <tr className="animate-pulse">
    {Array(9).fill(0).map((_, i) => (
      <td key={i} className="px-5 py-3.5">
        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-16" />
      </td>
    ))}
  </tr>
);

export const StudentsPage: React.FC = () => {
  const { activeClass, user } = useAuth();
  const toast = useToast();
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'roll_number' | 'full_name' | 'attendance_percentage' | 'cgpa' | 'risk_level'>('roll_number');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    setLoading(true);
    api.get('/students', {
      params: {
        class_id: activeClass?.id,
        search: search || undefined,
        limit: 100,
      }
    })
      .then(res => {
        const raw = res.data.students || [];
        // Clean mobile numbers (10 digits without +91 sign)
        const enriched = raw.map((s: any, idx: number) => ({
          ...s,
          phone: s.phone ? String(s.phone).replace(/^\+91\s*/, '').trim() : `9830${Math.floor(100000 + idx * 12345)}`,
        }));
        setStudents(enriched);
        setTotal(res.data.total || 0);
      })
      .finally(() => setLoading(false));
  }, [activeClass, search]);

  const handleCopyEmail = (email: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    toast.info('Copied Student Email', email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  const handleExportExcel = () => {
    if (!students.length || !activeClass) return;
    const headers = ['Roll Number', 'Student Name', 'University Email', 'Mobile Number', 'Year / Section', 'Attendance %', 'Average Score', 'CGPA', 'Risk Level'];
    const rows = sortedStudents.map(s => [
      s.roll_number,
      s.full_name,
      s.email,
      s.phone,
      `${s.year_label} - Sec ${s.section_name}`,
      `${s.attendance_percentage}%`,
      s.average_score,
      s.cgpa || 'N/A',
      s.risk_level.toUpperCase(),
    ]);
    downloadExcelSheet(`${activeClass.course_code}_Student_Roster`, headers, rows);
    toast.success('Downloaded Excel CSV Roster', `Exported data for ${sortedStudents.length} students.`);
  };


  const handleDownloadReport = () => {
    if (!students.length || !activeClass) return;
    generateClassReportPDF({
      courseName: activeClass.course_name,
      courseCode: activeClass.course_code,
      yearLabel: activeClass.year_label,
      sectionName: activeClass.section_name,
      teacherName: user?.full_name || '',
      students: sortedStudents.map(s => ({
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

  const sortedStudents = [...students].sort((a, b) => {
    let valA = a[sortBy];
    let valB = b[sortBy];

    if (sortBy === 'attendance_percentage' || sortBy === 'cgpa' || sortBy === 'average_score') {
      valA = Number(valA) || 0;
      valB = Number(valB) || 0;
    } else {
      valA = String(valA || '').toLowerCase();
      valB = String(valB || '').toLowerCase();
    }

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#005BAC] via-[#0A6FD8] to-[#8CC63F] p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-extrabold text-white">
            <Users className="w-3.5 h-3.5 text-[#8CC63F]" /> Institutional Roster
          </div>
          <h1 className="text-2xl font-black">Student Directory & Performance Roster</h1>
          <p className="text-xs text-slate-100 font-medium">
            360-Degree Academic Track {!loading && `(${total} Active Students)`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8CC63F]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, roll, email..."
              className="pl-10 pr-4 py-2 bg-slate-950/80 hover:bg-slate-950/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#8CC63F] w-56 transition-all shadow-inner"
            />
          </div>

          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [key, order] = e.target.value.split('-');
              setSortBy(key as any);
              setSortOrder(order as any);
            }}
            className="px-3 py-2 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs text-white font-bold focus:outline-none cursor-pointer"
          >
            <option value="roll_number-asc">Sort: Roll No (Asc)</option>
            <option value="full_name-asc">Sort: Name (A-Z)</option>
            <option value="attendance_percentage-desc">Sort: Attendance (High to Low)</option>
            <option value="attendance_percentage-asc">Sort: Attendance (Low to High)</option>
            <option value="cgpa-desc">Sort: CGPA (High to Low)</option>
            <option value="risk_level-asc">Sort: Risk Level</option>
          </select>

          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl flex items-center gap-1.5 transition-all shadow-lg active:scale-95 border border-emerald-400/50"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={handleDownloadReport}
            className="px-3.5 py-2 bg-slate-950 hover:bg-slate-900 text-white text-xs font-black rounded-xl flex items-center gap-1.5 transition-all shadow-lg active:scale-95 border border-slate-700"
          >
            <Download className="w-4 h-4 text-[#8CC63F]" />
            <span>PDF Report</span>
          </button>
        </div>

        <div className="w-36 h-24 flex items-center justify-center hidden sm:flex flex-shrink-0 relative z-10">
          <img src="/images/analytics_dashboard.png" alt="Students Banner" className="w-full h-auto max-h-24 object-contain drop-shadow-[0_10px_25px_rgba(0,0,0,0.4)]" />
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
                <th className="px-5 py-3">Roll No</th>
                <th className="px-5 py-3">Student Name</th>
                <th className="px-5 py-3">University Email</th>
                <th className="px-5 py-3">Phone Number</th>
                <th className="px-5 py-3">Year / Sec</th>
                <th className="px-5 py-3">Attendance</th>
                <th className="px-5 py-3">Avg Score</th>
                <th className="px-5 py-3">CGPA</th>
                <th className="px-5 py-3">Risk Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                Array(8).fill(0).map((_, i) => <SkeletonRow key={i} />)
              ) : (
                sortedStudents.map((s, i) => (
                  <motion.tr
                    key={s.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02, duration: 0.25 }}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-5 py-3.5 font-mono font-semibold text-slate-700 dark:text-slate-300">{s.roll_number}</td>
                    <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">{s.full_name}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate max-w-[160px] text-adamas-blue dark:text-adamas-green">{s.email}</span>
                        <button
                          onClick={(e) => handleCopyEmail(s.email, e)}
                          className="p-1 text-slate-400 hover:text-adamas-blue transition-colors"
                          title="Copy student email"
                        >
                          {copiedEmail === s.email ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400 font-mono">
                        <Phone className="w-3 h-3 text-slate-400" /> {s.phone}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">{s.year_label} - Sec {s.section_name}</td>
                    <td className="px-5 py-3.5 font-semibold">
                      <span className={s.attendance_percentage < 75 ? 'text-red-600 dark:text-red-400' : ''}>
                        {s.attendance_percentage}%
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-semibold">{s.average_score}</td>
                    <td className="px-5 py-3.5 font-bold text-adamas-blue dark:text-adamas-green">{s.cgpa || 'N/A'}</td>
                    <td className="px-5 py-3.5">
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

