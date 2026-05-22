import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Plan, PlanColumn, PlanRow, WheelOfLifeValues } from '../lib/types';
import { generateId } from '../lib/utils';
import { eachDayOfInterval, parseISO, format } from 'date-fns';

interface PlansStore {
  plans: Plan[];
  activePlanId: string | null;

  createPlan: (name: string, startDate: string, endDate: string, wheel?: WheelOfLifeValues) => string;
  updatePlan: (id: string, patch: Partial<Plan>) => void;
  deletePlan: (id: string) => void;
  duplicatePlan: (id: string) => string;
  setActivePlan: (id: string) => void;

  addColumn: (planId: string, col: Omit<PlanColumn, 'id'>) => void;
  updateColumn: (planId: string, colId: string, patch: Partial<PlanColumn>) => void;
  removeColumn: (planId: string, colId: string) => void;

  setCellValue: (planId: string, date: string, colId: string, value: string | number) => void;
  updateWheelCurrent: (planId: string, wheel: WheelOfLifeValues) => void;

  getActivePlan: () => Plan | undefined;
  exportCSV: (planId: string) => string;
}

function generateRows(startDate: string, endDate: string): PlanRow[] {
  try {
    const days = eachDayOfInterval({ start: parseISO(startDate), end: parseISO(endDate) });
    return days.map((d) => ({ date: format(d, 'yyyy-MM-dd'), values: {} }));
  } catch {
    return [];
  }
}

export const usePlans = create<PlansStore>()(
  persist(
    (set, get) => ({
      plans: [],
      activePlanId: null,

      createPlan: (name, startDate, endDate, wheel) => {
        const id = generateId();
        const rows = generateRows(startDate, endDate);
        const plan: Plan = {
          id, name, startDate, endDate,
          columns: [],
          rows,
          wheelStart: wheel,
          wheelCurrent: wheel ? { ...wheel } : undefined,
        };
        set((s) => ({ plans: [...s.plans, plan], activePlanId: id }));
        return id;
      },

      updatePlan: (id, patch) =>
        set((s) => ({ plans: s.plans.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),

      deletePlan: (id) =>
        set((s) => {
          const remaining = s.plans.filter((p) => p.id !== id);
          return {
            plans: remaining,
            activePlanId: s.activePlanId === id ? (remaining[0]?.id ?? null) : s.activePlanId,
          };
        }),

      duplicatePlan: (id) => {
        const plan = get().plans.find((p) => p.id === id);
        if (!plan) return '';
        const newId = generateId();
        const copy: Plan = { ...plan, id: newId, name: plan.name + ' (copy)' };
        set((s) => ({ plans: [...s.plans, copy], activePlanId: newId }));
        return newId;
      },

      setActivePlan: (id) => set({ activePlanId: id }),

      addColumn: (planId, col) => {
        const id = generateId();
        set((s) => ({
          plans: s.plans.map((p) =>
            p.id === planId ? { ...p, columns: [...p.columns, { ...col, id }] } : p
          ),
        }));
      },

      updateColumn: (planId, colId, patch) =>
        set((s) => ({
          plans: s.plans.map((p) =>
            p.id === planId
              ? { ...p, columns: p.columns.map((c) => (c.id === colId ? { ...c, ...patch } : c)) }
              : p
          ),
        })),

      removeColumn: (planId, colId) =>
        set((s) => ({
          plans: s.plans.map((p) =>
            p.id === planId
              ? { ...p, columns: p.columns.filter((c) => c.id !== colId) }
              : p
          ),
        })),

      setCellValue: (planId, date, colId, value) =>
        set((s) => ({
          plans: s.plans.map((p) => {
            if (p.id !== planId) return p;
            const rowExists = p.rows.find((r) => r.date === date);
            const rows = rowExists
              ? p.rows.map((r) =>
                  r.date === date ? { ...r, values: { ...r.values, [colId]: value } } : r
                )
              : [...p.rows, { date, values: { [colId]: value } }];
            return { ...p, rows };
          }),
        })),

      updateWheelCurrent: (planId, wheel) =>
        set((s) => ({
          plans: s.plans.map((p) =>
            p.id === planId ? { ...p, wheelCurrent: wheel } : p
          ),
        })),

      getActivePlan: () => {
        const { plans, activePlanId } = get();
        return plans.find((p) => p.id === activePlanId);
      },

      exportCSV: (planId) => {
        const plan = get().plans.find((p) => p.id === planId);
        if (!plan) return '';
        const header = ['Date', ...plan.columns.map((c) => c.label)].join(',');
        const rows = plan.rows.map((r) =>
          [r.date, ...plan.columns.map((c) => String(r.values[c.id] ?? ''))].join(',')
        );
        return [header, ...rows].join('\n');
      },
    }),
    { name: 'p360-plans' }
  )
);
