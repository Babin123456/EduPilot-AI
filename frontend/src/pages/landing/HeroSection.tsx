import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Sparkles, CheckCircle2, ChevronDown, Zap } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface HeroSectionProps {
  onNavigate: (sectionId: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onNavigate }) => {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!heroRef.current) return;
    const ctx = gsap.context(() => {
      // Hero title entrance (in-out GSAP effect)
      gsap.from('.hero-title-line', {
        y: 80, opacity: 0, duration: 1.2,
        stagger: 0.15, ease: 'power4.out', delay: 0.3,
      });
      // Subtitle & bullets entrance
      gsap.from('.hero-subtitle', {
        y: 40, opacity: 0, duration: 1, ease: 'power3.out', delay: 0.7,
      });
      gsap.from('.hero-bullets span', {
        y: 20, opacity: 0, duration: 0.6,
        stagger: 0.1, ease: 'power2.out', delay: 1.0,
      });
      // CTA buttons entrance
      gsap.from('.hero-cta', {
        y: 30, opacity: 0, duration: 0.8,
        stagger: 0.12, ease: 'power3.out', delay: 1.2,
      });
      // Floating zero-gravity graphic animation
      gsap.to('.floating-hero-asset', {
        y: -25,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut',
      });
      // Parallax scroll on the hero graphic
      gsap.to('.floating-hero-asset', {
        y: -60,
        ease: 'none',
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1.5,
        },
      });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen pt-28 pb-20 flex flex-col justify-between overflow-hidden bg-slate-50 dark:bg-[#071426] transition-colors duration-200 select-none"
    >
      {/* ─── Ambient Background Glows ─── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:48px_48px]" />

        {/* Ambient glow orbs */}
        <div className="absolute -top-32 -right-32 w-[550px] h-[550px] rounded-full bg-gradient-to-br from-[#005BAC]/20 to-[#0A6FD8]/15 blur-3xl" />
        <div className="absolute top-[55%] -left-40 w-[480px] h-[480px] rounded-full bg-gradient-to-tr from-[#8CC63F]/15 to-blue-500/10 blur-3xl opacity-70" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* ─── Left Column: Title & Entrance Text Effects ─── */}
          <div className="lg:col-span-7 space-y-7 text-center lg:text-left">
            {/* Pill Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="hero-badge-container inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-emerald-500/30"
            >
              <Sparkles className="w-4 h-4 text-[#8CC63F]" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Next-Gen Academic Platform
              </span>
              <span className="w-2 h-2 rounded-full bg-[#8CC63F] animate-pulse" />
            </motion.div>

            {/* Main Headline with Original Cursive Font */}
            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] xl:text-6xl font-extrabold tracking-tight leading-[1.1]">
              <span className="hero-title-line block text-slate-900 dark:text-white">
                <span className="text-gradient font-extrabold">EduPilot</span> AI –
              </span>
              <span className="hero-title-line block text-gradient font-cursive text-5xl sm:text-6xl lg:text-[4rem] xl:text-7xl mt-1 tracking-normal py-1">
                Academic Operating System
              </span>
            </h1>

            {/* Subtitle */}
            <p className="hero-subtitle text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl font-normal leading-relaxed">
              Less admin, more teaching: harness AI for attendance tracking, automated lesson planning, institutional analytics, and RAG-powered class insights — designed for modern universities.
            </p>

            {/* Value Bullets */}
            <div className="hero-bullets pt-1 flex flex-wrap justify-center lg:justify-start gap-x-5 gap-y-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#8CC63F]" /> 1-Click Class Context
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#8CC63F]" /> Instant Quiz & Slide Gen
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#8CC63F]" /> Automated Risk Flagging
              </span>
            </div>

            {/* CTA Buttons */}
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button
                onClick={() => navigate('/login')}
                className="hero-cta btn-magnetic w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#005BAC] hover:bg-[#0A6FD8] text-white font-bold text-sm shadow-xl flex items-center justify-center gap-3 group"
              >
                <span>Teacher Login</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
              </button>
              <button
                onClick={() => onNavigate('features')}
                className="hero-cta btn-magnetic w-full sm:w-auto px-8 py-4 rounded-2xl glass-card text-slate-900 dark:text-white font-bold text-sm text-center"
              >
                Explore Features
              </button>
            </div>
          </div>

          {/* ─── Right Column Floating Image (Clean Zero-Gravity Illustration) ─── */}
          <div className="lg:col-span-5 relative flex items-center justify-center mt-6 lg:mt-0 px-4 sm:px-0">
            <div className="floating-hero-asset relative w-full max-w-sm sm:max-w-md lg:max-w-lg">
              <img
                src="/images/login_hero_illustration.webp"
                alt="EduPilot AI Zero-Gravity Academic Operating System Graphic"
                className="w-full h-auto object-contain drop-shadow-[0_20px_50px_rgba(0,91,172,0.35)]"
                loading="eager"
              />

              {/* Floating Stat Badge — Top Right */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4, duration: 0.6 }}
                className="absolute -top-2 right-0 sm:-top-4 sm:-right-4 glass-card p-2 sm:p-3 rounded-xl flex items-center gap-2 shadow-xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md"
              >
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#005BAC]/15 text-[#005BAC] dark:text-[#8CC63F] flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-800 dark:text-slate-200">AI-Powered OS</span>
              </motion.div>

              {/* Floating Stat Badge — Bottom Left */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.6, duration: 0.6 }}
                className="absolute -bottom-2 left-0 sm:-bottom-4 sm:-left-4 glass-card p-2.5 sm:p-3.5 rounded-2xl flex items-center gap-2.5 sm:gap-3 shadow-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#8CC63F]/20 text-[#8CC63F] flex items-center justify-center font-extrabold text-xs sm:text-sm">
                  98%
                </div>
                <div>
                  <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase">Admin Time Saved</p>
                  <p className="text-[11px] sm:text-xs font-extrabold text-slate-900 dark:text-white">5+ Hrs / Week</p>
                </div>
              </motion.div>
            </div>
          </div>

        </div>
      </div>

      {/* ─── Scroll Indicator ─── */}
      <div className="text-center pt-8 relative z-10">
        <button
          onClick={() => onNavigate('features')}
          className="group inline-flex flex-col items-center gap-1.5 text-slate-400 hover:text-[#005BAC] dark:hover:text-[#8CC63F] transition-colors"
          aria-label="Scroll to features"
        >
          <span className="text-[10px] uppercase font-bold tracking-[0.2em] group-hover:tracking-[0.3em] transition-all">Explore Features</span>
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </button>
      </div>
    </section>
  );
};
