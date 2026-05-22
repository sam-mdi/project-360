import { useEffect } from 'react';
import { useSettings } from '../stores/useSettings';
import { useRoutine } from '../stores/useRoutine';
import { playSound } from '../lib/sounds';
import { timeToMinutes } from '../lib/utils';
import { todayStr } from '../lib/utils';

export function useNotifications() {
  const { notificationsEnabled, defaultSound } = useSettings();
  const { getTodayBlocks } = useRoutine();

  useEffect(() => {
    if (!notificationsEnabled) return;
    const intervalId = setInterval(() => {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const blocks = getTodayBlocks(todayStr());
      blocks.forEach((block) => {
        const startMin = timeToMinutes(block.startTime);
        if (startMin === currentMinutes) {
          playSound(block.sound !== 'none' ? block.sound : defaultSound);
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`Starting: ${block.label}`, {
              body: `Your block "${block.label}" is starting now`,
              icon: '/favicon.ico',
            });
          }
        }
      });
    }, 60000);
    return () => clearInterval(intervalId);
  }, [notificationsEnabled, defaultSound, getTodayBlocks]);
}
