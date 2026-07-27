import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Code2, Brain, MessageSquare, Map, Building2,
  FileText, BarChart3, Settings, ChevronLeft, ChevronRight,
  Zap, Trophy, Flame, LogOut, Shield, Cpu, Layers, Briefcase, Users
} from 'lucide-react';
import { useStore } from '../../store/useStore';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/dsa', icon: Code2, label: 'DSA Tracker' },
  { path: '/system-design', icon: Layers, label: 'System Design 📐' },
  { path: '/drives', icon: Briefcase, label: 'Job Drives 💼' },
  { path: '/aptitude', icon: Brain, label: 'Aptitude' },
  { path: '/interview', icon: MessageSquare, label: 'AI Interview' },
  { path: '/peer-interview', icon: Users, label: 'Peer Interview 🤝' },

  { path: '/roadmap', icon: Map, label: 'Roadmap' },
  { path: '/leaderboard', icon: Trophy, label: 'Leaderboard 🏆' },
  { path: '/oa-simulator', icon: Zap, label: 'OA Simulator ⚡' },
  { path: '/companies', icon: Building2, label: 'Companies' },
  { path: '/resume', icon: FileText, label: 'Resume' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  {path: '/chat', icon: MessageSquare, label: 'AI Mentor' },
  { path: '/orchestrator', icon: Cpu, label: 'Agent Engine' },
  { path: '/pricing', icon: Zap, label: 'Upgrade Pro ⚡' },
];



const bottomItems = [
  { path: '/settings', icon: Settings, label: 'Settings' },
  { path: '/admin', icon: Shield, label: 'Admin' },
];

export default function Sidebar() {
  const location = useLocation();
  const { user, progress, sidebarCollapsed, toggleSidebar, logout } = useStore();
  const xpPercent = ((progress.xp % 1000) / 1000) * 100;
  const xpToNextLevel = 1000 - (progress.xp % 1000);

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="sidebar h-screen z-40 flex flex-col overflow-hidden flex-shrink-0"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0 shadow-lg">
          <Zap size={18} className="text-white" />
        </div>
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex flex-col"
            >
              <span className="font-heading font-bold text-lg gradient-text leading-none">PlacementOS</span>
              <span className="text-xs text-slate-500 mt-0.5">AI Prep Platform</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* XP Bar */}
      <AnimatePresence>
        {!sidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mx-3 mt-3 p-3 rounded-xl bg-white/3 border border-white/5"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Trophy size={12} className="text-amber-400" />
                <span className="text-xs font-semibold text-amber-400">Level {progress.level}</span>
              </div>
              <div className="flex items-center gap-1">
                <Flame size={11} className="text-orange-400" />
                <span className="text-xs text-orange-400">{progress.streak}d</span>
              </div>
            </div>
            <div className="xp-bar">
              <motion.div
                className="xp-bar-fill"
                initial={{ width: 0 }}
                animate={{ width: `${xpPercent}%` }}
                transition={{ duration: 1, delay: 0.3 }}
              />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-xs text-slate-500">{progress.xp.toLocaleString()} XP</span>
              <span className="text-xs text-slate-600">{xpToNextLevel} to next</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nav Items */}
      <nav className="flex-1 px-2 mt-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path}>
              <motion.div
                whileHover={{ x: sidebarCollapsed ? 0 : 3 }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
                  active
                    ? 'bg-indigo-500/20 border border-indigo-500/30 text-indigo-300'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/4'
                }`}
              >
                <item.icon size={18} className={`flex-shrink-0 ${active ? 'text-indigo-400' : ''}`} />
                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      className="text-sm font-medium whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {active && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0"
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-2 pb-4 space-y-0.5 border-t border-white/5 pt-3">
        {bottomItems.map((item) => {
          const active = location.pathname === item.path;
          // Hide admin link from non-admin users
          if (item.path === '/admin' && user?.role !== 'admin') return null;
          return (
            <Link key={item.path} to={item.path}>
              <motion.div
                whileHover={{ x: sidebarCollapsed ? 0 : 3 }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                  active ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-500 hover:text-slate-300 hover:bg-white/4'
                }`}
              >
                <item.icon size={18} className="flex-shrink-0" />
                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="text-sm font-medium"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          );
        })}

        {/* User profile */}
        <div className={`flex items-center gap-3 px-3 py-2.5 mt-2 rounded-xl bg-white/3 border border-white/6 ${
          sidebarCollapsed ? 'justify-center' : ''
        }`}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 text-sm font-bold">
            {user?.name?.[0] || 'S'}
          </div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">{user?.name || 'Student'}</div>
                <div className="text-xs text-slate-500 truncate">{user?.email || 'student@college.edu'}</div>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={logout}
                className="text-slate-600 hover:text-red-400 transition-colors p-1"
              >
                <LogOut size={14} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Toggle */}
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center py-2 text-slate-600 hover:text-slate-400 transition-colors"
        >
          {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </motion.aside>
  );
}
