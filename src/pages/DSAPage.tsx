import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import TopBar from '../components/layout/TopBar';
import {
  Code2, CheckCircle, Clock, Star, Zap, TrendingUp,
  Filter, Search, ChevronRight, Target, AlertTriangle, Brain
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { DSA_PROBLEMS } from '../data/mockData';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';
import Editor from '@monaco-editor/react';
import toast from 'react-hot-toast';


const TOPICS = ['Arrays', 'Strings', 'Linked List', 'Trees', 'Graphs', 'Dynamic Programming', 'HashMap', 'Stacks', 'Queues', 'Binary Search', 'Two Pointer', 'Sliding Window', 'Heap', 'Trie', 'Backtracking', 'Greedy', 'System Design', 'BFS', 'DFS'];

const difficultyColor: Record<string, string> = {
  Easy: 'badge-emerald',
  Medium: 'badge-amber',
  Hard: 'badge-red',
};

const AI_HINTS: Record<string, string[]> = {
  default: [
    "💡 Think about what data structure gives you O(1) lookup time...",
    "💡 Have you considered a two-pointer approach here?",
    "💡 Try breaking the problem into smaller subproblems — does dynamic programming apply?",
    "💡 Consider the edge cases: empty array, single element, all duplicates...",
    "💡 What if you sorted the array first? Would that simplify the problem?",
  ]
};

const STARTER_CODE: Record<string, string> = {
  python: `def twoSum(nums: list[int], target: int) -> list[int]:
    """
    Given an array of integers nums and an integer target,
    return indices of the two numbers such that they add up to target.
    
    Example 1:  Input: nums = [2,7,11,15], target = 9  →  Output: [0,1]
    Example 2:  Input: nums = [3,2,4],     target = 6  →  Output: [1,2]
    
    Constraints: 2 <= nums.length <= 10^4, -10^9 <= nums[i] <= 10^9
    
    Time Complexity: O(?)
    Space Complexity: O(?)
    """
    # Write your solution here
    pass


# --- Test cases (do not modify) ---
print(twoSum([2, 7, 11, 15], 9))   # Expected: [0, 1]
print(twoSum([3, 2, 4], 6))        # Expected: [1, 2]
print(twoSum([3, 3], 6))           # Expected: [0, 1]`,

  javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 * 
 * Example 1: twoSum([2,7,11,15], 9)  →  [0, 1]
 * Example 2: twoSum([3,2,4], 6)      →  [1, 2]
 */
function twoSum(nums, target) {
    // Write your solution here
    
}

// --- Test cases (do not modify) ---
console.log(twoSum([2, 7, 11, 15], 9));  // [0, 1]
console.log(twoSum([3, 2, 4], 6));        // [1, 2]
console.log(twoSum([3, 3], 6));           // [0, 1]`,

  cpp: `#include <vector>
#include <iostream>
using namespace std;

class Solution {
public:
    /**
     * Example 1: twoSum([2,7,11,15], 9) → [0,1]
     * Example 2: twoSum([3,2,4], 6)     → [1,2]
     */
    vector<int> twoSum(vector<int>& nums, int target) {
        // Write your solution here
        
    }
};

// --- Test cases (do not modify) ---
int main() {
    Solution sol;
    vector<int> n1 = {2, 7, 11, 15};
    auto r1 = sol.twoSum(n1, 9);
    cout << r1[0] << " " << r1[1] << endl; // 0 1

    vector<int> n2 = {3, 2, 4};
    auto r2 = sol.twoSum(n2, 6);
    cout << r2[0] << " " << r2[1] << endl; // 1 2
    return 0;
}`,

  java: `import java.util.Arrays;

class Solution {
    /**
     * Example 1: twoSum([2,7,11,15], 9) → [0,1]
     * Example 2: twoSum([3,2,4], 6)     → [1,2]
     */
    public int[] twoSum(int[] nums, int target) {
        // Write your solution here
        return new int[]{};
    }

    // --- Test cases (do not modify) ---
    public static void main(String[] args) {
        Solution sol = new Solution();
        System.out.println(Arrays.toString(sol.twoSum(new int[]{2,7,11,15}, 9))); // [0, 1]
        System.out.println(Arrays.toString(sol.twoSum(new int[]{3,2,4}, 6)));     // [1, 2]
    }
}`,
};



export default function DSAPage() {
  const { dsaStats, addXP, submitDSASolution } = useStore();
  const [activeTab, setActiveTab] = useState<'problems' | 'ide' | 'analytics'>('problems');
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [language, setLanguage] = useState<'python' | 'javascript' | 'cpp' | 'java'>('python');
  const [code, setCode] = useState(STARTER_CODE.python);
  const [output, setOutput] = useState('');
  const [running, setRunning] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [currentHint, setCurrentHint] = useState('');
  const [hintLevel, setHintLevel] = useState(1);
  const [hintLoading, setHintLoading] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState(DSA_PROBLEMS[0]);
  const location = useLocation();

  useEffect(() => {
    if (location.state?.openIde) {
      setActiveTab('ide');
    }
    if (location.state?.problemId) {
      const match = DSA_PROBLEMS.find(p => p.id === location.state.problemId);
      if (match) setSelectedProblem(match);
    } else if (location.state?.problemTitle) {
      const searchTitle = location.state.problemTitle.toLowerCase();
      const match = DSA_PROBLEMS.find(p =>
        p.title.toLowerCase() === searchTitle ||
        p.title.toLowerCase().includes(searchTitle) ||
        searchTitle.includes(p.title.toLowerCase())
      );
      if (match) setSelectedProblem(match);
    }
  }, [location.state]);

  // Update code editor skeleton when selectedProblem or language changes
  useEffect(() => {
    if (!selectedProblem) return;
    const pTitle = selectedProblem.title;
    const pDiff = selectedProblem.difficulty;
    const pTopic = selectedProblem.topic;
    const pComp = selectedProblem.companies ? selectedProblem.companies.join(', ') : 'Top Tech';

    const py = `# ${pTitle} (${pDiff})\n# Topic: ${pTopic} | Target: ${pComp}\n\ndef solution():\n    # Write your solution here\n    pass\n`;
    const js = `// ${pTitle} (${pDiff})\n// Topic: ${pTopic} | Target: ${pComp}\n\nfunction solution() {\n  // Write your solution here\n}\n`;
    const cpp = `// ${pTitle} (${pDiff})\n// Topic: ${pTopic} | Target: ${pComp}\n#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your solution here\n    return 0;\n}\n`;
    const java = `// ${pTitle} (${pDiff})\n// Topic: ${pTopic} | Target: ${pComp}\n\npublic class Solution {\n    public static void main(String[] args) {\n        // Write your solution here\n    }\n}\n`;

    if (language === 'python') setCode(py);
    else if (language === 'javascript') setCode(js);
    else if (language === 'cpp') setCode(cpp);
    else if (language === 'java') setCode(java);
  }, [selectedProblem?.id, language]);


  const [customStdin, setCustomStdin] = useState('');
  const [consoleTab, setConsoleTab] = useState<'output' | 'stdin'>('output');



  const filteredProblems = DSA_PROBLEMS.filter(p => {
    const matchTopic = selectedTopic === 'All' || p.topic === selectedTopic;
    const matchDiff = difficultyFilter === 'All' || p.difficulty === difficultyFilter;
    const matchSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.topic.toLowerCase().includes(searchQuery.toLowerCase());
    return matchTopic && matchDiff && matchSearch;
  });

  const radarData = Object.entries(dsaStats.topicWise)
    .filter((_, i) => i < 8)
    .map(([topic, data]) => ({ subject: topic.split(' ')[0], score: data.strength, fullMark: 100 }));

  const runCode = async (): Promise<string> => {
    if (!code.trim()) return '';
    setRunning(true);
    setOutput('');

    // Map Monaco language to Piston language + version
    const langMap: Record<string, { language: string; version: string }> = {
      javascript: { language: 'javascript', version: '18.15.0' },
      python: { language: 'python', version: '3.10.0' },
      cpp: { language: 'c++', version: '10.2.0' },
      java: { language: 'java', version: '15.0.2' },
      typescript: { language: 'typescript', version: '5.0.3' },
    };
    const lang = langMap[language] || langMap.javascript;

    try {
      const res = await fetch('https://emkc.org/api/v2/piston/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: lang.language,
          version: lang.version,
          files: [{ content: code }],
          stdin: customStdin,
          args: [],
        }),
      });

      const data = await res.json();
      const stdout = data?.run?.stdout || '';
      const stderr = data?.run?.stderr || '';
      const out = stdout || stderr || 'No output';
      setOutput(out);
      if (stderr && !stdout) {
        toast.error('Runtime Error — check console output');
      } else {
        toast.success('Code executed successfully! ✅');
      }
      return out;
    } catch (err: any) {
      const errorMsg = '❌ Execution failed: ' + err.message;
      setOutput(errorMsg);
      toast.error('Execution failed — check network connection');
      return errorMsg;
    } finally {
      setRunning(false);
    }
  };

  const submitCode = async () => {
    const result = await runCode();
    if (!result || result.includes('Error') || result.includes('error') || result.includes('Traceback')) {
      toast.error('Fix errors before submitting');
      return;
    }
    // After run, award XP if no error in output
    if (!result.includes('Error') && !result.includes('error')) {
      await submitDSASolution(selectedProblem.id, selectedProblem.difficulty as 'Easy' | 'Medium' | 'Hard');
      addXP(100);
      toast.success(`Solution submitted! +100 XP 🎉`);
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    }
  };

  const getHint = async () => {
    if (!selectedProblem) return;
    setShowHint(true);
    setHintLoading(true);
    try {
      const token = localStorage.getItem('placementos-token') || 'demo-token';
      const res = await fetch('http://localhost:5000/api/ai/dsa/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          problemTitle: selectedProblem.title,
          problemTopic: selectedProblem.topic,
          difficulty: selectedProblem.difficulty,
          hintLevel: hintLevel,
        }),
      });
      const data = await res.json();
      setCurrentHint(data.hint || 'Think about the constraints carefully...');
      setHintLevel(h => h + 1);
      toast.success('AI Hint loaded! 💡');
    } catch (err) {
      setCurrentHint('💡 Think about what data structure gives O(1) lookup...');
    } finally {
      setHintLoading(false);
    }
  };

  const topicStrengthData = Object.entries(dsaStats.topicWise)
    .sort((a, b) => a[1].strength - b[1].strength)
    .slice(0, 8);

  return (
    <div className="flex-1 overflow-y-auto">
      <TopBar title="DSA Tracker" subtitle="AI-powered coding preparation" />
      <div className="p-6 space-y-5">

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Solved', value: dsaStats.totalSolved, icon: CheckCircle, color: '#10b981' },
            { label: 'Contest Rating', value: dsaStats.contestRating, icon: Star, color: '#f59e0b' },
            { label: 'Day Streak', value: `${dsaStats.streak}🔥`, icon: TrendingUp, color: '#f97316' },
            { label: 'Acceptance Rate', value: `${dsaStats.acceptanceRate}%`, icon: Target, color: '#6366f1' },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="glass-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <stat.icon size={14} style={{ color: stat.color }} />
                <span className="text-xs text-slate-400">{stat.label}</span>
              </div>
              <div className="text-2xl font-heading font-bold text-white">{stat.value}</div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {(['problems', 'ide', 'analytics'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
                activeTab === tab ? 'tab-active' : 'tab-inactive'
              }`}>
              {tab === 'ide' ? 'Code IDE' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* Problems Tab */}
          {activeTab === 'problems' && (
            <motion.div key="problems" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {/* Filters — single row, no wrapping */}
              <div className="flex items-center gap-2 mb-4">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search problems..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="input-dark input-icon-left text-sm w-full"
                  />
                </div>

                <select
                  value={difficultyFilter}
                  onChange={e => setDifficultyFilter(e.target.value)}
                  className="input-dark text-sm py-2 px-3 flex-shrink-0"
                  style={{ width: '130px' }}
                >
                  {['All', 'Easy', 'Medium', 'Hard'].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select
                  value={selectedTopic}
                  onChange={e => setSelectedTopic(e.target.value)}
                  className="input-dark text-sm py-2 px-3 flex-shrink-0"
                  style={{ width: '170px' }}
                >
                  {['All', ...TOPICS].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              {/* Weak Topics Alert */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-4">
                <AlertTriangle size={16} className="text-amber-400 flex-shrink-0" />
                <span className="text-sm text-amber-300">
                  AI Agent detected weak topics: <strong>{dsaStats.weakTopics.slice(0,3).join(', ')}</strong>
                  &nbsp;— Problems below are recommended for you.
                </span>
              </div>

              {/* Problem List */}
              <div className="space-y-2">
                {filteredProblems.map((problem, i) => (
                  <motion.div key={problem.id}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                    onClick={() => { setSelectedProblem(problem); setActiveTab('ide'); }}
                    className="glass-card glass-card-hover p-4 cursor-pointer flex items-center gap-4"
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                      problem.solved ? 'bg-emerald-500' : 'border-2 border-slate-600'
                    }`}>
                      {problem.solved && <CheckCircle size={12} className="text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-white">{problem.title}</span>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className={`badge text-xs ${difficultyColor[problem.difficulty]}`}>{problem.difficulty}</span>
                        <span className="text-xs text-slate-500">{problem.topic}</span>
                        {problem.companies.slice(0,3).map(c => (
                          <span key={c} className="text-xs text-slate-600 bg-white/3 px-2 py-0.5 rounded">{c}</span>
                        ))}
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-slate-600 flex-shrink-0" />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* IDE Tab */}
          {activeTab === 'ide' && (
            <motion.div key="ide" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="space-y-4">
              <div className="glass-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className={`badge text-xs ${difficultyColor[selectedProblem.difficulty]} mr-2`}>{selectedProblem.difficulty}</span>
                    <span className="font-heading font-bold text-white">{selectedProblem.title}</span>
                  </div>
                  <div className="flex gap-2">
                    {(['python', 'javascript', 'cpp', 'java'] as const).map(lang => (
                      <button key={lang} onClick={() => setLanguage(lang)}
                        className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${language === lang ? 'tab-active' : 'tab-inactive'}`}>
                        {lang === 'cpp' ? 'C++' : lang.charAt(0).toUpperCase() + lang.slice(1)}
                      </button>
                    ))}

                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="glass-card overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                    <span className="text-xs font-medium text-slate-400">Code Editor</span>
                    <div className="flex gap-2">
                      <button onClick={getHint}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition-all">
                        <Brain size={12} /> AI Hint
                      </button>
                      <button onClick={runCode} disabled={running}
                        className="flex items-center gap-1.5 text-xs px-4 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition-all disabled:opacity-50">
                        {running ? <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" /> : '▶ Run'}
                      </button>
                      <button onClick={submitCode} disabled={running}
                        className="flex items-center gap-1.5 text-xs px-4 py-1.5 rounded-lg btn-gradient disabled:opacity-50">
                        {running ? <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" /> : '🚀 Submit'}
                      </button>
                    </div>
                  </div>
                  <div className="h-72">
                    <Editor
                      height="100%"
                      language={language === 'cpp' ? 'cpp' : language}
                      value={code}
                      onChange={(v) => setCode(v || '')}
                      theme="vs-dark"
                      options={{
                        minimap: { enabled: false },
                        fontSize: 13,
                        fontFamily: 'JetBrains Mono, monospace',
                        lineNumbers: 'on',
                        scrollBeyondLastLine: false,
                        padding: { top: 12 },
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="glass-card overflow-hidden">
                    <div className="px-4 py-2 border-b border-white/5 flex items-center justify-between">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setConsoleTab('output')}
                          className={`text-xs px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
                            consoleTab === 'output' ? 'tab-active' : 'tab-inactive'
                          }`}
                        >
                          Output Console
                        </button>
                        <button
                          onClick={() => setConsoleTab('stdin')}
                          className={`text-xs px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
                            consoleTab === 'stdin' ? 'tab-active' : 'tab-inactive'
                          }`}
                        >
                          Custom Testcases (stdin)
                        </button>

                      </div>

                      <div className="flex items-center gap-2">
                        {output && !output.includes('❌') && !output.includes('Error') && (
                          <span className="text-xs text-emerald-400 flex items-center gap-1">
                            <CheckCircle size={12} /> Executed
                          </span>
                        )}
                        {output && (output.includes('❌') || output.includes('Error')) && (
                          <span className="text-xs text-red-400">Error</span>
                        )}
                      </div>
                    </div>

                    {consoleTab === 'output' ? (
                      <pre className="p-4 text-xs font-mono leading-relaxed h-48 overflow-y-auto whitespace-pre-wrap break-words">
                        {running ? (
                          <div className="flex items-center gap-2 text-indigo-400">
                            <div className="w-3 h-3 border border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
                            Running code on Piston engine...
                          </div>
                        ) : output ? (
                          <span className={output.includes('❌') || output.includes('Error') || output.includes('Traceback')
                            ? 'text-red-400' : 'text-emerald-300'
                          }>{output}</span>
                        ) : (
                          <span className="text-slate-400 font-medium">
                            {'// Click ▶ Run to execute your code\n// Output will appear here'}
                          </span>
                        )}
                      </pre>
                    ) : (
                      <div className="p-3 h-48 flex flex-col justify-between">
                        <textarea
                          value={customStdin}
                          onChange={e => setCustomStdin(e.target.value)}
                          placeholder="Enter custom stdin inputs (e.g. [2, 7, 11, 15] 9)..."
                          className="input-dark flex-1 text-xs font-mono resize-none"
                        />
                        <div className="text-xs text-indigo-300 font-medium mt-2">
                          💡 Inputs entered here will be passed to stdin when you click ▶ Run
                        </div>
                      </div>
                    )}

                  </div>


                  {/* AI Hint */}
                  <AnimatePresence>
                    {showHint && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="glass-card p-4 border-amber-500/20 bg-amber-500/5">
                        <div className="flex items-center gap-2 mb-2">
                          <Brain size={14} className="text-amber-400" />
                          <span className="text-xs font-semibold text-amber-400">AI Hint (Never giving the answer!)</span>
                        </div>
                        <p className="text-sm text-slate-300">{hintLoading ? 'Loading hint...' : currentHint}</p>
                        <button onClick={getHint} className="text-xs text-amber-400 mt-2 hover:text-amber-300">Next hint →</button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Companies that asked */}
                  <div className="glass-card p-4">
                    <div className="text-xs font-semibold text-slate-400 mb-2">Companies that asked this:</div>
                    <div className="flex flex-wrap gap-2">
                      {selectedProblem.companies.map(c => (
                        <span key={c} className="badge badge-indigo text-xs">{c}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <motion.div key="analytics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="space-y-5">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Topic Radar */}
                <div className="glass-card p-5">
                  <h3 className="font-semibold text-white mb-4">Topic Strength Radar</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="rgba(255,255,255,0.08)" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
                      <Radar dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={2} />
                      <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                {/* Topic Breakdown */}
                <div className="glass-card p-5">
                  <h3 className="font-semibold text-white mb-4">Weak → Strong Topics</h3>
                  <div className="space-y-3 overflow-y-auto max-h-72">
                    {topicStrengthData.map(([topic, data]) => (
                      <div key={topic}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-300">{topic}</span>
                          <span className="text-slate-400">{data.solved}/{data.total}</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                          <motion.div className="h-full rounded-full"
                            style={{ background: data.strength >= 70 ? '#10b981' : data.strength >= 50 ? '#f59e0b' : '#ef4444' }}
                            initial={{ width: 0 }}
                            animate={{ width: `${data.strength}%` }}
                            transition={{ duration: 0.8 }} />
                        </div>
                        <div className="flex justify-between text-xs mt-0.5">
                          <span className={`font-medium ${data.strength >= 70 ? 'text-emerald-400' : data.strength >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                            {data.strength}%
                          </span>
                          <span className={`text-xs ${data.strength < 50 ? 'text-red-400' : 'text-slate-600'}`}>
                            {data.strength < 50 ? '⚠️ Weak' : data.strength >= 80 ? '✓ Strong' : ''}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* AI Recommendations */}
              <div className="glass-card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Brain size={16} className="text-purple-400" />
                  <h3 className="font-semibold text-white">AI DSA Agent Recommendations</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { period: "Today's Problems", problems: ['Coin Change (DP)', 'Network Delay Time (Graphs)', 'Kth Largest Element (Heap)'], color: '#6366f1' },
                    { period: "Tomorrow's Problems", problems: ['Longest Palindromic Substring (DP)', 'Course Schedule (Graphs)', 'Top K Frequent (Heap)'], color: '#8b5cf6' },
                    { period: 'Weekly Revision', problems: ['Merge K Sorted Lists', 'Word Search (Backtracking)', 'Segment Tree Range Query'], color: '#3b82f6' },
                  ].map(rec => (
                    <div key={rec.period} className="p-4 rounded-xl bg-white/3 border border-white/5">
                      <div className="text-xs font-semibold mb-3" style={{ color: rec.color }}>{rec.period}</div>
                      <ul className="space-y-2">
                        {rec.problems.map(p => (
                          <li key={p} className="flex items-center gap-2 text-xs text-slate-300">
                            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: rec.color }} />
                            {p}
                          </li>
                        ))}
                      </ul>
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
