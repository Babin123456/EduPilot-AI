import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api, cachedGet } from '../api/client';
import { Check, AlertCircle, CheckCircle2, XCircle, Send, Edit3, Clock, Lock } from 'lucide-react';
import { SkeletonPageLoader } from '../components/SkeletonPageLoader';

export const AttendancePage: React.FC = () => {
  const { activeClass } = useAuth();
  const toast = useToast();
  const [students, setStudents] = useState<any[]>([]);
  const [records, setRecords] = useState<Record<string, string>>({});
  const [todayClasses, setTodayClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!activeClass) return;
    setLoading(true);
    setIsSubmitted(false);
    setIsEditing(false);
    setStudents([]);
    setRecords({});

    Promise.all([
      cachedGet(`/attendance/students/${activeClass.id}`),
      cachedGet('/timetable/today').catch(() => ({ data: [] })),
    ])
      .then(([studentsRes, timetableRes]) => {
        const studentList = studentsRes.data || [];
        setStudents(studentList);
        const initial: Record<string, string> = {};
        let hasSavedRecords = false;
        studentList.forEach((s: any) => {
          initial[s.id] = s.today_status || 'present';
          if (s.today_status) hasSavedRecords = true;
        });
        setRecords(initial);
        if (hasSavedRecords) setIsSubmitted(true);

        setTodayClasses(timetableRes.data || []);
      })
      .finally(() => setLoading(false));
  }, [activeClass?.id]);

  const todayDay = currentTime.getDay();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDayName = dayNames[todayDay];
  const isWeekendClosed = todayDay === 6 || todayDay === 0;

  // Find if active class has a session scheduled for today
  const activeClassTodaySession = todayClasses.find(
    (c: any) => c.class_id === activeClass?.id || c.teacher_course_assignment_id === activeClass?.id
  );

  // If teacher has NO classes scheduled for today AT ALL or for this active class
  const hasNoClassToday = isWeekendClosed || (todayClasses.length === 0 && !loading);

  // Time-based attendance opening check (e.g. 9 AM onwards check)
  let startTimeLabel = '09:00 AM';
  let isBeforeClassStart = false;

  if (activeClassTodaySession && activeClassTodaySession.start_time) {
    const parts = activeClassTodaySession.start_time.split(':');
    const sHour = parseInt(parts[0], 10);
    const sMin = parseInt(parts[1] || '0', 10);

    const nowMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    const classStartMinutes = sHour * 60 + sMin;

    const formattedHour = sHour % 12 || 12;
    const ampm = sHour >= 12 ? 'PM' : 'AM';
    startTimeLabel = `${formattedHour.toString().padStart(2, '0')}:${sMin.toString().padStart(2, '0')} ${ampm}`;

    if (nowMinutes < classStartMinutes) {
      isBeforeClassStart = true;
    }
  } else if (!isWeekendClosed && todayClasses.length > 0) {
    // Default 9 AM check if timetable slot time is 09:00 AM
    const nowMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    if (nowMinutes < 9 * 60) {
      isBeforeClassStart = true;
      startTimeLabel = '09:00 AM';
    }
  }

  const isPortalDisabled = hasNoClassToday || isBeforeClassStart;

  const handleStatusChange = (studentId: string, status: string) => {
    if (isPortalDisabled || (isSubmitted && !isEditing)) return;
    setRecords((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleBulkMark = (status: string) => {
    if (isPortalDisabled || (isSubmitted && !isEditing)) return;
    const updated: Record<string, string> = {};
    students.forEach((s) => {
      updated[s.id] = status;
    });
    setRecords(updated);
  };

  const handleSubmit = async () => {
    if (!activeClass || isPortalDisabled) return;
    setSaving(true);

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
      setIsSubmitted(true);
      setIsEditing(false);
      toast.success(
        'Attendance Submitted to Portal!',
        `Today's register for ${activeClass.course_name} (${activeClass.year_label} Sec ${activeClass.section_name}) has been dispatched to the university portal.`
      );
    } catch (err: any) {
      toast.error('Submission Failed', 'Failed to transmit attendance records to the portal. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <SkeletonPageLoader count={6} />;
  }

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
            disabled={isPortalDisabled || (isSubmitted && !isEditing)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5 border border-emerald-400/50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            Mark All Present
          </button>
          <button
            onClick={() => handleBulkMark('absent')}
            disabled={isPortalDisabled || (isSubmitted && !isEditing)}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5 border border-rose-400/50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <XCircle className="w-4 h-4 text-rose-200" />
            Mark All Absent
          </button>

          {isSubmitted && !isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              disabled={isPortalDisabled}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 border border-amber-300"
            >
              <Edit3 className="w-4 h-4" />
              Edit Submitted Entry
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={saving || isPortalDisabled}
              className="px-5 py-2 bg-[#005BAC] hover:bg-[#0A6FD8] text-white text-xs font-black rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 border border-blue-400/40"
            >
              <Send className="w-4 h-4 text-[#8CC63F]" />
              {saving ? 'Transmitting...' : isEditing ? 'Update & Re-submit' : 'Submit Attendance'}
            </button>
          )}
        </div>

        <div className="w-36 h-24 hidden sm:flex items-center justify-center flex-shrink-0 relative z-10">
          <img src="/images/attendance_tracking.webp" alt="Attendance Tracking Banner" className="w-full h-auto max-h-24 object-contain drop-shadow-[0_10px_25px_rgba(0,0,0,0.4)]" />
        </div>
      </div>

      {/* 🔒 STATEMENT 1: Teacher Has No Class Scheduled For Today */}
      {hasNoClassToday && (
        <div className="p-5 bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-800 rounded-2xl flex items-start gap-3.5 text-rose-900 dark:text-rose-200 shadow-sm">
          <Lock className="w-6 h-6 flex-shrink-0 text-rose-500 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-extrabold text-sm">Attendance Portal Disabled for Today ({currentDayName})</h4>
            <p className="text-xs text-rose-800 dark:text-rose-300 leading-relaxed font-medium">
              No classes are scheduled for you on {currentDayName}. The attendance portal is not accessible on days when you do not have any active lecture or lab sessions assigned to your timetable.
            </p>
          </div>
        </div>
      )}

      {/* ⏰ STATEMENT 2: Attendance Opens at Start Time Onwards (e.g. 09:00 AM) */}
      {!hasNoClassToday && isBeforeClassStart && (
        <div className="p-5 bg-amber-50 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-700/80 rounded-2xl flex items-start gap-3.5 text-amber-900 dark:text-amber-200 shadow-sm">
          <Clock className="w-6 h-6 flex-shrink-0 text-amber-500 mt-0.5 animate-pulse" />
          <div className="space-y-1">
            <h4 className="font-extrabold text-sm">Attendance Portal Opens at {startTimeLabel}</h4>
            <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed font-medium">
              Your class lecture for {activeClass.course_name} is scheduled starting from <strong>{startTimeLabel} onwards today</strong>. The attendance register options will unlock automatically at {startTimeLabel} based on current system time.
            </p>
          </div>
        </div>
      )}

      {isSubmitted && !isEditing && !isPortalDisabled && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-700/80 rounded-2xl flex items-center justify-between gap-3 text-emerald-900 dark:text-emerald-200 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span>Attendance for today has been submitted to the portal. You can click <strong>"Edit Submitted Entry"</strong> anytime until <strong>11:59 PM today</strong> if you need to correct student records.</span>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-extrabold flex items-center gap-1 shadow-sm transition-all"
          >
            <Edit3 className="w-3 h-3" /> Edit
          </button>
        </div>
      )}

      {isSubmitted && isEditing && !isPortalDisabled && (
        <div className="p-3.5 bg-amber-50 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-700/80 rounded-2xl flex items-center justify-between gap-3 text-amber-900 dark:text-amber-200 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <span><strong>Same-Day Edit Mode Active (Available until 11:59 PM):</strong> Modify any student's present/absent status and click <strong>"Update & Re-submit"</strong> to sync with the portal.</span>
          </div>
          <button
            onClick={() => setIsEditing(false)}
            className="px-3 py-1 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200 rounded-lg text-[11px] font-bold transition-all"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Student Register Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase text-slate-700 dark:text-slate-200 tracking-wider">
            Enrolled Student Register ({students.length})
          </span>
          <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
            <span className="text-emerald-600 dark:text-emerald-400">Present: {Object.values(records).filter((s) => s === 'present').length}</span>
            <span className="text-rose-600 dark:text-rose-400">Absent: {Object.values(records).filter((s) => s === 'absent').length}</span>
            <span className="text-amber-600 dark:text-amber-400">Late: {Object.values(records).filter((s) => s === 'late').length}</span>
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {students.map((student) => {
            const currentStatus = records[student.id] || 'present';
            return (
              <div key={student.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#005BAC]/10 text-[#005BAC] dark:bg-[#8CC63F]/20 dark:text-[#8CC63F] font-black text-xs flex items-center justify-center flex-shrink-0">
                    {student.roll_number || student.registration_number?.slice(-3)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                      {student.first_name} {student.last_name}
                    </h4>
                    <p className="text-xs text-slate-500">Reg: {student.registration_number} • Roll: {student.roll_number}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStatusChange(student.id, 'present')}
                    disabled={isPortalDisabled || (isSubmitted && !isEditing)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all border disabled:opacity-40 disabled:cursor-not-allowed ${
                      currentStatus === 'present'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-500'
                    }`}
                  >
                    Present
                  </button>
                  <button
                    onClick={() => handleStatusChange(student.id, 'absent')}
                    disabled={isPortalDisabled || (isSubmitted && !isEditing)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all border disabled:opacity-40 disabled:cursor-not-allowed ${
                      currentStatus === 'absent'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-rose-500'
                    }`}
                  >
                    Absent
                  </button>
                  <button
                    onClick={() => handleStatusChange(student.id, 'late')}
                    disabled={isPortalDisabled || (isSubmitted && !isEditing)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all border disabled:opacity-40 disabled:cursor-not-allowed ${
                      currentStatus === 'late'
                        ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-500'
                    }`}
                  >
                    Late
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
