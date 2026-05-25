import { useRoutine } from '../../stores/useRoutine';
import { usePlans } from '../../stores/usePlans';
import { format, subDays, startOfWeek } from 'date-fns';
import { TrendingUp } from 'lucide-react';

function RadialGauge({ value, color }: { value: number; color: string }) {
  const r = 40;
  const circ = 2 * Math.PI * r;
  const angle = (value / 100) * circ;

  return (
    <svg width="100" height="100" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r={r} fill="none" stroke="#f5f5f4" strokeWidth="10" />
      <circle
        cx="50"
        cy="50"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeDasharray={circ}
        strokeDashoffset={circ - angle}
        strokeLinecap="round"
        transform="rotate(-90 50 50)"
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
      <text x="50" y="54" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#1c1917">
        {value}
      </text>
    </svg>
  );
}

export function WeeklyScoreCard() {
  const { dailyRoutines } = useRoutine();
  const { plans } = usePlans();

  const last12Weeks = Array.from({ length: 12 }, (_, i) => {
    const weekStart = startOfWeek(subDays(new Date(), i * 7), { weekStartsOn: 1 });
    const weekDates = Array.from({ length: 7 }, (_, d) =>
      format(subDays(weekStart, -d), 'yyyy-MM-dd')
    );

    let planned = 0;
    let done = 0;
    weekDates.forEach((date) => {
      const r = dailyRoutines.find((r) => r.date === date);
      if (r) {
        planned += r.blockIds.length;
        done += r.actuals.filter((a) => a.endedAt && a.notes !== 'skipped').length;
      }
    });

    const score = planned > 0 ? Math.round((done / planned) * 100) : 0;
    return { weekStart: format(weekStart, 'MMM d'), score, planned, done };
  }).reverse();

  const thisWeek = last12Weeks[last12Weeks.length - 1];
  const lastWeek = last12Weeks[last12Weeks.length - 2];
  const trend = thisWeek.score - (lastWeek?.score ?? 0);

  const scoreColor = thisWeek.score >= 80 ? '#10b981' : thisWeek.score >= 50 ? '#f59e0b' : '#ef4444';

  if (last12Weeks.every((w) => w.planned === 0)) return null;

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp size={16} className="text-amber-500" />
        <h2 className="text-sm font-bold text-stone-700">Plan vs. Reality</h2>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <RadialGauge value={thisWeek.score} color={scoreColor} />
        <div>
          <p className="text-base font-bold text-stone-900">This Week</p>
          <p className="text-sm text-stone-500">{thisWeek.done}/{thisWeek.planned} blocks</p>
          {lastWeek && lastWeek.planned > 0 && (
            <p className={`text-xs font-semibold mt-1 ${trend >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% vs last week
            </p>
          )}
        </div>
      </div>

      {/* Mini bar chart - 12 weeks */}
      <div className="flex items-end gap-1 h-12">
        {last12Weeks.map((week, i) => {
          const h = week.score > 0 ? Math.max(4, (week.score / 100) * 40) : 4;
          const isThis = i === last12Weeks.length - 1;
          return (
            <div
              key={i}
              className="flex-1 rounded-t-sm transition-all"
              style={{
                height: `${h}px`,
                backgroundColor: isThis ? scoreColor : week.score >= 80 ? '#d1fae5' : week.score >= 50 ? '#fef3c7' : '#fee2e2',
              }}
              title={`${week.weekStart}: ${week.score}%`}
            />
          );
        })}
      </div>
      <div className="flex justify-between text-[9px] text-stone-400 mt-1">
        <span>{last12Weeks[0]?.weekStart}</span>
        <span>This week</span>
      </div>
    </div>
  );
}
