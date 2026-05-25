import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, RefreshCw } from 'lucide-react';
import { WheelOfLife } from '../progress/WheelOfLife';
import type { WheelOfLifeValues } from '../../lib/types';
import { format } from 'date-fns';

const DEFAULT: WheelOfLifeValues = {
  health: 5, career: 5, money: 5, love: 5,
  family: 5, friends: 5, fun: 5, spirituality: 5,
};

const STORAGE_KEY = 'p360-wheel-monthly';

interface WheelEntry {
  date: string;
  values: WheelOfLifeValues;
}

interface WheelOfLifeModalProps {
  onClose: () => void;
}

export function WheelOfLifeModal({ onClose }: WheelOfLifeModalProps) {
  const thisMonth = format(new Date(), 'yyyy-MM');
  const stored: WheelEntry[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  const lastEntry = stored[stored.length - 1];

  const [values, setValues] = useState<WheelOfLifeValues>(lastEntry?.values ?? DEFAULT);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    const entry: WheelEntry = { date: format(new Date(), 'yyyy-MM-dd'), values };
    const updated = [...stored.filter((e) => !e.date.startsWith(thisMonth)), entry];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setSaved(true);
    setTimeout(onClose, 1200);
  };

  const prevMonth = stored.filter((e) => !e.date.startsWith(thisMonth)).slice(-1)[0];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="bg-white rounded-t-3xl w-full max-w-lg shadow-2xl px-6 pt-6 pb-8 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-stone-900">Wheel of Life</h2>
            <p className="text-xs text-stone-400">Rate each life area 1–10 for this month</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-stone-100 text-stone-400">
            <X size={16} />
          </button>
        </div>

        <WheelOfLife
          values={values}
          compare={prevMonth?.values}
          onChange={setValues}
          editable
        />

        {prevMonth && (
          <p className="text-xs text-stone-400 text-center mt-1">
            Dashed line shows last month
          </p>
        )}

        <div className="flex gap-3 mt-4">
          <button
            onClick={() => setValues(DEFAULT)}
            className="p-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-500 transition-colors"
            title="Reset"
          >
            <RefreshCw size={15} />
          </button>
          <button
            onClick={handleSave}
            disabled={saved}
            className="flex-1 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-white font-bold text-sm transition-colors disabled:opacity-70"
          >
            {saved ? '✓ Saved!' : 'Save Check-in'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
