import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Flame, Zap, Trophy, ChevronDown } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { Link, useNavigate } from 'react-router-dom';

interface TopBarProps {
  title?: string;
  subtitle?: string;
}

export default function TopBar({ title = 'Dashboard', subtitle }: TopBarProps) {
  const { notifications, markNotificationRead, markAllRead, progress, user, logout } = useStore();
  const navigate = useNavigate();
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const unread = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    logout();
    setShowProfile(false);
    navigate('/login');
  };

  const typeColors: Record<string, string> = {
    achievement: 'text-amber-400',
    alert: 'text-red-400',
    reminder: 'text-indigo-400',
    info: 'text-blue-400',
    success: 'text-emerald-400',
  };

  const formatTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-dark-200/80 backdrop-blur-xl sticky top-0 z-30">
      <div>
        <h1 className="font-heading font-bold text-xl text-white">{title}</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          {subtitle || new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Stats */}
        <div className="hidden md:flex items-center gap-3 mr-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20">
            <Flame size={14} className="text-orange-400" />
            <span className="text-sm font-semibold text-orange-400">{progress.streak}</span>
            <span className="text-xs text-orange-500/70">streak</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
            <Zap size={14} className="text-indigo-400" />
            <span className="text-sm font-semibold text-indigo-400">{progress.xp.toLocaleString()}</span>
            <span className="text-xs text-indigo-500/70">XP</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <Trophy size={14} className="text-amber-400" />
            <span className="text-sm font-semibold text-amber-400">#{progress.rank}</span>
          </div>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setShowNotif(!showNotif); setShowProfile(false); }}
            className="relative p-2.5 rounded-xl bg-white/4 border border-white/8 hover:bg-white/8 transition-all"
          >
            <Bell size={18} className="text-slate-400" />
            {unread > 0 && (
              <span className="notification-badge">{unread > 9 ? '9+' : unread}</span>
            )}
          </button>

          <AnimatePresence>
            {showNotif && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                className="absolute right-0 top-12 w-80 z-50 overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/70"
                style={{ background: '#0d0d1a' }}
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/6">
                  <h3 className="font-semibold text-sm text-white">Notifications</h3>
                  <button onClick={markAllRead} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                    Mark all read
                  </button>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-slate-500 text-sm">No notifications</div>
                  ) : (
                    notifications.slice(0, 8).map((n) => (
                      <motion.div
                        key={n.id}
                        onClick={() => markNotificationRead(n.id)}
                        whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                        className={`flex gap-3 px-4 py-3 cursor-pointer border-b border-white/4 ${!n.read ? 'bg-indigo-500/5' : ''}`}
                      >
                        <span className="text-lg flex-shrink-0 mt-0.5">{n.icon || '📌'}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className={`text-xs font-semibold ${typeColors[n.type] || 'text-white'}`}>{n.title}</p>
                            {!n.read && <div className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0 ml-2" />}
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                          <p className="text-xs text-slate-600 mt-1">{formatTime(n.createdAt)}</p>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => { setShowProfile(!showProfile); setShowNotif(false); }}
            className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-xl hover:bg-white/5 transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold">
              {user?.name?.[0] || 'S'}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-sm font-medium text-white leading-none">{user?.name || 'Student'}</div>
              <div className="text-xs text-slate-500 mt-0.5">Lv.{progress.level}</div>
            </div>
            <ChevronDown size={14} className="text-slate-500" />
          </button>

          <AnimatePresence>
            {showProfile && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="absolute right-0 top-12 w-56 z-50 rounded-2xl border border-white/10 shadow-2xl shadow-black/70 overflow-hidden"
                style={{ background: '#0d0d1a' }}
              >
                {/* User info header */}
                <div className="px-4 py-3 border-b border-white/8">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                      {user?.name?.[0]?.toUpperCase() || 'S'}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-white truncate">{user?.name || 'Student'}</div>
                      <div className="text-xs text-slate-500 truncate">{user?.email || ''}</div>
                    </div>
                  </div>
                </div>
                <div className="py-1">
                  {[
                    { label: '👤 View Profile', path: '/settings' },
                    { label: '📊 Analytics', path: '/analytics' },
                    { label: '⚙️ Settings', path: '/settings' },
                  ].map(item => (
                    <Link key={item.label} to={item.path} onClick={() => setShowProfile(false)}>
                      <div className="px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/6 transition-all cursor-pointer">
                        {item.label}
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="border-t border-white/8">
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all">
                    🚪 Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {(showNotif || showProfile) && (
        <div className="fixed inset-0 z-20" onClick={() => { setShowNotif(false); setShowProfile(false); }} />
      )}
    </header>
  );
}
