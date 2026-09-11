import { motion } from 'framer-motion';
import { Zap, Lock, CheckCircle, Sparkles, ShieldCheck } from 'lucide-react';
import { useStore } from '../../store/useStore';
import toast from 'react-hot-toast';

interface ProLockOverlayProps {
  featureName: string;
  description: string;
}

export default function ProLockOverlay({ featureName, description }: ProLockOverlayProps) {
  // PlacementOS is 100% free for all students - no feature is ever locked
  return null;
}
