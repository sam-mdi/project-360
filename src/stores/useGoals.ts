import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId } from '../lib/utils';

export interface Milestone {
  id: string;
  label: string;
  target: string; // date string
  progress: number; // 0-1
  weeklyIntentions: string[];
}

interface GoalsStore {
  annualGoal: string;
  milestones: Milestone[];
  currentWeekIntention: string;

  setAnnualGoal: (goal: string) => void;
  setWeekIntention: (text: string) => void;
  addMilestone: (label: string, target: string) => string;
  updateMilestone: (id: string, patch: Partial<Milestone>) => void;
  removeMilestone: (id: string) => void;
  setMilestonesFromAI: (milestones: Omit<Milestone, 'id'>[]) => void;
}

export const useGoals = create<GoalsStore>()(
  persist(
    (set) => ({
      annualGoal: '',
      milestones: [],
      currentWeekIntention: '',

      setAnnualGoal: (goal) => set({ annualGoal: goal }),
      setWeekIntention: (text) => set({ currentWeekIntention: text }),

      addMilestone: (label, target) => {
        const id = generateId();
        set((s) => ({
          milestones: [
            ...s.milestones,
            { id, label, target, progress: 0, weeklyIntentions: [] },
          ],
        }));
        return id;
      },

      updateMilestone: (id, patch) =>
        set((s) => ({
          milestones: s.milestones.map((m) =>
            m.id === id ? { ...m, ...patch } : m
          ),
        })),

      removeMilestone: (id) =>
        set((s) => ({
          milestones: s.milestones.filter((m) => m.id !== id),
        })),

      setMilestonesFromAI: (milestones) =>
        set({
          milestones: milestones.map((m) => ({ ...m, id: generateId() })),
        }),
    }),
    { name: 'p360-goals' }
  )
);
