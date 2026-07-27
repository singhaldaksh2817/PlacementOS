import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Users, BookOpen, Briefcase, Cpu, Activity, Search,
  Plus, CheckCircle, Trash2, Edit, Zap, LogOut, Lock, RefreshCw, Key,
  Megaphone, Bell, Database, Server, Terminal, DollarSign, Award, AlertTriangle, Filter, Check, Eye
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid
} from 'recharts';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface StudentUser {
  id: string;
  name: string;
  email: string;
  college: string;
  branch: string;
  year: number;
  xp: number;
  isPro: boolean;
  status: 'Active' | 'Flagged' | 'Suspended';
  targetCompany: string;
}

const INITIAL_STUDENTS: StudentUser[] = [
  { id: 'u1', name: 'Daksh Singhal', email: 'daksh@college.edu', college: 'IIT Bombay', branch: 'Computer Science', year: 3, xp: 14200, isPro: true, status: 'Active', targetCompany: 'Google' },
  { id: 'u2', name: 'Aarav Sharma', email: 'aarav@nit.edu', college: 'NIT Trichy', branch: 'Computer Science', year: 4, xp: 9800, isPro: false, status: 'Active', targetCompany: 'Amazon' },
  { id: 'u3', name: 'Ananya Verma', email: 'ananya@iiit.edu', college: 'IIIT Hyderabad', branch: 'ECE', year: 3, xp: 12400, isPro: true, status: 'Active', targetCompany: 'Microsoft' },
  { id: 'u4', name: 'Rohan Gupta', email: 'rohan@bits.edu', college: 'BITS Pilani', branch: 'Information Technology', year: 2, xp: 6500, isPro: false, status: 'Flagged', targetCompany: 'Uber' },
  { id: 'u5', name: 'Priya Patel', email: 'priya@dtu.edu', college: 'DTU Delhi', branch: 'Software Engineering', year: 4, xp: 15600, isPro: true, status: 'Active', targetCompany: 'Adobe' },
  { id: 'u6', name: 'Siddharth Rao', email: 'sid@nsut.edu', college: 'NSUT Delhi', branch: 'Computer Science', year: 3, xp: 11200, isPro: false, status: 'Active', targetCompany: 'NVIDIA' },
  { id: 'u7', name: 'Kavya Reddy', email: 'kavya@vnit.edu', college: 'VNIT Nagpur', branch: 'CSE', year: 4, xp: 18900, isPro: true, status: 'Active', targetCompany: 'Goldman Sachs' },
];

const REVENUE_DATA = [
  { month: 'Jan', freeUsers: 320, proUsers: 85, revenue: 42415 },
  { month: 'Feb', freeUsers: 450, proUsers: 140, revenue: 69860 },
  { month: 'Mar', freeUsers: 620, proUsers: 210, revenue: 104790 },
  { month: 'Apr', freeUsers: 840, proUsers: 330, revenue: 164670 },
  { month: 'May', freeUsers: 1050, proUsers: 420, revenue: 209580 },
  { month: 'Jun', freeUsers: 1248, proUsers: 482, revenue: 240518 },
];

const QUESTIONS_DATA = [
  { id: 'q1', title: 'Two Sum', difficulty: 'Easy', topic: 'Arrays', submissions: 1420, passRate: '88%' },
  { id: 'q2', title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', topic: 'Strings', submissions: 980, passRate: '72%' },
  { id: 'q3', title: 'Median of Two Sorted Arrays', difficulty: 'Hard', topic: 'Binary Search', submissions: 420, passRate: '41%' },
  { id: 'q4', title: 'Container With Most Water', difficulty: 'Medium', topic: 'Two Pointers', submissions: 850, passRate: '68%' },
  { id: 'q5', title: 'Trapping Rain Water', difficulty: 'Hard', topic: 'Dynamic Programming', submissions: 390, passRate: '38%' },
  { id: 'q6', title: 'Word Ladder Length', difficulty: 'Hard', topic: 'Graphs', submissions: 310, passRate: '32%' },
];

export default function AdminPage() {
  const { user, logout } = useStore();
  const navigate = useNavigate();
  const [adminTab, setAdminTab] = useState<'overview' | 'students' | 'broadcast' | 'questions' | 'drives' | 'system'>('overview');
  
  const [students, setStudents] = useState<StudentUser[]>(INITIAL_STUDENTS);
  const [studentFilter, setStudentFilter] = useState<'all' | 'pro' | 'free' | 'flagged'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentUser | null>(null);

  // Broadcast Announcement State
  const [annTitle, setAnnTitle] = useState('');
  const [annMessage, setAnnMessage] = useState('');
  const [annTarget, setAnnTarget] = useState('all');
  const [annType, setAnnType] = useState<'info' | 'urgent' | 'pro'>('info');

  // New Question State
  const [newQTitle, setNewQTitle] = useState('');
  const [newQDiff, setNewQDiff] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [newQTopic, setNewQTopic] = useState('Arrays');
  const [newQDesc, setNewQDesc] = useState('');

  // New Drive State
  const [newDriveCompany, setNewDriveCompany] = useState('');
  const [newDriveRole, setNewDriveRole] = useState('');
  const [newDriveCTC, setNewDriveCTC] = useState('');
  const [newDriveBatch, setNewDriveBatch] = useState('2025');

  // System Settings State
  const [geminiModel, setGeminiModel] = useState('gemini-1.5-flash');
  const [pistonStatus, setPistonStatus] = useState('Online (Latency 42ms)');

  const filteredStudents = students.filter(s => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.college.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (studentFilter === 'pro') return matchesSearch && s.isPro;
    if (studentFilter === 'free') return matchesSearch && !s.isPro;
    if (studentFilter === 'flagged') return matchesSearch && s.status === 'Flagged';
    return matchesSearch;
  });

  const toggleStudentPro = (id: string) => {
    setStudents(prev => prev.map(s => {
      if (s.id !== id) return s;
      const nextPro = !s.isPro;
      toast.success(`${s.name} status updated to ${nextPro ? 'PlacementOS Pro ⚡' : 'Free Tier 🟢'}`);
      return { ...s, isPro: nextPro };
    }));
  };

  const toggleStudentStatus = (id: string) => {
    setStudents(prev => prev.map(s => {
      if (s.id !== id) return s;
      const nextStatus = s.status === 'Active' ? 'Flagged' : 'Active';
      toast.success(`${s.name} status set to ${nextStatus}`);
      return { ...s, status: nextStatus };
    }));
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annMessage.trim()) return;
    toast.success(`📢 Broadcast "${annTitle}" dispatched to ${annTarget === 'all' ? 'all 1,248 students' : annTarget}!`);
    setAnnTitle('');
    setAnnMessage('');
  };

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQTitle.trim()) return;
    toast.success(`Question "${newQTitle}" published to live DSA question bank! 📚`);
    setNewQTitle('');
    setNewQDesc('');
  };

  const handleAddDrive = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDriveCompany.trim()) return;
    toast.success(`Off-Campus Drive for "${newDriveCompany}" (${newDriveRole}) published live! 💼`);
    setNewDriveCompany('');
    setNewDriveRole('');
    setNewDriveCTC('');
  };

  const handleFlushCache = () => {
    toast.success('Piston execution engine cache & WebRTC logs purged successfully! 🧹');
  };

  const handleBackupDB = () => {
    toast.success('Full database snapshot exported to encrypted cloud storage ☁️');
  };

  const handleAdminLogout = () => {
    logout();
    navigate('/login');
    toast.success('Admin logged out successfully');
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 flex flex-col font-sans">
      {/* Dedicated Admin Header */}
      <header className="px-6 py-4 border-b border-white/10 bg-slate-950 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-900/30">
            <Shield size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold font-heading text-white flex items-center gap-2">
              PlacementOS Admin Control Center <span className="badge badge-purple text-[10px]">SuperAdmin</span>
            </h1>
            <p className="text-xs text-slate-400">Platform Management, Student Operations & AI Intelligence Hub</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            100% System Health
          </div>
          <button
            onClick={handleAdminLogout}
            className="flex items-center gap-1.5 text-xs px-3.5 py-2 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 hover:bg-red-500/25 transition-all font-semibold"
          >
            <LogOut size={14} /> Admin Logout
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Dedicated Admin Navigation Sidebar */}
        <aside className="w-full md:w-64 border-r border-white/8 bg-slate-950/70 p-4 space-y-2 flex-shrink-0">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider px-3">Admin Controls</span>
          {[
            { id: 'overview', label: 'Platform Pulse & Analytics', icon: Activity },
            { id: 'students', label: 'Student Directory & Pro', icon: Users },
            { id: 'broadcast', label: 'Broadcast & Alerts 📢', icon: Megaphone },
            { id: 'questions', label: 'Question Bank Manager', icon: BookOpen },
            { id: 'drives', label: 'Off-Campus Drives Board', icon: Briefcase },
            { id: 'system', label: 'AI Keys & System Config', icon: Cpu },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setAdminTab(tab.id as any)}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                adminTab === tab.id ? 'tab-active' : 'tab-inactive'
              }`}
            >
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </aside>

        {/* Admin Content Area */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: OVERVIEW & ANALYTICS */}
          {adminTab === 'overview' && (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-card p-5 border border-indigo-500/20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Total Registered Students</span>
                    <Users size={16} className="text-indigo-400" />
                  </div>
                  <div className="text-3xl font-bold font-heading text-white mt-2">1,248</div>
                  <span className="text-[10px] text-emerald-400 mt-1 block">↑ 18% user growth this month</span>
                </div>
                <div className="glass-card p-5 border border-purple-500/20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">PlacementOS Pro Subscriptions</span>
                    <Zap size={16} className="text-purple-400" />
                  </div>
                  <div className="text-3xl font-bold font-heading text-purple-300 mt-2">482</div>
                  <span className="text-[10px] text-purple-400 mt-1 block">⚡ ₹2,40,518 Monthly Revenue</span>
                </div>
                <div className="glass-card p-5 border border-blue-500/20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">DSA Code Executions</span>
                    <Cpu size={16} className="text-blue-400" />
                  </div>
                  <div className="text-3xl font-bold font-heading text-blue-300 mt-2">42,890</div>
                  <span className="text-[10px] text-blue-400 mt-1 block">Piston engine latency: 42ms</span>
                </div>
                <div className="glass-card p-5 border border-emerald-500/20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Placement Success Rate</span>
                    <Award size={16} className="text-emerald-400" />
                  </div>
                  <div className="text-3xl font-bold font-heading text-emerald-300 mt-2">84.2%</div>
                  <span className="text-[10px] text-emerald-400 mt-1 block">Tier-1 & Tier-2 College Students</span>
                </div>
              </div>

              {/* Monthly MRR Revenue & Growth Chart */}
              <div className="glass-card p-6 border border-white/8 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white">Monthly Recurring Revenue (MRR) & User Growth</h3>
                    <p className="text-xs text-slate-400">PlacementOS Pro Subscription trajectory over last 6 months</p>
                  </div>
                  <span className="badge badge-purple text-xs font-bold">⚡ ₹2.4 Lakhs/mo</span>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={REVENUE_DATA}>
                      <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                      <YAxis stroke="#94a3b8" fontSize={12} />
                      <Tooltip contentStyle={{ background: '#0f111a', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }} />
                      <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorRev)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STUDENT DIRECTORY & PRO MANAGER */}
          {adminTab === 'students' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex gap-2">
                  {(['all', 'pro', 'free', 'flagged'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setStudentFilter(f)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                        studentFilter === f ? 'tab-active' : 'tab-inactive'
                      }`}
                    >
                      {f === 'all' ? 'All Students' : f === 'pro' ? 'Pro Users ⚡' : f === 'free' ? 'Free Tier 🟢' : 'Flagged ⚠️'}
                    </button>
                  ))}
                </div>

                <div className="relative flex-1 min-w-[240px]">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search student by name, email, or college..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="input-dark input-icon-left text-xs"
                  />
                </div>
              </div>

              {/* Student Table */}
              <div className="glass-card overflow-hidden border border-white/8">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-white/4 text-slate-400 uppercase tracking-wider font-semibold border-b border-white/8">
                    <tr>
                      <th className="p-3.5">Student</th>
                      <th className="p-3.5">College & Branch</th>
                      <th className="p-3.5">Target Company</th>
                      <th className="p-3.5">XP Points</th>
                      <th className="p-3.5">Pro Status</th>
                      <th className="p-3.5">Account Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredStudents.map(s => (
                      <tr key={s.id} className="hover:bg-white/2 transition-colors">
                        <td className="p-3.5 font-bold text-white">
                          <div>{s.name}</div>
                          <div className="text-[10px] text-slate-400 font-normal">{s.email}</div>
                        </td>
                        <td className="p-3.5">
                          <div className="text-slate-200">{s.college}</div>
                          <div className="text-[10px] text-slate-400">{s.branch} • Year {s.year}</div>
                        </td>
                        <td className="p-3.5">
                          <span className="badge badge-indigo text-[10px]">{s.targetCompany}</span>
                        </td>
                        <td className="p-3.5 font-mono text-indigo-300 font-bold">{s.xp.toLocaleString()} XP</td>
                        <td className="p-3.5">
                          <span className={`badge ${s.isPro ? 'badge-purple' : 'badge-emerald'}`}>
                            {s.isPro ? 'Pro ⚡' : 'Free 🟢'}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className={`badge ${s.status === 'Active' ? 'badge-emerald' : 'badge-red'}`}>
                            {s.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right space-x-2">
                          <button
                            onClick={() => toggleStudentPro(s.id)}
                            className="px-2.5 py-1 rounded-lg bg-purple-500/15 border border-purple-500/30 text-[11px] font-semibold text-purple-300 hover:bg-purple-500/25"
                          >
                            {s.isPro ? 'Revoke Pro' : 'Grant Pro ⚡'}
                          </button>
                          <button
                            onClick={() => toggleStudentStatus(s.id)}
                            className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] font-semibold text-slate-300 hover:bg-white/10"
                          >
                            {s.status === 'Active' ? 'Flag' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: BROADCAST & ANNOUNCEMENTS */}
          {adminTab === 'broadcast' && (
            <div className="max-w-3xl mx-auto glass-card p-6 space-y-5 border border-indigo-500/20">
              <div className="flex items-center gap-3 border-b border-white/8 pb-4">
                <Megaphone size={24} className="text-amber-400" />
                <div>
                  <h3 className="text-base font-bold text-white">Broadcast Platform Announcement</h3>
                  <p className="text-xs text-slate-400">Push real-time alerts & notification banners to all logged-in students</p>
                </div>
              </div>

              <form onSubmit={handleSendBroadcast} className="space-y-4 text-xs">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Announcement Title</label>
                  <input
                    type="text"
                    value={annTitle}
                    onChange={e => setAnnTitle(e.target.value)}
                    className="input-dark"
                    placeholder="e.g. 🚨 Google Off-Campus Hiring Drive 2025 is Live!"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">Target Audience</label>
                    <select value={annTarget} onChange={e => setAnnTarget(e.target.value)} className="input-dark">
                      <option value="all">All Registered Students (1,248)</option>
                      <option value="pro">Pro Subscribers Only (482)</option>
                      <option value="final_year">Final Year 2025 Batch</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">Notification Severity</label>
                    <select value={annType} onChange={e => setAnnType(e.target.value as any)} className="input-dark">
                      <option value="info">Standard Info Banner (Blue)</option>
                      <option value="urgent">Urgent Hiring Alert (Amber / Red)</option>
                      <option value="pro">Pro Exclusive Update (Purple)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Message Body</label>
                  <textarea
                    value={annMessage}
                    onChange={e => setAnnMessage(e.target.value)}
                    className="input-dark h-28"
                    placeholder="Enter detailed broadcast message..."
                    required
                  />
                </div>

                <button type="submit" className="btn-gradient w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 text-sm shadow-lg">
                  <Megaphone size={16} /> Send Platform Broadcast Now
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: QUESTION BANK MANAGER */}
          {adminTab === 'questions' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <form onSubmit={handleAddQuestion} className="glass-card p-5 space-y-4 border border-indigo-500/20">
                <h3 className="text-sm font-bold text-white">Add New DSA Coding Question</h3>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Question Title</label>
                  <input type="text" value={newQTitle} onChange={e => setNewQTitle(e.target.value)} className="input-dark text-xs" placeholder="e.g. Trapping Rain Water" required />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Difficulty</label>
                    <select value={newQDiff} onChange={e => setNewQDiff(e.target.value as any)} className="input-dark text-xs">
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Topic</label>
                    <select value={newQTopic} onChange={e => setNewQTopic(e.target.value)} className="input-dark text-xs">
                      <option value="Arrays">Arrays</option>
                      <option value="Dynamic Programming">Dynamic Programming</option>
                      <option value="Graphs">Graphs</option>
                      <option value="Trees">Trees</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Problem Description</label>
                  <textarea value={newQDesc} onChange={e => setNewQDesc(e.target.value)} className="input-dark text-xs h-24" placeholder="Enter problem statement..." />
                </div>
                <button type="submit" className="w-full btn-gradient py-2.5 rounded-xl text-xs font-bold">
                  Publish to Live DSA Tracker 📚
                </button>
              </form>

              <div className="lg:col-span-2 glass-card p-5 space-y-3 border border-white/8">
                <h3 className="text-sm font-bold text-white">Active Live Question Bank</h3>
                <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                  {QUESTIONS_DATA.map((q, i) => (
                    <div key={q.id} className="p-3.5 rounded-xl bg-white/3 border border-white/5 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-white">{i + 1}. {q.title}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{q.topic} • {q.submissions} submissions • {q.passRate} pass rate</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`badge ${q.difficulty === 'Hard' ? 'badge-red' : q.difficulty === 'Medium' ? 'badge-amber' : 'badge-emerald'}`}>
                          {q.difficulty}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: OFF-CAMPUS DRIVES BOARD */}
          {adminTab === 'drives' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <form onSubmit={handleAddDrive} className="glass-card p-5 space-y-4 border border-purple-500/20">
                <h3 className="text-sm font-bold text-white">Publish New Off-Campus Hiring Drive</h3>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Company Name</label>
                  <input type="text" value={newDriveCompany} onChange={e => setNewDriveCompany(e.target.value)} className="input-dark text-xs" placeholder="e.g. Google" required />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Role Title</label>
                  <input type="text" value={newDriveRole} onChange={e => setNewDriveRole(e.target.value)} className="input-dark text-xs" placeholder="e.g. Software Engineer 2025" required />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">CTC Range</label>
                  <input type="text" value={newDriveCTC} onChange={e => setNewDriveCTC(e.target.value)} className="input-dark text-xs" placeholder="e.g. ₹28 - 40 LPA" required />
                </div>
                <button type="submit" className="w-full btn-gradient py-2.5 rounded-xl text-xs font-bold">
                  Publish Hiring Drive 💼
                </button>
              </form>

              <div className="lg:col-span-2 glass-card p-5 space-y-3 border border-white/8">
                <h3 className="text-sm font-bold text-white">Live Published Off-Campus Drives</h3>
                <div className="space-y-2">
                  {[
                    { company: 'Google', role: 'Software Engineer - University Graduate 2025', ctc: '₹32 - 45 LPA', status: 'Live 🟢' },
                    { company: 'Microsoft', role: 'SWE Intern 2026 Batch', ctc: '₹1.2 Lakh/mo Stipend', status: 'Live 🟢' },
                    { company: 'Amazon', role: 'SDE-1 Off-Campus Drive', ctc: '₹28 - 34 LPA', status: 'Live 🟢' },
                  ].map((d, i) => (
                    <div key={i} className="p-3.5 rounded-xl bg-white/3 border border-white/5 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-white">{d.company} — {d.role}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Package: {d.ctc}</div>
                      </div>
                      <span className="badge badge-emerald text-[10px]">{d.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: AI API & SYSTEM CONFIG */}
          {adminTab === 'system' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* AI Model Config */}
                <div className="glass-card p-5 space-y-4 border border-white/8">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Cpu size={16} className="text-purple-400" /> AI Engine Model Switcher
                  </h3>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Active AI Model</label>
                    <select value={geminiModel} onChange={e => setGeminiModel(e.target.value)} className="input-dark text-xs">
                      <option value="gemini-1.5-flash">Gemini 1.5 Flash (Ultra Fast — Recommended)</option>
                      <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Reasoning Tier)</option>
                    </select>
                  </div>
                  <p className="text-xs text-slate-500">
                    Controls the AI model powering AI Voice Interviewer, System Design Assistant, and Resume Analyzer.
                  </p>
                </div>

                {/* Maintenance Actions */}
                <div className="glass-card p-5 space-y-4 border border-white/8">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Database size={16} className="text-blue-400" /> Maintenance & Cache Tools
                  </h3>
                  <div className="flex gap-3 flex-wrap">
                    <button onClick={handleFlushCache} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-slate-200 hover:bg-white/10">
                      Flush Piston Cache 🧹
                    </button>
                    <button onClick={handleBackupDB} className="px-4 py-2 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/25">
                      Export DB Backup ☁️
                    </button>
                  </div>
                </div>
              </div>

              {/* Server Log Inspector */}
              <div className="glass-card p-5 space-y-3 font-mono text-xs border border-white/10">
                <h3 className="font-bold text-white font-sans text-sm">Express Server & Gemini AI Live Logs</h3>
                <div className="bg-slate-950 p-4 rounded-xl space-y-1 text-slate-300 h-64 overflow-y-auto border border-white/5">
                  <div className="text-emerald-400">[INFO 02:10:04] 📦 Database connected (SQLite / Supabase Client)</div>
                  <div className="text-emerald-400">[INFO 02:10:05] 🚀 Express API server listening on http://localhost:5000</div>
                  <div className="text-indigo-400">[AI 02:10:06] 🤖 Gemini 1.5 Flash initialized</div>
                  <div className="text-slate-400">[HTTP 02:12:14] GET /api/admin/metrics 200 OK - 14ms</div>
                  <div className="text-purple-400">[AUTH 02:13:00] 🛡️ SuperAdmin session validated for admin@placementos.com</div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
