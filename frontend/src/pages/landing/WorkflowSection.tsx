import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { UserCheck, Cpu, Bot, FileCheck2, ArrowRight, Zap } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    step: '01', title: 'Teacher Context Input', subtitle: 'Class & Syllabus Selection',
    description: 'Select your active class (e.g. 3rd Year CSE Sec A) or prompt EduPilot with specific lesson objectives and syllabus topics.',
    icon: UserCheck, color: '#005BAC',
  },
  {
    step: '02', title: 'EduPilot Core Engine', subtitle: 'RAG Retrieval & Database Query',
    description: 'The core orchestrator pulls active attendance data, syllabus requirements, prior quiz performance, and daily notes history.',
    icon: Cpu, color: '#0A6FD8',
  },
  {
    step: '03', title: 'Specialized AI Agents', subtitle: 'Lesson, Quiz & Analytics Execution',
    description: 'Dedicated agents process prompt intents through Groq & Gemini LLMs with multi-key failover and context injection.',
    icon: Bot, color: '#8CC63F',
  },
  {
    step: '04', title: 'Actionable Outcomes', subtitle: 'Exportable Studio Assets',
    description: 'Receive structured lesson plans, PDF/PPTX quiz packs, analytics summaries, or instant email/WhatsApp parent alerts.',
    icon: FileCheck2, color: '#6FAF2E',
  },
];

export const WorkflowSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      // Header entrance
      gsap.from('.workflow-header', {
        y: 40, opacity: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', toggleActions: 'play none none reverse' },
      });

      // Step cards staggered entrance with scale
      gsap.from('.workflow-step-card', {
        y: 50, opacity: 0, scale: 0.92, duration: 0.7, stagger: 0.15,
        ease: 'back.out(1.4)',
        scrollTrigger: { trigger: '.workflow-grid', start: 'top 80%', toggleActions: 'play none none reverse' },
      });

      // Progress line fill animation
      gsap.from('.workflow-progress-line', {
        scaleX: 0, transformOrigin: 'left center', duration: 1.5, ease: 'power2.inOut',
        scrollTrigger: { trigger: '.workflow-grid', start: 'top 75%', toggleActions: 'play none none reverse' },
      });

      // Image parallax
      gsap.to('.workflow-image', {
        y: -40, ease: 'none',
        scrollTrigger: { trigger: sectionRef.current, start: 'top bottom', end: 'bottom top', scrub: 2 },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="workflow"
      ref={sectionRef}
      className="py-28 bg-[#F8FAFC] dark:bg-[#0F172A] relative overflow-hidden transition-colors duration-200 wave-divider-alt"
    >
      {/* ─── Upgraded Vibrant Ambient Background Light Effect ─── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Subtle grid matrix overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:36px_36px]" />

        {/* Ambient vibrant glowing light orbs */}
        <div className="absolute -top-32 -right-32 w-[650px] h-[650px] rounded-full bg-gradient-to-bl from-[#005BAC]/20 via-[#0A6FD8]/15 to-emerald-400/10 blur-3xl animate-pulse" />
        <div className="absolute top-[40%] -left-36 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-[#8CC63F]/20 via-sky-500/15 to-[#005BAC]/10 blur-3xl opacity-90" />
        <div className="absolute -bottom-24 right-[25%] w-[450px] h-[450px] rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="workflow-header text-center max-w-3xl mx-auto mb-20 space-y-5">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider bg-[#005BAC]/10 text-[#005BAC] dark:bg-[#8CC63F]/15 dark:text-[#8CC63F]">
            <Zap className="w-4 h-4" /> AI Orchestration Pipeline
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white">
            How EduPilot{' '}
            <span className="text-gradient font-cursive text-4xl sm:text-5xl lg:text-6xl tracking-normal">Powers Your Classroom</span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400">
            EduPilot's multi-agent engine transforms raw syllabus data and attendance records into instant, actionable teaching artifacts.
          </p>
        </div>

        {/* Content: Image + Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left: Workflow Image */}
          <div className="lg:col-span-5 relative">
            <div className="workflow-image relative flex justify-center">
              <img
                src="/images/workflow_diagram.webp"
                alt="EduPilot AI Workflow Architecture"
                className="w-full h-auto object-contain drop-shadow-[0_15px_35px_rgba(0,0,0,0.25)]"
                loading="lazy"
              />
            </div>
          </div>

          {/* Right: Stepper Timeline */}
          <div className="lg:col-span-7" ref={timelineRef}>
            {/* Hidden progress line for desktop */}
            <div className="hidden lg:block mb-8 relative h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="workflow-progress-line absolute inset-y-0 left-0 right-0 bg-gradient-to-r from-[#005BAC] via-[#0A6FD8] to-[#8CC63F] rounded-full" />
            </div>

            <div className="workflow-grid grid grid-cols-1 sm:grid-cols-2 gap-6">
              {steps.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.step}
                    className="workflow-step-card group glass-card-hover rounded-2xl p-6 flex flex-col gap-4 cursor-default"
                  >
                    {/* Step Number + Icon */}
                    <div className="flex items-center justify-between">
                      <span className="text-3xl font-black" style={{ color: item.color }}>
                        {item.step}
                      </span>
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                        style={{ backgroundColor: `${item.color}15`, color: item.color }}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>
                    {/* Titles */}
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-[#005BAC] dark:group-hover:text-[#8CC63F] transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-[11px] font-semibold mt-0.5" style={{ color: item.color }}>
                        {item.subtitle}
                      </p>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed flex-1">
                      {item.description}
                    </p>
                    {/* Connector arrow */}
                    {index < steps.length - 1 && (
                      <div className="sm:hidden flex justify-center pt-2">
                        <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 rotate-90" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Human-in-the-loop callout */}
            <div className="mt-8 p-5 rounded-2xl bg-gradient-to-r from-[#005BAC]/5 via-[#0A6FD8]/5 to-[#8CC63F]/5 border border-slate-200 dark:border-slate-800 text-center">
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium">
                <strong className="font-bold text-slate-900 dark:text-white">Human-in-the-Loop Guarantee:</strong>{' '}
                Every AI output is presented for teacher review, customization, and approval before distribution.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
