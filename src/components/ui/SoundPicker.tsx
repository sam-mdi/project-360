import { useState } from 'react';
import { Play, Volume2, VolumeX } from 'lucide-react';
import { cn } from '../../lib/utils';
import { SOUND_OPTIONS, SOUND_LABELS, playSound } from '../../lib/sounds';
import type { NotificationSound } from '../../lib/types';
import { Button } from './Button';
import { Check } from 'lucide-react';

interface SoundPickerProps {
  value: NotificationSound;
  onSelect: (sound: NotificationSound) => void;
  onDone: () => void;
  onCancel: () => void;
}

export function SoundPicker({ value, onSelect, onDone, onCancel }: SoundPickerProps) {
  const [selected, setSelected] = useState<NotificationSound>(value);

  const handleSelect = (sound: NotificationSound) => {
    setSelected(sound);
    onSelect(sound);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2">
        <h2 className="text-lg font-bold text-stone-900">Notification Sound</h2>
        <p className="text-sm text-stone-500 mt-0.5">Preview sounds by tapping Play</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {SOUND_OPTIONS.map((sound) => {
          const { label } = SOUND_LABELS[sound];
          const isSelected = selected === sound;
          const canPlay = sound !== 'none' && sound !== 'vibrate';
          return (
            <div
              key={sound}
              onClick={() => handleSelect(sound)}
              className={cn(
                'flex items-center justify-between px-5 py-3.5 cursor-pointer transition-colors',
                isSelected ? 'bg-amber-50' : 'hover:bg-stone-50'
              )}
            >
              <div className="flex items-center gap-3">
                {sound === 'none' ? <VolumeX size={16} className="text-stone-400" /> : <Volume2 size={16} className={isSelected ? 'text-amber-500' : 'text-stone-400'} />}
                <span className={cn('text-sm font-medium', isSelected ? 'text-amber-700 font-semibold' : 'text-stone-700')}>
                  {label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {canPlay && (
                  <button
                    onClick={(e) => { e.stopPropagation(); playSound(sound); }}
                    className="p-1.5 rounded-full bg-stone-100 hover:bg-amber-100 text-stone-500 hover:text-amber-600 transition-colors"
                  >
                    <Play size={12} />
                  </button>
                )}
                {isSelected && <Check size={16} className="text-amber-500" />}
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-4 py-3 border-t border-stone-100 flex gap-2">
        <Button variant="secondary" className="flex-1" onClick={onCancel}>Cancel</Button>
        <Button className="flex-1" onClick={onDone}>Done</Button>
      </div>
    </div>
  );
}
