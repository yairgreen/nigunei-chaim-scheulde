
import { useState, useEffect } from 'react';
import { useWeeklyPrayers } from './useWeeklyPrayers';
import { useZmanimData } from './useZmanimData';
import { updateNextTimeIndicator, getDailyTimesArray } from './utils/timeUtils';
import type { DailyTimesData } from './types/dailyTimes';

export type { DailyTimesData };

export function useDailyTimes(date?: Date): DailyTimesData {
  const [dailyTimes, setDailyTimes] = useState<{ name: string; time: string; isNext?: boolean }[]>([]);
  const weeklyPrayers = useWeeklyPrayers();
  const { zmanimData } = useZmanimData(date);

  useEffect(() => {
    if (zmanimData) {
      const times = getDailyTimesArray(zmanimData, weeklyPrayers, date);
      const updatedTimes = updateNextTimeIndicator(times);
      setDailyTimes(updatedTimes);
    }
  }, [zmanimData, weeklyPrayers, date]);

  // Update the "next" indicator every minute
  useEffect(() => {
    const minuteInterval = setInterval(() => {
      if (zmanimData) {
        const times = getDailyTimesArray(zmanimData, weeklyPrayers, date);
        const updatedTimes = updateNextTimeIndicator(times);
        setDailyTimes(updatedTimes);
      }
    }, 60 * 1000);
    
    return () => clearInterval(minuteInterval);
  }, [zmanimData, weeklyPrayers, date]);

  return { dailyTimes };
}

