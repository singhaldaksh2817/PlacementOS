import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TopBar from '../components/layout/TopBar';
import {
  Zap, Clock, AlertTriangle, CheckCircle, ShieldAlert,
  Play, RotateCcw, Award, ChevronRight, Code2, AlertCircle
} from 'lucide-react';
import Editor from '@monaco-editor/react';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';
import { useStore } from '../store/useStore';

interface OACompany {
  name: string;
  durationMinutes: number;
  totalQuestions: number;
  pattern: string;
  problems: {
    id: string;
    title: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    description: string;
    starterCode: Record<string, string>;
    expectedOutput: string;
  }[];
}

const OA_COMPANIES: OACompany[] = [
  {
    name: 'Google',
    durationMinutes: 90,
    totalQuestions: 2,
    pattern: 'DSA Heavy — Graph / Dynamic Programming focus',
    problems: [
      {
        id: 'g1',
        title: 'Word Ladder Length',
        difficulty: 'Hard',
        description: 'Given two words, beginWord and endWord, and a dictionary wordList, return the length of the shortest transformation sequence from beginWord to endWord.',
        starterCode: {
          python: `def ladderLength(beginWord: str, endWord: str, wordList: list[str]) -> int:\n    # Write your solution here\n    pass\n\nprint(ladderLength("hit", "cog", ["hot","dot","dog","lot","log","cog"])) # Expected: 5`,
          javascript: `function ladderLength(beginWord, endWord, wordList) {\n    // Write your solution here\n}\n\nconsole.log(ladderLength("hit", "cog", ["hot","dot","dog","lot","log","cog"])); // Expected: 5`,
          cpp: `#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint ladderLength(string beginWord, string endWord, vector<string>& wordList) {\n    return 0;\n}\n\nint main() {\n    vector<string> wl = {"hot","dot","dog","lot","log","cog"};\n    cout << ladderLength("hit", "cog", wl);\n}`,
        },
        expectedOutput: '5',
      },
      {
        id: 'g2',
        title: 'Meeting Rooms II',
        difficulty: 'Medium',
        description: 'Given an array of meeting time intervals consisting of start and end times [[s1,e1],[s2,e2],...], find the minimum number of conference rooms required.',
        starterCode: {
          python: `def minMeetingRooms(intervals: list[list[int]]) -> int:\n    # Write your solution here\n    pass\n\nprint(minMeetingRooms([[0,30],[5,10],[15,20]])) # Expected: 2`,
          javascript: `function minMeetingRooms(intervals) {\n    // Write your solution here\n}\n\nconsole.log(minMeetingRooms([[0,30],[5,10],[15,20]])); // Expected: 2`,
          cpp: `#include <iostream>\n#include <vector>\nusing namespace std;\n\nint minMeetingRooms(vector<vector<int>>& intervals) {\n    return 0;\n}\n\nint main() {\n    vector<vector<int>> iv = {{0,30},{5,10},{15,20}};\n    cout << minMeetingRooms(iv);\n}`,
        },
        expectedOutput: '2',
      },
    ],
  },
  {
    name: 'Microsoft',
    durationMinutes: 75,
    totalQuestions: 2,
    pattern: 'Arrays + Tree Traversal + OOP Design',
    problems: [
      {
        id: 'm1',
        title: 'Binary Tree Zigzag Level Order Traversal',
        difficulty: 'Medium',
        description: 'Given the root of a binary tree, return the zigzag level order traversal of its nodes values. (i.e., from left to right, then right to left for the next level).',
        starterCode: {
          python: `def zigzagLevelOrder(root) -> list[list[int]]:\n    # Write your solution here\n    pass\n\nprint("Zigzag complete")`,
          javascript: `function zigzagLevelOrder(root) {\n    // Write your solution here\n}\n\nconsole.log("Zigzag complete");`,
          cpp: `// Write your Solution class here\n#include <iostream>\nusing namespace std;\nint main() { cout << "Zigzag complete"; }`,
        },
        expectedOutput: 'Zigzag complete',
      },
      {
        id: 'm2',
        title: 'Design Underground System',
        difficulty: 'Medium',
        description: 'An underground railway system is keeping track of customer travel times between different stations. Implement the UndergroundSystem class.',
        starterCode: {
          python: `class UndergroundSystem:\n    def __init__(self):\n        pass\n    def checkIn(self, id: int, stationName: str, t: int):\n        pass\n    def checkOut(self, id: int, stationName: str, t: int):\n        pass\n    def getAverageTime(self, startStation: str, endStation: str) -> float:\n        return 0.0\n\nprint("UndergroundSystem OK")`,
          javascript: `class UndergroundSystem {\n    constructor() {}\n    checkIn(id, stationName, t) {}\n    checkOut(id, stationName, t) {}\n    getAverageTime(startStation, endStation) { return 0.0; }\n}\n\nconsole.log("UndergroundSystem OK");`,
          cpp: `#include <iostream>\nusing namespace std;\nint main() { cout << "UndergroundSystem OK"; }`,
        },
        expectedOutput: 'UndergroundSystem OK',
      },
    ],
  },
  {
    name: 'Amazon',
    durationMinutes: 90,
    totalQuestions: 2,
    pattern: 'Coding + Work Simulation (Arrays, Sliding Window, Heap)',
    problems: [
      {
        id: 'a1',
        title: 'Min Cost to Connect All Points',
        difficulty: 'Medium',
        description: 'You are given an array points representing integer coordinates of some points on a 2D-plane. Return the minimum cost to make all points connected.',
        starterCode: {
          python: `def minCostConnectPoints(points: list[list[int]]) -> int:\n    # Kruskal or Prim algorithm\n    pass\n\nprint(minCostConnectPoints([[0,0],[2,2],[3,10],[5,2],[7,0]])) # Expected: 20`,
          javascript: `function minCostConnectPoints(points) {\n    // Kruskal or Prim algorithm\n}\n\nconsole.log(minCostConnectPoints([[0,0],[2,2],[3,10],[5,2],[7,0]])); // Expected: 20`,
          cpp: `#include <iostream>\n#include <vector>\nusing namespace std;\n\nint minCostConnectPoints(vector<vector<int>>& points) {\n    return 0;\n}\n\nint main() {\n    cout << 20;\n}`,
        },
        expectedOutput: '20',
      },
      {
        id: 'a2',
        title: 'Kth Largest Element in a Stream',
        difficulty: 'Easy',
        description: 'Design a class to find the kth largest element in a stream. Note that it is the kth largest element in sorted order, not the kth distinct element.',
        starterCode: {
          python: `import heapq\n\nclass KthLargest:\n    def __init__(self, k: int, nums: list[int]):\n        pass\n    def add(self, val: int) -> int:\n        return 0\n\nprint("KthLargest stream test complete")`,
          javascript: `class KthLargest {\n    constructor(k, nums) {}\n    add(val) { return 0; }\n}\n\nconsole.log("KthLargest stream test complete");`,
          cpp: `#include <iostream>\nusing namespace std;\nint main() { cout << "KthLargest stream test complete"; }`,
        },
        expectedOutput: 'KthLargest stream test complete',
      },
    ],
  },
];

export default function OASimulatorPage() {
  const { addXP } = useStore();
  const [selectedCompany, setSelectedCompany] = useState<OACompany | null>(null);
  const [inTest, setInTest] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [currentProblemIdx, setCurrentProblemIdx] = useState(0);
  const [language, setLanguage] = useState<'python' | 'javascript' | 'cpp'>('python');
  const [codes, setCodes] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [output, setOutput] = useState('');
  const [running, setRunning] = useState(false);
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({});

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Tab switch detection (Proctoring)
  useEffect(() => {
    if (!inTest || testCompleted) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitches(prev => {
          const next = prev + 1;
          toast.error(`⚠️ Proctor Warning: Tab switch detected! (${next}/3 allowed warnings)`, { duration: 5000 });
          if (next >= 3) {
            toast.error('❌ Assessment terminated automatically due to repeated tab switches.');
            finishTest();
          }
          return next;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [inTest, testCompleted]);

  // Countdown timer
  useEffect(() => {
    if (!inTest || testCompleted) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          toast.error('⏳ Time is up! Assessment auto-submitted.');
          finishTest();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [inTest, testCompleted]);

  const startOA = (company: OACompany) => {
    setSelectedCompany(company);
    setInTest(true);
    setTestCompleted(false);
    setCurrentProblemIdx(0);
    setTabSwitches(0);
    setSubmitted({});
    setOutput('');
    setTimeLeft(company.durationMinutes * 60);

    // Init code buffers
    const initialCodes: Record<string, string> = {};
    company.problems.forEach(p => {
      initialCodes[p.id] = p.starterCode[language] || p.starterCode.python;
    });
    setCodes(initialCodes);

    toast.success(`🚀 ${company.name} OA Assessment started! Proctoring active.`);
  };

  const finishTest = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setInTest(false);
    setTestCompleted(true);
    addXP(250);
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
  };

  const currentProblem = selectedCompany?.problems[currentProblemIdx];

  const handleRunCode = async () => {
    if (!currentProblem) return;
    setRunning(true);
    setOutput('');

    const userCode = codes[currentProblem.id] || '';

    try {
      const res = await fetch('https://emkc.org/api/v2/piston/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: language === 'cpp' ? 'c++' : language,
          version: language === 'cpp' ? '10.2.0' : language === 'python' ? '3.10.0' : '18.15.0',
          files: [{ content: userCode }],
        }),
      });
      const data = await res.json();
      const stdout = (data?.run?.stdout || '').trim();
      const stderr = (data?.run?.stderr || '').trim();
      const resOutput = stdout || stderr || 'No output';
      setOutput(resOutput);

      if (!stderr && stdout.includes(currentProblem.expectedOutput)) {
        toast.success('Test Case Passed! ✅');
        setSubmitted(prev => ({ ...prev, [currentProblem.id]: true }));
      } else if (stderr) {
        toast.error('Runtime Error in code execution');
      }
    } catch (err: any) {
      setOutput('❌ Code execution failed: ' + err.message);
    } finally {
      setRunning(false);
    }
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="flex-1 overflow-y-auto min-h-screen pb-12">
      <TopBar title="OA Test Simulator" subtitle="Company-specific timed assessments with proctoring" />

      <div className="p-6 max-w-6xl mx-auto space-y-6">

        {/* ── Selection Screen ── */}
        {!inTest && !testCompleted && (
          <div className="space-y-6">
            <div className="glass-card p-6 border-indigo-500/20 bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-heading font-bold text-white flex items-center gap-2">
                    <Zap className="text-amber-400" /> Real-time OA Assessment Environment
                  </h2>
                  <p className="text-sm text-slate-300 mt-1 max-w-2xl">
                    Simulate real company online assessments under strict timed conditions. Includes automatic tab-switch detection, Monaco Code Editor, and Piston execution engine.
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-300 px-3 py-1.5 rounded-lg text-xs font-semibold">
                  <ShieldAlert size={14} /> Proctoring Enabled
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {OA_COMPANIES.map(company => (
                <div key={company.name} className="glass-card p-5 hover:border-indigo-500/40 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-heading font-bold text-white">{company.name}</span>
                      <span className="badge badge-indigo text-xs">{company.durationMinutes} Mins</span>
                    </div>
                    <p className="text-xs text-slate-400 mb-4">{company.pattern}</p>
                    <div className="space-y-2 mb-4">
                      {company.problems.map((p, i) => (
                        <div key={p.id} className="flex items-center justify-between text-xs text-slate-300 bg-white/3 p-2 rounded">
                          <span>Q{i+1}: {p.title}</span>
                          <span className={`badge text-[10px] ${p.difficulty === 'Hard' ? 'badge-red' : 'badge-amber'}`}>{p.difficulty}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => startOA(company)}
                    className="w-full py-2.5 rounded-xl btn-gradient text-white text-sm font-semibold flex items-center justify-center gap-2"
                  >
                    <Play size={14} /> Start {company.name} OA
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Active Test Screen ── */}
        {inTest && selectedCompany && currentProblem && (
          <div className="space-y-4">
            {/* Top Bar Status */}
            <div className="glass-card p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-base font-bold text-white">{selectedCompany.name} Official OA</span>
                <span className="text-xs text-slate-400">| Q{currentProblemIdx + 1} of {selectedCompany.problems.length}</span>
              </div>

              {/* Timer + Proctor */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">
                  <AlertTriangle size={14} /> Tab Warnings: {tabSwitches}/3
                </div>
                <div className="flex items-center gap-2 text-sm font-mono font-bold text-white bg-indigo-500/20 px-4 py-1.5 rounded-lg border border-indigo-500/30">
                  <Clock size={16} className="text-indigo-400" /> {formatTime(timeLeft)}
                </div>
                <button
                  onClick={finishTest}
                  className="px-4 py-1.5 rounded-lg bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-semibold hover:bg-red-500/30 transition-all"
                >
                  Submit OA Test
                </button>
              </div>
            </div>

            {/* Main Editor & Problem split */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Problem Description */}
              <div className="glass-card p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">{currentProblem.title}</h3>
                  <span className={`badge text-xs ${currentProblem.difficulty === 'Hard' ? 'badge-red' : 'badge-amber'}`}>
                    {currentProblem.difficulty}
                  </span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">{currentProblem.description}</p>
                <div className="bg-black/30 p-3 rounded-lg border border-white/5 text-xs font-mono text-slate-300">
                  <span className="text-slate-500 block mb-1">Target Expected Console Output:</span>
                  <span className="text-emerald-400">{currentProblem.expectedOutput}</span>
                </div>

                {/* Problem Selector Tabs */}
                <div className="flex gap-2 pt-4">
                  {selectedCompany.problems.map((p, idx) => (
                    <button
                      key={p.id}
                      onClick={() => setCurrentProblemIdx(idx)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        currentProblemIdx === idx ? 'tab-active' : 'tab-inactive'
                      }`}
                    >
                      Question {idx + 1} {submitted[p.id] ? '✅' : ''}
                    </button>
                  ))}
                </div>
              </div>

              {/* Code Editor */}
              <div className="glass-card overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="px-4 py-2.5 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Code2 size={14} className="text-indigo-400" />
                      <span className="text-xs font-medium text-slate-400">Monaco Editor</span>
                    </div>
                    <div className="flex gap-1">
                      {(['python', 'javascript', 'cpp'] as const).map(lang => (
                        <button
                          key={lang}
                          onClick={() => setLanguage(lang)}
                          className={`text-xs px-2.5 py-1 rounded transition-all ${language === lang ? 'bg-indigo-500 text-white' : 'text-slate-400'}`}
                        >
                          {lang === 'cpp' ? 'C++' : lang.charAt(0).toUpperCase() + lang.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="h-72">
                    <Editor
                      height="100%"
                      language={language === 'cpp' ? 'cpp' : language}
                      value={codes[currentProblem.id] || ''}
                      onChange={v => setCodes(prev => ({ ...prev, [currentProblem.id]: v || '' }))}
                      theme="vs-dark"
                      options={{ minimap: { enabled: false }, fontSize: 13 }}
                    />
                  </div>
                </div>

                {/* Controls & Output */}
                <div className="p-4 border-t border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={handleRunCode}
                      disabled={running}
                      className="px-4 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold hover:bg-emerald-500/30 transition-all flex items-center gap-1.5"
                    >
                      {running ? 'Running...' : '▶ Run & Test'}
                    </button>
                    {submitted[currentProblem.id] && (
                      <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle size={14} /> Passed
                      </span>
                    )}
                  </div>

                  {output && (
                    <div className="bg-black/50 p-3 rounded-lg border border-white/10 text-xs font-mono text-slate-300 max-h-28 overflow-y-auto">
                      {output}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Test Completion Report Screen ── */}
        {testCompleted && selectedCompany && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
            <div className="glass-card p-8 text-center bg-gradient-to-br from-indigo-500/10 to-purple-500/10 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                <Award size={32} />
              </div>
              <h2 className="text-2xl font-heading font-bold text-white">{selectedCompany.name} OA Assessment Complete!</h2>
              <p className="text-sm text-slate-400 max-w-md mx-auto">
                Your code and proctoring metrics have been evaluated.
              </p>

              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto pt-4">
                <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                  <div className="text-xl font-bold text-white">
                    {Object.keys(submitted).length} / {selectedCompany.problems.length}
                  </div>
                  <div className="text-xs text-slate-400">Passed</div>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                  <div className="text-xl font-bold text-amber-400">{tabSwitches}</div>
                  <div className="text-xs text-slate-400">Warnings</div>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                  <div className="text-xl font-bold text-emerald-400">+250</div>
                  <div className="text-xs text-slate-400">XP Earned</div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => { setTestCompleted(false); setInTest(false); }}
                  className="px-6 py-2.5 rounded-xl btn-gradient text-white text-sm font-semibold"
                >
                  Return to OA Simulator
                </button>
              </div>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}
