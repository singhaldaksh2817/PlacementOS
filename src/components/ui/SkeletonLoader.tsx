import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

// Base shimmer block
export function Skeleton({ className = '', style }: SkeletonProps) {
  return (
    <div className={`skeleton-shimmer rounded-xl ${className}`} style={style} />
  );
}

// Stat card skeleton (used on Dashboard)
export function StatCardSkeleton() {
  return (
    <div className="glass-card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}

// Table row skeleton
export function TableRowSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white/2">
          <Skeleton className="h-8 w-8 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-16" />
        </div>
      ))}
    </div>
  );
}

// Chart skeleton
export function ChartSkeleton({ height = 200 }: { height?: number }) {
  return (
    <div className="glass-card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-7 w-24 rounded-lg" />
      </div>
      <Skeleton className={`w-full rounded-xl`} style={{ height }} />
    </div>
  );
}

// Full page loader (centered spinner)
export function PageLoader() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-10 h-10 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full"
      />
    </div>
  );
}

// Dashboard skeleton layout
export function DashboardSkeleton() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
      </div>
      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartSkeleton height={220} />
        <ChartSkeleton height={220} />
      </div>
      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2"><TableRowSkeleton rows={4} /></div>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass-card p-4 flex items-center gap-3">
              <Skeleton className="h-9 w-9 flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
