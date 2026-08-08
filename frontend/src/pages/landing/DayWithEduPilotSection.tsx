import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Clock, CheckCircle2, AlertTriangle, FileText, HelpCircle, Mail, Sparkles } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const timelineEvents = [
  {
    time: '08:00 AM',
    title: 'Class Begins — 3rd Year CSE (Sec B)',
    subtitle: 'Operating Systems (CS-301)',
    desc: 'Mark batch attendance in 5 seconds. EduPilot automatically flags 4 students falling below 75% threshold.',
    icon: Clock,
    color: '#005BAC',
  },
  {
    time: '09:30 AM',
    title: 'Automated Risk & Velocity Insights',
    subtitle: 'Real-Time Analytics Processing',
    desc: 'View weekly attendance trends and grade distributions. Early interventions triggered for at-risk students.',
    icon: AlertTriangle,
    color: '#F59E0B',
  },
  {
    time: '11:00 AM',
    title: 'AI Assignment Evaluation',
    subtitle: 'Rubric & Model Answer Scoring',
    desc: 'EduPilot evaluates student PDF submissions against rubric criteria. Teacher reviews and confirms final marks.',
    icon: FileText,
    color: '#A855F7',
  },
  {
    time: '01:30 PM',
    title: 'Instant Quiz & Question Generation',
    subtitle: 'Bloom Taxonomy Test Bank',
    desc: 'Generate 10 MCQs & short questions on Process Synchronization aligned to Adamas University syllabus.',
    icon: HelpCircle,
    color: '#8CC63F',
  },
  {
    time: '04:00 PM',
    title: 'Document Studio Export & Parent Alerts',
    subtitle: 'PDF Export & Institutional Dispatch',
    desc: 'Export formatted PDF question papers and send personalized attendance warning emails to guardians.',
    icon: Mail,
    color: '#38BDF8',
  },
];

export const DayWithEduPilotSection: React.FC = () => {
  const containerRef = useRef<HTMLElement>(null);
  const progressLineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) return;

      // Pinned timeline progress line filling on scroll
      gsap.to(progressLineRef.current, {
        height: '100%',
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 40%',
          end: 'bottom 80%',
          scrub: 0.5,
        },
      });

      // Individual timeline card entrance
      gsap.utils.toArray<HTMLElement>('.timeline-event-card').forEach((card) => {
        gsap.from(card, {
          opacity: 0,
          x: 40,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="day-in-life"
      ref={containerRef}
      className="relative py-28 bg-slate-50 dark:bg-[#071426] text-slate-900 dark:text-white transition-colors duration-200"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#005BAC]/10 text-[#005BAC] dark:bg-[#8CC63F]/20 dark:text-[#8CC63F] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" /> A Day With EduPilot AI
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            From First Class To <span className="text-gradient">Final Report.</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
            Experience how EduPilot streamlines every hour of a faculty member's daily routine at Adamas University.
          </p>
        </div>

        {/* Pinned Vertical Timeline Container */}
        <div className="relative pl-6 sm:pl-10 space-y-12 border-l-2 border-slate-200 dark:border-slate-800">
          
          {/* Animated Vertical Progress Line Fill */}
          <div
            ref={progressLineRef}
            className="absolute top-0 left-[-2px] w-[2px] bg-gradient-to-b from-[#005BAC] via-[#0A6FD8] to-[#8CC63F] h-0"
          />

          {timelineEvents.map((event, idx) => {
            const Icon = event.icon;
            return (
              <div key={idx} className="timeline-event-card relative flex flex-col sm:flex-row gap-4 sm:gap-8 items-start">
                
                {/* Node Marker */}
                <div
                  className="absolute -left-[35px] sm:-left-[51px] top-1 w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center shadow-md text-white font-bold text-xs"
                  style={{ backgroundColor: event.color }}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>

                {/* Time Badge */}
                <div className="min-w-[100px] flex-shrink-0 pt-0.5">
                  <span className="text-xs font-black px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                    {event.time}
                  </span>
                </div>

                {/* Event Content Card */}
                <div className="flex-1 glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 hover:border-[#005BAC] transition-colors duration-200">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#005BAC] dark:text-[#8CC63F]">
                    {event.subtitle}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    {event.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {event.desc}
                  </p>
                </div>

              </div>
            );
          })}

        </div>

      </div>
    </section>
  );
};
