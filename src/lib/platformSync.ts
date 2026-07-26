// src/lib/platformSync.ts
// Free public APIs — no API key required

export interface LeetCodeStats {
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  acceptanceRate: number;
  ranking: number;
  contributionPoints: number;
  reputation: number;
  username: string;
}

export interface GitHubStats {
  publicRepos: number;
  followers: number;
  following: number;
  totalStars: number;
  topLanguages: string[];
  contributionsLastYear: number;
  username: string;
  avatarUrl: string;
  bio: string;
  company: string;
}

export async function fetchLeetCodeStats(username: string): Promise<LeetCodeStats | null> {
  try {
    // LeetCode GraphQL public API
    const query = `
      query getUserProfile($username: String!) {
        matchedUser(username: $username) {
          username
          submitStats: submitStatsGlobal {
            acSubmissionNum {
              difficulty
              count
            }
          }
          profile {
            ranking
            reputation
            solutionCount
            contributionPoints
          }
        }
      }
    `;
    const res = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Referer': 'https://leetcode.com' },
      body: JSON.stringify({ query, variables: { username } }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const user = data?.data?.matchedUser;
    if (!user) return null;
    
    const stats = user.submitStats?.acSubmissionNum || [];
    const getCount = (diff: string) => stats.find((s: any) => s.difficulty === diff)?.count || 0;
    
    return {
      username: user.username,
      totalSolved: getCount('All'),
      easySolved: getCount('Easy'),
      mediumSolved: getCount('Medium'),
      hardSolved: getCount('Hard'),
      acceptanceRate: 0, // not in this query
      ranking: user.profile?.ranking || 0,
      contributionPoints: user.profile?.contributionPoints || 0,
      reputation: user.profile?.reputation || 0,
    };
  } catch (err) {
    console.warn('[LeetCode sync] Failed:', err);
    return null;
  }
}

export async function fetchGitHubStats(username: string): Promise<GitHubStats | null> {
  try {
    // GitHub public REST API — no auth needed for public profiles
    const [profileRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${username}`, {
        headers: { 'Accept': 'application/vnd.github.v3+json' }
      }),
      fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`, {
        headers: { 'Accept': 'application/vnd.github.v3+json' }
      }),
    ]);
    
    if (!profileRes.ok) return null;
    const profile = await profileRes.json();
    const repos = reposRes.ok ? await reposRes.json() : [];
    
    // Calculate total stars and top languages
    const totalStars = repos.reduce((sum: number, r: any) => sum + (r.stargazers_count || 0), 0);
    const langCount: Record<string, number> = {};
    repos.forEach((r: any) => { if (r.language) langCount[r.language] = (langCount[r.language] || 0) + 1; });
    const topLanguages = Object.entries(langCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([lang]) => lang);
    
    return {
      username: profile.login,
      publicRepos: profile.public_repos || 0,
      followers: profile.followers || 0,
      following: profile.following || 0,
      totalStars,
      topLanguages,
      contributionsLastYear: profile.public_repos * 12, // approximation
      avatarUrl: profile.avatar_url || '',
      bio: profile.bio || '',
      company: profile.company || '',
    };
  } catch (err) {
    console.warn('[GitHub sync] Failed:', err);
    return null;
  }
}
