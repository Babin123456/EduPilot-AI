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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Studio Document Features & Text Box */}
          <div className="doc-preview lg:col-span-6 space-y-6">
            <div className="doc-list space-y-4">
              {[
                { icon: FileText, color: 'text-red-500 bg-red-500/10', title: 'PDF Question Papers & Quiz Bundles', desc: 'Auto-formatted with Adamas University headers & marking schemes', ext: '.PDF' },
                { icon: Presentation, color: 'text-amber-500 bg-amber-500/10', title: 'PPTX Lecture Slide Outlines', desc: 'Editable slide decks with structured topic breakdowns', ext: '.PPTX' },
                { icon: FileCheck, color: 'text-blue-500 bg-blue-500/10', title: 'Markdown & Word Notes', desc: 'Clean syllabus-aligned daily lecture notes and homework guidelines', ext: '.DOCX' },
              ].map((doc) => {
                const Icon = doc.icon;
                return (
                  <div key={doc.title} className="doc-list-item group glass-card-hover rounded-2xl p-4 flex items-center justify-between cursor-default">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-xl ${doc.color} flex items-center justify-center group-hover:scale-105 transition-transform duration-300`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{doc.title}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{doc.desc}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">{doc.ext}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Clean Isolated Illustration */}
          <div className="lg:col-span-6 relative flex justify-center">
            <div className="doc-image relative w-full flex justify-center">
              <img
                src="/images/document_studio.png"
                alt="Publish & Distribute Class Materials Effortlessly Visual"
                className="w-full h-auto max-h-[440px] object-contain drop-shadow-[0_20px_45px_rgba(0,91,172,0.3)]"
                loading="lazy"
              />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

