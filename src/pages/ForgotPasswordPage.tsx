import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Mail, ArrowRight, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    setLoading(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (resetError) {
      setError(resetError.message);
    } else {
      setSuccess(true);
      toast.success('Reset link sent successfully! 📧');
    }
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
          <h1 className="text-3xl font-heading font-bold text-white mb-1">Reset Password</h1>
          <p className="text-slate-400 text-sm">We will send you a link to recover your account</p>
        </div>

        <div className="glass-card p-8">
          {success ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle size={28} />
              </div>
              <h3 className="font-heading text-lg font-bold text-white">Check your inbox</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                We've sent a recovery link to <strong className="text-white">{email}</strong>. 
                Please check your email to update your password.
              </p>
              <div className="pt-2">
                <Link to="/login" className="btn-gradient w-full py-3 inline-flex items-center justify-center gap-2 text-sm font-semibold">
                  <ArrowLeft size={16} /> Return to Login
                </Link>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleReset} className="space-y-5">
              {error && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-sm">
                  <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                  {error}
                </motion.div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email" value={email} onChange={e => { setEmail(e.target.value); setError(''); }}
                    placeholder="you@college.edu" className="input-dark pl-10"
                    autoComplete="email"
                  />
                </div>
              </div>

              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                type="submit" disabled={loading}
                className="btn-gradient w-full py-3 flex items-center justify-center gap-2 text-sm font-semibold disabled:opacity-60">
                {loading
                  ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><span>Send Reset Instructions</span><ArrowRight size={16} /></>
                }
              </motion.button>

              <div className="text-center pt-2">
                <Link to="/login" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
                  <ArrowLeft size={14} /> Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
