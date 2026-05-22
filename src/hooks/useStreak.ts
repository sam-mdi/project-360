import { useMemo } from 'react';
import { useRoutine } from '../stores/useRoutine';
import { subDays, format } from 'date-fns';

export function useStreak() {
  const { dailyRoutines, blocks } = useRoutine();

  return useMemo(() => {
    let streak = 0;
    const today = new Date();

    for (let i = 0; i < 365; i++) {
      const date = format(subDays(today, i), 'yyyy-MM-dd');
      const routine = dailyRoutines.find((r) => r.date === date);
      if (!routine || routine.blockIds.length === 0) {
        if (i > 0) break;
        continue;
      }
      const completed = routine.actuals.filter((a) => a.endedAt && a.notes !== 'skipped').length;
      if (completed > 0) streak++;
      else break;
    }

    return streak;
  }, [dailyRoutines, blocks]);
}
