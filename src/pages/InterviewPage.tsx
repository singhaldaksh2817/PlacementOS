import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TopBar from '../components/layout/TopBar';
import {
  MessageSquare, Send, Mic, MicOff, BarChart3, Star,
  ChevronRight, Building2, CheckCircle, Trophy, Brain, Users
} from 'lucide-react';

import { useStore } from '../store/useStore';
import { MOCK_INTERVIEW_SESSIONS, INTERVIEW_QUESTIONS } from '../data/mockData';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';

type Phase = 'setup' | 'interview' | 'result';

interface Message {
  id: string;
  role: 'interviewer' | 'candidate' | 'system';
  content: string;
  timestamp: string;
}

const COMPANIES_LIST = ['Google', 'Microsoft', 'Amazon', 'Adobe', 'Goldman Sachs', 'Flipkart', 'Oracle', 'Uber', 'Atlassian', 'NVIDIA'];
const ROUNDS = ['Technical', 'HR', 'Behavioral', 'System Design', 'Coding', 'Managerial'];

const FOLLOW_UPS: Record<string, string[]> = {
  Technical: [
    "What's the time complexity of that approach?",
    "Can you optimize it further?",
    "What are the edge cases you're considering?",
    "How would you test this code?",
    "Can you trace through an example?",
  ],
  HR: [
    "Can you elaborate more on that?",
    "What specifically did you learn from that experience?",
    "How does that relate to our company values?",
    "What would you do differently now?",
    "Can you give me a specific example?",
  ],
  Behavioral: [
    "What was the outcome of that situation?",
    "What specific actions did YOU take?",
    "How did your team respond?",
    "What metrics can you share?",
    "What would you do differently?",
  ],
  'System Design': [
    'How would you scale this system to 10 million users?',
    'What database would you choose and why?',
    'Walk me through your caching strategy.',
    'How do you handle failures and ensure fault tolerance?',
  ],
  'Coding': [
    'Can you optimize your solution further?',
    'What is the time and space complexity?',
    'Can you write test cases for edge cases?',
    'How would you handle this with a different data structure?',
  ],
  'Managerial': [
    'Tell me about a time you resolved a conflict in a team.',
    'How do you prioritize tasks when deadlines conflict?',
    'Describe your leadership style.',
    'How do you handle feedback from peers?',
  ],
};

export default function InterviewPage() {
  const { addXP, user, interviewSessions, addInterviewSession } = useStore();
  const [phase, setPhase] = useState<Phase>('setup');
  const [company, setCompany] = useState('Amazon');
  const [round, setRound] = useState('Behavioral');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [activeTab, setActiveTab] = useState<'start' | 'history'>('start');
  const [scores, setScores] = useState({ technical: 0, communication: 0, confidence: 0 });
  const [selectedReviewSession, setSelectedReviewSession] = useState<any | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); };
  useEffect(() => { scrollToBottom(); }, [messages]);

  // Speech Synthesis (Text to Speech)
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window) || !voiceEnabled) return;
    window.speechSynthesis.cancel(); // stop previous
    const cleanText = text.replace(/[*_#~`]/g, ''); // strip markdown
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Speech Recognition (Speech to Text)
  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Voice dictation is not supported in this browser. Try Chrome or Edge!');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        toast.success('🎙️ Voice dictation active — speak your answer');
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInput(prev => prev ? `${prev} ${transcript}` : transcript);
      };

      recognition.onerror = (err: any) => {
        console.warn('Speech recognition error:', err);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('Failed to start speech recognition:', err);
      setIsListening(false);
    }
  };

  const getQuestions = () => {
    const key = `${company}-${round}` as keyof typeof INTERVIEW_QUESTIONS;
    return INTERVIEW_QUESTIONS[key] || INTERVIEW_QUESTIONS['HR'];
  };

  const startInterview = () => {
    const qs = getQuestions();
    const firstQ = qs[0];
    const initialAiMsg = `Hello! I'm your interviewer from ${company}. Welcome to the ${round} round. Let's begin!\n\n${firstQ}`;
    
    setMessages([
      {
        id: '1', role: 'system',
        content: `🎤 Mock Interview Started — ${company} ${round} Round\nThis AI interviewer will ask questions, follow up, and evaluate your responses. Answer naturally and completely.`,
        timestamp: new Date().toISOString(),
      },
      {
        id: '2', role: 'interviewer',
        content: initialAiMsg,
        timestamp: new Date().toISOString(),
      },
    ]);
    setQuestionIdx(0);
    setScores({ technical: 0, communication: 0, confidence: 0 });
    setPhase('interview');
    speakText(initialAiMsg);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const userMsg: Message = {
      id: Date.now().toString(), role: 'candidate',
      content: input, timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    await new Promise(r => setTimeout(r, 1500 + Math.random() * 1000));

    const qs = getQuestions();
    const followUps = FOLLOW_UPS[round] || FOLLOW_UPS.Behavioral;
    const nextQIdx = questionIdx + 1;
    const isFollowUp = Math.random() > 0.5 && questionIdx < qs.length - 1;

    let response = '';
    if (isFollowUp) {
      response = followUps[Math.floor(Math.random() * followUps.length)];
    } else if (nextQIdx < qs.length) {
      response = `Good answer. Let's move on.\n\n${qs[nextQIdx]}`;
      setQuestionIdx(nextQIdx);
    } else {
      response = "Thank you for your responses! That concludes our interview. I'll now compile your feedback.";
      setTimeout(() => finishInterview(), 2000);
    }

    const aiMsg: Message = {
      id: (Date.now() + 1).toString(), role: 'interviewer',
      content: response, timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, aiMsg]);
    setIsTyping(false);
    speakText(response);

    setScores(prev => ({
      technical: Math.min(100, prev.technical + Math.floor(Math.random() * 15) + 5),
      communication: Math.min(100, prev.communication + Math.floor(Math.random() * 12) + 6),
      confidence: Math.min(100, prev.confidence + Math.floor(Math.random() * 10) + 8),
    }));
  };

  const finishInterview = async () => {
    const finalScores = {
      technical: Math.floor(60 + Math.random() * 30),
      communication: Math.floor(65 + Math.random() * 25),
      confidence: Math.floor(60 + Math.random() * 30),
    };
    const overall = Math.floor((finalScores.technical + finalScores.communication + finalScores.confidence) / 3);
    setScores(finalScores);
    addXP(300);

    // Save session to store & Supabase
    const sessionObj = {
      id: `session-${Date.now()}`,
      company,
      round: round as any,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      duration: Math.max(1, Math.floor(messages.length * 1.5)),
      score: overall,
      confidenceScore: finalScores.confidence,
      technicalScore: finalScores.technical,
      communicationScore: finalScores.communication,
      feedback: 'Good structure in your responses. Demonstrated clear problem-solving approach and technical baseline.',
      transcript: messages.map(m => ({ role: m.role, message: m.content, content: m.content, timestamp: m.timestamp })),
      improvements: ['Use STAR framework for behavioral questions', 'Add 1-2 quantifiable metrics (e.g. % improvement)', 'Maintain clear pacing'],
      status: 'completed' as const,
    };

    await addInterviewSession(sessionObj);
    toast.success('Interview evaluation complete & session saved! 📊');
    setPhase('result');
  };

  if (phase === 'result') {
    const overall = Math.floor((scores.technical + scores.communication + scores.confidence) / 3);
    return (
      <div className="flex-1 overflow-y-auto">
        <TopBar title="Interview Complete — Results" />
        <div className="p-6 max-w-3xl mx-auto space-y-5">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-8 text-center">
            <div className="text-5xl mb-4">{overall >= 80 ? '🏆' : overall >= 65 ? '✅' : '📚'}</div>
            <div className="text-5xl font-heading font-bold gradient-text mb-2">{overall}/100</div>
            <div className="text-white font-semibold text-lg mb-1">{company} {round} Round</div>
            <div className="text-slate-400 text-sm">+300 XP earned</div>
          </motion.div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Technical', value: scores.technical, color: '#6366f1' },
              { label: 'Communication', value: scores.communication, color: '#8b5cf6' },
              { label: 'Confidence', value: scores.confidence, color: '#3b82f6' },
            ].map(s => (
              <div key={s.label} className="glass-card p-4 text-center">
                <div className="text-2xl font-bold text-white">{s.value}</div>
                <div className="text-xs text-slate-400 mt-1">{s.label}</div>
                <div className="mt-2 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div className="h-full rounded-full" style={{ background: s.color }}
                    initial={{ width: 0 }} animate={{ width: `${s.value}%` }} transition={{ duration: 1 }} />
                </div>
              </div>
            ))}
          </div>

          <div className="glass-card p-5">
            <h3 className="font-semibold text-white mb-4">AI Feedback & Improvements</h3>
            <div className="space-y-3">
              {[
                '✅ Good use of structured answers (STAR format)',
                '✅ Technical knowledge demonstrated effectively',
                '⚠️ Speak more slowly and clearly — pace down by ~20%',
                '⚠️ Use more quantifiable metrics in your examples',
                '💡 Practice: "Tell me about yourself" — add impact numbers',
                '💡 Prepare 2-3 examples for each Amazon Leadership Principle',
              ].map((item, i) => (
                <div key={i} className={`text-sm p-3 rounded-lg ${
                  item.startsWith('✅') ? 'bg-emerald-500/10 text-emerald-300' :
                  item.startsWith('⚠️') ? 'bg-amber-500/10 text-amber-300' :
                  'bg-blue-500/10 text-blue-300'
                }`}>{item}</div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setPhase('setup')} className="flex-1 py-3 border border-white/10 rounded-xl text-slate-300 text-sm hover:bg-white/5">
              New Interview
            </button>
            <button onClick={startInterview} className="btn-gradient flex-1 py-3 rounded-xl text-sm">Retry</button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'interview') {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title={`${company} — ${round} Round`} subtitle="AI Mock Interview in Progress" />
        <div className="flex-1 flex flex-col overflow-hidden p-4 max-w-3xl mx-auto w-full">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-2">
            {messages.map((msg) => (
              <motion.div key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === 'candidate' ? 'flex-row-reverse' : ''}`}
              >
                {msg.role !== 'system' && (
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                    msg.role === 'interviewer' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-purple-500/20 text-purple-400'
                  }`}>
                    {msg.role === 'interviewer' ? company[0] : 'Me'}
                  </div>
                )}
                <div className={`max-w-lg ${msg.role === 'system' ? 'w-full' : ''}`}>
                  {msg.role === 'system' ? (
                    <div className="p-3 rounded-xl bg-white/4 border border-white/8 text-xs text-slate-400 text-center whitespace-pre-line">
                      {msg.content}
                    </div>
                  ) : (
                    <div className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                      msg.role === 'interviewer'
                        ? 'bg-white/6 border border-white/8 text-slate-200 rounded-tl-sm'
                        : 'bg-indigo-500/20 border border-indigo-500/25 text-indigo-100 rounded-tr-sm'
                    }`}>
                      {msg.content}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            {isTyping && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-sm font-bold text-indigo-400">
                  {company[0]}
                </div>
                <div className="p-3 rounded-2xl bg-white/6 border border-white/8 flex gap-1.5 items-center">
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="glass-card p-3 flex gap-3 items-end">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder={isListening ? '🎙️ Listening to your voice... Speak now!' : 'Type your answer or click mic to dictate...'}
              rows={2}
              className={`input-dark resize-none text-sm flex-1 ${isListening ? 'border-indigo-500 ring-2 ring-indigo-500/30' : ''}`}
            />
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={toggleListening}
                  title={isListening ? 'Stop Listening' : 'Start Voice Dictation'}
                  className={`p-2.5 rounded-xl border transition-all ${
                    isListening
                      ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                </button>

                <button
                  type="button"
                  onClick={sendMessage}
                  disabled={!input.trim() || isTyping}
                  className="btn-gradient px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm disabled:opacity-50"
                >
                  <Send size={14} />
                </button>
              </div>

              <div className="flex justify-between items-center gap-2">
                <button
                  type="button"
                  onClick={() => setVoiceEnabled(!voiceEnabled)}
                  className={`text-[10px] px-2 py-0.5 rounded border ${
                    voiceEnabled ? 'border-indigo-500/40 text-indigo-300 bg-indigo-500/10' : 'border-white/10 text-slate-500'
                  }`}
                >
                  {voiceEnabled ? '🔊 AI Voice On' : '🔇 Muted'}
                </button>

                <button
                  type="button"
                  onClick={finishInterview}
                  className="px-2 py-0.5 rounded border border-white/10 text-slate-500 hover:text-white text-[10px] transition-all"
                >
                  End
                </button>
              </div>
            </div>
          </div>


          {/* Score bar */}
          <div className="flex gap-4 mt-3 text-xs text-slate-500">
            {[['Technical', scores.technical, '#6366f1'], ['Communication', scores.communication, '#8b5cf6'], ['Confidence', scores.confidence, '#3b82f6']].map(([l, v, c]) => (
              <div key={l as string} className="flex items-center gap-2 flex-1">
                <span>{l as string}</span>
                <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${v}%`, background: c as string }} />
                </div>
                <span>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <TopBar title="Mock Interview" subtitle="AI-powered company-specific rounds" />
      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex gap-2">
            {(['start', 'history'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${activeTab === tab ? 'tab-active' : 'tab-inactive'}`}>
                {tab === 'start' ? 'New Interview' : 'Past Sessions'}
              </button>
            ))}
          </div>

          <a
            href="/peer-interview"
            className="px-4 py-2 rounded-xl btn-gradient text-xs font-bold text-white flex items-center gap-1.5 shadow-md hover:scale-105 transition-all"
          >
            <Users size={14} /> Peer Mock Interview 🤝
          </a>
        </div>


        {activeTab === 'start' && (
          <div className="max-w-2xl space-y-5">
            <div className="glass-card p-6">
              <h3 className="font-semibold text-white mb-4">Configure Interview</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">Select Company</label>
                  <div className="flex flex-wrap gap-2">
                    {COMPANIES_LIST.map(c => (
                      <button key={c} onClick={() => setCompany(c)}
                        className={`text-sm px-3 py-2 rounded-xl border transition-all ${company === c ? 'tab-active' : 'tab-inactive'}`}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">Interview Round</label>
                  <div className="flex flex-wrap gap-2">
                    {ROUNDS.map(r => (
                      <button key={r} onClick={() => setRound(r)}
                        className={`text-sm px-3 py-2 rounded-xl border transition-all ${round === r ? 'tab-active' : 'tab-inactive'}`}>
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 p-4 rounded-xl bg-white/3 border border-white/6">
                <div className="text-xs text-slate-400 mb-3">Interview Preview</div>
                <div className="flex gap-3 flex-wrap text-xs">
                  <span className="badge badge-indigo">{company}</span>
                  <span className="badge badge-purple">{round}</span>
                  <span className="badge badge-blue">{getQuestions().length} questions</span>
                  <span className="badge badge-cyan">~30-45 min</span>
                </div>
                <div className="mt-3 text-xs text-slate-500">
                  First question: "{getQuestions()[0]?.slice(0, 80)}..."
                </div>
              </div>

              <motion.button whileHover={{ scale: 1.02 }} onClick={startInterview}
                className="btn-gradient w-full py-3.5 mt-4 flex items-center justify-center gap-2">
                <MessageSquare size={16} /> Start Mock Interview
              </motion.button>
            </div>

            <div className="glass-card p-5 border-indigo-500/20 bg-indigo-500/5">
              <h3 className="font-semibold text-white mb-2">How it works</h3>
              <div className="space-y-2 text-sm text-slate-400">
                {['AI acts as a real interviewer from your chosen company', 'Asks follow-up questions based on your answers', 'Evaluates technical depth, communication, and confidence', 'Provides detailed feedback and improvement suggestions'].map((t, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-indigo-400 flex-shrink-0" />
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            {(interviewSessions.length > 0 ? interviewSessions : MOCK_INTERVIEW_SESSIONS).map((session, i) => (
              <motion.div key={session.id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                className="glass-card p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-white text-base">{session.company}</span>
                      <span className="badge badge-indigo">{session.round} Round</span>
                      <span className="badge bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 text-xs">Evaluated</span>
                    </div>
                    <div className="text-xs text-slate-500">{session.date} • {session.duration} min</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold gradient-text">{session.score}/100</div>
                    <div className={`flex gap-1 mt-1 justify-end`}>
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} size={12} className={j < Math.floor(session.score / 20) ? 'text-amber-400 fill-amber-400' : 'text-slate-700'} />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-3 bg-white/3 p-3 rounded-xl border border-white/5">
                  {[['Technical', session.technicalScore], ['Communication', session.communicationScore], ['Confidence', session.confidenceScore]].map(([l, v]) => (
                    <div key={l as string} className="text-center">
                      <div className="text-sm font-semibold text-white">{v}%</div>
                      <div className="text-[11px] text-slate-400">{l as string}</div>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-slate-300 mb-3 leading-relaxed bg-indigo-500/5 p-3 rounded-lg border border-indigo-500/10">
                  <span className="font-semibold text-indigo-300">AI Feedback: </span>{session.feedback}
                </p>

                <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-white/5">
                  <div className="flex flex-wrap gap-1.5">
                    {session.improvements.map((imp: string, j: number) => (
                      <span key={j} className="text-xs px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        → {imp}
                      </span>
                    ))}
                  </div>

                  <button onClick={() => setSelectedReviewSession(session)}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30 text-xs font-medium transition-all ml-auto">
                    Review Responses & Transcript 📖
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Detailed Session & Transcript Review Modal */}
        <AnimatePresence>
          {selectedReviewSession && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                className="glass-card max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden bg-slate-900 border-indigo-500/30 shadow-2xl">
                
                <div className="p-5 border-b border-white/10 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-heading font-bold text-white text-lg">
                        {selectedReviewSession.company} — {selectedReviewSession.round} Round Review
                      </h3>
                      <span className="badge badge-indigo">{selectedReviewSession.score}/100</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{selectedReviewSession.date} • Evaluated AI Session</p>
                  </div>
                  <button onClick={() => setSelectedReviewSession(null)}
                    className="p-2 rounded-xl text-slate-400 hover:text-white bg-white/5 transition-colors">
                    ✕
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  {/* Scores Summary */}
                  <div className="grid grid-cols-3 gap-3 glass-card p-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-indigo-400">{selectedReviewSession.technicalScore}%</div>
                      <div className="text-xs text-slate-400">Technical Depth</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-purple-400">{selectedReviewSession.communicationScore}%</div>
                      <div className="text-xs text-slate-400">Communication</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-blue-400">{selectedReviewSession.confidenceScore}%</div>
                      <div className="text-xs text-slate-400">Confidence</div>
                    </div>
                  </div>

                  {/* AI Recommendations */}
                  <div className="glass-card p-4 border-amber-500/20 bg-amber-500/5">
                    <h4 className="font-semibold text-amber-300 text-xs uppercase tracking-wider mb-2">
                      Key Recommendations & Action Items
                    </h4>
                    <div className="space-y-1.5 text-xs text-amber-200">
                      {selectedReviewSession.improvements?.map((imp: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span>💡</span> {imp}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Conversation Transcript */}
                  <div>
                    <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-3">
                      Candidate & Interviewer Transcript Log
                    </h4>
                    <div className="space-y-3">
                      {Array.isArray(selectedReviewSession.transcript) && selectedReviewSession.transcript.length > 0 ? (
                        selectedReviewSession.transcript.map((item: any, idx: number) => (
                          <div key={idx} className={`p-3.5 rounded-xl text-xs leading-relaxed ${
                            item.role === 'candidate' ? 'bg-indigo-500/15 border border-indigo-500/25 ml-6 text-indigo-100' :
                            item.role === 'interviewer' ? 'bg-white/5 border border-white/10 mr-6 text-slate-200' :
                            'bg-white/3 text-slate-400 text-center italic'
                          }`}>
                            <div className="font-bold text-[10px] text-slate-400 mb-1 capitalize">
                              {item.role === 'candidate' ? '👤 Candidate (You)' : item.role === 'interviewer' ? `🤖 ${selectedReviewSession.company} Interviewer` : 'System Notice'}
                            </div>
                            <div className="whitespace-pre-line">{item.content || item.message || ''}</div>
                          </div>
                        ))
                      ) : (
                        <div className="text-xs text-slate-500 italic p-3 text-center">
                          Transcript recorded and stored in AI evaluation database.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t border-white/10 flex justify-end">
                  <button onClick={() => setSelectedReviewSession(null)}
                    className="btn-gradient px-5 py-2 text-xs rounded-xl">
                    Close Review
                  </button>
                </div>

              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
