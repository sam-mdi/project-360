import { useEffect, useRef } from 'react';
import { useRoutine } from '../stores/useRoutine';
import { useSettings } from '../stores/useSettings';
import { useTracking } from '../stores/useTracking';
import { playSound } from '../lib/sounds';
import { format } from 'date-fns';

function timeToMinutes(t: string) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function nowMinutes() {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

function notify(title: string, body: string, sound?: string) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/favicon.ico' });
  }
  if (sound) playSound(sound as any);
}

export function useSmartNotifications() {
  const { notificationsEnabled, defaultSound } = useSettings();
  const firedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!notificationsEnabled) return;

    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const interval = setInterval(() => {
      const today = format(new Date(), 'yyyy-MM-dd');
      const { blocks, dailyRoutines, getActualsForDate } = useRoutine.getState();
      const { getPomodoroCount } = useTracking.getState();

      const routine = dailyRoutines.find((r) => r.date === today);
      if (!routine) return;

      const actuals = getActualsForDate(today);
      const now = nowMinutes();

      routine.blockIds.forEach((blockId) => {
        const block = blocks.find((b) => b.id === blockId);
        if (!block) return;

        const start = timeToMinutes(block.startTime);
        const end = start + block.duration;
        const actual = actuals.find((a) => a.blockId === blockId);

        // 5-min before start
        const preKey = `pre:${today}:${blockId}`;
        if (!firedRef.current.has(preKey) && now >= start - 5 && now < start) {
          firedRef.current.add(preKey);
          notify(`${block.icon} ${block.label} starting soon`, 'Your next block starts in 5 minutes', defaultSound);
        }

        // At start time
        const startKey = `start:${today}:${blockId}`;
        if (!firedRef.current.has(startKey) && now >= start && now < start + 2) {
          firedRef.current.add(startKey);
          notify(`${block.icon} Time for ${block.label}`, 'Your scheduled block is starting now', defaultSound);
        }

        // Overrun: still not completed 10min after end
        const overrunKey = `overrun:${today}:${blockId}`;
        if (!firedRef.current.has(overrunKey) && now >= end + 10 && !actual?.endedAt && actual?.startedAt) {
          firedRef.current.add(overrunKey);
          notify(`${block.icon} ${block.label} running long`, `You're 10+ minutes over the scheduled time`, undefined);
        }
      });

      // Daily summary at 9pm
      const summaryKey = `summary:${today}`;
      if (!firedRef.current.has(summaryKey) && now >= 21 * 60 && now < 21 * 60 + 2) {
        firedRef.current.add(summaryKey);
        const total = routine.blockIds.length;
        const done = actuals.filter((a) => a.endedAt && a.notes !== 'skipped').length;
        notify(
          `📊 Daily Summary`,
          `You completed ${done}/${total} blocks today. ${done === total ? 'Perfect day! 🎉' : 'Keep it up!'}`,
          undefined
        );
      }

      // Pomodoro milestone
      const pomoCount = getPomodoroCount(today);
      if (pomoCount >= 4) {
        const pomoKey = `pomo4:${today}`;
        if (!firedRef.current.has(pomoKey)) {
          firedRef.current.add(pomoKey);
          notify('🍅 Pomodoro Milestone!', `You've completed ${pomoCount} focus sessions today. Amazing work!`, undefined);
        }
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [notificationsEnabled, defaultSound]);
}
