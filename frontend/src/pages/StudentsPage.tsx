import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

export const StudentsPage: React.FC = () => {
  const { activeClass } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/students', {
      params: {
        class_id: activeClass?.id,
        search: search || undefined
      }
    })
      .then(res => setStudents(res.data.students || []))
      .finally(() => setLoading(false));
  }, [activeClass, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">Student Directory</h1>
          <p className="text-xs text-slate-500 mt-0.5">360-Degree Academic Roster & Performance Track</p>
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, roll, email..."
          className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-adamas-blue w-64"
        />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-bold uppercase border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-3">Roll No</th>
                <th className="px-6 py-3">Student Name</th>
                <th className="px-6 py-3">Year / Sec</th>
                <th className="px-6 py-3">Attendance</th>
                <th className="px-6 py-3">Average Score</th>
                <th className="px-6 py-3">CGPA</th>
                <th className="px-6 py-3">Risk Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {students.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                  <td className="px-6 py-3.5 font-mono font-semibold text-slate-700 dark:text-slate-300">{s.roll_number}</td>
                  <td className="px-6 py-3.5 font-bold text-slate-900 dark:text-white">{s.full_name}</td>
                  <td className="px-6 py-3.5 text-slate-500">{s.year_label} - Sec {s.section_name}</td>
                  <td className="px-6 py-3.5 font-semibold">{s.attendance_percentage}%</td>
                  <td className="px-6 py-3.5 font-semibold">{s.average_score}</td>
                  <td className="px-6 py-3.5 font-bold text-adamas-blue dark:text-adamas-green">{s.cgpa || 'N/A'}</td>
                  <td className="px-6 py-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                      s.risk_level === 'high' ? 'bg-red-100 text-red-700' :
                      s.risk_level === 'medium' ? 'bg-amber-100 text-amber-700' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      {s.risk_level}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
