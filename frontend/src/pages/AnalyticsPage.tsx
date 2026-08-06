import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { motion } from 'framer-motion';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { BarChart3, Download } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const { activeClass } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeClass) return;
    setLoading(true);
    setData(null);
    api.get(`/analytics/classes/${activeClass.id}/overview`)
      .then(res => setData(res.data))
      .finally(() => setLoading(false));
  }, [activeClass]);

  const scoreData = data ? Object.entries(data.score_distribution || {}).map(([grade, count]) => ({
    grade,
    count
  })) : [];

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-500 flex items-center justify-center">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">Class Analytics & Intelligence</h1>
            <p className="text-xs text-slate-500 mt-0.5">Performance distribution and risk diagnostics</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 animate-pulse">
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-32 mb-4" />
            <div className="h-64 bg-slate-100 dark:bg-slate-800/50 rounded-xl" />
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 animate-pulse">
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-40 mb-4" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-24 bg-slate-100 dark:bg-slate-800/50 rounded-xl" />
              <div className="h-24 bg-slate-100 dark:bg-slate-800/50 rounded-xl" />
            </div>
          </div>
        </div>
      ) : !data ? (
        <div className="bg-white dark:bg-slate-900 p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500">No analytics data available for this class.</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
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
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl"
              >
                <span className="text-xs text-slate-400 font-bold uppercase">Average Attendance</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{data.average_attendance}%</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl"
              >
                <span className="text-xs text-slate-400 font-bold uppercase">Average Assessment Score</span>
                <p className="text-2xl font-black text-adamas-blue dark:text-adamas-green mt-1">{data.average_score}/100</p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
