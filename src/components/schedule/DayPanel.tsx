import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Trash2, Edit2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useSchedule } from '../../stores/useSchedule';
import { getColor } from '../../lib/colors';
import { formatDisplayDate, formatTime } from '../../lib/utils';
import { Button } from '../ui/Button';
import type { ScheduleEvent, BlockColor } from '../../lib/types';
import { BLOCK_COLORS } from '../../lib/colors';

interface DayPanelProps {
  date: string;
  onClose: () => void;
}

interface EventForm {
  title: string;
  startTime: string;
  endTime: string;
  color: BlockColor;
  notes: string;
}

export function DayPanel({ date, onClose }: DayPanelProps) {
  const { getEventsForDate, addEvent, updateEvent, removeEvent } = useSchedule();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const events = getEventsForDate(date);
  const { register, handleSubmit, reset, setValue } = useForm<EventForm>({
    defaultValues: { title: '', startTime: '09:00', endTime: '10:00', color: 'sky', notes: '' },
  });

  const onSubmit = (data: EventForm) => {
    if (editingId) {
      updateEvent(editingId, { ...data, date, icon: 'Calendar', sound: 'ding' });
      setEditingId(null);
    } else {
      addEvent({ ...data, date, icon: 'Calendar', sound: 'ding' });
    }
    reset();
    setShowForm(false);
  };

  const startEdit = (ev: ScheduleEvent) => {
    setEditingId(ev.id);
    setValue('title', ev.title);
    setValue('startTime', ev.startTime);
    setValue('endTime', ev.endTime);
    setValue('color', ev.color);
    setValue('notes', ev.notes ?? '');
    setShowForm(true);
  };

  return (
    <motion.div
      className="w-96 bg-white border-l border-stone-200 flex flex-col h-full"
      initial={{ x: 400 }}
      animate={{ x: 0 }}
      exit={{ x: 400 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100">
        <h3 className="font-bold text-stone-900">{formatDisplayDate(date)}</h3>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-stone-100 transition-colors">
          <X size={16} className="text-stone-500" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {events.length === 0 && !showForm && (
          <div className="text-center py-8 text-stone-400">
            <p className="text-sm">No events this day</p>
          </div>
        )}

        {events.map((ev) => {
          const c = getColor(ev.color);
          return (
            <div
              key={ev.id}
              className="flex items-start gap-3 p-3 rounded-xl mb-2 group"
              style={{ backgroundColor: c.light }}
            >
              <div className="w-1.5 h-12 rounded-full shrink-0 mt-0.5" style={{ backgroundColor: c.bg }} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-stone-900 text-sm truncate">{ev.title}</p>
                <p className="text-xs text-stone-500">{formatTime(ev.startTime)} – {formatTime(ev.endTime)}</p>
                {ev.notes && <p className="text-xs text-stone-400 mt-1 truncate">{ev.notes}</p>}
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => startEdit(ev)}
                  className="p-1.5 rounded-lg hover:bg-white/70 text-stone-400 hover:text-stone-600 transition-colors"
                >
                  <Edit2 size={13} />
                </button>
                <button
                  onClick={() => removeEvent(ev.id)}
                  className="p-1.5 rounded-lg hover:bg-rose-50 text-stone-400 hover:text-rose-500 transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          );
        })}

        {showForm && (
          <form onSubmit={handleSubmit(onSubmit)} className="bg-stone-50 rounded-2xl p-4 space-y-3 mt-2">
            <input
              {...register('title', { required: true })}
              placeholder="Event title"
              className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 text-sm outline-none focus:ring-2 focus:ring-amber-400"
            />
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs text-stone-500 mb-1 block">Start</label>
                <input type="time" {...register('startTime')} className="w-full px-2 py-1.5 rounded-lg bg-white border border-stone-200 text-sm outline-none" />
              </div>
              <div className="flex-1">
                <label className="text-xs text-stone-500 mb-1 block">End</label>
                <input type="time" {...register('endTime')} className="w-full px-2 py-1.5 rounded-lg bg-white border border-stone-200 text-sm outline-none" />
              </div>
            </div>
            <div>
              <label className="text-xs text-stone-500 mb-1 block">Color</label>
              <select {...register('color')} className="w-full px-2 py-1.5 rounded-lg bg-white border border-stone-200 text-sm outline-none">
                {Object.entries(BLOCK_COLORS).map(([key, c]) => (
                  <option key={key} value={key}>{c.name}</option>
                ))}
              </select>
            </div>
            <textarea
              {...register('notes')}
              placeholder="Notes (optional)"
              rows={2}
              className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 text-sm outline-none resize-none focus:ring-2 focus:ring-amber-400"
            />
            <div className="flex gap-2">
              <Button type="button" variant="secondary" size="sm" className="flex-1" onClick={() => { setShowForm(false); setEditingId(null); reset(); }}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="flex-1">
                {editingId ? 'Save' : 'Add Event'}
              </Button>
            </div>
          </form>
        )}
      </div>

      {!showForm && (
        <div className="p-4 border-t border-stone-100">
          <Button className="w-full" onClick={() => setShowForm(true)}>
            <Plus size={16} /> Add Event
          </Button>
        </div>
      )}
    </motion.div>
  );
}
