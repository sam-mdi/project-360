
import { subDays, format, parseISO } from 'date-fns';
import { useRoutine } from '../../stores/useRoutine';
import { cn } from '../../lib/utils';

export function HeatMap() {
  const { dailyRoutines } = useRoutine();
  const days = 30;
  const today = new Date();

  const cells = Array.from({ length: days }, (_, i) => {
    const date = format(subDays(today, days - 1 - i), 'yyyy-MM-dd');
    const routine = dailyRoutines.find((r) => r.date === date);
    const total = routine?.blockIds.length ?? 0;
    const done = routine?.actuals.filter((a) => a.endedAt && a.notes !== 'skipped').length ?? 0;
    const ratio = total > 0 ? done / total : 0;
    return { date, ratio, total, done };
  });

  const getColor = (ratio: number) => {
    if (ratio === 0) return 'bg-stone-100';
    if (ratio < 0.33) return 'bg-amber-200';
    if (ratio < 0.66) return 'bg-amber-400';
    if (ratio < 1) return 'bg-emerald-400';
    return 'bg-emerald-500';
  };

  return (
    <div>
      <h3 className="text-sm font-semibold text-stone-600 mb-2">30-Day Activity</h3>
      <div className="flex flex-wrap gap-1">
        {cells.map(({ date, ratio, total, done }) => (
          <div
            key={date}
            className={cn('w-5 h-5 rounded-sm transition-colors cursor-default', getColor(ratio))}
            title={`${format(parseISO(date), 'MMM d')}: ${done}/${total} blocks`}
          />
        ))}
      </div>
      <div className="flex items-center gap-2 mt-2 text-xs text-stone-400">
        <span>Less</span>
        {['bg-stone-100', 'bg-amber-200', 'bg-amber-400', 'bg-emerald-400', 'bg-emerald-500'].map((c) => (
          <div key={c} className={cn('w-3.5 h-3.5 rounded-sm', c)} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
