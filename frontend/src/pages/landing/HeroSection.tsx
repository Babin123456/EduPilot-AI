import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowRight, Sparkles, CheckCircle2, ChevronDown, Bot, BarChart3,
  FileText, ShieldCheck, Zap, Users, Award, Play, Check, Clock
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface HeroSectionProps {
  onNavigate: (sectionId: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onNavigate }) => {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLElement>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'analytics' | 'quiz'>('chat');

  useEffect(() => {
    if (!heroRef.current) return;
    const ctx = gsap.context(() => {
      // Hero title entrance
      gsap.from('.hero-title-line', {
        y: 60, opacity: 0, duration: 1,
        stagger: 0.12, ease: 'power4.out', delay: 0.2,
      });
      // Subtitle & bullets entrance
      gsap.from('.hero-subtitle', {
        y: 30, opacity: 0, duration: 0.8, ease: 'power3.out', delay: 0.5,
      });
      // CTA buttons entrance
      gsap.from('.hero-cta', {
        y: 25, opacity: 0, duration: 0.7,
        stagger: 0.1, ease: 'power3.out', delay: 0.8,
      });
      // Floating animation for the hero showcase card
      gsap.to('.floating-hero-showcase', {
        y: -15,
        duration: 3.5,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut',
      });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen pt-28 pb-20 flex flex-col justify-between overflow-hidden bg-slate-50 dark:bg-[#061220] transition-colors duration-300 select-none"
    >
      {/* ─── High-Energy Ambient Background Orbs & Matrix ─── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Fine grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800c_1px,transparent_1px),linear-gradient(to_bottom,#8080800c_1px,transparent_1px)] bg-[size:40px_40px]" />

        {/* Ambient vibrant glowing orbs */}
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#005BAC]/25 via-[#0A6FD8]/20 to-emerald-400/15 blur-3xl animate-pulse" />
        <div className="absolute top-[45%] -left-48 w-[550px] h-[550px] rounded-full bg-gradient-to-tr from-[#8CC63F]/25 via-[#005BAC]/15 to-blue-600/10 blur-3xl opacity-80" />
        <div className="absolute -bottom-20 right-[20%] w-[400px] h-[400px] rounded-full bg-emerald-500/15 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* ─── Left Column: Headline & Call To Actions ─── */}
          <div className="lg:col-span-6 space-y-7 text-center lg:text-left">
            
            {/* Glowing Pill Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/80 dark:bg-slate-900/80 border border-emerald-500/30 dark:border-emerald-400/30 shadow-md backdrop-blur-md"
            >
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8CC63F] opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#8CC63F]" />
              </span>
              <Sparkles className="w-4 h-4 text-[#8CC63F]" />
              <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Next-Gen Academic OS for Universities
              </span>
            </motion.div>

            {/* Main Headline with High-Impact Gradient */}
            <h1 className="text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-black tracking-tight leading-[1.1]">
              <span className="hero-title-line block text-slate-900 dark:text-white">
                Empower Teaching with
              </span>
              <span className="hero-title-line block bg-gradient-to-r from-[#005BAC] via-[#0A6FD8] to-[#8CC63F] bg-clip-text text-transparent mt-1">
                EduPilot AI OS
              </span>
            </h1>

            {/* Subtitle */}
            <p className="hero-subtitle text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl font-medium leading-relaxed mx-auto lg:mx-0">
              Eliminate administrative burden. Harness artificial intelligence for instant attendance tracking, automated lesson planning, institutional risk analytics, and RAG-grounded class insights.
            </p>

            {/* Value Feature Pills */}
            <div className="hero-bullets pt-1 flex flex-wrap justify-center lg:justify-start gap-3 text-xs font-extrabold text-slate-700 dark:text-slate-200">
              <span className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/80 flex items-center gap-2 text-[#005BAC] dark:text-blue-300 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-[#8CC63F]" /> 1-Click Class RAG Context
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/80 flex items-center gap-2 text-emerald-700 dark:text-emerald-300 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-[#8CC63F]" /> AI Quiz & Lecture Generator
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200/80 dark:border-purple-800/80 flex items-center gap-2 text-purple-700 dark:text-purple-300 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-[#8CC63F]" /> Real-Time Risk Analytics
              </span>
            </div>

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button
                onClick={() => navigate('/login')}
                className="hero-cta w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[#005BAC] to-[#0A6FD8] hover:from-[#0A6FD8] hover:to-[#005BAC] text-white font-extrabold text-sm shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-3 border border-blue-400/30 group"
              >
                <span>Teacher Portal Login</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
              </button>

              <button
                onClick={() => onNavigate('features')}
                className="hero-cta w-full sm:w-auto px-8 py-4 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-extrabold text-sm border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 text-[#8CC63F]" />
                <span>Explore Features</span>
              </button>
            </div>

            {/* Trust Metrics Bar */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-center lg:justify-start gap-8 text-slate-500 dark:text-slate-400 text-xs">
              <div>
                <p className="text-base font-black text-slate-900 dark:text-white">720+</p>
                <p className="text-[10px] font-bold uppercase tracking-wider">Students Tracked</p>
              </div>
              <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
              <div>
                <p className="text-base font-black text-emerald-600 dark:text-emerald-400">98%</p>
                <p className="text-[10px] font-bold uppercase tracking-wider">Time Saved</p>
              </div>
              <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
              <div>
                <p className="text-base font-black text-[#005BAC] dark:text-sky-400">100%</p>
                <p className="text-[10px] font-bold uppercase tracking-wider">RAG Grounded</p>
              </div>
            </div>

          </div>

          {/* ─── Right Column: Interactive Live System Showcase Card ─── */}
          <div className="lg:col-span-6 relative flex items-center justify-center">
            <div className="floating-hero-showcase relative w-full max-w-lg lg:max-w-xl">
              
              {/* Glassmorphic Mockup Container */}
              <div className="bg-white/90 dark:bg-slate-900/90 rounded-3xl border border-slate-200/90 dark:border-slate-700/80 shadow-2xl overflow-hidden backdrop-blur-xl transition-all">
                
                {/* Window Header Toolbar */}
                <div className="px-5 py-3.5 bg-slate-100/90 dark:bg-slate-950/90 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500" />
                    <span className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="ml-2 text-xs font-mono font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#005BAC] dark:text-[#8CC63F]" /> EduPilot OS Live Preview
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold uppercase border border-emerald-500/20">
                    Active System
                  </span>
                </div>

                {/* Tab Switcher */}
                <div className="p-2 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('chat')}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      activeTab === 'chat'
                        ? 'bg-[#005BAC] text-white shadow-md'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Bot className="w-3.5 h-3.5" /> AI Chat
                  </button>
                  <button
                    onClick={() => setActiveTab('analytics')}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      activeTab === 'analytics'
                        ? 'bg-[#005BAC] text-white shadow-md'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5" /> Analytics
                  </button>
                  <button
                    onClick={() => setActiveTab('quiz')}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      activeTab === 'quiz'
                        ? 'bg-[#005BAC] text-white shadow-md'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" /> Quiz Studio
                  </button>
                </div>

                {/* Interactive Content Canvas */}
                <div className="p-5 min-h-[300px]">
                  <AnimatePresence mode="wait">
                    {activeTab === 'chat' && (
                      <motion.div
                        key="chat"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-3.5"
                      >
                        <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-2xl border border-blue-200/60 dark:border-blue-800/60 text-xs text-slate-800 dark:text-slate-200 font-medium flex items-start gap-2.5">
                          <div className="w-6 h-6 rounded-lg bg-[#005BAC] text-white flex items-center justify-center flex-shrink-0 text-[10px] font-bold">You</div>
                          <p>Which students in CSE 3rd Year Sec A have attendance below 75%?</p>
                        </div>
                        <div className="p-3.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/70 text-xs text-slate-900 dark:text-slate-100 space-y-2">
                          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-1.5">
                            <span className="font-extrabold text-[#005BAC] dark:text-[#8CC63F] flex items-center gap-1.5">
                              <Bot className="w-4 h-4" /> EduPilot AI RAG Response
                            </span>
                            <span className="text-[9px] font-mono text-slate-400">100% Grounded</span>
                          </div>
                          <p className="leading-relaxed">
                            Found <strong>3 students</strong> requiring attendance warning notices:
                          </p>
                          <ul className="space-y-1 pl-2 text-[11px] font-mono">
                            <li className="text-amber-600 dark:text-amber-400 font-bold">• Roll 104 — Rahul Sharma (68.4% Attendance)</li>
                            <li className="text-amber-600 dark:text-amber-400 font-bold">• Roll 119 — Ananya Sen (71.2% Attendance)</li>
                            <li className="text-amber-600 dark:text-amber-400 font-bold">• Roll 142 — Vikram Singh (69.8% Attendance)</li>
                          </ul>
                          <div className="pt-1 flex items-center gap-2">
                            <button
                              onClick={() => navigate('/login')}
                              className="px-3 py-1 bg-[#005BAC] hover:bg-[#0A6FD8] text-white text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1"
                            >
                              Dispatch Warning Emails →
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {activeTab === 'analytics' && (
                      <motion.div
                        key="analytics"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4"
                      >
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                            <p className="text-[10px] font-extrabold text-slate-500 uppercase">Avg Attendance</p>
                            <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">92.4%</p>
                            <div className="mt-1 h-1.5 w-full bg-emerald-200 dark:bg-emerald-900 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 w-[92%]" />
                            </div>
                          </div>
                          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-800">
                            <p className="text-[10px] font-extrabold text-slate-500 uppercase">Avg Exam Score</p>
                            <p className="text-xl font-black text-[#005BAC] dark:text-sky-400">84.6 / 100</p>
                            <div className="mt-1 h-1.5 w-full bg-blue-200 dark:bg-blue-900 rounded-full overflow-hidden">
                              <div className="h-full bg-[#005BAC] w-[85%]" />
                            </div>
                          </div>
                        </div>
                        <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                          <p className="text-xs font-bold text-slate-900 dark:text-white">Active Section Performance Distribution</p>
                          <div className="space-y-1.5">
                            <div>
                              <div className="flex justify-between text-[10px] font-bold text-slate-600 dark:text-slate-300 mb-0.5">
                                <span>Grade A (Excellence)</span>
                                <span>38 Students (63%)</span>
                              </div>
                              <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 w-[63%]" />
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-[10px] font-bold text-slate-600 dark:text-slate-300 mb-0.5">
                                <span>Grade B (Good Standing)</span>
                                <span>18 Students (30%)</span>
                              </div>
                              <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-[#005BAC] w-[30%]" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {activeTab === 'quiz' && (
                      <motion.div
                        key="quiz"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-3"
                      >
                        <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-2xl border border-purple-200 dark:border-purple-800 flex items-center justify-between">
                          <div>
                            <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">Computer Networks — Quiz 3</h4>
                            <p className="text-[10px] text-slate-500 font-mono">15 MCQs • Topic: TCP 3-Way Handshake</p>
                          </div>
                          <span className="px-2 py-1 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-lg">
                            Ready & Published
                          </span>
                        </div>
                        <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] font-mono space-y-1">
                          <p className="text-slate-800 dark:text-slate-200 font-bold">Q1. What is the initial flag sent in a TCP connection setup?</p>
                          <p className="text-slate-500 text-[10px]">• A) ACK  • B) SYN  • C) FIN  • D) RST</p>
                          <p className="text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">✔ Correct Answer: B (SYN)</p>
                        </div>
                        <button
                          onClick={() => navigate('/login')}
                          className="w-full py-2 bg-gradient-to-r from-[#005BAC] to-[#0A6FD8] text-white text-xs font-bold rounded-xl shadow transition-all hover:opacity-90"
                        >
                          Generate Custom MCQ Question Paper →
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Floating Stat Badge — Top Right */}
              <div className="absolute -top-4 -right-4 glass-card p-3 rounded-2xl flex items-center gap-2.5 shadow-2xl border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[9px] text-slate-400 font-bold uppercase">System Grounding</p>
                  <p className="text-xs font-black text-slate-900 dark:text-white">100% Verified RAG</p>
                </div>
              </div>

              {/* Floating Stat Badge — Bottom Left */}
              <div className="absolute -bottom-4 -left-4 glass-card p-3 rounded-2xl flex items-center gap-2.5 shadow-2xl border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
                <div className="w-8 h-8 rounded-xl bg-[#005BAC]/20 text-[#005BAC] dark:text-[#8CC63F] flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[9px] text-slate-400 font-bold uppercase">Faculty Rating</p>
                  <p className="text-xs font-black text-slate-900 dark:text-white">4.9 / 5.0 Grade</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* ─── Bottom Scroll Prompt ─── */}
      <div className="text-center pt-8 relative z-10">
        <button
          onClick={() => onNavigate('features')}
          className="group inline-flex flex-col items-center gap-1 text-slate-400 hover:text-[#005BAC] dark:hover:text-[#8CC63F] transition-colors"
          aria-label="Scroll to features"
        >
          <span className="text-[10px] uppercase font-black tracking-[0.2em] group-hover:tracking-[0.3em] transition-all">Explore University Features</span>
          <ChevronDown className="w-4 h-4 animate-bounce text-[#8CC63F]" />
        </button>
      </div>
    </section>
  );
};
