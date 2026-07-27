import { motion } from 'framer-motion';
import { Zap, Lock, CheckCircle, Sparkles, ShieldCheck } from 'lucide-react';
import { useStore } from '../../store/useStore';
import toast from 'react-hot-toast';

interface ProLockOverlayProps {
  featureName: string;
  description: string;
}

export default function ProLockOverlay({ featureName, description }: ProLockOverlayProps) {
  const { isProUser, upgradeToPro } = useStore();

  if (isProUser) return null;

  const handleInstantUpgrade = () => {
    upgradeToPro();
    toast.success('🎉 PlacementOS Pro ⚡ Active! All premium features unlocked!');
  };

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-8 max-w-lg w-full text-center border border-indigo-500/40 space-y-5 shadow-2xl bg-gradient-to-b from-indigo-950/40 to-slate-900/90"
      >
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-500 flex items-center justify-center text-white mx-auto shadow-lg">
          <Zap size={32} />
        </div>

        <div>
          <span className="badge badge-indigo text-xs mb-2">⚡ PlacementOS Pro Required</span>
          <h2 className="text-2xl font-bold text-white mt-1">{featureName} is Locked</h2>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed">{description}</p>
        </div>

        <div className="p-4 rounded-xl bg-white/4 border border-white/8 space-y-2 text-left text-xs">
          <div className="font-semibold text-indigo-300">What's included in PlacementOS Pro:</div>
          <div className="grid grid-cols-2 gap-2 text-slate-300 pt-1">
            <div className="flex items-center gap-1.5"><CheckCircle size={12} className="text-emerald-400" /> AI Voice Interviewer</div>
            <div className="flex items-center gap-1.5"><CheckCircle size={12} className="text-emerald-400" /> Peer 1-on-1 Matcher</div>
            <div className="flex items-center gap-1.5"><CheckCircle size={12} className="text-emerald-400" /> System Design Studio</div>
            <div className="flex items-center gap-1.5"><CheckCircle size={12} className="text-emerald-400" /> Real OA Simulator</div>
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <button
            onClick={handleInstantUpgrade}
            className="w-full py-3.5 rounded-xl btn-gradient font-bold text-sm text-white shadow-lg flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"
          >
            <Sparkles size={16} /> Upgrade to PlacementOS Pro (₹499/mo)
          </button>
          <p className="text-[10px] text-slate-400">Cancel anytime. 100% Student Placement Guarantee.</p>
        </div>
      </motion.div>
    </div>
  );
}
