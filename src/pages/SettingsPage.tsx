import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import TopBar from '../components/layout/TopBar';
import {
  User, Bell, Shield, Palette, Target, Clock, Building2,
  GraduationCap, Save, CheckCircle, Moon, Sun, Zap, LogOut
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';

const COMPANIES = ['Google', 'Microsoft', 'Amazon', 'Adobe', 'Goldman Sachs', 'Flipkart', 'Oracle', 'NVIDIA', 'Uber', 'Atlassian', 'Paytm', 'Swiggy'];
const BRANCHES = ['Computer Science', 'IT', 'ECE', 'EEE', 'Mechanical', 'Civil', 'Chemical'];

export default function SettingsPage() {
  const { user, logout, progress, updateUser } = useStore();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'notifications' | 'account'>('profile');
  const [saved, setSaved] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [profile, setProfile] = useState({
    name: user?.name || 'Daksh Singhal',
    email: user?.email || 'daksh@college.edu',
    college: user?.college || 'IIT Bombay',
    branch: user?.branch || 'Computer Science',
    year: String(user?.year || 3),
    cgpa: String(user?.cgpa || 8.2),
    placementMonth: user?.placementMonth || 'December 2025',
    dailyHours: String(user?.dailyHours || 4),
    targetCompanies: user?.targetCompanies || ['Google', 'Amazon'],
    githubUsername: user?.githubUsername || '',
    leetcodeUsername: user?.leetcodeUsername || '',
  });

  // Sync form when user profile loads from Supabase (run once per user session)
  useEffect(() => {
    if (user) {
      setProfile(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        college: user.college || prev.college,
        branch: user.branch || prev.branch,
        year: user.year?.toString() || prev.year,
        cgpa: user.cgpa?.toString() || prev.cgpa,
        placementMonth: user.placementMonth || prev.placementMonth,
        dailyHours: user.dailyHours?.toString() || prev.dailyHours,
        targetCompanies: user.targetCompanies?.length ? user.targetCompanies : prev.targetCompanies,
        githubUsername: user.githubUsername || prev.githubUsername,
        leetcodeUsername: user.leetcodeUsername || prev.leetcodeUsername,
      }));
    }
  // ✅ Use primitive user.id — NOT [user] object (causes infinite loop)
  }, [user?.id]);

  const [prefs, setPrefs] = useState({
    theme: 'dark',
    notifications: true,
    emailDigest: true,
    agentAlerts: true,
    reminderTime: '09:00',
    difficulty: 'adaptive',
    language: 'python',
    showLeaderboard: true,
  });

  const toggleCompany = (c: string) => {
    setProfile(p => ({
      ...p,
      targetCompanies: p.targetCompanies.includes(c)
        ? p.targetCompanies.filter(x => x !== c)
        : [...p.targetCompanies, c],
    }));
  };

  function extractUsername(input: string, platform: 'github' | 'leetcode'): string {
    if (!input) return '';
    let str = input.trim();
    str = str.replace(/\/$/, '');
    if (platform === 'github') {
      const match = str.match(/(?:github\.com\/|^)([a-zA-Z0-9_-]+)$/i);
      if (match) return match[1];
    } else if (platform === 'leetcode') {
      const match = str.match(/(?:leetcode\.com\/(?:u\/)?|^)([a-zA-Z0-9_-]+)$/i);
      if (match) return match[1];
    }
    return str.split('/').filter(Boolean).pop() || str;
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      const cleanGithub = extractUsername(profile.githubUsername, 'github');
      const cleanLeetcode = extractUsername(profile.leetcodeUsername, 'leetcode');

      setProfile(p => ({ ...p, githubUsername: cleanGithub, leetcodeUsername: cleanLeetcode }));

      await updateUser({
        name: profile.name,
        college: profile.college,
        branch: profile.branch,
        year: profile.year ? parseInt(profile.year) || null : null,
        cgpa: profile.cgpa ? parseFloat(profile.cgpa) || null : null,
        targetCompanies: profile.targetCompanies,
        dailyHours: parseInt(profile.dailyHours),
        placementMonth: profile.placementMonth,
        githubUsername: cleanGithub,
        leetcodeUsername: cleanLeetcode,
      });
      setSaved(true);
      toast.success('Settings saved successfully! ✅');
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      toast.error('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };


  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const handlePasswordUpdate = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSaving(false);
    if (error) {
      toast.error('Failed to update password: ' + error.message);
    } else {
      toast.success('Password updated successfully! 🔒');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'preferences', label: 'Preferences', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'account', label: 'Account', icon: Shield },
  ] as const;

  return (
    <div className="flex-1 overflow-y-auto">
      <TopBar title="Settings" subtitle="Manage your profile and preferences" />
      <div className="p-6 max-w-4xl mx-auto space-y-5">

        {/* Tabs */}
        <div className="flex gap-2 flex-wrap">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id ? 'tab-active' : 'tab-inactive'}`}>
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            {/* Avatar section */}
            <div className="glass-card p-6 flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                {profile.name[0]}
              </div>
              <div>
                <div className="font-heading font-bold text-xl text-white">{profile.name}</div>
                <div className="text-slate-400 text-sm">{profile.email}</div>
                <div className="flex gap-2 mt-2">
                  <span className="badge badge-indigo">Level {progress.level}</span>
                  <span className="badge badge-amber">#{progress.rank} Rank</span>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 space-y-5">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <User size={16} className="text-indigo-400" /> Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Your name' },
                  { label: 'Email', key: 'email', type: 'email', placeholder: 'you@college.edu' },
                  { label: 'College / University', key: 'college', type: 'text', placeholder: 'IIT Bombay' },
                  { label: 'CGPA', key: 'cgpa', type: 'number', placeholder: '8.0' },
                ].map(field => (
                  <div key={field.key}>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">{field.label}</label>
                    <input type={field.type} value={(profile as any)[field.key]}
                      onChange={e => setProfile(p => ({ ...p, [field.key]: e.target.value }))}
                      className="input-dark" placeholder={field.placeholder} />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Branch</label>
                  <select value={profile.branch} onChange={e => setProfile(p => ({ ...p, branch: e.target.value }))}
                    className="input-dark">
                    {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Current Year</label>
                  <select value={profile.year} onChange={e => setProfile(p => ({ ...p, year: e.target.value }))}
                    className="input-dark">
                    {['1', '2', '3', '4'].map(y => <option key={y} value={y}>Year {y}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Daily Study Hours</label>
                  <select value={profile.dailyHours} onChange={e => setProfile(p => ({ ...p, dailyHours: e.target.value }))}
                    className="input-dark">
                    {['1', '2', '3', '4', '5', '6', '7', '8'].map(h => <option key={h} value={h}>{h} hours/day</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Placement Month</label>
                  <input type="text" value={profile.placementMonth}
                    onChange={e => setProfile(p => ({ ...p, placementMonth: e.target.value }))}
                    className="input-dark" placeholder="December 2025" />
                </div>
              </div>

              {/* ── Platform Links ── */}
              <div className="mt-4">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">🔗 Platform Integration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold pointer-events-none">GH</span>
                    <input
                      id="github-username"
                      type="text"
                      placeholder="GitHub username"
                      value={profile.githubUsername || ''}
                      onChange={e => setProfile(p => ({ ...p, githubUsername: e.target.value }))}
                      className="input-dark pl-9 pr-3 py-2.5 text-sm w-full"
                    />
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold pointer-events-none">LC</span>
                    <input
                      id="leetcode-username"
                      type="text"
                      placeholder="LeetCode username"
                      value={profile.leetcodeUsername || ''}
                      onChange={e => setProfile(p => ({ ...p, leetcodeUsername: e.target.value }))}
                      className="input-dark pl-9 pr-3 py-2.5 text-sm w-full"
                    />
                  </div>
                </div>
                <p className="text-xs text-slate-600 mt-2">💡 Your public stats will be automatically synced to your dashboard</p>
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="font-semibold text-white flex items-center gap-2 mb-4">
                <Building2 size={16} className="text-amber-400" /> Target Companies
              </h3>
              <div className="flex flex-wrap gap-2">
                {COMPANIES.map(c => (
                  <button key={c} onClick={() => toggleCompany(c)}
                    className={`text-sm px-3 py-1.5 rounded-xl border transition-all ${
                      profile.targetCompanies.includes(c)
                        ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                        : 'bg-white/3 border-white/10 text-slate-400 hover:border-white/20'
                    }`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="glass-card p-6 space-y-4">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Palette size={16} className="text-purple-400" /> Appearance & Study
              </h3>
              {[
                { label: 'Theme', desc: 'Dark mode only for now', type: 'select', key: 'theme', options: [{ v: 'dark', l: 'Dark (Default)' }] },
                { label: 'Default Coding Language', desc: 'Used in DSA IDE', type: 'select', key: 'language', options: [
                  { v: 'python', l: 'Python' }, { v: 'javascript', l: 'JavaScript' }, { v: 'cpp', l: 'C++' }, { v: 'java', l: 'Java' }
                ]},
                { label: 'Difficulty Preference', desc: 'How questions scale', type: 'select', key: 'difficulty', options: [
                  { v: 'adaptive', l: 'Adaptive (AI-controlled)' }, { v: 'easy', l: 'Start Easy' }, { v: 'hard', l: 'Always Hard' }
                ]},
                { label: 'Daily Reminder Time', desc: 'When to remind you to study', type: 'time', key: 'reminderTime' },
              ].map(pref => (
                <div key={pref.key} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                  <div>
                    <div className="text-sm font-medium text-white">{pref.label}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{pref.desc}</div>
                  </div>
                  {pref.type === 'select' ? (
                    <select value={(prefs as any)[pref.key]}
                      onChange={e => setPrefs(p => ({ ...p, [pref.key]: e.target.value }))}
                      className="input-dark w-44 text-sm py-1.5">
                      {pref.options?.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                    </select>
                  ) : (
                    <input type="time" value={(prefs as any)[pref.key]}
                      onChange={e => setPrefs(p => ({ ...p, [pref.key]: e.target.value }))}
                      className="input-dark w-32 text-sm py-1.5" />
                  )}
                </div>
              ))}

              {/* Toggle Leaderboard */}
              <div className="flex items-center justify-between py-3">
                <div>
                  <div className="text-sm font-medium text-white">Show on Leaderboard</div>
                  <div className="text-xs text-slate-500">Make your rank visible to others</div>
                </div>
                <button onClick={() => setPrefs(p => ({ ...p, showLeaderboard: !p.showLeaderboard }))}
                  className={`w-11 h-6 rounded-full transition-all relative ${prefs.showLeaderboard ? 'bg-indigo-500' : 'bg-white/10'}`}>
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${prefs.showLeaderboard ? 'left-5' : 'left-0.5'}`} />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="glass-card p-6 space-y-1">
              <h3 className="font-semibold text-white flex items-center gap-2 mb-4">
                <Bell size={16} className="text-blue-400" /> Notification Settings
              </h3>
              {[
                { key: 'notifications', label: 'Push Notifications', desc: 'Daily reminders and task alerts' },
                { key: 'emailDigest', label: 'Weekly Email Digest', desc: 'Progress summary every Monday' },
                { key: 'agentAlerts', label: 'AI Agent Alerts', desc: 'When agents detect issues or opportunities' },
              ].map(n => (
                <div key={n.key} className="flex items-center justify-between py-4 border-b border-white/5 last:border-0">
                  <div>
                    <div className="text-sm font-medium text-white">{n.label}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{n.desc}</div>
                  </div>
                  <button onClick={() => setPrefs(p => ({ ...p, [n.key]: !(p as any)[n.key] }))}
                    className={`w-11 h-6 rounded-full transition-all relative ${(prefs as any)[n.key] ? 'bg-indigo-500' : 'bg-white/10'}`}>
                    <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${(prefs as any)[n.key] ? 'left-5' : 'left-0.5'}`} />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Account Tab */}
        {activeTab === 'account' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="glass-card p-6 space-y-4">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Shield size={16} className="text-emerald-400" /> Account & Security
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Current Password</label>
                  <input type="password" className="input-dark" placeholder="••••••••" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">New Password</label>
                  <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="input-dark" placeholder="Min. 8 characters" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Confirm New Password</label>
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="input-dark" placeholder="Repeat new password" />
                </div>
                <button onClick={handlePasswordUpdate} disabled={saving} className="btn-gradient text-sm px-6 py-2.5">Update Password</button>
              </div>
            </div>

            <div className="glass-card p-6 border-red-500/20 bg-red-500/5">
              <h3 className="font-semibold text-red-400 mb-3 flex items-center gap-2">
                <LogOut size={16} /> Danger Zone
              </h3>
              <div className="space-y-3">
                <button onClick={handleLogout}
                  className="w-full py-3 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all text-sm text-left px-4">
                  Sign out of all devices
                </button>
                <button className="w-full py-3 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all text-sm text-left px-4">
                  Delete account and all data
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Save Button */}
        {activeTab !== 'account' && (
          <div className="flex justify-end">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSave}
              disabled={saving}
              className="btn-gradient flex items-center gap-2 px-8 py-3 text-sm disabled:opacity-60"
            >
              {saving
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                : saved
                  ? <><CheckCircle size={16} /> Saved!</>
                  : <><Save size={16} /> Save Changes</>}
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
}
