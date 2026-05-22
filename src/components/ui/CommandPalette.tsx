import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, Clock, LayoutGrid, BarChart2, Calendar, Settings } from 'lucide-react';

interface Command {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
  onOpenSettings: () => void;
  onAddBlock: () => void;
}

export function CommandPalette({ open, onClose, onNavigate, onOpenSettings, onAddBlock }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const commands: Command[] = [
    { id: 'routine', label: 'Go to Routine', description: 'View your daily timeline', icon: <Clock size={16} />, action: () => { onNavigate('routine'); onClose(); } },
    { id: 'plan', label: 'Go to Plan', description: 'Manage your plans', icon: <LayoutGrid size={16} />, action: () => { onNavigate('plan'); onClose(); } },
    { id: 'progress', label: 'Go to Progress', description: 'View stats and charts', icon: <BarChart2 size={16} />, action: () => { onNavigate('progress'); onClose(); } },
    { id: 'schedule', label: 'Go to Schedule', description: 'View your calendar', icon: <Calendar size={16} />, action: () => { onNavigate('schedule'); onClose(); } },
    { id: 'add-block', label: 'Add Time Block', description: 'Create a new routine block', icon: <Clock size={16} />, action: () => { onNavigate('routine'); onAddBlock(); onClose(); } },
    { id: 'settings', label: 'Open Settings', description: 'Configure preferences', icon: <Settings size={16} />, action: () => { onOpenSettings(); onClose(); } },
  ];

  const filtered = commands.filter(
    (c) => !query || c.label.toLowerCase().includes(query.toLowerCase()) || c.description.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-start justify-center pt-24"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden z-10"
            initial={{ scale: 0.95, y: -10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: -10 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-stone-100">
              <Search size={16} className="text-stone-400" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type a command..."
                className="flex-1 text-sm text-stone-900 outline-none font-medium placeholder:text-stone-400"
                onKeyDown={(e) => { if (e.key === 'Escape') onClose(); if (e.key === 'Enter' && filtered.length > 0) filtered[0].action(); }}
              />
              <kbd className="text-xs text-stone-300 bg-stone-100 px-1.5 py-0.5 rounded font-mono">esc</kbd>
            </div>
            <div className="max-h-72 overflow-y-auto">
              {filtered.map((cmd) => (
                <button
                  key={cmd.id}
                  onClick={cmd.action}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-amber-50 transition-colors text-left group"
                >
                  <div className="w-8 h-8 rounded-lg bg-stone-100 group-hover:bg-amber-100 flex items-center justify-center text-stone-500 group-hover:text-amber-600 transition-colors">
                    {cmd.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-stone-800">{cmd.label}</p>
                    <p className="text-xs text-stone-400">{cmd.description}</p>
                  </div>
                </button>
              ))}
              {filtered.length === 0 && (
                <div className="py-6 text-center text-stone-400 text-sm">No commands found</div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
