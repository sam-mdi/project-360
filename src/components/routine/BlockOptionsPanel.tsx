
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, SkipForward, Move, ChevronUp, ChevronDown,
  Clock, RefreshCw, BookOpen, X, Trash2
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { TimeBlock } from '../../lib/types';
import { formatTime, formatDuration } from '../../lib/utils';
import { getColor } from '../../lib/colors';

interface BlockOptionsPanelProps {
  block: TimeBlock | null;
  onClose: () => void;
  onSkip: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onViewPlan: () => void;
}

const OPTIONS = [
  { id: 'notes', icon: FileText, label: 'Notes' },
  { id: 'skip', icon: SkipForward, label: 'Skip' },
  { id: 'move', icon: Move, label: 'Move' },
  { id: 'move-start', icon: ChevronUp, label: 'Move Start' },
  { id: 'move-end', icon: ChevronDown, label: 'Move End' },
  { id: 'duration', icon: Clock, label: 'Duration' },
  { id: 'reset', icon: RefreshCw, label: 'Reset' },
  { id: 'view-plan', icon: BookOpen, label: 'View Plan' },
  { id: 'delete', icon: Trash2, label: 'Delete', danger: true },
];

export function BlockOptionsPanel({ block, onClose, onSkip, onEdit, onDelete, onViewPlan }: BlockOptionsPanelProps) {
  if (!block) return null;
  const c = getColor(block.color);

  const handleOption = (id: string) => {
    if (id === 'skip') { onSkip(); onClose(); }
    else if (id === 'delete') { onDelete(); onClose(); }
    else if (id === 'view-plan') { onViewPlan(); onClose(); }
    else if (id === 'notes' || id === 'duration' || id === 'move' || id === 'move-start' || id === 'move-end' || id === 'reset') {
      onEdit();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-40 flex flex-col justify-end"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
        <motion.div
          className="relative bg-white rounded-t-3xl shadow-2xl z-10 max-h-[80vh] overflow-y-auto"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 400, damping: 35 }}
        >
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 bg-stone-200 rounded-full" />
          </div>

          {/* Block header */}
          <div
            className="mx-4 my-3 rounded-2xl p-4 flex items-center gap-3"
            style={{ backgroundColor: c.bg }}
          >
            <div>
              <p className="font-bold text-base" style={{ color: c.text }}>{block.label}</p>
              <p className="text-xs opacity-70" style={{ color: c.text }}>
                {formatTime(block.startTime)} · {formatDuration(block.duration)}
              </p>
            </div>
          </div>

          {/* Options */}
          <div className="pb-4">
            {OPTIONS.map(({ id, icon: Icon, label, danger }) => (
              <button
                key={id}
                onClick={() => handleOption(id)}
                className={cn(
                  'w-full flex items-center gap-4 px-6 py-4 text-left hover:bg-stone-50 transition-colors',
                  danger ? 'text-rose-500' : 'text-stone-700'
                )}
              >
                <Icon size={20} className={danger ? 'text-rose-400' : 'text-stone-400'} />
                <span className="text-sm font-medium">{label}</span>
              </button>
            ))}
          </div>

          {/* Deselect */}
          <div className="px-4 pb-6">
            <button
              onClick={onClose}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-stone-100 hover:bg-stone-200 transition-colors text-stone-600 font-semibold text-sm"
            >
              <X size={16} />
              Deselect
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
