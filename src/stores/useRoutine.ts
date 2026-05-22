import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TimeBlock, ActualBlock, Sequence, DailyRoutine } from '../lib/types';
import { generateId, todayStr } from '../lib/utils';

interface RoutineStore {
  blocks: TimeBlock[];
  sequences: Sequence[];
  dailyRoutines: DailyRoutine[];
  selectedBlockId: string | null;

  addBlock: (block: Omit<TimeBlock, 'id'>) => string;
  updateBlock: (id: string, patch: Partial<TimeBlock>) => void;
  removeBlock: (id: string) => void;
  reorderBlocks: (date: string, ids: string[]) => void;

  getTodayBlocks: (date?: string) => TimeBlock[];
  getRoutineForDate: (date: string) => DailyRoutine;
  setBlocksForDate: (date: string, blockIds: string[]) => void;

  addSequence: (seq: Omit<Sequence, 'id'>) => string;
  updateSequence: (id: string, patch: Partial<Sequence>) => void;
  removeSequence: (id: string) => void;

  logActual: (date: string, actual: Omit<ActualBlock, 'date'>) => void;
  getActualsForDate: (date: string) => ActualBlock[];

  selectBlock: (id: string | null) => void;
  skipBlock: (id: string, date: string) => void;
}

export const useRoutine = create<RoutineStore>()(
  persist(
    (set, get) => ({
      blocks: [],
      sequences: [],
      dailyRoutines: [],
      selectedBlockId: null,

      addBlock: (block) => {
        const id = generateId();
        const today = todayStr();
        set((s) => {
          const newBlock = { ...block, id };
          const routine = s.dailyRoutines.find((r) => r.date === today);
          if (routine) {
            return {
              blocks: [...s.blocks, newBlock],
              dailyRoutines: s.dailyRoutines.map((r) =>
                r.date === today ? { ...r, blockIds: [...r.blockIds, id] } : r
              ),
            };
          }
          return {
            blocks: [...s.blocks, newBlock],
            dailyRoutines: [...s.dailyRoutines, { date: today, blockIds: [id], actuals: [] }],
          };
        });
        return id;
      },

      updateBlock: (id, patch) =>
        set((s) => ({ blocks: s.blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)) })),

      removeBlock: (id) =>
        set((s) => ({
          blocks: s.blocks.filter((b) => b.id !== id),
          dailyRoutines: s.dailyRoutines.map((r) => ({
            ...r,
            blockIds: r.blockIds.filter((bid) => bid !== id),
          })),
        })),

      reorderBlocks: (date, ids) =>
        set((s) => ({
          dailyRoutines: s.dailyRoutines.map((r) =>
            r.date === date ? { ...r, blockIds: ids } : r
          ),
        })),

      getTodayBlocks: (date) => {
        const d = date ?? todayStr();
        const { blocks, dailyRoutines } = get();
        const routine = dailyRoutines.find((r) => r.date === d);
        if (!routine) return blocks.filter((b) => {
          const days = b.recurrence.days;
          const dow = new Date(d + 'T00:00:00').getDay();
          if (b.recurrence.type === 'daily') return true;
          if (b.recurrence.type === 'weekly' && days) return days.includes(dow);
          return false;
        });
        return routine.blockIds
          .map((id) => blocks.find((b) => b.id === id))
          .filter(Boolean) as TimeBlock[];
      },

      getRoutineForDate: (date) => {
        const { dailyRoutines } = get();
        return dailyRoutines.find((r) => r.date === date) ?? { date, blockIds: [], actuals: [] };
      },

      setBlocksForDate: (date, blockIds) =>
        set((s) => {
          const exists = s.dailyRoutines.find((r) => r.date === date);
          if (exists) {
            return {
              dailyRoutines: s.dailyRoutines.map((r) =>
                r.date === date ? { ...r, blockIds } : r
              ),
            };
          }
          return {
            dailyRoutines: [...s.dailyRoutines, { date, blockIds, actuals: [] }],
          };
        }),

      addSequence: (seq) => {
        const id = generateId();
        set((s) => ({ sequences: [...s.sequences, { ...seq, id }] }));
        return id;
      },

      updateSequence: (id, patch) =>
        set((s) => ({ sequences: s.sequences.map((seq) => (seq.id === id ? { ...seq, ...patch } : seq)) })),

      removeSequence: (id) =>
        set((s) => ({ sequences: s.sequences.filter((seq) => seq.id !== id) })),

      logActual: (date, actual) =>
        set((s) => {
          const routine = s.dailyRoutines.find((r) => r.date === date);
          const newActual = { ...actual, date };
          if (routine) {
            const existing = routine.actuals.findIndex((a) => a.blockId === actual.blockId);
            const updatedActuals =
              existing >= 0
                ? routine.actuals.map((a, i) => (i === existing ? newActual : a))
                : [...routine.actuals, newActual];
            return {
              dailyRoutines: s.dailyRoutines.map((r) =>
                r.date === date ? { ...r, actuals: updatedActuals } : r
              ),
            };
          }
          return {
            dailyRoutines: [...s.dailyRoutines, { date, blockIds: [], actuals: [newActual] }],
          };
        }),

      getActualsForDate: (date) => {
        const { dailyRoutines } = get();
        return dailyRoutines.find((r) => r.date === date)?.actuals ?? [];
      },

      selectBlock: (id) => set({ selectedBlockId: id }),

      skipBlock: (id, date) => {
        const { logActual } = get();
        logActual(date, { blockId: id, notes: 'skipped' });
        set((s) => ({
          blocks: s.blocks.map((b) => (b.id === id ? { ...b, skipped: true } : b)),
        }));
      },
    }),
    { name: 'p360-routine' }
  )
);
