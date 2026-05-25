import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { getColor } from '../../lib/colors';
import type { BlockColor, EnergyLevel } from '../../lib/types';
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
  energyLevel?: EnergyLevel;
}

function LucideIconComp({ name, size = 22 }: { name: string; size?: number }) {
  const icons = LucideIcons as unknown as Record<string, LucideIcon>;
  const Icon = icons[name] ?? icons['Circle'];
  return <Icon size={size} />;
}

const ENERGY_DOT: Record<EnergyLevel, { emoji: string; title: string }> = {
  high: { emoji: '⚡', title: 'High energy' },
  medium: { emoji: '🔥', title: 'Medium energy' },
  low: { emoji: '🌿', title: 'Low energy' },
};

export function WavyBlock({
  color, label, icon, startTime, duration,
  isActive, minutesIn = 0, minutesLeft = 0, progress = 0,
  onClick, energyLevel,
}: WavyBlockProps) {
  const c = getColor(color);
  const blockHeight = Math.max(60, duration * 2);

  return (
    <motion.div
      onClick={onClick}
      className={cn(
        'relative w-full cursor-pointer select-none overflow-hidden',
        isActive && 'ring-2 ring-white ring-offset-2 ring-offset-stone-50',
      )}
      style={{
        backgroundColor: c.bg,
        height: `${blockHeight}px`,
        minHeight: `${blockHeight}px`,
        borderRadius: 16,
        background: `linear-gradient(135deg, ${c.bg} 0%, color-mix(in srgb, ${c.bg} 85%, black) 100%)`,
      }}
      whileHover={{ filter: 'brightness(1.06)' }}
      whileTap={{ scale: 0.99 }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
    >
      {/* Subtle top highlight */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.14) 0%, transparent 40%)',
          borderRadius: 'inherit',
        }}
      />

      <div
        className="relative px-4 h-full flex flex-col justify-between"
        style={{ paddingTop: 10, paddingBottom: 10 }}
      >
        {/* Top row: time + active badges */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold opacity-75" style={{ color: c.text }}>
            {formatTime(startTime)}
          </span>
          <div className="flex items-center gap-1.5">
            {energyLevel && (
              <span title={ENERGY_DOT[energyLevel].title} className="text-xs opacity-80">
                {ENERGY_DOT[energyLevel].emoji}
              </span>
            )}
            {isActive && (
              <>
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: 'rgba(255,255,255,0.25)', color: c.text }}
                >
                  {minutesIn}m in
                </span>
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: 'rgba(255,255,255,0.25)', color: c.text }}
                >
                  {minutesLeft}m left
                </span>
              </>
            )}
          </div>
        </div>

        {/* Middle: icon + label */}
        <div className="flex items-center gap-3">
          <span style={{ color: c.text, opacity: 0.9 }}>
            <LucideIconComp name={icon} size={22} />
          </span>
          <span className="text-base font-bold leading-tight" style={{ color: c.text }}>
            {label}
          </span>
        </div>

        {/* Bottom: duration + progress bar for active */}
        <div className="flex flex-col gap-1.5">
          {isActive && (
            <ProgressBar value={progress} color="rgba(255,255,255,0.8)" animated />
          )}
          <span className="text-xs font-medium opacity-60" style={{ color: c.text }}>
            {formatDuration(duration)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
