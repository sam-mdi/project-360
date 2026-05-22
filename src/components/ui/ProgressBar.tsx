import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface ProgressBarProps {
  value: number; // 0-1
  color?: string;
  className?: string;
  animated?: boolean;
}

export function ProgressBar({ value, color = '#f59e0b', className, animated }: ProgressBarProps) {
  return (
    <div className={cn('w-full h-1.5 bg-black/10 rounded-full overflow-hidden', className)}>
      <motion.div
        className={cn('h-full rounded-full', animated && 'active-progress')}
        style={{ backgroundColor: color, width: `${Math.min(100, Math.max(0, value * 100))}%` }}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, value * 100))}%` }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />
    </div>
  );
}
