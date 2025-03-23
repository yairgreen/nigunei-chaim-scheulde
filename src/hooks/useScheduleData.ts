
import { useState, useEffect } from 'react';
import { initDatabase } from '@/lib/database';
import { useDailyTimes, DailyTimesData } from './useDailyTimes';
import { useShabbatData, ShabbatData } from './useShabbatData';
import { useDailySchedule, DailyScheduleData } from './useDailySchedule';
import { useDateInfo, DateInfo } from './useDateInfo';

export interface ScheduleData extends DateInfo, DailyTimesData, DailyScheduleData, ShabbatData {
  dataLoaded: boolean;
}

export function useScheduleData(): ScheduleData {
  const { currentDate, hebrewDate, gregorianDate } = useDateInfo();
  const { dailyTimes } = useDailyTimes();
  const { dailyPrayers, dailyClasses, isRoshChodesh } = useDailySchedule();
  const { shabbatData } = useShabbatData();
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    // Initialize app and load data
    const loadData = async () => {
      try {
        await initDatabase();
        setDataLoaded(true);
      } catch (error) {
        console.error('Failed to load initial data:', error);
      }
    };

    loadData();
  }, []);

  return {
    currentDate,
    hebrewDate,
    gregorianDate,
    dailyTimes,
    dailyPrayers,
    dailyClasses,
    shabbatData,
    dataLoaded,
    isRoshChodesh
  };
}
