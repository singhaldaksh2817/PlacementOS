// src/components/PlatformStats.tsx
import { useEffect, useState } from 'react';
import { Code2, Star, Users, BookOpen, GitBranch } from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchLeetCodeStats, fetchGitHubStats, type LeetCodeStats, type GitHubStats } from '../lib/platformSync';
import { useStore } from '../store/useStore';

export default function PlatformStats() {
  const { user } = useStore();
  const [lcStats, setLcStats] = useState<LeetCodeStats | null>(null);
  const [ghStats, setGhStats] = useState<GitHubStats | null>(null);
  const [lcLoading, setLcLoading] = useState(false);
  const [ghLoading, setGhLoading] = useState(false);
  const [synced, setSynced] = useState(false);

  const syncAll = async () => {
    if (!user?.leetcodeUsername && !user?.githubUsername) return;
    setSynced(false);

    if (user.leetcodeUsername) {
      setLcLoading(true);
      const stats = await fetchLeetCodeStats(user.leetcodeUsername);
      setLcStats(stats);
      setLcLoading(false);
    }

    if (user.githubUsername) {
      setGhLoading(true);
      const stats = await fetchGitHubStats(user.githubUsername);
      setGhStats(stats);
      setGhLoading(false);
    }

    setSynced(true);
  };

  useEffect(() => {
    if (user?.leetcodeUsername || user?.githubUsername) {
      syncAll();
    }
  }, [user?.leetcodeUsername, user?.githubUsername]);

  const hasAny = user?.leetcodeUsername || user?.githubUsername;

  if (!hasAny) {
    return (
      <div className="glass-card p-4 border border-dashed border-white/10">
        <div className="text-center py-2">
          <p className="text-sm text-slate-500">🔗 Link your GitHub & LeetCode in</p>
          <a href="/settings" className="text-xs text-indigo-400 hover:text-indigo-300">Settings → Platform Integration</a>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-300">🔗 Platform Stats</h3>
        <button onClick={syncAll} disabled={lcLoading || ghLoading}
          className="text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-50">
          {(lcLoading || ghLoading) ? '⟳ Syncing...' : '↻ Refresh'}
        </button>
      </div>

      {/* LeetCode Card */}
      {user?.leetcodeUsername && (
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Code2 size={16} className="text-amber-400" />
            <span className="text-sm font-semibold text-white">LeetCode</span>
            <span className="text-xs text-slate-500">@{user.leetcodeUsername}</span>
            {lcLoading && <div className="w-3 h-3 border border-amber-400/30 border-t-amber-400 rounded-full animate-spin ml-auto" />}
          </div>
          {lcStats ? (
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'Total', value: lcStats.totalSolved, color: 'text-white' },
                { label: 'Easy', value: lcStats.easySolved, color: 'text-emerald-400' },
                { label: 'Medium', value: lcStats.mediumSolved, color: 'text-amber-400' },
                { label: 'Hard', value: lcStats.hardSolved, color: 'text-red-400' },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <div className={`text-lg font-bold font-heading ${s.color}`}>{s.value}</div>
                  <div className="text-xs text-slate-500">{s.label}</div>
                </div>
              ))}
            </div>
          ) : !lcLoading ? (
            <p className="text-xs text-slate-500">Could not load stats. Check username in Settings.</p>
          ) : null}
        </div>
      )}

      {/* GitHub Card */}
      {user?.githubUsername && (
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <GitBranch size={16} className="text-slate-300" />
            <span className="text-sm font-semibold text-white">GitHub</span>
            <span className="text-xs text-slate-500">@{user.githubUsername}</span>
            {ghLoading && <div className="w-3 h-3 border border-slate-400/30 border-t-slate-400 rounded-full animate-spin ml-auto" />}
          </div>
          {ghStats ? (
            <>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {[
                  { icon: BookOpen, label: 'Repos', value: ghStats.publicRepos },
                  { icon: Star, label: 'Stars', value: ghStats.totalStars },
                  { icon: Users, label: 'Followers', value: ghStats.followers },
                ].map(s => (
                  <div key={s.label} className="text-center">
                    <div className="text-lg font-bold font-heading text-white">{s.value}</div>
                    <div className="text-xs text-slate-500">{s.label}</div>
                  </div>
                ))}
              </div>
              {ghStats.topLanguages.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {ghStats.topLanguages.map(lang => (
                    <span key={lang} className="text-xs px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/20">{lang}</span>
                  ))}
                </div>
              )}
            </>
          ) : !ghLoading ? (
            <p className="text-xs text-slate-500">Could not load stats. Check username in Settings.</p>
          ) : null}
        </div>
      )}
    </motion.div>
  );
}
