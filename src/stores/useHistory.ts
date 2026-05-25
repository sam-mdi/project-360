import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { HistoryEntry } from '../lib/types';
import { useRoutine } from './useRoutine';

interface HistoryStore {
  entries: HistoryEntry[];
  saveDay: (date: string) => void;
  removeEntry: (date: string) => void;
}

export const useHistory = create<HistoryStore>()(
  persist(
    (set) => ({
      entries: [],

      saveDay: (date) => {
        const { getRoutineForDate, getTodayBlocks } = useRoutine.getState();
        const routine = getRoutineForDate(date);
        const dayBlocks = getTodayBlocks(date);
        const actuals = routine.actuals;
        const completedCount = actuals.filter(
          (a) => a.endedAt && a.notes !== 'skipped'
        ).length;
        const completionRate =
          dayBlocks.length > 0 ? completedCount / dayBlocks.length : 0;

        const entry: HistoryEntry = {
          date,
          blocks: dayBlocks,
          actuals,
          completionRate,
        };

        set((s) => ({
          entries: [...s.entries.filter((e) => e.date !== date), entry],
        }));
      },

      removeEntry: (date) =>
        set((s) => ({ entries: s.entries.filter((e) => e.date !== date) })),
    }),
    { name: 'p360-history' }
  )
);
