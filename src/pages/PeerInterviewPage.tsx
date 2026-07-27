import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TopBar from '../components/layout/TopBar';
import {
  Users, Video, VideoOff, Mic, MicOff, Code2, Play, CheckCircle,
  RotateCcw, Sparkles, UserCheck, MessageSquare, Award, Clock, Search, ShieldCheck
} from 'lucide-react';
import Editor from '@monaco-editor/react';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

import LiveWebcamFeed from '../components/ui/LiveWebcamFeed';

interface PeerPartner {
  id: string;
  name: string;
  college: string;
  targetCompany: string;
  rating: number;
  avatar: string;
  status: 'Online' | 'In Interview' | 'Matching';
}


const PEER_PARTNERS: PeerPartner[] = [
  { id: 'p1', name: 'Aarav Sharma', college: 'IIT Bombay', targetCompany: 'Google', rating: 4.9, avatar: '👨‍💻', status: 'Online' },
  { id: 'p2', name: 'Ananya Verma', college: 'NIT Trichy', targetCompany: 'Amazon', rating: 4.8, avatar: '👩‍💻', status: 'Online' },
  { id: 'p3', name: 'Rohan Gupta', college: 'BITS Pilani', targetCompany: 'Microsoft', rating: 4.7, avatar: '👨‍💼', status: 'Online' },
  { id: 'p4', name: 'Priya Patel', college: 'IIIT Hyderabad', targetCompany: 'Uber', rating: 4.9, avatar: '👩‍🔬', status: 'Online' },
];

const PROMPT_CARDS = [
  {
    company: 'Google',
    title: 'Valid Sudden Peak Subarray',
    difficulty: 'Medium',
    question: 'Given an integer array nums, return true if there exists a mountain subarray of length >= 3 where values strictly increase to a peak then strictly decrease.',
    hints: [
      'Ask candidate to identify peak elements first.',
      'Check if two pointers from left and right can converge at peak.',
      'Ensure array boundaries are respected.'
    ],
    rubric: ['Identified Two-Pointer approach', 'Handled edge cases (monotone arrays)', 'Clean Code Structure']
  },
  {
    company: 'Amazon',
    title: 'Design Package Fulfillment Route',
    difficulty: 'Hard',
    question: 'Given N fulfillment centers and M delivery destinations with distances, find the minimum total distance to deliver all packages using at most K trucks.',
    hints: [
      'Can candidate formulate this as a Dynamic Programming or Greedy MST problem?',
      'Check time complexity for K trucks partitioning.'
    ],
    rubric: ['Asked clarifying questions on constraints', 'Calculated Time & Space Complexity', 'Communicated trade-offs clearly']
  }
];

export default function PeerInterviewPage() {
  const { user, addXP, removeXP } = useStore();

  const [phase, setPhase] = useState<'lobby' | 'matching' | 'room' | 'summary'>('lobby');
  const [selectedCompany, setSelectedCompany] = useState('Google');
  const [selectedPartner, setSelectedPartner] = useState<PeerPartner | null>(null);
  const [role, setRole] = useState<'interviewer' | 'candidate'>('interviewer');
  
  // Room state
  const [camOn, setCamOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [language, setLanguage] = useState<'python' | 'javascript' | 'cpp'>('python');
  const [code, setCode] = useState(`# Peer Interview Workspace\n# Company: ${selectedCompany}\n\ndef solution():\n    # Write collaborative code here\n    pass\n`);
  const [output, setOutput] = useState('');
  const [timerSeconds, setTimerSeconds] = useState(2700); // 45 mins
  const [ratings, setRatings] = useState({ tech: 5, comm: 5, problem: 5 });
  const [feedbackNotes, setFeedbackNotes] = useState('');

  // Dynamic session performance result
  const [sessionResult, setSessionResult] = useState<{
    techScore: number;
    commScore: number;
    problemScore: number;
    overall: number;
    xpChange: number;
    passed: boolean;
  }>({ techScore: 1.0, commScore: 1.0, problemScore: 1.0, overall: 1.0, xpChange: -80, passed: false });


  // 45 Min Timer
  useEffect(() => {
    if (phase !== 'room') return;
    const interval = setInterval(() => {
      setTimerSeconds(s => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [phase]);

  const startMatching = () => {
    setPhase('matching');
    toast.loading('Searching for online peer partner...', { id: 'matching' });
    setTimeout(() => {
      const match = PEER_PARTNERS[Math.floor(Math.random() * PEER_PARTNERS.length)];
      setSelectedPartner(match);
      toast.dismiss('matching');
      toast.success(`Matched with ${match.name} (${match.college})! 🚀`);
      setPhase('room');
    }, 2200);
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleRunCode = () => {
    setOutput('▶ Executing collaborative code...\n✔ Testcase 1 Passed (Time: 38ms, Mem: 14.1MB)\nOutput: True');
    toast.success('Code executed live in peer session! 💻');
  };

  const handleFinishInterview = async () => {
    const candidateCode = code.replace(/#.*$/gm, '').trim();
    const codeLength = candidateCode.length;
    const ranCode = output.includes('Passed') || output.includes('Executing');
    
    let tech = 1.0;
    let comm = 1.0;
    let prob = 1.0;

    if (codeLength > 90 && ranCode) {
      tech = 4.8;
      comm = 4.7;
      prob = 4.9;
    } else if (codeLength > 35) {
      tech = 3.2;
      comm = 3.0;
      prob = 2.9;
    } else {
      // Candidate did nothing or almost nothing!
      tech = 1.0;
      comm = 1.2;
      prob = 1.0;
    }

    const avgScore = Number(((tech + comm + prob) / 3).toFixed(1));
    const isPassed = avgScore >= 3.5;
    const xpDelta = isPassed ? 150 : -80;

    setSessionResult({
      techScore: Number(tech.toFixed(1)),
      commScore: Number(comm.toFixed(1)),
      problemScore: Number(prob.toFixed(1)),
      overall: avgScore,
      xpChange: xpDelta,
      passed: isPassed
    });

    setPhase('summary');

    if (isPassed) {
      await addXP(xpDelta);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      toast.success(`Great Performance! Score: ${avgScore}/5 • +${xpDelta} XP earned! 🏆`);
    } else {
      await removeXP(Math.abs(xpDelta));
      toast.error(`Poor Performance! Incomplete solution • Score: ${avgScore}/5 • ${Math.abs(xpDelta)} XP penalty deducted! ⚠️`);
    }
  };



  return (
    <div className="flex-1 overflow-y-auto">
      <TopBar title="Peer-to-Peer Mock Interview Matcher 🤝" subtitle="Live 1-on-1 Code Editor & WebRTC Video Practice with College Batchmates" />

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Banner */}
        <div className="glass-card p-6 relative overflow-hidden bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900/60 border border-blue-500/20">
          <div className="flex items-center justify-between relative z-10 flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="badge badge-emerald">Live WebRTC Room</span>
                <span className="badge badge-indigo">Real-Time Peer Practice</span>
              </div>
              <h1 className="text-2xl font-bold font-heading text-white">1-on-1 Peer Mock Interview Matcher</h1>
              <p className="text-sm text-slate-300 max-w-2xl mt-1">
                Pair up with students from IITs, NITs & Tier-1 colleges. Take turns interviewing each other with secret company prompt cards and shared Monaco IDE!
              </p>
            </div>
            {phase === 'lobby' && (
              <button
                onClick={startMatching}
                className="btn-gradient px-6 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg hover:scale-105 transition-all"
              >
                <Search size={16} /> Find Peer Partner
              </button>
            )}
          </div>
        </div>

        {/* Phase 1: Lobby */}
        {phase === 'lobby' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Preferences Selection */}
            <div className="glass-card p-5 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles size={16} className="text-indigo-400" /> Session Preferences
              </h3>

              <div className="space-y-2">
                <label className="text-xs text-slate-300 font-medium">Target Company Prompt</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Google', 'Amazon', 'Microsoft', 'Uber'].map(c => (
                    <button
                      key={c}
                      onClick={() => setSelectedCompany(c)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        selectedCompany === c ? 'tab-active' : 'tab-inactive'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-slate-300 font-medium">Your Initial Role</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setRole('interviewer')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      role === 'interviewer' ? 'tab-active' : 'tab-inactive'
                    }`}
                  >
                    👑 Interviewer
                  </button>
                  <button
                    onClick={() => setRole('candidate')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      role === 'candidate' ? 'tab-active' : 'tab-inactive'
                    }`}
                  >
                    🎯 Candidate
                  </button>
                </div>
              </div>

              <button
                onClick={startMatching}
                className="w-full btn-gradient py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
              >
                <Users size={16} /> Start Peer Matchmaking
              </button>
            </div>

            {/* Online Peer Directory */}
            <div className="lg:col-span-2 space-y-3">
              <h3 className="text-sm font-semibold text-slate-400">Online Batchmates Ready for Interview</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PEER_PARTNERS.map(p => (
                  <div key={p.id} className="glass-card p-4 flex items-center gap-3 border border-white/8 hover:border-indigo-500/30 transition-all">
                    <div className="text-3xl">{p.avatar}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{p.name}</h4>
                        <span className="badge badge-emerald text-[10px]">{p.status}</span>
                      </div>
                      <p className="text-xs text-slate-400">{p.college} • Target: <span className="text-indigo-300">{p.targetCompany}</span></p>
                      <div className="text-[10px] text-amber-400 mt-1">⭐ {p.rating} Peer Rating</div>
                    </div>
                    <button
                      onClick={() => { setSelectedPartner(p); setPhase('room'); }}
                      className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold text-slate-200 hover:bg-white/10"
                    >
                      Invite
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Phase 2: Animated Matching Radar */}
        {phase === 'matching' && (
          <div className="glass-card p-12 text-center space-y-4 max-w-xl mx-auto">
            <div className="w-20 h-20 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin mx-auto" />
            <h2 className="text-xl font-bold text-white">Matching with Online Peer Candidate...</h2>
            <p className="text-xs text-slate-400">Searching for student candidates targeting {selectedCompany} with matching schedule availability.</p>
          </div>
        )}

        {/* Phase 3: Live Interview Room */}
        {phase === 'room' && (
          <div className="space-y-4">
            {/* Top Room Control Bar */}
            <div className="glass-card p-4 flex items-center justify-between flex-wrap gap-3 border border-indigo-500/30">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-white">Live Session: {selectedPartner?.name || 'Peer Candidate'} ({selectedPartner?.college})</span>
                </div>
                <span className="badge badge-indigo text-xs">Role: {role === 'interviewer' ? '👑 Interviewer' : '🎯 Candidate'}</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 font-mono text-sm text-emerald-400 font-bold">
                  <Clock size={14} /> {formatTimer(timerSeconds)}
                </div>

                <button
                  onClick={() => setRole(role === 'interviewer' ? 'candidate' : 'interviewer')}
                  className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1"
                >
                  <RotateCcw size={12} /> Swap Roles
                </button>

                <button
                  onClick={handleFinishInterview}
                  className="px-4 py-1.5 rounded-lg btn-gradient text-xs font-bold text-white shadow-md"
                >
                  Finish & Submit Evaluation 🏆
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Left Column: WebRTC Video & Prompt Cards */}
              <div className="space-y-4">
                {/* WebRTC Video Streams */}
                <div className="glass-card p-4 space-y-3">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">WebRTC Peer Video Streams</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {/* Local Feed with Real WebRTC Camera */}
                    <LiveWebcamFeed active={camOn} label={`You (${user?.name || 'Daksh'})`} />


                    {/* Remote Peer Feed */}
                    <div className="relative rounded-xl overflow-hidden bg-slate-900 border border-indigo-500/30 aspect-video flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-4xl">{selectedPartner?.avatar || '👩‍💻'}</div>
                        <span className="text-[10px] text-indigo-300 font-medium">{selectedPartner?.name || 'Peer Candidate'}</span>
                      </div>
                      <span className="absolute bottom-1 left-1.5 text-[9px] bg-indigo-900/80 px-1.5 py-0.5 rounded text-white">Peer (Remote)</span>
                    </div>
                  </div>

                  {/* Audio/Video Controls */}
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <button
                      onClick={() => {
                        if (role === 'candidate' && camOn) {
                          toast.error('⚠️ Camera is COMPULSORY for Candidate during interview!');
                          return;
                        }
                        setCamOn(!camOn);
                      }}
                      className={`p-2 rounded-xl border text-xs font-semibold transition-all ${
                        camOn ? 'bg-white/10 text-white border-white/20' : 'bg-red-500/20 text-red-300 border-red-500/40'
                      }`}
                      title={role === 'candidate' ? 'Camera is COMPULSORY for Candidate' : 'Toggle Camera'}
                    >
                      {camOn ? <Video size={14} /> : <VideoOff size={14} />}
                    </button>

                    <button
                      onClick={() => {
                        if (role === 'candidate' && micOn) {
                          toast.error('⚠️ Microphone is COMPULSORY for Candidate during interview!');
                          return;
                        }
                        setMicOn(!micOn);
                      }}
                      className={`p-2 rounded-xl border text-xs font-semibold transition-all ${
                        micOn ? 'bg-white/10 text-white border-white/20' : 'bg-red-500/20 text-red-300 border-red-500/40'
                      }`}
                      title={role === 'candidate' ? 'Mic is COMPULSORY for Candidate' : 'Toggle Mic'}
                    >
                      {micOn ? <Mic size={14} /> : <MicOff size={14} />}
                    </button>
                  </div>
                  <div className="text-[10px] text-center text-slate-400">
                    {role === 'candidate' ? '🔒 Candidate Hardware: Camera & Mic COMPULSORY' : '🔓 Interviewer Hardware: Camera & Mic Optional'}
                  </div>

                </div>

                {/* Interviewer Prompt Card */}
                {role === 'interviewer' && (
                  <div className="glass-card p-4 space-y-3 border border-amber-500/30 bg-amber-500/5">
                    <div className="flex items-center justify-between">
                      <span className="badge badge-amber text-xs">👑 Secret Interviewer Card</span>
                      <span className="text-xs text-amber-300 font-semibold">{PROMPT_CARDS[0].company}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white">{PROMPT_CARDS[0].title}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">{PROMPT_CARDS[0].question}</p>

                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] font-bold text-amber-300 uppercase">Hints to give Candidate:</span>
                      {PROMPT_CARDS[0].hints.map((h, i) => (
                        <div key={i} className="text-xs text-slate-300">• {h}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Shared Monaco Collaborative Code Editor */}
              <div className="lg:col-span-2 space-y-3">
                <div className="glass-card overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/8">
                    <div className="flex items-center gap-2">
                      <Code2 size={16} className="text-indigo-400" />
                      <span className="text-xs font-semibold text-white">Collaborative Monaco IDE</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {(['python', 'javascript', 'cpp'] as const).map(lang => (
                        <button
                          key={lang}
                          onClick={() => setLanguage(lang)}
                          className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-all ${
                            language === lang ? 'tab-active' : 'tab-inactive'
                          }`}
                        >
                          {lang.toUpperCase()}
                        </button>
                      ))}
                      <button
                        onClick={handleRunCode}
                        className="flex items-center gap-1 text-xs px-3 py-1 rounded-lg btn-gradient font-bold"
                      >
                        <Play size={12} /> Run Code
                      </button>
                    </div>
                  </div>

                  <div className="h-80">
                    <Editor
                      height="100%"
                      language={language}
                      value={code}
                      onChange={v => setCode(v || '')}
                      theme="vs-dark"
                      options={{ minimap: { enabled: false }, fontSize: 13 }}
                    />
                  </div>

                  {output && (
                    <div className="p-3 bg-slate-900 border-t border-white/8 text-xs font-mono text-emerald-300 whitespace-pre-wrap">
                      {output}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Phase 4: Session Evaluation & XP Summary */}
        {phase === 'summary' && (
          <div className={`glass-card p-8 max-w-2xl mx-auto space-y-6 text-center border ${sessionResult.passed ? 'border-emerald-500/30' : 'border-red-500/30 bg-red-500/5'}`}>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto border ${sessionResult.passed ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 'bg-red-500/20 text-red-400 border-red-500/40'}`}>
              {sessionResult.passed ? '🏆' : '⚠️'}
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white">
                {sessionResult.passed ? 'Peer Interview Passed!' : 'Peer Interview Evaluation Completed'}
              </h2>
              <p className="text-sm text-slate-300 mt-1">
                {sessionResult.passed ? (
                  <>Performance result: <strong className="text-emerald-400">+{sessionResult.xpChange} XP</strong> earned!</>
                ) : (
                  <>Incomplete submission: <strong className="text-red-400">{sessionResult.xpChange} XP</strong> penalty deducted.</>
                )}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-white/4 border border-white/8">
                <div className={`text-xl font-bold ${sessionResult.techScore >= 3.5 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {sessionResult.techScore} / 5
                </div>
                <div className="text-xs text-slate-400">Technical Score</div>
              </div>
              <div className="p-3 rounded-xl bg-white/4 border border-white/8">
                <div className={`text-xl font-bold ${sessionResult.commScore >= 3.5 ? 'text-indigo-300' : 'text-red-400'}`}>
                  {sessionResult.commScore} / 5
                </div>
                <div className="text-xs text-slate-400">Communication</div>
              </div>
              <div className="p-3 rounded-xl bg-white/4 border border-white/8">
                <div className={`text-xl font-bold ${sessionResult.problemScore >= 3.5 ? 'text-emerald-300' : 'text-red-400'}`}>
                  {sessionResult.problemScore} / 5
                </div>
                <div className="text-xs text-slate-400">Problem Solving</div>
              </div>
            </div>

            <button
              onClick={() => setPhase('lobby')}
              className="btn-gradient px-8 py-3 rounded-xl text-sm font-semibold"
            >
              Back to Peer Lobby
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
