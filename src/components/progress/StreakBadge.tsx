
import { Flame } from 'lucide-react';
import { useStreak } from '../../hooks/useStreak';

export function StreakBadge() {
  const streak = useStreak();
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full">
      <Flame size={16} className="text-amber-500" />
      <span className="text-sm font-bold text-amber-700">{streak}</span>
      <span className="text-xs text-amber-500 font-medium">day streak</span>
    </div>
  );
}
