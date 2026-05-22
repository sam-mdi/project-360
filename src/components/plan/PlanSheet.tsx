import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Plus } from 'lucide-react';
import { usePlans } from '../../stores/usePlans';
import { Button } from '../ui/Button';
import { InlineEdit } from '../ui/InlineEdit';
import { ProgressBar } from '../ui/ProgressBar';
import { formatDisplayDate } from '../../lib/utils';
import { format, parseISO, eachWeekOfInterval, endOfWeek } from 'date-fns';
import { cn } from '../../lib/utils';
import type { Plan } from '../../lib/types';

interface PlanSheetProps {
  plan: Plan;
}

function getRowCompletion(plan: Plan, date: string): number {
  const row = plan.rows.find((r) => r.date === date);
  if (!row || plan.columns.length === 0) return 0;
  const toggleCols = plan.columns.filter((c) => c.type === 'toggle');
  if (toggleCols.length === 0) return 0;
  const done = toggleCols.filter((c) => row.values[c.id] === 1).length;
  return done / toggleCols.length;
}

export function PlanSheet({ plan }: PlanSheetProps) {
  const { addColumn, removeColumn, updateColumn, setCellValue, exportCSV } = usePlans();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [sidePanelOpen, setSidePanelOpen] = useState(false);

  const handleCellClick = (date: string, colId: string) => {
    const col = plan.columns.find((c) => c.id === colId);
    if (!col) return;
    if (col.type === 'toggle') {
      const row = plan.rows.find((r) => r.date === date);
      const current = row?.values[colId] ?? 0;
      setCellValue(plan.id, date, colId, current === 1 ? 0 : 1);
    }
  };

  const handleDateClick = (date: string) => {
    setSelectedDate(date);
    setSidePanelOpen(true);
  };

  const handleExport = () => {
    const csv = exportCSV(plan.id);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${plan.name}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const selectedRow = plan.rows.find((r) => r.date === selectedDate);

  // Group rows by week
  let weekGroups: { weekStart: string; dates: string[] }[] = [];
  if (plan.rows.length > 0) {
    try {
      const weeks = eachWeekOfInterval(
        { start: parseISO(plan.startDate), end: parseISO(plan.endDate) },
        { weekStartsOn: 1 }
      );
      weekGroups = weeks.map((weekStart) => {
        const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
        const dates = plan.rows
          .filter((r) => {
            const d = parseISO(r.date);
            return d >= weekStart && d <= weekEnd;
          })
          .map((r) => r.date);
        return { weekStart: format(weekStart, 'yyyy-MM-dd'), dates };
      }).filter((w) => w.dates.length > 0);
    } catch {
      weekGroups = [{ weekStart: '', dates: plan.rows.map((r) => r.date) }];
    }
  }

  return (
    <div className="flex h-full relative">
      {/* Main spreadsheet */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-stone-200 bg-white shrink-0">
          <Button size="sm" variant="outline" onClick={handleExport}>
            <Download size={13} /> Export CSV
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => addColumn(plan.id, { label: 'New Column', type: 'toggle' })}
          >
            <Plus size={13} /> Add Column
          </Button>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full text-xs border-collapse min-w-max">
            <thead className="sticky top-0 z-10">
              <tr>
                <th className="bg-amber-500 text-white font-bold text-left px-3 py-2.5 w-28 border-r border-amber-400">
                  Date
                </th>
                {plan.columns.map((col) => (
                  <th key={col.id} className="bg-amber-500 text-white font-bold px-3 py-2.5 min-w-24 border-r border-amber-400">
                    <div className="flex items-center gap-1 justify-between">
                      <InlineEdit
                        value={col.label}
                        onChange={(v) => updateColumn(plan.id, col.id, { label: v })}
                        className="text-white text-xs font-bold"
                      />
                      <button
                        onClick={() => removeColumn(plan.id, col.id)}
                        className="hover:bg-amber-400 rounded p-0.5 transition-colors"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  </th>
                ))}
                <th className="bg-amber-500 text-white font-bold px-3 py-2.5 min-w-16 text-center">
                  %
                </th>
              </tr>
            </thead>
            <tbody>
              {weekGroups.map(({ weekStart, dates }, wi) => (
                <React.Fragment key={weekStart}>
                  {dates.map((date) => {
                    const row = plan.rows.find((r) => r.date === date);
                    const pct = getRowCompletion(plan, date);
                    return (
                      <tr
                        key={date}
                        className={cn(
                          'border-b border-stone-100 cursor-pointer hover:bg-amber-50 transition-colors',
                          selectedDate === date && 'bg-amber-50'
                        )}
                        onClick={() => handleDateClick(date)}
                      >
                        <td className="px-3 py-2 font-medium text-stone-700 border-r border-stone-100 whitespace-nowrap">
                          {formatDisplayDate(date)}
                        </td>
                        {plan.columns.map((col) => {
                          const val = row?.values[col.id];
                          if (col.type === 'toggle') {
                            return (
                              <td
                                key={col.id}
                                className={cn(
                                  'px-3 py-2 text-center font-semibold border-r border-stone-100',
                                  val === 1 ? 'bg-emerald-50 text-emerald-700' :
                                  val === 0 ? 'bg-rose-50 text-rose-600' : 'bg-stone-50 text-stone-400'
                                )}
                                onClick={(e) => { e.stopPropagation(); handleCellClick(date, col.id); }}
                              >
                                {val === 1 ? '✓' : val === 0 ? '✗' : '—'}
                              </td>
                            );
                          }
                          return (
                            <td key={col.id} className="px-3 py-2 border-r border-stone-100 text-stone-600">
                              <input
                                className="w-full bg-transparent outline-none text-xs"
                                value={String(val ?? '')}
                                onChange={(e) => setCellValue(plan.id, date, col.id, e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                placeholder="Note..."
                              />
                            </td>
                          );
                        })}
                        <td className="px-2 py-2 text-center">
                          <div className="flex items-center gap-1.5">
                            <ProgressBar value={pct} className="flex-1" />
                            <span className="text-stone-500 w-7 text-right">{Math.round(pct * 100)}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {/* Week total row */}
                  <tr className="bg-stone-50 border-b-2 border-stone-200">
                    <td className="px-3 py-1.5 text-xs font-bold text-stone-500">Week {wi + 1} Total</td>
                    {plan.columns.map((col) => {
                      if (col.type !== 'toggle') return <td key={col.id} className="border-r border-stone-200" />;
                      const count = dates.filter((d) => {
                        const row = plan.rows.find((r) => r.date === d);
                        return row?.values[col.id] === 1;
                      }).length;
                      return (
                        <td key={col.id} className="px-3 py-1.5 text-center text-xs font-bold text-stone-600 border-r border-stone-200">
                          {count}/{dates.length}
                        </td>
                      );
                    })}
                    <td className="px-2 py-1.5 text-center text-xs font-bold text-stone-600">
                      {Math.round(
                        dates.reduce((sum, d) => sum + getRowCompletion(plan, d), 0) / Math.max(1, dates.length) * 100
                      )}%
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side panel */}
      <AnimatePresence>
        {sidePanelOpen && selectedDate && (
          <motion.div
            className="w-80 border-l border-stone-200 bg-white flex flex-col shrink-0"
            initial={{ x: 320 }}
            animate={{ x: 0 }}
            exit={{ x: 320 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100">
              <h3 className="font-bold text-stone-900 text-sm">{formatDisplayDate(selectedDate)}</h3>
              <button onClick={() => setSidePanelOpen(false)} className="p-1.5 rounded-lg hover:bg-stone-100">
                <X size={14} className="text-stone-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {/* Progress ring */}
              <div className="flex items-center justify-center mb-4">
                <div className="relative w-20 h-20">
                  <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
                    <circle cx="40" cy="40" r="32" fill="none" stroke="#f5f5f4" strokeWidth="8" />
                    <circle
                      cx="40" cy="40" r="32" fill="none" stroke="#f59e0b" strokeWidth="8"
                      strokeDasharray={`${2 * Math.PI * 32}`}
                      strokeDashoffset={`${2 * Math.PI * 32 * (1 - getRowCompletion(plan, selectedDate))}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-stone-700">
                      {Math.round(getRowCompletion(plan, selectedDate) * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Toggles */}
              {plan.columns.map((col) => {
                const val = selectedRow?.values[col.id];
                if (col.type === 'toggle') {
                  return (
                    <div key={col.id} className="flex items-center justify-between py-2.5 border-b border-stone-50">
                      <span className="text-sm font-medium text-stone-700">{col.label}</span>
                      <button
                        onClick={() => setCellValue(plan.id, selectedDate, col.id, val === 1 ? 0 : 1)}
                        className={cn(
                          'w-10 h-6 rounded-full transition-colors relative',
                          val === 1 ? 'bg-emerald-500' : 'bg-stone-200'
                        )}
                      >
                        <div className={cn(
                          'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',
                          val === 1 ? 'left-[calc(100%-1.375rem)]' : 'left-0.5'
                        )} />
                      </button>
                    </div>
                  );
                }
                return (
                  <div key={col.id} className="py-2.5 border-b border-stone-50">
                    <p className="text-xs font-semibold text-stone-500 mb-1">{col.label}</p>
                    <textarea
                      className="w-full text-sm text-stone-700 bg-stone-50 rounded-lg p-2 outline-none resize-none focus:ring-2 focus:ring-amber-300"
                      rows={2}
                      value={String(val ?? '')}
                      onChange={(e) => setCellValue(plan.id, selectedDate, col.id, e.target.value)}
                      placeholder="Add notes..."
                    />
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
