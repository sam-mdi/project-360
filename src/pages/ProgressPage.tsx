import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { subDays, format } from 'date-fns';
import { useRoutine } from '../stores/useRoutine';
import { usePlans } from '../stores/usePlans';
import { StreakBadge } from '../components/progress/StreakBadge';
import { HeatMap } from '../components/progress/HeatMap';
import { WheelOfLife } from '../components/progress/WheelOfLife';
import { ProgressBar } from '../components/ui/ProgressBar';
import { cn } from '../lib/utils';

function StatTile({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
      <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-2xl font-bold" style={{ color: color ?? '#1c1917' }}>{value}</p>
      {sub && <p className="text-xs text-stone-400 mt-0.5">{sub}</p>}
    </div>
  );
}

export function ProgressPage() {
  const { dailyRoutines } = useRoutine();
  const { plans, activePlanId } = usePlans();
  const activePlan = plans.find((p) => p.id === activePlanId);

  // Build 7-day bar data
  const barData = Array.from({ length: 7 }, (_, i) => {
    const date = format(subDays(new Date(), 6 - i), 'yyyy-MM-dd');
    const label = format(subDays(new Date(), 6 - i), 'EEE');
    const routine = dailyRoutines.find((r) => r.date === date);
    const planned = routine?.blockIds.length ?? 0;
    const done = routine?.actuals.filter((a) => a.endedAt && a.notes !== 'skipped').length ?? 0;
    return { label, planned, done };
  });

  // Today's donut
  const todayDate = format(new Date(), 'yyyy-MM-dd');
  const todayRoutine = dailyRoutines.find((r) => r.date === todayDate);
  const todayTotal = todayRoutine?.blockIds.length ?? 0;
  const todayDone = todayRoutine?.actuals.filter((a) => a.endedAt && a.notes !== 'skipped').length ?? 0;
  const todayRemaining = Math.max(0, todayTotal - todayDone);

  const donutData = [
    { name: 'Done', value: todayDone, color: '#10b981' },
    { name: 'Remaining', value: todayRemaining, color: '#e7e5e4' },
  ];

  // Best day + hardest block
  const allDoneRatios = dailyRoutines.map((r) => {
    const total = r.blockIds.length;
    const done = r.actuals.filter((a) => a.endedAt && a.notes !== 'skipped').length;
    return { date: r.date, ratio: total > 0 ? done / total : 0 };
  });
  const bestDay = allDoneRatios.sort((a, b) => b.ratio - a.ratio)[0];

  // Plan stats
  const getPlanCompletion = (plan: typeof activePlan) => {
    if (!plan) return 0;
    const toggleCols = plan.columns.filter((c) => c.type === 'toggle');
    if (toggleCols.length === 0 || plan.rows.length === 0) return 0;
    const totalCells = toggleCols.length * plan.rows.length;
    const doneCells = plan.rows.reduce((sum, row) =>
      sum + toggleCols.filter((c) => row.values[c.id] === 1).length, 0
    );
    return totalCells > 0 ? doneCells / totalCells : 0;
  };

  return (
    <div className="overflow-y-auto h-full">
      <div className="p-4 space-y-6 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-stone-900">Progress</h1>
          <StreakBadge />
        </div>

        {/* Today's donut */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
          <h2 className="text-sm font-bold text-stone-700 mb-3">Today's Blocks</h2>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={120} height={120}>
              <PieChart>
                <Pie data={donutData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" strokeWidth={0}>
                  {donutData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1">
              <div className="text-3xl font-bold text-stone-900">{todayDone}<span className="text-base text-stone-400 font-medium">/{todayTotal}</span></div>
              <p className="text-sm text-stone-500 mt-0.5">blocks completed</p>
              <div className="flex gap-3 mt-2">
                <div className="flex items-center gap-1.5 text-xs text-stone-500">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Done
                </div>
                <div className="flex items-center gap-1.5 text-xs text-stone-500">
                  <div className="w-2.5 h-2.5 rounded-full bg-stone-200" />
                  Remaining
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 7-day bar chart */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
          <h2 className="text-sm font-bold text-stone-700 mb-3">7-Day Overview</h2>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={barData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barGap={3}>
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#a8a29e' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#a8a29e' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                cursor={{ fill: '#fef3c7' }}
              />
              <Bar dataKey="planned" fill="#e7e5e4" radius={[4, 4, 0, 0]} name="Planned" />
              <Bar dataKey="done" fill="#10b981" radius={[4, 4, 0, 0]} name="Done" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Heatmap */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
          <HeatMap />
        </div>

        {/* Stat tiles */}
        <div className="grid grid-cols-2 gap-3">
          <StatTile
            label="Best Day"
            value={bestDay ? format(new Date(bestDay.date + 'T00:00:00'), 'MMM d') : '—'}
            sub={bestDay ? `${Math.round(bestDay.ratio * 100)}% completion` : 'No data yet'}
            color="#f59e0b"
          />
          <StatTile
            label="Avg Completion"
            value={`${Math.round(allDoneRatios.reduce((s, r) => s + r.ratio, 0) / Math.max(1, allDoneRatios.length) * 100)}%`}
            sub="across all tracked days"
            color="#10b981"
          />
        </div>

        {/* Plans section */}
        {plans.length > 0 && (
          <div>
            <h2 className="text-base font-bold text-stone-800 mb-3">Plan Progress</h2>

            {activePlan?.wheelStart && activePlan?.wheelCurrent && (
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100 mb-3">
                <h3 className="text-sm font-bold text-stone-700 mb-2">Wheel of Life</h3>
                <WheelOfLife
                  values={activePlan.wheelCurrent}
                  compare={activePlan.wheelStart}
                />
                <div className="flex gap-4 mt-2 text-xs text-stone-400 justify-center">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-0.5 bg-amber-500" />
                    <span>Current</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-0.5 border-t border-dashed border-stone-400" />
                    <span>Start</span>
                  </div>
                </div>
              </div>
            )}

            {plans.map((plan) => {
              const pct = getPlanCompletion(plan);
              const color = pct < 0.33 ? '#ef4444' : pct < 0.66 ? '#f59e0b' : '#10b981';

              // Per-column stats
              const colStats = plan.columns
                .filter((c) => c.type === 'toggle')
                .map((col) => {
                  const total = plan.rows.length;
                  const done = plan.rows.filter((r) => r.values[col.id] === 1).length;
                  return { label: col.label, done, total, pct: total > 0 ? done / total : 0 };
                });

              const best = colStats.sort((a, b) => b.pct - a.pct)[0];
              const worst = colStats.sort((a, b) => a.pct - b.pct)[0];

              return (
                <div key={plan.id} className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100 mb-3">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-stone-900">{plan.name}</h3>
                      <p className="text-xs text-stone-400">{plan.startDate} → {plan.endDate}</p>
                    </div>
                    <span className="text-lg font-bold" style={{ color }}>{Math.round(pct * 100)}%</span>
                  </div>
                  <ProgressBar value={pct} color={color} className="mb-3" />

                  {colStats.length > 0 && (
                    <div className="space-y-2">
                      {colStats.map(({ label, done, total, pct: cp }) => (
                        <div key={label}>
                          <div className="flex justify-between text-xs text-stone-600 mb-0.5">
                            <span>{label}</span>
                            <span className={cn(
                              'font-semibold',
                              cp < 0.33 ? 'text-rose-500' : cp < 0.66 ? 'text-amber-500' : 'text-emerald-500'
                            )}>{done}/{total}</span>
                          </div>
                          <ProgressBar
                            value={cp}
                            color={cp < 0.33 ? '#ef4444' : cp < 0.66 ? '#f59e0b' : '#10b981'}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {best && worst && best.label !== worst.label && (
                    <div className="flex gap-2 mt-3">
                      <div className="flex-1 bg-emerald-50 rounded-xl p-2.5">
                        <p className="text-xs text-emerald-600 font-bold">Best Topic</p>
                        <p className="text-sm font-semibold text-stone-700">{best.label}</p>
                      </div>
                      <div className="flex-1 bg-rose-50 rounded-xl p-2.5">
                        <p className="text-xs text-rose-500 font-bold">Needs Work</p>
                        <p className="text-sm font-semibold text-stone-700">{worst.label}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
