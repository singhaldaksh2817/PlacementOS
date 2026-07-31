import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { initDb, getDb } from './db';
import { getMentorResponse, getInterviewQuestion, evaluateInterviewAnswer, getDSAHint, analyzeResumeContent } from './gemini';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfParse = require('pdf-parse');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_dev_secret';
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));

// ─── Supabase Token Verification Middleware ──────────────────────────────────
async function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'No token provided' });
  
  // Allow demo and legacy tokens to pass through
  if (token === 'demo-token' || token === 'admin-1' || token === 'demo-1') {
    req.user = { userId: token === 'admin-1' ? 'admin-user' : 'demo-user-001', role: token === 'admin-1' ? 'admin' : 'student' };
    return next();
  }
  
  try {
    // Try local JWT verification first (fast, no network call)
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = { userId: decoded.userId || decoded.sub || decoded.id, role: decoded.role || 'student', email: decoded.email };
    return next();
  } catch (jwtErr) {
    // Fallback: verify with Supabase if local fails (token may use different secret)
    try {
      const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
        headers: { 'Authorization': `Bearer ${token}`, 'apikey': supabaseAnonKey }
      });
      if (response.ok) {
        const userData = await response.json();
        req.user = { userId: userData.id, role: userData.user_metadata?.role || 'student', email: userData.email };
        return next();
      }
      return res.status(401).json({ error: 'Invalid token' });
    } catch (err) {
      return res.status(401).json({ error: 'Auth verification failed' });
    }
  }
}

// ─── Default seed logic helper ───────────────────────────────────────────────
function createFreshAchievements() {
  return JSON.stringify([
    { id: '1', title: '100 Problems', description: 'Solve 100 problems', icon: '🎯', xpReward: 500, category: 'dsa', rarity: 'rare', unlocked: false },
    { id: '2', title: 'Streak Master', description: '20 day streak', icon: '🔥', xpReward: 1000, category: 'streak', rarity: 'epic', unlocked: false },
    { id: '3', title: 'Interview Ready', description: 'Complete 10 mock interviews', icon: '💼', xpReward: 750, category: 'interview', rarity: 'rare', unlocked: false },
    { id: '4', title: 'Aptitude King', description: 'Score 90%+ in aptitude', icon: '🧠', xpReward: 600, category: 'aptitude', rarity: 'epic', unlocked: false },
    { id: '5', title: 'Hard Crusher', description: 'Solve 50 hard problems', icon: '💪', xpReward: 2000, category: 'dsa', rarity: 'legendary', unlocked: false },
    { id: '6', title: 'Consistency', description: '7 day streak', icon: '⚡', xpReward: 300, category: 'streak', rarity: 'common', unlocked: false },
  ]);
}

function createFreshTopicWise() {
  const topics = ['Arrays', 'Strings', 'Linked List', 'Trees', 'Graphs', 'Dynamic Programming', 'HashMap', 'Stacks', 'Queues', 'Binary Search', 'Two Pointer', 'Sliding Window', 'Heap', 'Trie', 'Backtracking', 'Greedy', 'System Design', 'BFS', 'DFS'];
  const obj: Record<string, any> = {};
  topics.forEach(t => {
    obj[t] = { solved: 0, total: 30, strength: 0 };
  });
  return JSON.stringify(obj);
}

// ─── Routes ──────────────────────────────────────────────────────────────────

// REGISTER
app.post('/api/auth/register', async (req: express.Request, res: express.Response): Promise<any> => {
  const { name, email, password, college, branch, year, cgpa, targetCompanies, dailyHours, placementMonth } = req.body;
  const db = getDb();

  try {
    const existing = await db.get('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) {
      return res.status(400).json({ error: 'exists' });
    }

    const userId = `user-${Date.now()}`;
    const passwordHash = await bcrypt.hash(password, 10);
    const targetCompStr = JSON.stringify(targetCompanies || []);

    // Create User
    await db.run(`
      INSERT INTO users (id, email, passwordHash, name, role, college, branch, year, cgpa, targetCompanies, dailyHours, placementMonth, createdAt)
      VALUES (?, ?, ?, ?, 'student', ?, ?, ?, ?, ?, ?, ?, ?)
    `, [userId, email, passwordHash, name, college, branch, year, cgpa, targetCompStr, dailyHours, placementMonth, new Date().toISOString()]);

    // Create User Progress
    await db.run(`
      INSERT INTO progress (userId, xp, level, coins, streak, weeklyStreak, rank, placementScore, dsaScore, aptitudeScore, interviewScore, resumeScore, consistencyScore, achievements)
      VALUES (?, 0, 1, 0, 0, 0, 99999, 10, 0, 0, 0, 0, 0, ?)
    `, [userId, createFreshAchievements()]);

    // Create DSA Stats
    await db.run(`
      INSERT INTO dsa_stats (userId, totalSolved, easySolved, mediumSolved, hardSolved, streak, contestRating, acceptanceRate, topicWise, dailyActivity, weakTopics, strongTopics)
      VALUES (?, 0, 0, 0, 0, 0, 0, 0, ?, '[]', '["Dynamic Programming", "Graphs"]', '[]')
    `, [userId, createFreshTopicWise()]);

    // Create Welcome Notification
    await db.run(`
      INSERT INTO notifications (id, userId, title, message, type, read, createdAt, icon)
      VALUES (?, ?, 'Welcome to PlacementOS! 🎉', 'Start by mapping out your study plan in the Roadmap tab.', 'info', 0, ?, '🚀')
    `, [`notif-${Date.now()}`, userId, new Date().toISOString()]);

    const token = jwt.sign({ userId, email, role: 'student' }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: { id: userId, email, name, role: 'student', college, branch, year, cgpa, targetCompanies, dailyHours, placementMonth },
      progress: { xp: 0, level: 1, coins: 0, streak: 0, weeklyStreak: 0, rank: 99999, placementScore: 10, dsaScore: 0, aptitudeScore: 0, interviewScore: 0, resumeScore: 0, consistencyScore: 0, achievements: JSON.parse(createFreshAchievements()) },
      dsaStats: { totalSolved: 0, easySolved: 0, mediumSolved: 0, hardSolved: 0, streak: 0, contestRating: 0, acceptanceRate: 0, topicWise: JSON.parse(createFreshTopicWise()), dailyActivity: [], weakTopics: ["Dynamic Programming", "Graphs"], strongTopics: [] }
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// LOGIN
app.post('/api/auth/login', async (req: express.Request, res: express.Response): Promise<any> => {
  const { email, password } = req.body;
  const db = getDb();

  try {
    // Check built-in admin
    if (email === 'admin@placementos.com' && password === 'Admin@123') {
      const token = jwt.sign({ userId: 'admin-1', email, role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({
        token,
        user: { id: 'admin-1', email, name: 'Admin', role: 'admin' },
        progress: { xp: 12450, level: 18, coins: 840, streak: 23, weeklyStreak: 4, rank: 142, placementScore: 92, dsaScore: 75, aptitudeScore: 68, interviewScore: 65, resumeScore: 78, consistencyScore: 82, achievements: [] },
        dsaStats: { totalSolved: 347, easySolved: 156, mediumSolved: 142, hardSolved: 49, streak: 23, contestRating: 1847, acceptanceRate: 68.4, topicWise: {}, dailyActivity: [], weakTopics: [], strongTopics: [] }
      });
    }

    // Check built-in demo
    if (email === 'demo@college.edu' && password === 'demo123') {
      const token = jwt.sign({ userId: 'demo-1', email, role: 'student' }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({
        token,
        user: { id: 'demo-1', email, name: 'Demo Student', role: 'student', college: 'IIT Bombay', branch: 'Computer Science', year: 3, cgpa: 8.2, targetCompanies: ['Google', 'Amazon', 'Microsoft'], dailyHours: 4, placementMonth: 'December 2025' },
        progress: { xp: 12450, level: 18, coins: 840, streak: 23, weeklyStreak: 4, rank: 142, placementScore: 72, dsaScore: 75, aptitudeScore: 68, interviewScore: 65, resumeScore: 78, consistencyScore: 82, achievements: [] },
        dsaStats: { totalSolved: 347, easySolved: 156, mediumSolved: 142, hardSolved: 49, streak: 23, contestRating: 1847, acceptanceRate: 68.4, topicWise: {}, dailyActivity: [], weakTopics: ['Dynamic Programming', 'Graphs'], strongTopics: [] }
      });
    }

    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) return res.status(404).json({ error: 'notfound' });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(400).json({ error: 'invalid' });

    const progress = await db.get('SELECT * FROM progress WHERE userId = ?', [user.id]);
    const dsaStats = await db.get('SELECT * FROM dsa_stats WHERE userId = ?', [user.id]);

    const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user.id, email: user.email, name: user.name, role: user.role,
        college: user.college, branch: user.branch, year: user.year,
        cgpa: user.cgpa, targetCompanies: JSON.parse(user.targetCompanies || '[]'),
        dailyHours: user.dailyHours, placementMonth: user.placementMonth
      },
      progress: {
        ...progress,
        achievements: JSON.parse(progress.achievements || '[]')
      },
      dsaStats: {
        ...dsaStats,
        topicWise: JSON.parse(dsaStats.topicWise || '{}'),
        dailyActivity: JSON.parse(dsaStats.dailyActivity || '[]'),
        weakTopics: JSON.parse(dsaStats.weakTopics || '[]'),
        strongTopics: JSON.parse(dsaStats.strongTopics || '[]')
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ADMIN GET ALL USERS
app.get('/api/admin/users', async (req: express.Request, res: express.Response): Promise<any> => {
  const db = getDb();
  try {
    const users = await db.all(`
      SELECT u.id, u.name, u.email, u.college, u.branch, u.year, u.role, u.createdAt,
             COALESCE(p.xp, 0) as xp, COALESCE(p.level, 1) as level
      FROM users u
      LEFT JOIN progress p ON u.id = p.userId
      ORDER BY u.createdAt DESC
    `);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// ADMIN SEED SUPABASE DATABASE
app.post('/api/admin/seed-supabase', async (req: express.Request, res: express.Response): Promise<any> => {
  const seedDSA = [
    { id: 'p1', title: 'Two Sum', difficulty: 'Easy', topic: 'Arrays', companies: ['Google', 'Amazon', 'Microsoft'], description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.', platform: 'LeetCode', platform_url: 'https://leetcode.com/problems/two-sum' },
    { id: 'p2', title: 'Add Two Numbers', difficulty: 'Medium', topic: 'Linked List', companies: ['Amazon', 'Microsoft'], description: 'Add two numbers represented as linked lists.', platform: 'LeetCode', platform_url: 'https://leetcode.com/problems/add-two-numbers' },
    { id: 'p3', title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', topic: 'Strings', companies: ['Google', 'Adobe'], description: 'Find length of longest substring without repeating characters.', platform: 'LeetCode', platform_url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters' },
    { id: 'p4', title: 'Median of Two Sorted Arrays', difficulty: 'Hard', topic: 'Binary Search', companies: ['Google', 'Goldman Sachs'], description: 'Find median of two sorted arrays.', platform: 'LeetCode', platform_url: 'https://leetcode.com/problems/median-of-two-sorted-arrays' },
    { id: 'p5', title: 'Longest Palindromic Substring', difficulty: 'Medium', topic: 'Dynamic Programming', companies: ['Microsoft', 'Amazon'], description: 'Find longest palindromic substring.', platform: 'LeetCode', platform_url: 'https://leetcode.com/problems/longest-palindromic-substring' },
    { id: 'p6', title: 'Container With Most Water', difficulty: 'Medium', topic: 'Two Pointer', companies: ['Google', 'Uber'], description: 'Find two lines that together with x-axis forms container containing most water.', platform: 'LeetCode', platform_url: 'https://leetcode.com/problems/container-with-most-water' },
    { id: 'p7', title: 'Trapping Rain Water', difficulty: 'Hard', topic: 'Two Pointer', companies: ['Amazon', 'Google'], description: 'Calculate how much water can be trapped after raining.', platform: 'LeetCode', platform_url: 'https://leetcode.com/problems/trapping-rain-water' },
    { id: 'p8', title: 'Merge K Sorted Lists', difficulty: 'Hard', topic: 'Heap', companies: ['Google', 'Microsoft'], description: 'Merge k sorted linked lists.', platform: 'LeetCode', platform_url: 'https://leetcode.com/problems/merge-k-sorted-lists' },
    { id: 'p9', title: 'Valid Parentheses', difficulty: 'Easy', topic: 'Stacks', companies: ['Amazon', 'Microsoft', 'Google'], description: 'Determine if string of brackets is valid.', platform: 'LeetCode', platform_url: 'https://leetcode.com/problems/valid-parentheses' },
    { id: 'p10', title: 'Subarray Sum Equals K', difficulty: 'Medium', topic: 'HashMap', companies: ['Google', 'Facebook'], description: 'Find total number of continuous subarrays whose sum equals k.', platform: 'LeetCode', platform_url: 'https://leetcode.com/problems/subarray-sum-equals-k' },
    { id: 'p11', title: 'LRU Cache', difficulty: 'Hard', topic: 'System Design', companies: ['Google', 'Amazon', 'Microsoft'], description: 'Design and implement a Least Recently Used (LRU) cache data structure.', platform: 'LeetCode', platform_url: 'https://leetcode.com/problems/lru-cache' },
    { id: 'p12', title: 'Word Search', difficulty: 'Medium', topic: 'Backtracking', companies: ['Amazon', 'Microsoft'], description: 'Check if word exists in 2D grid of characters.', platform: 'LeetCode', platform_url: 'https://leetcode.com/problems/word-search' },
    { id: 'p13', title: 'Binary Tree Level Order Traversal', difficulty: 'Medium', topic: 'Trees', companies: ['Amazon', 'Microsoft'], description: 'Return level order traversal of binary tree nodes.', platform: 'LeetCode', platform_url: 'https://leetcode.com/problems/binary-tree-level-order-traversal' },
    { id: 'p14', title: 'Number of Islands', difficulty: 'Medium', topic: 'Graphs', companies: ['Amazon', 'Google', 'Microsoft'], description: 'Count number of islands in 2D binary grid.', platform: 'LeetCode', platform_url: 'https://leetcode.com/problems/number-of-islands' },
    { id: 'p15', title: 'Coin Change', difficulty: 'Medium', topic: 'Dynamic Programming', companies: ['Amazon', 'Goldman Sachs'], description: 'Compute fewest number of coins needed to make up amount.', platform: 'LeetCode', platform_url: 'https://leetcode.com/problems/coin-change' }
  ];

  const seedCompaniesData = [
    { id: '1', name: 'Google', logo: 'G', tier: 'S', domain: 'Technology', ctc_range: '40-60 LPA', roles: ['SWE', 'SWE-II'], topics_required: ['Graphs', 'DP', 'Trees', 'System Design'], hiring_status: 'upcoming', drive_date: '2025-03-20', locations: ['Bengaluru', 'Hyderabad'] },
    { id: '2', name: 'Microsoft', logo: 'M', tier: 'S', domain: 'Technology', ctc_range: '35-50 LPA', roles: ['SWE', 'PM'], topics_required: ['Arrays', 'Strings', 'Trees', 'OOP'], hiring_status: 'active', drive_date: '2025-03-05', locations: ['Hyderabad', 'Noida', 'Bengaluru'] },
    { id: '3', name: 'Amazon', logo: 'A', tier: 'S', domain: 'E-commerce/Cloud', ctc_range: '30-45 LPA', roles: ['SDE-I', 'SDE-II'], topics_required: ['Arrays', 'Strings', 'Trees', 'Graphs', 'DP'], hiring_status: 'active', locations: ['Bengaluru', 'Hyderabad', 'Chennai', 'Pune'] },
    { id: '4', name: 'Adobe', logo: 'Ad', tier: 'A', domain: 'Creative Software', ctc_range: '20-35 LPA', roles: ['SDE-I', 'Research Engineer'], topics_required: ['Graphs', 'DP', 'Segment Trees'], hiring_status: 'upcoming', drive_date: '2025-02-15', locations: ['Noida', 'Bengaluru'] },
    { id: '5', name: 'Goldman Sachs', logo: 'GS', tier: 'A', domain: 'Finance/Tech', ctc_range: '25-40 LPA', roles: ['Analyst SDE', 'Quant Analyst'], topics_required: ['Math', 'DP', 'Graphs'], hiring_status: 'active', locations: ['Bengaluru'] }
  ];

  try {
    const headers = {
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates'
    };

    // Upsert DSA problems
    const dsaRes = await fetch(`${supabaseUrl}/rest/v1/dsa_problems`, {
      method: 'POST',
      headers,
      body: JSON.stringify(seedDSA)
    });

    // Upsert Companies
    const compRes = await fetch(`${supabaseUrl}/rest/v1/companies`, {
      method: 'POST',
      headers,
      body: JSON.stringify(seedCompaniesData)
    });

    if (!dsaRes.ok || !compRes.ok) {
      const dsaErr = !dsaRes.ok ? await dsaRes.text() : '';
      const compErr = !compRes.ok ? await compRes.text() : '';
      console.error('Supabase seed error:', dsaErr, compErr);
      return res.status(500).json({ error: 'Supabase seed error', dsaErr, compErr });
    }

    res.json({ success: true, dsaInserted: seedDSA.length, companiesInserted: seedCompaniesData.length });
  } catch (err: any) {
    console.error('Seed route error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET PROFILE DETAILS
app.get('/api/auth/me', authenticateToken, async (req: any, res: any) => {
  const db = getDb();
  try {
    const user = await db.get('SELECT * FROM users WHERE id = ?', [req.user.userId]);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const progress = await db.get('SELECT * FROM progress WHERE userId = ?', [req.user.userId]);
    const dsaStats = await db.get('SELECT * FROM dsa_stats WHERE userId = ?', [req.user.userId]);

    res.json({
      user: {
        id: user.id, email: user.email, name: user.name, role: user.role,
        college: user.college, branch: user.branch, year: user.year,
        cgpa: user.cgpa, targetCompanies: JSON.parse(user.targetCompanies || '[]'),
        dailyHours: user.dailyHours, placementMonth: user.placementMonth
      },
      progress: {
        ...progress,
        achievements: JSON.parse(progress.achievements || '[]')
      },
      dsaStats: {
        ...dsaStats,
        topicWise: JSON.parse(dsaStats.topicWise || '{}'),
        dailyActivity: JSON.parse(dsaStats.dailyActivity || '[]'),
        weakTopics: JSON.parse(dsaStats.weakTopics || '[]'),
        strongTopics: JSON.parse(dsaStats.strongTopics || '[]')
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// SUBMIT DSA SOLUTION
app.post('/api/dsa/submit', authenticateToken, async (req: any, res: any) => {
  const { problemId, difficulty } = req.body;
  const db = getDb();
  try {
    const userId = req.user.userId;

    // Fetch Stats
    const stats = await db.get('SELECT * FROM dsa_stats WHERE userId = ?', [userId]);
    if (!stats) return res.status(404).json({ error: 'Stats not found' });

    const key = difficulty === 'Easy' ? 'easySolved' : difficulty === 'Medium' ? 'mediumSolved' : 'hardSolved';
    const totalSolved = stats.totalSolved + 1;
    const diffSolved = stats[key] + 1;

    // Update DSA Stats Table
    await db.run(`
      UPDATE dsa_stats 
      SET totalSolved = ?, ${key} = ?
      WHERE userId = ?
    `, [totalSolved, diffSolved, userId]);

    // Update Progress Table (Reward XP)
    const progress = await db.get('SELECT * FROM progress WHERE userId = ?', [userId]);
    if (progress) {
      const newXp = progress.xp + 100;
      const newLevel = Math.floor(newXp / 1000) + 1;
      await db.run('UPDATE progress SET xp = ?, level = ? WHERE userId = ?', [newXp, newLevel, userId]);
    }

    const updatedProgress = await db.get('SELECT * FROM progress WHERE userId = ?', [userId]);
    const updatedStats = await db.get('SELECT * FROM dsa_stats WHERE userId = ?', [userId]);

    res.json({
      progress: { ...updatedProgress, achievements: JSON.parse(updatedProgress.achievements || '[]') },
      dsaStats: {
        ...updatedStats,
        topicWise: JSON.parse(updatedStats.topicWise || '{}'),
        dailyActivity: JSON.parse(updatedStats.dailyActivity || '[]'),
        weakTopics: JSON.parse(updatedStats.weakTopics || '[]'),
        strongTopics: JSON.parse(updatedStats.strongTopics || '[]')
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// NOTIFICATIONS
app.get('/api/notifications', authenticateToken, async (req: any, res: any) => {
  const db = getDb();
  try {
    const list = await db.all('SELECT * FROM notifications WHERE userId = ? ORDER BY createdAt DESC', [req.user.userId]);
    res.json(list.map(n => ({ ...n, read: n.read === 1 })));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── AI MENTOR CHAT ──────────────────────────────────────────────────────────
app.post('/api/ai/chat', authenticateToken, async (req: any, res: any) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message required' });

  const authHeader = req.headers['authorization'] || '';

  let name = 'Student';
  let targetCompanies: string[] = [];
  let level = 1;
  let dsaSolved = 0;

  // Fetch student details from Supabase if not a legacy bypass
  if (req.user.userId !== 'admin-1' && req.user.userId !== 'demo-1') {
    try {
      const headers = {
        'apikey': supabaseAnonKey,
        'Authorization': authHeader
      };

      // Fetch Profile
      const profRes = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${req.user.userId}&select=*`, { headers });
      if (profRes.ok) {
        const list = await profRes.json() as any[];
        if (list[0]) {
          name = list[0].name || name;
          targetCompanies = JSON.parse(list[0].target_companies || '[]');
        }
      }

      // Fetch Progress
      const progRes = await fetch(`${supabaseUrl}/rest/v1/progress?user_id=eq.${req.user.userId}&select=*`, { headers });
      if (progRes.ok) {
        const list = await progRes.json() as any[];
        if (list[0]) {
          level = list[0].level || level;
        }
      }

      // Fetch DSA Stats
      const dsaRes = await fetch(`${supabaseUrl}/rest/v1/dsa_stats?user_id=eq.${req.user.userId}&select=*`, { headers });
      if (dsaRes.ok) {
        const list = await dsaRes.json() as any[];
        if (list[0]) {
          dsaSolved = list[0].total_solved || dsaSolved;
        }
      }
    } catch (err) {
      console.error('Failed to fetch user state from Supabase:', err);
    }
  }

  try {
    const response = await getMentorResponse(message, {
      name,
      targetCompanies,
      level,
      dsaSolved,
    });

    res.json({ reply: response });
  } catch (err: any) {
    console.error('Gemini chat error:', err.message);
    const isRateLimit = err.message?.includes('quota') || err.message?.includes('429') || err.message?.includes('RESOURCE_EXHAUSTED');
    if (isRateLimit) {
      return res.status(429).json({
        error: 'rate_limit',
        reply: '⏳ The AI is a bit busy right now (free tier limit). Please wait 30-60 seconds and try again! The Gemini free tier allows ~15 requests per minute.'
      });
    }
    res.status(500).json({ error: 'AI service error', reply: '❌ AI service error. Make sure the backend is running and the API key is valid.' });
  }
});

// ─── INTERVIEW QUESTION ───────────────────────────────────────────────────────
app.post('/api/ai/interview/question', authenticateToken, async (req: any, res: any) => {
  const { company, round, previousQuestions } = req.body;
  try {
    const result = await getInterviewQuestion(
      company || 'Google',
      round || 'Technical',
      previousQuestions || []
    );
    res.json(result);
  } catch (err: any) {
    console.error('Interview question error:', err.message);
    res.status(500).json({ question: 'Tell me about yourself and your projects.', expectedTopics: ['Communication', 'Projects'] });
  }
});

// ─── INTERVIEW ANSWER EVALUATE ────────────────────────────────────────────────
app.post('/api/ai/interview/evaluate', authenticateToken, async (req: any, res: any) => {
  const { question, answer, company } = req.body;
  try {
    const result = await evaluateInterviewAnswer(question, answer, company || 'Google');
    res.json(result);
  } catch (err: any) {
    console.error('Evaluation error:', err.message);
    res.status(500).json({ score: 7, feedback: 'Good effort! Keep practicing.', improvements: ['Be more specific', 'Add examples', 'Stay concise'] });
  }
});

// ─── DSA HINT ─────────────────────────────────────────────────────────────────
app.post('/api/ai/dsa/hint', authenticateToken, async (req: any, res: any) => {
  const { problemTitle, problemTopic, difficulty, hintLevel } = req.body;
  try {
    const hint = await getDSAHint(problemTitle, problemTopic, difficulty, hintLevel || 1);
    res.json({ hint });
  } catch (err: any) {
    console.error('DSA hint error:', err.message);
    res.status(500).json({ hint: '💡 Think about what data structure gives you O(1) lookup time...' });
  }
});

// ─── RESUME ANALYSIS ─────────────────────────────────────────────────────────
app.post('/api/ai/resume-analyze', authenticateToken, async (req: any, res: any) => {
  const { fileContentText, targetCompany } = req.body;
  try {
    const analysis = await analyzeResumeContent(fileContentText || '', targetCompany);
    res.json(analysis);
  } catch (err: any) {
    console.error('Resume analysis error:', err.message);
    res.status(500).json({
      atsScore: 75, grammarScore: 88, keywordsScore: 70, formattingScore: 90,
      projectsScore: 78, overallScore: 80,
      missingKeywords: ['Docker', 'Kubernetes', 'Microservices', 'Redis'],
      strengths: ['Clear structure', 'Technical skills section'],
      improvements: ['Add quantifiable metrics', 'Include cloud experience'],
      suggestions: ['Tailor resume summary for target company'],
    });
  }
});

// ─── PDF TEXT EXTRACTION ─────────────────────────────────────────────────────
// Accepts base64-encoded PDF and returns extracted plain text
app.post('/api/ai/extract-pdf', authenticateToken, async (req: any, res: any) => {
  const { base64Pdf } = req.body;
  if (!base64Pdf) return res.status(400).json({ error: 'base64Pdf is required' });
  try {
    const buffer = Buffer.from(base64Pdf, 'base64');
    const result = await pdfParse(buffer);
    res.json({ text: result.text, pages: result.numpages });
  } catch (err: any) {
    console.error('PDF extraction error:', err.message);
    res.status(500).json({ error: 'Could not extract PDF text', text: '' });
  }
});


// START
async function start() {
  await initDb();
  app.listen(PORT, () => {
    console.log(`🚀 Express server running on http://localhost:${PORT}`);
    console.log(`🤖 Gemini AI integrated and ready!`);
  });
}

start();
