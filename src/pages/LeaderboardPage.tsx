import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TopBar from '../components/layout/TopBar';
import {
  Trophy, Flame, Code2, Building2, BookOpen, Crown,
  Medal, Award, Search, Sparkles, Filter, Users, TrendingUp
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { supabase } from '../lib/supabaseClient';

export interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  avatar?: string;
  college: string;
  targetCompany: string;
  xp: number;
  streak: number;
  problemsSolved: number;
  level: number;
  placementScore: number;
  isCurrentUser?: boolean;
}

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  {
    id: 'mock-1',
    rank: 1,
    name: 'Rohan Sharma',
    college: 'IIT Bombay',
    targetCompany: 'Google',
    xp: 28450,
    streak: 42,
    problemsSolved: 485,
    level: 29,
    placementScore: 96,
  },
  {
    id: 'mock-2',
    rank: 2,
    name: 'Ananya Gupta',
    college: 'IIT Delhi',
    targetCompany: 'Microsoft',
    xp: 25120,
    streak: 35,
    problemsSolved: 420,
    level: 26,
    placementScore: 94,
  },
  {
    id: 'mock-3',
    rank: 3,
    name: 'Priya Verma',
    college: 'BITS Pilani',
    targetCompany: 'Amazon',
    xp: 22890,
    streak: 28,
    problemsSolved: 390,
    level: 23,
    placementScore: 91,
  },
  {
    id: 'mock-4',
    rank: 4,
    name: 'Aarav Patel',
    college: 'IIT Bombay',
    targetCompany: 'Uber',
    xp: 19800,
    streak: 21,
    problemsSolved: 310,
    level: 20,
    placementScore: 88,
  },
  {
    id: 'mock-5',
    rank: 5,
    name: 'Devish Kumar',
    college: 'NIT Trichy',
    targetCompany: 'Goldman Sachs',
    xp: 17540,
    streak: 19,
    problemsSolved: 285,
    level: 18,
    placementScore: 85,
  },
  {
    id: 'mock-6',
    rank: 6,
    name: 'Sneha Reddy',
    college: 'IIIT Hyderabad',
    targetCompany: 'Atlassian',
    xp: 16200,
    streak: 15,
    problemsSolved: 260,
    level: 17,
    placementScore: 83,
  },
  {
    id: 'mock-7',
    rank: 7,
    name: 'Karan Mehta',
    college: 'IIT Kharagpur',
    targetCompany: 'Adobe',
    xp: 14900,
    streak: 14,
    problemsSolved: 240,
    level: 15,
    placementScore: 80,
  },
  {
    id: 'mock-8',
    rank: 8,
    name: 'Vikram Joshi',
    college: 'DTU Delhi',
    targetCompany: 'Flipkart',
    xp: 13500,
    streak: 12,
    problemsSolved: 210,
    level: 14,
    placementScore: 78,
  },
];

type FilterTab = 'Overall XP' | 'DSA Solved' | 'Streak Masters' | 'My College';

export default function LeaderboardPage() {
  const { user, progress, dsaStats } = useStore();
  const [activeTab, setActiveTab] = useState<FilterTab>('Overall XP');
  const [searchQuery, setSearchQuery] = useState('');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch live profiles & progress from Supabase with fallback to mock data
  useEffect(() => {
    async function loadLeaderboard() {
      try {
        setLoading(true);
        // Query profiles and progress from Supabase
        const { data: profiles, error: pError } = await supabase
          .from('profiles')
          .select('id, name, college, target_companies');

        const { data: progressList, error: prError } = await supabase
          .from('progress')
          .select('user_id, xp, streak, level, placement_score');

        const { data: dsaList } = await supabase
          .from('dsa_stats')
          .select('user_id, total_solved');

        if (profiles && profiles.length > 0 && progressList) {
          const progressMap = new Map(progressList.map(p => [p.user_id, p]));
          const dsaMap = new Map((dsaList || []).map(d => [d.user_id, d]));

          let combined: LeaderboardEntry[] = profiles.map(prof => {
            const prog = progressMap.get(prof.id);
            const dsa = dsaMap.get(prof.id);
            const targets = typeof prof.target_companies === 'string'
              ? JSON.parse(prof.target_companies || '[]')
              : prof.target_companies;

            return {
              id: prof.id,
              rank: 0,
              name: prof.name || 'Student',
              college: prof.college || 'Engineering College',
              targetCompany: (targets && targets[0]) || 'Google',
              xp: prog?.xp || 0,
              streak: prog?.streak || 0,
              problemsSolved: dsa?.total_solved || 0,
              level: prog?.level || 1,
              placementScore: prog?.placement_score || 10,
              isCurrentUser: user?.id === prof.id,
            };
          });

          // If current user is not in Supabase list, include local user profile
          if (user && !combined.some(c => c.id === user.id)) {
            combined.push({
              id: user.id,
              rank: 0,
              name: user.name || 'Student',
              college: user.college || 'IIT Bombay',
              targetCompany: (user.targetCompanies && user.targetCompanies[0]) || 'Google',
              xp: progress.xp,
              streak: progress.streak,
              problemsSolved: dsaStats.totalSolved,
              level: progress.level,
              placementScore: progress.placementScore,
              isCurrentUser: true,
            });
          }

          // Combine with mock data to ensure a full active leaderboard experience
          const mockEntriesFiltered = MOCK_LEADERBOARD.filter(
            m => !combined.some(c => c.name.toLowerCase() === m.name.toLowerCase())
          );
          const fullList = [...combined, ...mockEntriesFiltered];
          setLeaderboardData(fullList);
        } else {
          // Fallback to mock data with current user injected
          const listWithUser = [...MOCK_LEADERBOARD];
          if (user) {
            const userEntry: LeaderboardEntry = {
              id: user.id,
              rank: 0,
              name: user.name || 'Student',
              college: user.college || 'Engineering College',
              targetCompany: (user.targetCompanies && user.targetCompanies[0]) || 'Google',
              xp: progress.xp ?? 0,
              streak: progress.streak ?? 0,
              problemsSolved: dsaStats.totalSolved ?? 0,
              level: progress.level ?? 1,
              placementScore: progress.placementScore ?? 0,
              isCurrentUser: true,
            };
            const existingIdx = listWithUser.findIndex(u => u.id === user.id || u.name === user.name);
            if (existingIdx !== -1) {
              listWithUser[existingIdx] = userEntry;
            } else {
              listWithUser.push(userEntry);
            }
          }
          setLeaderboardData(listWithUser);
        }
      } catch (err) {
        console.error('Failed to load leaderboard data:', err);
        setLeaderboardData(MOCK_LEADERBOARD);
      } finally {
        setLoading(false);
      }
    }

    loadLeaderboard();
  }, [user?.id, progress?.xp, progress?.streak, dsaStats?.totalSolved]);


  // Filter & Sort Logic based on Active Tab
  const getProcessedLeaderboard = (): LeaderboardEntry[] => {
    let list = [...leaderboardData];

    // Filter by college if tab is "My College"
    if (activeTab === 'My College') {
      const myCollege = user?.college || 'IIT Bombay';
      list = list.filter(item =>
        item.college.toLowerCase().includes(myCollege.toLowerCase()) || item.isCurrentUser
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(item =>
        item.name.toLowerCase().includes(q) ||
        item.college.toLowerCase().includes(q) ||
        item.targetCompany.toLowerCase().includes(q)
      );
    }

    // Sort based on active tab
    if (activeTab === 'DSA Solved') {
      list.sort((a, b) => b.problemsSolved - a.problemsSolved || b.xp - a.xp);
    } else if (activeTab === 'Streak Masters') {
      list.sort((a, b) => b.streak - a.streak || b.xp - a.xp);
    } else {
      // Overall XP or My College default sort
      list.sort((a, b) => b.xp - a.xp || b.problemsSolved - a.problemsSolved);
    }

    // Re-assign 1-based ranks
    return list.map((item, idx) => ({ ...item, rank: idx + 1 }));
  };

  const processedList = getProcessedLeaderboard();
  const top1 = processedList[0];
  const top2 = processedList[1];
  const top3 = processedList[2];
  const remainingList = processedList.slice(3);
  const currentUserRank = processedList.find(item => item.isCurrentUser || item.id === user?.id);

  return (
    <div className="flex-1 overflow-y-auto">
      <TopBar title="Live Leaderboard 🏆" subtitle="Compete with top students nationwide across XP, DSA, & Streaks" />
      
      <div className="p-6 space-y-6">

        {/* Hero Header Banner */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 bg-gradient-to-r from-amber-500/15 via-indigo-600/10 to-purple-600/15 border-amber-500/30 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="badge badge-amber flex items-center gap-1">
                  <Sparkles size={12} /> Live Placement Rankings
                </span>
                <span className="badge bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1 text-xs">
                  <Users size={12} /> {processedList.length}+ Active Candidates
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white font-heading">
                PlacementOS Honor Roll 🥇
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                Solve DSA problems, complete mock interviews, and maintain daily streaks to climb up the college & national leaderboards!
              </p>
            </div>

            {/* Current user quick stats widget */}
            {currentUserRank && (
              <div className="glass-card p-3.5 bg-white/5 border border-white/10 flex items-center gap-4 self-start md:self-auto">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg">
                  {user?.name?.[0] || 'Me'}
                </div>
                <div>
                  <div className="text-xs text-slate-400">Your Current Rank</div>
                  <div className="text-xl font-bold font-heading text-amber-400 flex items-center gap-1">
                    #{currentUserRank.rank} <span className="text-xs font-normal text-slate-400">of {processedList.length}</span>
                  </div>
                </div>
                <div className="pl-3 border-l border-white/10 text-right">
                  <div className="text-sm font-bold text-indigo-300">{currentUserRank.xp.toLocaleString()} XP</div>
                  <div className="text-xs text-orange-400 flex items-center gap-1 justify-end">
                    <Flame size={11} /> {currentUserRank.streak}d streak
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Filter Tabs & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex gap-2 flex-wrap">
            {(['Overall XP', 'DSA Solved', 'Streak Masters', 'My College'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === tab ? 'tab-active' : 'tab-inactive'}`}>
                {tab === 'Overall XP' && '🏆 '}
                {tab === 'DSA Solved' && '💻 '}
                {tab === 'Streak Masters' && '🔥 '}
                {tab === 'My College' && '🎓 '}
                {tab}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by student, college..."
              className="input-dark input-icon-left w-full py-2 text-xs"
            />
          </div>

        </div>

        {/* PODIUM CARDS (#1, #2, #3) */}
        {processedList.length >= 3 && !searchQuery && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 items-end">
            
            {/* Rank 2 - Silver */}
            {top2 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="glass-card p-5 bg-gradient-to-b from-slate-400/10 to-slate-800/20 border-slate-400/30 text-center relative overflow-hidden order-2 md:order-1">
                <div className="absolute top-2 right-3">
                  <Medal size={28} className="text-slate-300 drop-shadow" />
                </div>
                <div className="inline-block p-1 bg-slate-400/20 rounded-full mb-2">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-300 to-slate-500 flex items-center justify-center font-bold text-2xl text-slate-950 shadow-xl border-2 border-slate-300">
                    {top2.name[0]}
                  </div>
                </div>
                <div className="badge bg-slate-400/20 text-slate-300 mx-auto mb-2 text-xs font-bold px-3 py-0.5 border border-slate-400/40">
                  #2 Silver Podium
                </div>
                <h3 className="font-heading font-bold text-white text-base truncate">{top2.name}</h3>
                <p className="text-xs text-slate-400 truncate">{top2.college}</p>
                <span className="inline-block mt-1 text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                  Target: {top2.targetCompany}
                </span>

                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/10 text-xs">
                  <div>
                    <div className="text-amber-400 font-bold">{top2.xp.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-500">XP</div>
                  </div>
                  <div>
                    <div className="text-indigo-400 font-bold">{top2.problemsSolved}</div>
                    <div className="text-[10px] text-slate-500">DSA</div>
                  </div>
                  <div>
                    <div className="text-orange-400 font-bold">{top2.streak}d</div>
                    <div className="text-[10px] text-slate-500">Streak</div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Rank 1 - Gold */}
            {top1 && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
                className="glass-card p-6 bg-gradient-to-b from-amber-500/20 via-amber-500/5 to-slate-900/40 border-amber-400/50 text-center relative overflow-hidden order-1 md:order-2 shadow-2xl shadow-amber-500/10 -mt-4">
                <div className="absolute top-2 right-3">
                  <Crown size={36} className="text-amber-400 animate-pulse drop-shadow-lg" />
                </div>
                <div className="inline-block p-1.5 bg-amber-400/20 rounded-full mb-2">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-600 flex items-center justify-center font-bold text-3xl text-slate-950 shadow-2xl border-4 border-amber-300">
                    {top1.name[0]}
                  </div>
                </div>
                <div className="badge bg-amber-400/20 text-amber-300 mx-auto mb-2 text-xs font-bold px-3 py-1 border border-amber-400/50 flex items-center gap-1 w-fit">
                  <Crown size={12} /> #1 Champion Podium
                </div>
                <h3 className="font-heading font-bold text-white text-lg truncate">{top1.name}</h3>
                <p className="text-xs text-slate-300 font-medium truncate">{top1.college}</p>
                <span className="inline-block mt-1.5 text-xs px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40">
                  Target: {top1.targetCompany}
                </span>

                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-amber-500/20 text-xs">
                  <div>
                    <div className="text-amber-400 font-bold text-sm">{top1.xp.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-400">XP</div>
                  </div>
                  <div>
                    <div className="text-indigo-400 font-bold text-sm">{top1.problemsSolved}</div>
                    <div className="text-[10px] text-slate-400">DSA</div>
                  </div>
                  <div>
                    <div className="text-orange-400 font-bold text-sm">{top1.streak}d</div>
                    <div className="text-[10px] text-slate-400">Streak</div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Rank 3 - Bronze */}
            {top3 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="glass-card p-5 bg-gradient-to-b from-amber-700/15 to-slate-800/20 border-amber-700/30 text-center relative overflow-hidden order-3">
                <div className="absolute top-2 right-3">
                  <Award size={28} className="text-amber-600 drop-shadow" />
                </div>
                <div className="inline-block p-1 bg-amber-700/20 rounded-full mb-2">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center font-bold text-2xl text-amber-100 shadow-xl border-2 border-amber-600">
                    {top3.name[0]}
                  </div>
                </div>
                <div className="badge bg-amber-700/20 text-amber-400 mx-auto mb-2 text-xs font-bold px-3 py-0.5 border border-amber-700/40">
                  #3 Bronze Podium
                </div>
                <h3 className="font-heading font-bold text-white text-base truncate">{top3.name}</h3>
                <p className="text-xs text-slate-400 truncate">{top3.college}</p>
                <span className="inline-block mt-1 text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                  Target: {top3.targetCompany}
                </span>

                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/10 text-xs">
                  <div>
                    <div className="text-amber-400 font-bold">{top3.xp.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-500">XP</div>
                  </div>
                  <div>
                    <div className="text-indigo-400 font-bold">{top3.problemsSolved}</div>
                    <div className="text-[10px] text-slate-500">DSA</div>
                  </div>
                  <div>
                    <div className="text-orange-400 font-bold">{top3.streak}d</div>
                    <div className="text-[10px] text-slate-500">Streak</div>
                  </div>
                </div>
              </motion.div>
            )}

          </div>
        )}

        {/* LEADERBOARD TABLE FOR ALL RANKINGS */}
        <div className="glass-card overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h3 className="font-semibold text-white text-sm flex items-center gap-2">
              <Trophy size={16} className="text-amber-400" /> Full Candidate Leaderboard ({processedList.length})
            </h3>
            <span className="text-xs text-slate-400">Sorted by {activeTab}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-white/4 text-slate-400 uppercase font-semibold border-b border-white/10">
                <tr>
                  <th className="p-3.5 pl-5">Rank</th>
                  <th className="p-3.5">Candidate</th>
                  <th className="p-3.5">College</th>
                  <th className="p-3.5">Target</th>
                  <th className="p-3.5 text-center">XP</th>
                  <th className="p-3.5 text-center">DSA Solved</th>
                  <th className="p-3.5 text-center">Streak</th>
                  <th className="p-3.5 text-right pr-5">Readiness</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {processedList.map((item) => (
                  <tr key={item.id}
                    className={`transition-colors hover:bg-white/4 ${
                      item.isCurrentUser ? 'bg-indigo-500/15 border-l-4 border-l-indigo-500 font-medium' : ''
                    }`}>
                    
                    {/* Rank */}
                    <td className="p-3.5 pl-5 font-heading font-bold">
                      {item.rank === 1 ? <span className="text-amber-400 text-sm flex items-center gap-1">🥇 #1</span> :
                       item.rank === 2 ? <span className="text-slate-300 text-sm flex items-center gap-1">🥈 #2</span> :
                       item.rank === 3 ? <span className="text-amber-600 text-sm flex items-center gap-1">🥉 #3</span> :
                       <span className="text-slate-400">#{item.rank}</span>}
                    </td>

                    {/* Name */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs ${
                          item.isCurrentUser ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : 'bg-white/10'
                        }`}>
                          {item.name[0]}
                        </div>
                        <div>
                          <div className="text-white font-medium flex items-center gap-1.5">
                            {item.name}
                            {item.isCurrentUser && <span className="badge badge-indigo text-[10px] py-0 px-1.5">You</span>}
                          </div>
                          <div className="text-[10px] text-slate-500">Lvl {item.level}</div>
                        </div>
                      </div>
                    </td>

                    {/* College */}
                    <td className="p-3.5 text-slate-400">{item.college}</td>

                    {/* Target Company */}
                    <td className="p-3.5">
                      <span className="badge bg-purple-500/15 text-purple-300 border border-purple-500/20 text-[11px]">
                        {item.targetCompany}
                      </span>
                    </td>

                    {/* XP */}
                    <td className="p-3.5 text-center font-bold text-amber-400">
                      {item.xp.toLocaleString()}
                    </td>

                    {/* DSA Solved */}
                    <td className="p-3.5 text-center font-bold text-indigo-400">
                      {item.problemsSolved}
                    </td>

                    {/* Streak */}
                    <td className="p-3.5 text-center font-bold text-orange-400">
                      <span className="flex items-center justify-center gap-1">
                        <Flame size={12} /> {item.streak}d
                      </span>
                    </td>

                    {/* Placement Score */}
                    <td className="p-3.5 text-right pr-5">
                      <div className="inline-flex items-center gap-1.5 font-bold gradient-text">
                        {item.placementScore}%
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
