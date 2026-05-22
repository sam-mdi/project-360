import { useState } from 'react';
import { format, addMonths, subMonths } from 'date-fns';
import { AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSchedule } from '../stores/useSchedule';
import { CalendarGrid } from '../components/schedule/CalendarGrid';
import { DayPanel } from '../components/schedule/DayPanel';

export function SchedulePage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { selectedDate, setSelectedDate } = useSchedule();

  const handleDayClick = (date: string) => {
    setSelectedDate(selectedDate === date ? null : date);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-stone-100 bg-white shrink-0">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-1.5 rounded-lg hover:bg-stone-100 transition-colors"
        >
          <ChevronLeft size={16} className="text-stone-600" />
        </button>
        <h2 className="flex-1 text-center text-base font-bold text-stone-900">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-1.5 rounded-lg hover:bg-stone-100 transition-colors"
        >
          <ChevronRight size={16} className="text-stone-600" />
        </button>
        <button
          onClick={() => setCurrentMonth(new Date())}
          className="text-xs font-semibold text-amber-600 hover:text-amber-700 px-2 py-1 rounded-lg hover:bg-amber-50 transition-colors"
        >
          Today
        </button>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Calendar */}
        <div className="flex-1 overflow-y-auto py-3">
          <CalendarGrid currentMonth={currentMonth} onDayClick={handleDayClick} />
        </div>

        {/* Day panel */}
        <AnimatePresence>
          {selectedDate && (
            <DayPanel
              date={selectedDate}
              onClose={() => setSelectedDate(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
