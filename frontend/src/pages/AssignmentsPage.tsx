import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Sparkles, Download, Send, Eye, X, Loader2, ClipboardList, Trash2, AlertTriangle } from 'lucide-react';

import { SkeletonPageLoader } from '../components/SkeletonPageLoader';
import { generateQuizPDF } from '../utils/pdfGenerator';

export const AssignmentsPage: React.FC = () => {
  const { activeClass, user } = useAuth();
  const toast = useToast();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirmAssignment, setDeleteConfirmAssignment] = useState<{ id: string; title: string } | null>(null);
  const [deletingAssignment, setDeletingAssignment] = useState(false);

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

  // Subject & Sub-Topic Catalog State
  const [selectedSubject, setSelectedSubject] = useState<string>('');

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
    fetchAssignments();

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



  const fetchAssignments = () => {
    setLoading(true);
    api.get(`/assignments?class_id=${activeClass?.id}`)
      .then(res => setAssignments(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const handleDeleteAssignment = async () => {
    if (!deleteConfirmAssignment) return;
    setDeletingAssignment(true);
    try {
      await api.delete(`/assignments/${deleteConfirmAssignment.id}`);
      toast.success('Assignment Deleted', `Successfully removed "${deleteConfirmAssignment.title}".`);
      if (activeTitle === deleteConfirmAssignment.title) {
        setGeneratedMarkdown(null);
        setGeneratedQuestionsData([]);
        setActiveTitle('');
      }
      setDeleteConfirmAssignment(null);
      fetchAssignments();
    } catch (err) {
      toast.error('Failed to Delete Assignment');
    } finally {
      setDeletingAssignment(false);
    }
  };

  const handleGenerateAIQuestions = async () => {
    if (!topic.trim() || !activeClass) return;
    setGenerating(true);

    try {
      const res = await api.post('/assignments/generate', {
        class_id: activeClass.id,
        topic: topic.trim(),
        difficulty: difficulty,
        num_questions: numQuestions,
      });

      setGeneratedQuestionsData(res.data.questions || []);
      setGeneratedMarkdown(res.data.markdown || '');
      setActiveTitle(res.data.title || `Assignment — ${topic}`);
      setShowGenModal(false);
      fetchAssignments();
      toast.success('AI Assignment Generated & Saved!', 'Review the formatted question paper below or download as PDF.');
    } catch (err) {
      toast.error('Failed to generate AI Assignment');
    } finally {
      setGenerating(false);
    }
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

  if (loading) {
    return <SkeletonPageLoader count={6} />;
  }

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
        <div className="flex items-center gap-3 relative z-10 flex-shrink-0">
          <button
            onClick={() => setShowGenModal(true)}
            className="px-5 py-3 bg-slate-950 hover:bg-slate-900 text-white text-xs font-black rounded-2xl border border-slate-700 flex items-center gap-2 shadow-xl transition-all"
          >
            <Sparkles className="w-4 h-4 text-[#8CC63F]" />
            <span>Generate AI Assignment</span>
          </button>
          <div className="w-36 h-24 hidden md:flex items-center justify-center flex-shrink-0">
            <img src="/images/assignment.webp" alt="Assignment Studio Illustration" className="w-full h-auto max-h-24 object-contain drop-shadow-[0_10px_25px_rgba(0,0,0,0.4)]" />
          </div>

        </div>
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
        {assignments.length === 0 ? (
          <div className="md:col-span-2 lg:col-span-3 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-10 text-center shadow-sm">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#005BAC]/10 dark:bg-[#8CC63F]/15 text-[#005BAC] dark:text-[#8CC63F] flex items-center justify-center">
              <ClipboardList className="w-7 h-7" />
            </div>
            <h2 className="mt-4 text-base font-black text-slate-900 dark:text-white">No assignments yet</h2>
            <p className="mt-1 max-w-md mx-auto text-xs leading-relaxed text-slate-500">
              There are no assignments for {activeClass?.course_name || 'this class'} yet.
            </p>
          </div>
        ) : assignments.map((a) => (
          <div key={a.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-blue-50 text-brand-blue rounded">
                {a.topic || 'General'}
              </span>
              <span className="text-[10px] text-slate-400 font-bold">{a.difficulty}</span>
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">{a.title}</h3>
            <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-3">
              <span>Submissions: <strong>{a.submitted_count}/{a.total_students}</strong></span>
              <span>Marks: <strong>{a.total_marks}</strong></span>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => {
                  let mdText = a.instructions || '';
                  let qData = [];

                  if (a.questions_json) {
                    try {
                      qData = typeof a.questions_json === 'string' ? JSON.parse(a.questions_json) : a.questions_json;
                    } catch (e) {
                      qData = [];
                    }
                  }

                  if (!mdText) {
                    if (qData && qData.length > 0) {
                      const mdLines = [
                        `# ${a.title}`,
                        `**Course:** ${activeClass?.course_name || ''} (\`${activeClass?.course_code || ''}\`) | **Total Marks:** ${a.total_marks || 50} | **Difficulty:** ${(a.difficulty || 'medium').toUpperCase()}`,
                        '\n---\n',
                      ];
                      qData.forEach((q: any) => {
                        mdLines.push(`### Question ${q.number} [${q.marks || 5} Marks]\n${q.text}\n`);
                        if (q.options) {
                          q.options.forEach((opt: string) => mdLines.push(`- ${opt}`));
                          mdLines.push('');
                        }
                      });
                      mdText = mdLines.join('\n');
                    } else {
                      mdText = `# ${a.title}\n**Course:** ${activeClass?.course_name || ''} (\`${activeClass?.course_code || ''}\`)\n\n${a.description || 'No detailed instructions available.'}`;
                    }
                  }

                  if (!qData || qData.length === 0) {
                    qData = Array.from({ length: 5 }, (_, i) => ({
                      number: i + 1,
                      text: `Solve and submit problem ${i + 1} regarding ${a.topic || a.title}.`,
                      type: 'short',
                      marks: Math.ceil((a.total_marks || 50) / 5),
                    }));
                  }

                  setGeneratedQuestionsData(qData);
                  setGeneratedMarkdown(mdText);
                  setActiveTitle(a.title);
                  toast.info('Opened Assignment View', `Review "${a.title}" in Markdown format.`);
                }}
                className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-[#005BAC] hover:text-white text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Material & PDF</span>
              </button>
              <button
                onClick={() => setDeleteConfirmAssignment({ id: a.id, title: a.title })}
                className="p-2 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-600 hover:text-white text-rose-600 dark:text-rose-400 rounded-xl transition-colors"
                title="Delete Assignment"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
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
                <div className="max-h-40 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl p-2 bg-slate-50/50 dark:bg-slate-950/50 space-y-1">
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
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Selected Assignment Topic *</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Select a recommended topic above or enter custom topic..."
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

      {/* ─── Delete Assignment Confirmation Modal ─── */}
      <AnimatePresence>
        {deleteConfirmAssignment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
                <div className="p-2.5 bg-rose-100 dark:bg-rose-950/50 rounded-2xl">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white text-base">Delete Assignment Confirmation</h3>
                  <p className="text-xs text-slate-500">This action cannot be undone.</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Are you sure you want to permanently delete <strong className="text-slate-900 dark:text-white">"{deleteConfirmAssignment.title}"</strong>?
              </p>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setDeleteConfirmAssignment(null)}
                  disabled={deletingAssignment}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAssignment}
                  disabled={deletingAssignment}
                  className="px-5 py-2 text-xs font-black bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md transition-colors flex items-center gap-2"
                >
                  {deletingAssignment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  <span>{deletingAssignment ? 'Deleting...' : 'Delete Assignment'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
