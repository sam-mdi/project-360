import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconPicker } from '../ui/IconPicker';
import { ColorPicker } from '../ui/ColorPicker';
import { CircularTimePicker } from '../ui/CircularTimePicker';
import { SoundPicker } from '../ui/SoundPicker';
import { Button } from '../ui/Button';
import type { BlockColor, NotificationSound, TimeBlock, EnergyLevel } from '../../lib/types';
import { Minus, Plus, Zap } from 'lucide-react';
import { nowTime } from '../../lib/utils';

type Step = 'icon' | 'color' | 'time' | 'duration' | 'energy' | 'sound' | 'recurrence';

interface AddBlockWizardProps {
  onSave: (block: Omit<TimeBlock, 'id'>) => void;
  onCancel: () => void;
  initial?: Partial<TimeBlock>;
}

const STEP_ORDER: Step[] = ['icon', 'color', 'time', 'duration', 'energy', 'sound', 'recurrence'];


const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function AddBlockWizard({ onSave, onCancel, initial }: AddBlockWizardProps) {
  const [step, setStep] = useState<Step>('icon');
  const [icon, setIcon] = useState(initial?.icon ?? 'Star');
  const [color, setColor] = useState<BlockColor>(initial?.color ?? 'sky');
  const [startTime, setStartTime] = useState(initial?.startTime ?? nowTime());
  const [duration, setDuration] = useState(initial?.duration ?? 30);
  const [sound, setSound] = useState<NotificationSound>(initial?.sound ?? 'ding');
  const [label, setLabel] = useState(initial?.label ?? '');
  const [selectedDays, setSelectedDays] = useState<number[]>(initial?.recurrence?.days ?? [0, 1, 2, 3, 4, 5, 6]);
  const [everyN, setEveryN] = useState(initial?.recurrence?.every ?? 1);
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel>(initial?.energyLevel ?? 'medium');

  const stepIndex = STEP_ORDER.indexOf(step);

  const next = () => {
    const nextIdx = stepIndex + 1;
    if (nextIdx < STEP_ORDER.length) setStep(STEP_ORDER[nextIdx]);
    else handleSave();
  };

  const prev = () => {
    if (stepIndex > 0) setStep(STEP_ORDER[stepIndex - 1]);
  };

  const handleSave = () => {
    onSave({
      label: label || 'New Block',
      icon,
      color,
      startTime,
      duration,
      sound,
      recurrence: { type: 'weekly', days: selectedDays, every: everyN },
      notes: '',
      energyLevel,
    });
  };

  const toggleDay = (i: number) => {
    setSelectedDays((prev) =>
      prev.includes(i) ? prev.filter((d) => d !== i) : [...prev, i]
    );
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Step indicator */}
      <div className="flex items-center gap-1.5 px-5 pt-4 pb-2">
        {STEP_ORDER.map((s, i) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full transition-all ${i <= stepIndex ? 'bg-amber-500' : 'bg-stone-200'}`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          className="flex-1 flex flex-col overflow-hidden"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.2 }}
        >
          {step === 'icon' && (
            <IconPicker
              value={icon}
              onSelect={(i) => { setIcon(i); next(); }}
              onCancel={onCancel}
            />
          )}

          {step === 'color' && (
            <ColorPicker
              value={color}
              onSelect={(c) => { setColor(c); next(); }}
              onCancel={prev}
            />
          )}

          {step === 'time' && (
            <div className="flex flex-col h-full">
              <div className="px-4 pt-2 pb-2">
                <input
                  className="w-full px-3 py-2 rounded-xl bg-stone-100 text-base font-semibold outline-none focus:ring-2 focus:ring-amber-400"
                  placeholder="Block name (e.g. Morning Run)"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <CircularTimePicker
                  value={startTime}
                  onChange={setStartTime}
                  onDone={next}
                  onCancel={prev}
                />
              </div>
            </div>
          )}

          {step === 'duration' && (
            <div className="flex flex-col items-center justify-center flex-1 px-6 gap-6">
              <h2 className="text-lg font-bold text-stone-900">Set Duration</h2>
              <div className="flex items-center gap-6">
                <button
                  onClick={() => setDuration((d) => Math.max(5, d - 5))}
                  className="w-12 h-12 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center transition-colors"
                >
                  <Minus size={20} className="text-stone-600" />
                </button>
                <div className="text-center">
                  <span className="text-5xl font-bold text-amber-500">{duration}</span>
                  <p className="text-stone-500 text-sm font-medium mt-1">minutes</p>
                </div>
                <button
                  onClick={() => setDuration((d) => d + 5)}
                  className="w-12 h-12 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center transition-colors"
                >
                  <Plus size={20} className="text-stone-600" />
                </button>
              </div>
              <p className="text-sm text-stone-400">{Math.floor(duration / 60)}h {duration % 60}m</p>
              <div className="flex gap-2 w-full">
                <Button variant="secondary" className="flex-1" onClick={prev}>Back</Button>
                <Button className="flex-1" onClick={next}>Next</Button>
              </div>
            </div>
          )}

          {step === 'energy' && (
            <div className="flex flex-col items-center justify-center flex-1 px-6 gap-6">
              <div className="flex items-center gap-2">
                <Zap size={20} className="text-amber-500" />
                <h2 className="text-lg font-bold text-stone-900">Energy Level</h2>
              </div>
              <p className="text-sm text-stone-400 text-center">How much energy does this block require?</p>
              <div className="flex flex-col gap-3 w-full">
                {([
                  { value: 'high' as EnergyLevel, label: 'High Energy', emoji: '⚡', desc: 'Intense focus, exercise, deep work', bg: 'bg-rose-50', border: 'border-rose-300', text: 'text-rose-700' },
                  { value: 'medium' as EnergyLevel, label: 'Medium Energy', emoji: '🔥', desc: 'Meetings, creative work, learning', bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-700' },
                  { value: 'low' as EnergyLevel, label: 'Low Energy', emoji: '🌿', desc: 'Admin, email, light tasks, rest', bg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-700' },
                ] as const).map(({ value, label, emoji, desc, bg, border, text }) => (
                  <button
                    key={value}
                    onClick={() => { setEnergyLevel(value); next(); }}
                    className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                      energyLevel === value ? `${bg} ${border}` : 'bg-white border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <span className="text-2xl">{emoji}</span>
                    <div>
                      <p className={`text-sm font-bold ${energyLevel === value ? text : 'text-stone-800'}`}>{label}</p>
                      <p className="text-xs text-stone-400">{desc}</p>
                    </div>
                  </button>
                ))}
              </div>
              <Button variant="secondary" className="w-full" onClick={prev}>Back</Button>
            </div>
          )}

          {step === 'sound' && (
            <SoundPicker value={sound} onSelect={setSound} onDone={next} onCancel={prev} />
          )}

          {step === 'recurrence' && (
            <div className="flex flex-col px-6 pt-4 gap-6 flex-1">
              <h2 className="text-lg font-bold text-stone-900">Repeat Schedule</h2>

              <div>
                <p className="text-sm font-semibold text-stone-600 mb-3">Days of the week</p>
                <div className="flex gap-2">
                  {DAYS.map((day, i) => (
                    <button
                      key={i}
                      onClick={() => toggleDay(i)}
                      className={`w-10 h-10 rounded-full text-sm font-bold transition-colors ${
                        selectedDays.includes(i)
                          ? 'bg-amber-500 text-white'
                          : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-stone-600 mb-3">Every N days</p>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setEveryN((n) => Math.max(1, n - 1))}
                    className="w-10 h-10 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="text-2xl font-bold text-stone-800 w-8 text-center">{everyN}</span>
                  <button
                    onClick={() => setEveryN((n) => n + 1)}
                    className="w-10 h-10 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <div className="flex gap-2 mt-auto pb-4">
                <Button variant="secondary" className="flex-1" onClick={prev}>Back</Button>
                <Button className="flex-1" onClick={handleSave}>
                  {initial ? 'Save Changes' : 'Add Block'}
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
