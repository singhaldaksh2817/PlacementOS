import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TopBar from '../components/layout/TopBar';
import {
  Trophy, Building2, CheckCircle, Code2, Search, Filter,
  Sparkles, ExternalLink, Zap, Star, Award, ChevronRight
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

interface PYQProblem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic: string;
  company: string;
  yearAsked: string;
  solved: boolean;
  leetcodeUrl: string;
}

const INITIAL_PYQ_PROBLEMS: PYQProblem[] = [
  // Google Sheet
  { id: 'g1', title: 'Two Sum', difficulty: 'Easy', topic: 'Arrays', company: 'Google', yearAsked: '2024', solved: false, leetcodeUrl: 'https://leetcode.com/problems/two-sum/' },
  { id: 'g2', title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', topic: 'Strings', company: 'Google', yearAsked: '2024', solved: false, leetcodeUrl: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/' },
  { id: 'g3', title: 'Median of Two Sorted Arrays', difficulty: 'Hard', topic: 'Binary Search', company: 'Google', yearAsked: '2024', solved: false, leetcodeUrl: 'https://leetcode.com/problems/median-of-two-sorted-arrays/' },
  { id: 'g4', title: 'Trapping Rain Water', difficulty: 'Hard', topic: 'Dynamic Programming', company: 'Google', yearAsked: '2023', solved: false, leetcodeUrl: 'https://leetcode.com/problems/trapping-rain-water/' },
  { id: 'g5', title: 'Word Ladder Length', difficulty: 'Hard', topic: 'Graphs', company: 'Google', yearAsked: '2025', solved: false, leetcodeUrl: 'https://leetcode.com/problems/word-ladder/' },

  // Amazon Sheet
  { id: 'a1', title: 'LRU Cache Design', difficulty: 'Medium', topic: 'Hash Table & Doubly Linked List', company: 'Amazon', yearAsked: '2025', solved: false, leetcodeUrl: 'https://leetcode.com/problems/lru-cache/' },
  { id: 'a2', title: 'Number of Islands', difficulty: 'Medium', topic: 'Graphs (BFS/DFS)', company: 'Amazon', yearAsked: '2024', solved: false, leetcodeUrl: 'https://leetcode.com/problems/number-of-islands/' },
  { id: 'a3', title: 'Kth Largest Element in an Array', difficulty: 'Medium', topic: 'Heap / Priority Queue', company: 'Amazon', yearAsked: '2024', solved: false, leetcodeUrl: 'https://leetcode.com/problems/kth-largest-element-in-an-array/' },
  { id: 'a4', title: 'Serialize and Deserialize Binary Tree', difficulty: 'Hard', topic: 'Trees', company: 'Amazon', yearAsked: '2023', solved: false, leetcodeUrl: 'https://leetcode.com/problems/serialize-and-deserialize-binary-tree/' },

  // Microsoft Sheet
  { id: 'm1', title: 'Spiral Matrix', difficulty: 'Medium', topic: 'Matrix', company: 'Microsoft', yearAsked: '2024', solved: false, leetcodeUrl: 'https://leetcode.com/problems/spiral-matrix/' },
  { id: 'm2', title: 'Reverse Nodes in k-Group', difficulty: 'Hard', topic: 'Linked List', company: 'Microsoft', yearAsked: '2024', solved: false, leetcodeUrl: 'https://leetcode.com/problems/reverse-nodes-in-k-group/' },
  { id: 'm3', title: 'Binary Tree Zigzag Level Order Traversal', difficulty: 'Medium', topic: 'Trees', company: 'Microsoft', yearAsked: '2025', solved: false, leetcodeUrl: 'https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal/' },

  // Flipkart & Atlassian Sheet
  { id: 'f1', title: 'Course Schedule II', difficulty: 'Medium', topic: 'Topological Sort', company: 'Flipkart', yearAsked: '2024', solved: false, leetcodeUrl: 'https://leetcode.com/problems/course-schedule-ii/' },
  { id: 'f2', title: 'Sliding Window Maximum', difficulty: 'Hard', topic: 'Sliding Window', company: 'Flipkart', yearAsked: '2025', solved: false, leetcodeUrl: 'https://leetcode.com/problems/sliding-window-maximum/' },
];

const COMPANY_SHEETS = [
  { name: 'All Companies', count: INITIAL_PYQ_PROBLEMS.length, color: 'text-indigo-400' },
  { name: 'Google', count: 5, color: 'text-red-400' },
  { name: 'Amazon', count: 4, color: 'text-amber-400' },
  { name: 'Microsoft', count: 3, color: 'text-blue-400' },
  { name: 'Flipkart', count: 2, color: 'text-purple-400' },
];

export default function CompanyPYQPage() {
  const { addXP, removeXP } = useStore();
  const navigate = useNavigate();
  
  const [selectedCompany, setSelectedCompany] = useState<string>('All Companies');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [problems, setProblems] = useState<PYQProblem[]>(() => {
    const raw = localStorage.getItem('placementos-pyq-sheets');
    if (raw) {
      try { return JSON.parse(raw); } catch (e) {}
    }
    return INITIAL_PYQ_PROBLEMS;
  });

  useEffect(() => {
    localStorage.setItem('placementos-pyq-sheets', JSON.stringify(problems));
  }, [problems]);

  const toggleSolved = (id: string) => {
    setProblems(prev => prev.map(p => {
      if (p.id !== id) return p;
      const nextSolved = !p.solved;
      if (nextSolved) {
        addXP(50);
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
        toast.success(`🎉 ${p.title} marked Solved! +50 XP earned!`);
      } else {
        removeXP(50);
        toast.error(`Unmarked ${p.title}. -50 XP`);
      }
      return { ...p, solved: nextSolved };
    }));
  };

  const filteredProblems = problems.filter(p => {
    const matchesCompany = selectedCompany === 'All Companies' || p.company === selectedCompany;
    const matchesDiff = difficultyFilter === 'All' || p.difficulty === difficultyFilter;
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.topic.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCompany && matchesDiff && matchesSearch;
  });

  const totalSolved = problems.filter(p => p.solved).length;
  const overallPercentage = Math.round((totalSolved / problems.length) * 100);

  const getCompanyStats = (compName: string) => {
    const compProblems = compName === 'All Companies' ? problems : problems.filter(p => p.company === compName);
    const compSolved = compProblems.filter(p => p.solved).length;
    const pct = compProblems.length ? Math.round((compSolved / compProblems.length) * 100) : 0;
    return { solved: compSolved, total: compProblems.length, pct };
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <TopBar title="Company Campus PYQ Sheet Tracker 🏆" subtitle="Curated Past Year Question Sheets for Top Tech Companies" />

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Banner */}
        <div className="glass-card p-6 relative overflow-hidden bg-gradient-to-r from-amber-950/40 via-purple-900/30 to-slate-900/60 border border-amber-500/30">
          <div className="flex items-center justify-between flex-wrap gap-4 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="badge badge-amber flex items-center gap-1"><Trophy size={12} /> TOP COMPANY SHEETS</span>
                <span className="badge badge-emerald">{totalSolved}/{problems.length} Solved ({overallPercentage}%)</span>
              </div>
              <h1 className="text-2xl font-bold font-heading text-white">Campus PYQ Practice Sheets</h1>
              <p className="text-xs text-slate-300 max-w-xl mt-1">
                Solve company-specific past year questions asked in Google, Amazon, Microsoft, and Flipkart technical interviews.
              </p>
            </div>

            <div className="text-right">
              <div className="text-3xl font-bold text-amber-400 font-heading">{overallPercentage}%</div>
              <div className="text-xs text-slate-400">Overall Sheet Progress</div>
            </div>
          </div>
        </div>

        {/* Company Sheet Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {COMPANY_SHEETS.map(comp => {
            const stats = getCompanyStats(comp.name);
            const isSelected = selectedCompany === comp.name;
            return (
              <motion.div
                key={comp.name}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedCompany(comp.name)}
                className={`glass-card p-4 cursor-pointer transition-all border ${
                  isSelected ? 'border-amber-500/50 bg-amber-500/10' : 'border-white/8 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-bold ${comp.color}`}>{comp.name}</span>
                  <span className="text-[10px] text-slate-400">{stats.solved}/{stats.total}</span>
                </div>
                <div className="text-xl font-bold text-white font-heading">{stats.pct}%</div>
                <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 transition-all duration-500" style={{ width: `${stats.pct}%` }} />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Filters & Search */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex gap-2">
            {(['All', 'Easy', 'Medium', 'Hard'] as const).map(diff => (
              <button
                key={diff}
                onClick={() => setDifficultyFilter(diff)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  difficultyFilter === diff ? 'tab-active' : 'tab-inactive'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>

          <div className="relative flex-1 min-w-[240px]">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search PYQ by problem name or topic..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="input-dark input-icon-left text-xs"
            />
          </div>
        </div>

        {/* PYQ Problems List */}
        <div className="glass-card overflow-hidden border border-white/8">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-white/4 text-slate-400 uppercase tracking-wider font-semibold border-b border-white/8">
              <tr>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Problem Title</th>
                <th className="p-3.5">Company</th>
                <th className="p-3.5">Topic</th>
                <th className="p-3.5">Difficulty</th>
                <th className="p-3.5 text-right">Practice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredProblems.map(p => (
                <tr key={p.id} className="hover:bg-white/2 transition-colors">
                  <td className="p-3.5">
                    <button
                      onClick={() => toggleSolved(p.id)}
                      className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                        p.solved ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-600 hover:border-slate-400'
                      }`}
                    >
                      {p.solved && <CheckCircle size={14} />}
                    </button>
                  </td>
                  <td className="p-3.5 font-bold text-white">
                    <div className="flex items-center gap-2">
                      <span className={p.solved ? 'line-through text-slate-400' : ''}>{p.title}</span>
                      <span className="badge badge-indigo text-[10px]">Asked {p.yearAsked}</span>
                    </div>
                  </td>
                  <td className="p-3.5">
                    <span className="badge badge-amber text-[10px]">{p.company}</span>
                  </td>
                  <td className="p-3.5 text-slate-400">{p.topic}</td>
                  <td className="p-3.5">
                    <span className={`badge ${
                      p.difficulty === 'Hard' ? 'badge-red' : p.difficulty === 'Medium' ? 'badge-amber' : 'badge-emerald'
                    }`}>
                      {p.difficulty}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <a
                      href={p.leetcodeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold text-slate-200 hover:bg-white/10 inline-flex items-center gap-1"
                    >
                      Practice <ExternalLink size={12} />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
