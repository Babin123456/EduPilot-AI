import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { ArrowLeft, Sun, Moon, Shield, Database, Eye, Lock, Server, UserCheck, Bell, Trash2, Globe } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  const sections = [
    {
      icon: Eye,
      title: '1. Information We Collect',
      content: 'EduPilot AI collects information necessary to provide academic services: (a) Faculty Profile Data — name, email, designation, department, assigned courses and sections; (b) Academic Activity Data — attendance records, quiz scores, lesson plans, daily notes, and generated documents; (c) Usage Data — login timestamps, feature usage patterns, and session information for platform improvement; (d) AI Interaction Data — prompts and queries submitted to the AI assistant, processed in real-time and not stored for model training.',
    },
    {
      icon: Database,
      title: '2. How We Use Your Data',
      content: 'Your data is used exclusively for: providing and improving the EduPilot AI academic services; generating contextually relevant AI responses using RAG (Retrieval Augmented Generation); producing analytics, dashboards, and institutional reports; facilitating communications between faculty and student guardians; maintaining platform security and preventing unauthorized access. We do not use your data for advertising, marketing to third parties, or training external AI models.',
    },
    {
      icon: Lock,
      title: '3. Data Security',
      content: 'We implement robust security measures to protect your data: encrypted database storage with WAL (Write-Ahead Logging) for data integrity; secure API authentication using JWT tokens with expiration policies; role-based access control ensuring faculty can only access assigned class data; HTTPS encryption for all data in transit; regular security audits and vulnerability assessments. Despite these measures, no system is 100% secure, and we encourage users to report any suspected vulnerabilities.',
    },
    {
      icon: Server,
      title: '4. Data Storage & Retention',
      content: 'Academic data is stored on institutional servers maintained by Adamas University. Data is retained for the duration of the academic year plus an additional 3 years for accreditation and compliance purposes. Faculty members may request early deletion of their personal profile data upon leaving the institution. AI interaction logs are retained for 90 days for quality assurance and then automatically purged.',
    },
    {
      icon: UserCheck,
      title: '5. Data Sharing & Third Parties',
      content: 'We share data only in the following limited circumstances: with Groq and Google Gemini APIs for real-time AI processing (prompts only, not stored); with institutional administrators for authorized academic reporting; when required by Indian law, court order, or regulatory compliance; with technical service providers who assist in platform maintenance under strict confidentiality agreements. We never sell student or faculty data to third parties.',
    },
    {
      icon: Shield,
      title: '6. Student Data Protection',
      content: 'Student personal information (names, roll numbers, attendance records, academic performance) is treated with the highest level of protection. Access is strictly limited to assigned faculty members. Student data is used exclusively for academic administration and is protected in compliance with institutional data governance policies and FERPA-aligned privacy principles. Parents/guardians receive communications only through authorized faculty-initiated workflows.',
    },
    {
      icon: Bell,
      title: '7. Cookies & Tracking',
      content: 'EduPilot AI uses minimal local storage for session management: authentication tokens (JWT) stored in localStorage for session persistence; theme preference (light/dark mode) stored in localStorage; active class context stored in localStorage for user convenience. We do not use third-party tracking cookies, advertising pixels, or analytics services that track users across websites.',
    },
    {
      icon: Trash2,
      title: '8. Your Rights',
      content: 'As a user, you have the right to: access your personal data stored in the Platform; request correction of inaccurate personal information; request deletion of your personal data (subject to institutional retention policies); export your generated content in standard formats (PDF, PPTX, DOCX); opt out of non-essential data processing. To exercise these rights, contact support@adamasuniversity.ac.in.',
    },
    {
      icon: Globe,
      title: '9. Changes to This Policy',
      content: 'We may update this Privacy Policy periodically to reflect changes in our practices or legal requirements. Users will be notified of material changes via email or Platform notification at least 30 days before the changes take effect. Continued use of the Platform after notification constitutes acceptance of the updated policy. The "Last Updated" date at the top of this page indicates the most recent revision.',
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
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">Privacy Policy</h1>
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
