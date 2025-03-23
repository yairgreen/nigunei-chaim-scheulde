
import { useState, useEffect } from 'react';
import { initDatabase } from '@/lib/database/index';
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
        console.log('Loading initial data...');
        await initDatabase();
        
        // Add a delay to ensure all hooks have their data
        setTimeout(() => {
          console.log('Data loaded successfully');
          setDataLoaded(true);
        }, 1000);
      } catch (error) {
        console.error('Failed to load initial data:', error);
        // Still set dataLoaded to true so we can show default data
        setTimeout(() => {
          setDataLoaded(true);
        }, 1000);
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
