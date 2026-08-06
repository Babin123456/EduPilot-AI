import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Check, X, AlertCircle } from 'lucide-react';

export const AttendancePage: React.FC = () => {
  const { activeClass } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [records, setRecords] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!activeClass) return;
    setLoading(true);
    api.get(`/attendance/students/${activeClass.id}`)
      .then((res) => {
        setStudents(res.data);
        const initial: Record<string, string> = {};
        res.data.forEach((s: any) => {
          initial[s.id] = s.today_status || 'present';
        });
        setRecords(initial);
      })
      .finally(() => setLoading(false));
  }, [activeClass]);

  const handleStatusChange = (studentId: string, status: string) => {
    setRecords((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleBulkMark = (status: string) => {
    const updated: Record<string, string> = {};
    students.forEach((s) => {
      updated[s.id] = status;
    });
    setRecords(updated);
  };

  const handleSubmit = async () => {
    if (!activeClass) return;
    setSaving(true);
    setMessage('');
    try {
      const formattedRecords = Object.entries(records).map(([student_id, status]) => ({
        student_id,
        status,
      }));
      await api.post('/attendance/sessions', {
        class_id: activeClass.id,
        date: new Date().toISOString().split('T')[0],
        records: formattedRecords,
      });
      setMessage('Attendance saved successfully!');
    } catch (err: any) {
      setMessage('Failed to save attendance.');
    } finally {
      setSaving(false);
    }
  };

  if (!activeClass) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
        <h3 className="font-bold text-slate-900 dark:text-white">No Class Selected</h3>
        <p className="text-xs text-slate-500 mt-1">Please select an active class from the top header bar to take attendance.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">Take Attendance</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {activeClass.course_name} ({activeClass.course_code}) • {activeClass.year_label} Sec {activeClass.section_name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleBulkMark('present')}
            className="px-3 py-1.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold rounded-lg hover:bg-emerald-100 transition-colors"
          >
            Mark All Present
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-4 py-2 bg-adamas-blue text-white text-xs font-bold rounded-lg shadow hover:bg-adamas-blue-dark transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Submit Attendance'}
          </button>
        </div>
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-lg border border-emerald-200 dark:border-emerald-800">
          {message}
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-bold uppercase border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-3">Roll No</th>
                <th className="px-6 py-3">Student Name</th>
                <th className="px-6 py-3">Overall Attendance</th>
                <th className="px-6 py-3">Risk Signal</th>
                <th className="px-6 py-3 text-right">Today's Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {students.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                  <td className="px-6 py-3.5 font-mono font-semibold text-slate-700 dark:text-slate-300">
                    {s.roll_number}
                  </td>
                  <td className="px-6 py-3.5 font-bold text-slate-900 dark:text-white">
                    {s.full_name}
                  </td>
                  <td className="px-6 py-3.5">
                    <span className={`font-bold ${s.attendance_percentage < 75 ? 'text-red-500' : 'text-slate-700 dark:text-slate-300'}`}>
                      {s.attendance_percentage}%
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    {s.risk_level === 'high' || s.risk_level === 'medium' ? (
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400 text-[10px] font-bold rounded">
                        Below 75%
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">Normal</span>
                    )}
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <div className="inline-flex rounded-lg p-0.5 bg-slate-100 dark:bg-slate-800">
                      {['present', 'absent', 'late'].map((st) => (
                        <button
                          key={st}
                          onClick={() => handleStatusChange(s.id, st)}
                          className={`px-3 py-1 rounded-md text-[10px] font-extrabold uppercase transition-all ${
                            records[s.id] === st
                              ? st === 'present'
                                ? 'bg-emerald-500 text-white shadow'
                                : st === 'absent'
                                ? 'bg-red-500 text-white shadow'
                                : 'bg-amber-500 text-white shadow'
                              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
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
