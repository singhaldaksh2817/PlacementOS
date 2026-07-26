import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TopBar from '../components/layout/TopBar';
import { Brain, Clock, CheckCircle, XCircle, ChevronRight, BarChart3, Trophy, Target, AlertTriangle } from 'lucide-react';
import { useStore } from '../store/useStore';
import { APTITUDE_QUESTIONS, LEADERBOARD } from '../data/mockData';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from 'recharts';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';

type TestPhase = 'select' | 'test' | 'result';

const CATEGORIES = [
  { id: 'all', label: 'Full Test', desc: 'All categories mixed', icon: '🎯', questions: 10, time: 15 },
  { id: 'Quantitative', label: 'Quantitative', desc: 'Math, Speed, Profit/Loss', icon: '📊', questions: 5, time: 8 },
  { id: 'Logical', label: 'Logical Reasoning', desc: 'Patterns, Coding, Puzzles', icon: '🧩', questions: 5, time: 8 },
  { id: 'CS', label: 'CS Fundamentals', desc: 'OS, DBMS, Algorithms', icon: '💻', questions: 5, time: 8 },
  { id: 'Verbal', label: 'Verbal', desc: 'Grammar, Reading, Vocabulary', icon: '📝', questions: 5, time: 8 },
];

export default function AptitudePage() {
  const { addXP, progress, user } = useStore();
  const [phase, setPhase] = useState<TestPhase>('select');
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const [questions, setQuestions] = useState(APTITUDE_QUESTIONS);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [activeTab, setActiveTab] = useState<'select' | 'leaderboard' | 'history'>('select');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTest = (cat: typeof CATEGORIES[0]) => {
    setSelectedCategory(cat);
    const qs = cat.id === 'all' ? APTITUDE_QUESTIONS : APTITUDE_QUESTIONS.filter(q => q.category === cat.id);
    const shuffled = [...qs].sort(() => Math.random() - 0.5).slice(0, cat.questions);
    setQuestions(shuffled);
    setAnswers(new Array(shuffled.length).fill(null));
    setCurrentQ(0);
    setSelected(null);
    setTimeLeft(cat.time * 60);
    setShowExplanation(false);
    setPhase('test');

    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setPhase('result');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    setAnswers(prev => {
      const next = [...prev];
      next[currentQ] = idx;
      return next;
    });
    setShowExplanation(true);
  };

  const nextQuestion = () => {
    if (currentQ + 1 >= questions.length) {
      if (timerRef.current) clearInterval(timerRef.current);
      setPhase('result');
      return;
    }
    setCurrentQ(q => q + 1);
    setSelected(null);
    setShowExplanation(false);
  };

  const calculateScore = () => {
    const correct = answers.filter((a, i) => a === questions[i]?.correct).length;
    const total = questions.length;
    const score = Math.round((correct / total) * 100);
    return { correct, total, score };
  };

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  // ✅ Award XP only ONCE when result screen first appears (not on every render)
  useEffect(() => {
    if (phase !== 'result') return;
    const { correct } = calculateScore();
    const xpEarned = correct * 25;
    if (xpEarned > 0) addXP(xpEarned);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Save aptitude result to Supabase when test completes
  useEffect(() => {
    if (phase !== 'result' || !user) return;
    const { correct, total, score } = calculateScore();
    const xpEarned = correct * 25;
    supabase.from('aptitude_results').insert({
      user_id: user.id,
      title: selectedCategory.label,
      category: selectedCategory.id,
      score: correct,
      total_marks: total,
      accuracy: score,
      time_taken: (selectedCategory.time * 60) - timeLeft,
      category_wise: JSON.stringify({}),
    }).then(({ error }) => {
      if (!error) toast.success(`Result saved! 🎯`);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const question = questions[currentQ];

  if (phase === 'result') {
    const { correct, total, score } = calculateScore();
    const xpEarned = correct * 25;
    // ✅ addXP is now called in useEffect above — NOT here during render

    const categoryData = Object.entries(
      answers.reduce((acc, ans, i) => {
        const cat = questions[i]?.category || 'Unknown';
        if (!acc[cat]) acc[cat] = { correct: 0, total: 0 };
        acc[cat].total++;
        if (ans === questions[i]?.correct) acc[cat].correct++;
        return acc;
      }, {} as Record<string, { correct: number; total: number }>)
    ).map(([name, data]) => ({ name, accuracy: Math.round((data.correct / data.total) * 100) }));

    return (
      <div className="flex-1 overflow-y-auto">
        <TopBar title="Aptitude Test — Results" />
        <div className="p-6 max-w-4xl mx-auto space-y-5">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-8 text-center bg-gradient-to-br from-indigo-500/10 to-purple-500/5">
            <div className="text-6xl mb-4">{score >= 80 ? '🏆' : score >= 60 ? '✅' : '📚'}</div>
            <div className="text-5xl font-heading font-bold gradient-text mb-2">{score}%</div>
            <div className="text-xl text-white font-semibold mb-1">{correct} / {total} correct</div>
            <div className="text-slate-400">+{xpEarned} XP earned</div>
            {score >= 80 && <div className="mt-2 badge badge-emerald inline-block">Excellent! Difficulty increases next time</div>}
            {score < 50 && <div className="mt-2 badge badge-amber inline-block">Don't worry! Easier questions queued up</div>}
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="glass-card p-5">
              <h3 className="font-semibold text-white mb-4">Accuracy by Category</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={categoryData}>
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="accuracy" name="Accuracy %" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="glass-card p-5">
              <h3 className="font-semibold text-white mb-4">Question Review</h3>
              <div className="space-y-2 overflow-y-auto max-h-48">
                {questions.map((q, i) => (
                  <div key={q.id} className={`flex items-center gap-2 p-2 rounded-lg text-xs ${
                    answers[i] === q.correct ? 'bg-emerald-500/10' : 'bg-red-500/10'
                  }`}>
                    {answers[i] === q.correct
                      ? <CheckCircle size={12} className="text-emerald-400 flex-shrink-0" />
                      : <XCircle size={12} className="text-red-400 flex-shrink-0" />
                    }
                    <span className="truncate text-slate-300">{q.question.slice(0, 50)}...</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => { setPhase('select'); setActiveTab('select'); }}
              className="flex-1 py-3 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 transition-all text-sm">
              Back to Tests
            </button>
            <button onClick={() => startTest(selectedCategory)}
              className="btn-gradient flex-1 py-3 rounded-xl text-sm">
              Retry Test
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'test' && question) {
    const progress_pct = ((currentQ + 1) / questions.length) * 100;
    const urgentTime = timeLeft < 60;

    return (
      <div className="flex-1 overflow-y-auto">
        <TopBar title={`${selectedCategory.label} Test`} subtitle={`Question ${currentQ + 1} of ${questions.length}`} />
        <div className="p-6 max-w-3xl mx-auto space-y-4">
          {/* Timer + Progress */}
          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="badge badge-indigo">Q {currentQ + 1}/{questions.length}</span>
                <span className={`badge ${question.difficulty === 'Easy' ? 'badge-emerald' : question.difficulty === 'Medium' ? 'badge-amber' : 'badge-red'}`}>
                  {question.difficulty}
                </span>
                <span className="text-xs text-slate-500">{question.subcategory}</span>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${urgentTime ? 'bg-red-500/20 border border-red-500/40 animate-pulse' : 'bg-white/5 border border-white/10'}`}>
                <Clock size={14} className={urgentTime ? 'text-red-400' : 'text-slate-400'} />
                <span className={`font-mono font-bold text-sm ${urgentTime ? 'text-red-400' : 'text-white'}`}>{formatTime(timeLeft)}</span>
              </div>

            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                animate={{ width: `${progress_pct}%` }} />
            </div>
          </div>

          {/* Question */}
          <div className="glass-card p-6">
            <p className="text-white font-medium text-lg leading-relaxed mb-6">{question.question}</p>
            <div className="space-y-3">
              {question.options.map((option, idx) => {
                const isCorrect = idx === question.correct;
                const isSelected = idx === selected;
                return (
                  <motion.button
                    key={idx}
                    onClick={() => handleSelect(idx)}
                    whileHover={selected === null ? { x: 4 } : {}}
                    disabled={selected !== null}
                    className={`w-full text-left p-4 rounded-xl border transition-all text-sm ${
                      selected === null
                        ? 'bg-white/3 border-white/8 hover:bg-white/7 hover:border-white/15 text-slate-200'
                        : isCorrect
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                        : isSelected
                        ? 'bg-red-500/15 border-red-500/40 text-red-300'
                        : 'bg-white/2 border-white/5 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        selected === null ? 'bg-white/8 text-slate-400' :
                        isCorrect ? 'bg-emerald-500 text-white' :
                        isSelected ? 'bg-red-500 text-white' : 'bg-white/5 text-slate-600'
                      }`}>{String.fromCharCode(65 + idx)}</span>
                      {option}
                      {selected !== null && isCorrect && <CheckCircle size={16} className="text-emerald-400 ml-auto" />}
                      {selected !== null && isSelected && !isCorrect && <XCircle size={16} className="text-red-400 ml-auto" />}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            <AnimatePresence>
              {showExplanation && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="mt-4 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain size={14} className="text-blue-400" />
                    <span className="text-xs font-semibold text-blue-400">AI Explanation</span>
                  </div>
                  <p className="text-sm text-slate-300">{question.explanation}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {selected !== null && (
            <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              onClick={nextQuestion} className="btn-gradient w-full py-3 flex items-center justify-center gap-2">
              {currentQ + 1 >= questions.length ? 'View Results' : 'Next Question'}
              <ChevronRight size={16} />
            </motion.button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <TopBar title="Aptitude" subtitle="AI-powered adaptive testing" />
      <div className="p-6 space-y-5">
        <div className="flex gap-2 mb-2">
          {(['select', 'leaderboard', 'history'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${activeTab === tab ? 'tab-active' : 'tab-inactive'}`}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === 'select' && (
          <div className="space-y-4">
            <div className="glass-card p-4 border-indigo-500/20 bg-indigo-500/5">
              <div className="flex items-center gap-3">
                <Brain size={20} className="text-indigo-400" />
                <div>
                  <div className="font-semibold text-white">AI Adaptive Testing</div>
                  <div className="text-sm text-slate-400">Difficulty adjusts based on your performance. Below 50% → easier. Above 80% → harder.</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {CATEGORIES.map((cat, i) => (
                <motion.div key={cat.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                  onClick={() => startTest(cat)}
                  className="glass-card glass-card-hover p-5 cursor-pointer">
                  <div className="text-3xl mb-3">{cat.icon}</div>
                  <h3 className="font-semibold text-white mb-1">{cat.label}</h3>
                  <p className="text-xs text-slate-500 mb-4">{cat.desc}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><Target size={11} /> {cat.questions} questions</span>
                    <span className="flex items-center gap-1"><Clock size={11} /> {cat.time} min</span>
                  </div>
                  <button className="mt-4 w-full py-2 rounded-lg btn-gradient text-sm">Start Test</button>
                </motion.div>
              ))}
            </div>

            {/* Daily Challenge */}
            <div className="glass-card p-5 border-amber-500/20 bg-amber-500/5">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚡</span>
                <div className="flex-1">
                  <div className="font-semibold text-white">Daily Challenge</div>
                  <div className="text-sm text-slate-400">1 hard problem — 3 min — 200 XP reward</div>
                </div>
                <button onClick={() => startTest(CATEGORIES[0])} className="btn-gradient text-sm px-4 py-2">
                  Start
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-5">
              <Trophy size={16} className="text-amber-400" />
              <h3 className="font-semibold text-white">Weekly Aptitude Leaderboard</h3>
            </div>
            <div className="space-y-2">
              {LEADERBOARD.map((entry, i) => (
                <motion.div key={entry.rank} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                  className={`flex items-center gap-4 p-3.5 rounded-xl border transition-all ${
                    (entry as any).isUser ? 'bg-indigo-500/10 border-indigo-500/25' : 'bg-white/2 border-white/5'
                  }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                    entry.rank === 1 ? 'bg-amber-500/20 text-amber-400' :
                    entry.rank === 2 ? 'bg-slate-400/20 text-slate-300' :
                    entry.rank === 3 ? 'bg-orange-600/20 text-orange-400' :
                    'bg-white/5 text-slate-500'
                  }`}>#{entry.rank}</div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {entry.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">{entry.name}</span>
                      {(entry as any).isUser && <span className="badge badge-indigo text-xs">You</span>}
                    </div>
                    <div className="text-xs text-slate-500">{entry.college}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-white">{entry.score}%</div>
                    <div className="text-xs text-orange-400">{entry.badge}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="glass-card p-5">
            <h3 className="font-semibold text-white mb-4">Test History</h3>
            <div className="space-y-3">
              {[
                { test: 'Full Test', score: 76, date: '2 days ago', time: '12:34', accuracy: 76 },
                { test: 'Quantitative', score: 68, date: '4 days ago', time: '7:21', accuracy: 68 },
                { test: 'CS Fundamentals', score: 88, date: '1 week ago', time: '6:45', accuracy: 88 },
                { test: 'Logical Reasoning', score: 64, date: '1 week ago', time: '8:12', accuracy: 64 },
              ].map((h, i) => (
                <div key={i} className="flex items-center gap-4 p-3.5 rounded-xl bg-white/3 border border-white/5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                    h.score >= 80 ? 'bg-emerald-500/20 text-emerald-400' :
                    h.score >= 60 ? 'bg-amber-500/20 text-amber-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>{h.score}%</div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white">{h.test}</div>
                    <div className="text-xs text-slate-500">Completed in {h.time} • {h.date}</div>
                  </div>
                  <div className="text-right">
                    <div className="h-2 w-24 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${h.accuracy}%`, background: h.score >= 80 ? '#10b981' : h.score >= 60 ? '#f59e0b' : '#ef4444' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
