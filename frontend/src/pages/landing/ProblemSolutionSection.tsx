import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AlertCircle, ArrowDown, Sparkles, Layers, RefreshCw } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export const ProblemSolutionSection: React.FC = () => {
  const containerRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '+=180%',
          pin: true,
          scrub: 1,
        },
      });

      // Step 1: Fragmented tools scatter outwards in chaos
      tl.to('.fragmented-card-1', { x: -140, y: -60, rotate: -12, duration: 1 })
        .to('.fragmented-card-2', { x: 140, y: -80, rotate: 14, duration: 1 }, '<')
        .to('.fragmented-card-3', { x: -180, y: 70, rotate: -8, duration: 1 }, '<')
        .to('.fragmented-card-4', { x: 160, y: 90, rotate: 10, duration: 1 }, '<')
        .to('.problem-[#problem-heading]', { opacity: 0, y: -30, duration: 0.5 }, '<')
        .to('.problem-[#problem-workload]', { opacity: 1, scale: 1.1, duration: 0.8 }, '-=0.5');

      // Step 2: Fragmented panels converge into center with luminous energy
      tl.to('.fragmented-card', {
        x: 0,
        y: 0,
        rotate: 0,
        scale: 0.9,
        opacity: 0,
        stagger: 0.1,
        duration: 1.2,
        ease: 'power3.inOut',
      })
      .to('#solution-core-hub', {
        scale: 1,
        opacity: 1,
        duration: 1,
        ease: 'back.out(1.5)',
      }, '-=0.8')
      .to('.solution-[#solution-heading]', {
        opacity: 1,
        y: 0,
        duration: 0.8,
      }, '-=0.5');

    }, containerRef);

    return () => ctx.revert();
  }, []);

  const fragmentedTools = [
    { title: 'Manual Attendance', desc: 'Paper sheets & spreadsheets', id: '1', color: 'border-red-500/30' },
    { title: 'Isolated LMS', desc: 'Disconnected assignment submissions', id: '2', color: 'border-amber-500/30' },
    { title: 'Gradebook & Excel', desc: 'Manual percentage calculations', id: '3', color: 'border-purple-500/30' },
    { title: 'Scattered Email & Reports', desc: 'Uncoordinated parent updates', id: '4', color: 'border-blue-500/30' },
  ];

  return (
    <section
      id="problem"
      ref={containerRef}
      className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden bg-[#071426] text-white py-20"
    >
      {/* Glow Orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[#005BAC]/15 blur-3xl animate-glow" />
        <div className="absolute bottom-10 right-10 w-[400px] h-[400px] rounded-full bg-[#8CC63F]/10 blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-10 w-full">
        
        {/* Step 1 Heading: Pain Point */}
        <div id="problem-heading" className="space-y-4">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider">
            <AlertCircle className="w-4 h-4" /> Academic Administration Bottleneck
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Teaching Was Never Supposed To Feel Like <span className="text-red-400">Administration.</span>
          </h2>
          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto">
            Faculty members spend over 5 hours every week toggling between disconnected software, manual attendance rosters, and grading sheets.
          </p>
        </div>

        {/* Step 2 Heading: Solution Convergence (Initially Hidden) */}
        <div id="solution-heading" className="space-y-4 opacity-0 translate-y-8 absolute inset-x-0 top-12 pointer-events-none">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#8CC63F]/20 border border-[#8CC63F]/40 text-[#8CC63F] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" /> One Unified Intelligence Layer
          </span>
          <h2 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
            One Operating System. <br />
            <span className="text-gradient">Every Workflow Synchronized.</span>
          </h2>
        </div>

        {/* Floating Cards & Transformation Canvas */}
        <div ref={cardsRef} className="relative h-96 w-full flex items-center justify-center">
          
          {/* Fragmented Tool Cards (Scatter then Merge) */}
          {fragmentedTools.map((tool) => (
            <div
              key={tool.id}
              className={`fragmented-card fragmented-card-${tool.id} absolute w-64 p-5 rounded-2xl glass-card border ${tool.color} shadow-2xl transition-all duration-300 text-left bg-slate-900/90`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Fragmented Tool 0{tool.id}</span>
                <span className="w-2 h-2 rounded-full bg-red-400" />
              </div>
              <h4 className="font-bold text-sm text-white">{tool.title}</h4>
              <p className="text-xs text-slate-400 mt-1">{tool.desc}</p>
            </div>
          ))}

          {/* Solution Core Hub (Appears when cards converge) */}
          <div
            id="solution-core-hub"
            className="opacity-0 scale-75 absolute max-w-md w-full p-8 rounded-3xl glass-card border border-[#8CC63F]/40 shadow-2xl bg-gradient-to-b from-[#0F172A] to-[#071426] space-y-5 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#005BAC] to-[#8CC63F] text-white flex items-center justify-center font-black text-2xl shadow-xl mx-auto">
              EP
            </div>
            <div>
              <span className="text-[11px] font-extrabold text-[#8CC63F] uppercase tracking-widest">
                EduPilot AI Core Engine
              </span>
              <h3 className="text-2xl font-black text-white mt-1">
                Unified Academic Operations
              </h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Connects Adamas University attendance, student analytics, assessment generation, and parent alerts into one seamless AI workflow.
              </p>
            </div>
            <div className="pt-2 flex justify-center gap-3 text-[11px] font-bold text-slate-300">
              <span className="px-3 py-1 rounded-lg bg-slate-800 border border-slate-700">1-Click Context</span>
              <span className="px-3 py-1 rounded-lg bg-slate-800 border border-slate-700">Multi-LLM RAG</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
