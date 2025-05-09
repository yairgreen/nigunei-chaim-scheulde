
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
    console.log('Manually forcing data refresh from Supabase...');
    setDataLoaded(false);
    
    try {
      await forceUpdate();
      console.log('Manual refresh completed successfully');
      // Display success message to the user
      toast.success('הנתונים עודכנו בהצלחה');
      
      // Dispatch events to notify components of the update
      window.dispatchEvent(new CustomEvent('zmanim-updated'));
      window.dispatchEvent(new CustomEvent('shabbat-updated'));
      window.dispatchEvent(new CustomEvent('prayers-updated'));
      window.dispatchEvent(new CustomEvent('prayer-override-updated'));
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
        console.log('Loading initial data from Supabase...');
        setDataLoaded(false);
        await initDatabase();
        
        // Set dataLoaded to true to display the UI
        setTimeout(() => {
          console.log('Data loaded successfully from Supabase');
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
    
    const handlePrayerOverrideUpdate = () => {
      console.log('Detected prayer override update event in useScheduleData, refreshing data...');
      setRefreshCounter(prev => prev + 1);
    };
    
    window.addEventListener('zmanim-updated', handleZmanimUpdate);
    window.addEventListener('shabbat-updated', handleShabbatUpdate);
    window.addEventListener('prayers-updated', handlePrayersUpdate);
    window.addEventListener('prayer-override-updated', handlePrayerOverrideUpdate);
    
    return () => {
      window.removeEventListener('zmanim-updated', handleZmanimUpdate);
      window.removeEventListener('shabbat-updated', handleShabbatUpdate);
      window.removeEventListener('prayers-updated', handlePrayersUpdate);
      window.removeEventListener('prayer-override-updated', handlePrayerOverrideUpdate);
    };
  }, []);

  useEffect(() => {
    // Force a re-render when refreshCounter changes
    console.log("Refresh counter changed, updating data...");
  }, [refreshCounter]);

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
