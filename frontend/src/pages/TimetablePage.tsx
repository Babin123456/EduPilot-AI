import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Clock, MapPin } from 'lucide-react';

export const TimetablePage: React.FC = () => {
  const [week, setWeek] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/timetable/week')
      .then(res => setWeek(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#005BAC] via-[#0A6FD8] to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl flex items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-extrabold text-[#8CC63F]">
            <Clock className="w-3.5 h-3.5" /> Weekly Teaching Schedule
          </div>
          <h1 className="text-2xl font-black">Academic Routine & Timetable</h1>
          <p className="text-xs text-slate-200">View upcoming lectures, lab sessions, and classroom assignments across all sections.</p>
        </div>
        <div className="w-32 h-20 rounded-xl overflow-hidden border border-white/20 bg-slate-950/80 p-1 hidden sm:block flex-shrink-0">
          <img src="/images/hero_illustration.png" alt="Timetable Banner" className="w-full h-full object-contain bg-slate-950 rounded-lg" />
        </div>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(week).map(([day, slots]) => (
          <div key={day} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-sm border-b border-slate-100 dark:border-slate-800 pb-2">
              {day}
            </h3>
            {slots.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No scheduled lectures</p>
            ) : (
              slots.map((s) => (
                <div key={s.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-adamas-blue dark:text-adamas-green flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {s.start_time} - {s.end_time}
                    </span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded">
                      {s.slot_type}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">{s.course_name} ({s.course_code})</h4>
                  <p className="text-[10px] text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" /> {s.year_label} • Sec {s.section_name} • Room: {s.room}
                  </p>
                </div>
              ))
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
