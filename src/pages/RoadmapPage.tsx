import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';
import { useStore } from '../store/useStore';
import { playTaskCompleteSound } from '../lib/soundEffects';
import TopBar from '../components/layout/TopBar';
import {
  Map, CheckCircle, Clock, Zap, ChevronRight,
  AlertTriangle, Trophy, RefreshCw, Target, TrendingUp, Sparkles, Building2, BookOpen, Download
} from 'lucide-react';
import type { RoadmapTask } from '../types';


const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const categoryColors: Record<string, { bg: string; text: string; dot: string }> = {
  DSA: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', dot: 'bg-indigo-500' },
  Aptitude: { bg: 'bg-purple-500/10', text: 'text-purple-400', dot: 'bg-purple-500' },
  Interview: { bg: 'bg-blue-500/10', text: 'text-blue-400', dot: 'bg-blue-500' },
  Resume: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: 'bg-emerald-500' },
  Revision: { bg: 'bg-amber-500/10', text: 'text-amber-400', dot: 'bg-amber-500' },
  Project: { bg: 'bg-pink-500/10', text: 'text-pink-400', dot: 'bg-pink-500' },
};

export default function RoadmapPage() {
  const { user, progress, dsaStats, addXP, removeXP } = useStore();
  const [activeTab, setActiveTab] = useState<'today' | 'week' | 'phases' | 'goals'>('today');

  // Extract user personalized parameters
  const userName = user?.name || 'Student';
  const targetCompanies = user?.targetCompanies && user.targetCompanies.length > 0
    ? user.targetCompanies
    : ['Google', 'Microsoft', 'Amazon'];
  const mainTarget = targetCompanies[0] || 'Google';
  const secondTarget = targetCompanies[1] || 'Microsoft';

  const weakTopics = dsaStats?.weakTopics && dsaStats.weakTopics.length > 0
    ? dsaStats.weakTopics
    : ['Dynamic Programming', 'Graphs'];
  const mainWeak = weakTopics[0] || 'Dynamic Programming';
  const secondWeak = weakTopics[1] || 'Graphs';

  const dailyHours = user?.dailyHours || 4;
  const placementMonth = user?.placementMonth || 'December 2025';
  const year = user?.year || 3;
  const branch = user?.branch || 'Computer Science';

  // Generate personalized daily tasks based on user profile
  const initialTodayTasks = useMemo<RoadmapTask[]>(() => [
    {
      id: 'task-1',
      title: `Master ${mainWeak}: Solve 3 Core Problems`,
      description: `Targeting your identified weak area (${mainWeak}) to boost ${mainTarget} OA clearing score.`,
      category: 'DSA',
      priority: 'high',
      status: 'pending',
      dueDate: new Date().toISOString(),
      estimatedTime: Math.min(90, dailyHours * 20),
      xpReward: 150,
      tags: [mainWeak, mainTarget],
    },
    {
      id: 'task-2',
      title: `${mainTarget} OA Pattern Practice`,
      description: `Practice top-asked questions & time-bounded coding assessments for ${mainTarget}.`,
      category: 'DSA',
      priority: 'high',
      status: 'pending',
      dueDate: new Date().toISOString(),
      estimatedTime: Math.min(60, dailyHours * 15),
      xpReward: 120,
      tags: [mainTarget, 'Company PYQs'],
    },
    {
      id: 'task-3',
      title: `Aptitude & Speed Math Drill`,
      description: `Complete quantitative & logical reasoning modules for placement screening rounds.`,
      category: 'Aptitude',
      priority: 'medium',
      status: 'pending',
      dueDate: new Date().toISOString(),
      estimatedTime: 45,
      xpReward: 90,
      tags: ['Aptitude', 'Speed Test'],
    },
    {
      id: 'task-4',
      title: `${secondTarget} System & Behavioral Review`,
      description: `Prepare STAR responses & OOP/System Design principles for ${secondTarget} technical rounds.`,
      category: 'Interview',
      priority: 'medium',
      status: 'pending',
      dueDate: new Date().toISOString(),
      estimatedTime: 40,
      xpReward: 100,
      tags: [secondTarget, 'Behavioral'],
    },
    {
      id: 'task-5',
      title: `Revise ${secondWeak} & Past Missed Mistakes`,
      description: `Quick review of notes and error logs for ${secondWeak} concepts.`,
      category: 'Revision',
      priority: 'medium',
      status: 'pending',
      dueDate: new Date().toISOString(),
      estimatedTime: 30,
      xpReward: 70,
      tags: ['Revision', secondWeak],
    },
    ...(dailyHours >= 4 ? [{
      id: 'task-6',
      title: `Resume Alignment for ${mainTarget}`,
      description: `Optimize keywords in project descriptions for ${mainTarget} ATS scanner.`,
      category: 'Resume' as const,
      priority: 'medium' as const,
      status: 'pending' as const,
      dueDate: new Date().toISOString(),
      estimatedTime: 30,
      xpReward: 80,
      tags: ['ATS Resume', mainTarget],
    }] : []),
  ], [mainWeak, secondWeak, mainTarget, secondTarget, dailyHours]);

  const isDemoUser = user?.id === 'demo-user-001';
  const storageKey = `roadmap-tasks-${user?.id || 'guest'}-${new Date().toDateString()}`;
  
  const [tasks, setTasks] = useState<RoadmapTask[]>(() => {
    try { localStorage.removeItem('roadmap-tasks-' + new Date().toDateString()); } catch (e) {}
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return initialTodayTasks;
  });

  // Personalized weekly tasks generator
  const weekTasks = useMemo<Record<string, { category: string; title: string; status: 'completed' | 'in_progress' | 'pending' }[]>>(() => {
    const isCompleted = isDemoUser ? 'completed' : 'pending';
    const isInProgress = isDemoUser ? 'in_progress' : 'pending';
    return {
      Mon: [
        { category: 'DSA', title: `${mainWeak} Deep-dive`, status: isCompleted },
        { category: 'Aptitude', title: 'Quantitative Practice', status: isCompleted },
      ],
      Tue: [
        { category: 'DSA', title: `${mainTarget} PYQs`, status: isCompleted },
        { category: 'Revision', title: 'Error Log Review', status: isInProgress },
      ],
      Wed: [
        { category: 'DSA', title: `${secondWeak} Drills`, status: isInProgress },
        { category: 'Interview', title: 'Behavioral Questions', status: 'pending' },
      ],
      Thu: [
        { category: 'DSA', title: `${secondTarget} Coding Assessment`, status: 'pending' },
        { category: 'Aptitude', title: 'Logical Reasoning Test', status: 'pending' },
      ],
      Fri: [
        { category: 'DSA', title: `${branch} CS Fundamentals`, status: 'pending' },
        { category: 'Revision', title: 'Weekly Formula & Sheet', status: 'pending' },
      ],
      Sat: [
        { category: 'Interview', title: `${mainTarget} AI Mock Interview`, status: 'pending' },
        { category: 'Resume', title: 'ATS Score Check & Fixes', status: 'pending' },
      ],
      Sun: [
        { category: 'Project', title: 'Portfolio Project Enhancement', status: 'pending' },
        { category: 'Revision', title: 'Weekly Recap & Retrospective', status: 'pending' },
      ],
    };
  }, [mainWeak, secondWeak, mainTarget, secondTarget, branch, isDemoUser]);

  // Personalized placement phases
  const personalizedPhases = useMemo(() => [
    {
      name: 'Phase 1: Foundational Mastery',
      duration: 'Weeks 1-4',
      status: isDemoUser ? 'completed' : 'active',
      desc: `Core CS fundamentals (${branch}), Arrays, Strings, Sorting & basic recursion.`,
    },
    {
      name: `Phase 2: Weak Area Conquest (${mainWeak} & ${secondWeak})`,
      duration: 'Weeks 5-10',
      status: isDemoUser ? 'active' : 'upcoming',
      desc: `Intensive algorithmic problem solving focused on ${mainWeak}, ${secondWeak}, and Trees.`,
    },
    {
      name: `Phase 3: ${targetCompanies.slice(0, 3).join(', ')} Target Sprint`,
      duration: 'Weeks 11-14',
      status: 'upcoming',
      desc: `Company-specific OA pattern practice, PYQs, and System Design for ${mainTarget} & ${secondTarget}.`,
    },
    {
      name: `Phase 4: Final Placement Sprint (${placementMonth})`,
      duration: 'Weeks 15-16',
      status: 'upcoming',
      desc: `AI Mock interviews, STAR behavioral readiness, ATS resume optimization, and referral pushes.`,
    },
  ], [branch, mainWeak, secondWeak, targetCompanies, mainTarget, secondTarget, placementMonth, isDemoUser]);

  // Personalized weekly & monthly goals
  const personalizedGoals = useMemo(() => ({
    weekly: [
      { goal: `Solve 15 ${mainWeak} problems`, progress: isDemoUser ? 65 : 0, done: false },
      { goal: `Complete ${mainTarget} Online Assessment simulation`, progress: isDemoUser ? 100 : 0, done: isDemoUser },
      { goal: `Achieve 85%+ score in Aptitude Speed Test`, progress: isDemoUser ? 100 : 0, done: isDemoUser },
      { goal: `Practice ${secondWeak} graph/tree traversals`, progress: isDemoUser ? 40 : 0, done: false },
      { goal: `Optimize resume ATS score for ${mainTarget}`, progress: isDemoUser ? 20 : 0, done: false },
    ],
    milestones: [
      { milestone: `Target readiness for ${mainTarget} (${targetCompanies.join(', ')})`, by: placementMonth, status: 'on-track' },
      { milestone: `Master weak topics (${mainWeak}, ${secondWeak})`, by: 'Next 30 Days', status: 'on-track' },
      { milestone: `Maintain ${dailyHours}h daily prep streak (Current: ${progress.streak} days)`, by: 'Ongoing', status: 'on-track' },
      { milestone: `Complete 10 ${mainTarget}-style AI Mock Interviews`, by: placementMonth, status: 'upcoming' },
    ]
  }), [mainWeak, secondWeak, mainTarget, targetCompanies, placementMonth, dailyHours, progress.streak, isDemoUser]);

  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const totalXP = tasks.filter(t => t.status === 'completed').reduce((s, t) => s + t.xpReward, 0);

  const toggleTask = (id: string) => {
    setTasks(prev => {
      const updated = prev.map(t => {
        if (t.id !== id) return t;
        const next = t.status === 'completed' ? ('pending' as const) : ('completed' as const);
        if (next === 'completed') {
          confetti({ particleCount: 35, spread: 50, origin: { y: 0.7 }, ticks: 120 });
          playTaskCompleteSound();
          addXP(t.xpReward);
          toast.success(`+${t.xpReward} XP! Task completed 🎉`);
        } else {
          removeXP(t.xpReward);
          toast.error(`-${t.xpReward} XP. Task unmarked`);
        }
        return { ...t, status: next, completedAt: next === 'completed' ? new Date().toISOString() : undefined };
      });
      localStorage.setItem('roadmap-tasks-' + new Date().toDateString(), JSON.stringify(updated));
      return updated;
    });
  };


  const regenerateRoadmap = () => {
    setTasks(initialTodayTasks);
    toast.success('✨ AI Roadmap re-calibrated for your profile!');
  };

  const downloadReport = () => {
    window.print();
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <TopBar title="Personalized Roadmap" subtitle={`Custom AI placement plan for ${userName}`} />
      <div className="p-6 space-y-5">

        {/* User Context Banner */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card p-5 bg-gradient-to-r from-indigo-600/15 via-purple-600/10 to-pink-600/15 border-indigo-500/30">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="badge badge-indigo flex items-center gap-1">
                  <Sparkles size={12} /> AI Personalized
                </span>
                <span className="badge bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1 text-xs">
                  <Building2 size={12} /> Target: {targetCompanies.join(', ')}
                </span>
                <span className="badge bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 text-xs">
                  <BookOpen size={12} /> Year {year} ({branch})
                </span>
              </div>
              <h2 className="text-white font-bold text-lg font-heading">
                {userName}'s Custom Placement Path
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Phase 2: Core DSA & Weak Topic Focus ({mainWeak}) • Target Date: <strong className="text-indigo-300">{placementMonth}</strong> • Schedule: <strong className="text-indigo-300">{dailyHours}h/day</strong>
              </p>
            </div>
            <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10 self-start md:self-auto flex-wrap">
              <div className="text-right">
                <div className="text-3xl font-heading font-bold gradient-text">{progress.placementScore}%</div>
                <div className="text-xs text-slate-400">Overall Readiness</div>
              </div>
              <button onClick={downloadReport} title="Download Printable PDF Report"
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium text-xs hover:opacity-90 flex items-center gap-1.5 shadow-lg transition-all print:hidden">
                <Download size={14} /> Download Placement Report 📄
              </button>
              <button onClick={regenerateRoadmap} title="Refresh AI Plan"
                className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border border-indigo-500/40 transition-all print:hidden">
                <RefreshCw size={16} />
              </button>
            </div>
          </div>

          <div className="mt-4 h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500"
              initial={{ width: 0 }} animate={{ width: `${progress.placementScore}%` }} transition={{ duration: 1 }} />
          </div>
          <div className="flex justify-between text-xs text-slate-500 mt-1.5">
            <span>Foundations</span>
            <span className="text-indigo-300 font-medium">{mainWeak} & {mainTarget} Focus</span>
            <span>{placementMonth} Goal</span>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 flex-wrap">
          {(['today', 'week', 'phases', 'goals'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${activeTab === tab ? 'tab-active' : 'tab-inactive'}`}>
              {tab === 'today' ? "Today's Custom Tasks" : tab === 'week' ? "Personalized Week" : tab === 'phases' ? "Roadmap Phases" : "Target Goals"}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* TODAY TASKS */}
          {activeTab === 'today' && (
            <motion.div key="today" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="badge badge-indigo">{completedCount}/{tasks.length} tasks completed</span>
                  <span className="text-sm text-amber-400 flex items-center gap-1"><Zap size={12} />+{totalXP} XP earned</span>
                </div>
                <button onClick={regenerateRoadmap} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors">
                  <RefreshCw size={12} /> Recalibrate Schedule
                </button>
              </div>

              <div className="space-y-3">
                {tasks.map((task, i) => {
                  const cat = categoryColors[task.category] || categoryColors.DSA;
                  return (
                    <motion.div key={task.id}
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`glass-card p-4 flex items-start gap-4 cursor-pointer transition-all ${
                        task.status === 'completed' ? 'opacity-60 bg-white/2' : 'glass-card-hover'
                      }`}
                      onClick={() => toggleTask(task.id)}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                        task.status === 'completed' ? 'bg-emerald-500' : 'border-2 border-slate-600 hover:border-indigo-500'
                      }`}>
                        {task.status === 'completed' && <CheckCircle size={14} className="text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`text-sm font-medium ${task.status === 'completed' ? 'line-through text-slate-500' : 'text-white'}`}>
                            {task.title}
                          </span>
                          <span className={`badge text-xs ${cat.bg} ${cat.text} border border-transparent`}>{task.category}</span>
                          {task.priority === 'high' && <span className="badge badge-red text-xs">High Priority</span>}
                        </div>
                        <p className="text-xs text-slate-400 mb-2">{task.description}</p>
                        <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                          <span className="flex items-center gap-1"><Clock size={11} />{task.estimatedTime} min</span>
                          <span className="flex items-center gap-1 text-amber-400"><Zap size={11} />+{task.xpReward} XP</span>
                          {task.tags.map(tag => (
                            <span key={tag} className="px-2 py-0.5 rounded-md bg-white/5 text-slate-400 border border-white/5 text-xs">{tag}</span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Personalized AI Agent Note */}
              <div className="flex items-start gap-3 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/25">
                <AlertTriangle size={16} className="text-indigo-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-indigo-200 leading-relaxed">
                  <strong>AI Roadmap Agent for {userName}:</strong> Your plan is calibrated specifically for <strong>{mainTarget}</strong>.
                  Since <strong>{mainWeak}</strong> is your lowest-confidence area, focusing on today's 3 medium problems will increase your {mainTarget} OA success probability by an estimated <strong>+14%</strong>.
                </div>
              </div>
            </motion.div>
          )}

          {/* WEEKLY SCHEDULE */}
          {activeTab === 'week' && (
            <motion.div key="week" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
                {WEEK_DAYS.map((day, dayIdx) => {
                  const dayTasks = weekTasks[day] || [];
                  const isToday = dayIdx === 2; // Wed as sample current day
                  return (
                    <motion.div key={day}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: dayIdx * 0.04 }}
                      className={`glass-card p-3.5 flex flex-col justify-between ${isToday ? 'border-indigo-500/50 bg-indigo-500/10' : ''}`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-xs font-bold ${isToday ? 'text-indigo-300' : 'text-slate-400'}`}>{day}</span>
                          {isToday && <span className="badge badge-indigo text-xs py-0 px-1.5">Today</span>}
                        </div>
                        <div className="space-y-2">
                          {dayTasks.map((t, idx) => {
                            const cat = categoryColors[t.category] || categoryColors.DSA;
                            return (
                              <div key={idx} className={`p-2 rounded-lg text-xs space-y-1 ${cat.bg} border border-white/5`}>
                                <div className={`font-semibold ${cat.text}`}>{t.category}</div>
                                <div className="text-slate-300 line-clamp-2 leading-tight">{t.title}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <div className="mt-3 pt-2 border-t border-white/5 text-xs text-slate-500 text-center">
                        {dailyHours}h allocated
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* PHASES */}
          {activeTab === 'phases' && (
            <motion.div key="phases" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              {personalizedPhases.map((phase, i) => (
                <motion.div key={phase.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className={`glass-card p-5 flex items-center gap-4 ${
                    phase.status === 'active' ? 'border-indigo-500/50 bg-indigo-500/8' : ''
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                    phase.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                    phase.status === 'active' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/5 text-slate-600'
                  }`}>
                    {phase.status === 'completed' ? <CheckCircle size={22} /> :
                     phase.status === 'active' ? <Target size={22} /> :
                     <Clock size={22} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-semibold text-white text-base">{phase.name}</span>
                      <span className={`badge text-xs ${
                        phase.status === 'completed' ? 'badge-emerald' :
                        phase.status === 'active' ? 'badge-indigo' : 'bg-white/5 text-slate-500 border-white/10'
                      }`}>{phase.status === 'active' ? 'Current Phase' : phase.status === 'completed' ? 'Completed' : 'Upcoming'}</span>
                    </div>
                    <div className="text-xs text-indigo-400 font-medium mb-1">{phase.duration}</div>
                    <div className="text-sm text-slate-300">{phase.desc}</div>
                  </div>
                  <ChevronRight size={18} className="text-slate-600 flex-shrink-0" />
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* GOALS & MILESTONES */}
          {activeTab === 'goals' && (
            <motion.div key="goals" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="glass-card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Trophy size={18} className="text-amber-400" />
                  <h3 className="font-semibold text-white text-base">Weekly Goals for {userName}</h3>
                </div>
                <div className="space-y-3">
                  {personalizedGoals.weekly.map((g, i) => (
                    <div key={i} className={`p-3.5 rounded-xl border ${g.done ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-white/3 border-white/5'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        {g.done ? <CheckCircle size={15} className="text-emerald-400" /> : <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-600" />}
                        <span className={`text-sm font-medium ${g.done ? 'line-through text-slate-400' : 'text-white'}`}>{g.goal}</span>
                        <span className="ml-auto text-xs font-mono text-slate-400">{g.progress}%</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div className="h-full rounded-full" style={{ background: g.done ? '#10b981' : '#6366f1' }}
                          initial={{ width: 0 }} animate={{ width: `${g.progress}%` }} transition={{ duration: 0.8 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp size={18} className="text-indigo-400" />
                  <h3 className="font-semibold text-white text-base">Personal Placement Milestones</h3>
                </div>
                <div className="space-y-3">
                  {personalizedGoals.milestones.map((m, i) => (
                    <div key={i} className="flex items-center gap-3 p-3.5 rounded-xl bg-white/3 border border-white/5">
                      <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                        m.status === 'on-track' ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-indigo-400'
                      }`} />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-white">{m.milestone}</div>
                        <div className="text-xs text-slate-400 mt-0.5">Target: {m.by}</div>
                      </div>
                      <span className={`badge text-xs ${m.status === 'on-track' ? 'badge-emerald' : 'badge-indigo'}`}>
                        {m.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
