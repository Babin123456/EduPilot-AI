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
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });

      // Step 1 & 2: Reveal footer elements
      tl.from('.footer-eyebrow', { opacity: 0, y: 20, duration: 0.6, ease: 'power2.out' })
        .from('.footer-svg-typography', { opacity: 0, y: 30, duration: 0.8, ease: 'power3.out' }, '-=0.3')
        .from('.footer-content-reveal', { opacity: 0, y: 20, duration: 0.6, stagger: 0.1, ease: 'power2.out' }, '-=0.4');

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
      className="relative bg-[#050B16] text-slate-300 overflow-hidden pt-20 pb-12 transition-colors duration-200 border-t border-slate-800/80"
    >
      {/* ─── Top Animated Horizontal Divider Line (Blue → Green → Blue) ─── */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#005BAC] via-[#8CC63F] to-[#005BAC] opacity-80" />

      {/* ─── Subtle Ambient Background Glows ─── */}
      <div
        className="absolute top-1/4 left-[15%] w-[500px] h-[500px] rounded-full pointer-events-none blur-3xl opacity-20"
        style={{ background: 'radial-gradient(circle, rgba(0,91,172,0.4) 0%, transparent 70%)' }}
      />
      <div
        className="absolute bottom-1/4 right-[15%] w-[450px] h-[450px] rounded-full pointer-events-none blur-3xl opacity-15"
        style={{ background: 'radial-gradient(circle, rgba(140,198,63,0.3) 0%, transparent 70%)' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        {/* ─── LAYER 1 & 2: Eyebrow + Product Branding ─── */}
        <div className="footer-eyebrow text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-slate-700/60 backdrop-blur-md text-[11px] font-extrabold uppercase tracking-[0.25em] text-[#8CC63F]">
            <Sparkles className="w-3.5 h-3.5 text-[#0A6FD8]" />
            <span>AI Academic Operating System</span>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#005BAC] to-[#8CC63F] text-white flex items-center justify-center font-bold text-base shadow-lg">
              EP
            </div>
            <span className="text-xl font-extrabold text-white tracking-tight">EduPilot AI</span>
            <span className="text-xs text-slate-500 font-semibold">• Adamas University</span>
          </div>
        </div>

        {/* ─── LAYER 3: GIANT ANIMATED OUTLINE TYPOGRAPHY WITH TRAVELING HIGHLIGHT SWEEP ─── */}
        <div className="footer-svg-typography relative flex justify-center items-center py-4 my-2 select-none overflow-hidden">
          <svg
            viewBox="0 0 1000 160"
            className="w-full max-w-[95vw] h-auto max-h-[180px] overflow-visible"
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
              <mask id="travelingMask" maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="160">
                <rect
                  ref={maskRef}
                  x="-25%"
                  y="0"
                  width="25%"
                  height="160"
                  fill="url(#maskFade)"
                />
              </mask>

              {/* Glowing Drop Shadows for Active Letters */}
              <filter id="activeGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#0A6FD8" floodOpacity="0.45" />
                <feDropShadow dx="0" dy="0" stdDeviation="14" floodColor="#8CC63F" floodOpacity="0.25" />
              </filter>
            </defs>

            {/* LAYER 1 (SVG): Inactive Thin Blue Outline Typography */}
            <text
              x="500"
              y="115"
              textAnchor="middle"
              className="font-black tracking-[0.08em]"
              style={{
                fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif",
                fontSize: "125px",
                fontWeight: 900,
                fill: "transparent",
                stroke: "rgba(0, 91, 172, 0.30)",
                strokeWidth: "1.8px",
              }}
            >
              EDUPILOT
            </text>

            {/* LAYER 2 (SVG): Active Gradient Illumination revealed by Traveling Mask */}
            <g mask="url(#travelingMask)" filter="url(#activeGlow)">
              <text
                x="500"
                y="115"
                textAnchor="middle"
                className="font-black tracking-[0.08em]"
                style={{
                  fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif",
                  fontSize: "125px",
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
        </div>

        {/* ─── LAYER 4: Supporting Statement ─── */}
        <div className="footer-content-reveal text-center max-w-2xl mx-auto space-y-2">
          <p className="text-xs sm:text-sm text-slate-400 font-medium leading-relaxed">
            AI-powered academic workflows designed to help university faculty spend less time managing administrative work and more time teaching.
          </p>
        </div>

        {/* ─── LAYER 5 & 6: Navigation + CTA ─── */}
        <div className="footer-content-reveal grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 pt-6 border-t border-slate-800/60 text-xs">
          {/* Column 1: Platform */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Platform</h4>
            <ul className="space-y-2.5 text-slate-400">
              <li><button onClick={() => navigate('/dashboard')} className="hover:text-white transition-colors duration-200">Dashboard</button></li>
              <li><button onClick={() => navigate('/attendance')} className="hover:text-white transition-colors duration-200">Attendance</button></li>
              <li><button onClick={() => navigate('/students')} className="hover:text-white transition-colors duration-200">Students Roster</button></li>
              <li><button onClick={() => navigate('/assignments')} className="hover:text-white transition-colors duration-200">Assignments</button></li>
              <li><button onClick={() => navigate('/assessments')} className="hover:text-white transition-colors duration-200">Assessments</button></li>
            </ul>
          </div>

          {/* Column 2: AI Tools */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">AI Tools</h4>
            <ul className="space-y-2.5 text-slate-400">
              <li><button onClick={() => navigate('/ai')} className="hover:text-white transition-colors duration-200">EduPilot AI Copilot</button></li>
              <li><button onClick={() => onNavigate('features')} className="hover:text-white transition-colors duration-200">Lesson Planner</button></li>
              <li><button onClick={() => onNavigate('features')} className="hover:text-white transition-colors duration-200">Quiz Generator</button></li>
              <li><button onClick={() => onNavigate('documents')} className="hover:text-white transition-colors duration-200">Presentation Studio</button></li>
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Resources</h4>
            <ul className="space-y-2.5 text-slate-400">
              <li><Link to="/docs" className="hover:text-white transition-colors duration-200 flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5 text-[#0A6FD8]" /> Documentation</Link></li>
              <li><Link to="/faq" className="hover:text-white transition-colors duration-200 flex items-center gap-1.5"><HelpCircle className="w-3.5 h-3.5 text-[#8CC63F]" /> FAQs</Link></li>
              <li><button onClick={() => navigate('/documents')} className="hover:text-white transition-colors duration-200">Document Studio</button></li>
            </ul>
          </div>

          {/* Column 4: Institution */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Institution</h4>
            <ul className="space-y-2.5 text-slate-400">
              <li className="font-semibold text-slate-300">Adamas University</li>
              <li className="text-[11px] text-slate-400">Department of Computer Science & Engineering</li>
              <li><a href="https://adamasuniversity.ac.in" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors duration-200 flex items-center gap-1"><Globe className="w-3 h-3 text-[#005BAC]" /> adamasuniversity.ac.in</a></li>
              <li><a href="mailto:support@adamasuniversity.ac.in" className="hover:text-white transition-colors duration-200 flex items-center gap-1"><Mail className="w-3 h-3 text-[#8CC63F]" /> Support Email</a></li>
            </ul>
          </div>

          {/* Column 5: CTA Action Buttons */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1 space-y-3 flex flex-col justify-start">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Faculty Access</h4>
            <div className="space-y-2.5 pt-1">
              <button
                onClick={() => navigate('/login')}
                className="btn-magnetic w-full py-3 px-4 rounded-xl bg-[#005BAC] hover:bg-[#0A6FD8] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg"
              >
                <GraduationCap className="w-4 h-4" />
                <span>Teacher Login</span>
              </button>
              <button
                onClick={() => onNavigate('features')}
                className="btn-magnetic w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#005BAC]/30 to-[#8CC63F]/30 hover:from-[#005BAC]/50 hover:to-[#8CC63F]/50 text-white font-bold text-xs border border-slate-700 flex items-center justify-center gap-2"
              >
                <span>Explore EduPilot</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#8CC63F]" />
              </button>
            </div>
          </div>
        </div>

        {/* ─── LAYER 7: Bottom Bar & Legal ─── */}
        <div className="footer-content-reveal pt-8 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#8CC63F]" />
            <span>© {new Date().getFullYear()} EduPilot AI — Adamas University. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-5">
            <Link to="/terms" className="hover:text-white transition-colors duration-200 flex items-center gap-1"><Scale className="w-3 h-3" /> Terms</Link>
            <Link to="/privacy" className="hover:text-white transition-colors duration-200 flex items-center gap-1"><Shield className="w-3 h-3" /> Privacy</Link>
            <Link to="/faq" className="hover:text-white transition-colors duration-200">FAQ</Link>
            <Link to="/docs" className="hover:text-white transition-colors duration-200">Docs</Link>
            <button
              onClick={scrollToTop}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 flex items-center gap-1 transition-all duration-200 hover:scale-105"
              aria-label="Back to top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
