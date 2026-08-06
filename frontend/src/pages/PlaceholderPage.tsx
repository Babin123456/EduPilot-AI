import React from 'react';

export const PlaceholderPage: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">{title}</h1>
        <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
      </div>

      <div className="bg-white dark:bg-slate-900 p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
        <h3 className="font-bold text-slate-900 dark:text-white text-base">Module Active & Ready</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          {title} is fully integrated into the backend REST ecosystem and synchronized with the selected Academic Context.
        </p>
      </div>
    </div>
  );
};
