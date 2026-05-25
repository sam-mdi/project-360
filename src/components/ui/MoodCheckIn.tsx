import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTracking } from '../../stores/useTracking';
import { format } from 'date-fns';

const EMOJIS: { mood: 1|2|3|4|5; emoji: string; label: string }[] = [
  { mood: 1, emoji: '😫', label: 'Rough' },
  { mood: 2, emoji: '😕', label: 'Meh' },
  { mood: 3, emoji: '😐', label: 'Okay' },
  { mood: 4, emoji: '😊', label: 'Good' },
  { mood: 5, emoji: '😄', label: 'Great' },
];

export function MoodCheckIn() {
  const { logMood, dismissMood, moodDismissedDate, getMoodForDate } = useTracking();
  const today = format(new Date(), 'yyyy-MM-dd');
  const [selected, setSelected] = useState<1|2|3|4|5 | null>(null);
  const [note, setNote] = useState('');

  const alreadyDone = moodDismissedDate === today || getMoodForDate(today) !== undefined;
  if (alreadyDone) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 120, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 120, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-stone-200 shadow-2xl rounded-t-3xl px-6 py-5"
      >
        <div className="max-w-sm mx-auto">
          <p className="text-base font-bold text-stone-900 text-center mb-4">
            How are you feeling today?
          </p>

          <div className="flex justify-center gap-3 mb-4">
            {EMOJIS.map(({ mood, emoji, label }) => (
              <button
                key={mood}
                onClick={() => setSelected(mood)}
                className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all ${
                  selected === mood
                    ? 'bg-amber-50 ring-2 ring-amber-400 scale-110'
                    : 'hover:bg-stone-50'
                }`}
              >
                <span className="text-3xl">{emoji}</span>
                <span className="text-xs font-semibold text-stone-500">{label}</span>
              </button>
            ))}
          </div>

          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Anything on your mind? (optional)"
            className="w-full px-3 py-2 rounded-xl bg-stone-100 text-sm outline-none mb-3 focus:ring-2 focus:ring-amber-300"
          />

          <div className="flex gap-2">
            <button
              onClick={() => dismissMood()}
              className="flex-1 py-2 rounded-xl text-sm font-semibold text-stone-400 hover:text-stone-600 transition-colors"
            >
              Skip today
            </button>
            <button
              onClick={() => { if (selected) logMood(selected, note); }}
              disabled={!selected}
              className="flex-1 py-2 rounded-xl bg-amber-500 text-white text-sm font-bold disabled:opacity-40 hover:bg-amber-400 transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
