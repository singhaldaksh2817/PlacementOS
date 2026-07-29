import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';
import TopBar from '../components/layout/TopBar';
import {
  Code2, Brain, MessageSquare, Map, Building2, FileText,
  Flame, Trophy, Zap, TrendingUp, CheckCircle, Clock,
  AlertCircle, Target, Cpu, Activity, Star, Calendar, Download, Award
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { TODAY_TASKS as INITIAL_TODAY_TASKS, COMPANIES, ANALYTICS_DATA } from '../data/mockData';
import { DashboardSkeleton } from '../components/ui/SkeletonLoader';
import PlatformStats from '../components/PlatformStats';
import PlacementCertificateModal from '../components/PlacementCertificateModal';
import { playTaskCompleteSound } from '../lib/soundEffects';


import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area
} from 'recharts';

const categoryColors: Record<string, string> = {
  DSA: 'text-indigo-400 bg-indigo-500/15 border-indigo-500/25',
  Aptitude: 'text-purple-400 bg-purple-500/15 border-purple-500/25',
  Interview: 'text-blue-400 bg-blue-500/15 border-blue-500/25',
  Resume: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/25',
  Revision: 'text-amber-400 bg-amber-500/15 border-amber-500/25',
  Project: 'text-pink-400 bg-pink-500/15 border-pink-500/25',
};

const priorityDot: Record<string, string> = {
  high: 'bg-red-400',
  medium: 'bg-amber-400',
  low: 'bg-emerald-400',
};

function CircularProgress({ value, size = 100, strokeWidth = 8, color = '#6366f1' }: {
  value: number; size?: number; strokeWidth?: number; color?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
      <motion.circle
        cx={size/2} cy={size/2} r={radius} fill="none"
        stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
        style={{ filter: `drop-shadow(0 0 6px ${color}60)` }}
      />
    </svg>
  );
}

const DAILY_QUIZ_POOL = [
  {
    question: 'Which scheduling algorithm can cause the convoy effect in Operating Systems?',
    options: ['FCFS (First Come First Served)', 'SJF (Shortest Job First)', 'Round Robin', 'Priority Scheduling'],
    correct: 0,
    explanation: 'FCFS can lead to the convoy effect where short processes wait behind a long CPU burst process.',
  },
  {
    question: 'In C++, what is the worst-case time complexity of std::sort?',
    options: ['O(N log N)', 'O(N^2)', 'O(N)', 'O(1)'],
    correct: 0,
    explanation: 'std::sort uses IntroSort (Introspective Sort), guaranteeing O(N log N) worst-case time complexity.',
  },
  {
    question: 'Which HTTP status code indicates "Too Many Requests" (Rate Limited)?',
    options: ['429 Too Many Requests', '403 Forbidden', '503 Service Unavailable', '400 Bad Request'],
    correct: 0,
    explanation: '429 Too Many Requests indicates the user has sent too many requests in a given amount of time (rate limiting).',
  },
  {
    question: 'In Database Systems, what does ACID stand for?',
    options: [
      'Atomicity, Consistency, Isolation, Durability',
      'Accuracy, Concurrency, Integrity, Durability',
      'Atomicity, Control, Isolation, Data',
      'Access, Consistency, Index, Durability'
    ],
    correct: 0,
    explanation: 'ACID guarantees database transaction reliability: Atomicity, Consistency, Isolation, and Durability.',
  },
  {
    question: 'Which data structure is used to implement Breadth-First Search (BFS) in a Graph?',
    options: ['Queue (FIFO)', 'Stack (LIFO)', 'Heap / Priority Queue', 'Binary Search Tree'],
    correct: 0,
    explanation: 'BFS explores graph nodes level-by-level using a Queue (First In First Out).',
  },
  {
    question: 'What is the minimum number of comparisons needed to find the maximum in an unsorted array of size N?',
    options: ['N - 1', 'N', 'N log N', 'N / 2'],
    correct: 0,
    explanation: 'Finding the max requires comparing each new element against the current max, taking exactly N - 1 comparisons.',
  },
];

const getTodayQuizIndex = () => {
  const todayStr = new Date().toISOString().split('T')[0];
  let hash = 0;
  for (let i = 0; i < todayStr.length; i++) {
    hash = (hash << 5) - hash + todayStr.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % DAILY_QUIZ_POOL.length;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, progress, agentStatuses, dsaStats, addXP, removeXP } = useStore();
  
  const todayQuizIndex = getTodayQuizIndex();
  const todayQuiz = DAILY_QUIZ_POOL[todayQuizIndex];

  // Persistent Daily Quiz Completion State
  const todayDateKey = `placementos-quiz-${new Date().toDateString()}`;
  let savedQuizAnswer: number | null = null;
  try {
    const raw = localStorage.getItem(todayDateKey);
    if (raw !== null) savedQuizAnswer = parseInt(raw, 10);
  } catch (e) {
    console.warn('Failed to load quiz answer');
  }

  const [quizAnswered, setQuizAnswered] = useState<number | null>(savedQuizAnswer);

  let savedTasks = null;
  try {
    const raw = localStorage.getItem('dashboard-tasks-' + new Date().toDateString());
    if (raw) savedTasks = JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to parse saved tasks, using defaults');
  }
  const [isCertOpen, setIsCertOpen] = useState(false);
  const [tasks, setTasks] = useState<{id: string, title: string, category: string, status: string, estimatedTime: number, xpReward: number, priority: string}[]>(savedTasks ? savedTasks : INITIAL_TODAY_TASKS);





  const completedToday = tasks.filter(t => t.status === 'completed').length;
  const totalToday = tasks.length;

  const toggleDashboardTask = (id: string) => {
    setTasks(prev => {
      const updated = prev.map(t => {
        if (t.id !== id) return t;
        const nextStatus = t.status === 'completed' ? 'pending' : 'completed';
        if (nextStatus === 'completed') {
          confetti({ particleCount: 35, spread: 50, origin: { y: 0.7 }, ticks: 120 });
          playTaskCompleteSound();
          addXP(t.xpReward);
          toast.success(`+${t.xpReward} XP! Your Task completed 🎉`);
        } else {

          removeXP(t.xpReward);
          toast.error(`-${t.xpReward} XP. Task unmarked`);
        }
        return { ...t, status: nextStatus };
      });
      localStorage.setItem('dashboard-tasks-' + new Date().toDateString(), JSON.stringify(updated));
      return updated;
    });
  };


  const downloadReport = () => {
    window.print();
  };

  const topCompanies = COMPANIES
    .filter(c => (user?.targetCompanies || []).includes(c.name) || ['Amazon', 'Microsoft', 'Flipkart'].includes(c.name))
    .slice(0, 4);

  const scoreCategories = [
    { label: 'DSA', value: progress.dsaScore, color: '#6366f1', icon: Code2 },
    { label: 'Aptitude', value: progress.aptitudeScore, color: '#8b5cf6', icon: Brain },
    { label: 'Interview', value: progress.interviewScore, color: '#3b82f6', icon: MessageSquare },
    { label: 'Resume', value: progress.resumeScore, color: '#06b6d4', icon: FileText },
  ];

  if (!user) return <DashboardSkeleton />;

  return (
    <div className="flex-1 overflow-y-auto">
      <TopBar title="Dashboard" />
      <div className="p-6 space-y-6">

        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-blue-500/10 border-indigo-500/20 relative overflow-hidden"
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -right-16 -top-16 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl" />
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl" />
          </div>
          <div className="relative flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">👋</span>
                <h2 className="font-heading text-2xl font-bold text-white">
                  Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user?.name?.split(' ')[0] || 'Student'}!
                </h2>
              </div>
              <p className="text-slate-400 text-sm">You're on a <span className="text-orange-400 font-semibold">{progress.streak}-day streak</span> 🔥 Keep it going!</p>
              <div className="flex items-center gap-3 mt-3 flex-wrap">
                <span className="badge badge-indigo">Level {progress.level}</span>
                <span className="badge badge-amber">#{progress.rank} Rank</span>
                <span className="text-xs text-slate-500">{progress.xp.toLocaleString()} XP total</span>
                <button onClick={downloadReport} title="Download Placement Report PDF"
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium text-xs hover:opacity-90 flex items-center gap-1.5 shadow-lg transition-all print:hidden">
                  <Download size={13} /> Download Placement Report 📄
                </button>
                <button onClick={() => setIsCertOpen(true)} title="View Verified Certificate"
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-medium text-xs hover:opacity-90 flex items-center gap-1.5 shadow-lg transition-all print:hidden">
                  <Award size={13} /> Official Certificate 📜
                </button>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-6">
              <div className="text-center">
                <div className="text-3xl font-heading font-bold gradient-text">{completedToday}/{totalToday}</div>
                <div className="text-xs text-slate-500">Tasks Today</div>
              </div>
              <div className="relative">
                <CircularProgress value={progress.placementScore} size={90} strokeWidth={8} color="#6366f1" />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold text-white">{progress.placementScore}</span>
                  <span className="text-xs text-slate-500">Score</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {scoreCategories.map((cat, i) => (
            <motion.div
              key={cat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => navigate(`/${cat.label.toLowerCase()}`)}
              className="glass-card glass-card-hover p-4 cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg" style={{ background: `${cat.color}15`, border: `1px solid ${cat.color}25` }}>
                  <cat.icon size={16} style={{ color: cat.color }} />
                </div>
                <span className="text-xs font-semibold" style={{ color: cat.color }}>{cat.value}%</span>
              </div>
              <div className="text-2xl font-heading font-bold text-white">{cat.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{cat.label} Score</div>
              <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div className="h-full rounded-full" style={{ background: cat.color }}
                  initial={{ width: 0 }} animate={{ width: `${cat.value}%` }}
                  transition={{ duration: 1, delay: 0.3 + i * 0.08 }} />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Tasks */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 glass-card p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-indigo-400" />
                <h3 className="font-semibold text-white">Today's Tasks</h3>
                <span className="badge badge-indigo">{completedToday}/{totalToday} done</span>
              </div>
              <button onClick={() => navigate('/roadmap')} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                View roadmap →
              </button>
            </div>
            <div className="space-y-2.5">
              {tasks.map((task, i) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  onClick={() => toggleDashboardTask(task.id)}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                    task.status === 'completed'
                      ? 'bg-emerald-500/5 border-emerald-500/15 opacity-70'
                      : task.status === 'in_progress'
                      ? 'bg-indigo-500/5 border-indigo-500/20 hover:bg-indigo-500/10'
                      : 'bg-white/2 border-white/6 hover:bg-white/4'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 border-2 ${
                    task.status === 'completed' ? 'bg-emerald-500 border-emerald-500' :
                    task.status === 'in_progress' ? 'border-indigo-400' : 'border-slate-600'
                  }`}>
                    {task.status === 'completed' && <CheckCircle size={12} className="text-white" />}
                    {task.status === 'in_progress' && <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-sm font-medium ${task.status === 'completed' ? 'line-through text-slate-500' : 'text-white'}`}>
                        {task.title}
                      </span>
                      <span className={`badge text-xs ${categoryColors[task.category]}`}>{task.category}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock size={11} /> {task.estimatedTime}min
                      </span>
                      <span className="text-xs text-amber-500 flex items-center gap-1">
                        <Zap size={11} /> +{task.xpReward} XP
                      </span>
                      <div className={`w-1.5 h-1.5 rounded-full ${priorityDot[task.priority]}`} />
                    </div>
                  </div>
                  {task.status === 'in_progress' && (
                    <span className="badge badge-indigo text-xs flex-shrink-0">In Progress</span>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          <div className="flex flex-col gap-6">
            {/* Daily Rapid-Fire Quiz Widget */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 border-indigo-500/20 bg-indigo-500/5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Zap size={16} className="text-amber-400" />
                  <h3 className="font-semibold text-white text-sm">Daily Rapid-Fire Quiz ⚡</h3>
                </div>
                <span className="badge badge-amber text-[10px]">{quizAnswered !== null ? 'Answered' : '+50 XP'}</span>
              </div>
              <p className="text-xs text-slate-300 mb-3">{todayQuiz.question}</p>
              <div className="space-y-1.5">
                {todayQuiz.options.map((opt, i) => {
                  const isSelected = quizAnswered === i;
                  const isCorrect = i === todayQuiz.correct;
                  let btnBg = 'bg-white/4 border-white/8 text-slate-300 hover:bg-white/8';
                  if (quizAnswered !== null) {
                    if (isCorrect) btnBg = 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300';
                    else if (isSelected) btnBg = 'bg-red-500/20 border-red-500/40 text-red-300';
                    else btnBg = 'bg-white/2 border-white/5 text-slate-600';
                  }
                  return (
                    <button
                      key={i}
                      disabled={quizAnswered !== null}
                      onClick={() => {
                        if (quizAnswered !== null) return;
                        setQuizAnswered(i);
                        localStorage.setItem(todayDateKey, i.toString());
                        if (i === todayQuiz.correct) {
                          addXP(50);
                          playTaskCompleteSound();
                          toast.success('Correct answer! +50 XP 🎯');
                        } else {
                          toast.error('Incorrect. Check explanation below!');
                        }
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs border font-medium transition-all ${btnBg}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
              {quizAnswered !== null && (
                <div className="mt-3 text-[11px] text-slate-400 bg-white/3 p-2 rounded-lg border border-white/5">
                  💡 <strong>Explanation:</strong> {todayQuiz.explanation}
                </div>
              )}
            </motion.div>


            {/* Platform Stats Component */}
            <PlatformStats />


            {/* Agent Status Panel */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card p-5"
            >
              <div className="flex items-center gap-2 mb-4">
                <Cpu size={16} className="text-purple-400" />
                <h3 className="font-semibold text-white">AI Agents</h3>
                <div className="ml-auto flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs text-emerald-400">Live</span>
                </div>
              </div>
              <div className="space-y-2.5">
                {agentStatuses.map((agent, i) => {
                  const statusColors: Record<string, string> = {
                    active: 'bg-emerald-400',
                    idle: 'bg-slate-500',
                    thinking: 'bg-amber-400 animate-pulse',
                    error: 'bg-red-400',
                  };
                  const statusText: Record<string, string> = {
                    active: 'text-emerald-400',
                    idle: 'text-slate-500',
                    thinking: 'text-amber-400',
                    error: 'text-red-400',
                  };
                  return (
                    <motion.div
                      key={agent.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 + i * 0.05 }}
                      className="p-3 rounded-xl bg-white/3 border border-white/5"
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${statusColors[agent.status]}`} />
                        <span className="text-xs font-medium text-white">{agent.name}</span>
                        <span className={`text-xs ml-auto capitalize ${statusText[agent.status]}`}>{agent.status}</span>
                      </div>
                      {agent.currentTask && (
                        <p className="text-xs text-slate-500 mt-1.5 pl-4">{agent.currentTask}</p>
                      )}
                      {!agent.currentTask && (
                        <p className="text-xs text-slate-600 mt-1.5 pl-4 truncate">{agent.lastAction}</p>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Progress Over Time Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-5"
          >
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp size={16} className="text-indigo-400" />
              <h3 className="font-semibold text-white">Progress Over Time</h3>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={ANALYTICS_DATA.progressOverTime.slice(-8)}>
                <defs>
                  <linearGradient id="dsaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="aptGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="intGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Area type="monotone" dataKey="dsa" name="DSA" stroke="#6366f1" fill="url(#dsaGrad)" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="aptitude" name="Aptitude" stroke="#8b5cf6" fill="url(#aptGrad)" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="interview" name="Interview" stroke="#3b82f6" fill="url(#intGrad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 mt-2 justify-center">
              {[['DSA', '#6366f1'], ['Aptitude', '#8b5cf6'], ['Interview', '#3b82f6']].map(([l, c]) => (
                <div key={l} className="flex items-center gap-1.5">
                  <div className="w-3 h-0.5 rounded" style={{ background: c }} />
                  <span className="text-xs text-slate-500">{l}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Skill Radar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <Activity size={16} className="text-purple-400" />
              <h3 className="font-semibold text-white">Skill Radar</h3>
            </div>
            <ResponsiveContainer width="100%" height={210}>
              <RadarChart data={ANALYTICS_DATA.skillRadar} margin={{ top: 0, right: 20, bottom: 0, left: 20 }}>
                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
                <Radar name="Skills" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Companies + DSA Heatmap */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Target Companies */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="glass-card p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Building2 size={16} className="text-amber-400" />
                <h3 className="font-semibold text-white">Target Companies</h3>
              </div>
              <button onClick={() => navigate('/companies')} className="text-xs text-indigo-400 hover:text-indigo-300">View all →</button>
            </div>
            <div className="space-y-3">
              {topCompanies.map((company, i) => (
                <motion.div key={company.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 + i * 0.07 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/5 hover:border-white/10 transition-all cursor-pointer"
                  onClick={() => navigate('/companies')}>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center font-bold text-sm text-white border border-white/10 flex-shrink-0">
                    {company.logo}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">{company.name}</span>
                      <span className={`badge text-xs ${company.hiringStatus === 'active' ? 'badge-emerald' : company.hiringStatus === 'upcoming' ? 'badge-amber' : 'badge-red'}`}>
                        {company.hiringStatus}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">{company.ctcRange} • {company.locations[0]}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-semibold" style={{ color: (company.readinessScore || 0) >= 70 ? '#34d399' : (company.readinessScore || 0) >= 50 ? '#fbbf24' : '#f87171' }}>
                      {company.readinessScore}%
                    </div>
                    <div className="text-xs text-slate-600">ready</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* DSA Heatmap */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass-card p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Code2 size={16} className="text-indigo-400" />
                <h3 className="font-semibold text-white">DSA Activity</h3>
                <span className="text-xs text-slate-500">Last 6 months</span>
              </div>
              <span className="text-xs text-slate-500">{dsaStats.totalSolved} solved</span>
            </div>
            <div className="overflow-x-auto">
              <div className="flex gap-1 min-w-max">
                {Array.from({ length: 24 }, (_, weekIdx) => (
                  <div key={weekIdx} className="flex flex-col gap-1">
                    {Array.from({ length: 7 }, (_, dayIdx) => {
                      const actIdx = weekIdx * 7 + dayIdx;
                      const activity = dsaStats.dailyActivity[Math.max(0, dsaStats.dailyActivity.length - 168 + actIdx)];
                      const count = activity?.count || 0;
                      const intensity = count === 0 ? 0 : count <= 1 ? 1 : count <= 3 ? 2 : count <= 5 ? 3 : 4;
                      const colors = ['rgba(255,255,255,0.05)', 'rgba(99,102,241,0.25)', 'rgba(99,102,241,0.45)', 'rgba(99,102,241,0.70)', 'rgba(99,102,241,0.95)'];
                      return (
                        <div
                          key={dayIdx}
                          className="heatmap-cell"
                          style={{ background: colors[intensity] }}
                          title={`${count} problems`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <span>Less</span>
                  {[0,1,2,3,4].map(i => (
                    <div key={i} className="w-2.5 h-2.5 rounded-sm"
                      style={{ background: ['rgba(255,255,255,0.05)', 'rgba(99,102,241,0.25)', 'rgba(99,102,241,0.45)', 'rgba(99,102,241,0.70)', 'rgba(99,102,241,0.95)'][i] }} />
                  ))}
                  <span>More</span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-slate-400">🔥 {dsaStats.streak} day streak</span>
                <span className="text-slate-400">Rating: {dsaStats.contestRating}</span>
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              {[
                { label: 'Easy', value: dsaStats.easySolved, color: 'text-emerald-400' },
                { label: 'Medium', value: dsaStats.mediumSolved, color: 'text-amber-400' },
                { label: 'Hard', value: dsaStats.hardSolved, color: 'text-red-400' },
              ].map(s => (
                <div key={s.label} className="text-center p-2 rounded-lg bg-white/3">
                  <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-xs text-slate-500">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="glass-card p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Trophy size={16} className="text-amber-400" />
            <h3 className="font-semibold text-white">Achievements</h3>
            <span className="text-xs text-slate-500">
              {progress.achievements.filter(a => a.unlocked).length}/{progress.achievements.length} unlocked
            </span>
          </div>
          <div className="flex gap-4 flex-wrap">
            {progress.achievements.map((achievement, i) => {
              const rarityColors: Record<string, string> = {
                common: 'border-slate-500/30 bg-slate-500/5',
                rare: 'border-blue-500/30 bg-blue-500/5',
                epic: 'border-purple-500/30 bg-purple-500/5',
                legendary: 'border-amber-500/30 bg-amber-500/10',
              };
              return (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + i * 0.05 }}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border text-center w-28 ${
                    achievement.unlocked ? rarityColors[achievement.rarity] : 'border-white/5 bg-white/2 opacity-40 grayscale'
                  }`}
                >
                  <span className="text-3xl">{achievement.icon}</span>
                  <div>
                    <div className="text-xs font-semibold text-white leading-tight">{achievement.title}</div>
                    <div className="text-xs text-amber-400 mt-0.5">+{achievement.xpReward} XP</div>
                  </div>
                  {achievement.unlocked && (
                    <span className={`badge text-xs ${achievement.rarity === 'legendary' ? 'badge-amber' : achievement.rarity === 'epic' ? 'badge-purple' : achievement.rarity === 'rare' ? 'badge-blue' : 'badge-indigo'}`}>
                      {achievement.rarity}
                    </span>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Certificate Modal */}
        <PlacementCertificateModal isOpen={isCertOpen} onClose={() => setIsCertOpen(false)} />

      </div>
    </div>
  );
}

