import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Sparkles, CheckCircle2, ChevronDown, GraduationCap, BookOpen, BarChart3 } from 'lucide-react';

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
      // Hero title entrance
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
      // Parallax on the hero image card
      gsap.to('.hero-image-card', {
        y: -80,
        ease: 'none',
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1.5,
        },
      });
      // Parallax on background orbs
      gsap.to('.hero-orb-1', {
        y: -120, ease: 'none',
        scrollTrigger: { trigger: heroRef.current, start: 'top top', end: 'bottom top', scrub: 2 },
      });
      gsap.to('.hero-orb-2', {
        y: -60, x: 30, ease: 'none',
        scrollTrigger: { trigger: heroRef.current, start: 'top top', end: 'bottom top', scrub: 3 },
      });
      gsap.to('.hero-orb-3', {
        y: -90, x: -20, ease: 'none',
        scrollTrigger: { trigger: heroRef.current, start: 'top top', end: 'bottom top', scrub: 2.5 },
      });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen pt-28 pb-20 flex flex-col justify-between overflow-hidden bg-slate-50 dark:bg-[#0F172A] transition-colors duration-200"
    >
      {/* ─── Animated Background Layers ─── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:48px_48px]" />

        {/* Glowing orbs with parallax */}
        <div className="hero-orb-1 absolute -top-32 -right-32 w-[550px] h-[550px] rounded-full bg-gradient-to-br from-[#005BAC]/25 to-[#0A6FD8]/15 blur-3xl animate-glow" />
        <div className="hero-orb-2 absolute top-[55%] -left-40 w-[480px] h-[480px] rounded-full bg-gradient-to-tr from-[#8CC63F]/20 to-purple-500/10 blur-3xl opacity-70" />
        <div className="hero-orb-3 absolute bottom-20 right-20 w-[350px] h-[350px] rounded-full bg-[#8CC63F]/15 blur-2xl opacity-60 animate-glow" />

        {/* Decorative spinning ring */}
        <div className="absolute top-1/4 right-1/4 w-[200px] h-[200px] border border-[#005BAC]/10 dark:border-[#8CC63F]/10 rounded-full animate-spin-slow" />
        <div className="absolute bottom-1/3 left-1/3 w-[120px] h-[120px] border border-dashed border-[#8CC63F]/10 rounded-full animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '45s' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* ─── Left Column ─── */}
          <div className="lg:col-span-7 space-y-7 text-center lg:text-left">
            {/* Pill Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card"
            >
              <Sparkles className="w-4 h-4 text-[#8CC63F]" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Official Adamas University Platform
              </span>
              <span className="w-2 h-2 rounded-full bg-[#8CC63F] animate-pulse" />
            </motion.div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] xl:text-6xl font-extrabold tracking-tight leading-[1.1]">
              <span className="hero-title-line block text-slate-900 dark:text-white">
                EduPilot AI –
              </span>
              <span className="hero-title-line block text-gradient mt-1">
                Academic Operating System
              </span>
            </h1>

            {/* Subtitle */}
            <p className="hero-subtitle text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl font-normal leading-relaxed">
              Less admin, more teaching: harness AI for attendance tracking, automated lesson planning, institutional analytics, and RAG-powered class insights — built for Adamas University.
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

          {/* ─── Right Column Graphic ─── */}
          <div className="lg:col-span-5 relative">
            <div className="hero-image-card relative mx-auto max-w-md lg:max-w-none">
              {/* Glow ring behind card */}
              <div className="absolute -inset-3 rounded-3xl bg-gradient-to-r from-[#005BAC] to-[#8CC63F] opacity-25 blur-2xl animate-glow" />

              <div className="relative rounded-3xl glass-card p-3 overflow-hidden bg-white dark:bg-[#1E293B]">
                <img
                  src="/images/hero_illustration.png"
                  alt="EduPilot AI Classroom Operations Platform"
                  className="w-full h-auto rounded-2xl object-contain bg-white dark:bg-[#1E293B]"
                  loading="eager"
                />
              </div>

              {/* Floating stat badge — bottom-left */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.4, duration: 0.6 }}
                className="absolute -bottom-6 -left-6 glass-card p-4 rounded-2xl flex items-center gap-3"
              >
                <div className="w-11 h-11 rounded-xl bg-[#8CC63F]/20 text-[#8CC63F] flex items-center justify-center font-extrabold text-sm">
                  98%
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Admin Time Saved</p>
                  <p className="text-xs font-extrabold text-slate-900 dark:text-white">5+ Hrs / Week</p>
                </div>
              </motion.div>

              {/* Floating badge — top-right */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.6, duration: 0.6 }}
                className="absolute -top-5 -right-5 glass-card p-3 rounded-xl flex items-center gap-2"
              >
                <div className="w-8 h-8 rounded-lg bg-[#005BAC]/15 text-[#005BAC] dark:text-[#8CC63F] flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200">AI-Powered</span>
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
