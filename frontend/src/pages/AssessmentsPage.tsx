import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Download, ChevronDown, ChevronUp, Award, Clock, Target, Send, Sparkles, X, Loader2, BookOpen, Trash2, AlertTriangle } from 'lucide-react';
import { SkeletonPageLoader } from '../components/SkeletonPageLoader';
import { generateQuizPDF, generateAssessmentReportPDF } from '../utils/pdfGenerator';

export const AssessmentsPage: React.FC = () => {
  const { activeClass, user } = useAuth();
  const toast = useToast();

  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, any[]>>({});
  const [loadingResults, setLoadingResults] = useState<string | null>(null);
  const [deleteConfirmQuiz, setDeleteConfirmQuiz] = useState<{ id: string; title: string } | null>(null);
  const [deletingQuiz, setDeletingQuiz] = useState(false);

  // MCQ Quiz Modal State
  const [showGenModal, setShowGenModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [topic, setTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState(10); // Range: 10 to 20 Qs
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [generating, setGenerating] = useState(false);

  const subjectCatalog: Record<string, string[]> = {
    'Cyber Security': [
      'Network Security Fundamentals & CIA Triad',
      'Symmetric & Asymmetric Encryption Architecture',
      'Public Key Infrastructure (PKI) & Digital Certificates',
      'Web Application Vulnerabilities (OWASP Top 10)',
      'SQL Injection & Cross-Site Scripting (XSS) Prevention',
      'Ethical Hacking & Penetration Testing Frameworks',
      'Firewalls, IDS & IPS Intrusion Detection Systems',
      'Malware Analysis (Ransomware, Trojans, Rootkits)',
      'Security Information and Event Management (SIEM)',
      'Zero Trust Security Architecture & Micro-segmentation',
      'Cloud Security & Identity Access Management (IAM)',
      'Incident Response & Forensics Investigation',
      'Network Sniffing, MITM Attacks & Packet Analysis',
      'Authentication Protocols (OAuth2, SAML, Multi-Factor)',
      'Endpoint Detection and Response (EDR) Systems',
      'Cryptography Hash Functions (SHA-3) & Collision Resistance',
      'Buffer Overflow Exploitation & Stack Protections',
      'Denial of Service (DoS/DDoS) Mitigation Strategies',
      'Cyber Threat Intelligence & MITRE ATT&CK Framework',
      'Compliance Standards (ISO 27001, GDPR, NIST)',
    ],
    'Blockchain Technology': [

      'Distributed Ledger Technology (DLT) Architecture',
      'Cryptographic Hashing (SHA-256) & Merkle Trees',
      'Asymmetric Encryption & Elliptic Curve Digital Signatures (ECDSA)',
      'Consensus Mechanisms: Proof of Work (PoW) vs Proof of Stake (PoS)',
      'Byzantine Fault Tolerance (BFT) & Raft Consensus',
      'Bitcoin Architecture & UTXO Transaction Model',
      'Ethereum Virtual Machine (EVM) Architecture',
      'Smart Contract Development in Solidity & Life Cycle',
      'Gas Optimization, Execution Fees & Opcode Analysis',
      'Decentralized Finance (DeFi) Protocols & Automated Market Makers',
      'Zero-Knowledge Proofs (zk-SNARKs & zk-STARKs)',
      'Layer 2 Scaling Solutions (Rollups, State Channels, Plasma)',
      'Interoperability Protocols & Cross-Chain Bridges',
      'ERC-20, ERC-721 (NFT) & ERC-1155 Token Standards',
      'Decentralized Autonomous Organizations (DAOs) & Governance',
      'Smart Contract Vulnerabilities (Reentrancy, Overflow, Front-Running)',
      'Hyperledger Fabric Enterprise Permissioned Architecture',
      'Decentralized Storage (IPFS & Arweave)',
      'Consensus Attack Vectors (51% Attack, Sybil Attack)',
      'CBDC & Enterprise Blockchain Integration',
    ],
    'Database Management Systems (DBMS)': [

      'Relational Algebra & Tuple Calculus',
      'Entity-Relationship (ER) & EER Modeling',
      '1NF, 2NF, 3NF & BCNF Normalization',
      'SQL Complex DDL, DML & Subqueries',
      'Joins (Inner, Outer, Cross, Self-Join)',
      'Indexing Structures & B/B+ Trees',
      'Transaction Processing & ACID Properties',
      'Concurrency Control & 2PL Locks',
      'Deadlock Detection & Prevention Algorithms',
      'Database Recovery & WAL Write-Ahead Logging',
      'Query Optimization & Cost Estimation',
      'NoSQL Databases & MongoDB Document Store',
      'Distributed Databases & CAP Theorem',
      'Sharding & Horizontal Partitioning',
      'Stored Procedures, Triggers & Views',
      'Database Security & Role-Based Access',
      'Data Warehousing & OLAP Cubes',
      'Object-Relational Mapping (ORM) Patterns',
      'Vector Databases & Embedding Indexing',
      'Cloud Relational Engines (Spanner & BigQuery)',
    ],
    'Operating Systems (OS)': [
      'Process State Transitions & PCB',
      'CPU Scheduling (FCFS, SJF, RR, Priority)',
      'Thread Synchronization & Mutex Locks',
      'Semaphores & Classical IPC Problems',
      'Deadlock Characterization & Banker Algorithm',
      'Memory Paging & Segmentation Models',
      'Virtual Memory & Page Replacement (LRU, FIFO)',
      'Thrashing & Working Set Model',
      'File System Implementation & Inodes',
      'Disk Storage Scheduling (SSTF, SCAN, C-SCAN)',
      'I/O Subsystem & DMA Controller',
      'Kernel Microkernel vs Monolithic Design',
      'System Calls & Interrupt Service Routines',
      'Virtualization & Hypervisors (KVM, ESXi)',
      'Containerization Architecture (Docker)',
      'Distributed OS & Clock Synchronization',
      'Real-Time Operating Systems (RTOS)',
      'Memory Allocation (First Fit, Best Fit, Buddy)',
      'Security, Authentication & Access Control',
      'POSIX Signal Handling & Process Forking',
    ],
    'Computer Networks (CN)': [
      'OSI 7-Layer vs TCP/IP Protocol Stack',
      'Physical Layer Transmission Media & Modulation',
      'Data Link Layer Framing & Error Control',
      'CSMA/CD & CSMA/CA MAC Protocols',
      'Ethernet Standards & Switching Mechanics',
      'IP Addressing, Subnetting & CIDR Notation',
      'IPv4 vs IPv6 Header Comparison',
      'Routing Algorithms (Dijkstra Link-State, Distance-Vector)',
      'BGP & OSPF Autonomous Routing',
      'Transport Layer TCP 3-Way Handshake & Teardown',
      'TCP Congestion Control & Sliding Window',
      'UDP Protocol Architecture & Real-Time Streaming',
      'DNS Domain Resolution Architecture',
      'HTTP/1.1 vs HTTP/2 vs HTTP/3 QUIC',
      'DHCP Automatic IP Assignment',
      'Network Security (TLS/SSL Handshake & IPsec)',
      'Firewalls, NAT & Proxy Server Architectures',
      'Wireless Networks & 802.11 Wi-Fi Standards',
      'Software-Defined Networking (SDN)',
      'Packet Sniffing & Network Traffic Analysis',
    ],
    'Data Structures & Algorithms (DSA)': [
      'Asymptotic Notation (Big-O, Omega, Theta)',
      'Array Operations & Dynamic Sizing',
      'Singly, Doubly & Circular Linked Lists',
      'Stack Implementation & Expression Parsing',
      'Queue Variants (Deque, Priority Queue, Circular)',
      'Binary Trees & Tree Traversals (In/Pre/Post/Level)',
      'Binary Search Trees (BST) & Operations',
      'AVL Trees & Rotations Balancing',
      'Red-Black Trees & Properties',
      'Binary Heaps & HeapSort Mechanics',
      'Hash Tables, Hash Functions & Collision Resolution',
      'Graph Representations (Adjacency Matrix/List)',
      'Breadth-First Search (BFS) & Depth-First Search (DFS)',
      'Minimum Spanning Trees (Kruskal & Prim)',
      'Single-Source Shortest Paths (Dijkstra & Bellman-Ford)',
      'All-Pairs Shortest Paths (Floyd-Warshall)',
      'Divide and Conquer (MergeSort & QuickSort)',
      'Dynamic Programming (Knapsack, LCS, LIS)',
      'Greedy Algorithms & Huffman Coding',
      'Trie Data Structures & String Matching Algorithms',
    ],
  };

  useEffect(() => {
    if (!activeClass) return;
    fetchAssessments();

    // Map teacher's active course specification to subject topics
    const courseName = activeClass.course_name || '';
    const courseLower = courseName.toLowerCase();

    let matchedSub = Object.keys(subjectCatalog).find(sub => 
      sub.toLowerCase().includes(courseLower) || courseLower.includes(sub.toLowerCase())
    );

    if (!matchedSub) {
      if (courseLower.includes('cyber') || courseLower.includes('security')) matchedSub = 'Cyber Security';
      else if (courseLower.includes('block') || courseLower.includes('chain')) matchedSub = 'Blockchain Technology';
      else if (courseLower.includes('dbms') || courseLower.includes('database')) matchedSub = 'Database Management Systems (DBMS)';
      else if (courseLower.includes('os') || courseLower.includes('operating')) matchedSub = 'Operating Systems (OS)';
      else if (courseLower.includes('network')) matchedSub = 'Computer Networks (CN)';
      else if (courseLower.includes('algo') || courseLower.includes('structure') || courseLower.includes('dsa')) matchedSub = 'Data Structures & Algorithms (DSA)';
      else matchedSub = Object.keys(subjectCatalog)[0];
    }



    setSelectedSubject(matchedSub);
    const availableTopics = subjectCatalog[matchedSub] || [];
    if (availableTopics.length > 0) {
      setTopic(availableTopics[0]);
    }
  }, [activeClass]);


  const fetchAssessments = () => {
    setLoading(true);
    api.get(`/assessments?class_id=${activeClass?.id}`)
      .then(res => setAssessments(res.data || []))
      .finally(() => setLoading(false));
  };

  const handleDeleteQuiz = async () => {
    if (!deleteConfirmQuiz) return;
    setDeletingQuiz(true);
    try {
      await api.delete(`/assessments/${deleteConfirmQuiz.id}`);
      toast.success('Quiz Deleted Successfully', `Removed "${deleteConfirmQuiz.title}" and its associated records.`);
      setDeleteConfirmQuiz(null);
      fetchAssessments();
    } catch (err) {
      toast.error('Failed to delete quiz');
    } finally {
      setDeletingQuiz(false);
    }
  };

  const handleGenerateMCQQuiz = async () => {
    if (!topic.trim() || !activeClass) return;
    setGenerating(true);

    try {
      const res = await api.post('/assessments/generate', {
        class_id: activeClass.id,
        topic: topic.trim(),
        difficulty: difficulty,
        num_questions: numQuestions,
      });

      setShowGenModal(false);
      fetchAssessments();
      toast.success(`Generated ${res.data.total_questions} MCQ Quiz!`, `Created "${res.data.title}" successfully.`);
    } catch (err) {
      toast.error('Failed to generate MCQ Quiz');
    } finally {
      setGenerating(false);
    }
  };


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

  const [previewQuestionsId, setPreviewQuestionsId] = useState<string | null>(null);

  const togglePreviewQuestions = (assessmentId: string) => {
    setPreviewQuestionsId(prev => (prev === assessmentId ? null : assessmentId));
  };

  const handleDownloadQuizPDF = (assessment: any) => {
    let quizQuestions = assessment.questions;
    if (!quizQuestions || quizQuestions.length === 0) {
      if (assessment.questions_json) {
        try {
          quizQuestions = typeof assessment.questions_json === 'string' 
            ? JSON.parse(assessment.questions_json) 
            : assessment.questions_json;
        } catch {
          quizQuestions = [];
        }
      }
    }

    if (!quizQuestions || quizQuestions.length === 0) {
      quizQuestions = Array.from({ length: assessment.total_questions || 5 }, (_, i) => ({
        number: i + 1,
        text: `Question ${i + 1} on ${assessment.topic || 'Subject Topic'}`,
        type: 'mcq',
        options: [
          `A) Primary theoretical model for ${assessment.topic || 'topic'}`,
          `B) Secondary optimization framework`,
          `C) Algorithmic decomposition pattern`,
          `D) Asynchronous execution pipeline`,
        ],
        marks: Math.ceil(assessment.total_marks / (assessment.total_questions || 5)),
      }));
    }

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
      questions: quizQuestions,
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

  if (loading) {
    return <SkeletonPageLoader count={6} />;
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#005BAC] via-[#0A6FD8] to-[#8CC63F] p-6 sm:p-8 rounded-3xl text-white shadow-xl flex items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-extrabold text-white">
            <HelpCircle className="w-3.5 h-3.5 text-[#8CC63F]" /> Quiz & Examination Studio
          </div>
          <h1 className="text-2xl font-black">Quizzes & Exam Studio</h1>
          <p className="text-xs text-slate-100 font-medium">Generate AI quiz question papers, evaluation rubrics, and automated score distribution reports.</p>
        </div>
        <div className="flex items-center gap-3 relative z-10 flex-shrink-0">
          <button
            onClick={() => setShowGenModal(true)}
            className="px-5 py-2.5 bg-white text-[#005BAC] hover:bg-slate-100 text-xs font-black rounded-2xl shadow-lg flex items-center gap-2 transition-all"
          >
            <Sparkles className="w-4 h-4 text-[#8CC63F]" />
            <span>Generate MCQ Quiz (10-20 Qs)</span>
          </button>
          <div className="w-36 h-24 hidden sm:flex items-center justify-center flex-shrink-0">
            <img src="/images/features_ai_planning.webp" alt="Quiz Studio Illustration" className="w-full h-auto max-h-24 object-contain drop-shadow-[0_10px_25px_rgba(0,0,0,0.4)]" />
          </div>
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
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div className="flex-1 min-w-[240px]">
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
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-brand-blue/10 text-brand-blue rounded">AI Generated</span>
                      )}
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">{a.title}</h3>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Target className="w-3.5 h-3.5" /> {a.topic || 'General'}</span>
                      <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5" /> {a.total_marks} marks</span>
                      {a.duration_minutes && (
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {a.duration_minutes} min</span>
                      )}
                      <span>{(a.questions?.length || a.total_questions)} questions</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {a.questions && a.questions.length > 0 && (
                      <button
                        onClick={() => togglePreviewQuestions(a.id)}
                        className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 text-xs font-bold rounded-lg flex items-center gap-1 transition-colors"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>{previewQuestionsId === a.id ? 'Hide Qs' : 'View Qs'}</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleDownloadQuizPDF(a)}
                      className="px-3 py-1.5 bg-[#005BAC] text-white text-xs font-bold rounded-lg flex items-center gap-1 hover:bg-[#0A6FD8] transition-colors shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5 text-[#8CC63F]" /> Quiz PDF
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          await api.post('/communications/send-email', {
                            class_id: activeClass?.id,
                            subject: `[Assessment Announcement] ${a.title} (${activeClass?.course_code})`,
                            body: `Dear Students,\n\nAn assessment titled "${a.title}" has been published for ${activeClass?.course_name}.\n\nDetails:\nTopic: ${a.topic || 'General'}\nTotal Marks: ${a.total_marks}\nDuration: ${a.duration_minutes || 30} Minutes\n\nPlease check Document Studio for the complete PDF question paper.\n\nBest regards,\n${user?.full_name || 'Faculty'}, Department of Computer Science.`,
                            recipient_type: 'all',
                          });
                          toast.success('Sent Assessment to All Students via Email', `Dispatched notification for "${a.title}".`);
                        } catch (err) {
                          toast.error('Failed to send email to students');
                        }
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-colors shadow-sm"
                      title="Send this assessment question paper notice to all students in 1-Click"
                    >
                      <Send className="w-3.5 h-3.5" /> Send to Students
                    </button>
                    <button
                      onClick={() => toggleResults(a.id)}
                      className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg flex items-center gap-1 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      {expandedId === a.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      Results
                    </button>
                    <button
                      onClick={() => setDeleteConfirmQuiz({ id: a.id, title: a.title })}
                      className="px-3 py-1.5 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white dark:hover:bg-red-600 dark:hover:text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-all duration-150 border border-red-200/80 dark:border-red-900/50"
                      title="Delete this quiz"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              </div>

              {/* ─── Real Questions Interactive Preview ─── */}
              <AnimatePresence>
                {previewQuestionsId === a.id && a.questions && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 p-5 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase text-indigo-600 dark:text-indigo-400">
                        Generated Quiz Questions ({a.questions.length} Total)
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold">Groq AI Verified</span>
                    </div>

                    <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                      {a.questions.map((q: any, qIdx: number) => (
                        <div key={qIdx} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-bold text-slate-900 dark:text-white flex-1">
                              Q{q.number || qIdx + 1}: {q.text}
                            </p>
                            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-bold text-[10px] text-slate-500 flex-shrink-0">
                              {q.marks || 2} Marks
                            </span>
                          </div>

                          {q.options && q.options.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                              {q.options.map((opt: string, optIdx: number) => (
                                <div key={optIdx} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-[11px] text-slate-700 dark:text-slate-300">
                                  {opt}
                                </div>
                              ))}
                            </div>
                          )}

                          {q.correct_option && (
                            <div className="pt-1 flex items-center gap-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                              <span>✓ Correct Answer: Option {q.correct_option}</span>
                              {q.explanation && (
                                <span className="text-slate-500 font-normal italic">— {q.explanation}</span>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>



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
                              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-400 dark:text-slate-300 uppercase sticky top-0">
                                <tr>
                                  <th className="px-3 py-2 text-left">Roll</th>
                                  <th className="px-3 py-2 text-left">Name</th>
                                  <th className="px-3 py-2 text-center">Score</th>
                                  <th className="px-3 py-2 text-center">%</th>
                                  <th className="px-3 py-2 text-center">Grade</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                                {results[a.id].map((r: any) => (
                                  <tr key={r.student_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/60">
                                    <td className="px-3 py-2 font-mono text-slate-700 dark:text-slate-300">{r.roll_number}</td>
                                    <td className="px-3 py-2 font-semibold text-slate-900 dark:text-white">{r.student_name}</td>
                                    <td className="px-3 py-2 text-center text-slate-700 dark:text-slate-300">{r.score}/{r.max_score}</td>
                                    <td className="px-3 py-2 text-center font-bold text-slate-900 dark:text-white">{r.percentage}%</td>
                                    <td className="px-3 py-2 text-center">
                                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                        r.grade === 'A' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                                        r.grade === 'B' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' :
                                        r.grade === 'C' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                                        'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
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

      {/* ─── 100% MCQ Quiz Generator Modal ─── */}
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
                <div>
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-[#005BAC]">100% MCQ Format</span>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base mt-0.5">Generate AI MCQ Quiz</h3>
                </div>
                <button onClick={() => setShowGenModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
              </div>

              {/* Fixed Active Course Subject Specification */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Subject Specification *
                </label>
                <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800 text-xs font-black text-[#005BAC] dark:text-[#8CC63F] flex items-center justify-between">
                  <span>{activeClass?.course_name || 'Course Subject'} ({activeClass?.course_code})</span>
                  <span className="text-[10px] px-2 py-0.5 bg-white dark:bg-slate-900 rounded font-semibold uppercase">{activeClass?.year_label} Sec {activeClass?.section_name}</span>
                </div>
              </div>


              {/* 20 Sub-Topics Picker */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                    Select Syllabus Sub-Topic (20 Available) *
                  </label>
                  <span className="text-[10px] font-bold text-slate-400">
                    {(subjectCatalog[selectedSubject] || []).length} Topics
                  </span>
                </div>
                <div className="max-h-36 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl p-2 bg-slate-50/50 dark:bg-slate-950/50 space-y-1">
                  {(subjectCatalog[selectedSubject] || []).map((subTopic, idx) => {
                    const isSelected = topic === subTopic;
                    return (
                      <div
                        key={idx}
                        onClick={() => setTopic(subTopic)}
                        className={`p-2 rounded-lg text-xs cursor-pointer flex items-center justify-between transition-colors ${
                          isSelected
                            ? 'bg-[#005BAC] text-white font-bold shadow-sm'
                            : 'hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <span className="truncate pr-2">{idx + 1}. {subTopic}</span>
                        {isSelected && <span className="text-[10px] px-1.5 py-0.5 bg-white/20 rounded">Selected</span>}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Selected Quiz Topic *</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Selected topic..."
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              {/* Number of MCQ Questions Selection (Range: 10 to 20 Qs) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">MCQ Count</label>
                    <span className="text-xs font-black text-[#005BAC] dark:text-[#8CC63F]">{numQuestions} Qs</span>
                  </div>
                  <select
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                  >
                    {Array.from({ length: 11 }, (_, i) => 10 + i).map((count) => (
                      <option key={count} value={count}>{count} Questions</option>
                    ))}
                  </select>
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

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setShowGenModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerateMCQQuiz}
                  disabled={!topic.trim() || generating}
                  className="px-5 py-2 bg-[#005BAC] hover:bg-[#0A6FD8] text-white text-xs font-extrabold rounded-xl shadow-lg flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {generating ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Generating Quiz...</>
                  ) : (
                    <><Sparkles className="w-4 h-4 text-[#8CC63F]" /> Generate & Publish ({numQuestions} MCQs)</>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── Delete Quiz Confirmation Modal ─── */}
      <AnimatePresence>
        {deleteConfirmQuiz && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
                <div className="p-2.5 bg-red-100 dark:bg-red-950/50 rounded-2xl">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white text-base">Delete Quiz Confirmation</h3>
                  <p className="text-xs text-slate-500">This action cannot be undone.</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Are you sure you want to permanently delete <strong className="text-slate-900 dark:text-white">"{deleteConfirmQuiz.title}"</strong>?
              </p>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setDeleteConfirmQuiz(null)}
                  disabled={deletingQuiz}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteQuiz}
                  disabled={deletingQuiz}
                  className="px-5 py-2 text-xs font-black bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-md transition-colors flex items-center gap-2"
                >
                  {deletingQuiz ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  <span>{deletingQuiz ? 'Deleting...' : 'Delete Quiz'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

