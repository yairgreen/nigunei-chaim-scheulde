
import { useState, useEffect } from 'react';
import { 
  isRoshChodeshToday,
  recalculatePrayerTimes,
  calculateWeeklyMinchaTime,
  calculateWeeklyArvitTime
} from '@/lib/database/index';

export interface DailyScheduleData {
  dailyPrayers: { name: string; time: string }[];
  dailyClasses: { name: string; time: string }[];
  isRoshChodesh: boolean;
}

export function useDailySchedule(date?: Date): DailyScheduleData {
  const [dailyPrayers, setDailyPrayers] = useState<{ name: string; time: string }[]>([]);
  const [dailyClasses, setDailyClasses] = useState<{ name: string; time: string }[]>([]);
  const [isRoshChodesh, setIsRoshChodesh] = useState(false);

  const refreshDailySchedule = async () => {
    try {
      // Check if today is Rosh Chodesh using the provided date or current date
      const roshChodesh = isRoshChodeshToday(date);
      console.log('Is Rosh Chodesh:', roshChodesh);
      setIsRoshChodesh(roshChodesh);
      
      // Get prayer times from the calculation function
      const { minchaTime, arvitTime } = date 
        ? { minchaTime: '17:30', arvitTime: '18:30' } // Default for simulation dates
        : recalculatePrayerTimes();
      
      console.log('Calculated prayer times for daily schedule - Mincha:', minchaTime, 'Arvit:', arvitTime);
      
      // Check if we're in daylight saving time (March-October)
      const now = date || new Date();
      const month = now.getMonth(); // 0-11 (Jan-Dec)
      const isDaylightSaving = month >= 2 && month <= 9; // March through October
      
      // Set daily prayers based on calculated times and Rosh Chodesh status
      const prayers = [
        { name: 'שחרית א׳', time: roshChodesh ? '06:00' : '06:15' },
        { name: 'שחרית ב׳', time: '07:00' },
        { name: 'שחרית ג׳', time: '08:00' },
        { name: 'מנחה גדולה', time: isDaylightSaving ? '13:20' : '12:30' },
        { name: 'מנחה', time: minchaTime },
        { name: 'ערבית א׳', time: arvitTime },
        { name: 'ערבית ב׳', time: '20:45' }
      ];
      
      setDailyPrayers(prayers);
      
      // Set daily classes based on the day of the week
      const dayOfWeek = now.getDay(); // 0 is Sunday
      const classes = [];
      
      // Daily class (Sunday-Thursday)
      if (dayOfWeek >= 0 && dayOfWeek <= 4) {
        classes.push({ name: 'שיעור הדף היומי מפי הרב דוד קלופפר', time: '20:00-20:45' });
      }
      
      // Tuesday class
      if (dayOfWeek === 2) { // Tuesday
        classes.push({ name: 'שיעור חסידות מפי הרב אשר דייטש', time: '21:00-22:00' });
      }
      
      // Friday class
      if (dayOfWeek === 5) { // Friday
        classes.push({ name: 'מדרשישי מפי הרב עמיהוד סלומון', time: '09:00-10:00' });
      }
      
      setDailyClasses(classes);
    } catch (error) {
      console.error('Error refreshing daily schedule:', error);
      // Set default values in case of error
      setDailyPrayers([
        { name: 'שחרית א׳', time: '06:15' },
        { name: 'שחרית ב׳', time: '07:00' },
        { name: 'שחרית ג׳', time: '08:00' },
        { name: 'מנחה גדולה', time: '12:30' },
        { name: 'מנחה', time: '17:15' },
        { name: 'ערבית א׳', time: '18:15' },
        { name: 'ערבית ב׳', time: '20:45' }
      ]);
      setDailyClasses([{ name: 'שיעור הדף היומי מפי הרב דוד קלופפר', time: '20:00-20:45' }]);
    }
  };

  useEffect(() => {
    refreshDailySchedule();
    
    // Set up event listener for prayer updates
    const handlePrayersUpdate = () => {
      console.log('Prayers update detected, refreshing schedule...');
      refreshDailySchedule();
    };
    
    window.addEventListener('prayers-updated', handlePrayersUpdate);
    
    // Set up daily refresh
    const refreshInterval = setInterval(() => {
      refreshDailySchedule();
    }, 60 * 60 * 1000); // Refresh every hour
    
    return () => {
      clearInterval(refreshInterval);
      window.removeEventListener('prayers-updated', handlePrayersUpdate);
    };
  }, [date]);

  return { dailyPrayers, dailyClasses, isRoshChodesh };
}
