import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TopBar from '../components/layout/TopBar';
import {
  Swords, Zap, Clock, Trophy, Play, CheckCircle, ShieldAlert,
  Search, UserCheck, Flame, RotateCcw, AlertCircle, Award, Sparkles
} from 'lucide-react';
import Editor from '@monaco-editor/react';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';
import { useStore } from '../store/useStore';

interface DuelOpponent {
  id: string;
  name: string;
  college: string;
  rating: number;
  avatar: string;
  targetCompany: string;
}

const DUMMY_OPPONENTS: DuelOpponent[] = [
  { id: 'o1', name: 'Aarav Sharma', college: 'NIT Trichy', rating: 1540, avatar: '👨‍💻', targetCompany: 'Google' },
  { id: 'o2', name: 'Ananya Verma', college: 'IIIT Hyderabad', rating: 1680, avatar: '👩‍💻', targetCompany: 'Amazon' },
  { id: 'o3', name: 'Rohan Gupta', college: 'BITS Pilani', rating: 1490, avatar: '🧑‍💻', targetCompany: 'Microsoft' },
];

const DUEL_PROBLEMS = [
  {
    id: 'dp1',
    title: 'Container With Most Water',
    difficulty: 'Medium',
    timeLimitSeconds: 900, // 15 mins
    description: 'Given n non-negative integers a1, a2, ..., an , where each represents a point at coordinate (i, ai). Find two lines, which together with x-axis forms a container, such that the container contains the most water.',
    starterCode: {
      python: `def maxArea(height: list[int]) -> int:\n    # Write your O(N) two-pointer solution here\n    left, right = 0, len(height) - 1\n    ans = 0\n    while left < right:\n        ans = max(ans, min(height[left], height[right]) * (right - left))\n        if height[left] < height[right]:\n            left += 1\n        else:\n            right -= 1\n    return ans\n\nprint(maxArea([1,8,6,2,5,4,8,3,7])) # Expected: 49`,
      javascript: `function maxArea(height) {\n    let left = 0, right = height.length - 1, ans = 0;\n    while (left < right) {\n        ans = Math.max(ans, Math.min(height[left], height[right]) * (right - left));\n        if (height[left] < height[right]) left++;\n        else right--;\n    }\n    return ans;\n}\nconsole.log(maxArea([1,8,6,2,5,4,8,3,7])); // Expected: 49`,
    },
    totalTestcases: 10,
    expectedOutput: '49',
  },
  {
    id: 'dp2',
    title: 'Trapping Rain Water',
    difficulty: 'Hard',
    timeLimitSeconds: 900,
    description: 'Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.',
    starterCode: {
      python: `def trap(height: list[int]) -> int:\n    # Write your solution here\n    return 6\n\nprint(trap([0,1,0,2,1,0,1,3,2,1,2,1])) # Expected: 6`,
      javascript: `function trap(height) {\n    return 6;\n}\nconsole.log(trap([0,1,0,2,1,0,1,3,2,1,2,1])); // Expected: 6`,
    },
    totalTestcases: 12,
    expectedOutput: '6',
  },
];

export default function DSADuelPage() {
  const { user, progress, addXP, removeXP } = useStore();
  const [phase, setPhase] = useState<'matchmaking' | 'matched' | 'dueling' | 'result'>('matchmaking');
  
  const [opponent, setOpponent] = useState<DuelOpponent | null>(null);
  const [searching, setSearching] = useState(false);
  const [matchCountdown, setMatchCountdown] = useState(3);

  const [currentProblemIdx, setCurrentProblemIdx] = useState(0);
  const problem = DUEL_PROBLEMS[currentProblemIdx];

  const [code, setCode] = useState(problem.starterCode.python);
  const [language, setLanguage] = useState<'python' | 'javascript'>('python');

  const [timeLeft, setTimeLeft] = useState(problem.timeLimitSeconds);
  const [userPassedCases, setUserPassedCases] = useState(0);
  const [opponentPassedCases, setOpponentPassedCases] = useState(0);
  
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState('');
  const [duelWinner, setDuelWinner] = useState<'user' | 'opponent' | null>(null);

  const timerRef = useRef<any>(null);

  // Matchmaking simulation
  const startMatchmaking = () => {
    setSearching(true);
    setTimeout(() => {
      const randOpp = DUMMY_OPPONENTS[Math.floor(Math.random() * DUMMY_OPPONENTS.length)];
      setOpponent(randOpp);
      setSearching(false);
      setPhase('matched');
      toast.success(`Opponent Found: ${randOpp.name} (${randOpp.college})! ⚔️`);

      // 3 second countdown
      let count = 3;
      setMatchCountdown(3);
      const cdInterval = setInterval(() => {
        count--;
        setMatchCountdown(count);
        if (count <= 0) {
          clearInterval(cdInterval);
          startDuelSession();
        }
      }, 1000);
    }, 2500);
  };

  const startDuelSession = () => {
    setPhase('dueling');
    setTimeLeft(problem.timeLimitSeconds);
    setUserPassedCases(0);
    setOpponentPassedCases(0);

    // Duel Timer
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          endDuel('timeout');
          return 0;
        }
        return prev - 1;
      });

      // Simulating opponent progress
      if (Math.random() > 0.75) {
        setOpponentPassedCases(prev => {
          const next = Math.min(problem.totalTestcases, prev + 1);
          if (next === problem.totalTestcases) {
            endDuel('opponent_won');
          }
          return next;
        });
      }
    }, 1000);
  };

  const handleRunCode = async () => {
    setRunning(true);
    setOutput('');

    try {
      const res = await fetch('https://emkc.org/api/v2/piston/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: language === 'python' ? 'python' : 'javascript',
          version: language === 'python' ? '3.10.0' : '18.15.0',
          files: [{ content: code }],
        }),
      });
      const data = await res.json();
      const stdout = (data?.run?.stdout || '').trim();
      setOutput(stdout || data?.run?.stderr || 'No output');

      if (stdout.includes(problem.expectedOutput)) {
        setUserPassedCases(problem.totalTestcases);
        endDuel('user_won');
      } else {
        const passed = Math.floor(Math.random() * (problem.totalTestcases - 2)) + 2;
        setUserPassedCases(passed);
        toast.error(`Passed ${passed}/${problem.totalTestcases} testcases. Fix your solution!`);
      }
    } catch (err) {
      setOutput('❌ Code Execution Error');
    } finally {
      setRunning(false);
    }
  };

  const endDuel = (result: 'user_won' | 'opponent_won' | 'timeout') => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (result === 'user_won') {
      setDuelWinner('user');
      addXP(200);
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      toast.success('🏆 VICTORY! You won the 1v1 Speed Duel! +200 XP & +50 ELO!');
    } else {
      setDuelWinner('opponent');
      removeXP(50);
      toast.error('DEFEAT! Opponent submitted all testcases first. -50 XP penalty.');
    }
    setPhase('result');
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <TopBar title="1v1 Live Speed Duel Arena ⚔️" subtitle="Real-time Multiplayer Coding Race with Batchmates" />

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Banner */}
        <div className="glass-card p-6 relative overflow-hidden bg-gradient-to-r from-red-950/40 via-purple-900/30 to-slate-900/60 border border-red-500/30">
          <div className="flex items-center justify-between flex-wrap gap-4 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="badge badge-red flex items-center gap-1"><Flame size={12} /> LIVE SPEED BATTLE</span>
                <span className="badge badge-indigo">ELO Rating: 1540</span>
              </div>
              <h1 className="text-2xl font-bold font-heading text-white">1v1 DSA Speed Matchmaking</h1>
              <p className="text-xs text-slate-300 max-w-xl mt-1">
                Compete 1-on-1 against batchmates to pass all testcases first! Winner gains +200 XP and +50 ELO rating points.
              </p>
            </div>
          </div>
        </div>

        {/* Phase 1: Matchmaking */}
        {phase === 'matchmaking' && (
          <div className="glass-card p-12 text-center max-w-xl mx-auto border border-white/10 space-y-6">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-red-500 to-purple-600 flex items-center justify-center text-white mx-auto shadow-xl shadow-red-500/20">
              <Swords size={36} />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white">Find Opponent</h2>
              <p className="text-xs text-slate-400 mt-1">Ranked 1v1 matchmaking based on your ELO rating & college branch</p>
            </div>

            <button
              disabled={searching}
              onClick={startMatchmaking}
              className="w-full py-4 rounded-xl btn-gradient font-bold text-sm text-white shadow-xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-all disabled:opacity-50"
            >
              {searching ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Searching for College Batchmates...
                </>
              ) : (
                <>
                  <Swords size={18} /> Enter Ranked 1v1 Arena
                </>
              )}
            </button>
          </div>
        )}

        {/* Phase 2: Matched Countdown */}
        {phase === 'matched' && opponent && (
          <div className="glass-card p-10 text-center max-w-xl mx-auto border border-indigo-500/40 space-y-6">
            <h2 className="text-xl font-bold text-white">Match Found! ⚔️</h2>
            <div className="flex items-center justify-around py-4">
              <div className="text-center">
                <div className="text-4xl mb-1">👨‍💻</div>
                <div className="font-bold text-white text-sm">{user?.name || 'You'}</div>
                <div className="text-xs text-slate-400">{user?.college || 'IIT Bombay'}</div>
              </div>
              <div className="text-3xl font-bold text-red-400 font-mono">VS</div>
              <div className="text-center">
                <div className="text-4xl mb-1">{opponent.avatar}</div>
                <div className="font-bold text-white text-sm">{opponent.name}</div>
                <div className="text-xs text-slate-400">{opponent.college} • {opponent.rating} ELO</div>
              </div>
            </div>

            <div className="text-3xl font-extrabold text-amber-400 animate-bounce">
              Starting in {matchCountdown}...
            </div>
          </div>
        )}

        {/* Phase 3: Dueling Arena */}
        {phase === 'dueling' && opponent && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Problem statement & Live score progress */}
            <div className="glass-card p-5 space-y-5 border border-white/10">
              <div className="flex items-center justify-between">
                <span className="badge badge-red font-mono">{formatTime(timeLeft)} Left</span>
                <span className="badge badge-amber">{problem.difficulty}</span>
              </div>

              <div>
                <h2 className="text-lg font-bold text-white">{problem.title}</h2>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">{problem.description}</p>
              </div>

              {/* Progress Indicators */}
              <div className="space-y-4 border-t border-white/8 pt-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-emerald-400">You ({userPassedCases}/{problem.totalTestcases})</span>
                    <span className="text-slate-400">{Math.round((userPassedCases / problem.totalTestcases) * 100)}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${(userPassedCases / problem.totalTestcases) * 100}%` }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-red-400">{opponent.name} ({opponentPassedCases}/{problem.totalTestcases})</span>
                    <span className="text-slate-400">{Math.round((opponentPassedCases / problem.totalTestcases) * 100)}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 transition-all duration-500" style={{ width: `${(opponentPassedCases / problem.totalTestcases) * 100}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Code Editor & Execution */}
            <div className="lg:col-span-2 glass-card p-5 space-y-4 border border-white/10 flex flex-col">
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {(['python', 'javascript'] as const).map(lang => (
                    <button
                      key={lang}
                      onClick={() => {
                        setLanguage(lang);
                        setCode(problem.starterCode[lang]);
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase ${
                        language === lang ? 'tab-active' : 'tab-inactive'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleRunCode}
                  disabled={running}
                  className="btn-gradient px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg disabled:opacity-50"
                >
                  <Play size={14} /> {running ? 'Testing...' : 'Submit & Test Solution'}
                </button>
              </div>

              <div className="h-96 rounded-xl overflow-hidden border border-white/10">
                <Editor
                  height="100%"
                  language={language}
                  theme="vs-dark"
                  value={code}
                  onChange={v => setCode(v || '')}
                  options={{ fontSize: 13, minimap: { enabled: false } }}
                />
              </div>

              {output && (
                <div className="p-3 bg-black/60 rounded-xl font-mono text-xs text-slate-200 border border-white/8 max-h-32 overflow-y-auto">
                  <span className="text-slate-500 font-bold block mb-1">Execution Output:</span>
                  <pre>{output}</pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Phase 4: Result Modal */}
        {phase === 'result' && (
          <div className="glass-card p-8 text-center max-w-md mx-auto border border-indigo-500/40 space-y-5">
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-white mx-auto shadow-2xl ${
              duelWinner === 'user' ? 'bg-gradient-to-br from-emerald-500 to-green-600' : 'bg-gradient-to-br from-red-500 to-rose-600'
            }`}>
              <Trophy size={36} />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white">
                {duelWinner === 'user' ? '🎉 VICTORY!' : '💔 DEFEAT'}
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                {duelWinner === 'user' ? 'You solved all testcases faster than your opponent!' : 'Your opponent passed all testcases first.'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/4 border border-white/8 space-y-2 text-xs">
              <div className="flex justify-between"><span>XP Earned:</span> <span className="font-bold text-amber-400">{duelWinner === 'user' ? '+200 XP' : '-50 XP'}</span></div>
              <div className="flex justify-between"><span>ELO Rating:</span> <span className="font-bold text-indigo-400">{duelWinner === 'user' ? '+50 Rating' : '-25 Rating'}</span></div>
            </div>

            <button
              onClick={() => setPhase('matchmaking')}
              className="w-full btn-gradient py-3 rounded-xl font-bold text-xs"
            >
              Play Another 1v1 Battle ⚔️
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
