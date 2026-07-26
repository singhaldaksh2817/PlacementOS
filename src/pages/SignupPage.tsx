import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, User, Mail, Lock, Eye, EyeOff, ArrowRight, GraduationCap, AlertCircle, CheckCircle } from 'lucide-react';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';

const BRANCHES = ['Computer Science', 'Information Technology', 'Electronics & Communication', 'Electrical Engineering', 'Mechanical', 'Civil', 'Chemical', 'Other'];
const COMPANIES = ['Google', 'Microsoft', 'Amazon', 'Adobe', 'Goldman Sachs', 'Flipkart', 'Oracle', 'NVIDIA', 'Uber', 'Atlassian'];

export default function SignupPage() {
  const navigate = useNavigate();
  const { register } = useStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    college: '', branch: 'Computer Science', year: 3, cgpa: '',
    targetCompanies: [] as string[], dailyHours: 4, placementMonth: '',
  });

  const update = (k: string, v: any) => { setForm(f => ({ ...f, [k]: v })); setError(''); };

  const toggleCompany = (c: string) => update('targetCompanies',
    form.targetCompanies.includes(c) ? form.targetCompanies.filter(x => x !== c) : [...form.targetCompanies, c]
  );

  const validateStep1 = () => {
    if (!form.name.trim()) return 'Enter your full name.';
    if (!form.email.includes('@')) return 'Enter a valid email address.';
    if (form.password.length < 8) return 'Password must be at least 8 characters.';
    if (form.password !== form.confirmPassword) return "Passwords don't match.";
    return '';
  };

  const validateStep2 = () => {
    if (!form.college.trim()) return 'Enter your college name.';
    if (!form.cgpa || isNaN(Number(form.cgpa)) || Number(form.cgpa) > 10) return 'Enter a valid CGPA (0–10).';
    return '';
  };

  const handleNext = () => {
    const err = step === 1 ? validateStep1() : validateStep2();
    if (err) { setError(err); return; }
    setError('');
    setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    setLoading(true);

    const result = await register({
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
      college: form.college.trim(),
      branch: form.branch,
      year: Number(form.year),
      cgpa: Number(form.cgpa),
      targetCompanies: form.targetCompanies,
      dailyHours: Number(form.dailyHours),
      placementMonth: form.placementMonth || 'December 2025',
    });

    setLoading(false);

    if (result === 'exists') {
      setError('An account with this email already exists. Please sign in.');
      setStep(1);
      return;
    }

    toast.success(`Welcome to PlacementOS, ${form.name.split(' ')[0]}! 🚀`);
    navigate('/dashboard');
  };

  const steps = ['Account', 'Academic', 'Targets'];

  return (
    <div className="min-h-screen animated-bg flex items-center justify-center p-4">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Zap size={18} className="text-white" />
            </div>
            <span className="font-heading text-xl font-bold gradient-text">PlacementOS</span>
          </div>
          <h1 className="text-2xl font-heading font-bold text-white">Create your account</h1>
          <p className="text-slate-400 text-sm mt-1">Start your AI-powered placement journey</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3 mb-6">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step > i + 1 ? 'bg-emerald-500 text-white' :
                step === i + 1 ? 'bg-indigo-500 text-white' :
                'bg-white/10 text-slate-500'
              }`}>
                {step > i + 1 ? <CheckCircle size={14} /> : i + 1}
              </div>
              <span className={`text-xs hidden sm:block ${step === i + 1 ? 'text-white' : 'text-slate-600'}`}>{s}</span>
              {i < steps.length - 1 && <div className={`w-8 h-px ${step > i + 1 ? 'bg-emerald-500' : 'bg-white/10'}`} />}
            </div>
          ))}
        </div>

        <div className="glass-card p-7">
          {/* Error */}
          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2 mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-sm">
              <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
              {error}
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {/* STEP 1 — Account */}
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Full Name</label>
                  <div className="relative">
                    <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    <input type="text" value={form.name} onChange={e => update('name', e.target.value)}
                      placeholder="Daksh Singhal" className="input-dark input-icon-left" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    <input type="email" value={form.email} onChange={e => update('email', e.target.value)}
                      placeholder="you@college.edu" className="input-dark input-icon-left" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    <input type={showPass ? 'text' : 'password'} value={form.password} onChange={e => update('password', e.target.value)}
                      placeholder="Min 8 characters" className="input-dark input-icon-left input-icon-right" />
                    <button type="button" onClick={() => setShowPass(v => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                      {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    <input type="password" value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)}
                      placeholder="Repeat password" className="input-dark input-icon-left" />
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2 — Academic */}
            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">College / University</label>
                  <div className="relative">
                    <GraduationCap size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    <input type="text" value={form.college} onChange={e => update('college', e.target.value)}
                      placeholder="IIT Bombay" className="input-dark input-icon-left" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Branch</label>
                    <select value={form.branch} onChange={e => update('branch', e.target.value)} className="input-dark text-sm">
                      {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Current Year</label>
                    <select value={form.year} onChange={e => update('year', Number(e.target.value))} className="input-dark text-sm">
                      {[1,2,3,4].map(y => <option key={y} value={y}>Year {y}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">CGPA</label>
                    <input type="number" min="0" max="10" step="0.1" value={form.cgpa} onChange={e => update('cgpa', e.target.value)}
                      placeholder="8.5" className="input-dark" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Daily Study Hours</label>
                    <select value={form.dailyHours} onChange={e => update('dailyHours', Number(e.target.value))} className="input-dark text-sm">
                      {[1,2,3,4,5,6,7,8].map(h => <option key={h} value={h}>{h}h / day</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Placement Month</label>
                  <input type="text" value={form.placementMonth} onChange={e => update('placementMonth', e.target.value)}
                    placeholder="e.g. December 2025" className="input-dark" />
                </div>
              </motion.div>
            )}

            {/* STEP 3 — Target Companies */}
            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <p className="text-sm text-slate-400 mb-4">Select your target companies. AI agents will customize your preparation accordingly.</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {COMPANIES.map(c => (
                    <button key={c} type="button" onClick={() => toggleCompany(c)}
                      className={`text-sm px-3.5 py-2 rounded-xl border transition-all ${
                        form.targetCompanies.includes(c)
                          ? 'bg-indigo-500/25 border-indigo-500/50 text-indigo-300'
                          : 'bg-white/4 border-white/10 text-slate-400 hover:border-white/25'
                      }`}>
                      {c}
                    </button>
                  ))}
                </div>
                {form.targetCompanies.length === 0 && (
                  <p className="text-xs text-amber-400 mb-4">💡 Select at least one company for personalized roadmap</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Buttons */}
          <div className="flex gap-3 mt-6">
            {step > 1 && (
              <button onClick={() => { setError(''); setStep(s => s - 1); }}
                className="flex-1 py-3 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 transition-all text-sm">
                Back
              </button>
            )}
            {step < 3 ? (
              <motion.button whileTap={{ scale: 0.98 }} onClick={handleNext}
                className="flex-1 btn-gradient py-3 flex items-center justify-center gap-2 text-sm font-semibold">
                Continue <ArrowRight size={15} />
              </motion.button>
            ) : (
              <motion.button whileTap={{ scale: 0.98 }} onClick={handleSubmit} disabled={loading}
                className="flex-1 btn-gradient py-3 flex items-center justify-center gap-2 text-sm font-semibold disabled:opacity-60">
                {loading
                  ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><Zap size={15} /> Launch PlacementOS</>
                }
              </motion.button>
            )}
          </div>

          <p className="text-center text-sm text-slate-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
