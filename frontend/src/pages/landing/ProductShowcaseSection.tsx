import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CheckSquare, BarChart3, Bot, Sparkles, AlertTriangle, ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export const ProductShowcaseSection: React.FC = () => {
  const showcaseRef = useRef<HTMLElement>(null);
  const mockupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showcaseRef.current) return;
    const ctx = gsap.context(() => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) return;

      // Full screen scale reveal of Product Dashboard Mockup
      gsap.fromTo(
        mockupRef.current,
        { scale: 0.75, y: 60, opacity: 0.8 },
        {
          scale: 1,
          y: 0,
          opacity: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: showcaseRef.current,
            start: 'top bottom',
            end: 'center center',
            scrub: 1,
          },
        }
      );
    }, showcaseRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="product-showcase"
      ref={showcaseRef}
      className="relative py-28 bg-[#071426] text-white overflow-hidden"
    >
      {/* Background Orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 right-10 w-[500px] h-[500px] rounded-full bg-[#005BAC]/20 blur-3xl animate-glow" />
        <div className="absolute bottom-10 left-10 w-[450px] h-[450px] rounded-full bg-[#8CC63F]/15 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#8CC63F]/20 text-[#8CC63F] text-xs font-extrabold uppercase tracking-wider border border-[#8CC63F]/30">
            <Sparkles className="w-4 h-4" /> Live Operational Dashboard
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Built For Real Classrooms. <br />
            <span className="text-gradient">Engineered For Adamas Faculty.</span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Every feature is contextualized to your active course, year, and section — eliminating setup friction.
          </p>
        </div>

        {/* Scalable Live Dashboard Mockup Window */}
        <div
          ref={mockupRef}
          className="rounded-3xl glass-card border border-slate-700/70 p-4 sm:p-6 shadow-2xl bg-slate-900/90 transition-transform duration-300"
        >
          {/* Header Controls */}
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-xs font-bold text-slate-300 ml-2">
                Teacher Command Center — Active Context: B.Tech CSE (3rd Year Sec B)
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#8CC63F]">
              <span className="w-2 h-2 rounded-full bg-[#8CC63F] animate-pulse" />
              RAG Engine Connected
            </div>
          </div>

          {/* Dashboard Visual Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Metric 1 */}
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
                <span>Today's Classes</span>
                <CheckSquare className="w-4 h-4 text-[#005BAC]" />
              </div>
              <p className="text-3xl font-black text-white">3 Sessions</p>
              <p className="text-[11px] text-slate-400">CS-301 Operating Systems (Sec B)</p>
            </div>

            {/* Metric 2 */}
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
                <span>Avg Attendance Velocity</span>
                <BarChart3 className="w-4 h-4 text-[#8CC63F]" />
              </div>
              <p className="text-3xl font-black text-[#8CC63F]">92.4%</p>
              <p className="text-[11px] text-slate-400">+2.1% higher than department avg</p>
            </div>

            {/* Metric 3 */}
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
                <span>At-Risk Student Alerts</span>
                <AlertTriangle className="w-4 h-4 text-red-400" />
              </div>
              <p className="text-3xl font-black text-red-400">4 Students</p>
              <p className="text-[11px] text-slate-400">Attendance below 75% threshold</p>
            </div>

          </div>

          {/* Interactive Chat Prompt Preview */}
          <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-[#005BAC]/15 to-[#8CC63F]/15 border border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#8CC63F]/20 text-[#8CC63F] flex items-center justify-center font-bold">
                <Bot className="w-5 h-5" />
              </div>
              <p className="text-xs text-slate-200 font-medium">
                <strong className="text-white font-bold">EduPilot AI:</strong> "Generated 10-question quiz on Process Synchronization with PDF answer key."
              </p>
            </div>
            <button className="btn-magnetic px-4 py-2 rounded-xl bg-[#005BAC] text-white text-xs font-bold flex items-center gap-2 whitespace-nowrap">
              <span>View Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>
    </section>
  );
};
