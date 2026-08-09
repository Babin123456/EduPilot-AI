import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FileText, Presentation, FileCheck, FolderOpen, ArrowRight, Sparkles, Download, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

gsap.registerPlugin(ScrollTrigger);

const TAB_ITEMS = [
  {
    id: 'pdf',
    title: 'PDF Question Papers & Quiz Bundles',
    badge: '.PDF BUNDLE',
    icon: FileText,
    color: 'text-red-500 bg-red-500/10 border-red-500/20',
    description: 'Auto-formatted with official Adamas University exam headers, marking schemes, and 100% MCQ / Short Question options ready for instant distribution.',
    sampleTitle: 'Operating Systems (CS304) — Midterm Examination Paper',
    highlights: ['Adamas University Header & Logo', 'Automated Marks Breakdown (5 Qs × 5 Marks)', 'Answer Key & Grading Rubrics Included'],
  },
  {
    id: 'pptx',
    title: 'PPTX Lecture Slide Outlines',
    badge: '.PPTX DECK',
    icon: Presentation,
    color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    description: 'Structured 10-slide deck outlines generated directly from selected syllabus sub-topics, including speaker notes, key takeaways, and discussion prompts.',
    sampleTitle: 'Blockchain Technology (CS801) — Smart Contract Lifecycle',
    highlights: ['10 Slide Outline Structure', 'Solidity Code Examples & Security Best Practices', 'Speaker Notes & In-Class Discussion Questions'],
  },
  {
    id: 'docx',
    title: 'Syllabus-Aligned Lecture Notes',
    badge: '.DOCX NOTES',
    icon: FileCheck,
    color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    description: 'Comprehensive daily lecture notes in rich Markdown and Word formats, automatically saved into the class Document Vault for student access.',
    sampleTitle: 'Cyber Security (CS802) — Cryptographic Hashing & PKI',
    highlights: ['Complete Topic Breakdown', 'Key Formulas & Code Snippets', 'Saved in Class Vault for 1-Click Sharing'],
  },
];

export const DocumentStudioSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeTab, setActiveTab] = useState<string>('pdf');
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => {
      setActiveTab((prev) => {
        const currentIndex = TAB_ITEMS.findIndex((t) => t.id === prev);
        const nextIndex = (currentIndex + 1) % TAB_ITEMS.length;
        return TAB_ITEMS[nextIndex].id;
      });
    }, 2000); // 4-Second Automatic Slide Flow

    return () => clearInterval(interval);
  }, [paused]);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from('.doc-header', {
        y: 40, opacity: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', toggleActions: 'play none none reverse' },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const currentTab = TAB_ITEMS.find((t) => t.id === activeTab) || TAB_ITEMS[0];


  return (
    <section id="documents" ref={sectionRef} className="py-28 bg-slate-50 dark:bg-[#0F172A] relative overflow-hidden transition-colors duration-200 wave-divider">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 right-0 w-[450px] h-[450px] rounded-full bg-[#8CC63F]/5 blur-3xl" />
        <div className="absolute top-0 left-0 w-[400px] h-[400px] rounded-full bg-[#005BAC]/5 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="doc-header text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider bg-[#005BAC]/10 text-[#005BAC] dark:bg-[#8CC63F]/15 dark:text-[#8CC63F]">
            <FolderOpen className="w-4 h-4" /> Document Studio & Export
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white">
            Publish & Distribute{' '}
            <span className="text-gradient">Class Materials Effortlessly</span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400">
            Switch between interactive formats to preview, edit, and export syllabus-aligned lesson materials in 1-Click.
          </p>
        </div>

        {/* Tab Navigation Pill Selector */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          {TAB_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-5 py-3 rounded-2xl text-xs font-black transition-all flex items-center gap-2.5 border ${
                  isActive
                    ? 'bg-[#005BAC] text-white border-[#005BAC] shadow-xl scale-105'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-400'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#8CC63F]' : ''}`} />
                <span>{item.title}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-extrabold ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                  {item.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Tab Showcase Display Card (Slider Content with Auto-Play & Hover Pause) */}
        <div
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white dark:bg-[#1E293B] rounded-3xl p-6 sm:p-10 border border-slate-200/80 dark:border-slate-800 shadow-2xl relative overflow-hidden"
            >

            {/* Left Side: Interactive Document Text Details */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl border ${currentTab.color} flex items-center justify-center`}>
                  <currentTab.icon className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                    {currentTab.badge}
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                    {currentTab.title}
                  </h3>
                </div>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                {currentTab.description}
              </p>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2">
                <p className="text-xs font-bold text-[#005BAC] dark:text-[#8CC63F] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Sample Material Preview:
                </p>
                <p className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                  "{currentTab.sampleTitle}"
                </p>
              </div>

              {/* Highlights Bullet List */}
              <div className="space-y-2 pt-1">
                {currentTab.highlights.map((h, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-[#8CC63F] flex-shrink-0" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side: Clean Isolated 3D Graphic */}
            <div className="lg:col-span-5 relative flex items-center justify-center p-4">
              <img
                src="/images/document_studio.png"
                alt="Document Studio 3D Graphic"
                className="w-full h-auto max-h-[380px] object-contain drop-shadow-[0_20px_45px_rgba(0,91,172,0.3)]"
                loading="lazy"
              />
            </div>
          </motion.div>
        </AnimatePresence>
        </div>
      </div>
    </section>

  );
};
