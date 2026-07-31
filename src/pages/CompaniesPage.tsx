import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TopBar from '../components/layout/TopBar';
import {
  Building2, Search, Filter, ChevronDown, ChevronUp,
  MapPin, Clock, Target, CheckCircle, AlertCircle,
  TrendingUp, Star, ExternalLink, Calendar, BookOpen, X, Code2, Globe, Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { COMPANIES, DSA_PROBLEMS } from '../data/mockData';
import { supabase } from '../lib/supabaseClient';
import type { Company } from '../types';


const tierColors: Record<string, string> = {
  S: 'text-amber-400 bg-amber-500/15 border-amber-500/25',
  A: 'text-purple-400 bg-purple-500/15 border-purple-500/25',
  B: 'text-blue-400 bg-blue-500/15 border-blue-500/25',
  C: 'text-slate-400 bg-slate-500/15 border-slate-500/25',
};

const hiringStatusBadge: Record<string, string> = {
  active: 'badge-emerald',
  upcoming: 'badge-amber',
  closed: 'badge-red',
};

function CompanyCard({ company, expanded, onClick, onOpenPYQ }: { company: Company; expanded: boolean; onClick: () => void; onOpenPYQ: (name: string) => void }) {

  const readiness = company.readinessScore || 0;
  const prob = company.probability || 0;

  return (
    <motion.div
      layout
      className={`glass-card overflow-hidden cursor-pointer ${expanded ? 'border-indigo-500/30' : 'glass-card-hover'}`}
      onClick={onClick}
    >
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Logo */}
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center font-bold text-lg text-white border border-white/10 flex-shrink-0">
            {company.logo}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-heading font-bold text-white text-lg">{company.name}</span>
              <span className={`badge text-xs ${tierColors[company.tier]}`}>Tier {company.tier}</span>
              <span className={`badge text-xs ${hiringStatusBadge[company.hiringStatus]}`}>{company.hiringStatus}</span>
              <button
                onClick={(e) => { e.stopPropagation(); onOpenPYQ(company.name); }}
                className="text-xs px-2.5 py-1 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/30 transition-all font-medium flex items-center gap-1 ml-auto"
              >
                <BookOpen size={11} /> PYQ Sheet 📚
              </button>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-500 mb-3 flex-wrap">
              <span>{company.domain}</span>
              <span className="flex items-center gap-1"><MapPin size={11} />{company.locations.join(', ')}</span>
              <span className="text-emerald-400 font-semibold">{company.ctcRange}</span>
            </div>

            {/* Readiness + Probability */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Readiness</span>
                  <span className="font-semibold" style={{ color: readiness >= 70 ? '#34d399' : readiness >= 50 ? '#fbbf24' : '#f87171' }}>
                    {readiness}%
                  </span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div className="h-full rounded-full"
                    style={{ background: readiness >= 70 ? '#34d399' : readiness >= 50 ? '#fbbf24' : '#f87171' }}
                    initial={{ width: 0 }} animate={{ width: `${readiness}%` }} transition={{ duration: 1 }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Probability</span>
                  <span className="font-semibold text-indigo-400">{prob}%</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div className="h-full rounded-full bg-indigo-500"
                    initial={{ width: 0 }} animate={{ width: `${prob}%` }} transition={{ duration: 1 }} />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            {company.deadline && (
              <div className="flex items-center gap-1 text-xs text-amber-400">
                <Calendar size={12} />
                {new Date(company.deadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
              </div>
            )}
            {expanded ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/6 overflow-hidden"
          >
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-4">
                <div>
                  <div className="text-xs font-semibold text-slate-400 mb-2">CGPA Cutoff</div>
                  <div className={`text-sm font-medium ${company.eligibilityCGPA <= 7.0 ? 'text-emerald-400' : company.eligibilityCGPA <= 7.5 ? 'text-amber-400' : 'text-red-400'}`}>
                    {company.eligibilityCGPA}+ required {company.eligibilityCGPA <= 7.0 ? '✓ You qualify' : ''}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-slate-400 mb-2">OA Pattern</div>
                  <div className="flex flex-wrap gap-1.5">
                    {company.oaPattern.map(p => (
                      <span key={p} className="text-xs px-2 py-1 rounded-lg bg-white/5 text-slate-300">{p}</span>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-slate-400 mb-2">Interview Rounds</div>
                  <div className="space-y-1">
                    {company.interviewRounds.map((r, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                        <div className="w-4 h-4 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xs flex-shrink-0">{i+1}</div>
                        {r}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-semibold text-slate-400">Recently Asked PYQs</div>
                    <button
                      onClick={(e) => { e.stopPropagation(); onOpenPYQ(company.name); }}
                      className="text-xs px-2.5 py-1 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/30 transition-all font-medium flex items-center gap-1"
                    >
                      <BookOpen size={12} /> View PYQ Sheet 📚
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {company.recentlyAsked.map(q => (
                      <span key={q} className="text-xs px-2 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">{q}</span>
                    ))}
                  </div>
                </div>

              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-xs font-semibold text-slate-400 mb-2">Key Topics Required</div>
                  <div className="flex flex-wrap gap-1.5">
                    {company.topicsRequired.map(t => (
                      <span key={t} className="text-xs px-2 py-1 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/20">{t}</span>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-slate-400 mb-2">Skills Required</div>
                  <div className="flex flex-wrap gap-1.5">
                    {company.skills.map(s => (
                      <span key={s} className="text-xs px-2 py-1 rounded-lg bg-blue-500/10 text-blue-300 border border-blue-500/20">{s}</span>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-slate-400 mb-2">📝 Expert Tips</div>
                  <ul className="space-y-2">
                    {company.tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                        <Star size={11} className="text-amber-400 flex-shrink-0 mt-0.5" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div className="text-xs font-semibold text-slate-400 mb-2">Projects Preferred</div>
                  <div className="flex flex-wrap gap-1.5">
                    {company.projectsPreferred.map(p => (
                      <span key={p} className="text-xs px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">{p}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="px-5 pb-4">
              <div className="text-xs font-semibold text-slate-400 mb-2">Roles Available</div>
              <div className="flex gap-2 flex-wrap">
                {company.roles.map(r => <span key={r} className="badge badge-cyan">{r}</span>)}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function CompaniesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pyqCompany, setPyqCompany] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'readiness' | 'probability' | 'ctc'>('readiness');
  const [companies, setCompanies] = useState<Company[]>(COMPANIES);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [usingLiveData, setUsingLiveData] = useState(false);

  // Fetch companies from Supabase; fall back to mockData if table empty
  useEffect(() => {
    supabase.from('companies').select('*').then(({ data, error }) => {
      if (!error && data && data.length > 0) {
        // Map snake_case columns back to camelCase for compatibility
        const mapped: Company[] = data.map((c: any) => ({
          id: c.id, name: c.name, logo: c.logo || c.name?.[0] || 'C', tier: c.tier || 'A',
          domain: c.domain || 'Technology', ctcRange: c.ctc_range || '15-25 LPA',
          roles: c.roles || [], oaPattern: c.oa_pattern || ['Coding', 'Aptitude'],
          interviewRounds: c.interview_rounds || ['OA', 'Technical', 'HR'],
          topicsRequired: c.topics_required || [],
          recentlyAsked: c.recently_asked || [], hiringStatus: c.hiring_status || 'upcoming',
          driveDate: c.drive_date, deadline: c.deadline,
          locations: c.locations || [], eligibilityCGPA: c.eligibility_cgpa || 6.5,
          tips: c.tips || [], skills: c.skills || [],
          projectsPreferred: [], readinessScore: 60, probability: 50,
        }));
        setCompanies(mapped);
        setUsingLiveData(true);
      }
      setLoadingCompanies(false);
    });
  }, []);

  const filtered = companies
    .filter(c => {
      const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
                          c.domain.toLowerCase().includes(search.toLowerCase());
      const matchTier = tierFilter === 'All' || c.tier === tierFilter;
      const matchStatus = statusFilter === 'All' || c.hiringStatus === statusFilter;
      return matchSearch && matchTier && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'readiness') return (b.readinessScore || 0) - (a.readinessScore || 0);
      if (sortBy === 'probability') return (b.probability || 0) - (a.probability || 0);
      return 0;
    });


  return (
    <div className="flex-1 overflow-y-auto">
      <TopBar title="Companies" subtitle="AI-tracked hiring intelligence" />
      <div className="p-6 space-y-5">

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Active Drives', value: COMPANIES.filter(c => c.hiringStatus === 'active').length, color: '#10b981' },
            { label: 'Upcoming Drives', value: COMPANIES.filter(c => c.hiringStatus === 'upcoming').length, color: '#f59e0b' },
            { label: 'Avg Readiness', value: `${Math.round(COMPANIES.reduce((s,c) => s + (c.readinessScore||0), 0) / COMPANIES.length)}%`, color: '#6366f1' },
            { label: 'Best Probability', value: `${Math.max(...COMPANIES.map(c => c.probability||0))}%`, color: '#8b5cf6' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="glass-card p-4">
              <div className="text-2xl font-heading font-bold" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs text-slate-500 mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            <input type="text" placeholder="Search companies..." value={search}
              onChange={e => setSearch(e.target.value)} className="input-dark input-icon-left text-sm py-2" />
          </div>

          <select value={tierFilter} onChange={e => setTierFilter(e.target.value)} className="input-dark text-sm py-2 w-auto px-3">
            {['All', 'S', 'A', 'B', 'C'].map(t => <option key={t} value={t}>{t === 'All' ? 'All Tiers' : `Tier ${t}`}</option>)}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-dark text-sm py-2 w-auto px-3">
            {['All', 'active', 'upcoming', 'closed'].map(s => <option key={s} value={s}>{s === 'All' ? 'All Status' : s}</option>)}
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} className="input-dark text-sm py-2 w-auto px-3">
            <option value="readiness">Sort: Readiness</option>
            <option value="probability">Sort: Probability</option>
          </select>
        </div>

        <div className="text-xs text-slate-500">{filtered.length} companies found</div>

        {/* Company Cards */}
        <div className="space-y-3">
          {filtered.map((company, i) => (
            <motion.div key={company.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <CompanyCard
                company={company}
                expanded={expandedId === company.id}
                onClick={() => setExpandedId(expandedId === company.id ? null : company.id)}
                onOpenPYQ={(name) => setPyqCompany(name)}
              />
            </motion.div>
          ))}
        </div>

        {/* PYQ Sheet Modal */}
        <AnimatePresence>
          {pyqCompany && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-card p-6 max-w-xl w-full relative border-indigo-500/30 space-y-4"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <BookOpen size={18} className="text-indigo-400" />
                    <h3 className="font-heading font-bold text-lg text-white">{pyqCompany} Official PYQ Sheet</h3>
                  </div>
                  <button onClick={() => setPyqCompany(null)} className="text-slate-400 hover:text-white p-1 rounded-lg bg-white/5">
                    <X size={16} />
                  </button>
                </div>

                <p className="text-xs text-slate-400">
                  Most frequently asked coding & algorithmic questions in {pyqCompany}'s technical rounds.
                </p>

                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  {(() => {
                    const matched = DSA_PROBLEMS.filter(p => p.companies.includes(pyqCompany));
                    const other = DSA_PROBLEMS.filter(p => !p.companies.includes(pyqCompany));
                    const list = matched.length >= 7 ? matched : [...matched, ...other].slice(0, 7);

                    return list.map(pyq => (
                      <div key={pyq.id} className="flex items-center justify-between p-3 rounded-xl bg-white/4 border border-white/8 hover:border-indigo-500/30 transition-all">
                        <div>
                          <div className="text-sm font-semibold text-white">{pyq.title}</div>
                          <div className="text-xs text-slate-400 mt-0.5">{pyq.topic} • <span className={pyq.difficulty === 'Hard' ? 'text-red-400' : pyq.difficulty === 'Medium' ? 'text-amber-400' : 'text-emerald-400'}>{pyq.difficulty}</span></div>
                        </div>
                        <button
                          onClick={() => {
                            setPyqCompany(null);
                            navigate('/dsa', { state: { openIde: true, problemId: pyq.id, problemTitle: pyq.title } });
                          }}
                          className="px-3 py-1.5 rounded-lg btn-gradient text-xs font-semibold flex items-center gap-1 hover:opacity-90 transition-all cursor-pointer"
                        >
                          <Code2 size={12} /> Solve in IDE
                        </button>
                      </div>
                    ));
                  })()}
                </div>


                <div className="pt-2 text-right">
                  <button onClick={() => setPyqCompany(null)} className="px-4 py-2 rounded-xl bg-white/5 text-xs text-slate-300 hover:text-white">
                    Close Sheet
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-500">
            <Building2 size={40} className="mx-auto mb-3 opacity-30" />
            <p>No companies found matching your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
