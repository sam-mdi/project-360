import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId } from '../lib/utils';

export interface Task {
  id: string;
  title: string;
  done: boolean;
  date: string;
  priority: 'low' | 'medium' | 'high';
}

interface TasksStore {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id'>) => string;
  updateTask: (id: string, patch: Partial<Task>) => void;
  toggleTask: (id: string) => void;
  removeTask: (id: string) => void;
  getTasksForDate: (date: string) => Task[];
}

export const useTasks = create<TasksStore>()(
  persist(
    (set, get) => ({
      tasks: [],
      addTask: (task) => {
        const id = generateId();
        set((s) => ({ tasks: [...s.tasks, { ...task, id }] }));
        return id;
      },
      updateTask: (id, patch) =>
        set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),
      toggleTask: (id) =>
        set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) })),
      removeTask: (id) =>
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),
      getTasksForDate: (date) => get().tasks.filter((t) => t.date === date),
    }),
    { name: 'p360-tasks' }
  )
);
