import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import TopBar from '../components/layout/TopBar';
import {
  Shield, Users, Activity, Server, TrendingUp, AlertTriangle,
  CheckCircle, Cpu, BarChart3, Database, Zap, Clock
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { LEADERBOARD } from '../data/mockData';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const AGENT_METRICS = [
  { name: 'DSA Agent', requests: 12847, uptime: '99.9%', avgResponse: '1.2s', status: 'healthy', color: '#6366f1' },
  { name: 'Aptitude Agent', requests: 8234, uptime: '99.7%', avgResponse: '0.8s', status: 'healthy', color: '#8b5cf6' },
  { name: 'Interview Agent', requests: 3421, uptime: '99.2%', avgResponse: '2.1s', status: 'healthy', color: '#3b82f6' },
  { name: 'Roadmap Agent', requests: 15621, uptime: '100%', avgResponse: '0.4s', status: 'healthy', color: '#06b6d4' },
  { name: 'Resume Agent', requests: 1834, uptime: '98.8%', avgResponse: '3.2s', status: 'degraded', color: '#10b981' },
];

const SYSTEM_STATS = [
  { label: 'Total Users', value: '52,341', change: '+234 this week', icon: Users, color: '#6366f1' },
  { label: 'Active Sessions', value: '3,847', change: 'Right now', icon: Activity, color: '#10b981' },
  { label: 'Agent Requests/hr', value: '28.4K', change: '+12% from yesterday', icon: Cpu, color: '#8b5cf6' },
  { label: 'Avg Session Time', value: '47min', change: '+3min this week', icon: Clock, color: '#f59e0b' },
  { label: 'Problems Solved', value: '1.2M', change: '+18K today', icon: CheckCircle, color: '#3b82f6' },
  { label: 'DB Queries/min', value: '12.3K', change: 'Healthy', icon: Database, color: '#06b6d4' },
];

const TRAFFIC_DATA = Array.from({ length: 14 }, (_, i) => ({
  day: `Day ${i + 1}`,
  users: 800 + Math.floor(Math.random() * 1500),
  sessions: 1200 + Math.floor(Math.random() * 2000),
  requests: 15000 + Math.floor(Math.random() * 20000),
}));

const ALERTS = [
  { type: 'warning', message: 'Resume Agent response time degraded (3.2s avg, threshold: 3s)', time: '12 min ago' },
  { type: 'info', message: 'Peak traffic detected — 5,234 concurrent users (new record!)', time: '1 hour ago' },
  { type: 'success', message: 'DSA Agent model update deployed successfully', time: '3 hours ago' },
  { type: 'info', message: 'Scheduled maintenance window: Sunday 2-4 AM IST', time: '1 day ago' },
];

export default function AdminPage() {
  const { user } = useStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'agents' | 'alerts'>('overview');
  const navigate = useNavigate();
  const [realStats, setRealStats] = useState<any>(null);
  const [realUsers, setRealUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        // Get total user count
        const { count: totalUsers } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        // Get recent users (last 10)
        const { data: recentUsers } = await supabase
          .from('profiles')
          .select('id, name, email, college, created_at')
          .order('created_at', { ascending: false })
          .limit(10);

        // Get total XP sum across all users  
        const { data: progressData } = await supabase
          .from('progress')
          .select('xp, level, placement_score, rank');

        const totalXP = progressData?.reduce((s: number, p: any) => s + (p.xp || 0), 0) || 0;
        const avgPlacementScore = progressData?.length 
          ? Math.round(progressData.reduce((s: number, p: any) => s + (p.placement_score || 0), 0) / progressData.length)
          : 0;

        // Get notification count
        const { count: notifCount } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true });

        // Get total DSA problems solved
        const { data: dsaData } = await supabase
          .from('dsa_stats')
          .select('total_solved');
        const totalSolved = dsaData?.reduce((s: number, d: any) => s + (d.total_solved || 0), 0) || 0;

        setRealStats({
          totalUsers: totalUsers || 0,
          totalXP,
          avgPlacementScore,
          notifCount: notifCount || 0,
          totalSolved,
          activeSessions: Math.floor((totalUsers || 1) * 0.3), // estimate
        });
        setRealUsers(recentUsers || []);
      } catch (err) {
        console.warn('Admin stats fetch error:', err);
      }
    };
    fetchAdminData();
  }, []);

  if (user?.role !== 'admin') {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center glass-card p-12">
          <Shield size={48} className="text-slate-600 mx-auto mb-4" />
          <h2 className="font-heading text-2xl font-bold text-white mb-2">Admin Access Required</h2>
          <p className="text-slate-400">This section is only accessible to administrators.</p>
          <p className="text-slate-500 text-sm mt-2">Your role: <span className="text-indigo-400 capitalize">{user?.role || 'student'}</span></p>
          <p className="text-slate-600 text-xs mt-4">Demo: sign in as admin to access this page</p>
          <button onClick={() => navigate('/dashboard')} className="btn-gradient px-6 py-2 rounded-xl mt-4">
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <TopBar title="Admin Dashboard" subtitle="Platform management & monitoring" />
      <div className="p-6 space-y-5">
        {/* Tabs */}
        <div className="flex gap-2 flex-wrap">
          {(['overview', 'users', 'agents', 'alerts'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${activeTab === tab ? 'tab-active' : 'tab-inactive'}`}>
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            {/* System Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { label: 'Total Users', value: realStats?.totalUsers?.toLocaleString() ?? SYSTEM_STATS[0].value, change: SYSTEM_STATS[0].change, icon: Users, color: '#6366f1' },
                { label: 'Active Sessions', value: realStats?.activeSessions?.toLocaleString() ?? SYSTEM_STATS[1].value, change: SYSTEM_STATS[1].change, icon: Activity, color: '#10b981' },
                { label: 'Avg Placement Score', value: realStats?.avgPlacementScore ?? '...', change: 'Platform average', icon: Cpu, color: '#8b5cf6' },
                { label: 'Total XP Earned', value: realStats?.totalXP?.toLocaleString() ?? '...', change: 'All users', icon: Zap, color: '#f59e0b' },
                { label: 'Total DSA Solved', value: realStats?.totalSolved?.toLocaleString() ?? SYSTEM_STATS[4].value, change: 'All time', icon: CheckCircle, color: '#3b82f6' },
                { label: 'Total Notifications', value: realStats?.notifCount?.toLocaleString() ?? SYSTEM_STATS[5].value, change: 'System wide', icon: Database, color: '#06b6d4' },
              ].map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                  className="glass-card p-4">
                  <s.icon size={14} style={{ color: s.color }} className="mb-2" />
                  <div className="text-xl font-heading font-bold text-white">{s.value}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
                  <div className="text-xs mt-1" style={{ color: s.color }}>{s.change}</div>
                </motion.div>
              ))}
            </div>

            {/* Traffic Chart */}
            <div className="glass-card p-5">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp size={16} className="text-indigo-400" /> Platform Traffic (Last 14 Days)
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={TRAFFIC_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }} />
                  <Line type="monotone" dataKey="users" name="Users" stroke="#6366f1" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="sessions" name="Sessions" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Recent Alerts */}
            <div className="glass-card p-5">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <AlertTriangle size={16} className="text-amber-400" /> System Alerts
              </h3>
              <div className="space-y-2">
                {ALERTS.map((alert, i) => (
                  <div key={i} className={`flex gap-3 p-3 rounded-xl border text-sm ${
                    alert.type === 'warning' ? 'bg-amber-500/10 border-amber-500/20' :
                    alert.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20' :
                    'bg-blue-500/10 border-blue-500/20'
                  }`}>
                    <span className="flex-shrink-0">
                      {alert.type === 'warning' ? '⚠️' : alert.type === 'success' ? '✅' : 'ℹ️'}
                    </span>
                    <div className="flex-1">
                      <span className={alert.type === 'warning' ? 'text-amber-300' : alert.type === 'success' ? 'text-emerald-300' : 'text-blue-300'}>
                        {alert.message}
                      </span>
                      <div className="text-xs text-slate-600 mt-0.5">{alert.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'users' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Users size={16} className="text-indigo-400" /> Top Users by Score
              </h3>
              <span className="text-xs text-slate-500">52,341 total users</span>
            </div>
            <div className="space-y-2">
              {realUsers.length > 0 ? realUsers.map((u, i) => (
                <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                    {u.name?.[0] || '?'}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white">{u.name || 'Student'}</div>
                    <div className="text-xs text-slate-400">{u.college || 'College'}</div>
                  </div>
                  <div className="text-xs text-slate-500">{new Date(u.created_at).toLocaleDateString()}</div>
                </div>
              )) : <div className="text-slate-500 text-sm">No users yet</div>}
            </div>
          </motion.div>
        )}

        {activeTab === 'agents' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="glass-card p-5">
              <h3 className="font-semibold text-white flex items-center gap-2 mb-5">
                <Cpu size={16} className="text-purple-400" /> Agent Health Monitor
              </h3>
              <div className="space-y-4">
                {AGENT_METRICS.map((agent, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                    className="p-4 rounded-xl bg-white/3 border border-white/5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: agent.status === 'healthy' ? '#10b981' : '#f59e0b' }} />
                        <span className="font-semibold text-white">{agent.name}</span>
                        <span className={`badge text-xs ${agent.status === 'healthy' ? 'badge-emerald' : 'badge-amber'}`}>
                          {agent.status}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500">{agent.uptime} uptime</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold" style={{ color: agent.color }}>{agent.requests.toLocaleString()}</div>
                        <div className="text-xs text-slate-500">Total Requests</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-white">{agent.avgResponse}</div>
                        <div className="text-xs text-slate-500">Avg Response</div>
                      </div>
                      <div>
                        <div className={`text-lg font-bold ${agent.status === 'healthy' ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {agent.uptime}
                        </div>
                        <div className="text-xs text-slate-500">Uptime</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'alerts' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
            <h3 className="font-semibold text-white flex items-center gap-2 mb-5">
              <AlertTriangle size={16} className="text-amber-400" /> All System Alerts
            </h3>
            <div className="space-y-3">
              {[...ALERTS, ...ALERTS.map(a => ({ ...a, time: '2 days ago' }))].map((alert, i) => (
                <div key={i} className={`flex gap-3 p-4 rounded-xl border ${
                  alert.type === 'warning' ? 'bg-amber-500/10 border-amber-500/20' :
                  alert.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20' :
                  'bg-blue-500/10 border-blue-500/20'
                }`}>
                  <span>{alert.type === 'warning' ? '⚠️' : alert.type === 'success' ? '✅' : 'ℹ️'}</span>
                  <div>
                    <div className={`text-sm ${alert.type === 'warning' ? 'text-amber-300' : alert.type === 'success' ? 'text-emerald-300' : 'text-blue-300'}`}>
                      {alert.message}
                    </div>
                    <div className="text-xs text-slate-600 mt-1">{alert.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
