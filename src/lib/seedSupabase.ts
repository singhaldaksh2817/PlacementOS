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
    companies: p.companies,
    description: p.description,
    examples: p.examples,
    constraints: p.constraints,
    expected_output: p.expectedOutput,
    platform_url: `https://leetcode.com/problems/${p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
  }));

  // Batch insert in chunks of 50
  for (let i = 0; i < mapped.length; i += 50) {
    const chunk = mapped.slice(i, i + 50);
    const { error } = await supabase.from('dsa_problems').upsert(chunk);
    if (error) {
      console.error(error);
      errors += chunk.length;
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
    logo: c.logo,
    tier: c.tier,
    domain: c.domain,
    ctc_range: c.ctcRange,
    eligibility_cgpa: c.eligibilityCGPA,
    roles: c.roles,
    oa_pattern: c.oaPattern,
    interview_rounds: c.interviewRounds,
    topics_required: c.topicsRequired,
    recently_asked: c.recentlyAsked,
    readiness_score: c.readinessScore,
    probability: c.probability,
    deadline: c.deadline,
    drive_date: c.driveDate,
    locations: c.locations,
    hiring_status: c.hiringStatus,
    tips: c.tips,
    projects_preferred: c.projectsPreferred,
    skills: c.skills,
  }));

  for (let i = 0; i < mapped.length; i += 50) {
    const chunk = mapped.slice(i, i + 50);
    const { error } = await supabase.from('companies').upsert(chunk);
    if (error) {
      console.error(error);
      errors += chunk.length;
    } else {
      inserted += chunk.length;
    }
  }
  
  return { inserted, errors };
}

export async function runFullSeed(): Promise<void> {
  console.log('Starting seed...');
  const [dsaResult, companiesResult] = await Promise.all([
    seedDSAProblems(),
    seedCompanies()
  ]);
  console.log('DSA Problems:', dsaResult);
  console.log('Companies:', companiesResult);
}
