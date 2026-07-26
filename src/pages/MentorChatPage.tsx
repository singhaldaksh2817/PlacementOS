import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TopBar from '../components/layout/TopBar';
import { Send, Cpu, Trash2, Sparkles } from 'lucide-react';
import { useStore } from '../store/useStore';
import { supabase } from '../lib/supabaseClient';
import axios from 'axios';
import type { ChatMessage } from '../types';

const API_BASE = 'http://localhost:5000/api';

function renderFormattedContent(content: string) {
  const lines = content.split('\n');
  return lines.map((line, lineIdx) => {
    const trimmed = line.trim();
    if (!trimmed) return <div key={lineIdx} className="h-2" />;

    // Code block check
    if (trimmed.startsWith('```')) return null;

    // Bullet points (- or * or •)
    const isBullet = /^[•\-\*]\s/.test(trimmed) || /^\d+\.\s/.test(trimmed);
    const cleanLine = isBullet ? trimmed.replace(/^[•\-\*]\s|^\d+\.\s/, '') : line;

    // Parse **bold** parts
    const parts = cleanLine.split('**').map((part, i) =>
      i % 2 === 1 ? <strong key={i} className="text-white font-semibold">{part}</strong> : <span key={i}>{part}</span>
    );

    if (isBullet) {
      return (
        <div key={lineIdx} className="flex items-start gap-2 my-1 pl-1">
          <span className="text-indigo-400 font-bold flex-shrink-0 mt-0.5">•</span>
          <span className="flex-1">{parts}</span>
        </div>
      );
    }

    return <div key={lineIdx} className="my-0.5">{parts}</div>;
  });
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
          <Cpu size={14} className="text-white" />
        </div>
      )}
      <div className={`max-w-2xl ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? 'bg-indigo-500/25 border border-indigo-500/30 text-indigo-100 rounded-tr-sm'
            : 'bg-white/5 border border-white/8 text-slate-200 rounded-tl-sm space-y-1'
        }`}>
          {renderFormattedContent(message.content)}
        </div>
        <div className="text-xs text-slate-600 px-1">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </motion.div>
  );
}


const QUICK_ASKS = [
  { label: 'What should I study today?' },
  { label: 'Am I ready for Amazon?' },
  { label: 'Am I ready for Google?' },
  { label: 'My DSA weaknesses?' },
  { label: 'Interview tips for fresher?' },
  { label: 'Which companies to target?' },
  { label: 'When will I be placement ready?' },
  { label: 'How to improve my aptitude score?' },
];

export default function MentorChatPage() {
  const { chatMessages, addChatMessage, clearChat, user, progress, dsaStats, token } = useStore();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); };
  useEffect(() => { scrollToBottom(); }, [chatMessages, isTyping]);

  useEffect(() => {
    const loadHistory = async () => {
      if (!user?.id || user.id === 'demo-user-001') return;
      try {
        const { data } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('user_id', user.id)
          .eq('agent_type', 'mentor')
          .order('created_at', { ascending: true })
          .limit(50);
        if (data && data.length > 0) {
          const loaded = data.map((m: any) => ({
            id: m.id,
            role: m.role as 'user' | 'assistant',
            content: m.content,
            timestamp: new Date(m.created_at).toISOString(),
            agentType: 'mentor' as const,
          }));
          // Only replace if we have real history (more than the initial greeting)
          useStore.setState({ chatMessages: loaded });
        }
      } catch (err) {
        console.warn('Could not load chat history:', err);
      }
    };
    loadHistory();
  }, [user?.id]);

  const sendMessage = async (text?: string) => {
    const msgText = (text || input).trim();
    if (!msgText) return;
    setInput('');

    addChatMessage({ role: 'user', content: msgText, agentType: 'mentor' });
    setIsTyping(true);

    try {
      // Always get fresh Supabase token (handles page refresh)
      const { data: { session } } = await supabase.auth.getSession();
      const freshToken = session?.access_token || token || 'demo-token';

      const res = await axios.post(
        `${API_BASE}/ai/chat`,
        { message: msgText },
        { headers: { Authorization: `Bearer ${freshToken}` } }
      );
      addChatMessage({ role: 'assistant', content: res.data.reply, agentType: 'mentor' });
    } catch (err: any) {
      const serverReply = err?.response?.data?.reply;
      addChatMessage({
        role: 'assistant',
        content: serverReply || '⚠️ Cannot reach the AI backend. Make sure the server is running on port 5000.',
        agentType: 'mentor'
      });
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar title="AI Mentor" subtitle="Your personalized placement coach" />
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Info */}
        <div className="hidden lg:flex flex-col w-64 border-r border-white/5 p-4 space-y-4 overflow-y-auto bg-dark-300/50">
          <div>
            <div className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Mentor knows</div>
            <div className="space-y-2 text-xs text-slate-400">
              {[
                `🎯 Target: ${(user?.targetCompanies || ['Google', 'Amazon']).join(', ')}`,
                `📊 Placement Score: ${progress.placementScore}/100`,
                `💻 DSA: ${dsaStats.totalSolved} problems solved`,
                `🏆 Level ${progress.level} • ${progress.xp.toLocaleString()} XP`,
                `🔥 ${progress.streak} day streak`,
                `⚠️ Weak: ${dsaStats.weakTopics.slice(0,2).join(', ')}`,
                `✅ Strong: ${dsaStats.strongTopics.slice(0,2).join(', ')}`,
              ].map((info, i) => (
                <div key={i} className="p-2 rounded-lg bg-white/3 border border-white/5">{info}</div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Quick Ask</div>
            <div className="space-y-1.5">
              {QUICK_ASKS.map(qa => (
                <button key={qa.label} onClick={() => sendMessage(qa.label)}
                  className="w-full text-left text-xs px-3 py-2 rounded-lg bg-white/3 border border-white/5 text-slate-400 hover:text-white hover:bg-indigo-500/10 hover:border-indigo-500/25 transition-all">
                  {qa.label}
                </button>
              ))}
            </div>
          </div>

          <button onClick={clearChat}
            className="flex items-center gap-2 text-xs text-red-400 hover:text-red-300 transition-colors p-2 rounded-lg hover:bg-red-500/10">
            <Trash2 size={12} /> Clear conversation
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {chatMessages.length === 1 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="text-center py-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
                  <Sparkles size={28} className="text-white" />
                </div>
                <h2 className="font-heading text-xl font-bold text-white mb-2">AI Mentor Active</h2>
                <p className="text-slate-400 text-sm max-w-md mx-auto">
                  I have complete context about your preparation journey. Ask me anything about your DSA progress,
                  target companies, interview readiness, or study plan.
                </p>
                <div className="flex flex-wrap gap-2 justify-center mt-6">
                  {QUICK_ASKS.slice(0, 4).map(qa => (
                    <button key={qa.label} onClick={() => sendMessage(qa.label)}
                      className="text-sm px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 hover:bg-indigo-500/20 transition-all">
                      {qa.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {chatMessages.map(msg => <ChatBubble key={msg.id} message={msg} />)}

            {isTyping && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <Cpu size={14} className="text-white" />
                </div>
                <div className="px-4 py-3 bg-white/5 border border-white/8 rounded-2xl rounded-tl-sm flex gap-1.5 items-center">
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-white/6">
            <div className="glass-card p-3 flex gap-3">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder="Ask your AI mentor anything... (Enter to send)"
                rows={2}
                className="input-dark resize-none text-sm flex-1 bg-transparent border-0 shadow-none focus:shadow-none focus:border-0"
              />
              <button onClick={() => sendMessage()} disabled={!input.trim() || isTyping}
                className="btn-gradient px-4 rounded-xl disabled:opacity-40 self-end">
                <Send size={16} />
              </button>
            </div>
            <div className="flex gap-2 mt-2 flex-wrap lg:hidden">
              {QUICK_ASKS.slice(0, 4).map(qa => (
                <button key={qa.label} onClick={() => sendMessage(qa.label)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-white/4 border border-white/8 text-slate-400 hover:text-white hover:bg-indigo-500/10 transition-all">
                  {qa.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
