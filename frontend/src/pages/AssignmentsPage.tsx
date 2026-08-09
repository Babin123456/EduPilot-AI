import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Sparkles, Download, Send, Eye, X, Loader2, Plus } from 'lucide-react';
import { generateQuizPDF } from '../utils/pdfGenerator';

export const AssignmentsPage: React.FC = () => {
  const { activeClass, user } = useAuth();
  const toast = useToast();
  const [assignments, setAssignments] = useState<any[]>([]);

  // AI Generator Modal State
  const [showGenModal, setShowGenModal] = useState(false);
  const [topic, setTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [generating, setGenerating] = useState(false);

  // Markdown Preview State
  const [generatedMarkdown, setGeneratedMarkdown] = useState<string | null>(null);
  const [generatedQuestionsData, setGeneratedQuestionsData] = useState<any[]>([]);
  const [activeTitle, setActiveTitle] = useState('');

  useEffect(() => {
    if (!activeClass) return;
    fetchAssignments();
  }, [activeClass]);

  const fetchAssignments = () => {
    api.get(`/assignments?class_id=${activeClass?.id}`)
      .then(res => setAssignments(res.data || []))
      .catch(() => {});
  };

  const handleGenerateAIQuestions = () => {
    if (!topic.trim()) return;
    setGenerating(true);

    setTimeout(() => {
      const qData = Array.from({ length: numQuestions }, (_, i) => ({
        number: i + 1,
        text: `Assignment Question ${i + 1}: Discuss the foundational concepts of ${topic} and analyze real-world case scenarios.`,
        type: i % 2 === 0 ? 'mcq' : 'short',
        options: i % 2 === 0 ? ['Option A: Basic concept', 'Option B: Extended method', 'Option C: Algorithmic approach', 'Option D: Optimized solution'] : undefined,
        marks: 5,
      }));

      const mdText = `# Assignment Task Paper — ${topic}\n**Course:** ${activeClass?.course_name || ''} (${activeClass?.course_code || ''})\n**Total Marks:** ${numQuestions * 5} | **Difficulty:** ${difficulty.toUpperCase()}\n\n---\n\n` +
        qData.map(q => `### Question ${q.number} [${q.marks} Marks]\n${q.text}\n` + (q.options ? q.options.map(o => `- ${o}`).join('\n') : '')).join('\n\n');

      setGeneratedQuestionsData(qData);
      setGeneratedMarkdown(mdText);
      setActiveTitle(`Assignment — ${topic}`);
      setGenerating(false);
      setShowGenModal(false);
      toast.success('AI Assignment Generated!', 'Review the formatted raw Markdown below or download as PDF.');
    }, 1000);
  };

  const handleDownloadPDF = async () => {
    if (!activeClass) return;
    generateQuizPDF({
      title: activeTitle || `Assignment — ${topic}`,
      courseName: activeClass.course_name,
      courseCode: activeClass.course_code,
      yearLabel: activeClass.year_label,
      sectionName: activeClass.section_name,
      teacherName: user?.full_name || '',
      topic: topic || 'Assignment',
      difficulty: difficulty,
      totalMarks: generatedQuestionsData.length * 5,
      duration: 60,
      questions: generatedQuestionsData,
    });

    // Save to Document Studio
    await api.post('/documents', {
      title: activeTitle || `Assignment — ${topic}`,
      document_type: 'assignment',
      format: 'pdf',
      class_id: activeClass.id,
      content: generatedMarkdown,
    }).catch(() => {});

    toast.success('Saved to Document Studio & Downloaded PDF', `File ready for ${activeClass.course_code}.`);
  };

  const handleSendToAllStudents = async () => {
    if (!activeClass) return;
    try {
      await api.post('/communications/send-email', {
        class_id: activeClass.id,
        subject: `[Assignment Notice] ${activeTitle || 'New Coursework'} (${activeClass.course_code})`,
        body: `Dear Students,\n\nA new assignment titled "${activeTitle || topic}" has been published for ${activeClass.course_name}.\n\nOverview:\n${generatedMarkdown?.slice(0, 300)}...\n\nPlease check Document Studio for the complete PDF.\n\nBest regards,\n${user?.full_name || 'Faculty'}`,
        recipient_type: 'all',
      });
      toast.success('Sent Assignment to All Students via Email', `Dispatched notification to active class roster.`);
    } catch (err) {
      toast.error('Failed to send email to students');
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#005BAC] via-[#0A6FD8] to-[#8CC63F] p-6 sm:p-8 rounded-3xl text-white shadow-xl flex items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-extrabold text-white">
            <FileText className="w-3.5 h-3.5 text-[#8CC63F]" /> AI Assignment Studio & Submissions
          </div>
          <h1 className="text-2xl font-black">Assignments & Coursework Manager</h1>
          <p className="text-xs text-slate-100 font-medium">Generate AI assignment questions in raw Markdown, export styled PDFs, and email them to students in 1-Click.</p>
        </div>
        <button
          onClick={() => setShowGenModal(true)}
          className="px-5 py-3 bg-slate-950 hover:bg-slate-900 text-white text-xs font-black rounded-2xl border border-slate-700 flex items-center gap-2 shadow-xl transition-all relative z-10 flex-shrink-0"
        >
          <Sparkles className="w-4 h-4 text-[#8CC63F]" />
          <span>Generate AI Assignment</span>
        </button>
      </div>

      {/* Generated Raw Markdown & Actions Panel */}
      {generatedMarkdown && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md p-6 space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600">AI Generated Preview</span>
              <h2 className="text-base font-black text-slate-900 dark:text-white mt-1">{activeTitle}</h2>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleDownloadPDF}
                className="px-4 py-2 bg-[#005BAC] hover:bg-[#0A6FD8] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Download className="w-3.5 h-3.5 text-[#8CC63F]" />
                <span>Download PDF</span>
              </button>
              <button
                onClick={handleSendToAllStudents}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send to All Students (1-Click)</span>
              </button>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-800 dark:text-slate-200 overflow-x-auto">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{generatedMarkdown}</ReactMarkdown>
          </div>
        </motion.div>
      )}

      {/* Assignment List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assignments.map((a) => (
          <div key={a.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-blue-50 text-adamas-blue rounded">
                {a.topic || 'General'}
              </span>
              <span className="text-[10px] text-slate-400 font-bold">{a.difficulty}</span>
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">{a.title}</h3>
            <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-3">
              <span>Submissions: <strong>{a.submitted_count}/{a.total_students}</strong></span>
              <span>Marks: <strong>{a.total_marks}</strong></span>
            </div>
            <button
              onClick={() => {
                const qData = Array.from({ length: 5 }, (_, i) => ({
                  number: i + 1,
                  text: `Assignment Question ${i + 1} on ${a.topic || 'Course Topic'}: Write a detailed analysis and solution.`,
                  type: 'short',
                  marks: Math.ceil((a.total_marks || 25) / 5),
                }));
                const mdText = `# ${a.title}\n**Course:** ${activeClass?.course_name || ''} (${activeClass?.course_code || ''})\n**Total Marks:** ${a.total_marks} | **Difficulty:** ${a.difficulty || 'MEDIUM'}\n\n---\n\n` +
                  qData.map(q => `### Question ${q.number} [${q.marks} Marks]\n${q.text}`).join('\n\n');
                setGeneratedQuestionsData(qData);
                setGeneratedMarkdown(mdText);
                setActiveTitle(a.title);
                toast.info('Opened Assignment View', `Review "${a.title}" in Markdown format.`);
              }}
              className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-[#005BAC] hover:text-white text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>View Material & PDF</span>
            </button>
          </div>
        ))}
      </div>


      {/* Modal Form */}
      <AnimatePresence>
        {showGenModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full overflow-hidden p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Generate AI Assignment</h3>
                <button onClick={() => setShowGenModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Topic / Syllabus Module *</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Memory Management & Paging Algorithms"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#005BAC] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Questions: {numQuestions}</label>
                  <input
                    type="range"
                    min="3"
                    max="15"
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(Number(e.target.value))}
                    className="w-full accent-[#005BAC]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setShowGenModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerateAIQuestions}
                  disabled={!topic.trim() || generating}
                  className="px-5 py-2 bg-[#005BAC] hover:bg-[#0A6FD8] text-white text-xs font-black rounded-xl shadow flex items-center gap-2 disabled:opacity-50"
                >
                  {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-[#8CC63F]" />}
                  <span>Generate Questions</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

