
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { getColor } from '../../lib/colors';
import type { BlockColor } from '../../lib/types';
import { ProgressBar } from './ProgressBar';
import { formatDuration, formatTime } from '../../lib/utils';
import type { LucideIcon } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

interface WavyBlockProps {
  color: BlockColor;
  label: string;
  icon: string;
  startTime: string;
  duration: number;
  isActive?: boolean;
  minutesIn?: number;
  minutesLeft?: number;
  progress?: number;
  onClick?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

function LucideIconComp({ name, size = 20 }: { name: string; size?: number }) {
  const icons = LucideIcons as unknown as Record<string, LucideIcon>;
  const Icon = icons[name] ?? icons['Circle'];
  return <Icon size={size} />;
}

export function WavyBlock({
  color, label, icon, startTime, duration,
  isActive, minutesIn = 0, minutesLeft = 0, progress = 0,
  onClick, isFirst, isLast,
}: WavyBlockProps) {
  const c = getColor(color);
  const minHeight = 80;
  const height = Math.max(minHeight, duration * 1.6);

  return (
    <motion.div
      onClick={onClick}
      className={cn(
        'relative w-full cursor-pointer select-none overflow-hidden',
        isActive && 'ring-2 ring-white ring-offset-2 ring-offset-transparent z-10',
      )}
      style={{
        backgroundColor: c.bg,
        minHeight: `${height}px`,
        borderRadius: isFirst
          ? '20px 20px 28px 28px'
          : isLast
          ? '28px 28px 20px 20px'
          : '28px',
        clipPath: isFirst
          ? undefined
          : 'polygon(0% 8px, 3% 0%, 97% 0%, 100% 8px, 100% calc(100% - 8px), 97% 100%, 3% 100%, 0% calc(100% - 8px))',
        marginTop: isFirst ? 0 : -6,
      }}
      whileHover={{ filter: 'brightness(1.06)' }}
      whileTap={{ scale: 0.99 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
    >
      {/* Wavy SVG overlay for organic feel */}
      <svg
        className="absolute top-0 left-0 w-full"
        height="20"
        viewBox="0 0 100 20"
        preserveAspectRatio="none"
        style={{ opacity: 0.15 }}
      >
        <path d="M0,10 Q25,0 50,10 T100,10 L100,0 L0,0 Z" fill="white" />
      </svg>

      <div className="relative px-4 py-3 h-full flex flex-col justify-between" style={{ minHeight: `${height}px` }}>
        {/* Top row: time + active badges */}
        <div className="flex items-start justify-between">
          <span className="text-xs font-semibold opacity-70" style={{ color: c.text }}>
            {formatTime(startTime)}
          </span>
          {isActive && (
            <div className="flex gap-2">
              <span className="text-xs font-bold bg-white/25 px-2 py-0.5 rounded-full" style={{ color: c.text }}>
                {minutesIn}m in
              </span>
              <span className="text-xs font-bold bg-white/25 px-2 py-0.5 rounded-full" style={{ color: c.text }}>
                {minutesLeft}m left
              </span>
            </div>
          )}
        </div>

        {/* Center: icon + label */}
        <div className="flex items-center gap-3 py-2">
          <span style={{ color: c.text, opacity: 0.9 }}>
            <LucideIconComp name={icon} size={22} />
          </span>
          <span className="text-lg font-bold leading-tight" style={{ color: c.text }}>
            {label}
          </span>
        </div>

        {/* Bottom row: duration + progress if active */}
        <div className="flex flex-col gap-1.5">
          {isActive && (
            <ProgressBar value={progress} color="rgba(255,255,255,0.8)" animated />
          )}
          <span className="text-xs font-medium opacity-60" style={{ color: c.text }}>
            {formatDuration(duration)}
          </span>
        </div>
      </div>

      {/* Subtle inner highlight */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 50%)',
          borderRadius: 'inherit',
        }}
      />
    </motion.div>
  );
}
