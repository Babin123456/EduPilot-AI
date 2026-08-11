import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useTheme } from '../context/ThemeContext';

interface EduPilotLoaderProps {
  onComplete?: () => void;
  minDurationMs?: number;
}

export const EduPilotLoader: React.FC<EduPilotLoaderProps> = ({
  onComplete,
  minDurationMs = 1800,
}) => {
  const { theme } = useTheme();
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Initializing Neural Core...');
  const [isFinished, setIsFinished] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const duration = prefersReducedMotion ? 400 : minDurationMs;
    const intervalTime = 30;
    const totalSteps = duration / intervalTime;
    let step = 0;

    const stages = [
      { threshold: 25, text: 'Initializing Neural Core...' },
      { threshold: 55, text: 'Loading Academic Workspace...' },
      { threshold: 85, text: 'Synchronizing Academic Modules...' },
      { threshold: 100, text: 'EduPilot AI Ready' },
    ];

    const timer = setInterval(() => {
      step++;
      const calculatedProgress = Math.min(100, Math.round((step / totalSteps) * 100));
      setProgress(calculatedProgress);

      const currentStage = stages.find((s) => calculatedProgress <= s.threshold);
      if (currentStage) {
        setStatusText(currentStage.text);
      }

      if (step >= totalSteps) {
        clearInterval(timer);
        if (prefersReducedMotion) {
          setIsFinished(true);
          if (onComplete) onComplete();
        } else {
          const ctx = gsap.context(() => {
            const tl = gsap.timeline({
              onComplete: () => {
                setIsFinished(true);
                if (onComplete) onComplete();
              },
            });

            tl.to(logoRef.current, {
              scale: 1.12,
              opacity: 0,
              duration: 0.35,
              ease: 'power3.in',
            }).to(
              containerRef.current,
              {
                yPercent: -100,
                duration: 0.65,
                ease: 'power4.inOut',
              },
              '-=0.1'
            );
          }, containerRef);
          return () => ctx.revert();
        }
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [minDurationMs, onComplete]);

  if (isFinished) return null;

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-colors duration-300 overflow-hidden select-none ${
        theme === 'dark'
          ? 'bg-[#050D1A] text-white'
          : 'bg-slate-50 text-slate-900'
      }`}
      role="dialog"
      aria-label="EduPilot Loading Screen"
      aria-busy={!isFinished}
    >
      {/* Ambient Radial Background Glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full blur-[120px] animate-pulse ${
            theme === 'dark'
              ? 'bg-gradient-to-tr from-[#005BAC]/30 to-[#8CC63F]/20'
              : 'bg-gradient-to-tr from-[#005BAC]/15 to-[#8CC63F]/15'
          }`}
        />
        <div
          className={`absolute inset-0 bg-[radial-gradient(#80808015_1px,transparent_1px)] [background-size:32px_32px] ${
            theme === 'dark' ? 'opacity-40' : 'opacity-60'
          }`}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-sm w-full px-6 text-center">
        {/* Brand Logo Container with Glowing Rings */}
        <div ref={logoRef} className="relative mb-8 flex items-center justify-center">
          {/* Animated orbital borders */}
          <div
            className={`absolute w-28 h-28 rounded-full border animate-[spin_8s_linear_infinite] ${
              theme === 'dark' ? 'border-[#005BAC]/40' : 'border-[#005BAC]/30'
            }`}
          />
          <div
            className={`absolute w-36 h-36 rounded-full border border-dashed animate-[spin_16s_linear_infinite_reverse] ${
              theme === 'dark' ? 'border-[#8CC63F]/30' : 'border-[#8CC63F]/40'
            }`}
          />

          {/* Official Brand Logo Image without background container */}
          <div className="w-20 h-20 flex items-center justify-center relative">
            <img
              src="/brand_logo.png"
              alt="EduPilot AI Official Brand Logo"
              className="w-16 h-16 object-contain drop-shadow-[0_10px_25px_rgba(0,91,172,0.35)] animate-[pulse_3s_easeInOut_infinite]"
            />
          </div>
        </div>

        {/* Brand Title */}
        <h1
          className={`text-2xl font-extrabold tracking-wider mb-1 ${
            theme === 'dark' ? 'text-white' : 'text-slate-900'
          }`}
        >
          EduPilot <span className="text-[#8CC63F]">AI</span>
        </h1>
        <p
          className={`text-xs uppercase tracking-[0.25em] font-semibold mb-8 ${
            theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
          }`}
        >
          Academic OS
        </p>

        {/* Progress Bar Container */}
        <div
          className={`w-full p-1 rounded-full border shadow-inner relative overflow-hidden mb-3 ${
            theme === 'dark'
              ? 'bg-slate-900/90 border-slate-800'
              : 'bg-slate-200/80 border-slate-300'
          }`}
        >
          <div
            className="h-2 rounded-full bg-gradient-to-r from-[#005BAC] via-[#0A6FD8] to-[#8CC63F] transition-all duration-75 ease-out relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-0 bottom-0 w-3 bg-white/70 blur-[2px] rounded-full" />
          </div>
        </div>

        {/* Progress Status & Percentage */}
        <div
          className={`w-full flex items-center justify-between text-xs font-mono ${
            theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
          }`}
        >
          <span className="truncate pr-2 font-medium">{statusText}</span>
          <span className="font-bold text-[#005BAC] dark:text-[#8CC63F]">{progress}%</span>
        </div>
      </div>
    </div>
  );
};

export default EduPilotLoader;
