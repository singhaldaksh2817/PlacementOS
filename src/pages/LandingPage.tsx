import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  Zap, Brain, Code2, MessageSquare, Map, Building2, FileText,
  ArrowRight, Star, Users, Trophy, BarChart3, CheckCircle,
  ChevronRight, Cpu, Sparkles, Target, TrendingUp
} from 'lucide-react';

const features = [
  { icon: Code2, title: 'DSA Tracker', desc: 'Track 500+ problems with AI-powered hints, explanations, and weakness detection', color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  { icon: Brain, title: 'Aptitude Agent', desc: 'Adaptive MCQ engine with 1000+ questions across quantitative, logical, and CS domains', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { icon: MessageSquare, title: 'Mock Interview', desc: 'AI interviewer simulating Google, Amazon, Microsoft rounds with real-time feedback', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { icon: Map, title: 'Smart Roadmap', desc: 'Personalized daily/weekly plans that auto-reschedule when you miss tasks', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { icon: Building2, title: 'Company Intel', desc: 'Database of 50+ companies with hiring patterns, OA analysis, and readiness scores', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { icon: FileText, title: 'Resume AI', desc: 'ATS scoring, keyword optimization, and company-specific resume generation', color: 'text-pink-400', bg: 'bg-pink-500/10' },
];

const stats = [
  { value: '50,000+', label: 'Students Placed' },
  { value: '200+', label: 'Companies Tracked' },
  { value: '1M+', label: 'Problems Solved' },
  { value: '95%', label: 'Satisfaction Rate' },
];

const testimonials = [
  { name: 'Priya Nair', college: 'NIT Trichy', company: 'Google', quote: 'PlacementOS got me my dream job at Google. The DSA Agent identified my weak topics and the mock interviews built my confidence.', avatar: 'P' },
  { name: 'Rohit Verma', college: 'BITS Pilani', company: 'Microsoft', quote: 'The Roadmap Agent scheduled everything perfectly. I just followed the plan and got placed at Microsoft!', avatar: 'R' },
  { name: 'Sneha Gupta', college: 'VIT Vellore', company: 'Amazon', quote: 'The Company Agent predicted my shortlisting probability accurately. Got placed at Amazon in the first drive!', avatar: 'S' },
];

const agents = [
  { name: 'DSA Agent', color: '#6366f1', status: 'Analyzing your Graphs weakness...' },
  { name: 'Roadmap Agent', color: '#8b5cf6', status: 'Rescheduling missed tasks...' },
  { name: 'Interview Agent', color: '#3b82f6', status: 'Preparing Google mock interview...' },
  { name: 'Company Agent', color: '#06b6d4', status: 'Calculating shortlist probability...' },
  { name: 'Resume Agent', color: '#10b981', status: 'Optimizing ATS keywords...' },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen animated-bg text-white overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 backdrop-blur-xl bg-dark-200/60">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-500 flex items-center justify-center">
              <Zap size={18} className="text-white" />
            </div>
            <span className="font-heading font-bold text-xl gradient-text">PlacementOS</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#agents" className="hover:text-white transition-colors">AI Agents</a>
            <a href="#testimonials" className="hover:text-white transition-colors">Reviews</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-slate-400 hover:text-white transition-colors px-4 py-2">Sign In</Link>
            <Link to="/signup">
              <motion.button whileHover={{ scale: 1.05 }} className="btn-gradient text-sm px-4 py-2">
                Get Started Free
              </motion.button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute top-40 right-1/4 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
        </div>

        <div className="max-w-5xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-6"
          >
            <Sparkles size={14} className="text-indigo-400" />
            <span className="text-sm text-indigo-300 font-medium">5 AI Agents working 24/7 for your placement</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-heading text-6xl md:text-7xl font-bold leading-tight"
          >
            Get Placed at Your{' '}
            <span className="gradient-text">Dream Company</span>
            <br />with AI Agents
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed"
          >
            PlacementOS is the world's first multi-agent AI platform that prepares you for placements
            end-to-end — from DSA to mock interviews to resume optimization — all personalized to your target companies.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-4 mt-10"
          >
            <Link to="/signup">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(99,102,241,0.4)' }}
                whileTap={{ scale: 0.98 }}
                className="btn-gradient flex items-center gap-2 px-8 py-4 text-base rounded-xl"
              >
                Start Free — No Credit Card <ArrowRight size={18} />
              </motion.button>
            </Link>
            <Link to="/login">
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 px-6 py-4 rounded-xl border border-white/15 text-slate-300 hover:bg-white/5 transition-all text-base"
              >
                Live Demo <ChevronRight size={16} />
              </motion.button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-6 mt-8 text-sm text-slate-500"
          >
            {['No credit card required', 'Free forever plan', '5 AI agents included'].map((t, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <CheckCircle size={14} className="text-emerald-500" />
                <span>{t}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Floating Agent Cards */}
        <div className="max-w-5xl mx-auto mt-16 relative">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-6 mx-auto max-w-3xl"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-emerald-400 font-medium">5 Agents Active</span>
              <span className="text-xs text-slate-600 ml-auto">Last sync: just now</span>
            </div>
            <div className="space-y-3">
              {agents.map((agent, i) => (
                <motion.div
                  key={agent.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/5"
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${agent.color}20`, border: `1px solid ${agent.color}30` }}>
                    <Cpu size={14} style={{ color: agent.color }} />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-white">{agent.name}</div>
                    <div className="text-xs text-slate-500">{agent.status}</div>
                  </div>
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: agent.color }} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 border-y border-white/5">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="font-heading text-4xl font-bold gradient-text">{s.value}</div>
              <div className="text-sm text-slate-500 mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="badge badge-indigo mb-4 inline-block"
            >
              Features
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-heading text-4xl font-bold text-white"
            >
              Everything you need to get placed
            </motion.h2>
            <p className="text-slate-400 mt-3 text-lg">6 powerful modules, all connected by AI agents</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="glass-card glass-card-hover p-6"
              >
                <div className={`p-3 rounded-xl ${f.bg} inline-block mb-4`}>
                  <f.icon size={22} className={f.color} />
                </div>
                <h3 className="font-heading font-bold text-lg text-white mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Workflow */}
      <section id="agents" className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/3 to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="badge badge-purple mb-4 inline-block">AI Workflow</span>
            <h2 className="font-heading text-4xl font-bold text-white">How the agents collaborate</h2>
            <p className="text-slate-400 mt-3">5 specialized agents working together, all day, every day</p>
          </div>
          <div className="space-y-4">
            {[
              { agent: 'Roadmap Agent', action: 'Creates your personalized 90-day placement plan based on target companies and CGPA', icon: Map, color: '#6366f1' },
              { agent: 'DSA Agent', action: 'Monitors your coding progress, detects weak topics, and recommends daily problems', icon: Code2, color: '#8b5cf6' },
              { agent: 'Aptitude Agent', action: 'Generates adaptive tests and improves speed/accuracy with daily challenges', icon: Brain, color: '#3b82f6' },
              { agent: 'Interview Agent', action: 'Conducts company-specific mock interviews and provides STAR evaluation feedback', icon: MessageSquare, color: '#06b6d4' },
              { agent: 'Company Agent', action: 'Tracks 200+ companies, predicts shortlist probability, and alerts on deadlines', icon: Building2, color: '#10b981' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="glass-card p-5 flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${item.color}15`, border: `1px solid ${item.color}25` }}>
                  <item.icon size={20} style={{ color: item.color }} />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-white">{item.agent}</div>
                  <div className="text-sm text-slate-400 mt-0.5">{item.action}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: item.color }} />
                  <span className="text-xs text-slate-500">Active</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="badge badge-emerald mb-4 inline-block">Success Stories</span>
            <h2 className="font-heading text-4xl font-bold text-white">Students who got placed</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                viewport={{ once: true }}
                className="glass-card p-6"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} size={14} className="text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-4">"{t.quote}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-white/6">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-sm">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-white text-sm">{t.name}</div>
                    <div className="text-xs text-slate-500">{t.college} → <span className="text-indigo-400">{t.company}</span></div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <span className="badge badge-blue mb-4 inline-block">Pricing</span>
            <h2 className="font-heading text-4xl font-bold text-white">Simple, transparent pricing</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                name: 'Free', price: '₹0', period: '/forever',
                features: ['DSA Tracker (100 problems)', 'Basic Aptitude Tests', '3 Mock Interviews/month', 'Company Database', 'Basic Analytics'],
                cta: 'Get Started', highlight: false,
              },
              {
                name: 'Pro', price: '₹499', period: '/month',
                features: ['Unlimited DSA Problems', 'Full Aptitude Suite', 'Unlimited Mock Interviews', 'AI Resume Analysis', 'All 5 AI Agents', 'Priority Support', 'Leaderboard'],
                cta: 'Start Pro Trial', highlight: true,
              },
            ].map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className={`glass-card p-6 relative ${plan.highlight ? 'border-indigo-500/40 bg-indigo-500/5' : ''}`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="badge badge-indigo text-xs px-3 py-1">Most Popular</span>
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="font-heading font-bold text-lg text-white">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="font-heading text-4xl font-bold gradient-text">{plan.price}</span>
                    <span className="text-slate-500 text-sm">{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-2.5 mb-6">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-slate-300">
                      <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/signup">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${
                      plan.highlight ? 'btn-gradient' : 'border border-white/15 text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    {plan.cta}
                  </motion.button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-card p-12 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-blue-500/10 pointer-events-none" />
            <div className="relative">
              <h2 className="font-heading text-4xl font-bold text-white mb-4">
                Start your placement journey today
              </h2>
              <p className="text-slate-400 mb-8 text-lg">Join 50,000+ students who chose the smarter way to prepare</p>
              <Link to="/signup">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 20px 50px rgba(99,102,241,0.5)' }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-gradient px-10 py-4 text-base flex items-center gap-2 mx-auto"
                >
                  Get Started — It's Free <ArrowRight size={18} />
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Zap size={14} className="text-white" />
            </div>
            <span className="font-heading font-bold gradient-text">PlacementOS</span>
          </div>
          <p className="text-slate-600 text-sm">© 2025 PlacementOS. Built with ❤️ for students.</p>
          <div className="flex gap-6 text-sm text-slate-500">
            <a href="#" className="hover:text-slate-300 transition-colors">Privacy</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Terms</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
