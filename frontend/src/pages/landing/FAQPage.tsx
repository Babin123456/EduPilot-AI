import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { ChevronDown, ArrowLeft, HelpCircle, Sun, Moon, Search } from 'lucide-react';

const faqData = [
  {
    category: 'Getting Started',
    items: [
      {
        q: 'What is EduPilot AI?',
        a: 'EduPilot AI is an intelligent Academic Operating System designed for Adamas University faculty. It automates routine teaching tasks such as attendance tracking, lesson planning, quiz generation, student analytics, and document management through AI-powered workflows using Groq and Gemini LLMs.',
      },
      {
        q: 'How do I log in to EduPilot AI?',
        a: 'Faculty members can log in using their official Adamas University institutional email and password at the /login page. Demo accounts are also available for evaluation purposes with 1-click instant login functionality.',
      },
      {
        q: 'Is EduPilot AI free for Adamas University faculty?',
        a: 'Yes. EduPilot AI is an institutional platform provided to all Adamas University faculty at no individual cost. The platform is maintained by the School of Engineering & Technology and covers all B.Tech CSE sections across all four years.',
      },
    ],
  },
  {
    category: 'Features & Capabilities',
    items: [
      {
        q: 'How does the AI Lesson Planning feature work?',
        a: 'EduPilot uses your active class context (course, section, syllabus topics) to generate structured lesson outlines, lecture slides, and curriculum maps. The AI considers your syllabus alignment, prior class notes, and academic calendar to produce contextually relevant content that you can review and customize before use.',
      },
      {
        q: 'Can EduPilot generate quizzes and question papers?',
        a: 'Yes. EduPilot can generate quizzes, mid-term question papers, and assignment sheets with customizable difficulty levels, question types (MCQ, short answer, long answer), and marking schemes. All outputs are formatted with official Adamas University headers and can be exported as PDF.',
      },
      {
        q: 'How does the attendance tracking system work?',
        a: 'The attendance system allows batch marking of all students in a section with a single click. Teachers can toggle individual student status (Present/Absent/Late), and the system automatically flags students dropping below the 75% minimum attendance threshold for exam eligibility.',
      },
      {
        q: 'What analytics and insights does EduPilot provide?',
        a: 'EduPilot provides real-time dashboards showing attendance velocity trends, quiz performance distributions, at-risk student identification, section comparison charts, and weekly/monthly academic performance summaries. All analytics are tied to your active class context and update dynamically.',
      },
      {
        q: 'What is the Document Studio?',
        a: 'Document Studio is EduPilot\'s integrated document management and export engine. It stores all AI-generated content (lesson plans, quizzes, daily notes, reports) and allows preview, editing, PDF/PPTX/DOCX export, and direct distribution via institutional email or WhatsApp parent notification workflows.',
      },
    ],
  },
  {
    category: 'AI & Technology',
    items: [
      {
        q: 'What AI models power EduPilot?',
        a: 'EduPilot uses a dual-LLM architecture with Groq as the primary provider (using dual API keys for load balancing) and Google Gemini as the fallback. The system employs RAG (Retrieval Augmented Generation) to inject real-time class data into AI prompts for contextually accurate responses.',
      },
      {
        q: 'Is my data used to train AI models?',
        a: 'No. Your academic data (attendance records, student information, lesson content) is processed in real-time for generating responses but is never used to train or fine-tune any external AI models. All data remains within the EduPilot platform infrastructure.',
      },
      {
        q: 'What is the "Context-Aware AI Assistant"?',
        a: 'The AI Assistant is a natural language interface where you can ask questions about your class data. For example: "Who has below 75% attendance in CSE 3rd Year Section B?" or "Generate a quiz on Operating Systems Chapter 4." The assistant queries your live database and returns precise, data-backed responses.',
      },
    ],
  },
  {
    category: 'Privacy, Security & Support',
    items: [
      {
        q: 'How is student data protected?',
        a: 'All student data is stored in encrypted databases with role-based access control. Teachers can only access data for classes they are assigned to. The platform follows institutional data governance policies and FERPA-aligned privacy principles. No data is shared with third parties.',
      },
      {
        q: 'Does EduPilot work on mobile devices?',
        a: 'Yes. EduPilot AI is fully responsive and works on smartphones, tablets, and desktop browsers. The interface adapts to all screen sizes with optimized layouts for mobile attendance marking and on-the-go analytics viewing.',
      },
      {
        q: 'Can I export my data from EduPilot?',
        a: 'Yes. All generated content can be exported in multiple formats including PDF, PPTX, and DOCX. Analytics reports can be downloaded as PDF summaries. Attendance records are exportable for institutional reporting and accreditation compliance.',
      },
      {
        q: 'Who do I contact for technical support?',
        a: 'For technical support, reach out to the EduPilot team via email at support@adamasuniversity.ac.in. For urgent issues during working hours, contact the School of Engineering IT helpdesk. Feature requests and bug reports can be submitted through the platform\'s Communications module.',
      },
    ],
  },
];

const AccordionItem: React.FC<{ question: string; answer: string; isOpen: boolean; onToggle: () => void }> = ({ question, answer, isOpen, onToggle }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(isOpen ? contentRef.current.scrollHeight : 0);
    }
  }, [isOpen]);

  return (
    <div className={`group border border-slate-200 dark:border-slate-800 rounded-2xl transition-all duration-300 ${isOpen ? 'bg-white dark:bg-[#1E293B] shadow-lg border-[#005BAC]/30 dark:border-[#8CC63F]/30' : 'bg-slate-50/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-900'}`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 p-5 text-left"
        aria-expanded={isOpen}
      >
        <span className={`text-sm font-bold transition-colors duration-200 ${isOpen ? 'text-[#005BAC] dark:text-[#8CC63F]' : 'text-slate-800 dark:text-slate-200'}`}>
          {question}
        </span>
        <ChevronDown className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#005BAC] dark:text-[#8CC63F]' : 'text-slate-400'}`} />
      </button>
      <div
        ref={contentRef}
        className="accordion-content"
        style={{ maxHeight: `${height}px`, opacity: isOpen ? 1 : 0, padding: isOpen ? undefined : '0 20px' }}
      >
        <div className="px-5 pb-5">
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
};

export const FAQPage: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { theme, toggleTheme } = useTheme();

  const toggleItem = (key: string) => {
    setOpenIndex(openIndex === key ? null : key);
  };

  const filteredData = faqData.map((cat) => ({
    ...cat,
    items: cat.items.filter(
      (item) =>
        item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.a.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((cat) => cat.items.length > 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0F172A] transition-colors duration-200">
      {/* Navbar */}
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
        {/* Page Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#005BAC]/10 text-[#005BAC] dark:bg-[#8CC63F]/15 dark:text-[#8CC63F] mx-auto">
            <HelpCircle className="w-8 h-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">Frequently Asked Questions</h1>
          <p className="text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto">Everything you need to know about EduPilot AI and the Adamas University academic platform.</p>
        </motion.div>

        {/* Search */}
        <div className="relative max-w-lg mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions..."
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#005BAC] dark:focus:ring-[#8CC63F] shadow-sm transition-shadow"
          />
        </div>

        {/* FAQ Categories */}
        <div className="space-y-10">
          {filteredData.map((category) => (
            <motion.div key={category.category} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="w-1 h-6 rounded-full bg-gradient-to-b from-[#005BAC] to-[#8CC63F]" />
                {category.category}
              </h2>
              <div className="space-y-3">
                {category.items.map((item, idx) => {
                  const key = `${category.category}-${idx}`;
                  return (
                    <AccordionItem
                      key={key}
                      question={item.q}
                      answer={item.a}
                      isOpen={openIndex === key}
                      onToggle={() => toggleItem(key)}
                    />
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Still have questions? */}
        <div className="text-center py-8 space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">Still have questions?</p>
          <a href="mailto:support@adamasuniversity.ac.in" className="btn-magnetic inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#005BAC] hover:bg-[#0A6FD8] text-white text-sm font-bold shadow-lg">
            Contact Support
          </a>
        </div>
      </main>
    </div>
  );
};
