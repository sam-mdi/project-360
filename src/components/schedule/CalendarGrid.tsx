
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  startOfWeek, endOfWeek, isSameMonth, isToday
} from 'date-fns';
import { useSchedule } from '../../stores/useSchedule';
import { getColor } from '../../lib/colors';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';
import type { ScheduleEvent } from '../../lib/types';

interface CalendarGridProps {
  currentMonth: Date;
  onDayClick: (date: string) => void;
}

function EventChip({ event }: { event: ScheduleEvent }) {
  const c = getColor(event.color);
  return (
    <div
      className="truncate text-xs font-semibold px-1.5 py-0.5 rounded-md mb-0.5"
      style={{ backgroundColor: c.light, color: c.bg }}
    >
      {event.title}
    </div>
  );
}

export function CalendarGrid({ currentMonth, onDayClick }: CalendarGridProps) {
  const { events, selectedDate } = useSchedule();

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="flex flex-col flex-1">
      {/* Day labels */}
      <div className="grid grid-cols-7 gap-1 px-4 pb-2">
        {DAY_LABELS.map((d) => (
          <div key={d} className="text-center text-xs font-bold text-stone-400 py-1">{d}</div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1 px-4 flex-1">
        {days.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayEvents = events.filter((e) => e.date === dateStr);
          const inMonth = isSameMonth(day, currentMonth);
          const today = isToday(day);
          const selected = selectedDate === dateStr;

          return (
            <motion.div
              key={dateStr}
              onClick={() => onDayClick(dateStr)}
              className={cn(
                'rounded-xl p-1.5 cursor-pointer transition-all min-h-16',
                !inMonth && 'opacity-30',
                today && 'ring-2 ring-amber-400',
                selected && 'bg-amber-50',
                'hover:bg-stone-50'
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className={cn(
                'text-xs font-bold block text-center w-6 h-6 rounded-full flex items-center justify-center mx-auto',
                today ? 'bg-amber-500 text-white' : 'text-stone-600'
              )}>
                {format(day, 'd')}
              </span>
              <div className="mt-1">
                {dayEvents.slice(0, 3).map((ev) => (
                  <EventChip key={ev.id} event={ev} />
                ))}
                {dayEvents.length > 3 && (
                  <span className="text-xs text-stone-400 font-medium">+{dayEvents.length - 3} more</span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
