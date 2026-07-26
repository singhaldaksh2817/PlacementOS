import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

const dbPath = path.join(__dirname, '..', 'database.sqlite');

let db: Database<sqlite3.Database, sqlite3.Statement>;

export async function initDb() {
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  // Enable foreign keys
  await db.run('PRAGMA foreign_keys = ON');

  // Create Users Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      passwordHash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'student',
      college TEXT,
      branch TEXT,
      year INTEGER,
      cgpa REAL,
      targetCompanies TEXT, -- JSON Array
      dailyHours INTEGER,
      placementMonth TEXT,
      createdAt TEXT NOT NULL
    );
  `);

  // Create User Progress Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS progress (
      userId TEXT PRIMARY KEY,
      xp INTEGER DEFAULT 0,
      level INTEGER DEFAULT 1,
      coins INTEGER DEFAULT 0,
      streak INTEGER DEFAULT 0,
      weeklyStreak INTEGER DEFAULT 0,
      rank INTEGER DEFAULT 99999,
      placementScore REAL DEFAULT 10,
      dsaScore REAL DEFAULT 0,
      aptitudeScore REAL DEFAULT 0,
      interviewScore REAL DEFAULT 0,
      resumeScore REAL DEFAULT 0,
      consistencyScore REAL DEFAULT 0,
      achievements TEXT, -- JSON Array
      FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Create DSA Stats Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS dsa_stats (
      userId TEXT PRIMARY KEY,
      totalSolved INTEGER DEFAULT 0,
      easySolved INTEGER DEFAULT 0,
      mediumSolved INTEGER DEFAULT 0,
      hardSolved INTEGER DEFAULT 0,
      streak INTEGER DEFAULT 0,
      contestRating INTEGER DEFAULT 0,
      acceptanceRate REAL DEFAULT 0,
      topicWise TEXT, -- JSON Object
      dailyActivity TEXT, -- JSON Array
      weakTopics TEXT, -- JSON Array
      strongTopics TEXT, -- JSON Array
      FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Create Interview Sessions Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS interview_sessions (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      company TEXT NOT NULL,
      round TEXT NOT NULL,
      date TEXT NOT NULL,
      duration INTEGER NOT NULL,
      score INTEGER NOT NULL,
      confidenceScore INTEGER NOT NULL,
      technicalScore INTEGER NOT NULL,
      communicationScore INTEGER NOT NULL,
      feedback TEXT NOT NULL,
      transcript TEXT, -- JSON Array
      improvements TEXT, -- JSON Array
      FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Create Notifications Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL,
      read INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL,
      icon TEXT,
      FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Create Chat Messages Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      agentType TEXT NOT NULL,
      FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  console.log('📦 Database initialized successfully.');
}

export function getDb() {
  if (!db) {
    throw new Error('Database not initialized. Call initDb() first.');
  }
  return db;
}
