import React from 'react';

interface SkeletonPageLoaderProps {
  count?: number;
}

export const SkeletonPageLoader: React.FC<SkeletonPageLoaderProps> = ({ count = 6 }) => {
  return (
    <div className="w-full space-y-6 animate-pulse p-1">
      {/* Header Skeleton Banner */}
      <div className="h-28 w-full bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-800 dark:via-slate-800/60 dark:to-slate-800 rounded-3xl" />

      {/* Control Bar Skeleton */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="h-10 w-64 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="flex gap-2">
          <div className="h-10 w-32 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-10 w-36 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>
      </div>

      {/* Grid Skeleton Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded-md" />
              <div className="h-4 w-12 bg-slate-200 dark:bg-slate-800 rounded-md" />
            </div>
            <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-lg" />
            <div className="space-y-2 pt-2">
              <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-3 w-5/6 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div className="h-8 w-24 bg-slate-200 dark:bg-slate-800 rounded-xl" />
              <div className="h-8 w-28 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
