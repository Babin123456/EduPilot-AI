import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { ArrowLeft, Sun, Moon, Scale, ShieldCheck, FileText, AlertTriangle, Users, Globe, Gavel } from 'lucide-react';

export const TermsPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);


  const sections = [
    {
      icon: Scale,
      title: '1. Acceptance of Terms',
      content: 'By accessing and using EduPilot AI ("the Platform"), you agree to be bound by these Terms of Service. The Platform is operated by and for Adamas University, Kolkata, India. If you do not agree with these terms, you must not use the Platform. These terms apply to all faculty, staff, and authorized users of the Platform.',
    },
    {
      icon: Users,
      title: '2. User Accounts & Access',
      content: 'Access to EduPilot AI is restricted to authorized Adamas University faculty members. Each user receives institutional login credentials tied to their official university email. Users are responsible for maintaining the confidentiality of their login credentials and for all activities that occur under their account. Sharing credentials is strictly prohibited.',
    },
    {
      icon: FileText,
      title: '3. Acceptable Use Policy',
      content: 'Users may use the Platform exclusively for legitimate academic purposes including attendance management, lesson planning, quiz/assessment generation, student analytics, and academic communications. Users must not attempt to reverse-engineer, decompile, or extract source code from the Platform. Automated scraping, bulk data extraction, or API abuse is prohibited.',
    },
    {
      icon: ShieldCheck,
      title: '4. Intellectual Property',
      content: 'All content, design, code, and AI-generated outputs within EduPilot AI are the intellectual property of Adamas University and its licensors. Faculty-generated content (lesson plans, quizzes, notes) created through the Platform remains the intellectual property of the respective faculty member, with Adamas University retaining a non-exclusive license for institutional use.',
    },
    {
      icon: AlertTriangle,
      title: '5. AI-Generated Content Disclaimer',
      content: 'EduPilot AI uses large language models (Groq, Gemini) to generate educational content. While we strive for accuracy, AI-generated content may contain errors, inaccuracies, or biases. All AI outputs are presented for teacher review and approval. Faculty members are ultimately responsible for verifying the accuracy and appropriateness of any AI-generated content before distributing it to students.',
    },
    {
      icon: Globe,
      title: '6. Data Usage & Processing',
      content: 'The Platform processes academic data (attendance records, student information, course content) to provide its services. Data is processed in accordance with our Privacy Policy. By using the Platform, you consent to the collection and processing of academic data as described therein. Student data is never sold to third parties or used for commercial advertising purposes.',
    },
    {
      icon: Gavel,
      title: '7. Limitation of Liability',
      content: 'EduPilot AI is provided "as is" without warranties of any kind. Adamas University shall not be liable for any indirect, incidental, or consequential damages arising from use of the Platform, including but not limited to loss of data, interruption of service, or errors in AI-generated content. Our total liability shall not exceed the amount paid by the user for access to the Platform.',
    },
    {
      icon: Scale,
      title: '8. Modifications & Termination',
      content: 'Adamas University reserves the right to modify these Terms of Service at any time. Users will be notified of material changes via email or Platform notification. Continued use after notification constitutes acceptance. The university may suspend or terminate user access for violations of these terms or institutional policies, with or without notice.',
    },
    {
      icon: Gavel,
      title: '9. Governing Law',
      content: 'These Terms of Service are governed by the laws of India and the State of West Bengal. Any disputes arising from use of the Platform shall be subject to the exclusive jurisdiction of the courts in Kolkata, West Bengal, India.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0F172A] transition-colors duration-200">
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 py-4">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-[#005BAC] dark:hover:text-[#8CC63F] transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <button onClick={toggleTheme} className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" aria-label="Toggle theme">
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-amber-400" />}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-16 space-y-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#005BAC]/10 text-[#005BAC] dark:bg-[#8CC63F]/15 dark:text-[#8CC63F] mx-auto">
            <Scale className="w-8 h-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">Terms of Service</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Last updated: August 2026 | EduPilot AI — Adamas University</p>
        </motion.div>

        <div className="space-y-8">
          {sections.map((section, idx) => {
            const Icon = section.icon;
            return (
              <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: idx * 0.05 }}
                className="glass-card rounded-2xl p-6 sm:p-8 space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#005BAC]/10 text-[#005BAC] dark:bg-[#8CC63F]/15 dark:text-[#8CC63F] flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">{section.title}</h2>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed pl-[52px]">{section.content}</p>
              </motion.div>
            );
          })}
        </div>
      </main>
    </div>
  );
};
