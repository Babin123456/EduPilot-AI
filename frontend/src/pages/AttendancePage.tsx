import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Check, X, AlertCircle, CheckCircle2, XCircle, Send } from 'lucide-react';


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

  // Weekend portal closure check (Saturday = 6, Sunday = 0)
  const todayDay = new Date().getDay();
  const isWeekendClosed = todayDay === 6 || todayDay === 0;

  const handleStatusChange = (studentId: string, status: string) => {
    if (isWeekendClosed) return;
    setRecords((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleBulkMark = (status: string) => {
    if (isWeekendClosed) return;
    const updated: Record<string, string> = {};
    students.forEach((s) => {
      updated[s.id] = status;
    });
    setRecords(updated);
  };

  const handleSubmit = async () => {
    if (!activeClass || isWeekendClosed) return;
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#005BAC] via-[#0A6FD8] to-[#8CC63F] p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-extrabold text-white">
            <Check className="w-3.5 h-3.5 text-[#8CC63F]" /> Live Attendance Register
          </div>
          <h1 className="text-2xl font-black">Take Batch Attendance</h1>
          <p className="text-xs text-slate-100 font-medium">
            {activeClass.course_name} ({activeClass.course_code}) • {activeClass.year_label} Sec {activeClass.section_name}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 relative z-10">
          <button
            onClick={() => handleBulkMark('present')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5 border border-emerald-400/50"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            Mark All Present
          </button>
          <button
            onClick={() => handleBulkMark('absent')}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5 border border-rose-400/50"
          >
            <XCircle className="w-4 h-4 text-rose-200" />
            Mark All Absent
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-5 py-2 bg-slate-950 hover:bg-slate-900 text-white text-xs font-black rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center gap-1.5 border border-slate-700"
          >
            <Send className="w-4 h-4 text-[#8CC63F]" />
            {saving ? 'Saving...' : 'Submit Attendance'}
          </button>
        </div>



        <div className="w-36 h-24 flex items-center justify-center hidden sm:flex flex-shrink-0 relative z-10">
          <img src="/images/attendance_tracking.png" alt="Attendance Tracking Banner" className="w-full h-auto max-h-24 object-contain drop-shadow-[0_10px_25px_rgba(0,0,0,0.4)]" />
        </div>
      </div>



      {isWeekendClosed && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700 rounded-2xl flex items-center gap-3 text-amber-800 dark:text-amber-200">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-500" />
          <div>
            <h4 className="font-extrabold text-xs">Attendance Portal Closed (Weekend Shift)</h4>
            <p className="text-[11px] opacity-90">The attendance portal is closed every weekend from Saturday 12:00 AM to Sunday 11:59 PM. Submissions will reopen on Monday morning.</p>
          </div>
        </div>
      )}

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
                      {['present', 'absent'].map((st) => (
                        <button
                          key={st}
                          onClick={() => handleStatusChange(s.id, st)}
                          className={`px-3.5 py-1 rounded-md text-[10px] font-extrabold uppercase transition-all ${
                            records[s.id] === st
                              ? st === 'present'
                                ? 'bg-emerald-500 text-white shadow'
                                : 'bg-red-500 text-white shadow'
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
