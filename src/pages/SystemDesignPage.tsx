import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TopBar from '../components/layout/TopBar';
import {
  Layers, Server, Database, Cpu, Zap, Calculator,
  CheckCircle, ArrowRight, BookOpen, ShieldCheck, Sparkles
} from 'lucide-react';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';
import ProLockOverlay from '../components/ui/ProLockOverlay';


interface CaseStudy {
  id: string;
  title: string;
  category: 'Distributed' | 'Web Scale' | 'Real-time' | 'Storage';
  difficulty: 'Medium' | 'Hard';
  companies: string[];
  qps: string;
  storage: string;
  summary: string;
  keyComponents: string[];
  architectureOverview: string;
  quiz: {
    question: string;
    options: string[];
    correct: number;
    explanation: string;
  };
}

const CASE_STUDIES: CaseStudy[] = [
  {
    id: 'rate-limiter',
    title: 'Design an API Rate Limiter',
    category: 'Distributed',
    difficulty: 'Medium',
    companies: ['Stripe', 'Google', 'Amazon'],
    qps: '50,000 req/sec',
    storage: 'Redis Memory',
    summary: 'Prevent API abuse, DDoS attacks, and resource starvation by throttling user requests based on IP, API Key, or User ID.',
    keyComponents: ['API Gateway', 'Redis Cluster', 'Token Bucket Algorithm', 'Rule Config Storage'],
    architectureOverview: 'Client requests hit the API Gateway. The Rate Limiter middleware checks the Redis cluster using the Token Bucket or Sliding Window Log algorithm. If tokens exist, request proceeds to microservices; otherwise returns HTTP 429 Too Many Requests.',
    quiz: {
      question: 'Which rate limiting algorithm allows bursts of traffic while enforcing an average rate limit efficiently in memory?',
      options: ['Leaky Bucket', 'Token Bucket', 'Fixed Window Counter', 'Sliding Window Log'],
      correct: 1,
      explanation: 'Token Bucket allows traffic bursts up to the bucket capacity while refilling tokens at a constant rate, making it ideal for web APIs.'
    }
  },
  {
    id: 'url-shortener',
    title: 'Design a URL Shortener (TinyURL)',
    category: 'Web Scale',
    difficulty: 'Medium',
    companies: ['Google', 'Microsoft', 'Uber'],
    qps: '100,000 reads/sec, 10,000 writes/sec',
    storage: '3.6 TB / 5 years',
    summary: 'Create short 7-character alias URLs for long web addresses with high availability, low latency, and 301/302 redirects.',
    keyComponents: ['Base62 Encoding', 'Key Generation Service (KGS)', 'Redis Cache Layer', 'NoSQL DB (Cassandra/DynamoDB)'],
    architectureOverview: 'Uses Base62 encoding (a-z, A-Z, 0-9) to convert auto-increment IDs into 7-char keys (62^7 = 3.5 Trillion URLs). Read requests check Redis first for O(1) cache lookup, redirecting with HTTP 301 (permanent) or 302 (temporary for analytics).',
    quiz: {
      question: 'Why is Base62 encoding preferred over Base64 for URL shortening?',
      options: ['It uses 128-bit encryption', 'It avoids special characters like "+" and "/" which require URL escaping', 'It compresses text size by 50%', 'It runs faster on CPUs'],
      correct: 1,
      explanation: 'Base62 only uses alphanumeric characters (0-9, a-z, A-Z), making shortened URLs clean and safe for browsers without needing URL parameter encoding.'
    }
  },
  {
    id: 'uber-backend',
    title: 'Design Uber / Ride Sharing Backend',
    category: 'Real-time',
    difficulty: 'Hard',
    companies: ['Uber', 'Lyft', 'Grab'],
    qps: '500,000 location updates/sec',
    storage: 'Spatial Index (Geohash / H3)',
    summary: 'Match riders with nearby drivers in real-time with sub-second latency, route calculation, and surge pricing.',
    keyComponents: ['Geohash / QuadTree Index', 'WebSocket Connections', 'Kafka Event Bus', 'Redis Location Buffer'],
    architectureOverview: 'Drivers send GPS coords every 4 seconds over WebSockets. Nearby driver queries use Geohash spatial partitioning to match riders within a 3km radius in O(1) time without scanning global databases.',
    quiz: {
      question: 'What data structure or indexing algorithm allows Uber to query drivers within a 3km radius in sub-milliseconds?',
      options: ['B-Tree Index', 'Geohash / QuadTree Indexing', 'Graph Traversal BFS', 'Full Text Search Index'],
      correct: 1,
      explanation: 'Geohash divides the 2D earth surface into 1D grid buckets, allowing fast prefix-based spatial range queries for nearby drivers.'
    }
  },
  {
    id: 'youtube-streaming',
    title: 'Design YouTube Video Streaming',
    category: 'Storage',
    difficulty: 'Hard',
    companies: ['Google', 'Netflix', 'Amazon Prime'],
    qps: '1,000,000 stream requests/sec',
    storage: '100 PB Blob Storage + CDN',
    summary: 'Process video uploads, encode into multiple resolutions (1080p, 720p, 4K), and stream globally with Adaptive Bitrate Streaming (HLS/DASH).',
    keyComponents: ['CDN Edge Servers', 'HLS / DASH Transcoder', 'AWS S3 Blob Storage', 'Metadata Database'],
    architectureOverview: 'Uploaded raw videos trigger distributed transcoders to output chunks (4-second segments) in HLS format across 240p-4K resolutions. Content is pushed to CDN edge caches near users for ultra-fast buffer-free playback.',
    quiz: {
      question: 'What mechanism allows video players to automatically downgrade resolution from 1080p to 480p when network connection degrades?',
      options: ['UDP Multicast', 'Adaptive Bitrate Streaming (HLS / DASH)', 'FFmpeg Encoding', 'TCP Socket Framing'],
      correct: 1,
      explanation: 'Adaptive Bitrate Streaming splits videos into small chunks encoded at different bitrates; the video player dynamically fetches lower bitrate chunks if bandwidth drops.'
    }
  }
];

const ARCH_BLOCKS = [
  { name: 'Load Balancer', type: 'Networking', desc: 'Distributes incoming traffic evenly across app servers using Round Robin, Least Connections, or Consistent Hashing.', icon: '⚖️' },
  { name: 'Redis Cache', type: 'In-Memory DB', desc: 'Sub-millisecond in-memory cache for hot data, session tokens, rate limiting counters, and pub/sub messaging.', icon: '⚡' },
  { name: 'Apache Kafka', type: 'Message Queue', desc: 'Distributed event streaming platform for async task processing, log aggregation, and decoupled microservices.', icon: '📨' },
  { name: 'CDN Edge', type: 'Content Delivery', desc: 'Geographically distributed proxy servers caching static assets (images, JS, video chunks) close to users.', icon: '🌐' },
  { name: 'Database Sharding', type: 'Data Storage', desc: 'Horizontal partitioning of large databases across multiple DB instances using a shard key.', icon: '🗄️' },
  { name: 'API Gateway', type: 'Security & Routing', desc: 'Single entry point for client requests handling authentication, rate limiting, logging, and SSL termination.', icon: '🛡️' },
];

export default function SystemDesignPage() {
  const { addXP } = useStore();
  const [activeTab, setActiveTab] = useState<'cases' | 'calculator' | 'blocks'>('cases');
  const [selectedCase, setSelectedCase] = useState<CaseStudy>(CASE_STUDIES[0]);
  const [quizSelected, setQuizSelected] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Capacity Calculator state
  const [dau, setDau] = useState<number>(10000000); // 10M DAU
  const [readsPerUser, setReadsPerUser] = useState<number>(20);
  const [writesPerUser, setWritesPerUser] = useState<number>(2);
  const [payloadKB, setPayloadKB] = useState<number>(5); // 5 KB

  // Calculator results
  const totalDailyRequests = dau * (readsPerUser + writesPerUser);
  const avgQPS = Math.round(totalDailyRequests / 86400);
  const peakQPS = avgQPS * 2;
  const dailyStorageGB = ((dau * writesPerUser * payloadKB) / (1024 * 1024)).toFixed(2);
  const fiveYearStorageTB = ((parseFloat(dailyStorageGB) * 365 * 5) / 1024).toFixed(2);
  const bandwidthMbps = ((avgQPS * payloadKB * 8) / 1024).toFixed(2);

  const handleQuizSubmit = (optIdx: number) => {
    if (quizSubmitted) return;
    setQuizSelected(optIdx);
    setQuizSubmitted(true);
    if (optIdx === selectedCase.quiz.correct) {
      toast.success('Correct answer! +100 XP earned! 🎉');
      addXP(100);
    } else {
      toast.error('Incorrect. Read the explanation below!');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto relative">
      <ProLockOverlay
        featureName="Interactive System Design Studio"
        description="Master Rate Limiter, Uber, TinyURL, and YouTube architectures with Back-of-the-Envelope Capacity Calculators."
      />
      <TopBar title="System Design Studio 📐" subtitle="Master Tier-1 Distributed Architecture & System Capacity Estimations" />


      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Banner */}
        <div className="glass-card p-6 relative overflow-hidden bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900/60 border border-indigo-500/20">
          <div className="flex items-center justify-between relative z-10 flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="badge badge-indigo">SDE-2 & Tier-1 Special</span>
                <span className="badge badge-emerald">Interactive Studio</span>
              </div>
              <h1 className="text-2xl font-bold font-heading text-white">System Architecture & Scalability Masterclass</h1>
              <p className="text-sm text-slate-300 max-w-2xl mt-1">
                Learn how Google, Uber, Netflix, and Stripe scale systems to 100M+ users with low latency, high availability, and zero downtime.
              </p>
            </div>

            <div className="flex gap-2">
              {(['cases', 'calculator', 'blocks'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === tab ? 'tab-active' : 'tab-inactive'
                  }`}
                >
                  {tab === 'cases' ? '📚 Case Studies' : tab === 'calculator' ? '🧮 Capacity Estimator' : '🏗️ Architecture Blocks'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab 1: Case Studies */}
        {activeTab === 'cases' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left list of Case Studies */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-400">System Architecture Case Studies</h3>
              {CASE_STUDIES.map(cs => (
                <div
                  key={cs.id}
                  onClick={() => { setSelectedCase(cs); setQuizSelected(null); setQuizSubmitted(false); }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedCase.id === cs.id
                      ? 'bg-indigo-500/15 border-indigo-500/40 text-white shadow-lg'
                      : 'bg-white/3 border-white/8 hover:bg-white/6 hover:border-white/15 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-indigo-400">{cs.category}</span>
                    <span className={`badge text-[10px] ${cs.difficulty === 'Hard' ? 'badge-red' : 'badge-amber'}`}>{cs.difficulty}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{cs.title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1">{cs.summary}</p>
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    {cs.companies.map(c => (
                      <span key={c} className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-slate-300 border border-white/10">{c}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Right Detailed Inspector */}
            <div className="lg:col-span-2 space-y-5">
              <div className="glass-card p-6 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2 border-b border-white/8 pb-4">
                  <div>
                    <span className="text-xs text-indigo-400 font-semibold">{selectedCase.category} Architecture</span>
                    <h2 className="text-xl font-bold text-white">{selectedCase.title}</h2>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-xs text-slate-400">Target QPS</div>
                      <div className="text-xs font-mono font-bold text-emerald-400">{selectedCase.qps}</div>
                    </div>
                    <div className="text-right border-l border-white/10 pl-3">
                      <div className="text-xs text-slate-400">Storage</div>
                      <div className="text-xs font-mono font-bold text-purple-400">{selectedCase.storage}</div>
                    </div>
                  </div>
                </div>

                {/* Problem Summary */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">System Requirement</h4>
                  <p className="text-sm text-slate-200 leading-relaxed">{selectedCase.summary}</p>
                </div>

                {/* Key Architecture Components */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Core Components</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedCase.keyComponents.map((comp, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2.5 rounded-lg bg-white/4 border border-white/8 text-xs text-slate-200">
                        <Cpu size={14} className="text-indigo-400 flex-shrink-0" />
                        <span>{comp}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* High Level Architecture Overview */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Data Flow & High Level Architecture</h4>
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-indigo-500/20 text-xs text-slate-300 leading-relaxed font-mono">
                    {selectedCase.architectureOverview}
                  </div>
                </div>

                {/* Interactive System Design Quiz */}
                <div className="pt-3 border-t border-white/8">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles size={16} className="text-amber-400" />
                    <h4 className="text-sm font-bold text-white">System Design Round Quiz (+100 XP)</h4>
                  </div>
                  <p className="text-xs text-slate-300 font-medium mb-3">{selectedCase.quiz.question}</p>

                  <div className="space-y-2">
                    {selectedCase.quiz.options.map((opt, i) => {
                      const isCorrect = i === selectedCase.quiz.correct;
                      const isSelected = i === quizSelected;
                      return (
                        <button
                          key={i}
                          onClick={() => handleQuizSubmit(i)}
                          disabled={quizSubmitted}
                          className={`w-full text-left p-3 rounded-xl border text-xs font-medium transition-all ${
                            !quizSubmitted
                              ? 'bg-white/4 border-white/10 hover:bg-white/8 text-slate-200'
                              : isCorrect
                              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-semibold'
                              : isSelected
                              ? 'bg-red-500/20 border-red-500/50 text-red-300'
                              : 'bg-white/2 border-white/5 text-slate-500'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{String.fromCharCode(65 + i)}. {opt}</span>
                            {quizSubmitted && isCorrect && <CheckCircle size={14} className="text-emerald-400" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {quizSubmitted && (
                    <div className="mt-3 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-200">
                      💡 <span className="font-semibold text-white">Explanation:</span> {selectedCase.quiz.explanation}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Capacity Estimator */}
        {activeTab === 'calculator' && (
          <div className="glass-card p-6 space-y-6">
            <div className="flex items-center gap-2 border-b border-white/8 pb-4">
              <Calculator size={20} className="text-indigo-400" />
              <div>
                <h3 className="text-lg font-bold text-white">Back-of-the-Envelope Capacity Estimator</h3>
                <p className="text-xs text-slate-400">Calculate QPS, storage requirements, and network bandwidth live for your System Design interview!</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-medium">Daily Active Users (DAU)</label>
                <input
                  type="number"
                  value={dau}
                  onChange={e => setDau(Math.max(1000, Number(e.target.value)))}
                  className="input-dark text-xs font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-medium">Read Requests / User / Day</label>
                <input
                  type="number"
                  value={readsPerUser}
                  onChange={e => setReadsPerUser(Math.max(1, Number(e.target.value)))}
                  className="input-dark text-xs font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-medium">Write Requests / User / Day</label>
                <input
                  type="number"
                  value={writesPerUser}
                  onChange={e => setWritesPerUser(Math.max(0, Number(e.target.value)))}
                  className="input-dark text-xs font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-medium">Average Request Payload (KB)</label>
                <input
                  type="number"
                  value={payloadKB}
                  onChange={e => setPayloadKB(Math.max(1, Number(e.target.value)))}
                  className="input-dark text-xs font-mono"
                />
              </div>
            </div>

            {/* Estimation Results */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-center">
                <div className="text-2xl font-bold font-mono text-indigo-300">{avgQPS.toLocaleString()}</div>
                <div className="text-xs text-slate-400 mt-1">Average QPS</div>
                <div className="text-[10px] text-indigo-400/70 mt-0.5">req / sec</div>
              </div>

              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center">
                <div className="text-2xl font-bold font-mono text-purple-300">{peakQPS.toLocaleString()}</div>
                <div className="text-xs text-slate-400 mt-1">Peak QPS (2x Avg)</div>
                <div className="text-[10px] text-purple-400/70 mt-0.5">req / sec</div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                <div className="text-2xl font-bold font-mono text-emerald-300">{fiveYearStorageTB} TB</div>
                <div className="text-xs text-slate-400 mt-1">5-Year DB Storage</div>
                <div className="text-[10px] text-emerald-400/70 mt-0.5">{dailyStorageGB} GB / day</div>
              </div>

              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                <div className="text-2xl font-bold font-mono text-amber-300">{bandwidthMbps} Mbps</div>
                <div className="text-xs text-slate-400 mt-1">Network Bandwidth</div>
                <div className="text-[10px] text-amber-400/70 mt-0.5">Continuous Ingress</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/3 border border-white/8 text-xs text-slate-300 space-y-1">
              <div className="font-semibold text-white">💡 System Design Interview Formula Tip:</div>
              <div>• <span className="font-mono text-indigo-300">1 Day = 86,400 seconds</span> (approx. 100,000 for quick mental math).</div>
              <div>• <span className="font-mono text-indigo-300">QPS = (DAU × Requests/User) ÷ 86,400</span></div>
              <div>• Always design server capacity for <span className="font-semibold text-amber-300">Peak QPS (2x to 3x Average QPS)</span>.</div>
            </div>
          </div>
        )}

        {/* Tab 3: Architecture Building Blocks */}
        {activeTab === 'blocks' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ARCH_BLOCKS.map((blk, i) => (
              <motion.div
                key={blk.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-5 space-y-2 hover:border-indigo-500/30 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{blk.icon}</span>
                  <span className="badge badge-indigo">{blk.type}</span>
                </div>
                <h4 className="text-base font-bold text-white">{blk.name}</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{blk.desc}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
