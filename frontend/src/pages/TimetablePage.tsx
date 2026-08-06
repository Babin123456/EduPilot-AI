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
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">Academic Routine & Timetable</h1>
        <p className="text-xs text-slate-500 mt-0.5">Weekly Faculty Teaching Schedule</p>
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
