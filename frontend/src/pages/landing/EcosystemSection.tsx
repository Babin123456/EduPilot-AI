import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  CheckSquare, BarChart3, Bot, FileText, HelpCircle, Notebook, Folder, Mail, Sparkles, Layers
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const ecosystemModules = [
  { id: '1', title: 'Attendance Engine', desc: '1-click batch marking & 75% risk alerts', icon: CheckSquare, color: '#005BAC', angle: 0 },
  { id: '2', title: 'Classroom Analytics', desc: 'Real-time velocity & grade distribution', icon: BarChart3, color: '#0A6FD8', angle: 51 },
  { id: '3', title: 'EduPilot AI Copilot', desc: 'RAG-grounded natural language queries', icon: Bot, color: '#8CC63F', angle: 102 },
  { id: '4', title: 'Lesson Planner', desc: 'Auto syllabus breakdown & slide decks', icon: FileText, color: '#6FAF2E', angle: 153 },
  { id: '5', title: 'Quiz & Exam Gen', desc: 'MCQ & Bloom taxonomy question banks', icon: HelpCircle, color: '#38BDF8', angle: 204 },
  { id: '6', title: 'Daily Notes Studio', desc: 'Lecture notes with PDF/DOCX export', icon: Notebook, color: '#A855F7', angle: 255 },
  { id: '7', title: 'Document Hub', desc: 'Unified storage for all course assets', icon: Folder, color: '#F59E0B', angle: 306 },
];

export const EcosystemSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const coreHubRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=150%',
          pin: true,
          scrub: 1,
        },
      });

      // Core hub scale-in
      tl.from(coreHubRef.current, {
        scale: 0.5,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
      })
      // Sequential activation of surrounding radial module cards
      .from('.eco-module-card', {
        opacity: 0,
        scale: 0.6,
        y: 40,
        stagger: 0.15,
        duration: 1,
        ease: 'back.out(1.4)',
      }, '-=0.5')
      // Connector lines stroke draw
      .from('.eco-connector-line', {
        strokeDashoffset: 300,
        duration: 1.2,
        stagger: 0.1,
        ease: 'power2.inOut',
      }, '-=1.0');

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="ecosystem"
      ref={sectionRef}
      className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden bg-slate-900 text-white py-24"
    >
      {/* Radial Background Orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[750px] rounded-full bg-gradient-to-tr from-[#005BAC]/20 via-[#0A6FD8]/15 to-[#8CC63F]/20 blur-3xl animate-glow" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-12 w-full">
        
        {/* Header */}
        <div className="space-y-4 max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#005BAC]/20 border border-[#005BAC]/40 text-[#38BDF8] text-xs font-bold uppercase tracking-wider">
            <Layers className="w-4 h-4" /> Academic Intelligence Layer
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            EduPilot Is Not Another LMS. <br />
            <span className="text-gradient">It Is The Operational Intelligence Layer.</span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Working across attendance, student risk monitoring, lesson planning, and document generation for Adamas University faculty.
          </p>
        </div>

        {/* Spatial Ecosystem Canvas */}
        <div className="relative min-h-[520px] w-full flex items-center justify-center">
          
          {/* Central EduPilot Core Hub */}
          <div
            ref={coreHubRef}
            className="z-20 w-44 h-44 rounded-full glass-card border border-[#8CC63F]/50 shadow-2xl bg-slate-950 flex flex-col items-center justify-center p-4 text-center group cursor-default"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#005BAC] to-[#8CC63F] text-white flex items-center justify-center font-black text-xl shadow-lg mb-2 group-hover:scale-110 transition-transform duration-300">
              EP
            </div>
            <h3 className="text-xs font-black text-white leading-tight">EduPilot AI</h3>
            <span className="text-[9px] font-extrabold text-[#8CC63F] uppercase tracking-widest mt-0.5">Core OS</span>
          </div>

          {/* Radial Module Nodes */}
          <div className="absolute inset-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-center max-w-5xl mx-auto my-auto pt-4">
            {ecosystemModules.map((module) => {
              const Icon = module.icon;
              return (
                <div
                  key={module.id}
                  className="eco-module-card group glass-card hover:border-[#005BAC] p-4 rounded-2xl border border-slate-800 bg-slate-950/80 shadow-xl flex items-center gap-3 transition-all duration-300 hover:scale-105 text-left cursor-default"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300"
                    style={{ backgroundColor: `${module.color}20`, color: module.color }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-[#8CC63F] transition-colors">
                      {module.title}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">{module.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
};
