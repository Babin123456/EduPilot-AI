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
      <div className="bg-gradient-to-r from-[#005BAC] via-[#0A6FD8] to-[#8CC63F] p-6 sm:p-8 rounded-3xl text-white shadow-xl flex items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-extrabold text-white">
            <FileText className="w-3.5 h-3.5 text-[#8CC63F]" /> Assessment & Submissions Hub
          </div>
          <h1 className="text-2xl font-black">Assignments & Coursework Manager</h1>
          <p className="text-xs text-slate-100 font-medium">Manage, auto-grade, and distribute AI-evaluated student homework submissions.</p>
        </div>
        <div className="w-36 h-24 flex items-center justify-center hidden sm:flex flex-shrink-0 relative z-10">
          <img src="/images/document_studio.png" alt="Assignments Banner" className="w-full h-auto max-h-24 object-contain drop-shadow-[0_10px_25px_rgba(0,0,0,0.4)]" />
        </div>
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
