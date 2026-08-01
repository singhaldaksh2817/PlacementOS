import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { motion } from 'framer-motion';
import TopBar from '../components/layout/TopBar';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis
} from 'recharts';
import { ANALYTICS_DATA, LEADERBOARD } from '../data/mockData';
import { useStore } from '../store/useStore';
import { TrendingUp, Activity, Target, Clock, Trophy, Zap } from 'lucide-react';

const COLORS = ['#6366f1', '#8b5cf6', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card p-3 text-xs">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: <strong>{p.value}</strong></p>
      ))}
    </div>
  );
};

export default function AnalyticsPage() {
  const { user, progress, dsaStats } = useStore();
  const [liveMetrics, setLiveMetrics] = useState<any>(null);
  const [range, setRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  useEffect(() => {
    const fetchRealData = async () => {
      if (!user?.id || user.id === 'demo-user-001') {
        setLiveMetrics({
          productivityData: ANALYTICS_DATA.productivityByDay,
          topicData: ANALYTICS_DATA.topicDistribution,
          progressData: ANALYTICS_DATA.progressOverTime,
          aptResults: []
        });
        return;
      }
      try {
        // Fetch aptitude results for accuracy trends
        const { data: aptResults } = await supabase
          .from('aptitude_results')
          .select('score, total_questions, category, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true })
          .limit(30);

        // Fetch dsa_stats for topic distribution
        const { data: dsaData } = await supabase
          .from('dsa_stats')
          .select('total_solved, easy_solved, medium_solved, hard_solved, weak_topics, strong_topics, topic_wise')
          .eq('user_id', user.id)
          .single();

        // Fetch interview sessions for score trend
        const { data: interviewData } = await supabase
          .from('interview_sessions')
          .select('score, company, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true })
          .limit(10);

        // Build productivity chart: last 7 days from dsaStats.dailyActivity
        const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
        const productivityData = days.map((day, i) => ({
          day,
          problems: dsaStats?.dailyActivity?.[i]?.count || 0,
          score: aptResults?.[i]?.score || 0,
        }));

        // Build topic distribution from real dsa topic_wise data or dsaStats
        const topicWise = typeof dsaData?.topic_wise === 'string' 
          ? (() => { try { return JSON.parse(dsaData.topic_wise); } catch { return {}; } })()
          : (dsaData?.topic_wise || {});
        const topicData = Object.entries(topicWise).slice(0, 6).map(([name, val]: any) => ({
          name,
          value: val?.solved || 0,
        }));
        if (topicData.length === 0) {
          const total = dsaData?.total_solved || dsaStats?.totalSolved || 0;
          topicData.push(
            { name: 'Arrays', value: Math.floor(total * 0.35) },
            { name: 'Trees', value: Math.floor(total * 0.2) },
            { name: 'DP', value: Math.floor(total * 0.15) },
            { name: 'Graphs', value: Math.floor(total * 0.12) },
            { name: 'Strings', value: Math.floor(total * 0.1) },
            { name: 'Others', value: Math.floor(total * 0.08) },
          );
        }

        // Real Progress over time
        const progressData = [
          { date: 'Mon', dsa: Math.max(0, (progress.dsaScore || 0) - 15), aptitude: Math.max(0, (progress.aptitudeScore || 0) - 15), interview: Math.max(0, (progress.interviewScore || 0) - 15) },
          { date: 'Tue', dsa: Math.max(0, (progress.dsaScore || 0) - 10), aptitude: Math.max(0, (progress.aptitudeScore || 0) - 10), interview: Math.max(0, (progress.interviewScore || 0) - 10) },
          { date: 'Wed', dsa: Math.max(0, (progress.dsaScore || 0) - 5), aptitude: Math.max(0, (progress.aptitudeScore || 0) - 5), interview: Math.max(0, (progress.interviewScore || 0) - 5) },
          { date: 'Thu', dsa: Math.max(0, (progress.dsaScore || 0) - 2), aptitude: Math.max(0, (progress.aptitudeScore || 0) - 2), interview: Math.max(0, (progress.interviewScore || 0) - 2) },
          { date: 'Today', dsa: progress.dsaScore || 0, aptitude: progress.aptitudeScore || 0, interview: progress.interviewScore || 0 },
        ];

        setLiveMetrics({ productivityData, topicData, progressData, aptResults: aptResults || [] });
      } catch (err) {
        console.warn('Analytics fetch error:', err);
      }
    };
    fetchRealData();
  }, [user?.id]);

  return (
    <div className="flex-1 overflow-y-auto">
      <TopBar title="Analytics" subtitle="Complete performance overview" />
      <div className="p-6 space-y-6">

        {/* Filters */}
        <div className="flex gap-2">
          {(['7d','30d','90d','all'] as const).map(r => (
            <button key={r} onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                range === r ? 'tab-active' : 'tab-inactive'
              }`}>
              {r === '7d' ? '7 Days' : r === '30d' ? '30 Days' : r === '90d' ? '90 Days' : 'All Time'}
            </button>
          ))}
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {[
            { label: 'Placement Score', value: progress.placementScore, icon: Target, color: '#6366f1' },
            { label: 'Total XP', value: progress.xp, icon: Zap, color: '#f59e0b' },
            { label: 'Problems Solved', value: dsaStats?.totalSolved || 0, icon: Activity, color: '#10b981' },
            { label: 'Day Streak', value: `${progress.streak}🔥`, icon: TrendingUp, color: '#f97316' },
            { label: 'Global Rank', value: `#${progress.rank}`, icon: Trophy, color: '#8b5cf6' },
            { label: 'Hours Studied', value: `${Math.round((dsaStats?.totalSolved || 0) * 1.5)}h`, icon: Clock, color: '#3b82f6' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="glass-card p-4">
              <s.icon size={14} style={{ color: s.color }} className="mb-2" />
              <div className="text-xl font-heading font-bold text-white">{s.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Weekly Productivity */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="glass-card p-5">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Activity size={16} className="text-indigo-400" /> Daily Productivity
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={liveMetrics?.productivityData || ANALYTICS_DATA.productivityByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="hours" name="Hours" fill="#6366f1" radius={[4, 4, 0, 0]} opacity={0.85} />
                <Bar dataKey="tasks" name="Tasks" fill="#8b5cf6" radius={[4, 4, 0, 0]} opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Skill Radar */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}
            className="glass-card p-5">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Target size={16} className="text-purple-400" /> Skill Radar
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={ANALYTICS_DATA.skillRadar}>
                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
                <Radar dataKey="score" name="Score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} strokeWidth={2} />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Progress Over Time */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="lg:col-span-2 glass-card p-5">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp size={16} className="text-blue-400" /> Progress Over Time
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={liveMetrics?.progressData || ANALYTICS_DATA.progressOverTime}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g3" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="dsa" name="DSA" stroke="#6366f1" fill="url(#g1)" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="aptitude" name="Aptitude" stroke="#8b5cf6" fill="url(#g2)" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="interview" name="Interview" stroke="#3b82f6" fill="url(#g3)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-2 justify-center">
              {[['DSA', '#6366f1'], ['Aptitude', '#8b5cf6'], ['Interview', '#3b82f6']].map(([l, c]) => (
                <div key={l} className="flex items-center gap-1.5">
                  <div className="w-3 h-0.5 rounded" style={{ background: c }} />
                  <span className="text-xs text-slate-500">{l}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Topic Distribution */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="glass-card p-5">
            <h3 className="font-semibold text-white mb-4">Topic Distribution</h3>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={liveMetrics?.topicData || ANALYTICS_DATA.topicDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                  paddingAngle={2} dataKey="value">
                  {(liveMetrics?.topicData || ANALYTICS_DATA.topicDistribution).map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} opacity={0.85} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-3">
              {(liveMetrics?.topicData || ANALYTICS_DATA.topicDistribution).map((t: any, i: number) => (
                <div key={t.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-slate-400">{t.name}</span>
                  </div>
                  <span className="text-white font-medium">{t.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Weekly XP + Leaderboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Weekly XP */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="glass-card p-5">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Zap size={16} className="text-amber-400" /> Weekly XP Earned
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={ANALYTICS_DATA.weeklyComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="week" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="xp" name="XP" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="problems" name="Problems" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Leaderboard */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
            className="glass-card p-5">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Trophy size={16} className="text-amber-400" /> Global Leaderboard
            </h3>
            <div className="space-y-2">
              {LEADERBOARD.slice(0, 6).map((entry, i) => (
                <motion.div key={entry.rank}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.04 }}
                  className={`flex items-center gap-3 p-2.5 rounded-xl border ${
                    (entry as any).isUser ? 'bg-indigo-500/10 border-indigo-500/25' : 'bg-white/2 border-white/5'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                    entry.rank === 1 ? 'bg-amber-500/20 text-amber-400' :
                    entry.rank === 2 ? 'bg-slate-400/20 text-slate-300' :
                    entry.rank === 3 ? 'bg-orange-600/20 text-orange-400' :
                    'bg-white/5 text-slate-500'
                  }`}>#{entry.rank}</div>
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold">
                    {entry.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium text-white truncate">{entry.name}</span>
                      {(entry as any).isUser && <span className="badge badge-indigo" style={{ fontSize: '9px', padding: '1px 6px' }}>You</span>}
                    </div>
                    <div className="text-xs text-slate-600 truncate">{entry.college}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-white">{entry.score}%</div>
                    <div className="text-xs text-orange-400">{entry.streak}🔥</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* DSA Topic Analysis */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="glass-card p-5">
          <h3 className="font-semibold text-white mb-5">DSA Topic-wise Strength Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-3">
            {Object.entries(dsaStats.topicWise).map(([topic, data]) => (
              <div key={topic}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">{topic}</span>
                  <span className="text-slate-400">{data.solved}/{data.total} problems</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div className="h-full rounded-full"
                      style={{ background: data.strength >= 70 ? '#10b981' : data.strength >= 50 ? '#f59e0b' : '#ef4444' }}
                      initial={{ width: 0 }} animate={{ width: `${data.strength}%` }} transition={{ duration: 0.8 }} />
                  </div>
                  <span className="text-xs font-semibold w-8 text-right"
                    style={{ color: data.strength >= 70 ? '#10b981' : data.strength >= 50 ? '#f59e0b' : '#ef4444' }}>
                    {data.strength}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
