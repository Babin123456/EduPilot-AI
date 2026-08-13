import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  BookOpen, CheckSquare, BarChart3, FileText, BrainCircuit, ArrowRight, Zap
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface FeaturesSectionProps {
  onNavigate: (sectionId: string) => void;
}

const features = [
  {
    icon: BookOpen,
    title: 'AI-Driven Lesson Planning',
    description: 'Instantly generate detailed lesson outlines, presentation slides, and curriculum maps aligned to your university syllabus.',
    badge: 'Core Feature',
    image: '/features_ai_planning.webp',
  },
  {
    icon: CheckSquare,
    title: 'Streamlined Attendance & Reporting',
    description: 'Mark classes in seconds with 1-click batch controls and flag low-attendance students automatically before exam eligibility dates.',
    badge: 'Automation',
    image: '/attendance_tracking.webp',
  },
  {
    icon: BarChart3,
    title: 'Integrated Class Analytics',
    description: 'Gain real-time insights on class performance trends, distribution graphs, and early intervention triggers for struggling students.',
    badge: 'Insights',
    image: '/analytics_dashboard.webp',
  },
  {
    icon: FileText,
    title: 'One-Stop Document Hub',
    description: 'All your generated lesson plans, quizzes, question papers, and daily class notes in a unified, exportable studio.',
    badge: 'Studio',
    image: '/document_studio.webp',
  },
  {
    icon: BrainCircuit,
    title: 'Context-Aware AI Assistant',
    description: 'Ask questions like "Who is below 75% attendance in CSE 3rd Year Sec B?" and receive precise answers from your active database.',
    badge: 'RAG Powered',
    image: '/workflow_diagram.webp',
  },
];

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({ onNavigate }) => {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      // Staggered card entrance
      gsap.from('.feature-card-enhanced', {
        y: 60, opacity: 0, scale: 0.95,
        duration: 0.8, stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
          toggleActions: 'play none none reverse',
        },
      });
      // Section header entrance
      gsap.from('.features-header', {
        y: 40, opacity: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="features"
      ref={sectionRef}
      className="py-28 bg-white dark:bg-[#0F172A] relative overflow-hidden transition-colors duration-200"
    >
      {/* Decorative background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-0 w-[400px] h-[400px] rounded-full bg-[#005BAC]/5 blur-3xl" />
        <div className="absolute bottom-20 left-0 w-[350px] h-[350px] rounded-full bg-[#8CC63F]/5 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="features-header text-center max-w-3xl mx-auto mb-20 space-y-5">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider bg-[#005BAC]/10 text-[#005BAC] dark:bg-[#8CC63F]/15 dark:text-[#8CC63F]">
            <Zap className="w-4 h-4" />
            Capabilities & Tools
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white">
            Designed for Modern{' '}
            <span className="text-gradient font-cursive text-4xl sm:text-5xl lg:text-6xl tracking-normal">Academic Operations</span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            EduPilot AI equips university faculty with modular tools that streamline daily administration and enhance student outcomes.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="feature-card-enhanced group glass-card-hover rounded-3xl p-1 cursor-pointer"
              >
                <div className="rounded-[20px] overflow-hidden bg-white dark:bg-[#1E293B] h-full flex flex-col border border-slate-200/60 dark:border-slate-800">
                  {/* Card Image with hover zoom */}
                  <div className="relative h-48 overflow-hidden bg-slate-50 dark:bg-slate-900 p-2 flex items-center justify-center">
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="w-full h-full object-contain transition-transform duration-700 ease-out group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-white/95 dark:from-[#1E293B]/95 via-transparent to-transparent pointer-events-none" />
                    {/* Badge overlay */}
                    <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 shadow-sm">
                      {feature.badge}
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-11 h-11 rounded-xl bg-[#005BAC]/10 text-[#005BAC] dark:bg-[#8CC63F]/15 dark:text-[#8CC63F] flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 flex-shrink-0">
                          <Icon className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-[#005BAC] dark:group-hover:text-[#8CC63F] transition-colors duration-300">
                          {feature.title}
                        </h3>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                    <button
                      onClick={() => onNavigate('workflow')}
                      className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-[#005BAC] dark:text-[#8CC63F] group-hover:gap-3 transition-all duration-300"
                    >
                      <span>Learn more</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
