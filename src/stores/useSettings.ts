import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Settings } from '../lib/types';

interface SettingsStore extends Settings {
  update: (patch: Partial<Settings>) => void;
  reset: () => void;
}

const defaults: Settings = {
  firstName: 'Friend',
  accentColor: 'amber',
  notificationsEnabled: false,
  defaultSound: 'ding',
  showCompletedBlocks: true,
};

export const useSettings = create<SettingsStore>()(
  persist(
    (set) => ({
      ...defaults,
      update: (patch) => set((s) => ({ ...s, ...patch })),
      reset: () => set(defaults),
    }),
    { name: 'p360-settings' }
  )
);
