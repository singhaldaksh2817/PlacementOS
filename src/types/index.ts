// User & Auth
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'student' | 'admin' | 'recruiter';
  college?: string;
  year?: number;
  cgpa?: number;
  branch?: string;
  targetCompanies?: string[];
  dailyHours?: number;
  placementMonth?: string;
  githubUsername?: string;
  leetcodeUsername?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// DSA
export interface DSAProblem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic: string;
  status: 'solved' | 'attempted' | 'unsolved';
  leetcodeId?: number;
  url?: string;
  notes?: string;
  solvedAt?: string;
  timeSpent?: number;
  language?: string;
  companies?: string[];
}

export interface DSAStats {
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  streak: number;
  contestRating: number;
  acceptanceRate: number;
  topicWise: Record<string, { solved: number; total: number; strength: number }>;
  dailyActivity: Array<{ date: string; count: number; problems: string[] }>;
  weakTopics: string[];
  strongTopics: string[];
}

// Aptitude
export interface AptitudeQuestion {
  id: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  category: string;
  subcategory: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeLimit: number;
}

export interface AptitudeTest {
  id: string;
  title: string;
  category: string;
  questions: AptitudeQuestion[];
  duration: number;
  totalMarks: number;
  negativeMarking: boolean;
}

export interface AptitudeResult {
  testId: string;
  score: number;
  accuracy: number;
  timeTaken: number;
  categoryWise: Record<string, { correct: number; total: number; timeAvg: number }>;
  date: string;
  rank?: number;
}

// Interview
export interface InterviewSession {
  id: string;
  company: string;
  round: 'HR' | 'Technical' | 'Managerial' | 'Behavioral' | 'System Design' | 'Coding';
  date: string;
  duration: number;
  score: number;
  confidenceScore: number;
  technicalScore: number;
  communicationScore: number;
  feedback: string;
  transcript: Array<{ role: 'interviewer' | 'candidate' | 'system'; message?: string; content?: string; timestamp: string }>;
  improvements: string[];
  status: 'completed' | 'in_progress' | 'scheduled';
}

export interface InterviewMessage {
  id: string;
  role: 'interviewer' | 'candidate' | 'system';
  content: string;
  timestamp: string;
  followUp?: string;
}

// Roadmap
export interface RoadmapTask {
  id: string;
  title: string;
  description: string;
  category: 'DSA' | 'Aptitude' | 'Interview' | 'Resume' | 'Project' | 'Revision';
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  dueDate: string;
  estimatedTime: number;
  completedAt?: string;
  xpReward: number;
  tags: string[];
}

export interface Roadmap {
  id: string;
  userId: string;
  targetCompanies: string[];
  startDate: string;
  endDate: string;
  dailyTasks: Record<string, RoadmapTask[]>;
  weeklyGoals: string[];
  monthlyMilestones: string[];
  completionPercentage: number;
  currentPhase: string;
}

// Company
export interface Company {
  id: string;
  name: string;
  logo: string;
  tier: 'S' | 'A' | 'B' | 'C';
  domain: string;
  ctcRange: string;
  eligibilityCGPA: number;
  roles: string[];
  oaPattern: string[];
  interviewRounds: string[];
  topicsRequired: string[];
  recentlyAsked: string[];
  readinessScore?: number;
  probability?: number;
  deadline?: string;
  driveDate?: string;
  locations: string[];
  headcount?: number;
  hiringStatus: 'active' | 'upcoming' | 'closed';
  tips: string[];
  projectsPreferred: string[];
  skills: string[];
}

// Resume
export interface ResumeAnalysis {
  atsScore: number;
  grammarScore: number;
  keywordsScore: number;
  formattingScore: number;
  projectsScore: number;
  overallScore: number;
  missingKeywords: string[];
  suggestions: string[];
  strengths: string[];
  improvements: string[];
  companyFit: Record<string, number>;
}

// Gamification
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  unlockedAt?: string;
  category: 'dsa' | 'aptitude' | 'interview' | 'streak' | 'social' | 'milestone';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
}

export interface UserProgress {
  xp: number;
  level: number;
  coins: number;
  streak: number;
  weeklyStreak: number;
  achievements: Achievement[];
  rank: number;
  placementScore: number;
  dsaScore: number;
  aptitudeScore: number;
  interviewScore: number;
  resumeScore: number;
  consistencyScore: number;
}

// Notifications
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'reminder' | 'achievement' | 'alert' | 'info' | 'success';
  read: boolean;
  createdAt: string;
  action?: string;
  icon?: string;
}

// AI Chat
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  agentType?: 'roadmap' | 'dsa' | 'aptitude' | 'interview' | 'company' | 'resume' | 'mentor';
}

export interface AgentStatus {
  id: string;
  name: string;
  status: 'active' | 'idle' | 'thinking' | 'error';
  lastAction: string;
  tasksCompleted: number;
  currentTask?: string;
}

// Analytics
export interface AnalyticsData {
  productivityByDay: Array<{ day: string; hours: number; tasks: number }>;
  skillRadar: Array<{ subject: string; score: number; fullMark: number }>;
  progressOverTime: Array<{ date: string; dsa: number; aptitude: number; interview: number }>;
  topicDistribution: Array<{ name: string; value: number; color: string }>;
  weeklyComparison: Array<{ week: string; xp: number; problems: number; tests: number }>;
}
