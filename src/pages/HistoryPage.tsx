import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Flame,
  BarChart2,
  Star,
} from 'lucide-react';
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  eachWeekOfInterval,
  endOfWeek,
  isBefore,
  subDays,
} from 'date-fns';
import { useHistory } from '../stores/useHistory';
import { useRoutine } from '../stores/useRoutine';
import { todayStr } from '../lib/utils';
import { cn } from '../lib/utils';
import { getColor } from '../lib/colors';
import type { HistoryEntry } from '../lib/types';

function completionColor(rate: number) {
  if (rate >= 0.8) return 'text-emerald-700 bg-emerald-100';
  if (rate >= 0.5) return 'text-amber-700 bg-amber-100';
  return 'text-rose-700 bg-rose-100';
}

function DayCard({ entry }: { entry: HistoryEntry }) {
  const [open, setOpen] = useState(false);
  const total = entry.blocks.length;
  const done = entry.actuals.filter(
    (a) => a.endedAt && a.notes !== 'skipped'
  ).length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-stone-50 transition-colors"
      >
        <div className="flex-1 text-left">
          <p className="font-bold text-stone-900 text-sm">
            {format(parseISO(entry.date), 'EEEE, MMM d')}
          </p>
        </div>
        <span
          className={cn(
            'text-xs font-bold px-2 py-0.5 rounded-full',
            completionColor(entry.completionRate)
          )}
        >
          {done}/{total} blocks · {pct}%
        </span>
        {open ? (
          <ChevronUp size={14} className="text-stone-400 shrink-0" />
        ) : (
          <ChevronDown size={14} className="text-stone-400 shrink-0" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 space-y-1.5 border-t border-stone-50">
              {entry.blocks.length === 0 ? (
                <p className="text-xs text-stone-400 py-2">No blocks for this day</p>
              ) : (
                entry.blocks.map((block) => {
                  const actual = entry.actuals.find((a) => a.blockId === block.id);
                  const skipped = actual?.notes === 'skipped';
                  const completed = !!actual?.endedAt && !skipped;
                  const c = getColor(block.color);

                  return (
                    <div
                      key={block.id}
                      className="flex items-center gap-3 py-2 rounded-xl px-2 bg-stone-50"
                    >
                      <div
                        className="w-1.5 h-6 rounded-full shrink-0"
                        style={{ backgroundColor: c.bg }}
                      />
                      <span className="text-base">{block.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-stone-800 truncate">
                          {block.label}
                        </p>
                        <p className="text-xs text-stone-400">{block.startTime}</p>
                      </div>
                      <span
                        className={cn(
                          'text-xs font-bold px-2 py-0.5 rounded-full shrink-0',
                          completed
                            ? 'bg-emerald-100 text-emerald-700'
                            : skipped
                            ? 'bg-stone-100 text-stone-500'
                            : 'bg-rose-50 text-rose-500'
                        )}
                      >
                        {completed ? '✓ Done' : skipped ? '— Skipped' : '✗ Missed'}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatsCard({
  entries,
  month,
}: {
  entries: HistoryEntry[];
  month: Date;
}) {
  // Best streak
  const sortedDates = [...entries]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((e) => e.date);

  let bestStreak = 0;
  let currentStreak = 0;
  sortedDates.forEach((d, i) => {
    if (i === 0) {
      currentStreak = 1;
    } else {
      const prev = sortedDates[i - 1];
      const diff =
        (parseISO(d).getTime() - parseISO(prev).getTime()) /
        (1000 * 60 * 60 * 24);
      currentStreak = diff === 1 ? currentStreak + 1 : 1;
    }
    if (currentStreak > bestStreak) bestStreak = currentStreak;
  });

  // Average completion
  const avg =
    entries.length > 0
      ? Math.round(
          (entries.reduce((s, e) => s + e.completionRate, 0) / entries.length) *
            100
        )
      : 0;

  // Most completed block
  const blockCount: Record<string, number> = {};
  entries.forEach((e) => {
    e.actuals
      .filter((a) => a.endedAt && a.notes !== 'skipped')
      .forEach((a) => {
        const b = e.blocks.find((b) => b.id === a.blockId);
        if (b) blockCount[b.label] = (blockCount[b.label] ?? 0) + 1;
      });
  });
  const topBlock = Object.entries(blockCount).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 space-y-3">
      <h3 className="font-bold text-stone-800 text-sm flex items-center gap-2">
        <TrendingUp size={14} className="text-amber-500" />
        {format(month, 'MMMM')} Stats
      </h3>
      <div className="flex gap-3">
        <div className="flex-1 bg-amber-50 rounded-xl p-3 text-center">
          <Flame size={16} className="text-amber-500 mx-auto mb-1" />
          <p className="text-xl font-extrabold text-stone-900">{bestStreak}</p>
          <p className="text-xs text-stone-500">Best streak</p>
        </div>
        <div className="flex-1 bg-emerald-50 rounded-xl p-3 text-center">
          <BarChart2 size={16} className="text-emerald-500 mx-auto mb-1" />
          <p className="text-xl font-extrabold text-stone-900">{avg}%</p>
          <p className="text-xs text-stone-500">Avg completion</p>
        </div>
      </div>
      {topBlock && (
        <div className="flex items-center gap-2 bg-stone-50 rounded-xl p-3">
          <Star size={14} className="text-amber-500 shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-stone-500">Most completed</p>
            <p className="text-sm font-bold text-stone-800 truncate">
              {topBlock[0]} — {topBlock[1]} days
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export function HistoryPage() {
  const today = todayStr();
  const [viewDate, setViewDate] = useState(() => startOfMonth(new Date()));
  const [showStats, setShowStats] = useState(true);
  const { entries, saveDay } = useHistory();
  const { dailyRoutines } = useRoutine();

  // Auto-save yesterday if routine data exists but not saved to history
  useEffect(() => {
    const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
    const alreadySaved = entries.some((e) => e.date === yesterday);
    const hasRoutine = dailyRoutines.some(
      (r) => r.date === yesterday && (r.blockIds.length > 0 || r.actuals.length > 0)
    );
    if (!alreadySaved && hasRoutine) {
      saveDay(yesterday);
    }
  }, []);

  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(viewDate);

  // Filter entries to this month, past days only
  const monthEntries = entries
    .filter((e) => {
      const d = parseISO(e.date);
      return (
        d >= monthStart &&
        d <= monthEnd &&
        isBefore(parseISO(e.date), parseISO(today))
      );
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  // Group by week
  const weeks = eachWeekOfInterval(
    { start: monthStart, end: monthEnd },
    { weekStartsOn: 1 }
  );

  const weekGroups = weeks
    .map((ws) => {
      const we = endOfWeek(ws, { weekStartsOn: 1 });
      const weekEntries = monthEntries.filter((e) => {
        const d = parseISO(e.date);
        return d >= ws && d <= we;
      });
      return { ws, weekEntries };
    })
    .filter((w) => w.weekEntries.length > 0);

  const prevMonth = () =>
    setViewDate((d) => startOfMonth(new Date(d.getFullYear(), d.getMonth() - 1)));
  const nextMonth = () =>
    setViewDate((d) => startOfMonth(new Date(d.getFullYear(), d.getMonth() + 1)));

  return (
    <div className="flex flex-col h-full bg-stone-50">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-stone-100 bg-white shrink-0">
        <button
          onClick={prevMonth}
          className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500 transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="font-bold text-stone-900 text-sm min-w-28 text-center">
          {format(viewDate, 'MMMM yyyy')}
        </span>
        <button
          onClick={nextMonth}
          className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500 transition-colors"
        >
          <ChevronRight size={16} />
        </button>
        <div className="ml-auto">
          <button
            onClick={() => setShowStats((v) => !v)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors',
              showStats
                ? 'bg-amber-100 text-amber-700'
                : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
            )}
          >
            <TrendingUp size={13} />
            Stats
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Stats card */}
        <AnimatePresence>
          {showStats && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <StatsCard entries={monthEntries} month={viewDate} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state */}
        {monthEntries.length === 0 && (
          <div className="text-center py-16 text-stone-400">
            <p className="text-sm font-medium">No history yet</p>
            <p className="text-xs mt-1">
              Complete your first routine day and save it to see history here.
            </p>
          </div>
        )}

        {/* Week groups */}
        {weekGroups.map(({ ws, weekEntries }) => (
          <div key={ws.toISOString()}>
            <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2 px-1">
              Week of {format(ws, 'MMM d')}
            </p>
            <div className="space-y-2">
              {weekEntries.map((entry) => (
                <DayCard key={entry.date} entry={entry} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
