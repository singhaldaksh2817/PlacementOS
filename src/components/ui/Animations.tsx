import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView, Variants } from 'framer-motion';

interface ScrollRevealProps {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  className?: string;
  distance?: number;
}

export function ScrollReveal({
  children,
  delay = 0,
  direction = 'up',
  className = '',
  distance = 24,
}: ScrollRevealProps) {
  const getOffset = () => {
    switch (direction) {
      case 'up':
        return { x: 0, y: distance };
      case 'down':
        return { x: 0, y: -distance };
      case 'left':
        return { x: distance, y: 0 };
      case 'right':
        return { x: -distance, y: 0 };
      default:
        return { x: 0, y: distance };
    }
  };

  const offset = getOffset();

  return (
    <motion.div
      initial={{ opacity: 0, x: offset.x, y: offset.y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface AnimatedCounterProps {
  value: string | number;
  duration?: number;
  className?: string;
}

export function AnimatedCounter({ value, duration = 1.8, className = '' }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [displayValue, setDisplayValue] = useState<string>('0');

  useEffect(() => {
    if (!isInView) return;

    const strVal = String(value);
    const numericMatches = strVal.match(/[\d,]+/);
    if (!numericMatches) {
      setDisplayValue(strVal);
      return;
    }

    const rawNumStr = numericMatches[0].replace(/,/g, '');
    const targetNum = parseInt(rawNumStr, 10);
    if (isNaN(targetNum)) {
      setDisplayValue(strVal);
      return;
    }

    const prefix = strVal.substring(0, numericMatches.index || 0);
    const suffix = strVal.substring((numericMatches.index || 0) + numericMatches[0].length);

    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);

      // Ease out cubic
      const currentCount = Math.floor((1 - Math.pow(1 - progress, 3)) * targetNum);
      const formatted = currentCount.toLocaleString();

      setDisplayValue(`${prefix}${formatted}${suffix}`);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [isInView, value, duration]);

  return (
    <span ref={ref} className={className}>
      {displayValue}
    </span>
  );
}

interface AnimatedProgressBarProps {
  progress: number;
  height?: string;
  colorClass?: string;
  className?: string;
  showPercent?: boolean;
}

export function AnimatedProgressBar({
  progress,
  className = '',
  colorClass = 'btn-gradient',
  showPercent = false,
}: AnimatedProgressBarProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const clamped = Math.max(0, Math.min(100, progress));

  return (
    <div ref={ref} className={`w-full ${className}`}>
      {showPercent && (
        <div className="flex justify-between items-center text-xs mb-1.5 font-semibold text-slate-300">
          <span>Progress</span>
          <span>{clamped}%</span>
        </div>
      )}
      <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden relative border border-white/5">
        <motion.div
          className={`h-full rounded-full ${colorClass}`}
          initial={{ width: '0%' }}
          animate={{ width: isInView ? `${clamped}%` : '0%' }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        />
      </div>
    </div>
  );
}

export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] },
  },
};
