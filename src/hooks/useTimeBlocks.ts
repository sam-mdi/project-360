import { useMemo } from 'react';
import { useRoutine } from '../stores/useRoutine';
import { timeToMinutes, addMinutes } from '../lib/utils';
import { todayStr } from '../lib/utils';
import type { TimeBlock } from '../lib/types';

export interface TimeBlockWithMeta extends TimeBlock {
  endTime: string;
  isActive: boolean;
  minutesIn: number;
  minutesLeft: number;
  progress: number; // 0-1
}

export function useTimeBlocks(date?: string) {
  const { getTodayBlocks } = useRoutine();
  const targetDate = date ?? todayStr();

  return useMemo(() => {
    const blocks = getTodayBlocks(targetDate);
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    return blocks.map((block): TimeBlockWithMeta => {
      const startMin = timeToMinutes(block.startTime);
      const endMin = startMin + block.duration;
      const endTime = addMinutes(block.startTime, block.duration);
      const isActive = currentMinutes >= startMin && currentMinutes < endMin;
      const minutesIn = Math.max(0, currentMinutes - startMin);
      const minutesLeft = Math.max(0, endMin - currentMinutes);
      const progress = isActive ? minutesIn / block.duration : 0;
      return { ...block, endTime, isActive, minutesIn, minutesLeft, progress };
    });
  }, [getTodayBlocks, targetDate]);
}
