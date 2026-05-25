import { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, X } from 'lucide-react';
import { useSettings } from '../../stores/useSettings';
import { useRoutine } from '../../stores/useRoutine';
import { usePlans } from '../../stores/usePlans';
import { useTracking } from '../../stores/useTracking';
import { useStreak } from '../../hooks/useStreak';
import { callClaude } from '../../lib/ai';
import { format, subDays } from 'date-fns';
import { cn } from '../../lib/utils';

const SYSTEM = `You are a supportive personal coach for a productivity app called Project 360.
Analyze the user's data and give a warm, specific, actionable 2-3 sentence morning briefing.
Be encouraging but honest. Reference specific patterns you see.
Never be generic. Always end with one concrete suggestion for today.`;

const CACHE_KEY = 'p360-ai-briefing';
const DISMISS_KEY = 'p360-briefing-dismiss';

function greet(name: string) {
  const h = new Date().getHours();
  if (h < 12) return `Good morning, ${name}`;
  if (h < 17) return `Good afternoon, ${name}`;
  return `Good evening, ${name}`;
}

export function AIBriefingCard() {
  const { firstName, claudeApiKey } = useSettings();
  const { dailyRoutines } = useRoutine();
  const { plans } = usePlans();
  const { moods } = useTracking();
  const streak = useStreak();
  const today = format(new Date(), 'yyyy-MM-dd');

  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(DISMISS_KEY) === today
  );

  useEffect(() => {
    if (dismissed || !claudeApiKey) return;
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const { date, text: t } = JSON.parse(cached);
        if (date === today) { setText(t); return; }
      } catch (_) {}
    }
    fetchBriefing();
  }, [claudeApiKey]);

  const buildData = () => {
    const last7 = Array.from({ length: 7 }, (_, i) => {
      const d = format(subDays(new Date(), i), 'yyyy-MM-dd');
      const r = dailyRoutines.find((r) => r.date === d);
      const total = r?.blockIds.length ?? 0;
      const done = r?.actuals.filter((a) => a.endedAt && a.notes !== 'skipped').length ?? 0;
      return { date: d, rate: total > 0 ? Math.round((done / total) * 100) : 0 };
    });
    const plan = plans[0];
    const planPct = plan
      ? Math.round(
          (plan.rows.reduce(
            (s, row) =>
              s + plan.columns.filter((c) => c.type === 'toggle' && row.values[c.id] === 1).length,
            0
          ) /
            Math.max(1, plan.columns.filter((c) => c.type === 'toggle').length * plan.rows.length)) *
            100
        )
      : null;
    const moodLast7 = moods
      .filter((m) => last7.some((d) => d.date === m.date))
      .map((m) => ({ date: m.date, mood: m.mood }));
    return JSON.stringify({ last7CompletionRates: last7, streak, planProgress: planPct, moodLogs: moodLast7 });
  };

  const fetchBriefing = async () => {
    if (!claudeApiKey) { setError('Add your Claude API key in Settings to enable AI briefings.'); return; }
    setLoading(true);
    setError('');
    try {
      const t = await callClaude(claudeApiKey, SYSTEM, buildData(), 300);
      setText(t);
      localStorage.setItem(CACHE_KEY, JSON.stringify({ date: today, text: t }));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to fetch briefing');
    } finally {
      setLoading(false);
    }
  };

  if (dismissed) return null;
  if (!claudeApiKey && !text) return null;

  return (
    <div className="mx-4 mt-3 mb-1 rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles size={15} className="text-amber-500 shrink-0 mt-0.5" />
          <span className="text-sm font-bold text-stone-800">{greet(firstName)}</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={fetchBriefing}
            disabled={loading}
            className="p-1 rounded-lg hover:bg-amber-100 text-amber-600 disabled:opacity-40"
            title="Refresh"
          >
            <RefreshCw size={13} className={cn(loading && 'animate-spin')} />
          </button>
          <button
            onClick={() => { setDismissed(true); localStorage.setItem(DISMISS_KEY, today); }}
            className="p-1 rounded-lg hover:bg-amber-100 text-stone-400"
            title="Dismiss for today"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      <div className="mt-2 pl-5">
        {loading && (
          <div className="space-y-1.5">
            {[100, 80, 60].map((w) => (
              <div key={w} className={`h-3 rounded bg-amber-200/70 animate-pulse`} style={{ width: `${w}%` }} />
            ))}
          </div>
        )}
        {error && <p className="text-xs text-rose-500">{error}</p>}
        {!loading && !error && text && (
          <p className="text-sm text-stone-700 leading-relaxed">{text}</p>
        )}
      </div>

      <div className="mt-2 pl-5">
        <button
          onClick={() => { setDismissed(true); localStorage.setItem(DISMISS_KEY, today); }}
          className="text-xs text-stone-400 hover:text-stone-600"
        >
          Dismiss for today
        </button>
      </div>
    </div>
  );
}
