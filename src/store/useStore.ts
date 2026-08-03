import { create } from 'zustand';
import axios from 'axios';
import confetti from 'canvas-confetti';
import { supabase } from '../lib/supabaseClient';
import { playLevelUpSound } from '../lib/soundEffects';
import type { User, UserProgress, Notification, ChatMessage, AgentStatus, DSAStats, Achievement, InterviewSession, Coupon } from '../types';



const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create an Axios instance that attaches the JWT token to every request for Gemini AI calls
const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('placementos-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface AppState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  isProUser: boolean;
  upgradeToPro: () => void;
  cancelPro: () => void;
  
  // Coupons & Promo Codes
  coupons: Coupon[];
  activeCoupon: Coupon | null;
  applyCoupon: (code: string) => { success: boolean; discountPercent: number; message: string };
  addCoupon: (coupon: Coupon) => void;
  toggleCoupon: (code: string) => void;
  deleteCoupon: (code: string) => void;

  login: (email: string, password: string) => Promise<'ok' | 'invalid' | 'notfound' | 'unconfirmed' | string>;

  register: (data: any) => Promise<'ok' | 'exists'>;
  logout: () => void;
  setDemoMode: () => void;
  setAdminDemoMode: () => void;
  updateUser: (updates: Partial<User>) => void;

  syncProfile: () => Promise<void>;


  // Progress
  progress: UserProgress;
  updateProgress: (updates: Partial<UserProgress>) => void;
  addXP: (amount: number) => void;
  removeXP: (amount: number) => void;


  // Interview Sessions History
  interviewSessions: InterviewSession[];
  addInterviewSession: (session: InterviewSession) => Promise<void>;
  syncInterviewSessions: () => Promise<void>;

  // Notifications
  notifications: Notification[];
  addNotification: (n: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  markAllRead: () => void;
  clearNotifications: () => void;
  syncNotifications: () => Promise<void>;

  // Chat
  chatMessages: ChatMessage[];
  addChatMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearChat: () => void;

  // Agent Status
  agentStatuses: AgentStatus[];
  updateAgentStatus: (id: string, updates: Partial<AgentStatus>) => void;

  // DSA
  dsaStats: DSAStats;
  updateDSAStats: (updates: Partial<DSAStats>) => void;
  submitDSASolution: (problemId: string, difficulty: 'Easy' | 'Medium' | 'Hard') => Promise<void>;

  // Sidebar
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

const INITIAL_CHAT: ChatMessage[] = [{
  id: '1', role: 'assistant',
  content: "Hey! I'm your AI Mentor 🚀 I know your complete placement journey — your strengths, weaknesses, target companies, and everything in between. Ask me anything!",
  timestamp: new Date(Date.now() - 60000).toISOString(),
  agentType: 'mentor',
}];

const defaultAgents: AgentStatus[] = [
  { id: 'dsa', name: 'DSA Agent', status: 'idle', lastAction: 'Waiting for activity', tasksCompleted: 0 },
  { id: 'aptitude', name: 'Aptitude Agent', status: 'idle', lastAction: 'Waiting for first test', tasksCompleted: 0 },
  { id: 'interview', name: 'Interview Agent', status: 'idle', lastAction: 'Waiting for first interview', tasksCompleted: 0 },
  { id: 'roadmap', name: 'Roadmap Agent', status: 'active', lastAction: 'Building your personalized roadmap', tasksCompleted: 1, currentTask: 'Personalizing schedule' },
  { id: 'company', name: 'Company Agent', status: 'active', lastAction: 'Loading company intelligence', tasksCompleted: 2, currentTask: 'Indexing hiring data' },
  { id: 'resume', name: 'Resume Agent', status: 'idle', lastAction: 'Ready to analyze your resume', tasksCompleted: 0 },
];

function createFreshAchievements(): Achievement[] {
  return [
    { id: '1', title: '100 Problems', description: 'Solve 100 problems', icon: '🎯', xpReward: 500, category: 'dsa', rarity: 'rare', unlocked: false },
    { id: '2', title: 'Streak Master', description: '20 day streak', icon: '🔥', xpReward: 1000, category: 'streak', rarity: 'epic', unlocked: false },
    { id: '3', title: 'Interview Ready', description: 'Complete 10 mock interviews', icon: '💼', xpReward: 750, category: 'interview', rarity: 'rare', unlocked: false },
    { id: '4', title: 'Aptitude King', description: 'Score 90%+ in aptitude', icon: '🧠', xpReward: 600, category: 'aptitude', rarity: 'epic', unlocked: false },
    { id: '5', title: 'Hard Crusher', description: 'Solve 50 hard problems', icon: '💪', xpReward: 2000, category: 'dsa', rarity: 'legendary', unlocked: false },
    { id: '6', title: 'Consistency', description: '7 day streak', icon: '⚡', xpReward: 300, category: 'streak', rarity: 'common', unlocked: false },
  ];
}

function createFreshTopicWise(): Record<string, { solved: number; total: number; strength: number }> {
  const topics = ['Arrays', 'Strings', 'Linked List', 'Trees', 'Graphs', 'Dynamic Programming', 'HashMap', 'Stacks', 'Queues', 'Binary Search', 'Two Pointer', 'Sliding Window', 'Heap', 'Trie', 'Backtracking', 'Greedy', 'System Design', 'BFS', 'DFS'];
  const obj: Record<string, any> = {};
  topics.forEach(t => {
    obj[t] = { solved: 0, total: 30, strength: 0 };
  });
  return obj;
}

function createFreshDailyActivity(): { date: string; count: number; problems: string[] }[] {
  const result: { date: string; count: number; problems: string[] }[] = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    result.push({ date: d.toISOString().split('T')[0], count: 0, problems: [] });
  }
  return result;
}


function calculateRankFromXP(xp: number): number {
  return Math.max(1, Math.min(999, 250 - Math.floor(xp / 80)));
}


export const useStore = create<AppState>((set, get) => ({
  // Auth & Subscription
  user: null,
  isAuthenticated: !!localStorage.getItem('placementos-token'),
  token: localStorage.getItem('placementos-token'),
  isProUser: localStorage.getItem('placementos-pro') === 'true',

  upgradeToPro: () => {
    localStorage.setItem('placementos-pro', 'true');
    set({ isProUser: true });
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
  },

  cancelPro: () => {
    localStorage.removeItem('placementos-pro');
    set({ isProUser: false });
  },

  coupons: [
    { code: 'COLLEGE50', discountPercent: 50, maxUses: 500, usesCount: 142, isActive: true, expiryDate: '2026-12-31' },
    { code: 'PRO30', discountPercent: 30, maxUses: 200, usesCount: 88, isActive: true, expiryDate: '2026-12-31' },
    { code: 'IITBOMBAY', discountPercent: 40, maxUses: 100, usesCount: 35, isActive: true, expiryDate: '2026-12-31' },
  ],
  activeCoupon: null,

  applyCoupon: (code: string) => {
    const clean = code.trim().toUpperCase();
    const coupon = get().coupons.find(c => c.code.toUpperCase() === clean);
    if (!coupon) return { success: false, discountPercent: 0, message: 'Invalid promo code' };
    if (!coupon.isActive) return { success: false, discountPercent: 0, message: 'This promo code has expired' };
    if (coupon.usesCount >= coupon.maxUses) return { success: false, discountPercent: 0, message: 'Promo code usage limit reached' };

    set({ activeCoupon: coupon });
    return { success: true, discountPercent: coupon.discountPercent, message: `🎉 ${coupon.discountPercent}% Discount Applied!` };
  },

  addCoupon: (coupon: Coupon) => {
    set(state => ({ coupons: [coupon, ...state.coupons] }));
  },

  toggleCoupon: (code: string) => {
    set(state => ({
      coupons: state.coupons.map(c => c.code === code ? { ...c, isActive: !c.isActive } : c)
    }));
  },

  deleteCoupon: (code: string) => {
    set(state => ({
      coupons: state.coupons.filter(c => c.code !== code)
    }));
  },



  login: async (email, password) => {
    const cleanEmail = email.trim().toLowerCase();

    // Direct Admin Profile Login
    if (cleanEmail === 'admin@placementos.com' || cleanEmail.startsWith('admin@')) {
      const adminUser: User = {
        id: 'admin-user-001',
        name: 'PlacementOS Administrator',
        email: 'admin@placementos.com',
        role: 'admin',
        college: 'PlacementOS Central HQ',
        branch: 'System Operations',
        year: 4,
        cgpa: 10.0,
        targetCompanies: ['All Companies'],
        dailyHours: 8,
        placementMonth: 'Forever Active',
        githubUsername: 'placementos',
        leetcodeUsername: 'placementos',
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem('placementos-token', 'admin-token-super');
      set({
        token: 'admin-token-super',
        isAuthenticated: true,
        user: adminUser,
      });
      return 'ok';
    }

    try {
      // 1. Try Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (!error && (data.session?.access_token || data.user)) {
        const token = data.session?.access_token || 'supabase-token';
        localStorage.setItem('placementos-token', token);
        set({ token, isAuthenticated: true });
        await get().syncProfile();
        return 'ok';
      }

      // 2. Fallback to Express Backend API
      try {
        const apiRes = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), password }),
        });
        if (apiRes.ok) {
          const apiData = await apiRes.json();
          if (apiData.token) {
            localStorage.setItem('placementos-token', apiData.token);
            set({
              token: apiData.token,
              isAuthenticated: true,
              user: apiData.user,
              progress: apiData.progress || get().progress,
              dsaStats: apiData.dsaStats || get().dsaStats,
            });
            return 'ok';
          }
        }
      } catch (apiErr) {
        // ignore
      }

      if (error) {
        console.error('Supabase login error:', error.message);
        const msg = error.message.toLowerCase();
        if (msg.includes('invalid login credentials') || msg.includes('invalid email or password')) return 'invalid';
        if (msg.includes('user not found') || msg.includes('no user')) return 'notfound';
      }

      return 'invalid';
    } catch (err) {
      console.error('Login error', err);
      return 'invalid';
    }
  },

  register: async (data) => {
    try {
      // 1. Register on Supabase Auth
      const { data: authData } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            college: data.college,
            branch: data.branch,
            year: data.year,
            cgpa: data.cgpa,
            target_companies: JSON.stringify(data.targetCompanies || []),
            daily_hours: data.dailyHours,
            placement_month: data.placementMonth,
            role: 'student',
          }
        }
      });

      // 2. Also register on Express backend API
      try {
        await fetch(`${API_BASE}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      } catch (e) {
        // ignore
      }

      const token = authData?.session?.access_token || 'registered-user-token';
      localStorage.setItem('placementos-token', token);

      // Create fresh user in Zustand state starting at 0 progress
      set({
        token,
        isAuthenticated: true,
        user: {
          id: authData?.user?.id || `user-${Date.now()}`,
          email: data.email,
          name: data.name,
          role: 'student',
          college: data.college,
          branch: data.branch,
          year: data.year ? parseInt(data.year) : 3,
          cgpa: data.cgpa ? parseFloat(data.cgpa) : 8.0,
          targetCompanies: data.targetCompanies || ['Google', 'Microsoft'],
          dailyHours: data.dailyHours ? parseInt(data.dailyHours) : 4,
          placementMonth: data.placementMonth || 'December 2025',
          createdAt: new Date().toISOString(),
        },
        progress: { xp: 0, level: 1, coins: 0, streak: 0, weeklyStreak: 0, rank: 99999, placementScore: 0, dsaScore: 0, aptitudeScore: 0, interviewScore: 0, resumeScore: 0, consistencyScore: 0, achievements: [] },
        dsaStats: { totalSolved: 0, easySolved: 0, mediumSolved: 0, hardSolved: 0, streak: 0, contestRating: 0, acceptanceRate: 0, topicWise: {}, dailyActivity: [], weakTopics: [], strongTopics: [] }
      });

      return 'ok';
    } catch (err) {
      console.error('Registration error', err);
      return 'exists';
    }
  },


  logout: async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('placementos-token');
    set({
      user: null, isAuthenticated: false, token: null,
      progress: { xp: 0, level: 1, coins: 0, streak: 0, weeklyStreak: 0, rank: 99999, placementScore: 0, dsaScore: 0, aptitudeScore: 0, interviewScore: 0, resumeScore: 0, consistencyScore: 0, achievements: [] },
      dsaStats: { totalSolved: 0, easySolved: 0, mediumSolved: 0, hardSolved: 0, streak: 0, contestRating: 0, acceptanceRate: 0, topicWise: {}, dailyActivity: [], weakTopics: [], strongTopics: [] },
      notifications: [], chatMessages: INITIAL_CHAT,
    });
  },

  setDemoMode: () => {
    const demoXP = 14200;
    set({
      isAuthenticated: true,
      token: 'demo-token',
      user: {
        id: 'demo-user-001',
        name: 'Daksh Singhal',
        email: 'demo@college.edu',
        role: 'student',
        college: 'IIT Bombay',
        branch: 'Computer Science',
        year: 3,
        cgpa: 8.5,
        targetCompanies: ['Google', 'Microsoft', 'Amazon'],
        dailyHours: 4,
        placementMonth: 'December 2025',
        githubUsername: 'torvalds',
        leetcodeUsername: 'tourist',
        createdAt: new Date().toISOString(),
      },
      progress: {
        xp: demoXP,
        level: Math.floor(demoXP / 1000) + 1,
        coins: 450,
        streak: 23,
        weeklyStreak: 7,
        rank: calculateRankFromXP(demoXP), // Rank #72
        placementScore: 82,
        dsaScore: 88,
        aptitudeScore: 78,
        interviewScore: 82,
        resumeScore: 80,
        consistencyScore: 92,
        achievements: createFreshAchievements().map(a => ({ ...a, unlocked: true })),
      },
      dsaStats: {
        totalSolved: 347,
        easySolved: 140,
        mediumSolved: 165,
        hardSolved: 42,
        streak: 23,
        contestRating: 1845,
        acceptanceRate: 72,
        topicWise: createFreshTopicWise(),
        dailyActivity: createFreshDailyActivity(),
        weakTopics: ['Dynamic Programming', 'Graphs'],
        strongTopics: ['Arrays', 'HashMap', 'Trees'],
      },
    });
  },

  setAdminDemoMode: () => {
    set({
      isAuthenticated: true,
      token: 'demo-token',
      user: {
        id: 'admin-user-001',
        name: 'PlacementOS Administrator',
        email: 'admin@placementos.com',
        role: 'admin',
        college: 'PlacementOS Central HQ',
        branch: 'System Operations',
        year: 4,
        cgpa: 10.0,
        targetCompanies: ['All Companies'],
        dailyHours: 8,
        placementMonth: 'Forever Active',
        githubUsername: 'placementos',
        leetcodeUsername: 'placementos',
        createdAt: new Date().toISOString(),
      },
    });
  },



  updateUser: async (updates) => {
    if (get().token === 'demo-token') {
      set((s) => ({ user: s.user ? { ...s.user, ...updates } : null }));
      return;
    }
    const user = get().user;
    if (!user) return;
    const dbUpdates: Record<string, any> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.college !== undefined) dbUpdates.college = updates.college;
    if (updates.branch !== undefined) dbUpdates.branch = updates.branch;
    if (updates.year !== undefined) dbUpdates.year = updates.year;
    if (updates.cgpa !== undefined) dbUpdates.cgpa = updates.cgpa;
    if (updates.targetCompanies !== undefined) dbUpdates.target_companies = JSON.stringify(updates.targetCompanies);
    if (updates.dailyHours !== undefined) dbUpdates.daily_hours = updates.dailyHours;
    if (updates.placementMonth !== undefined) dbUpdates.placement_month = updates.placementMonth;
    if (updates.githubUsername !== undefined) dbUpdates.github_username = updates.githubUsername;
    if (updates.leetcodeUsername !== undefined) dbUpdates.leetcode_username = updates.leetcodeUsername;
    if ((updates as any).resume_url !== undefined) dbUpdates.resume_url = (updates as any).resume_url;

    try {
      const { error } = await supabase.from('profiles').update(dbUpdates).eq('id', user.id);
      if (error) console.warn('Supabase update warning:', error.message);
      set((s) => ({ user: s.user ? { ...s.user, ...updates } : null }));
    } catch (err) {
      console.error('Failed to update user profile', err);
      set((s) => ({ user: s.user ? { ...s.user, ...updates } : null }));
    }
  },


  syncProfile: async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return;

    try {
      // Get profile
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', authUser.id).single();
      if (!profile) return;

      // Get progress (create if missing)
      let { data: progress } = await supabase.from('progress').select('*').eq('user_id', authUser.id).single();
      if (!progress) {
        const { data: newProgress } = await supabase.from('progress').insert({
          user_id: authUser.id,
          xp: 0,
          level: 1,
          coins: 0,
          streak: 0,
          weekly_streak: 0,
          rank: 99999,
          placement_score: 0,
          achievements: JSON.stringify(createFreshAchievements()),
        }).select().single();
        progress = newProgress;
      }

      // Get dsaStats (create if missing)
      let { data: dsaStats } = await supabase.from('dsa_stats').select('*').eq('user_id', authUser.id).single();
      if (!dsaStats) {
        const { data: newDsaStats } = await supabase.from('dsa_stats').insert({
          user_id: authUser.id,
          total_solved: 0,
          easy_solved: 0,
          medium_solved: 0,
          hard_solved: 0,
          streak: 0,
          contest_rating: 0,
          acceptance_rate: 0,
          topic_wise: JSON.stringify(createFreshTopicWise()),
          daily_activity: JSON.stringify([]),
          weak_topics: JSON.stringify(['Dynamic Programming', 'Graphs']),
          strong_topics: JSON.stringify([]),
        }).select().single();
        dsaStats = newDsaStats;
      }

      set({
        user: {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          role: profile.role,
          college: profile.college,
          branch: profile.branch,
          year: profile.year,
          cgpa: profile.cgpa,
          targetCompanies: JSON.parse(profile.target_companies || '[]'),
          dailyHours: profile.daily_hours,
          placementMonth: profile.placement_month,
          githubUsername: profile.github_username,
          leetcodeUsername: profile.leetcode_username,
          createdAt: profile.created_at,
        },
        progress: {
          xp: progress.xp || 0,
          level: progress.level || 1,
          coins: progress.coins || 0,
          streak: progress.streak || 0,
          weeklyStreak: progress.weekly_streak || 0,
          rank: progress.rank || 99999,
          placementScore: (progress.dsa_score || 0) === 0 && (progress.aptitude_score || 0) === 0 && (progress.interview_score || 0) === 0 && (progress.resume_score || 0) === 0
            ? 0
            : Math.round(((progress.dsa_score || 0) * 0.4) + ((progress.aptitude_score || 0) * 0.3) + ((progress.interview_score || 0) * 0.2) + ((progress.resume_score || 0) * 0.1)),
          dsaScore: progress.dsa_score || 0,
          aptitudeScore: progress.aptitude_score || 0,
          interviewScore: progress.interview_score || 0,
          resumeScore: progress.resume_score || 0,
          consistencyScore: progress.consistency_score || 0,
          achievements: JSON.parse(progress.achievements || '[]'),
        },
        dsaStats: {
          totalSolved: dsaStats.total_solved,
          easySolved: dsaStats.easy_solved,
          mediumSolved: dsaStats.medium_solved,
          hardSolved: dsaStats.hard_solved,
          streak: dsaStats.streak,
          contestRating: dsaStats.contest_rating,
          acceptanceRate: dsaStats.acceptance_rate,
          topicWise: JSON.parse(dsaStats.topic_wise || '{}'),
          dailyActivity: JSON.parse(dsaStats.daily_activity || '[]'),
          weakTopics: JSON.parse(dsaStats.weak_topics || '[]'),
          strongTopics: JSON.parse(dsaStats.strong_topics || '[]'),
        }
      });
      await get().syncInterviewSessions();
    } catch (err) {
      console.error('Failed to sync profile', err);
    }
  },

  // Progress
  progress: {
    xp: 0, level: 1, coins: 0, streak: 0, weeklyStreak: 0, rank: 99999,
    placementScore: 0, dsaScore: 0, aptitudeScore: 0, interviewScore: 0, resumeScore: 0, consistencyScore: 0,
    achievements: createFreshAchievements(),
  },


  updateProgress: async (updates) => {
    if (get().token === 'demo-token') return;
    const user = get().user;
    if (!user) return;
    const progress = get().progress;
    const nextProgress = { ...progress, ...updates };

    const dbUpdates: Record<string, any> = {};
    if (updates.xp !== undefined) dbUpdates.xp = updates.xp;
    if (updates.level !== undefined) dbUpdates.level = updates.level;
    if (updates.coins !== undefined) dbUpdates.coins = updates.coins;
    if (updates.streak !== undefined) dbUpdates.streak = updates.streak;
    if (updates.weeklyStreak !== undefined) dbUpdates.weekly_streak = updates.weeklyStreak;
    if (updates.rank !== undefined) dbUpdates.rank = updates.rank;
    if (updates.placementScore !== undefined) dbUpdates.placement_score = updates.placementScore;
    if (updates.dsaScore !== undefined) dbUpdates.dsa_score = updates.dsaScore;
    if (updates.aptitudeScore !== undefined) dbUpdates.aptitude_score = updates.aptitudeScore;
    if (updates.interviewScore !== undefined) dbUpdates.interview_score = updates.interviewScore;
    if (updates.resumeScore !== undefined) dbUpdates.resume_score = updates.resumeScore;
    if (updates.consistencyScore !== undefined) dbUpdates.consistency_score = updates.consistencyScore;
    if (updates.achievements !== undefined) dbUpdates.achievements = JSON.stringify(updates.achievements);

    try {
      await supabase.from('progress').update(dbUpdates).eq('user_id', user.id);
      set({ progress: nextProgress });
    } catch (err) {
      console.error('Failed to update progress in db', err);
    }
  },

  addXP: async (amount) => {
    const progress = get().progress;
    const oldLevel = progress.level;
    const newXP = progress.xp + amount;
    const newLevel = Math.floor(newXP / 1000) + 1;
    const newRank = calculateRankFromXP(newXP);

    // Only fire confetti & level up sound on LEVEL UP
    if (newLevel > oldLevel) {
      try {
        playLevelUpSound();
        confetti({
          particleCount: 80,
          spread: 65,
          origin: { y: 0.65 },
          ticks: 150,
        });
      } catch (e) {
        console.warn('Confetti / sound trigger error:', e);
      }
    }

    if (get().token === 'demo-token') {
      set((s) => ({
        progress: { ...s.progress, xp: newXP, level: newLevel, rank: newRank },
      }));
    } else {
      await get().updateProgress({ xp: newXP, level: newLevel, rank: newRank });
    }
  },


  removeXP: async (amount) => {
    const progress = get().progress;
    const newXP = Math.max(0, progress.xp - amount);
    const newLevel = Math.floor(newXP / 1000) + 1;
    await get().updateProgress({ xp: newXP, level: newLevel });
  },

  // Interview Sessions History
  interviewSessions: [],

  addInterviewSession: async (session) => {
    if (get().token === 'demo-token') return;
    const user = get().user;
    if (!user) {
      set((s) => ({ interviewSessions: [session, ...s.interviewSessions] }));
      return;
    }
    try {
      const { data } = await supabase.from('interview_sessions').insert({
        user_id: user.id,
        company: session.company,
        round: session.round,
        duration: session.duration,
        score: session.score,
        confidence_score: session.confidenceScore,
        technical_score: session.technicalScore,
        communication_score: session.communicationScore,
        feedback: session.feedback,
        transcript: JSON.stringify(session.transcript || []),
        improvements: JSON.stringify(session.improvements || []),
        status: session.status || 'completed',
      }).select().single();

      const savedSession: InterviewSession = data ? {
        id: data.id,
        company: data.company,
        round: data.round,
        date: data.created_at || new Date().toISOString(),
        duration: data.duration,
        score: data.score,
        confidenceScore: data.confidence_score,
        technicalScore: data.technical_score,
        communicationScore: data.communication_score,
        feedback: data.feedback,
        transcript: typeof data.transcript === 'string' ? JSON.parse(data.transcript) : data.transcript,
        improvements: typeof data.improvements === 'string' ? JSON.parse(data.improvements) : data.improvements,
        status: data.status,
      } : session;

      set((s) => ({ interviewSessions: [savedSession, ...s.interviewSessions] }));
    } catch (err) {
      console.error('Failed to add interview session:', err);
      set((s) => ({ interviewSessions: [session, ...s.interviewSessions] }));
    }
  },

  syncInterviewSessions: async () => {
    const user = get().user;
    if (!user) return;
    try {
      const { data } = await supabase.from('interview_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data) {
        const formatted: InterviewSession[] = data.map((d: any) => ({
          id: d.id,
          company: d.company,
          round: d.round,
          date: d.created_at || d.date || new Date().toISOString(),
          duration: d.duration || 30,
          score: d.score,
          confidenceScore: d.confidence_score || d.score,
          technicalScore: d.technical_score || d.score,
          communicationScore: d.communication_score || d.score,
          feedback: d.feedback,
          transcript: typeof d.transcript === 'string' ? JSON.parse(d.transcript || '[]') : d.transcript || [],
          improvements: typeof d.improvements === 'string' ? JSON.parse(d.improvements || '[]') : d.improvements || [],
          status: d.status || 'completed',
        }));
        set({ interviewSessions: formatted });
      }
    } catch (err) {
      console.error('Failed to sync interview sessions:', err);
    }
  },

  // Notifications
  notifications: [],

  addNotification: async (n) => {
    if (get().token === 'demo-token') return;
    const user = get().user;
    if (!user) return;
    try {
      const { data } = await supabase.from('notifications').insert({
        user_id: user.id,
        title: n.title,
        message: n.message,
        type: n.type,
        icon: n.icon,
        read: false,
      }).select().single();

      if (data) {
        set((s) => ({
          notifications: [
            {
              id: data.id,
              title: data.title,
              message: data.message,
              type: data.type,
              icon: data.icon,
              read: data.read,
              createdAt: data.created_at,
            },
            ...s.notifications,
          ]
        }));
      }
    } catch (err) {
      console.error('Failed to add notification', err);
    }
  },

  markNotificationRead: async (id) => {
    if (get().token === 'demo-token') return;
    try {
      await supabase.from('notifications').update({ read: true }).eq('id', id);
      set((s) => ({
        notifications: s.notifications.map(n => n.id === id ? { ...n, read: true } : n)
      }));
    } catch (err) {
      console.error('Failed to mark notification read', err);
    }
  },

  markAllRead: async () => {
    if (get().token === 'demo-token') return;
    const user = get().user;
    if (!user) return;
    try {
      await supabase.from('notifications').update({ read: true }).eq('user_id', user.id);
      set((s) => ({
        notifications: s.notifications.map(n => ({ ...n, read: true }))
      }));
    } catch (err) {
      console.error('Failed to mark all read', err);
    }
  },

  clearNotifications: async () => {
    if (get().token === 'demo-token') return;
    const user = get().user;
    if (!user) return;
    try {
      await supabase.from('notifications').delete().eq('user_id', user.id);
      set({ notifications: [] });
    } catch (err) {
      console.error('Failed to clear notifications', err);
    }
  },

  syncNotifications: async () => {
    const user = get().user;
    if (!user) return;
    try {
      const { data } = await supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      if (data) {
        set({
          notifications: data.map(n => ({
            id: n.id,
            title: n.title,
            message: n.message,
            type: n.type,
            icon: n.icon,
            read: n.read,
            createdAt: n.created_at,
          }))
        });
      }
    } catch (err) {
      console.error('Failed to sync notifications', err);
    }
  },

  // Chat
  chatMessages: INITIAL_CHAT,

  addChatMessage: async (message) => {
    if (get().token === 'demo-token') return;
    const user = get().user;
    if (!user) return;
    try {
      const { data } = await supabase.from('chat_messages').insert({
        user_id: user.id,
        role: message.role,
        content: message.content,
        agent_type: message.agentType || 'mentor',
      }).select().single();

      if (data) {
        set((s) => ({
          chatMessages: [
            ...s.chatMessages,
            {
              id: data.id,
              role: data.role,
              content: data.content,
              timestamp: data.timestamp,
              agentType: data.agent_type,
            }
          ]
        }));
      }
    } catch (err) {
      console.error('Failed to save chat message', err);
      // Fallback local save so conversation remains responsive
      set((s) => ({
        chatMessages: [...s.chatMessages, { ...message, id: Date.now().toString(), timestamp: new Date().toISOString() }]
      }));
    }
  },

  clearChat: async () => {
    if (get().token === 'demo-token') return;
    const user = get().user;
    if (!user) return;
    try {
      await supabase.from('chat_messages').delete().eq('user_id', user.id);
      set({ chatMessages: INITIAL_CHAT });
    } catch (err) {
      console.error('Failed to clear chat history', err);
    }
  },

  // Agents
  agentStatuses: defaultAgents,
  updateAgentStatus: (id, updates) => set((s) => ({
    agentStatuses: s.agentStatuses.map(a => a.id === id ? { ...a, ...updates } : a)
  })),

  // DSA
  dsaStats: {
    totalSolved: 0, easySolved: 0, mediumSolved: 0, hardSolved: 0,
    streak: 0, contestRating: 0, acceptanceRate: 0,
    topicWise: createFreshTopicWise(),
    dailyActivity: createFreshDailyActivity(),
    weakTopics: ['Dynamic Programming', 'Graphs'],
    strongTopics: [],
  },


  updateDSAStats: async (updates) => {
    if (get().token === 'demo-token') return;
    const user = get().user;
    if (!user) return;
    const stats = get().dsaStats;
    const nextStats = { ...stats, ...updates };

    const dbUpdates: Record<string, any> = {};
    if (updates.totalSolved !== undefined) dbUpdates.total_solved = updates.totalSolved;
    if (updates.easySolved !== undefined) dbUpdates.easy_solved = updates.easySolved;
    if (updates.mediumSolved !== undefined) dbUpdates.medium_solved = updates.mediumSolved;
    if (updates.hardSolved !== undefined) dbUpdates.hard_solved = updates.hardSolved;
    if (updates.streak !== undefined) dbUpdates.streak = updates.streak;
    if (updates.contestRating !== undefined) dbUpdates.contest_rating = updates.contestRating;
    if (updates.acceptanceRate !== undefined) dbUpdates.acceptance_rate = updates.acceptanceRate;
    if (updates.topicWise !== undefined) dbUpdates.topic_wise = JSON.stringify(updates.topicWise);
    if (updates.dailyActivity !== undefined) dbUpdates.daily_activity = JSON.stringify(updates.dailyActivity);
    if (updates.weakTopics !== undefined) dbUpdates.weak_topics = JSON.stringify(updates.weakTopics);
    if (updates.strongTopics !== undefined) dbUpdates.strong_topics = JSON.stringify(updates.strongTopics);

    try {
      await supabase.from('dsa_stats').update(dbUpdates).eq('user_id', user.id);
      set({ dsaStats: nextStats });
    } catch (err) {
      console.error('Failed to update DSA stats', err);
    }
  },

  submitDSASolution: async (problemId, difficulty) => {
    const stats = get().dsaStats;
    const key = difficulty === 'Easy' ? 'easySolved' : difficulty === 'Medium' ? 'mediumSolved' : 'hardSolved';
    const totalSolved = stats.totalSolved + 1;
    const diffSolved = stats[key] + 1;

    // Update today's cell in dailyActivity
    const todayStr = new Date().toISOString().split('T')[0];
    const dailyActivity = [...(stats.dailyActivity || [])];
    const lastCell = dailyActivity[dailyActivity.length - 1];
    if (lastCell && lastCell.date === todayStr) {
      dailyActivity[dailyActivity.length - 1] = {
        ...lastCell,
        count: lastCell.count + 1,
        problems: [...(lastCell.problems || []), problemId],
      };
    } else {
      dailyActivity.push({ date: todayStr, count: 1, problems: [problemId] });
    }


    if (get().token === 'demo-token') {
      set((s) => ({
        dsaStats: {
          ...s.dsaStats,
          totalSolved,
          [key]: diffSolved,
          dailyActivity,
        }
      }));
    } else {
      await get().updateDSAStats({
        totalSolved,
        [key]: diffSolved,
        dailyActivity,
      });
    }

    await get().addXP(100);
  },


  // Sidebar
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
}));
