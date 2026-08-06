import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const { activeClass } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeClass) return;
    setLoading(true);
    api.get(`/analytics/classes/${activeClass.id}/overview`)
      .then(res => setData(res.data))
      .finally(() => setLoading(false));
  }, [activeClass]);

  if (!data) return <div className="p-8 text-center text-xs text-slate-400">Loading Analytics...</div>;

  const scoreData = Object.entries(data.score_distribution || {}).map(([grade, count]) => ({
    grade,
    count
  }));

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">Class Analytics & Intelligence</h1>
        <p className="text-xs text-slate-500 mt-0.5">Performance distribution and risk diagnostics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-4">Grade Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="grade" stroke="#888888" fontSize={12} />
                <YAxis stroke="#888888" fontSize={12} />
                <Tooltip />
                <Bar dataKey="count" fill="#0060B5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">Class Performance Overview</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <span className="text-xs text-slate-400 font-bold uppercase">Average Attendance</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{data.average_attendance}%</p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <span className="text-xs text-slate-400 font-bold uppercase">Average Assessment Score</span>
              <p className="text-2xl font-black text-adamas-blue dark:text-adamas-green mt-1">{data.average_score}/100</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
