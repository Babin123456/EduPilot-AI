import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Download, ChevronDown, ChevronUp, Award, Clock, Target } from 'lucide-react';
import { generateQuizPDF, generateAssessmentReportPDF } from '../utils/pdfGenerator';

export const AssessmentsPage: React.FC = () => {
  const { activeClass, user } = useAuth();
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, any[]>>({});
  const [loadingResults, setLoadingResults] = useState<string | null>(null);

  useEffect(() => {
    if (!activeClass) return;
    setLoading(true);
    api.get(`/assessments?class_id=${activeClass.id}`)
      .then(res => setAssessments(res.data))
      .finally(() => setLoading(false));
  }, [activeClass]);

  const toggleResults = async (assessmentId: string) => {
    if (expandedId === assessmentId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(assessmentId);
    if (!results[assessmentId]) {
      setLoadingResults(assessmentId);
      try {
        const res = await api.get(`/assessments/${assessmentId}/results`);
        setResults(prev => ({ ...prev, [assessmentId]: res.data }));
      } finally {
        setLoadingResults(null);
      }
    }
  };

  const handleDownloadQuizPDF = (assessment: any) => {
    const sampleQuestions = Array.from({ length: assessment.total_questions || 5 }, (_, i) => ({
      number: i + 1,
      text: `Question ${i + 1} on ${assessment.topic || 'General Topic'}`,
      type: i % 3 === 0 ? 'mcq' : i % 3 === 1 ? 'short' : 'long',
      options: i % 3 === 0 ? ['Option A', 'Option B', 'Option C', 'Option D'] : undefined,
      marks: Math.ceil(assessment.total_marks / (assessment.total_questions || 5)),
    }));

    generateQuizPDF({
      title: assessment.title,
      courseName: activeClass?.course_name || '',
      courseCode: activeClass?.course_code || '',
      yearLabel: activeClass?.year_label || '',
      sectionName: activeClass?.section_name || '',
      teacherName: user?.full_name || '',
      topic: assessment.topic || 'General',
      difficulty: assessment.difficulty || 'medium',
      totalMarks: assessment.total_marks,
      duration: assessment.duration_minutes || 30,
      questions: sampleQuestions,
    });
  };

  const handleDownloadReportPDF = (assessment: any) => {
    const assessmentResults = results[assessment.id] || [];
    generateAssessmentReportPDF({
      title: assessment.title,
      courseName: activeClass?.course_name || '',
      courseCode: activeClass?.course_code || '',
      yearLabel: activeClass?.year_label || '',
      sectionName: activeClass?.section_name || '',
      teacherName: user?.full_name || '',
      totalMarks: assessment.total_marks,
      results: assessmentResults.map(r => ({
        rollNumber: r.roll_number,
        studentName: r.student_name,
        score: r.score,
        maxScore: r.max_score,
        percentage: r.percentage,
        grade: r.grade,
      })),
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#005BAC] via-[#0A6FD8] to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl flex items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-extrabold text-[#8CC63F]">
            <HelpCircle className="w-3.5 h-3.5" /> Quiz & Exam Studio
          </div>
          <h1 className="text-2xl font-black">Assessments & Quizzes Studio</h1>
          <p className="text-xs text-slate-200">Generate AI question papers, evaluation rubrics, and automated score distribution reports.</p>
        </div>
        <div className="w-32 h-20 rounded-xl overflow-hidden border border-white/20 bg-slate-950/80 p-1 hidden sm:block flex-shrink-0">
          <img src="/images/features_ai_planning.png" alt="Assessments Banner" className="w-full h-full object-contain bg-slate-950 rounded-lg" />
        </div>
      </div>


      {loading ? (
        <div className="grid grid-cols-1 gap-4">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 animate-pulse">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-48 mb-3" />
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-32" />
            </div>
          ))}
        </div>
      ) : assessments.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-900 dark:text-white">No assessments yet</h3>
          <p className="text-xs text-slate-500 mt-1">Create assessments using EduPilot AI to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {assessments.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
            >
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 rounded">
                        {a.assessment_type}
                      </span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        a.difficulty === 'hard' ? 'bg-red-50 text-red-600' :
                        a.difficulty === 'medium' ? 'bg-amber-50 text-amber-600' :
                        'bg-emerald-50 text-emerald-600'
                      }`}>
                        {a.difficulty}
                      </span>
                      {a.is_ai_generated && (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-adamas-blue/10 text-adamas-blue rounded">AI Generated</span>
                      )}
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">{a.title}</h3>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Target className="w-3.5 h-3.5" /> {a.topic || 'General'}</span>
                      <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5" /> {a.total_marks} marks</span>
                      {a.duration_minutes && (
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {a.duration_minutes} min</span>
                      )}
                      <span>{a.total_questions} questions</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleDownloadQuizPDF(a)}
                      className="px-3 py-1.5 bg-adamas-blue text-white text-xs font-bold rounded-lg flex items-center gap-1 hover:bg-adamas-blue-dark transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" /> Quiz PDF
                    </button>
                    <button
                      onClick={() => toggleResults(a.id)}
                      className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg flex items-center gap-1 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      {expandedId === a.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      Results
                    </button>
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {expandedId === a.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="border-t border-slate-200 dark:border-slate-800 overflow-hidden"
                  >
                    <div className="p-4">
                      {loadingResults === a.id ? (
                        <div className="text-center text-xs text-slate-400 py-4 animate-pulse">Loading results...</div>
                      ) : results[a.id]?.length ? (
                        <>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-slate-500">{results[a.id].length} Results</span>
                            <button
                              onClick={() => handleDownloadReportPDF(a)}
                              className="px-3 py-1 bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center gap-1 hover:bg-emerald-600 transition-colors"
                            >
                              <Download className="w-3 h-3" /> Report PDF
                            </button>
                          </div>
                          <div className="overflow-x-auto max-h-64 overflow-y-auto">
                            <table className="w-full text-xs">
                              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 uppercase sticky top-0">
                                <tr>
                                  <th className="px-3 py-2 text-left">Roll</th>
                                  <th className="px-3 py-2 text-left">Name</th>
                                  <th className="px-3 py-2">Score</th>
                                  <th className="px-3 py-2">%</th>
                                  <th className="px-3 py-2">Grade</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {results[a.id].map((r: any) => (
                                  <tr key={r.student_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                                    <td className="px-3 py-2 font-mono">{r.roll_number}</td>
                                    <td className="px-3 py-2 font-semibold">{r.student_name}</td>
                                    <td className="px-3 py-2 text-center">{r.score}/{r.max_score}</td>
                                    <td className="px-3 py-2 text-center font-bold">{r.percentage}%</td>
                                    <td className="px-3 py-2 text-center">
                                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                        r.grade === 'A' ? 'bg-emerald-100 text-emerald-700' :
                                        r.grade === 'B' ? 'bg-blue-100 text-blue-700' :
                                        r.grade === 'C' ? 'bg-amber-100 text-amber-700' :
                                        'bg-red-100 text-red-700'
                                      }`}>{r.grade}</span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </>
                      ) : (
                        <p className="text-center text-xs text-slate-400 py-4">No results available</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
