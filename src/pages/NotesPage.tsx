import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Search,
  Plus,
  Pin,
  Trash2,
  Copy,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  CheckSquare,
  ChevronDown,
  FileText,
} from 'lucide-react';
import { format } from 'date-fns';
import { useNotes } from '../stores/useNotes';
import { cn } from '../lib/utils';
import type { Note } from '../lib/types';

// ── Toolbar ──────────────────────────────────────────────────────────────────

const TEXT_COLORS = ['#1c1917', '#dc2626', '#2563eb', '#16a34a', '#9333ea', '#ea580c'];
const HIGHLIGHT_COLORS = ['#fef08a', '#bbf7d0', '#bfdbfe', '#fbcfe8'];
const FONT_SIZES = [
  { label: 'Small', value: '1' },
  { label: 'Normal', value: '3' },
  { label: 'Large', value: '5' },
  { label: 'Title', value: '7' },
];

function ToolbarButton({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={cn(
        'p-1.5 rounded-lg transition-colors text-stone-600 hover:bg-stone-100',
        active && 'bg-stone-200 text-stone-900'
      )}
    >
      {children}
    </button>
  );
}

function EditorToolbar({ editorRef }: { editorRef: React.RefObject<HTMLDivElement | null> }) {
  const [showSizeMenu, setShowSizeMenu] = useState(false);

  const exec = (cmd: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, value);
  };

  const insertChecklist = () => {
    editorRef.current?.focus();
    document.execCommand(
      'insertHTML',
      false,
      '<div style="display:flex;align-items:baseline;gap:6px"><input type="checkbox" style="margin-top:2px;cursor:pointer;accent-color:#f59e0b"> <span>Task</span></div><br>'
    );
  };

  return (
    <div className="flex items-center gap-0.5 px-4 py-2 border-b border-stone-100 bg-white flex-wrap">
      {/* Format */}
      <ToolbarButton onClick={() => exec('bold')} title="Bold (⌘B)">
        <Bold size={14} />
      </ToolbarButton>
      <ToolbarButton onClick={() => exec('italic')} title="Italic (⌘I)">
        <Italic size={14} />
      </ToolbarButton>
      <ToolbarButton onClick={() => exec('underline')} title="Underline (⌘U)">
        <Underline size={14} />
      </ToolbarButton>
      <ToolbarButton onClick={() => exec('strikeThrough')} title="Strikethrough">
        <Strikethrough size={14} />
      </ToolbarButton>

      <div className="w-px h-4 bg-stone-200 mx-1" />

      {/* Lists */}
      <ToolbarButton onClick={() => exec('insertUnorderedList')} title="Bullet list">
        <List size={14} />
      </ToolbarButton>
      <ToolbarButton onClick={() => exec('insertOrderedList')} title="Numbered list">
        <ListOrdered size={14} />
      </ToolbarButton>
      <ToolbarButton onClick={insertChecklist} title="Checklist">
        <CheckSquare size={14} />
      </ToolbarButton>

      <div className="w-px h-4 bg-stone-200 mx-1" />

      {/* Font size */}
      <div className="relative">
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            setShowSizeMenu((v) => !v);
          }}
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-stone-100 text-xs text-stone-600 font-semibold"
        >
          Size <ChevronDown size={11} />
        </button>
        {showSizeMenu && (
          <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-lg border border-stone-100 z-50 py-1 min-w-24">
            {FONT_SIZES.map(({ label, value }) => (
              <button
                key={value}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  exec('fontSize', value);
                  setShowSizeMenu(false);
                }}
                className="w-full text-left px-3 py-1.5 text-xs text-stone-700 hover:bg-stone-50 font-semibold"
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="w-px h-4 bg-stone-200 mx-1" />

      {/* Text colors */}
      {TEXT_COLORS.map((color) => (
        <button
          key={color}
          type="button"
          title="Text color"
          onMouseDown={(e) => {
            e.preventDefault();
            exec('foreColor', color);
          }}
          className="w-5 h-5 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform"
          style={{ backgroundColor: color }}
        />
      ))}

      <div className="w-px h-4 bg-stone-200 mx-1" />

      {/* Highlight colors */}
      {HIGHLIGHT_COLORS.map((color) => (
        <button
          key={color}
          type="button"
          title="Highlight"
          onMouseDown={(e) => {
            e.preventDefault();
            exec('hiliteColor', color);
          }}
          className="w-5 h-5 rounded-sm border border-stone-200 hover:scale-110 transition-transform"
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  );
}

// ── Note list item ────────────────────────────────────────────────────────────

function NoteItem({
  note,
  active,
  onClick,
  onDelete,
  onDuplicate,
  onTogglePin,
}: {
  note: Note;
  active: boolean;
  onClick: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onTogglePin: () => void;
}) {
  const [ctxVisible, setCtxVisible] = useState(false);
  const [ctxPos, setCtxPos] = useState({ x: 0, y: 0 });
  const ctxRef = useRef<HTMLDivElement>(null);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setCtxPos({ x: e.clientX, y: e.clientY });
    setCtxVisible(true);
  };

  useEffect(() => {
    if (!ctxVisible) return;
    const close = () => setCtxVisible(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [ctxVisible]);

  const preview = note.content
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80);

  return (
    <>
      <button
        onClick={onClick}
        onContextMenu={handleContextMenu}
        className={cn(
          'w-full text-left px-4 py-3 border-b border-slate-700 transition-colors',
          active ? 'bg-amber-500/20' : 'hover:bg-slate-700'
        )}
      >
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {note.title || 'New Note'}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              {format(new Date(note.updatedAt), 'MMM d, yyyy')}
            </p>
            {preview && (
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                {preview}
              </p>
            )}
          </div>
          {note.pinned && <Pin size={11} className="text-amber-400 shrink-0 mt-0.5" />}
        </div>
      </button>

      {/* Context menu */}
      {ctxVisible && (
        <div
          ref={ctxRef}
          style={{ position: 'fixed', top: ctxPos.y, left: ctxPos.x, zIndex: 9999 }}
          className="bg-white rounded-xl shadow-xl border border-stone-100 py-1 min-w-36"
        >
          <button
            onClick={() => { onTogglePin(); setCtxVisible(false); }}
            className="w-full text-left px-3 py-2 text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2 font-semibold"
          >
            <Pin size={12} /> {note.pinned ? 'Unpin' : 'Pin'}
          </button>
          <button
            onClick={() => { onDuplicate(); setCtxVisible(false); }}
            className="w-full text-left px-3 py-2 text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2 font-semibold"
          >
            <Copy size={12} /> Duplicate
          </button>
          <button
            onClick={() => { onDelete(); setCtxVisible(false); }}
            className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-semibold"
          >
            <Trash2 size={12} /> Delete
          </button>
        </div>
      )}
    </>
  );
}

// ── Editor panel ──────────────────────────────────────────────────────────────

function NoteEditor({ note }: { note: Note }) {
  const { updateNote } = useNotes();
  const editorRef = useRef<HTMLDivElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync content when note changes
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = note.content;
    }
  }, [note.id]); // Only re-sync on note switch

  const debouncedSave = useCallback(
    (content: string) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        updateNote(note.id, { content });
      }, 500);
    },
    [note.id, updateNote]
  );

  const handleInput = () => {
    if (!editorRef.current) return;
    const content = editorRef.current.innerHTML;
    debouncedSave(content);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateNote(note.id, { title: e.target.value });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
      e.preventDefault();
      document.execCommand('bold');
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 'i') {
      e.preventDefault();
      document.execCommand('italic');
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 'u') {
      e.preventDefault();
      document.execCommand('underline');
    }
  };

  const editedLabel = format(new Date(note.updatedAt), "EEE, MMM d 'at' h:mm a");

  return (
    <div className="flex flex-col h-full bg-white">
      <EditorToolbar editorRef={editorRef} />

      <div
        className="flex-1 overflow-y-auto"
        style={{ padding: '48px 48px 80px' }}
      >
        {/* Title */}
        <input
          value={note.title}
          onChange={handleTitleChange}
          placeholder="New Note"
          className="w-full text-2xl font-extrabold text-stone-900 outline-none bg-transparent mb-1 placeholder:text-stone-300"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        />
        <p className="text-xs text-stone-400 mb-6 font-medium">
          Edited {editedLabel}
        </p>

        {/* Content */}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          className="outline-none min-h-64 text-stone-800"
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 16,
            lineHeight: 1.8,
          }}
          data-placeholder="Start writing..."
        />
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function NotesPage() {
  const {
    notes,
    activeNoteId,
    addNote,
    deleteNote,
    duplicateNote,
    togglePin,
    setActiveNote,
  } = useNotes();

  const [search, setSearch] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const activeNote = notes.find((n) => n.id === activeNoteId);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        addNote();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [addNote]);

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this note?')) deleteNote(id);
  };

  // Sort: pinned first, then by updatedAt desc
  const filtered = notes
    .filter((n) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        n.title.toLowerCase().includes(q) ||
        n.content.replace(/<[^>]+>/g, ' ').toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  return (
    <div className="flex h-full">
      {/* Left panel */}
      <div
        className="flex flex-col shrink-0 border-r border-slate-700"
        style={{ width: 260, backgroundColor: '#0f172a' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
          <h2 className="text-white font-bold text-sm">Notes</h2>
          <button
            onClick={addNote}
            title="New note (⌘N)"
            className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Search */}
        <div className="px-3 py-2 border-b border-slate-700">
          <div className="flex items-center gap-2 bg-slate-700 rounded-lg px-3 py-1.5">
            <Search size={12} className="text-slate-400 shrink-0" />
            <input
              ref={searchRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes..."
              className="flex-1 bg-transparent text-xs text-white placeholder:text-slate-500 outline-none"
            />
          </div>
        </div>

        {/* Note list */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <FileText size={24} className="mx-auto mb-2 opacity-40" />
              <p className="text-xs">
                {search ? 'No matching notes' : 'No notes yet'}
              </p>
              {!search && (
                <button
                  onClick={addNote}
                  className="mt-2 text-xs text-amber-400 hover:text-amber-300 font-semibold"
                >
                  Create your first note
                </button>
              )}
            </div>
          )}
          {filtered.map((note) => (
            <NoteItem
              key={note.id}
              note={note}
              active={note.id === activeNoteId}
              onClick={() => setActiveNote(note.id)}
              onDelete={() => handleDelete(note.id)}
              onDuplicate={() => duplicateNote(note.id)}
              onTogglePin={() => togglePin(note.id)}
            />
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeNote ? (
          <NoteEditor key={activeNote.id} note={activeNote} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-stone-400">
            <div className="text-center">
              <FileText size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">Select a note or create a new one</p>
              <button
                onClick={addNote}
                className="mt-3 text-sm text-amber-500 hover:text-amber-600 font-semibold"
              >
                + New Note (⌘N)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
