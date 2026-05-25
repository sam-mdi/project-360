import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId } from '../lib/utils';
import type { Note } from '../lib/types';

interface NotesStore {
  notes: Note[];
  activeNoteId: string | null;
  addNote: () => string;
  updateNote: (id: string, patch: Partial<Omit<Note, 'id' | 'createdAt'>>) => void;
  deleteNote: (id: string) => void;
  duplicateNote: (id: string) => string;
  togglePin: (id: string) => void;
  setActiveNote: (id: string | null) => void;
  getActiveNote: () => Note | undefined;
}

export const useNotes = create<NotesStore>()(
  persist(
    (set, get) => ({
      notes: [],
      activeNoteId: null,

      addNote: () => {
        const id = generateId();
        const now = new Date().toISOString();
        const note: Note = {
          id,
          title: '',
          content: '',
          createdAt: now,
          updatedAt: now,
          pinned: false,
          color: '#ffffff',
        };
        set((s) => ({ notes: [note, ...s.notes], activeNoteId: id }));
        return id;
      },

      updateNote: (id, patch) =>
        set((s) => ({
          notes: s.notes.map((n) =>
            n.id === id
              ? { ...n, ...patch, updatedAt: new Date().toISOString() }
              : n
          ),
        })),

      deleteNote: (id) =>
        set((s) => {
          const remaining = s.notes.filter((n) => n.id !== id);
          return {
            notes: remaining,
            activeNoteId:
              s.activeNoteId === id
                ? (remaining[0]?.id ?? null)
                : s.activeNoteId,
          };
        }),

      duplicateNote: (id) => {
        const note = get().notes.find((n) => n.id === id);
        if (!note) return '';
        const newId = generateId();
        const now = new Date().toISOString();
        const copy: Note = {
          ...note,
          id: newId,
          title: note.title + ' (copy)',
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({ notes: [copy, ...s.notes], activeNoteId: newId }));
        return newId;
      },

      togglePin: (id) =>
        set((s) => ({
          notes: s.notes.map((n) =>
            n.id === id ? { ...n, pinned: !n.pinned } : n
          ),
        })),

      setActiveNote: (id) => set({ activeNoteId: id }),

      getActiveNote: () => {
        const { notes, activeNoteId } = get();
        return notes.find((n) => n.id === activeNoteId);
      },
    }),
    { name: 'project360-notes' }
  )
);
