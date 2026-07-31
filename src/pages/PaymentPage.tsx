import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  CreditCard, Lock, CheckCircle, XCircle, Zap, Shield,
  ArrowLeft, ChevronRight, Sparkles
} from 'lucide-react';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

const PLAN_DETAILS = {
  monthly: { label: 'Monthly', price: 499, original: 499, period: '/month', savings: null },
  yearly:  { label: 'Yearly',  price: 329, original: 499, period: '/month', savings: 'Save ₹2,040/year (₹3,948 billed annually)' },
};

const PRO_FEATURES = [
  'OA Simulator (TCS, Infosys, Wipro formats)',
  'AI System Design Interviewer',
  'Unlimited AI Mentor Chat sessions',
  '1v1 Peer Interview sessions',
  'Priority Placement Analytics',
  'Ad-free experience',
];

type PayStep = 'details' | 'processing' | 'success' | 'failed';

function detectCardType(num: string): string {
  if (num.startsWith('4')) return 'VISA';
  if (num.startsWith('5') || num.startsWith('2')) return 'Mastercard';
  if (num.startsWith('6')) return 'RuPay';
  return '';
}

function formatCardNumber(val: string): string {
  return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}

export default function PaymentPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { upgradeToPro, coupons, activeCoupon } = useStore();

  const planKey = (searchParams.get('plan') || 'monthly') as 'monthly' | 'yearly';
  const plan = PLAN_DETAILS[planKey];

  const [step, setStep] = useState<PayStep>('details');
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discountPercent: number } | null>(null);

  // Card form
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const basePrice = planKey === 'yearly' ? 329 * 12 : 499;
  const discountAmount = appliedPromo ? Math.round(basePrice * appliedPromo.discountPercent / 100) : 0;
  const finalAmount = basePrice - discountAmount;

  const cardType = detectCardType(cardNumber.replace(/\s/g, ''));

  const handleApplyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    const found = coupons.find(c => c.code === code && c.isActive && c.usesCount < c.maxUses);
    if (found) {
      setAppliedPromo({ code: found.code, discountPercent: found.discountPercent });
      toast.success(`Promo code applied! ${found.discountPercent}% discount 🎉`);
    } else {
      toast.error('Invalid or expired promo code.');
    }
  };

  const handleFormatExpiry = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 4);
    if (clean.length >= 3) {
      setExpiry(`${clean.slice(0, 2)}/${clean.slice(2)}`);
    } else {
      setExpiry(clean);
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    const rawCard = cardNumber.replace(/\s/g, '');
    if (rawCard.length !== 16) errs.cardNumber = 'Card number must be 16 digits.';
    if (!cardName.trim()) errs.cardName = 'Cardholder name is required.';
    if (!/^\d{2}\/\d{2}$/.test(expiry)) errs.expiry = 'Enter expiry as MM/YY.';
    if (cvv.length < 3) errs.cvv = 'CVV must be 3-4 digits.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePay = async () => {
    if (!validate()) return;

    setStep('processing');
    await new Promise(r => setTimeout(r, 2800)); // simulate gateway delay

    // Simulate failure: card ending in 0000
    const rawCard = cardNumber.replace(/\s/g, '');
    if (rawCard.endsWith('0000')) {
      setStep('failed');
      toast.error('Payment declined. Try a different card.');
      return;
    }

    // Payment success
    upgradeToPro();
    setStep('success');
    confetti({ particleCount: 160, spread: 100, origin: { y: 0.5 } });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: '#090a0f' }}>
      {/* Background glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Success screen */}
      <AnimatePresence>
        {step === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-10 text-center max-w-md w-full space-y-6 border border-emerald-500/30 bg-emerald-500/5"
          >
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/30">
              <CheckCircle size={40} className="text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-extrabold font-heading text-white">Payment Successful! 🎉</h2>
              <p className="text-slate-300 text-sm mt-2">Welcome to <span className="text-indigo-400 font-bold">PlacementOS Pro ⚡</span>!</p>
              <p className="text-slate-400 text-xs mt-1">All premium features are now unlocked.</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {PRO_FEATURES.map(f => (
                <div key={f} className="flex items-center gap-1.5 text-slate-300">
                  <CheckCircle size={12} className="text-emerald-400 flex-shrink-0" /> {f.split('(')[0].trim()}
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full btn-gradient py-3 rounded-xl font-bold text-sm shadow-lg"
            >
              Go to Dashboard →
            </button>
          </motion.div>
        )}

        {/* Failed screen */}
        {step === 'failed' && (
          <motion.div
            key="failed"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-10 text-center max-w-md w-full space-y-6 border border-red-500/30 bg-red-500/5"
          >
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center mx-auto shadow-2xl shadow-red-500/30">
              <XCircle size={40} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold font-heading text-white">Payment Failed</h2>
              <p className="text-slate-400 text-sm mt-2">Your card was declined. Please try a different card or contact your bank.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep('details')} className="flex-1 py-3 rounded-xl bg-white/8 border border-white/10 text-sm font-semibold text-white hover:bg-white/15 transition-all">
                Try Again
              </button>
              <button onClick={() => navigate('/pricing')} className="flex-1 py-3 rounded-xl bg-white/4 border border-white/8 text-sm font-semibold text-slate-300">
                Back to Pricing
              </button>
            </div>
          </motion.div>
        )}

        {/* Processing screen */}
        {step === 'processing' && (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card p-12 text-center max-w-sm w-full space-y-6 border border-indigo-500/30"
          >
            <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <div>
              <h3 className="text-lg font-bold text-white">Processing Payment...</h3>
              <p className="text-xs text-slate-400 mt-1">Securely verifying your payment. Please don't close this tab.</p>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
              <Lock size={12} /> 256-bit SSL Encrypted
            </div>
          </motion.div>
        )}

        {/* Payment Details screen */}
        {step === 'details' && (
          <motion.div
            key="details"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-5 gap-6"
          >
            {/* Left: Order Summary */}
            <div className="lg:col-span-2 space-y-4">
              <button onClick={() => navigate('/pricing')} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors mb-2">
                <ArrowLeft size={16} /> Back to Pricing
              </button>

              <div className="glass-card p-5 border border-indigo-500/30 bg-indigo-500/5 space-y-4">
                <div className="flex items-center gap-2">
                  <Zap size={18} className="text-indigo-400" />
                  <span className="font-bold text-white text-sm">PlacementOS Pro — {plan.label}</span>
                </div>

                <div>
                  <div className="text-3xl font-extrabold text-white font-heading">
                    ₹{plan.price}<span className="text-sm font-normal text-slate-400">{plan.period}</span>
                  </div>
                  {plan.savings && (
                    <p className="text-xs text-emerald-400 mt-1 font-semibold">{plan.savings}</p>
                  )}
                </div>

                <div className="space-y-1.5 border-t border-white/8 pt-3">
                  {PRO_FEATURES.map(f => (
                    <div key={f} className="flex items-start gap-2 text-xs text-slate-300">
                      <CheckCircle size={12} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                      {f}
                    </div>
                  ))}
                </div>
              </div>

              {/* Order breakdown */}
              <div className="glass-card p-4 border border-white/8 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>{plan.label} Plan</span>
                  <span>₹{basePrice}</span>
                </div>
                {appliedPromo && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Promo ({appliedPromo.code}) -{appliedPromo.discountPercent}%</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-white border-t border-white/8 pt-2">
                  <span>Total Due Today</span>
                  <span>₹{finalAmount}</span>
                </div>
              </div>

              {/* Promo Code */}
              <div className="glass-card p-4 border border-white/8 space-y-2">
                <label className="text-xs font-semibold text-slate-300">Promo / Coupon Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={e => setPromoInput(e.target.value.toUpperCase())}
                    className="input-dark text-xs flex-1"
                    placeholder="e.g. COLLEGE50"
                    disabled={!!appliedPromo}
                  />
                  <button
                    onClick={handleApplyPromo}
                    disabled={!!appliedPromo || !promoInput.trim()}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 disabled:opacity-40 transition-all"
                  >
                    Apply
                  </button>
                </div>
                {appliedPromo && (
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-400 text-[11px]">✅ Promo applied!</span>
                    <button onClick={() => setAppliedPromo(null)} className="text-[11px] text-red-400 hover:underline">Remove</button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500 justify-center">
                <Shield size={12} /> <Lock size={12} /> 256-bit SSL Secured · Cancel anytime
              </div>
            </div>

            {/* Right: Card Form */}
            <div className="lg:col-span-3 glass-card p-6 border border-white/10 space-y-5">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <CreditCard size={20} className="text-indigo-400" /> Secure Card Payment
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Your payment information is encrypted and secure.</p>
              </div>

              {/* Card Preview */}
              <div className="h-36 rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 p-5 flex flex-col justify-between shadow-2xl shadow-indigo-500/20 relative overflow-hidden">
                <div className="absolute inset-0 bg-white/5 backdrop-blur-sm" />
                <div className="relative flex justify-between items-start">
                  <Sparkles size={20} className="text-white/60" />
                  <span className="text-white font-bold text-sm tracking-widest">{cardType || 'CARD'}</span>
                </div>
                <div className="relative">
                  <div className="text-white/80 font-mono text-lg tracking-widest">
                    {cardNumber || '•••• •••• •••• ••••'}
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-white/60 text-xs">{cardName || 'CARDHOLDER NAME'}</span>
                    <span className="text-white/60 text-xs">{expiry || 'MM/YY'}</span>
                  </div>
                </div>
              </div>

              {/* Card Fields */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                    className={`input-dark font-mono text-sm ${errors.cardNumber ? 'border-red-500/60' : ''}`}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                  />
                  {errors.cardNumber && <p className="text-xs text-red-400 mt-1">{errors.cardNumber}</p>}
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Cardholder Name</label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={e => setCardName(e.target.value.toUpperCase())}
                    className={`input-dark text-sm ${errors.cardName ? 'border-red-500/60' : ''}`}
                    placeholder="AS ON CARD"
                  />
                  {errors.cardName && <p className="text-xs text-red-400 mt-1">{errors.cardName}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Expiry Date</label>
                    <input
                      type="text"
                      value={expiry}
                      onChange={e => handleFormatExpiry(e.target.value)}
                      className={`input-dark text-sm ${errors.expiry ? 'border-red-500/60' : ''}`}
                      placeholder="MM/YY"
                      maxLength={5}
                    />
                    {errors.expiry && <p className="text-xs text-red-400 mt-1">{errors.expiry}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">CVV</label>
                    <input
                      type="password"
                      value={cvv}
                      onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      className={`input-dark text-sm ${errors.cvv ? 'border-red-500/60' : ''}`}
                      placeholder="•••"
                      maxLength={4}
                    />
                    {errors.cvv && <p className="text-xs text-red-400 mt-1">{errors.cvv}</p>}
                  </div>
                </div>
              </div>

              <button
                onClick={handlePay}
                className="w-full btn-gradient py-4 rounded-xl font-bold text-sm shadow-xl flex items-center justify-center gap-2 hover:scale-[1.01] transition-all"
              >
                <Lock size={16} /> Pay ₹{finalAmount} Securely
                <ChevronRight size={16} />
              </button>

              <p className="text-[11px] text-slate-500 text-center">
                💡 <strong className="text-slate-400">Test tip:</strong> Card ending in <code className="text-red-400">0000</code> simulates a failed payment.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
