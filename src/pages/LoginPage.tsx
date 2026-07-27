import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Mail, Lock, Eye, EyeOff, ArrowRight, Globe, AlertCircle } from 'lucide-react';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, setDemoMode, setAdminDemoMode } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setError('');
    setLoading(true);

    // Bypass check for demo admin credential
    if (email.trim().toLowerCase() === 'admin@placementos.com' || email.trim().toLowerCase().includes('admin')) {
      await new Promise(r => setTimeout(r, 400));
      setAdminDemoMode();
      setLoading(false);
      toast.success('Welcome SuperAdmin! 🛡️ Opening Admin Portal...');
      navigate('/admin');
      return;
    }

    const result = await login(email.trim(), password);
    setLoading(false);

    if (result === 'ok') {
      toast.success('Welcome back! 👋');
      const { user } = useStore.getState();
      if (user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } else if (result === 'unconfirmed') {
      setError('📧 Email not confirmed. Please check your inbox OR ask admin to confirm via Supabase SQL.');
    } else if (result === 'notfound') {
      setError('No account found with this email. Please sign up first.');
    } else if (result === 'invalid') {
      setError('Incorrect email or password. Please try again.');
    } else {
      setError(`Error: ${result}`);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    setDemoMode();
    setLoading(false);
    toast.success('Demo Student active — sample data loaded! 🚀');
    navigate('/dashboard');
  };

  const handleAdminDemoLogin = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    setAdminDemoMode();
    setLoading(false);
    toast.success('SuperAdmin Portal Active! 🛡️');
    navigate('/admin');
  };


  return (
    <div className="min-h-screen animated-bg flex items-center justify-center p-4">
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Zap size={20} className="text-white" />
            </div>
            <span className="font-heading text-2xl font-bold gradient-text">PlacementOS</span>
          </div>
          <h1 className="text-3xl font-heading font-bold text-white mb-1">Welcome back</h1>
          <p className="text-slate-400 text-sm">Sign in to continue your placement journey</p>
        </div>

        <div className="glass-card p-8">
          {/* Error */}
          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2 mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-sm">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              {error}
            </motion.div>
          )}

          {/* Demo Login Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleDemoLogin}
              className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-white/6 border border-white/12 hover:bg-white/10 transition-all font-medium text-xs text-white"
            >
              <Globe size={14} className="text-blue-400" />
              Demo Student
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleAdminDemoLogin}
              className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-purple-500/15 border border-purple-500/30 hover:bg-purple-500/25 transition-all font-semibold text-xs text-purple-300"
            >
              <Zap size={14} className="text-amber-400" />
              Demo Admin 🛡️
            </motion.button>
          </div>


          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-slate-600 text-xs">or sign in with email</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@college.edu" className="input-dark input-icon-left"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-medium text-slate-400">Password</label>
                <Link to="/forgot-password" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                <input
                  type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password" className="input-dark input-icon-left input-icon-right"
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              type="submit" disabled={loading}
              className="btn-gradient w-full py-3 flex items-center justify-center gap-2 text-sm font-semibold mt-2 disabled:opacity-60">
              {loading
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><span>Sign In</span><ArrowRight size={16} /></>
              }
            </motion.button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-5">
            Don't have an account?{' '}
            <Link to="/signup" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
              Create account
            </Link>
          </p>
        </div>

        {/* Credentials hint */}
        <div className="mt-5 p-4 glass-card text-xs text-slate-500 space-y-1">
          <div className="font-semibold text-slate-400 mb-2">🔑 Test Credentials</div>
          <div><span className="text-indigo-400">Admin:</span> admin@placementos.com / Admin@123</div>
          <div><span className="text-purple-400">Demo:</span> demo@college.edu / demo123</div>
          <div className="text-slate-600 mt-1">Or create a real account via Sign Up ↑</div>
        </div>
      </motion.div>
    </div>
  );
}
