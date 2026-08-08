import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Menu, X, ArrowRight, ShieldCheck, BookOpen, HelpCircle } from 'lucide-react';

interface LandingNavbarProps {
  onNavigate: (sectionId: string) => void;
}

export const LandingNavbar: React.FC<LandingNavbarProps> = ({ onNavigate }) => {
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Features', id: 'features' },
    { label: 'AI Workflow', id: 'workflow' },
    { label: 'Analytics', id: 'analytics' },
    { label: 'Document Studio', id: 'documents' },
  ];

  const handleNavClick = (id: string) => {
    setMobileMenuOpen(false);
    onNavigate(id);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 shadow-md py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#005BAC] to-[#8CC63F] text-white flex items-center justify-center font-bold text-xl shadow-md group-hover:scale-105 transition-transform duration-200">
            EP
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight">
                EduPilot AI
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#005BAC]/10 text-[#005BAC] dark:bg-[#8CC63F]/20 dark:text-[#8CC63F]">
                <ShieldCheck className="w-3 h-3" /> AU OS
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wide">
              Adamas University
            </p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-[#005BAC] dark:hover:text-[#8CC63F] transition-colors"
            >
              {link.label}
            </button>
          ))}
          <Link to="/docs" className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-[#005BAC] dark:hover:text-[#8CC63F] transition-colors flex items-center gap-1">
            <BookOpen className="w-4 h-4" /> Docs
          </Link>
          <Link to="/faq" className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-[#005BAC] dark:hover:text-[#8CC63F] transition-colors flex items-center gap-1">
            <HelpCircle className="w-4 h-4" /> FAQ
          </Link>
        </nav>

        {/* Right CTA Actions */}
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle light and dark mode"
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-amber-400" />}
          </button>

          <button
            onClick={() => navigate('/login')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#005BAC] hover:bg-[#0A6FD8] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all duration-200 active:scale-95"
          >
            <span>Teacher Login</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-amber-400" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-700 dark:text-slate-200"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-[#0F172A] border-b border-slate-200 dark:border-slate-800 px-6 py-6 shadow-xl"
          >
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className="text-left text-base font-medium text-slate-700 dark:text-slate-200 hover:text-[#005BAC] dark:hover:text-[#8CC63F]"
                >
                  {link.label}
                </button>
              ))}
              <Link to="/docs" onClick={() => setMobileMenuOpen(false)} className="text-left text-base font-medium text-slate-700 dark:text-slate-200 hover:text-[#005BAC] dark:hover:text-[#8CC63F]">
                Docs
              </Link>
              <Link to="/faq" onClick={() => setMobileMenuOpen(false)} className="text-left text-base font-medium text-slate-700 dark:text-slate-200 hover:text-[#005BAC] dark:hover:text-[#8CC63F]">
                FAQ
              </Link>
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-3">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/login');
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#005BAC] text-white text-xs font-bold flex items-center justify-center gap-2"
                >
                  <span>Teacher Login</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
