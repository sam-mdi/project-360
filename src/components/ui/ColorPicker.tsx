import { useState } from 'react';
import { cn } from '../../lib/utils';
import { BLOCK_COLORS } from '../../lib/colors';
import type { BlockColor } from '../../lib/types';
import { Button } from './Button';
import { Check } from 'lucide-react';

interface ColorPickerProps {
  value?: BlockColor;
  onSelect: (color: BlockColor) => void;
  onCancel: () => void;
}

const COLOR_KEYS = Object.keys(BLOCK_COLORS) as BlockColor[];

export function ColorPicker({ value, onSelect, onCancel }: ColorPickerProps) {
  const [selected, setSelected] = useState<BlockColor>(value ?? 'sky');

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2">
        <h2 className="text-lg font-bold text-stone-900">Pick a Color</h2>
        <p className="text-sm text-stone-500 mt-0.5">Tap the color name to select it</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {COLOR_KEYS.map((colorKey) => {
          const c = BLOCK_COLORS[colorKey];
          const isSelected = selected === colorKey;
          return (
            <button
              key={colorKey}
              onClick={() => setSelected(colorKey)}
              className={cn(
                'w-full flex items-center justify-between px-5 py-3.5 transition-all',
                isSelected ? 'bg-white' : 'hover:bg-stone-50'
              )}
            >
              <span
                className="text-base font-bold"
                style={{ color: c.bg }}
              >
                {c.name}
              </span>
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full shadow-sm"
                  style={{ backgroundColor: c.bg }}
                />
                {isSelected && <Check size={16} className="text-emerald-500" />}
              </div>
            </button>
          );
        })}
      </div>

      <div className="px-4 py-3 border-t border-stone-100 flex gap-2">
        <Button variant="secondary" className="flex-1" onClick={onCancel}>Cancel</Button>
        <Button className="flex-1" onClick={() => onSelect(selected)}>Next</Button>
      </div>
    </div>
  );
}
