import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useStore } from './store/useStore';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import DynamicBackground from './components/DynamicBackground';
import { Toaster } from 'react-hot-toast';

import AppLayout from './components/layout/AppLayout';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import DevSetupPage from './pages/DevSetupPage';
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const DSAPage = lazy(() => import('./pages/DSAPage'));
const AptitudePage = lazy(() => import('./pages/AptitudePage'));
const InterviewPage = lazy(() => import('./pages/InterviewPage'));
const RoadmapPage = lazy(() => import('./pages/RoadmapPage'));
const CompaniesPage = lazy(() => import('./pages/CompaniesPage'));
const ResumePage = lazy(() => import('./pages/ResumePage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const MentorChatPage = lazy(() => import('./pages/MentorChatPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const AgentOrchestrator = lazy(() => import('./pages/AgentOrchestrator'));
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage'));
const OASimulatorPage = lazy(() => import('./pages/OASimulatorPage'));
const SystemDesignPage = lazy(() => import('./pages/SystemDesignPage'));
const DrivesPage = lazy(() => import('./pages/DrivesPage'));
const PeerInterviewPage = lazy(() => import('./pages/PeerInterviewPage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const DSADuelPage = lazy(() => import('./pages/DSADuelPage'));
const ResumeJDTailorPage = lazy(() => import('./pages/ResumeJDTailorPage'));
const CompanyPYQPage = lazy(() => import('./pages/CompanyPYQPage'));
const PaymentPage = lazy(() => import('./pages/PaymentPage'));








function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useStore();
  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <ErrorBoundary>
    <BrowserRouter>
      {/* 🌌 Global dynamic background — renders behind everything */}
      <DynamicBackground />
      <Toaster position="top-right" toastOptions={{ duration: 4000, style: { background: '#13151f', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } }} />


      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center relative">
          <div className="text-center content-layer">
            <div className="w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400 text-sm tracking-wide">Loading PlacementOS…</p>
          </div>
        </div>
      }>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
          <Route path="/dev-setup" element={<DevSetupPage />} />
          {/* Payment page — full screen, no sidebar, protected */}
          <Route path="/payment" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />

          {/* Protected app routes */}

          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dsa" element={<DSAPage />} />
            <Route path="/aptitude" element={<AptitudePage />} />
            <Route path="/interview" element={<InterviewPage />} />
            <Route path="/peer-interview" element={<PeerInterviewPage />} />
            <Route path="/duel" element={<DSADuelPage />} />
            <Route path="/jd-tailor" element={<ResumeJDTailorPage />} />
            <Route path="/pyq-tracker" element={<CompanyPYQPage />} />

            <Route path="/roadmap" element={<RoadmapPage />} />


            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/oa-simulator" element={<OASimulatorPage />} />
            <Route path="/system-design" element={<SystemDesignPage />} />
            <Route path="/drives" element={<DrivesPage />} />
            <Route path="/companies" element={<CompaniesPage />} />

            <Route path="/resume" element={<ResumePage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/chat" element={<MentorChatPage />} />
            <Route path="/orchestrator" element={<AgentOrchestrator />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/settings" element={<SettingsPage />} />

          </Route>

          {/* Admin-only route (no student sidebar) */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminPage />
            </AdminRoute>
          } />

          {/* 404 Not Found */}
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center relative">
              <div className="text-center content-layer">
                <div className="text-8xl font-black gradient-text mb-4">404</div>
                <h1 className="text-3xl font-bold text-white mb-3">Page Not Found</h1>
                <p className="text-slate-400 mb-8 max-w-sm mx-auto">The page you're looking for doesn't exist or has been moved.</p>
                <Link to="/dashboard" className="btn-gradient px-8 py-3 rounded-xl text-white font-semibold text-sm">
                  ← Back to Dashboard
                </Link>
              </div>
            </div>
          } />
        </Routes>
      </Suspense>
    </BrowserRouter>
    </ErrorBoundary>
  );
}
