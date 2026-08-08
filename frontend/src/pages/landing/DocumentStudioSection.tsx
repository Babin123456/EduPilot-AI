import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FileText, Download, Share2, FileCheck, Presentation, Sparkles, Mail, MessageSquare, FolderOpen } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export const DocumentStudioSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from('.doc-header', {
        y: 40, opacity: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', toggleActions: 'play none none reverse' },
      });
      gsap.from('.doc-list-item', {
        x: -40, opacity: 0, duration: 0.6, stagger: 0.12, ease: 'power3.out',
        scrollTrigger: { trigger: '.doc-list', start: 'top 80%', toggleActions: 'play none none reverse' },
      });
      gsap.from('.doc-preview', {
        x: 40, opacity: 0, scale: 0.95, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: '.doc-preview', start: 'top 80%', toggleActions: 'play none none reverse' },
      });
      gsap.to('.doc-image', {
        y: -30, ease: 'none',
        scrollTrigger: { trigger: sectionRef.current, start: 'top bottom', end: 'bottom top', scrub: 2 },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="documents" ref={sectionRef} className="py-28 bg-slate-50 dark:bg-[#0F172A] relative overflow-hidden transition-colors duration-200 wave-divider">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 right-0 w-[450px] h-[450px] rounded-full bg-[#8CC63F]/5 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="doc-header text-center max-w-3xl mx-auto mb-20 space-y-5">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider bg-[#005BAC]/10 text-[#005BAC] dark:bg-[#8CC63F]/15 dark:text-[#8CC63F]">
            <FolderOpen className="w-4 h-4" /> Document Studio & Export
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white">
            Publish & Distribute{' '}
            <span className="text-gradient">Class Materials Effortlessly</span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400">
            Preview, edit, and export structured lesson plans, quizzes, and reports. Share directly via institutional email or WhatsApp workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left: Text & Doc Types */}
          <div className="lg:col-span-6 space-y-8">
            {/* Image with parallax */}
            <div className="doc-image relative rounded-3xl glass-card p-3 overflow-hidden bg-white dark:bg-[#1E293B] mb-8">
              <img src="/images/document_studio.png" alt="Document Studio Preview" className="w-full h-auto rounded-2xl object-contain bg-white dark:bg-[#1E293B]" loading="lazy" />
            </div>

            {/* Document Types */}
            <div className="doc-list space-y-3">
              {[
                { icon: FileText, color: 'text-red-500 bg-red-500/10', title: 'PDF Question Papers & Quiz Bundles', desc: 'Auto-formatted with Adamas University headers & marking schemes', ext: '.PDF' },
                { icon: Presentation, color: 'text-amber-500 bg-amber-500/10', title: 'PPTX Lecture Slide Outlines', desc: 'Editable slide decks with structured topic breakdowns', ext: '.PPTX' },
                { icon: FileCheck, color: 'text-blue-500 bg-blue-500/10', title: 'Markdown & Word Notes', desc: 'Clean syllabus-aligned daily lecture notes and homework guidelines', ext: '.DOCX' },
              ].map((doc) => {
                const Icon = doc.icon;
                return (
                  <div key={doc.title} className="doc-list-item group glass-card-hover rounded-2xl p-4 flex items-center justify-between cursor-default">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${doc.color} flex items-center justify-center group-hover:scale-105 transition-transform duration-300`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">{doc.title}</h4>
                        <p className="text-[10px] text-slate-500">{doc.desc}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">{doc.ext}</span>
                  </div>
                );
              })}
            </div>

            {/* Distribution Channels */}
            <div className="flex items-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-400 pt-2">
              <span className="flex items-center gap-2"><Mail className="w-4 h-4 text-[#005BAC]" /> Direct Institutional Email</span>
              <span className="flex items-center gap-2"><MessageSquare className="w-4 h-4 text-[#8CC63F]" /> Parent WhatsApp Alerts</span>
            </div>
          </div>

          {/* Right: Studio Mockup */}
          <div className="doc-preview lg:col-span-6">
            <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6">
              {/* Toolbar */}
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#8CC63F]" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Document Studio Workspace</span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="btn-magnetic p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold flex items-center gap-1">
                    <Download className="w-3.5 h-3.5" /> Export
                  </button>
                  <button className="btn-magnetic p-2 rounded-xl bg-[#005BAC] text-white text-[10px] font-bold flex items-center gap-1">
                    <Share2 className="w-3.5 h-3.5" /> Share
                  </button>
                </div>
              </div>

              {/* Document Preview */}
              <div className="bg-slate-50 dark:bg-slate-900/80 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 font-mono text-xs text-slate-700 dark:text-slate-300">
                <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-[#005BAC] dark:text-[#8CC63F]">ADAMAS UNIVERSITY — SCHOOL OF ENGINEERING</p>
                    <p className="text-[10px] text-slate-400">Department of Computer Science & Engineering</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
                    VERIFIED
                  </span>
                </div>
                <div className="space-y-2">
                  <p className="font-bold text-slate-900 dark:text-white text-sm">Course: Operating Systems (CS-301) — Quiz 2</p>
                  <p className="text-slate-500 text-[11px]">Time Allowed: 30 Mins | Total Marks: 20</p>
                </div>
                <div className="space-y-2 text-[11px] pt-2">
                  <p className="font-bold text-slate-800 dark:text-slate-200">Q1. Explain the process state transition lifecycle in Linux kernels. (5 Marks)</p>
                  <p className="text-slate-500 pl-3">a) Running - Waiting - Ready queue states...</p>
                  <p className="font-bold text-slate-800 dark:text-slate-200">Q2. Differentiate between preemptive vs non-preemptive CPU scheduling. (5 Marks)</p>
                  <p className="text-slate-500 pl-3">b) Context switching overhead, priority inversion...</p>
                  <p className="font-bold text-slate-800 dark:text-slate-200">Q3. Describe the Banker's Algorithm for deadlock avoidance. (5 Marks)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
