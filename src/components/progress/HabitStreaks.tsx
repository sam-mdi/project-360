import { useRoutine } from '../../stores/useRoutine';
import { format, subDays } from 'date-fns';
import { cn } from '../../lib/utils';
import { getColor } from '../../lib/colors';
import { Flame } from 'lucide-react';

export function HabitStreaks() {
  const { blocks, dailyRoutines } = useRoutine();

  if (blocks.length === 0) return null;

  const last30 = Array.from({ length: 30 }, (_, i) =>
    format(subDays(new Date(), 29 - i), 'yyyy-MM-dd')
  );

  const blockStreaks = blocks.slice(0, 6).map((block) => {
    const days = last30.map((date) => {
      const routine = dailyRoutines.find((r) => r.date === date);
      if (!routine || !routine.blockIds.includes(block.id)) return 'skip';
      const actual = routine.actuals.find((a) => a.blockId === block.id);
      if (!actual) return 'missed';
      if (actual.notes === 'skipped') return 'skipped';
      if (actual.endedAt) return 'done';
      return 'missed';
    });

    let streak = 0;
    for (let i = days.length - 1; i >= 0; i--) {
      if (days[i] === 'done') streak++;
      else if (days[i] === 'skip') continue;
      else break;
    }

    return { block, days, streak };
  });

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
      <div className="flex items-center gap-2 mb-4">
        <Flame size={16} className="text-amber-500" />
        <h2 className="text-sm font-bold text-stone-700">Habit Chains (Last 30 Days)</h2>
      </div>

      <div className="space-y-4">
        {blockStreaks.map(({ block, days, streak }) => {
          const c = getColor(block.color);
          return (
            <div key={block.id}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-base">{block.icon}</span>
                  <span className="text-xs font-semibold text-stone-700">{block.label}</span>
                </div>
                {streak > 0 && (
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
                    <Flame size={11} />
                    {streak}
                  </div>
                )}
              </div>
              <div className="flex gap-0.5 flex-wrap">
                {days.map((status, i) => (
                  <div
                    key={i}
                    title={last30[i]}
                    className={cn(
                      'w-[calc(100%/30-1px)] aspect-square rounded-sm transition-all min-w-[6px]',
                      status === 'done' ? '' :
                      status === 'skipped' ? 'bg-stone-200' :
                      status === 'missed' ? 'bg-rose-100' :
                      'bg-stone-50'
                    )}
                    style={status === 'done' ? { backgroundColor: c.bg } : undefined}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-4 mt-4 text-xs text-stone-400">
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-emerald-500" />Done</div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-rose-100" />Missed</div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-stone-200" />Skipped</div>
      </div>
    </div>
  );
}
