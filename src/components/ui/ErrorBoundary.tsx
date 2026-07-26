import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-screen animated-bg flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-10 max-w-lg w-full text-center space-y-6"
          >
            <div className="w-16 h-16 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center mx-auto">
              <AlertTriangle size={32} className="text-red-400" />
            </div>
            <div>
              <h2 className="font-heading text-2xl font-bold text-white mb-2">
                Something went wrong
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                An unexpected error occurred. Your data is safe — just reload the page to continue.
              </p>
            </div>
            {this.state.error && (
              <div className="text-left bg-black/30 rounded-xl p-4 text-xs font-mono text-red-300 max-h-32 overflow-y-auto border border-red-500/20">
                {this.state.error.message}
              </div>
            )}
            <button
              onClick={this.handleReset}
              className="btn-gradient flex items-center gap-2 mx-auto px-8 py-3 text-sm"
            >
              <RefreshCw size={16} />
              Reload Page
            </button>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Lightweight inline version for wrapping individual sections
export function SectionErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="glass-card p-6 text-center text-sm text-slate-500 border border-red-500/20">
          <AlertTriangle size={20} className="text-red-400 mx-auto mb-2" />
          This section failed to load. Please refresh.
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}
