import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, CheckCircle2, Rocket, GraduationCap } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export const CTASection: React.FC = () => {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from('.cta-content', {
        y: 50, opacity: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', toggleActions: 'play none none reverse' },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="cta" ref={sectionRef} className="py-24 bg-slate-50 dark:bg-[#0F172A] relative overflow-hidden transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="rounded-[2.5rem] relative overflow-hidden shadow-2xl border border-slate-200/50 dark:border-slate-800">
          {/* Background Image + Gradient Overlay */}
          <div className="absolute inset-0">
            <img src="/images/cta_background.png" alt="EduPilot Background" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#005BAC]/95 via-[#005BAC]/85 to-[#0F172A]/90" />
          </div>

          {/* Animated Glow Orbs */}
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#8CC63F]/25 blur-3xl animate-glow pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-blue-400/20 blur-3xl animate-glow pointer-events-none" />

          <div className="relative z-10 p-10 sm:p-16 lg:p-20 text-center max-w-4xl mx-auto space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-white border border-white/20">
              <Rocket className="w-4 h-4 text-[#8CC63F]" />
              <span>Empower Adamas Faculty Today</span>
            </div>
            
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
              Transform Your Classroom Management Today
            </h2>
            
            <p className="text-base sm:text-xl text-slate-200 max-w-2xl mx-auto font-normal leading-relaxed">
              Experience the future of teaching automation, institutional analytics, and RAG-powered classroom copiloting — built exclusively for Adamas University.
            </p>
            
            <div className="pt-2 flex flex-wrap justify-center gap-6 text-xs sm:text-sm font-semibold text-slate-200">
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#8CC63F]" /> Instant Setup for AU Faculty</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#8CC63F]" /> FERPA & Institutional Compliance</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#8CC63F]" /> 1-Click Class Context</span>
            </div>

            <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button onClick={() => navigate('/login')} className="btn-magnetic w-full sm:w-auto px-10 py-5 rounded-2xl bg-[#8CC63F] hover:bg-[#6FAF2E] text-slate-950 font-extrabold text-base shadow-xl flex items-center justify-center gap-3 group">
                <GraduationCap className="w-5 h-5 text-slate-950" />
                <span>Get Started — Teacher Login</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-300" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
