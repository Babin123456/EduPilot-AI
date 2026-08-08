import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Mail, Globe, ArrowUp, ShieldCheck, BookOpen, HelpCircle, Scale, Shield, Sparkles, GraduationCap, ArrowRight } from 'lucide-react';

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
      // Check prefers-reduced-motion
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) {
        gsap.set(maskRef.current, { attr: { x: '0%' } });
        return;
      }

      // ScrollTrigger timeline for reveal + continuous highlight sweep
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: footerRef.current,
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
      });

      // Step 1 & 2: Reveal footer elements
      tl.from('.footer-eyebrow', { opacity: 0, y: 15, duration: 0.5, ease: 'power2.out' })
        .from('.footer-content-reveal', { opacity: 0, y: 15, duration: 0.5, stagger: 0.08, ease: 'power2.out' }, '-=0.3')
        .from('.footer-svg-typography', { opacity: 0, y: 20, duration: 0.6, ease: 'power3.out' }, '-=0.3');

      // Continuous Traveling Highlight Sweep loop
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
      className="relative bg-slate-100 dark:bg-[#050B16] text-slate-700 dark:text-slate-300 overflow-hidden py-8 sm:py-10 transition-colors duration-300 border-t border-slate-200 dark:border-slate-800/80 flex flex-col justify-between min-h-none"
    >
      {/* ─── Top Animated Horizontal Divider Line (Blue → Green → Blue) ─── */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#005BAC] via-[#8CC63F] to-[#005BAC] opacity-80" />

      {/* ─── Subtle Ambient Background Glows ─── */}
      <div
        className="absolute top-1/4 left-[15%] w-[400px] h-[400px] rounded-full pointer-events-none blur-3xl opacity-15 dark:opacity-20"
        style={{ background: 'radial-gradient(circle, rgba(0,91,172,0.3) 0%, transparent 70%)' }}
      />
      <div
        className="absolute bottom-1/4 right-[15%] w-[350px] h-[350px] rounded-full pointer-events-none blur-3xl opacity-10 dark:opacity-15"
        style={{ background: 'radial-gradient(circle, rgba(140,198,63,0.3) 0%, transparent 70%)' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full space-y-6 sm:space-y-8">
        
        {/* ─── TOP BAR: Brand Eyebrow + Faculty Access CTA Buttons ─── */}
        <div className="footer-eyebrow flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800/60">
          
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#005BAC] to-[#8CC63F] text-white flex items-center justify-center font-black text-lg shadow-md">
              EP
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-slate-900 dark:text-white tracking-tight">EduPilot AI</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#005BAC]/10 text-[#005BAC] dark:bg-[#8CC63F]/20 dark:text-[#8CC63F]">
                  <Sparkles className="w-3 h-3" /> AU Academic OS
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Adamas University • Dept. of CSE</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => navigate('/login')}
              className="btn-magnetic flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-[#005BAC] hover:bg-[#0A6FD8] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all duration-200"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Teacher Login</span>
            </button>
            <button
              onClick={() => onNavigate('features')}
              className="btn-magnetic flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800/80 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs border border-slate-300 dark:border-slate-700 flex items-center justify-center gap-1.5 transition-all duration-200"
            >
              <span>Explore Features</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#005BAC] dark:text-[#8CC63F]" />
            </button>
          </div>

        </div>

        {/* ─── MIDDLE CONTENT GRID: AI Tools, Resources, Institution ─── */}
        <div className="footer-content-reveal grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
          
          {/* Column 1: AI Tools */}
          <div className="space-y-2">
            <h4 className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">AI Tools</h4>
            <ul className="space-y-1.5 text-slate-600 dark:text-slate-400">
              <li><button onClick={() => navigate('/ai')} className="hover:text-[#005BAC] dark:hover:text-white transition-colors">EduPilot AI Copilot</button></li>
              <li><button onClick={() => onNavigate('features')} className="hover:text-[#005BAC] dark:hover:text-white transition-colors">Lesson Planner & Syllabus Breakdown</button></li>
              <li><button onClick={() => onNavigate('features')} className="hover:text-[#005BAC] dark:hover:text-white transition-colors">Quiz & Exam Bank Generator</button></li>
              <li><button onClick={() => onNavigate('documents')} className="hover:text-[#005BAC] dark:hover:text-white transition-colors">Presentation & Document Studio</button></li>
            </ul>
          </div>

          {/* Column 2: Resources */}
          <div className="space-y-2">
            <h4 className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">Resources</h4>
            <ul className="space-y-1.5 text-slate-600 dark:text-slate-400">
              <li><Link to="/docs" className="hover:text-[#005BAC] dark:hover:text-white transition-colors flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5 text-[#005BAC] dark:text-[#0A6FD8]" /> Documentation & Guides</Link></li>
              <li><Link to="/faq" className="hover:text-[#005BAC] dark:hover:text-white transition-colors flex items-center gap-1.5"><HelpCircle className="w-3.5 h-3.5 text-[#8CC63F]" /> FAQs (15+ Answers)</Link></li>
              <li><button onClick={() => navigate('/documents')} className="hover:text-[#005BAC] dark:hover:text-white transition-colors">Course Document Repository</button></li>
            </ul>
          </div>

          {/* Column 3: Institution & Legal links */}
          <div className="space-y-2">
            <h4 className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">Institution & Legal</h4>
            <ul className="space-y-1.5 text-slate-600 dark:text-slate-400">
              <li><a href="https://adamasuniversity.ac.in" target="_blank" rel="noopener noreferrer" className="hover:text-[#005BAC] dark:hover:text-white transition-colors flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-[#005BAC]" /> adamasuniversity.ac.in</a></li>
              <li><a href="mailto:support@adamasuniversity.ac.in" className="hover:text-[#005BAC] dark:hover:text-white transition-colors flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-[#8CC63F]" /> support@adamasuniversity.ac.in</a></li>
              <li className="flex items-center gap-3 pt-1">
                <Link to="/terms" className="hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1"><Scale className="w-3 h-3" /> Terms & Service</Link>
                <span className="text-slate-400">•</span>
                <Link to="/privacy" className="hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1"><Shield className="w-3 h-3" /> Privacy Policy</Link>
              </li>
            </ul>
          </div>

        </div>

        {/* ─── BOTTOM LAYER: GIANT ANIMATED OUTLINE TYPOGRAPHY AT VERY BOTTOM ─── */}
        <div className="footer-svg-typography relative flex flex-col justify-center items-center pt-2 select-none overflow-hidden border-t border-slate-200 dark:border-slate-800/60">
          <svg
            viewBox="0 0 1000 140"
            className="w-full max-w-[95vw] h-auto max-h-[140px] overflow-visible"
            aria-label="EDUPILOT Giant Animated Typography"
          >
            <defs>
              {/* Soft Adamas-inspired Sweep Gradient */}
              <linearGradient id="sweepGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#005BAC" stopOpacity="0.2" />
                <stop offset="40%" stopColor="#0A6FD8" stopOpacity="1" />
                <stop offset="70%" stopColor="#8CC63F" stopOpacity="1" />
                <stop offset="100%" stopColor="#8CC63F" stopOpacity="0.2" />
              </linearGradient>

              {/* Feathered Linear Mask for the Traveling Sweep */}
              <linearGradient id="maskFade" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#000" stopOpacity="0" />
                <stop offset="25%" stopColor="#fff" stopOpacity="1" />
                <stop offset="75%" stopColor="#fff" stopOpacity="1" />
                <stop offset="100%" stopColor="#000" stopOpacity="0" />
              </linearGradient>

              {/* Mask Element containing moving rectangle */}
              <mask id="travelingMask" maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="140">
                <rect
                  ref={maskRef}
                  x="-25%"
                  y="0"
                  width="25%"
                  height="140"
                  fill="url(#maskFade)"
                />
              </mask>

              {/* Glowing Drop Shadows for Active Letters */}
              <filter id="activeGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#0A6FD8" floodOpacity="0.4" />
                <feDropShadow dx="0" dy="0" stdDeviation="12" floodColor="#8CC63F" floodOpacity="0.25" />
              </filter>
            </defs>

            {/* LAYER 1 (SVG): Inactive Outline Typography (Light/Dark Compatible) */}
            <text
              x="500"
              y="105"
              textAnchor="middle"
              className="font-black tracking-[0.08em] fill-transparent stroke-[#005BAC]/30 dark:stroke-[#005BAC]/40"
              style={{
                fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif",
                fontSize: "115px",
                fontWeight: 900,
                strokeWidth: "1.8px",
              }}
            >
              EDUPILOT
            </text>

            {/* LAYER 2 (SVG): Active Gradient Illumination revealed by Traveling Mask */}
            <g mask="url(#travelingMask)" filter="url(#activeGlow)">
              <text
                x="500"
                y="105"
                textAnchor="middle"
                className="font-black tracking-[0.08em]"
                style={{
                  fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif",
                  fontSize: "115px",
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

          {/* Copyright & Scroll To Top Row */}
          <div className="w-full flex items-center justify-between pt-2 text-[11px] text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#8CC63F]" />
              <span>© {new Date().getFullYear()} EduPilot AI — Adamas University. All rights reserved.</span>
            </div>
            <button
              onClick={scrollToTop}
              className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-all flex items-center gap-1 text-[10px] font-bold"
              aria-label="Back to top"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Top</span>
            </button>
          </div>

        </div>

      </div>
    </footer>
  );
};
