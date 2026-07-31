import { supabase } from './supabaseClient';
import { DSA_PROBLEMS, COMPANIES } from '../data/mockData';

export async function seedDSAProblems(): Promise<{ inserted: number; errors: number }> {
  let inserted = 0;
  let errors = 0;
  
  const mapped = DSA_PROBLEMS.map(p => ({
    id: p.id,
    title: p.title,
    difficulty: p.difficulty,
    topic: p.topic,
    companies: p.companies || [],
    description: p.description || '',
    examples: p.examples || [],
    constraints: p.constraints || [],
    expected_output: p.expectedOutput || '',
    platform: 'LeetCode',
    platform_url: `https://leetcode.com/problems/${p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
  }));

  // Batch insert in chunks of 20 to avoid large payload limits
  for (let i = 0; i < mapped.length; i += 20) {
    const chunk = mapped.slice(i, i + 20);
    const { error } = await supabase.from('dsa_problems').upsert(chunk);
    if (error) {
      console.error('DSA Problems Seed Error:', error.message, error.details, error.hint);
      errors += chunk.length;
      throw new Error(`dsa_problems table error: ${error.message}`);
    } else {
      inserted += chunk.length;
    }
  }

  return { inserted, errors };
}

export async function seedCompanies(): Promise<{ inserted: number; errors: number }> {
  let inserted = 0;
  let errors = 0;

  const mapped = COMPANIES.map(c => ({
    id: c.id,
    name: c.name,
    logo: c.logo || c.name?.[0] || 'C',
    tier: c.tier || 'A',
    domain: c.domain || 'Technology',
    ctc_range: c.ctcRange || '15-25 LPA',
    eligibility_cgpa: c.eligibilityCGPA || 6.5,
    roles: c.roles || [],
    oa_pattern: c.oaPattern || [],
    interview_rounds: c.interviewRounds || [],
    topics_required: c.topicsRequired || [],
    recently_asked: c.recentlyAsked || [],
    readiness_score: c.readinessScore || 60,
    probability: c.probability || 50,
    deadline: c.deadline || '',
    drive_date: c.driveDate || '',
    locations: c.locations || [],
    hiring_status: c.hiringStatus || 'upcoming',
    tips: c.tips || [],
    projects_preferred: c.projectsPreferred || [],
    skills: c.skills || [],
  }));

  for (let i = 0; i < mapped.length; i += 20) {
    const chunk = mapped.slice(i, i + 20);
    const { error } = await supabase.from('companies').upsert(chunk);
    if (error) {
      console.error('Companies Seed Error:', error.message, error.details, error.hint);
      errors += chunk.length;
      throw new Error(`companies table error: ${error.message}`);
    } else {
      inserted += chunk.length;
    }
  }
  
  return { inserted, errors };
}

export async function runFullSeed(): Promise<void> {
  console.log('Starting seed process...');
  const dsaResult = await seedDSAProblems();
  const companiesResult = await seedCompanies();
  console.log('DSA Problems Seed Result:', dsaResult);
  console.log('Companies Seed Result:', companiesResult);
}
