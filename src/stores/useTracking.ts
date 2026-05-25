import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { format } from 'date-fns';

export interface MoodLog { date: string; mood: 1|2|3|4|5; note: string }
export interface WaterLog { date: string; glasses: number }
export interface StepsLog { date: string; steps: number }
export interface DailyScore { date: string; score: number }
export interface PomodoroSession { date: string; blockId: string; blockName: string; count: number; totalMinutes: number }

interface TrackingStore {
  moods: MoodLog[];
  water: WaterLog[];
  steps: StepsLog[];
  dailyScores: DailyScore[];
  pomodoroSessions: PomodoroSession[];
  moodDismissedDate: string;

  logMood: (mood: 1|2|3|4|5, note: string) => void;
  dismissMood: () => void;
  getMoodForDate: (date: string) => MoodLog | undefined;

  setWater: (date: string, glasses: number) => void;
  getWater: (date: string) => number;

  setSteps: (date: string, steps: number) => void;
  getSteps: (date: string) => number;

  logDailyScore: (date: string, score: number) => void;
  getDailyScore: (date: string) => number;

  addPomodoroSession: (date: string, blockId: string, blockName: string) => void;
  getPomodoroCount: (date: string) => number;
  getWeeklyFocusMinutes: () => number;
}

export const useTracking = create<TrackingStore>()(
  persist(
    (set, get) => ({
      moods: [],
      water: [],
      steps: [],
      dailyScores: [],
      pomodoroSessions: [],
      moodDismissedDate: '',

      logMood: (mood, note) => {
        const date = format(new Date(), 'yyyy-MM-dd');
        set((s) => ({
          moods: [...s.moods.filter((m) => m.date !== date), { date, mood, note }],
          moodDismissedDate: date,
        }));
      },

      dismissMood: () => {
        set({ moodDismissedDate: format(new Date(), 'yyyy-MM-dd') });
      },

      getMoodForDate: (date) => get().moods.find((m) => m.date === date),

      setWater: (date, glasses) =>
        set((s) => ({
          water: [...s.water.filter((w) => w.date !== date), { date, glasses }],
        })),

      getWater: (date) => get().water.find((w) => w.date === date)?.glasses ?? 0,

      setSteps: (date, steps) =>
        set((s) => ({
          steps: [...s.steps.filter((s2) => s2.date !== date), { date, steps }],
        })),

      getSteps: (date) => get().steps.find((s) => s.date === date)?.steps ?? 0,

      logDailyScore: (date, score) =>
        set((s) => ({
          dailyScores: [...s.dailyScores.filter((d) => d.date !== date), { date, score }],
        })),

      getDailyScore: (date) => get().dailyScores.find((d) => d.date === date)?.score ?? 0,

      addPomodoroSession: (date, blockId, blockName) =>
        set((s) => {
          const existing = s.pomodoroSessions.find(
            (p) => p.date === date && p.blockId === blockId
          );
          if (existing) {
            return {
              pomodoroSessions: s.pomodoroSessions.map((p) =>
                p.date === date && p.blockId === blockId
                  ? { ...p, count: p.count + 1, totalMinutes: p.totalMinutes + 25 }
                  : p
              ),
            };
          }
          return {
            pomodoroSessions: [
              ...s.pomodoroSessions,
              { date, blockId, blockName, count: 1, totalMinutes: 25 },
            ],
          };
        }),

      getPomodoroCount: (date) =>
        get().pomodoroSessions
          .filter((p) => p.date === date)
          .reduce((sum, p) => sum + p.count, 0),

      getWeeklyFocusMinutes: () => {
        const today = new Date();
        const days = Array.from({ length: 7 }, (_, i) =>
          format(new Date(today.getTime() - i * 86400000), 'yyyy-MM-dd')
        );
        return get()
          .pomodoroSessions.filter((p) => days.includes(p.date))
          .reduce((sum, p) => sum + p.totalMinutes, 0);
      },
    }),
    { name: 'p360-tracking' }
  )
);
