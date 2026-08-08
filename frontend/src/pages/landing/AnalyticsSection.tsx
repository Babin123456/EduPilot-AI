import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line,
} from 'recharts';
import { TrendingUp, AlertTriangle, Users, Award, Activity } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const mockAttendanceData = [
  { week: 'Wk 1', attendance: 92, risk: 2 },
  { week: 'Wk 2', attendance: 88, risk: 3 },
  { week: 'Wk 3', attendance: 85, risk: 4 },
  { week: 'Wk 4', attendance: 91, risk: 1 },
  { week: 'Wk 5', attendance: 94, risk: 0 },
  { week: 'Wk 6', attendance: 89, risk: 2 },
];

const mockPerformanceData = [
  { quiz: 'Quiz 1', avgScore: 78 },
  { quiz: 'Quiz 2', avgScore: 82 },
  { quiz: 'Midterm', avgScore: 74 },
  { quiz: 'Quiz 3', avgScore: 89 },
  { quiz: 'Quiz 4', avgScore: 91 },
];

export const AnalyticsSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from('.analytics-header', {
        y: 40, opacity: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', toggleActions: 'play none none reverse' },
      });
      gsap.from('.analytics-dashboard', {
        x: -60, opacity: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: '.analytics-dashboard', start: 'top 80%', toggleActions: 'play none none reverse' },
      });
      gsap.from('.analytics-props > div', {
        x: 40, opacity: 0, duration: 0.6, stagger: 0.12, ease: 'power3.out',
        scrollTrigger: { trigger: '.analytics-props', start: 'top 80%', toggleActions: 'play none none reverse' },
      });
      gsap.to('.analytics-image', {
        y: -50, ease: 'none',
        scrollTrigger: { trigger: sectionRef.current, start: 'top bottom', end: 'bottom top', scrub: 2 },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="analytics" ref={sectionRef} className="py-28 bg-white dark:bg-[#0F172A] relative overflow-hidden transition-colors duration-200 wave-divider-alt">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-0 w-[400px] h-[400px] rounded-full bg-[#005BAC]/5 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="analytics-header text-center max-w-3xl mx-auto mb-20 space-y-5">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider bg-[#005BAC]/10 text-[#005BAC] dark:bg-[#8CC63F]/15 dark:text-[#8CC63F]">
            <Activity className="w-4 h-4" /> Institutional Analytics
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white">
            Real-Time{' '}
            <span className="text-gradient">Intelligence & Risk Monitoring</span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400">
            Track attendance velocity, quiz progress, and identify at-risk students before critical academic deadlines.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left: Dashboard */}
          <div className="analytics-dashboard lg:col-span-7 space-y-6">
            <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6">
              {/* Metrics Row */}
              <div className="grid grid-cols-3 gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg Attendance</p>
                  <p className="text-2xl font-black text-[#005BAC] dark:text-[#8CC63F] mt-1">91.5%</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Students</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">180</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Flagged At Risk</p>
                  <p className="text-2xl font-black text-red-500 mt-1">3</p>
                </div>
              </div>

              {/* Bar Chart */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Weekly Attendance Trend</h4>
                  <span className="text-[10px] font-semibold text-[#8CC63F] flex items-center gap-1"><TrendingUp className="w-3 h-3" /> +3.2%</span>
                </div>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mockAttendanceData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
                      <XAxis dataKey="week" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} domain={[60, 100]} />
                      <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                      <Bar dataKey="attendance" fill="#005BAC" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Line Chart */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-3">Quiz Score Trajectory</h4>
                <div className="h-40 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockPerformanceData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
                      <XAxis dataKey="quiz" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} domain={[50, 100]} />
                      <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                      <Line type="monotone" dataKey="avgScore" stroke="#8CC63F" strokeWidth={3} dot={{ r: 5, fill: '#8CC63F' }} activeDot={{ r: 7, stroke: '#8CC63F', strokeWidth: 2 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Value Props + Image */}
          <div className="lg:col-span-5 space-y-8">
            {/* Parallax Image */}
            <div className="analytics-image relative rounded-3xl glass-card p-3 overflow-hidden bg-white dark:bg-[#1E293B]">
              <img src="/images/analytics_dashboard.png" alt="Analytics Dashboard Preview" className="w-full h-auto rounded-2xl object-contain bg-white dark:bg-[#1E293B]" loading="lazy" />
            </div>

            {/* Value Props */}
            <div className="analytics-props space-y-5">
              {[
                { icon: AlertTriangle, color: 'text-red-500 bg-red-500/10', title: 'Automated Risk Detection', desc: 'Identify students dropping below 75% attendance threshold early for proactive academic counselling.' },
                { icon: Users, color: 'text-[#005BAC] dark:text-[#8CC63F] bg-[#005BAC]/10 dark:bg-[#8CC63F]/15', title: 'Multi-Section Comparison', desc: 'Compare performance metrics across Section A, B, and C seamlessly with year-grouped context selectors.' },
                { icon: Award, color: 'text-purple-500 bg-purple-500/10', title: 'Export-Ready Reports', desc: 'Export high-resolution PDF performance reports for HOD reviews, accreditation scans, and parent updates.' },
              ].map((prop) => {
                const Icon = prop.icon;
                return (
                  <div key={prop.title} className="group flex gap-4 items-start p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-300 cursor-default">
                    <div className={`w-11 h-11 rounded-xl ${prop.color} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">{prop.title}</h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{prop.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
