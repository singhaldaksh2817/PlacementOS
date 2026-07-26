import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TopBar from '../components/layout/TopBar';
import {
  Briefcase, Building2, MapPin, ExternalLink, Send,
  Copy, Filter, Search, CheckCircle, Sparkles, UserCheck
} from 'lucide-react';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';

interface Drive {
  id: string;
  company: string;
  logo: string;
  role: string;
  batch: string[];
  location: string;
  ctc: string;
  deadline: string;
  applyUrl: string;
  type: 'Full Time' | 'Internship';
  status: 'Active' | 'Closing Soon';
  description: string;
  referralTip: string;
}

const DRIVES_LIST: Drive[] = [
  {
    id: 'd1',
    company: 'Google',
    logo: 'G',
    role: 'Software Engineer, University Graduate 2025',
    batch: ['2025', '2024'],
    location: 'Bangalore / Hyderabad',
    ctc: '₹32 - 45 LPA',
    deadline: 'Aug 15, 2025',
    applyUrl: 'https://careers.google.com',
    type: 'Full Time',
    status: 'Active',
    description: 'Looking for computer science graduates with strong DSA fundamentals, system programming, and problem solving skills.',
    referralTip: 'Highlight your competitive programming profile (Codeforces / LeetCode rating) when reaching out to Google Googlers.'
  },
  {
    id: 'd2',
    company: 'Amazon',
    logo: 'A',
    role: 'SDE-1 Off-Campus Drive (Batch 2025)',
    batch: ['2025'],
    location: 'Bangalore / Gurgaon / Chennai',
    ctc: '₹28 - 40 LPA',
    deadline: 'Aug 20, 2025',
    applyUrl: 'https://amazon.jobs',
    type: 'Full Time',
    status: 'Active',
    description: 'Join Amazon AWS / Retail backend teams. Focuses on Leadership Principles, Object Oriented Design, and Data Structures.',
    referralTip: 'Mention Amazon Leadership Principles like "Customer Obsession" and "Bias for Action" in your referral pitch.'
  },
  {
    id: 'd3',
    company: 'Microsoft',
    logo: 'M',
    role: 'Software Engineering Intern (Summer 2026)',
    batch: ['2026'],
    location: 'Hyderabad / Noida',
    ctc: '₹1.2 Lakh / month Stipend',
    deadline: 'Sep 01, 2025',
    applyUrl: 'https://careers.microsoft.com',
    type: 'Internship',
    status: 'Active',
    description: '2-month summer engineering internship for 3rd year B.Tech / BE students.',
    referralTip: 'Target Microsoft SWEs who joined in the last 1-2 years from your college or tier-2/3 network.'
  },
  {
    id: 'd4',
    company: 'Flipkart',
    logo: 'F',
    role: 'Software Development Engineer - I',
    batch: ['2024', '2025'],
    location: 'Bangalore',
    ctc: '₹26 - 32 LPA',
    deadline: 'Aug 10, 2025',
    applyUrl: 'https://flipkart.com/careers',
    type: 'Full Time',
    status: 'Closing Soon',
    description: 'High-scale e-commerce systems engineering, microservices, and distributed databases.',
    referralTip: 'Share your GitHub projects involving Redis or Kafka messaging queues.'
  },
  {
    id: 'd5',
    company: 'Adobe',
    logo: 'Ad',
    role: 'Member of Technical Staff - 1',
    batch: ['2025'],
    location: 'Noida / Bangalore',
    ctc: '₹24 - 30 LPA',
    deadline: 'Aug 25, 2025',
    applyUrl: 'https://adobe.com/careers',
    type: 'Full Time',
    status: 'Active',
    description: 'Adobe Creative Cloud & Experience Platform core algorithms and graphics engineering.',
    referralTip: 'Mention your CGPA and core CS fundamentals (OS, DBMS, Computer Networks).'
  }
];

export default function DrivesPage() {
  const { user } = useStore();
  const [selectedBatch, setSelectedBatch] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [referralDrive, setReferralDrive] = useState<Drive | null>(null);

  const filteredDrives = DRIVES_LIST.filter(d => {
    const matchBatch = selectedBatch === 'All' || d.batch.includes(selectedBatch);
    const matchType = selectedType === 'All' || d.type === selectedType;
    const matchSearch = d.company.toLowerCase().includes(searchQuery.toLowerCase()) || d.role.toLowerCase().includes(searchQuery.toLowerCase());
    return matchBatch && matchType && matchSearch;
  });

  const generateReferralMessage = (drive: Drive) => {
    const studentName = user?.name || 'Daksh Singhal';
    const college = user?.college || 'IIT Bombay';
    const branch = user?.branch || 'Computer Science';

    return `Hi [Senior Name],

Hope you are doing well! I'm ${studentName}, currently in my final year of ${branch} at ${college}.

I noticed an active opening at ${drive.company} for the "${drive.role}" position (Req ID / Batch ${drive.batch.join('/')}).

I have solved 340+ DSA problems (LeetCode/Codeforces) and built full-stack projects in React, Node.js, and Distributed Systems. I would be extremely grateful if you could refer me for this role!

Here is my Resume: [Link to Resume]
Target Role: ${drive.role}

Thank you so much for your time and guidance!

Best regards,
${studentName}`;
  };

  const handleCopyReferral = (drive: Drive) => {
    const msg = generateReferralMessage(drive);
    navigator.clipboard.writeText(msg);
    toast.success('AI Referral outreach message copied to clipboard! 📋');
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <TopBar title="Off-Campus Drives & AI Referrals 💼" subtitle="Curated Tier-1 Off-Campus Openings & 1-Click LinkedIn Outreach Generator" />

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Banner */}
        <div className="glass-card p-6 relative overflow-hidden bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-slate-900/60 border border-purple-500/20">
          <div className="flex items-center justify-between relative z-10 flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="badge badge-emerald">Live Openings</span>
                <span className="badge badge-indigo">Batch 2024 / 2025 / 2026</span>
              </div>
              <h1 className="text-2xl font-bold font-heading text-white">Off-Campus Hiring Board & AI Referral Assistant</h1>
              <p className="text-sm text-slate-300 max-w-2xl mt-1">
                80% of off-campus interviews are secured through referrals. Browse verified tech drives and generate tailored 1-click LinkedIn referral requests for seniors!
              </p>
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[240px]">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by company or role (e.g. Google, SDE-1)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="input-dark input-icon-left text-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Batch:</span>
            {['All', '2024', '2025', '2026'].map(b => (
              <button
                key={b}
                onClick={() => setSelectedBatch(b)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                  selectedBatch === b ? 'tab-active' : 'tab-inactive'
                }`}
              >
                {b}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Type:</span>
            {['All', 'Full Time', 'Internship'].map(t => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                  selectedType === t ? 'tab-active' : 'tab-inactive'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Drives List */}
        <div className="space-y-4">
          {filteredDrives.map((drive, i) => (
            <motion.div
              key={drive.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-5 space-y-3 hover:border-indigo-500/30 transition-all"
            >
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-lg text-white shadow-lg border border-white/10 flex-shrink-0">
                    {drive.logo}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">{drive.company}</h3>
                      <span className={`badge text-[10px] ${drive.status === 'Active' ? 'badge-emerald' : 'badge-amber'}`}>{drive.status}</span>
                      <span className="badge badge-indigo text-[10px]">{drive.type}</span>
                    </div>
                    <p className="text-sm font-semibold text-indigo-300 mt-0.5">{drive.role}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 flex-wrap">
                      <span>📍 {drive.location}</span>
                      <span>💰 <strong className="text-emerald-400">{drive.ctc}</strong></span>
                      <span>🎓 Batch: <strong className="text-slate-200">{drive.batch.join(', ')}</strong></span>
                      <span>⏰ Deadline: <strong className="text-amber-300">{drive.deadline}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setReferralDrive(drive)}
                    className="flex items-center gap-1.5 text-xs px-3.5 py-2 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 hover:bg-purple-500/25 transition-all font-semibold"
                  >
                    <Sparkles size={14} /> AI Referral Pitch
                  </button>
                  <a
                    href={drive.applyUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-xl btn-gradient font-semibold"
                  >
                    Apply Link <ExternalLink size={12} />
                  </a>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/3 border border-white/5 text-xs text-slate-300">
                <span className="font-semibold text-white">Drive Details:</span> {drive.description}
              </div>
            </motion.div>
          ))}
        </div>

        {/* AI Referral Modal */}
        <AnimatePresence>
          {referralDrive && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-card p-6 max-w-2xl w-full border border-purple-500/30 space-y-4 shadow-2xl"
              >
                <div className="flex items-center justify-between border-b border-white/8 pb-3">
                  <div className="flex items-center gap-2">
                    <UserCheck size={18} className="text-purple-400" />
                    <h3 className="text-lg font-bold text-white">AI LinkedIn Referral Outreach Generator</h3>
                  </div>
                  <button onClick={() => setReferralDrive(null)} className="text-xs text-slate-400 hover:text-white">✕ Close</button>
                </div>

                <div className="text-xs text-slate-300">
                  Tailored referral pitch for <strong className="text-white">{referralDrive.company} — {referralDrive.role}</strong>. Copy and send directly to employees on LinkedIn!
                </div>

                <textarea
                  readOnly
                  value={generateReferralMessage(referralDrive)}
                  className="input-dark h-52 font-mono text-xs text-slate-200 resize-none leading-relaxed p-3"
                />

                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                  💡 <strong className="text-white">Pro Tip for {referralDrive.company}:</strong> {referralDrive.referralTip}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button onClick={() => setReferralDrive(null)} className="px-4 py-2 rounded-xl bg-white/5 text-xs text-slate-400 hover:text-white">
                    Close
                  </button>
                  <button
                    onClick={() => handleCopyReferral(referralDrive)}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl btn-gradient text-xs font-semibold"
                  >
                    <Copy size={12} /> Copy to Clipboard
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
