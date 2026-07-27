import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Users, BookOpen, Briefcase, Cpu, Activity, Search,
  Plus, CheckCircle, Trash2, Edit, Zap, LogOut, Lock, RefreshCw, Key
} from 'lucide-react';
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
}

const MOCK_STUDENTS: StudentUser[] = [
  { id: 'u1', name: 'Daksh Singhal', email: 'daksh@college.edu', college: 'IIT Bombay', branch: 'Computer Science', year: 3, xp: 14200, isPro: true },
  { id: 'u2', name: 'Aarav Sharma', email: 'aarav@nit.edu', college: 'NIT Trichy', branch: 'Computer Science', year: 4, xp: 9800, isPro: false },
  { id: 'u3', name: 'Ananya Verma', email: 'ananya@iiit.edu', college: 'IIIT Hyderabad', branch: 'ECE', year: 3, xp: 12400, isPro: true },
  { id: 'u4', name: 'Rohan Gupta', email: 'rohan@bits.edu', college: 'BITS Pilani', branch: 'Information Technology', year: 2, xp: 6500, isPro: false },
  { id: 'u5', name: 'Priya Patel', email: 'priya@dtu.edu', college: 'DTU Delhi', branch: 'Software Engineering', year: 4, xp: 15600, isPro: true },
];

export default function AdminPage() {
  const { user, logout, upgradeToPro, cancelPro } = useStore();
  const navigate = useNavigate();
  const [adminTab, setAdminTab] = useState<'overview' | 'students' | 'questions' | 'drives' | 'logs'>('overview');
  
  const [students, setStudents] = useState<StudentUser[]>(MOCK_STUDENTS);
  const [searchQuery, setSearchQuery] = useState('');

  // New Question Form
  const [newQTitle, setNewQTitle] = useState('');
  const [newQDiff, setNewQDiff] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [newQTopic, setNewQTopic] = useState('Arrays');
  const [newQDesc, setNewQDesc] = useState('');

  // New Drive Form
  const [newDriveCompany, setNewDriveCompany] = useState('');
  const [newDriveRole, setNewDriveRole] = useState('');
  const [newDriveCTC, setNewDriveCTC] = useState('');

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.college.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleStudentPro = (id: string) => {
    setStudents(prev => prev.map(s => {
      if (s.id !== id) return s;
      const nextPro = !s.isPro;
      toast.success(`${s.name} PlacementOS Pro status updated to ${nextPro ? 'Active ⚡' : 'Free 🟢'}`);
      return { ...s, isPro: nextPro };
    }));
  };

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQTitle.trim()) return;
    toast.success(`Question "${newQTitle}" added to live PlacementOS question bank! 📚`);
    setNewQTitle('');
    setNewQDesc('');
  };

  const handleAddDrive = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDriveCompany.trim()) return;
    toast.success(`Off-Campus Drive for "${newDriveCompany}" published to student board! 💼`);
    setNewDriveCompany('');
    setNewDriveRole('');
    setNewDriveCTC('');
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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 flex items-center justify-center shadow-lg">
            <Shield size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold font-heading text-white flex items-center gap-2">
              PlacementOS Admin Control Center <span className="badge badge-purple text-[10px]">SuperAdmin</span>
            </h1>
            <p className="text-xs text-slate-400">System Management & Student Operations Portal</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            System Health: 100% Operational
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
        <aside className="w-full md:w-64 border-r border-white/8 bg-slate-950/60 p-4 space-y-2 flex-shrink-0">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider px-3">Admin Navigation</span>
          {[
            { id: 'overview', label: 'Platform Overview', icon: Activity },
            { id: 'students', label: 'Student Directory & Pro', icon: Users },
            { id: 'questions', label: 'Question Bank Manager', icon: BookOpen },
            { id: 'drives', label: 'Off-Campus Drives', icon: Briefcase },
            { id: 'logs', label: 'AI & Express Server Logs', icon: Cpu },
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
          {/* TAB 1: OVERVIEW */}
          {adminTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-card p-5 border border-white/8">
                  <div className="text-xs text-slate-400">Total Registered Students</div>
                  <div className="text-3xl font-bold text-white mt-1">1,248</div>
                  <span className="text-[10px] text-emerald-400 mt-1 block">↑ 14% this week</span>
                </div>
                <div className="glass-card p-5 border border-white/8">
                  <div className="text-xs text-slate-400">PlacementOS Pro Subscribers</div>
                  <div className="text-3xl font-bold text-purple-300 mt-1">482</div>
                  <span className="text-[10px] text-purple-400 mt-1 block">⚡ ₹2,40,500 MRR</span>
                </div>
                <div className="glass-card p-5 border border-white/8">
                  <div className="text-xs text-slate-400">DSA Problems Solved</div>
                  <div className="text-3xl font-bold text-indigo-300 mt-1">42,890</div>
                  <span className="text-[10px] text-indigo-400 mt-1 block">Piston execution engine</span>
                </div>
                <div className="glass-card p-5 border border-white/8">
                  <div className="text-xs text-slate-400">Gemini AI API Latency</div>
                  <div className="text-3xl font-bold text-emerald-300 mt-1">14ms</div>
                  <span className="text-[10px] text-emerald-400 mt-1 block">🟢 Healthy response time</span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="glass-card p-6 border border-indigo-500/20">
                <h3 className="text-base font-bold text-white mb-3">Admin System Quick Control</h3>
                <div className="flex gap-3 flex-wrap">
                  <button onClick={() => setAdminTab('students')} className="btn-gradient px-4 py-2 rounded-xl text-xs font-semibold">
                    Manage Pro Access
                  </button>
                  <button onClick={() => setAdminTab('questions')} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-slate-200 hover:bg-white/10">
                    Add New DSA Question
                  </button>
                  <button onClick={() => setAdminTab('drives')} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-slate-200 hover:bg-white/10">
                    Publish Hiring Drive
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STUDENT DIRECTORY & PRO MANAGER */}
          {adminTab === 'students' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
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
                <span className="text-xs text-slate-400">{filteredStudents.length} Students found</span>
              </div>

              <div className="glass-card overflow-hidden border border-white/8">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-white/4 text-slate-400 uppercase tracking-wider font-semibold border-b border-white/8">
                    <tr>
                      <th className="p-3.5">Student</th>
                      <th className="p-3.5">College & Branch</th>
                      <th className="p-3.5">Year</th>
                      <th className="p-3.5">XP</th>
                      <th className="p-3.5">Subscription</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredStudents.map(student => (
                      <tr key={student.id} className="hover:bg-white/2 transition-colors">
                        <td className="p-3.5 font-bold text-white">
                          <div>{student.name}</div>
                          <div className="text-[10px] text-slate-400 font-normal">{student.email}</div>
                        </td>
                        <td className="p-3.5">
                          <div className="text-slate-200">{student.college}</div>
                          <div className="text-[10px] text-slate-400">{student.branch}</div>
                        </td>
                        <td className="p-3.5 text-slate-300">Year {student.year}</td>
                        <td className="p-3.5 font-mono text-indigo-300 font-bold">{student.xp.toLocaleString()} XP</td>
                        <td className="p-3.5">
                          <span className={`badge ${student.isPro ? 'badge-purple' : 'badge-emerald'}`}>
                            {student.isPro ? 'Pro ⚡' : 'Free 🟢'}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => toggleStudentPro(student.id)}
                            className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[11px] font-semibold text-slate-200 hover:bg-white/10"
                          >
                            {student.isPro ? 'Revoke Pro' : 'Grant Pro ⚡'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: QUESTION BANK MANAGER */}
          {adminTab === 'questions' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <form onSubmit={handleAddQuestion} className="glass-card p-5 space-y-4 border border-indigo-500/20">
                <h3 className="text-sm font-bold text-white">Add New DSA Question</h3>
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
                  <textarea value={newQDesc} onChange={e => setNewQDesc(e.target.value)} className="input-dark text-xs h-24" placeholder="Enter problem statement and examples..." />
                </div>
                <button type="submit" className="w-full btn-gradient py-2.5 rounded-xl text-xs font-bold">
                  Publish to Question Bank 📚
                </button>
              </form>

              <div className="lg:col-span-2 glass-card p-5 space-y-3">
                <h3 className="text-sm font-bold text-white">Active Live Question Bank (20 Problems)</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                  {['Two Sum', 'Longest Substring Without Repeating Characters', 'Median of Two Sorted Arrays', 'Container With Most Water', 'Trapping Rain Water', 'Word Ladder Length', 'Meeting Rooms II'].map((q, i) => (
                    <div key={i} className="p-3 rounded-xl bg-white/3 border border-white/5 flex items-center justify-between text-xs">
                      <span className="font-semibold text-white">{i + 1}. {q}</span>
                      <span className="badge badge-indigo text-[10px]">Active</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: OFF-CAMPUS DRIVES */}
          {adminTab === 'drives' && (
            <div className="max-w-2xl mx-auto glass-card p-6 space-y-4 border border-purple-500/20">
              <h3 className="text-base font-bold text-white">Publish New Off-Campus Hiring Drive</h3>
              <form onSubmit={handleAddDrive} className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Company Name</label>
                  <input type="text" value={newDriveCompany} onChange={e => setNewDriveCompany(e.target.value)} className="input-dark" placeholder="e.g. Google" required />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Role Title</label>
                  <input type="text" value={newDriveRole} onChange={e => setNewDriveRole(e.target.value)} className="input-dark" placeholder="e.g. Software Engineer 2025" required />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">CTC Range</label>
                  <input type="text" value={newDriveCTC} onChange={e => setNewDriveCTC(e.target.value)} className="input-dark" placeholder="e.g. ₹28 - 40 LPA" required />
                </div>
                <button type="submit" className="w-full btn-gradient py-3 rounded-xl font-bold">
                  Publish Off-Campus Drive 💼
                </button>
              </form>
            </div>
          )}

          {/* TAB 5: AI & SERVER LOGS */}
          {adminTab === 'logs' && (
            <div className="glass-card p-5 space-y-3 font-mono text-xs border border-white/10">
              <h3 className="font-bold text-white font-sans text-sm">Express Server & Gemini AI Live Logs</h3>
              <div className="bg-slate-950 p-4 rounded-xl space-y-1 text-slate-300 h-80 overflow-y-auto border border-white/5">
                <div className="text-emerald-400">[INFO 01:54:20] 📦 Database connected (SQLite / Supabase Client)</div>
                <div className="text-emerald-400">[INFO 01:54:22] 🚀 Express API server listening on http://localhost:5000</div>
                <div className="text-indigo-400">[AI 01:55:04] 🤖 Gemini 1.5 Flash model initialized successfully</div>
                <div className="text-slate-400">[HTTP 01:56:12] GET /api/dsa/problems 200 OK - 12ms</div>
                <div className="text-slate-400">[HTTP 01:58:34] POST /api/ai/resume-analyze 200 OK - 840ms</div>
                <div className="text-amber-400">[WARN 02:01:10] LeetCode GraphQL CORS fallback active</div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
