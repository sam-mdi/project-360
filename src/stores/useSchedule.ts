import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ScheduleEvent } from '../lib/types';
import { generateId } from '../lib/utils';

interface ScheduleStore {
  events: ScheduleEvent[];
  selectedDate: string | null;
  viewMode: 'month' | 'week';

  addEvent: (event: Omit<ScheduleEvent, 'id'>) => string;
  updateEvent: (id: string, patch: Partial<ScheduleEvent>) => void;
  removeEvent: (id: string) => void;
  moveEvent: (id: string, newDate: string) => void;

  getEventsForDate: (date: string) => ScheduleEvent[];
  getEventsForMonth: (year: number, month: number) => ScheduleEvent[];

  setSelectedDate: (date: string | null) => void;
  setViewMode: (mode: 'month' | 'week') => void;
}

export const useSchedule = create<ScheduleStore>()(
  persist(
    (set, get) => ({
      events: [],
      selectedDate: null,
      viewMode: 'month',

      addEvent: (event) => {
        const id = generateId();
        set((s) => ({ events: [...s.events, { ...event, id }] }));
        return id;
      },

      updateEvent: (id, patch) =>
        set((s) => ({ events: s.events.map((e) => (e.id === id ? { ...e, ...patch } : e)) })),

      removeEvent: (id) =>
        set((s) => ({ events: s.events.filter((e) => e.id !== id) })),

      moveEvent: (id, newDate) =>
        set((s) => ({ events: s.events.map((e) => (e.id === id ? { ...e, date: newDate } : e)) })),

      getEventsForDate: (date) => get().events.filter((e) => e.date === date),

      getEventsForMonth: (year, month) =>
        get().events.filter((e) => {
          const d = new Date(e.date + 'T00:00:00');
          return d.getFullYear() === year && d.getMonth() === month;
        }),

      setSelectedDate: (date) => set({ selectedDate: date }),
      setViewMode: (mode) => set({ viewMode: mode }),
    }),
    { name: 'p360-schedule' }
  )
);
