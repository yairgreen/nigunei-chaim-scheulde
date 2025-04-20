
import { useState, useEffect } from 'react';
import { initDatabase, forceUpdate } from '@/lib/database/index';
import { useDailyTimes, DailyTimesData } from './useDailyTimes';
import { useShabbatData, ShabbatHookData } from './useShabbatData';
import { useDailySchedule, DailyScheduleData } from './useDailySchedule';
import { useDateInfo, DateInfo } from './useDateInfo';
import { toast } from 'sonner';

export interface ScheduleData extends DateInfo, DailyTimesData, DailyScheduleData, ShabbatHookData {
  dataLoaded: boolean;
  forceRefresh: () => Promise<void>;
}

export function useScheduleData(): ScheduleData {
  const { currentDate, hebrewDate, gregorianDate, todayHoliday } = useDateInfo();
  const { dailyTimes } = useDailyTimes();
  const { dailyPrayers, dailyClasses, isRoshChodesh } = useDailySchedule();
  const { shabbatData } = useShabbatData();
  const [dataLoaded, setDataLoaded] = useState(false);
  const [refreshCounter, setRefreshCounter] = useState(0);

  const forceRefresh = async () => {
    console.log('Manually forcing data refresh...');
    setDataLoaded(false);
    
    try {
      await forceUpdate();
      console.log('Manual refresh completed successfully');
      // Display success message to the user
      toast.success('הנתונים עודכנו בהצלחה');
    } catch (error) {
      console.error('Error during manual refresh:', error);
      // Display error message to the user
      toast.error('שגיאה בעדכון הנתונים');
    } finally {
      setRefreshCounter(prev => prev + 1);
      setTimeout(() => {
        setDataLoaded(true);
      }, 500);
    }
  };

  useEffect(() => {
    // Initialize app and load data
    const loadData = async () => {
      try {
        console.log('Loading initial data...');
        setDataLoaded(false);
        await initDatabase();
        
        // Trigger an immediate update after initialization
        await forceUpdate();
        
        // Set dataLoaded to true to display the UI
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
    
    // Set up event listeners for data updates
    const handleZmanimUpdate = () => {
      console.log('Detected zmanim update event, refreshing data...');
      setRefreshCounter(prev => prev + 1);
    };
    
    const handleShabbatUpdate = () => {
      console.log('Detected Shabbat update event, refreshing data...');
      setRefreshCounter(prev => prev + 1);
    };
    
    const handlePrayersUpdate = () => {
      console.log('Detected prayers update event, refreshing data...');
      setRefreshCounter(prev => prev + 1);
    };
    
    window.addEventListener('zmanim-updated', handleZmanimUpdate);
    window.addEventListener('shabbat-updated', handleShabbatUpdate);
    window.addEventListener('prayers-updated', handlePrayersUpdate);
    
    // Removed hourly refresh interval
    
    return () => {
      window.removeEventListener('zmanim-updated', handleZmanimUpdate);
      window.removeEventListener('shabbat-updated', handleShabbatUpdate);
      window.removeEventListener('prayers-updated', handlePrayersUpdate);
    };
  }, []);

  return {
    currentDate,
    hebrewDate,
    gregorianDate,
    todayHoliday,
    dailyTimes,
    dailyPrayers,
    dailyClasses,
    shabbatData,
    dataLoaded,
    isRoshChodesh,
    forceRefresh
  };
}
