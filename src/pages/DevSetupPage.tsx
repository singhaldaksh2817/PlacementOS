import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useStore } from '../store/useStore';
import { Zap, CheckCircle, XCircle, Loader } from 'lucide-react';

const TEST_EMAIL = 'student@placementos.dev';
const TEST_PASS  = 'Student@123';

export default function DevSetupPage() {
  const navigate = useNavigate();
  const { syncProfile } = useStore();
  const [log, setLog] = useState<{ msg: string; ok: boolean }[]>([]);
  const [done, setDone] = useState(false);
  const [running, setRunning] = useState(false);

  const addLog = (msg: string, ok = true) =>
    setLog(prev => [...prev, { msg, ok }]);

  const runSetup = async () => {
    setRunning(true);
    setLog([]);

    // Step 1: Delete existing user (best effort via sign-in + delete)
    addLog('🔄 Setting up test account...');

    // Step 2: Sign up fresh
    addLog('📝 Creating account: ' + TEST_EMAIL);
    const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
      email: TEST_EMAIL,
      password: TEST_PASS,
      options: {
        data: {
          name: 'Daksh Singhal',
          college: 'IIT Bombay',
          branch: 'Computer Science',
          year: 3,
          cgpa: 8.5,
          role: 'student',
        }
      }
    });

    if (signUpErr && !signUpErr.message.toLowerCase().includes('already')) {
      addLog('❌ Signup failed: ' + signUpErr.message, false);
      setRunning(false);
      return;
    }
    addLog('✅ Account created (or already exists)');

    // Step 3: Sign in
    addLog('🔑 Logging in...');
    const { data: loginData, error: loginErr } = await supabase.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASS,
    });

    if (loginErr) {
      addLog('❌ Login failed: ' + loginErr.message, false);
      addLog('⚠️ Try running SQL below to reset password', false);
      setRunning(false);
      return;
    }

    const token = loginData.session?.access_token || null;
    if (token) {
      localStorage.setItem('placementos-token', token);
      useStore.setState({ token, isAuthenticated: true });
      await syncProfile();
    }

    addLog('✅ Logged in successfully!');
    addLog('🚀 Redirecting to Dashboard...');
    setDone(true);
    setRunning(false);
    setTimeout(() => navigate('/dashboard'), 1500);
  };

  return (
    <div className="min-h-screen animated-bg flex items-center justify-center p-4">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl animate-pulse-slow" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Zap size={20} className="text-white" />
            </div>
            <span className="font-heading text-2xl font-bold gradient-text">PlacementOS</span>
          </div>
          <h1 className="text-2xl font-heading font-bold text-white">Dev Quick Setup</h1>
          <p className="text-slate-400 text-sm mt-1">Auto-creates and logs in a test account</p>
        </div>

        <div className="glass-card p-8 space-y-5">
          {/* Credentials box */}
          <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-sm space-y-1">
            <div className="text-indigo-300 font-semibold mb-2">🔑 Test Account Credentials</div>
            <div className="text-slate-300">Email: <span className="text-white font-mono">student@placementos.dev</span></div>
            <div className="text-slate-300">Password: <span className="text-white font-mono">Student@123</span></div>
          </div>

          {/* Log output */}
          {log.length > 0 && (
            <div className="space-y-2 text-sm">
              {log.map((l, i) => (
                <div key={i} className={`flex items-center gap-2 ${l.ok ? 'text-slate-300' : 'text-red-400'}`}>
                  {l.ok ? <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" /> : <XCircle size={14} className="text-red-400 flex-shrink-0" />}
                  {l.msg}
                </div>
              ))}
            </div>
          )}

          {/* Button */}
          {!done && (
            <button
              onClick={runSetup}
              disabled={running}
              className="btn-gradient w-full py-3 flex items-center justify-center gap-2 font-semibold disabled:opacity-60"
            >
              {running
                ? <><Loader size={18} className="animate-spin" /> Setting up...</>
                : '🚀 Create Account & Login Now'
              }
            </button>
          )}

          {done && (
            <div className="text-center text-emerald-400 font-semibold flex items-center justify-center gap-2">
              <CheckCircle size={20} /> Redirecting to dashboard...
            </div>
          )}

          {/* Fallback SQL */}
          {log.some(l => !l.ok) && (
            <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs">
              <div className="text-red-300 font-semibold mb-2">⚠️ If login still fails, run in Supabase SQL Editor:</div>
              <pre className="text-slate-300 overflow-auto whitespace-pre-wrap font-mono text-xs">
{`CREATE EXTENSION IF NOT EXISTS pgcrypto;
UPDATE auth.users
SET encrypted_password = crypt('Student@123', gen_salt('bf')),
    email_confirmed_at = NOW()
WHERE email = 'student@placementos.dev';`}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
