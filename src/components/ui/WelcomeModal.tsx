import { useState } from 'react';
import { Modal } from './Modal';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './Button';
import { Clock, BarChart2, Calendar, LayoutGrid } from 'lucide-react';

interface WelcomeModalProps {
  open: boolean;
  onClose: () => void;
}

const SLIDES = [
  {
    icon: Clock,
    color: '#f59e0b',
    title: 'Daily Routine',
    desc: 'Build your perfect day with time blocks. Track each activity in a fluid, visual timeline.',
  },
  {
    icon: LayoutGrid,
    color: '#3b82f6',
    title: 'Plan Tracker',
    desc: 'Create multi-week plans, set goals with a Wheel of Life, and track daily habits in a spreadsheet.',
  },
  {
    icon: BarChart2,
    color: '#10b981',
    title: 'Progress',
    desc: 'See your streaks, completion heatmaps, and life balance charts evolve over time.',
  },
  {
    icon: Calendar,
    color: '#8b5cf6',
    title: 'Schedule',
    desc: 'A beautiful monthly calendar for events. Click any day to add and manage events quickly.',
  },
];

export function WelcomeModal({ open, onClose }: WelcomeModalProps) {
  const [slide, setSlide] = useState(0);

  const isLast = slide === SLIDES.length - 1;
  const { icon: Icon, color, title, desc } = SLIDES[slide];

  return (
    <Modal open={open} onClose={onClose}>
      <div className="px-6 py-6 flex flex-col items-center text-center min-h-64">
        {slide === 0 && (
          <h1 className="text-2xl font-extrabold text-stone-900 mb-1">Welcome to Project 360</h1>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={slide}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center w-full"
          >
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center my-5 shadow-lg"
              style={{ backgroundColor: color + '22' }}
            >
              <Icon size={36} style={{ color }} />
            </div>
            <h2 className="text-xl font-bold text-stone-900 mb-2">{title}</h2>
            <p className="text-stone-500 text-sm leading-relaxed max-w-xs">{desc}</p>
          </motion.div>
        </AnimatePresence>

        {/* Dots */}
        <div className="flex gap-1.5 my-5">
          {SLIDES.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${i === slide ? 'w-5 bg-amber-500' : 'w-1.5 bg-stone-200'}`}
            />
          ))}
        </div>

        <div className="flex gap-2 w-full">
          {slide > 0 && (
            <Button variant="secondary" className="flex-1" onClick={() => setSlide(slide - 1)}>
              Back
            </Button>
          )}
          <Button className="flex-1" onClick={() => isLast ? onClose() : setSlide(slide + 1)}>
            {isLast ? "Let's go →" : 'Next'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
