import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowRight, Sparkles, CheckCircle2, ChevronDown, GraduationCap,
  BookOpen, BarChart3, Layers, Zap, Clock, ShieldCheck, FileText, Bot
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface HeroSectionProps {
  onNavigate: (sectionId: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onNavigate }) => {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLElement>(null);
  const heroContainerRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!heroRef.current) return;
    const ctx = gsap.context(() => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) return;

      // Initial Entrance Timeline
      const tl = gsap.timeline();

      tl.from(badgeRef.current, {
        opacity: 0,
        y: -20,
        scale: 0.9,
        duration: 0.7,
        ease: 'back.out(1.7)',
      })
      .from('.hero-title-word', {
        opacity: 0,
        y: 60,
        rotateX: -30,
        duration: 0.9,
        stagger: 0.12,
        ease: 'power4.out',
      }, '-=0.4')
      .from('.hero-subtitle', {
        opacity: 0,
        y: 30,
        duration: 0.7,
        ease: 'power3.out',
      }, '-=0.4')
      .from('.hero-bullets span', {
        opacity: 0,
        y: 20,
        duration: 0.5,
        stagger: 0.08,
        ease: 'power2.out',
      }, '-=0.3')
      .from('.hero-cta-btn', {
        opacity: 0,
        scale: 0.9,
        y: 20,
        duration: 0.6,
        stagger: 0.1,
        ease: 'back.out(1.4)',
      }, '-=0.3')
      .from('.hero-[#hero-preview-window]', {
        opacity: 0,
        y: 100,
        scale: 0.9,
        duration: 1,
        ease: 'power3.out',
      }, '-=0.6');

      // Scroll-Driven Pinned Transformation: Hero converts into Floating Dashboard
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: '+=120%',
          pin: true,
          scrub: 1,
          anticipatePin: 1,
        },
      });

      scrollTl
        .to(headlineRef.current, {
          scale: 0.75,
          y: -40,
          opacity: 0.3,
          ease: 'power1.inOut',
        })
        .to('.hero-content-left', {
          y: -100,
          opacity: 0,
          duration: 0.8,
          ease: 'power2.in',
        }, '<')
        .to('#hero-preview-window', {
          scale: 1.12,
          y: -120,
          boxShadow: '0 30px 100px -10px rgba(0, 91, 172, 0.4), 0 0 50px rgba(140, 198, 63, 0.3)',
          duration: 1.2,
          ease: 'power2.out',
        }, '<')
        .to('.preview-card-reveal', {
          opacity: 1,
          y: 0,
          stagger: 0.2,
          duration: 0.6,
        }, '-=0.4');

    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen pt-28 pb-16 flex flex-col justify-between overflow-hidden bg-slate-50 dark:bg-[#071426] transition-colors duration-300"
    >
      {/* ─── Ambient Glow Orbs ─── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#005BAC]/20 to-[#0A6FD8]/15 blur-3xl animate-glow" />
        <div className="absolute top-[50%] -left-40 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[#8CC63F]/20 to-blue-500/10 blur-3xl opacity-70" />
      </div>

      <div ref={heroContainerRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 my-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* ─── Left Column Storytelling ─── */}
          <div className="hero-content-left lg:col-span-6 space-y-6 text-center lg:text-left">
            
            {/* Pill Badge */}
            <div ref={badgeRef} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-[#005BAC]/20 dark:border-[#8CC63F]/30 shadow-md">
              <Sparkles className="w-4 h-4 text-[#8CC63F]" />
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Official Adamas University Platform
              </span>
              <span className="w-2 h-2 rounded-full bg-[#8CC63F] animate-pulse" />
            </div>

            {/* Kinetic Hero Headline */}
            <h1 ref={headlineRef} className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] perspective-1000">
              <span className="hero-title-word block text-slate-900 dark:text-white">
                LESS ADMIN.
              </span>
              <span className="hero-title-word block text-gradient mt-1">
                MORE TEACHING.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="hero-subtitle text-base sm:text-lg text-slate-600 dark:text-slate-300 font-normal leading-relaxed max-w-xl mx-auto lg:mx-0">
              The AI Academic Operating System designed for Adamas University faculty. Automate attendance, lesson planning, student risk monitoring, and assessment grading with 1-click class context.
            </p>

            {/* Key Value Bullets */}
            <div className="hero-bullets flex flex-wrap justify-center lg:justify-start gap-x-5 gap-y-2 text-xs font-bold text-slate-700 dark:text-slate-200">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#8CC63F]" /> 1-Click Class Context
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#8CC63F]" /> Instant Quiz & Slide Gen
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#8CC63F]" /> FERPA & Institutional Audit
              </span>
            </div>

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button
                onClick={() => navigate('/login')}
                className="hero-cta-btn btn-magnetic w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#005BAC] hover:bg-[#0A6FD8] text-white font-extrabold text-sm shadow-xl flex items-center justify-center gap-3 group"
              >
                <GraduationCap className="w-5 h-5 text-white" />
                <span>Teacher Login</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
              </button>
              <button
                onClick={() => onNavigate('problem')}
                className="hero-cta-btn btn-magnetic w-full sm:w-auto px-8 py-4 rounded-2xl glass-card text-slate-900 dark:text-white font-bold text-sm text-center"
              >
                See How It Works
              </button>
            </div>
          </div>

          {/* ─── Right Column Interactive Product Window Showcase ─── */}
          <div className="lg:col-span-6 relative">
            <div
              id="hero-preview-window"
              className="relative mx-auto max-w-lg lg:max-w-none rounded-3xl glass-card border border-slate-200 dark:border-slate-800 shadow-2xl p-4 transition-transform duration-300 bg-white dark:bg-[#0F172A]"
            >
              {/* Window Controls Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                  <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 ml-2 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#8CC63F]" /> EduPilot OS v1.1 • AU Command Center
                  </span>
                </div>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#005BAC]/10 text-[#005BAC] dark:bg-[#8CC63F]/20 dark:text-[#8CC63F]">
                  LIVE ENGINE
                </span>
              </div>

              {/* Central Visual Graphic */}
              <div className="relative rounded-2xl overflow-hidden bg-slate-900 p-2">
                <img
                  src="/images/hero_illustration.png"
                  alt="EduPilot AI Academic Operating System"
                  className="w-full h-auto rounded-xl object-contain bg-slate-950"
                />
              </div>

              {/* Reveal Overlay Card 1: Attendance Snapshot */}
              <div className="preview-card-reveal opacity-0 translate-y-6 mt-3 p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#005BAC]/15 text-[#005BAC] dark:text-[#8CC63F] flex items-center justify-center font-bold">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Active Class: 3rd Year CSE (Sec B)</h4>
                    <p className="text-[10px] text-slate-500">Operating Systems • 60 Students Enrolled</p>
                  </div>
                </div>
                <span className="text-[10px] font-extrabold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-md">
                  92% Present
                </span>
              </div>

              {/* Reveal Overlay Card 2: AI Copilot Pulse */}
              <div className="preview-card-reveal opacity-0 translate-y-6 mt-2 p-3.5 rounded-xl bg-gradient-to-r from-[#005BAC]/10 via-[#0A6FD8]/10 to-[#8CC63F]/10 border border-[#005BAC]/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#8CC63F]/20 text-[#8CC63F] flex items-center justify-center font-bold">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">AI Copilot Trigger</h4>
                    <p className="text-[10px] text-slate-500">"4 students flagged below 75% attendance threshold."</p>
                  </div>
                </div>
                <span className="text-[10px] font-extrabold text-[#005BAC] dark:text-[#8CC63F] border border-[#005BAC]/30 px-2.5 py-1 rounded-md">
                  RAG Active
                </span>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* ─── Scroll Prompt ─── */}
      <div className="text-center pt-6 relative z-10">
        <button
          onClick={() => onNavigate('problem')}
          className="group inline-flex flex-col items-center gap-1.5 text-slate-400 hover:text-[#005BAC] dark:hover:text-[#8CC63F] transition-colors"
          aria-label="Scroll to exploration"
        >
          <span className="text-[10px] uppercase font-extrabold tracking-[0.2em] group-hover:tracking-[0.3em] transition-all">
            Scroll to Explore Story
          </span>
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </button>
      </div>
    </section>
  );
};
