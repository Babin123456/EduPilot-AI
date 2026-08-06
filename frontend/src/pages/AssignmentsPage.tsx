import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { FileText, Plus } from 'lucide-react';

export const AssignmentsPage: React.FC = () => {
  const { activeClass } = useAuth();
  const [assignments, setAssignments] = useState<any[]>([]);

  useEffect(() => {
    if (!activeClass) return;
    api.get(`/assignments?class_id=${activeClass.id}`)
      .then(res => setAssignments(res.data));
  }, [activeClass]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">Assignments & Coursework</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage and AI-evaluate student submissions</p>
        </div>
        <button className="px-4 py-2 bg-adamas-blue text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow">
          <Plus className="w-4 h-4" /> New Assignment
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assignments.map((a) => (
          <div key={a.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-blue-50 text-adamas-blue rounded">
                {a.topic || 'General'}
              </span>
              <span className="text-[10px] text-slate-400 font-bold">{a.difficulty}</span>
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">{a.title}</h3>
            <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-3">
              <span>Submissions: <strong>{a.submitted_count}/{a.total_students}</strong></span>
              <span>Marks: <strong>{a.total_marks}</strong></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
