import { useState } from 'react';
import { motion } from 'framer-motion';
import TopBar from '../components/layout/TopBar';
import {
  Zap, Check, X, Sparkles, ShieldCheck, HelpCircle, ArrowRight, Award
} from 'lucide-react';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';

export default function PricingPage() {
  const { isProUser, upgradeToPro, cancelPro, applyCoupon, activeCoupon } = useStore();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [promoInput, setPromoInput] = useState('');

  const basePrice = billingCycle === 'monthly' ? 499 : 329;
  const discountPercent = activeCoupon ? activeCoupon.discountPercent : 0;
  const finalPrice = Math.round(basePrice * (1 - discountPercent / 100));

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const res = applyCoupon(promoInput);
    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  };

  const handleTogglePro = () => {
    if (isProUser) {
      cancelPro();
      toast.success('Subscription reverted to Free Plan');
    } else {
      upgradeToPro();
      toast.success(`🎉 Welcome to PlacementOS Pro ⚡! Unlocked at ₹${finalPrice}/mo!`);
    }
  };


  return (
    <div className="flex-1 overflow-y-auto">
      <TopBar title="PlacementOS Pro Subscription ⚡" subtitle="Simple & Transparent Pricing for College Students" />

      <div className="p-6 max-w-6xl mx-auto space-y-8">
        {/* Banner */}
        <div className="glass-card p-8 text-center relative overflow-hidden bg-gradient-to-r from-purple-900/30 via-indigo-900/30 to-slate-900/60 border border-purple-500/20">
          <span className="badge badge-indigo text-xs mb-2">⚡ Simple 1-Plan Pricing</span>
          <h1 className="text-3xl font-bold font-heading text-white">Unlock 100% Placement Preparation</h1>
          <p className="text-sm text-slate-300 max-w-xl mx-auto mt-2">
            Practice unlimited AI interviews, system design case studies, peer 1-on-1 mock interviews, and real company online coding assessments.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <span className={`text-xs font-medium ${billingCycle === 'monthly' ? 'text-white' : 'text-slate-400'}`}>Monthly Billing</span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className="w-12 h-6 rounded-full bg-indigo-600 p-1 flex items-center transition-all cursor-pointer"
            >
              <motion.div
                layout
                className="w-4 h-4 rounded-full bg-white shadow-md"
                animate={{ x: billingCycle === 'yearly' ? 24 : 0 }}
              />
            </button>
            <span className={`text-xs font-medium flex items-center gap-1 ${billingCycle === 'yearly' ? 'text-white' : 'text-slate-400'}`}>
              Yearly Billing <span className="badge badge-emerald text-[10px]">Save 35%</span>
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* FREE PLAN */}
          <div className={`glass-card p-6 space-y-5 border ${!isProUser ? 'border-indigo-500/40 bg-white/4' : 'border-white/8'}`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">PlacementOS Free</h3>
                <p className="text-xs text-slate-400">Essential prep tools for all students</p>
              </div>
              {!isProUser && <span className="badge badge-emerald text-xs">Active Plan</span>}
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-white">₹0</span>
              <span className="text-xs text-slate-400">/ forever</span>
            </div>

            <div className="space-y-2.5 text-xs text-slate-300 border-t border-white/8 pt-4">
              <div className="flex items-center gap-2"><Check size={14} className="text-emerald-400" /> Basic Placement Dashboard & Readiness</div>
              <div className="flex items-center gap-2"><Check size={14} className="text-emerald-400" /> DSA Tracker (20 Core Problems)</div>
              <div className="flex items-center gap-2"><Check size={14} className="text-emerald-400" /> Aptitude Practice Tests</div>
              <div className="flex items-center gap-2"><Check size={14} className="text-emerald-400" /> Company PYQ Sheets Access</div>
              <div className="flex items-center gap-2"><Check size={14} className="text-emerald-400" /> Off-Campus Job Drives Board</div>
              <div className="flex items-center gap-2 text-slate-500"><X size={14} className="text-slate-600" /> AI Voice & Chat Mock Interviewer</div>
              <div className="flex items-center gap-2 text-slate-500"><X size={14} className="text-slate-600" /> 1-on-1 Peer Matchmaker (Shared IDE)</div>
              <div className="flex items-center gap-2 text-slate-500"><X size={14} className="text-slate-600" /> System Design Studio Case Studies</div>
            </div>

            <button
              disabled={!isProUser}
              onClick={handleTogglePro}
              className={`w-full py-3 rounded-xl text-xs font-semibold transition-all ${
                !isProUser ? 'bg-white/5 text-slate-400 cursor-default' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {!isProUser ? 'Current Plan' : 'Switch to Free'}
            </button>
          </div>

          {/* PRO PLAN */}
          <div className={`glass-card p-6 space-y-5 border relative overflow-hidden ${
            isProUser ? 'border-purple-500 bg-purple-500/10' : 'border-indigo-500/50 bg-gradient-to-b from-indigo-900/30 to-slate-900/60'
          }`}>
            <div className="absolute top-3 right-3">
              <span className="badge badge-purple text-[10px] flex items-center gap-1"><Sparkles size={10} /> RECOMMENDED</span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-1.5">
                PlacementOS Pro <Zap size={18} className="text-amber-400 fill-amber-400" />
              </h3>
              <p className="text-xs text-indigo-300">Complete AI & Peer Placement Accelerator</p>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-white">
                ₹{finalPrice}
              </span>
              {activeCoupon && (
                <span className="text-sm line-through text-slate-400">₹{basePrice}</span>
              )}
              <span className="text-xs text-slate-400">/ month {billingCycle === 'yearly' && '(billed annually)'}</span>
              {activeCoupon && (
                <span className="badge badge-emerald text-[10px] ml-auto">⚡ {activeCoupon.discountPercent}% OFF</span>
              )}
            </div>

            {/* Promo Code Form */}
            <form onSubmit={handleApplyPromo} className="flex gap-2 pt-1">
              <input
                type="text"
                value={promoInput}
                onChange={e => setPromoInput(e.target.value)}
                placeholder="Promo Code (e.g. COLLEGE50)"
                className="input-dark text-xs uppercase flex-1 py-2 px-3"
              />
              <button type="submit" className="px-3 py-2 rounded-xl bg-white/10 text-xs font-semibold text-white hover:bg-white/20 transition-all">
                Apply
              </button>
            </form>


            <div className="space-y-2.5 text-xs text-slate-200 border-t border-white/8 pt-4 font-medium">
              <div className="flex items-center gap-2"><Check size={14} className="text-emerald-400" /> Everything in Free Plan</div>
              <div className="flex items-center gap-2"><Check size={14} className="text-emerald-400" /> <strong>🤖 Unlimited AI Voice & Chat Mock Interviews</strong></div>
              <div className="flex items-center gap-2"><Check size={14} className="text-emerald-400" /> <strong>🤝 1-on-1 Peer Matchmaker with Live WebRTC IDE</strong></div>
              <div className="flex items-center gap-2"><Check size={14} className="text-emerald-400" /> <strong>📐 Interactive System Design Studio & QPS Estimator</strong></div>
              <div className="flex items-center gap-2"><Check size={14} className="text-emerald-400" /> <strong>⚡ Real Company Online Assessment (OA) Simulator</strong></div>
              <div className="flex items-center gap-2"><Check size={14} className="text-emerald-400" /> <strong>🤖 24/7 AI Placement Mentor Coaching</strong></div>
              <div className="flex items-center gap-2"><Check size={14} className="text-emerald-400" /> <strong>💼 AI LinkedIn Referral Outreach Pitch Generator</strong></div>
            </div>

            <button
              onClick={handleTogglePro}
              className={`w-full py-3.5 rounded-xl text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-2 ${
                isProUser ? 'bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30' : 'btn-gradient text-white hover:scale-[1.02]'
              }`}
            >
              {isProUser ? 'Cancel Pro Subscription' : 'Upgrade to PlacementOS Pro ⚡'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
