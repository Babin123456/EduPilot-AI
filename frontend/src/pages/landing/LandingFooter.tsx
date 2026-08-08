import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Mail, Globe, ArrowUp, ShieldCheck, BookOpen, HelpCircle, Scale, Shield, Sparkles, Bot, FileText, CheckSquare, BarChart3, Notebook, Folder, ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface LandingFooterProps {
  onNavigate: (sectionId: string) => void;
}

export const LandingFooter: React.FC<LandingFooterProps> = ({ onNavigate }) => {
  const navigate = useNavigate();
  const footerRef = useRef<HTMLElement>(null);
  const maskRef = useRef<SVGRectElement>(null);

  useEffect(() => {
    if (!footerRef.current || !maskRef.current) return;

    const ctx = gsap.context(() => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) {
        gsap.set(maskRef.current, { attr: { x: '0%' } });
        return;
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: footerRef.current,
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
      });

      tl.from('.footer-eyebrow', { opacity: 0, y: 15, duration: 0.5, ease: 'power2.out' })
        .from('.footer-content-reveal', { opacity: 0, y: 15, duration: 0.5, stagger: 0.08, ease: 'power2.out' }, '-=0.3')
        .from('.footer-svg-typography', { opacity: 0, y: 20, duration: 0.6, ease: 'power3.out' }, '-=0.3');

      gsap.fromTo(
        maskRef.current,
        { attr: { x: '-25%' } },
        {
          attr: { x: '115%' },
          duration: 4.5,
          ease: 'power2.inOut',
          repeat: -1,
          repeatDelay: 0.8,
        }
      );
    }, footerRef);

    return () => ctx.revert();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      ref={footerRef}
      className="relative bg-slate-100 dark:bg-[#050B16] text-slate-700 dark:text-slate-300 overflow-hidden py-10 transition-colors duration-300 border-t border-slate-200 dark:border-slate-800/80 flex flex-col justify-between"
    >
      {/* ─── Top Animated Horizontal Divider Line ─── */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#005BAC] via-[#8CC63F] to-[#005BAC] opacity-80" />

      {/* ─── MANDALA ART BACKGROUND PATTERN OVERLAY ─── */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.06] flex items-center justify-center overflow-hidden">
        <svg viewBox="0 0 800 800" className="w-[800px] h-[800px] animate-spin-slow">
          <circle cx="400" cy="400" r="380" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="6 6" />
          <circle cx="400" cy="400" r="300" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="400" cy="400" r="220" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="12 6" />
          <circle cx="400" cy="400" r="140" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <g stroke="currentColor" strokeWidth="1">
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => (
              <path key={angle} d={`M 400 400 L ${400 + 380 * Math.cos((angle * Math.PI) / 180)} ${400 + 380 * Math.sin((angle * Math.PI) / 180)}`} />
            ))}
          </g>
          <g fill="none" stroke="currentColor" strokeWidth="1">
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
              <circle key={angle} cx={400 + 220 * Math.cos((angle * Math.PI) / 180)} cy={400 + 220 * Math.sin((angle * Math.PI) / 180)} r="60" />
            ))}
          </g>
        </svg>
      </div>

      {/* ─── Ambient Glow Orbs ─── */}
      <div
        className="absolute top-1/4 left-[15%] w-[400px] h-[400px] rounded-full pointer-events-none blur-3xl opacity-15 dark:opacity-20"
        style={{ background: 'radial-gradient(circle, rgba(0,91,172,0.3) 0%, transparent 70%)' }}
      />
      <div
        className="absolute bottom-1/4 right-[15%] w-[350px] h-[350px] rounded-full pointer-events-none blur-3xl opacity-10 dark:opacity-15"
        style={{ background: 'radial-gradient(circle, rgba(140,198,63,0.3) 0%, transparent 70%)' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full space-y-8">
        
        {/* ─── TOP BAR: Brand Header & Platform Mission ─── */}
        <div className="footer-eyebrow flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#005BAC] to-[#8CC63F] text-white flex items-center justify-center font-black text-xl shadow-md">
              EP
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight">EduPilot AI</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#005BAC]/10 text-[#005BAC] dark:bg-[#8CC63F]/20 dark:text-[#8CC63F]">
                  <Sparkles className="w-3 h-3 text-[#8CC63F]" /> Academic OS
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Adamas University • School of Engineering & Technology</p>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md text-center md:text-right">
            Streamlining institutional operations, class velocity analytics, and RAG-powered classroom copiloting for Adamas faculty.
          </p>
        </div>

        {/* ─── MIDDLE CONTENT GRID: Proper SaaS Platform Columns with Hover Colors & Next-To-Text Icons ─── */}
        <div className="footer-content-reveal grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-xs">
          
          {/* Column 1: Core Platform */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-[#005BAC] dark:text-[#8CC63F]" />
              <span>Core Platform</span>
            </h4>
            <ul className="space-y-2 text-slate-600 dark:text-slate-400">
              <li>
                <button onClick={() => navigate('/ai')} className="hover:text-[#005BAC] dark:hover:text-[#8CC63F] transition-colors flex items-center gap-2 group">
                  <Bot className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#005BAC] dark:group-hover:text-[#8CC63F] transition-colors" />
                  <span>EduPilot AI Copilot</span>
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('features')} className="hover:text-[#005BAC] dark:hover:text-[#8CC63F] transition-colors flex items-center gap-2 group">
                  <FileText className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#005BAC] dark:group-hover:text-[#8CC63F] transition-colors" />
                  <span>Lesson Planner Engine</span>
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('features')} className="hover:text-[#005BAC] dark:hover:text-[#8CC63F] transition-colors flex items-center gap-2 group">
                  <CheckSquare className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#005BAC] dark:group-hover:text-[#8CC63F] transition-colors" />
                  <span>Batch Attendance & Risk Alerts</span>
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('analytics')} className="hover:text-[#005BAC] dark:hover:text-[#8CC63F] transition-colors flex items-center gap-2 group">
                  <BarChart3 className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#005BAC] dark:group-hover:text-[#8CC63F] transition-colors" />
                  <span>Classroom Velocity Analytics</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2: Document & Content Studio */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Folder className="w-3.5 h-3.5 text-[#005BAC] dark:text-[#8CC63F]" />
              <span>Studio & Assets</span>
            </h4>
            <ul className="space-y-2 text-slate-600 dark:text-slate-400">
              <li>
                <button onClick={() => onNavigate('documents')} className="hover:text-[#005BAC] dark:hover:text-[#8CC63F] transition-colors flex items-center gap-2 group">
                  <Folder className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#005BAC] dark:group-hover:text-[#8CC63F] transition-colors" />
                  <span>Document Studio</span>
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('documents')} className="hover:text-[#005BAC] dark:hover:text-[#8CC63F] transition-colors flex items-center gap-2 group">
                  <Notebook className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#005BAC] dark:group-hover:text-[#8CC63F] transition-colors" />
                  <span>Daily Lecture Notes</span>
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('features')} className="hover:text-[#005BAC] dark:hover:text-[#8CC63F] transition-colors flex items-center gap-2 group">
                  <FileText className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#005BAC] dark:group-hover:text-[#8CC63F] transition-colors" />
                  <span>Question Bank Generator</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Documentation & Help */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#005BAC] dark:text-[#8CC63F]" />
              <span>Resources & Help</span>
            </h4>
            <ul className="space-y-2 text-slate-600 dark:text-slate-400">
              <li>
                <Link to="/docs" className="hover:text-[#005BAC] dark:hover:text-[#8CC63F] transition-colors flex items-center gap-2 group">
                  <BookOpen className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#005BAC] dark:group-hover:text-[#8CC63F] transition-colors" />
                  <span>Documentation</span>
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-[#005BAC] dark:hover:text-[#8CC63F] transition-colors flex items-center gap-2 group">
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#005BAC] dark:group-hover:text-[#8CC63F] transition-colors" />
                  <span>FAQs (15+ Q&A)</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Institutional Contact & Legal */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#005BAC] dark:text-[#8CC63F]" />
              <span>Institution & Legal</span>
            </h4>
            <ul className="space-y-2 text-slate-600 dark:text-slate-400">
              <li>
                <a href="https://adamasuniversity.ac.in" target="_blank" rel="noopener noreferrer" className="hover:text-[#005BAC] dark:hover:text-[#8CC63F] transition-colors flex items-center gap-2 group">
                  <Globe className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#005BAC] dark:group-hover:text-[#8CC63F] transition-colors" />
                  <span>adamasuniversity.ac.in</span>
                </a>
              </li>
              <li>
                <a href="mailto:support@adamasuniversity.ac.in" className="hover:text-[#005BAC] dark:hover:text-[#8CC63F] transition-colors flex items-center gap-2 group">
                  <Mail className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#005BAC] dark:group-hover:text-[#8CC63F] transition-colors" />
                  <span>support@adamasuniversity.ac.in</span>
                </a>
              </li>
              <li>
                <Link to="/terms" className="hover:text-[#005BAC] dark:hover:text-[#8CC63F] transition-colors flex items-center gap-2 group">
                  <Scale className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#005BAC] dark:group-hover:text-[#8CC63F] transition-colors" />
                  <span>Terms & Service</span>
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-[#005BAC] dark:hover:text-[#8CC63F] transition-colors flex items-center gap-2 group">
                  <Shield className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#005BAC] dark:group-hover:text-[#8CC63F] transition-colors" />
                  <span>Privacy Policy</span>
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* ─── BOTTOM LAYER: GIANT ANIMATED OUTLINE TYPOGRAPHY AT VERY BOTTOM ─── */}
        <div className="footer-svg-typography relative flex flex-col justify-center items-center pt-2 select-none overflow-hidden border-t border-slate-200 dark:border-slate-800/60">
          <svg
            viewBox="0 0 1000 130"
            className="w-full max-w-[95vw] h-auto max-h-[130px] overflow-visible"
            aria-label="EDUPILOT Giant Animated Typography"
          >
            <defs>
              <linearGradient id="sweepGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#005BAC" stopOpacity="0.2" />
                <stop offset="40%" stopColor="#0A6FD8" stopOpacity="1" />
                <stop offset="70%" stopColor="#8CC63F" stopOpacity="1" />
                <stop offset="100%" stopColor="#8CC63F" stopOpacity="0.2" />
              </linearGradient>

              <linearGradient id="maskFade" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#000" stopOpacity="0" />
                <stop offset="25%" stopColor="#fff" stopOpacity="1" />
                <stop offset="75%" stopColor="#fff" stopOpacity="1" />
                <stop offset="100%" stopColor="#000" stopOpacity="0" />
              </linearGradient>

              <mask id="travelingMask" maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="130">
                <rect
                  ref={maskRef}
                  x="-25%"
                  y="0"
                  width="25%"
                  height="130"
                  fill="url(#maskFade)"
                />
              </mask>

              <filter id="activeGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#0A6FD8" floodOpacity="0.4" />
                <feDropShadow dx="0" dy="0" stdDeviation="12" floodColor="#8CC63F" floodOpacity="0.25" />
              </filter>
            </defs>

            <text
              x="500"
              y="100"
              textAnchor="middle"
              className="font-black tracking-[0.08em] fill-transparent stroke-[#005BAC]/30 dark:stroke-[#005BAC]/40"
              style={{
                fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif",
                fontSize: "110px",
                fontWeight: 900,
                strokeWidth: "1.8px",
              }}
            >
              EDUPILOT
            </text>

            <g mask="url(#travelingMask)" filter="url(#activeGlow)">
              <text
                x="500"
                y="100"
                textAnchor="middle"
                className="font-black tracking-[0.08em]"
                style={{
                  fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif",
                  fontSize: "110px",
                  fontWeight: 900,
                  fill: "url(#sweepGradient)",
                  stroke: "#0A6FD8",
                  strokeWidth: "2.5px",
                }}
              >
                EDUPILOT
              </text>
            </g>
          </svg>

          {/* Copyright & Scroll To Top Row with "Back to Top" */}
          <div className="w-full flex items-center justify-between pt-2 text-[11px] text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#8CC63F]" />
              <span>© {new Date().getFullYear()} EduPilot AI — Adamas University. All rights reserved.</span>
            </div>
            <button
              onClick={scrollToTop}
              className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-[#005BAC] hover:text-white dark:hover:bg-[#8CC63F] dark:hover:text-slate-950 transition-all flex items-center gap-1.5 text-[11px] font-bold shadow-sm"
              aria-label="Back to Top"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              <span>Back to Top</span>
            </button>
          </div>

        </div>

      </div>
    </footer>
  );
};
