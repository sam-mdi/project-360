import { useTracking } from '../../stores/useTracking';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';
import { Smile } from 'lucide-react';

const MOOD_EMOJI: Record<number, string> = { 1: '😫', 2: '😕', 3: '😐', 4: '😊', 5: '😄' };
const MOOD_LABELS: Record<number, string> = { 1: 'Rough', 2: 'Meh', 3: 'Okay', 4: 'Good', 5: 'Great' };

export function MoodChart() {
  const { moods } = useTracking();

  const last14 = Array.from({ length: 14 }, (_, i) => {
    const date = format(subDays(new Date(), 13 - i), 'yyyy-MM-dd');
    const label = format(subDays(new Date(), 13 - i), 'MMM d');
    const log = moods.find((m) => m.date === date);
    return { date, label, mood: log?.mood ?? null };
  });

  const filled = last14.filter((d) => d.mood !== null);

  if (filled.length === 0) return null;

  const avg = filled.reduce((s, d) => s + (d.mood ?? 0), 0) / filled.length;

  const chartData = last14.map((d) => ({ label: d.label, mood: d.mood }));

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Smile size={16} className="text-violet-500" />
          <h2 className="text-sm font-bold text-stone-700">Mood (14 Days)</h2>
        </div>
        <div className="text-right">
          <span className="text-lg">{MOOD_EMOJI[Math.round(avg)] ?? '😐'}</span>
          <p className="text-xs text-stone-400">{MOOD_LABELS[Math.round(avg)] ?? 'Okay'} avg</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={100}>
        <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -32, bottom: 0 }}>
          <defs>
            <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#a8a29e' }} axisLine={false} tickLine={false} interval={6} />
          <Tooltip
            contentStyle={{ borderRadius: 10, border: 'none', fontSize: 12 }}
            formatter={(v: number) => [MOOD_EMOJI[v] + ' ' + MOOD_LABELS[v], 'Mood']}
          />
          <Area
            type="monotone"
            dataKey="mood"
            stroke="#8b5cf6"
            strokeWidth={2}
            fill="url(#moodGrad)"
            dot={{ fill: '#8b5cf6', r: 3 }}
            connectNulls={false}
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
        {last14.filter((d) => d.mood).slice(-7).map((d) => (
          <div key={d.date} className="flex flex-col items-center gap-0.5 min-w-[32px]">
            <span className="text-base">{MOOD_EMOJI[d.mood!]}</span>
            <span className="text-[9px] text-stone-400">{format(new Date(d.date + 'T00:00:00'), 'E')}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
