import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useRoutine } from '../../stores/useRoutine';
import { getColor } from '../../lib/colors';
import { formatTime, formatDuration } from '../../lib/utils';
import { Button } from '../ui/Button';
import { InlineEdit } from '../ui/InlineEdit';
import type { Sequence } from '../../lib/types';

interface SequenceEditorProps {
  sequence?: Sequence;
  onSave: (seq: Omit<Sequence, 'id'>) => void;
  onCancel: () => void;
}

export function SequenceEditor({ sequence, onSave, onCancel }: SequenceEditorProps) {
  const { blocks } = useRoutine();
  const [name, setName] = useState(sequence?.name ?? 'New Sequence');
  const [blockIds, setBlockIds] = useState<string[]>(sequence?.blockIds ?? []);

  const selectedBlocks = blockIds.map((id) => blocks.find((b) => b.id === id)).filter(Boolean);

  return (
    <div className="flex flex-col h-full px-4 pt-4 pb-2">
      <div className="mb-4">
        <InlineEdit
          value={name}
          onChange={setName}
          className="text-xl font-bold text-stone-900"
          placeholder="Sequence name"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {selectedBlocks.length === 0 && (
          <div className="text-center py-8 text-stone-400 text-sm">No blocks added yet</div>
        )}
        {selectedBlocks.map((block) => {
          if (!block) return null;
          const c = getColor(block.color);
          return (
            <div
              key={block.id}
              className="flex items-center gap-3 p-3 rounded-xl mb-2"
              style={{ backgroundColor: c.light }}
            >
              <div className="w-3 h-8 rounded-full" style={{ backgroundColor: c.bg }} />
              <div className="flex-1">
                <p className="font-semibold text-sm text-stone-800">{block.label}</p>
                <p className="text-xs text-stone-500">
                  {formatTime(block.startTime)} · {formatDuration(block.duration)}
                </p>
              </div>
              <button
                onClick={() => setBlockIds((ids) => ids.filter((id) => id !== block.id))}
                className="p-1.5 rounded-lg hover:bg-rose-100 text-stone-400 hover:text-rose-500 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          );
        })}

        {/* Add block from existing */}
        <div className="mt-2">
          <p className="text-xs font-semibold text-stone-500 mb-2 uppercase tracking-wide">Add from blocks</p>
          {blocks
            .filter((b) => !blockIds.includes(b.id))
            .map((block) => {
              const c = getColor(block.color);
              return (
                <button
                  key={block.id}
                  onClick={() => setBlockIds((ids) => [...ids, block.id])}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl mb-1.5 hover:bg-stone-50 transition-colors"
                >
                  <div className="w-2 h-6 rounded-full" style={{ backgroundColor: c.bg }} />
                  <span className="text-sm text-stone-700">{block.label}</span>
                  <Plus size={14} className="ml-auto text-stone-400" />
                </button>
              );
            })}
        </div>
      </div>

      <div className="flex gap-2 pt-3 border-t border-stone-100">
        <Button variant="secondary" className="flex-1" onClick={onCancel}>Cancel</Button>
        <Button className="flex-1" onClick={() => onSave({ name, blockIds, color: 'sky' })}>
          Save Sequence
        </Button>
      </div>
    </div>
  );
}
