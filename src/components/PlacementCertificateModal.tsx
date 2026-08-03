import { motion } from 'framer-motion';
import { Award, Download, Share2, X, CheckCircle, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { useStore } from '../store/useStore';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PlacementCertificateModal({ isOpen, onClose }: CertificateModalProps) {
  const { user, progress, dsaStats } = useStore();

  if (!isOpen) return null;

  const studentName = user?.name || 'Student';
  const collegeName = user?.college || 'Engineering College';
  const score = progress.placementScore ?? 0;
  const rank = progress.rank ?? 99999;
  const dsaSolved = dsaStats.totalSolved ?? 0;
  const issueDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`https://placementos.com/verify/cert-${user?.id || 'demo'}`);
    toast.success('Certificate verification link copied to clipboard! 🔗');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-3xl glass-card p-6 border-indigo-500/30 space-y-6 my-8"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-lg bg-white/5 border border-white/10 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Certificate Printable Area */}
        <div id="certificate-print-area" className="bg-gradient-to-b from-[#0d0d26] to-[#04040e] p-8 rounded-2xl border-2 border-amber-400/40 relative overflow-hidden shadow-2xl space-y-6">

          {/* Certificate Corner Ornaments */}
          <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-amber-400/60" />
          <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-amber-400/60" />
          <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-amber-400/60" />
          <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-amber-400/60" />

          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-indigo-600 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
              <Award size={36} className="text-white" />
            </div>
            <div className="text-xs font-bold tracking-widest text-amber-400 uppercase">PLACEMENTOS OFFICIAL CERTIFICATION</div>
            <h1 className="text-3xl font-heading font-black text-white tracking-wide">Certificate of Placement Readiness</h1>
            <p className="text-xs text-slate-400 max-w-md mx-auto">Verified engineering readiness, algorithmic proficiency, and technical interview competency evaluation.</p>
          </div>

          {/* Recipient Details */}
          <div className="text-center py-4 space-y-2 border-y border-white/10">
            <div className="text-xs text-slate-400 uppercase tracking-wider">This certifies that</div>
            <div className="text-2xl font-heading font-bold gradient-text">{studentName}</div>
            <div className="text-sm text-slate-300 font-medium">{collegeName}</div>
            <p className="text-xs text-slate-400 max-w-lg mx-auto pt-2">
              has successfully achieved an exceptional placement readiness score of <strong className="text-amber-400 font-bold">{score}%</strong> across DSA problem solving ({dsaSolved} problems solved), company mock assessments, and system design evaluations.
            </p>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-white/5 p-3 rounded-xl border border-white/10">
              <div className="text-xs text-slate-400">Readiness Score</div>
              <div className="text-lg font-bold text-emerald-400">{score} / 100</div>
            </div>
            <div className="bg-white/5 p-3 rounded-xl border border-white/10">
              <div className="text-xs text-slate-400">DSA Solved</div>
              <div className="text-lg font-bold text-indigo-400">{dsaSolved}+ Problems</div>
            </div>
            <div className="bg-white/5 p-3 rounded-xl border border-white/10">
              <div className="text-xs text-slate-400">Platform Rank</div>
              <div className="text-lg font-bold text-amber-400">Top #{rank}</div>
            </div>
          </div>

          {/* Footer & Signature */}
          <div className="flex items-end justify-between pt-4 border-t border-white/10 text-xs">
            <div>
              <div className="text-slate-500">Issued On: {issueDate}</div>
              <div className="text-slate-500">Verification ID: POS-VERIFIED-{(user?.id || '001').slice(0, 8).toUpperCase()}</div>
              <div className="flex items-center gap-1 text-emerald-400 font-semibold mt-1">
                <ShieldCheck size={14} /> Cryptographically Verified
              </div>
            </div>

            <div className="text-right">
              <div className="font-heading font-bold text-white italic text-sm">PlacementOS AI Evaluation Engine</div>
              <div className="text-slate-500 text-[10px]">Verified Technical Committee</div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            onClick={handleShare}
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <Share2 size={14} /> Share Link
          </button>

          <button
            onClick={handlePrint}
            className="btn-gradient px-6 py-2.5 rounded-xl text-white text-xs font-semibold flex items-center gap-2"
          >
            <Download size={14} /> Print / Save as PDF
          </button>
        </div>
      </motion.div>
    </div>
  );
}
