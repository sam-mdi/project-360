import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Square, SkipForward, Timer, X } from 'lucide-react';
import { useSettings } from '../../stores/useSettings';
import { useTracking } from '../../stores/useTracking';
import { playSound } from '../../lib/sounds';
import { format } from 'date-fns';

type Phase = 'work' | 'short' | 'long';

interface PomodoroWidgetProps {
  blockId?: string;
  blockName?: string;
  onClose?: () => void;
}

export function PomodoroWidget({ blockId = '', blockName = 'Focus Session', onClose }: PomodoroWidgetProps) {
  const { pomodoroWork, pomodoroShortBreak, pomodoroLongBreak, pomodoroAutoStart, defaultSound } = useSettings();
  const { addPomodoroSession } = useTracking();

  const [phase, setPhase] = useState<Phase>('work');
  const [running, setRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(pomodoroWork * 60);
  const [sessions, setSessions] = useState(0);
  const [visible, setVisible] = useState(true);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const phaseDuration = phase === 'work' ? pomodoroWork * 60
    : phase === 'short' ? pomodoroShortBreak * 60
    : pomodoroLongBreak * 60;

  const progress = 1 - secondsLeft / phaseDuration;
  const mins = Math.floor(secondsLeft / 60).toString().padStart(2, '0');
  const secs = (secondsLeft % 60).toString().padStart(2, '0');

  const radius = 40;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            handleSessionEnd();
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  const handleSessionEnd = () => {
    setRunning(false);
    playSound(defaultSound);
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(
        phase === 'work' ? 'Pomodoro complete! Time for a break.' : 'Break over! Back to work.',
        { icon: '/favicon.ico' }
      );
    }
    if (phase === 'work') {
      const newSessions = sessions + 1;
      setSessions(newSessions);
      addPomodoroSession(format(new Date(), 'yyyy-MM-dd'), blockId, blockName);
      const nextPhase: Phase = newSessions % 4 === 0 ? 'long' : 'short';
      setPhase(nextPhase);
      const dur = nextPhase === 'long' ? pomodoroLongBreak : pomodoroShortBreak;
      setSecondsLeft(dur * 60);
      if (pomodoroAutoStart) setRunning(true);
    } else {
      setPhase('work');
      setSecondsLeft(pomodoroWork * 60);
      if (pomodoroAutoStart) setRunning(true);
    }
  };

  const handleStop = () => {
    setRunning(false);
    setPhase('work');
    setSecondsLeft(pomodoroWork * 60);
    setSessions(0);
  };

  const handleSkip = () => {
    setRunning(false);
    handleSessionEnd();
  };

  if (!visible) return (
    <button
      onClick={() => setVisible(true)}
      className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-lg hover:bg-amber-400 transition-colors"
    >
      <Timer size={20} />
    </button>
  );

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      className="fixed bottom-6 right-6 z-40 bg-white rounded-3xl shadow-2xl border border-stone-100 p-4 w-52"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-stone-500 truncate max-w-32">
          {phase === 'work' ? blockName : phase === 'short' ? 'Short Break' : 'Long Break'}
        </span>
        <button onClick={() => setVisible(false)} className="text-stone-300 hover:text-stone-500">
          <X size={14} />
        </button>
      </div>

      {/* SVG ring + timer */}
      <div className="flex justify-center mb-3">
        <div className="relative w-24 h-24">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r={radius} fill="none" stroke="#f5f5f4" strokeWidth="8" />
            <circle
              cx="50" cy="50" r={radius}
              fill="none"
              stroke={phase === 'work' ? '#f59e0b' : '#10b981'}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-bold text-stone-900">{mins}:{secs}</span>
          </div>
        </div>
      </div>

      {/* Session dots */}
      <div className="flex justify-center gap-1.5 mb-3">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-colors ${
              i < sessions % 4 ? 'bg-amber-500' : 'bg-stone-200'
            }`}
          />
        ))}
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-2">
        <button
          onClick={() => setRunning((r) => !r)}
          className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center hover:bg-amber-400 transition-colors"
        >
          {running ? <Pause size={16} /> : <Play size={16} />}
        </button>
        <button
          onClick={handleStop}
          className="w-10 h-10 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center hover:bg-stone-200 transition-colors"
        >
          <Square size={14} />
        </button>
        <button
          onClick={handleSkip}
          className="w-10 h-10 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center hover:bg-stone-200 transition-colors"
        >
          <SkipForward size={14} />
        </button>
      </div>

      {onClose && (
        <button
          onClick={onClose}
          className="w-full text-center text-xs text-stone-400 hover:text-stone-600 mt-2"
        >
          Close timer
        </button>
      )}
    </motion.div>
  );
}
