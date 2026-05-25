import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Minus } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  horizontalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { usePlans } from '../../stores/usePlans';
import { InlineEdit } from '../ui/InlineEdit';
import { ProgressBar } from '../ui/ProgressBar';
import { formatDisplayDate } from '../../lib/utils';
import { format, parseISO, eachWeekOfInterval, endOfWeek } from 'date-fns';
import { cn } from '../../lib/utils';
import type { Plan, PlanColumn } from '../../lib/types';

const DATE_COL_W = 110;
const PCT_COL_W = 110;
const DEFAULT_COL_W = 120;

function cycleToggle(current: string | number | undefined): string | number {
  if (current === 1) return 2;
  if (current === 2) return '';
  return 1;
}

function getRowCompletion(plan: Plan, date: string): number {
  const row = plan.rows.find((r) => r.date === date);
  if (!row || plan.columns.length === 0) return 0;
  const toggleCols = plan.columns.filter((c) => c.type === 'toggle');
  if (toggleCols.length === 0) return 0;
  const done = toggleCols.filter((c) => row.values[c.id] === 1).length;
  return done / toggleCols.length;
}

// ── Sortable column header ──────────────────────────────────────────────────

interface SortableHeaderProps {
  col: PlanColumn;
  planId: string;
  onResizeStart: (e: React.MouseEvent, colId: string, width: number) => void;
}

function SortableColumnHeader({ col, planId, onResizeStart }: SortableHeaderProps) {
  const { updateColumn, removeColumn } = usePlans();
  const { attributes, listeners, setNodeRef, transform, isDragging } = useSortable({
    id: col.id,
  });

  const width = col.width ?? DEFAULT_COL_W;

  return (
    <th
      ref={setNodeRef}
      style={{
        width,
        minWidth: width,
        position: 'sticky',
        top: 0,
        zIndex: isDragging ? 50 : 20,
        transform: transform
          ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
          : undefined,
        opacity: isDragging ? 0.6 : 1,
        transition: isDragging ? undefined : 'transform 150ms ease',
        boxSizing: 'border-box',
        userSelect: 'none',
      }}
      className="bg-amber-500 text-white font-bold px-0 py-0 border-r border-amber-400"
    >
      <div
        className="flex items-center gap-1 px-3 py-2.5 cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <div onMouseDown={(e) => e.stopPropagation()} className="flex-1 min-w-0">
          <InlineEdit
            value={col.label}
            onChange={(v) => updateColumn(planId, col.id, { label: v })}
            className="text-white text-xs font-bold"
          />
        </div>
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            removeColumn(planId, col.id);
          }}
          className="hover:bg-amber-400 rounded p-0.5 transition-colors shrink-0"
        >
          <X size={10} />
        </button>
      </div>
      {/* Resize handle */}
      <div
        className="absolute top-0 right-0 w-2 h-full cursor-col-resize z-10 hover:bg-white/20"
        onMouseDown={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onResizeStart(e, col.id, width);
        }}
      />
    </th>
  );
}

// ── Main component ──────────────────────────────────────────────────────────

interface PlanSheetProps {
  plan: Plan;
  hideToolbar?: boolean;
}

export function PlanSheet({ plan, hideToolbar }: PlanSheetProps) {
  const { updateColumn, setCellValue, updatePlan } = usePlans();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [sidePanelOpen, setSidePanelOpen] = useState(false);
  const [resizing, setResizing] = useState<{
    colId: string;
    startX: number;
    startWidth: number;
  } | null>(null);

  // Column resize via global mouse events
  useEffect(() => {
    if (!resizing) return;
    const onMove = (e: MouseEvent) => {
      const delta = e.clientX - resizing.startX;
      const newWidth = Math.max(60, resizing.startWidth + delta);
      updateColumn(plan.id, resizing.colId, { width: newWidth });
    };
    const onUp = () => setResizing(null);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [resizing, plan.id, updateColumn]);

  // Column reorder via @dnd-kit
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const oldIdx = plan.columns.findIndex((c) => c.id === String(active.id));
    const newIdx = plan.columns.findIndex((c) => c.id === String(over.id));
    if (oldIdx === -1 || newIdx === -1) return;
    updatePlan(plan.id, { columns: arrayMove([...plan.columns], oldIdx, newIdx) });
  };

  const handleCellClick = (date: string, colId: string) => {
    const col = plan.columns.find((c) => c.id === colId);
    if (!col || col.type !== 'toggle') return;
    const row = plan.rows.find((r) => r.date === date);
    setCellValue(plan.id, date, colId, cycleToggle(row?.values[colId]));
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
      weekGroups = weeks
        .map((ws) => {
          const we = endOfWeek(ws, { weekStartsOn: 1 });
          const dates = plan.rows
            .filter((r) => {
              const d = parseISO(r.date);
              return d >= ws && d <= we;
            })
            .map((r) => r.date);
          return { weekStart: format(ws, 'yyyy-MM-dd'), dates };
        })
        .filter((w) => w.dates.length > 0);
    } catch {
      weekGroups = [{ weekStart: '', dates: plan.rows.map((r) => r.date) }];
    }
  }

  const resizingCursor = resizing ? 'col-resize' : undefined;

  return (
    <div className="flex h-full relative">
      {/* Main spreadsheet */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Scrollable table container */}
        <div
          className="flex-1 overflow-auto"
          style={{ cursor: resizingCursor, overflowX: 'auto', overflowY: 'auto' }}
        >
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <table
              className="text-xs"
              style={{
                borderCollapse: 'separate',
                borderSpacing: 0,
                minWidth: 'max-content',
                width: '100%',
              }}
            >
              <thead>
                <tr>
                  {/* Frozen Date header (top + left) */}
                  <th
                    style={{
                      width: DATE_COL_W,
                      minWidth: DATE_COL_W,
                      position: 'sticky',
                      top: 0,
                      left: 0,
                      zIndex: 30,
                      boxSizing: 'border-box',
                    }}
                    className="bg-amber-500 text-white font-bold text-left px-3 py-2.5 border-r border-amber-400"
                  >
                    Date
                  </th>

                  {/* Sortable column headers */}
                  <SortableContext
                    items={plan.columns.map((c) => c.id)}
                    strategy={horizontalListSortingStrategy}
                  >
                    {plan.columns.map((col) => (
                      <SortableColumnHeader
                        key={col.id}
                        col={col}
                        planId={plan.id}
                        onResizeStart={(e, id, w) =>
                          setResizing({ colId: id, startX: e.clientX, startWidth: w })
                        }
                      />
                    ))}
                  </SortableContext>

                  {/* Frozen % header (top + right) */}
                  <th
                    style={{
                      width: PCT_COL_W,
                      minWidth: PCT_COL_W,
                      position: 'sticky',
                      top: 0,
                      right: 0,
                      zIndex: 25,
                      boxSizing: 'border-box',
                    }}
                    className="bg-amber-500 text-white font-bold px-3 py-2.5 text-center border-l border-amber-400"
                  >
                    %
                  </th>
                </tr>
              </thead>

              <tbody>
                {weekGroups.map(({ weekStart, dates }, wi) => (
                  <React.Fragment key={weekStart || wi}>
                    {dates.map((date) => {
                      const row = plan.rows.find((r) => r.date === date);
                      const pct = getRowCompletion(plan, date);
                      const isSelected = selectedDate === date;

                      return (
                        <tr
                          key={date}
                          className="group cursor-pointer"
                          onClick={() => {
                            setSelectedDate(date);
                            setSidePanelOpen(true);
                          }}
                        >
                          {/* Frozen date cell */}
                          <td
                            style={{
                              position: 'sticky',
                              left: 0,
                              zIndex: 10,
                              width: DATE_COL_W,
                              minWidth: DATE_COL_W,
                              boxSizing: 'border-box',
                            }}
                            className={cn(
                              'px-3 py-2 font-medium text-stone-700 border-r border-stone-100 border-b border-stone-100 whitespace-nowrap transition-colors',
                              isSelected
                                ? 'bg-amber-50'
                                : 'bg-white group-hover:bg-amber-50/60'
                            )}
                          >
                            {formatDisplayDate(date)}
                          </td>

                          {/* Data cells */}
                          {plan.columns.map((col) => {
                            const val = row?.values[col.id];
                            const w = col.width ?? DEFAULT_COL_W;

                            if (col.type === 'toggle') {
                              return (
                                <td
                                  key={col.id}
                                  style={{ width: w, minWidth: w }}
                                  className={cn(
                                    'py-2 text-center font-semibold border-r border-stone-100 border-b border-stone-100 cursor-pointer transition-colors',
                                    val === 1
                                      ? 'bg-emerald-50'
                                      : val === 2
                                      ? 'bg-stone-50'
                                      : 'group-hover:bg-amber-50/60'
                                  )}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCellClick(date, col.id);
                                  }}
                                >
                                  {val === 1 ? (
                                    <Check
                                      size={14}
                                      className="text-emerald-600 mx-auto"
                                    />
                                  ) : val === 2 ? (
                                    <Minus
                                      size={14}
                                      className="text-stone-400 mx-auto"
                                    />
                                  ) : null}
                                </td>
                              );
                            }

                            return (
                              <td
                                key={col.id}
                                style={{ width: w, minWidth: w }}
                                className="px-3 py-2 border-r border-stone-100 border-b border-stone-100 text-stone-600 group-hover:bg-amber-50/60"
                              >
                                <input
                                  className="w-full bg-transparent outline-none text-xs"
                                  value={String(val ?? '')}
                                  onChange={(e) =>
                                    setCellValue(plan.id, date, col.id, e.target.value)
                                  }
                                  onClick={(e) => e.stopPropagation()}
                                  placeholder="Note..."
                                />
                              </td>
                            );
                          })}

                          {/* Frozen % cell */}
                          <td
                            style={{
                              position: 'sticky',
                              right: 0,
                              zIndex: 10,
                              width: PCT_COL_W,
                              minWidth: PCT_COL_W,
                              boxSizing: 'border-box',
                            }}
                            className={cn(
                              'px-3 py-2 border-l border-stone-100 border-b border-stone-100 transition-colors',
                              isSelected
                                ? 'bg-amber-50'
                                : 'bg-white group-hover:bg-amber-50/60'
                            )}
                          >
                            <div className="flex items-center gap-1.5">
                              <ProgressBar value={pct} className="flex-1" />
                              <span className="text-stone-500 w-7 text-right shrink-0 text-xs">
                                {Math.round(pct * 100)}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {/* Week total row */}
                    <tr>
                      <td
                        style={{
                          position: 'sticky',
                          left: 0,
                          zIndex: 10,
                          width: DATE_COL_W,
                        }}
                        className="px-3 py-1.5 text-xs font-bold text-stone-500 bg-stone-50 border-r border-stone-200 border-b-2 border-stone-200"
                      >
                        Week {wi + 1} Total
                      </td>
                      {plan.columns.map((col) => {
                        if (col.type !== 'toggle')
                          return (
                            <td
                              key={col.id}
                              className="border-r border-stone-200 border-b-2 border-stone-200 bg-stone-50"
                            />
                          );
                        const done = dates.filter((d) => {
                          const r = plan.rows.find((r) => r.date === d);
                          return r?.values[col.id] === 1;
                        }).length;
                        return (
                          <td
                            key={col.id}
                            className="px-3 py-1.5 text-center text-xs font-bold text-stone-600 border-r border-stone-200 border-b-2 border-stone-200 bg-stone-50"
                          >
                            {done}/{dates.length}
                          </td>
                        );
                      })}
                      <td
                        style={{
                          position: 'sticky',
                          right: 0,
                          zIndex: 10,
                          width: PCT_COL_W,
                        }}
                        className="px-3 py-1.5 text-center text-xs font-bold text-stone-600 bg-stone-50 border-l border-stone-200 border-b-2 border-stone-200"
                      >
                        {Math.round(
                          (dates.reduce(
                            (sum, d) => sum + getRowCompletion(plan, d),
                            0
                          ) /
                            Math.max(1, dates.length)) *
                            100
                        )}
                        %
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </DndContext>
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
              <h3 className="font-bold text-stone-900 text-sm">
                {formatDisplayDate(selectedDate)}
              </h3>
              <button
                onClick={() => setSidePanelOpen(false)}
                className="p-1.5 rounded-lg hover:bg-stone-100"
              >
                <X size={14} className="text-stone-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {/* Progress ring */}
              <div className="flex items-center justify-center mb-4">
                <div className="relative w-20 h-20">
                  <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
                    <circle
                      cx="40" cy="40" r="32"
                      fill="none" stroke="#f5f5f4" strokeWidth="8"
                    />
                    <circle
                      cx="40" cy="40" r="32"
                      fill="none" stroke="#f59e0b" strokeWidth="8"
                      strokeDasharray={`${2 * Math.PI * 32}`}
                      strokeDashoffset={`${
                        2 *
                        Math.PI *
                        32 *
                        (1 - getRowCompletion(plan, selectedDate))
                      }`}
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

              {plan.columns.map((col) => {
                const val = selectedRow?.values[col.id];
                if (col.type === 'toggle') {
                  return (
                    <div
                      key={col.id}
                      className="flex items-center justify-between py-2.5 border-b border-stone-50"
                    >
                      <span className="text-sm font-medium text-stone-700">
                        {col.label}
                      </span>
                      <button
                        onClick={() =>
                          setCellValue(
                            plan.id,
                            selectedDate,
                            col.id,
                            cycleToggle(val)
                          )
                        }
                        className={cn(
                          'w-10 h-6 rounded-full transition-colors relative shrink-0',
                          val === 1
                            ? 'bg-emerald-500'
                            : val === 2
                            ? 'bg-stone-300'
                            : 'bg-stone-200'
                        )}
                      >
                        <div
                          className={cn(
                            'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',
                            val === 1 || val === 2
                              ? 'left-[calc(100%-1.375rem)]'
                              : 'left-0.5'
                          )}
                        />
                      </button>
                    </div>
                  );
                }
                return (
                  <div key={col.id} className="py-2.5 border-b border-stone-50">
                    <p className="text-xs font-semibold text-stone-500 mb-1">
                      {col.label}
                    </p>
                    <textarea
                      className="w-full text-sm text-stone-700 bg-stone-50 rounded-lg p-2 outline-none resize-none focus:ring-2 focus:ring-amber-300"
                      rows={2}
                      value={String(val ?? '')}
                      onChange={(e) =>
                        setCellValue(
                          plan.id,
                          selectedDate,
                          col.id,
                          e.target.value
                        )
                      }
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
