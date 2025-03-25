
import { useState, useEffect } from 'react';
import { 
  isRoshChodeshToday,
  recalculatePrayerTimes
} from '@/lib/database/index';
import { format } from 'date-fns';

export interface DailyScheduleData {
  dailyPrayers: { name: string; time: string; isNext?: boolean }[];
  dailyClasses: { name: string; time: string; isNext?: boolean }[];
  isRoshChodesh: boolean;
}

export function useDailySchedule(): DailyScheduleData {
  const [dailyPrayers, setDailyPrayers] = useState<{ name: string; time: string; isNext?: boolean }[]>([]);
  const [dailyClasses, setDailyClasses] = useState<{ name: string; time: string; isNext?: boolean }[]>([]);
  const [isRoshChodesh, setIsRoshChodesh] = useState(false);

  const refreshDailySchedule = async () => {
    try {
      // Check if today is Rosh Chodesh
      const roshChodesh = isRoshChodeshToday();
      console.log('Is Rosh Chodesh:', roshChodesh);
      setIsRoshChodesh(roshChodesh);
      
      // Get prayer times from the calculation function
      const { minchaTime, arvitTime } = recalculatePrayerTimes();
      console.log('Calculated prayer times for daily schedule - Mincha:', minchaTime, 'Arvit:', arvitTime);
      
      // Set daily prayers based on calculated times and Rosh Chodesh status
      const prayers = [
        { name: 'שחרית א׳', time: roshChodesh ? '06:00' : '06:15' },
        { name: 'שחרית ב׳', time: '07:00' },
        { name: 'שחרית ג׳', time: '08:00' },
        { name: 'מנחה גדולה', time: '12:30' },
        { name: 'מנחה', time: minchaTime },
        { name: 'ערבית א׳', time: arvitTime },
        { name: 'ערבית ב׳', time: '20:45' }
      ];
      
      // Set daily classes based on the day of the week
      const now = new Date();
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
      
      // Find which prayer is next
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTimeInMinutes = currentHour * 60 + currentMinute;
      
      // Mark which prayer is next
      let foundNextPrayer = false;
      const prayers_with_next = prayers.map(prayer => {
        if (!prayer.time) {
          return { ...prayer, isNext: false };
        }
        
        // Extract start time for prayer
        const [hours, minutes] = prayer.time.split(':').map(Number);
        const prayerTimeInMinutes = hours * 60 + minutes;
        
        if (!foundNextPrayer && prayerTimeInMinutes > currentTimeInMinutes) {
          foundNextPrayer = true;
          return { ...prayer, isNext: true };
        }
        return { ...prayer, isNext: false };
      });
      
      // If no "next" prayer was found (all times passed), highlight the first one for tomorrow
      if (!foundNextPrayer && prayers_with_next.length > 0) {
        prayers_with_next[0].isNext = true;
      }
      
      // Find which class is next
      let foundNextClass = false;
      const classes_with_next = classes.map(cls => {
        if (!cls.time) {
          return { ...cls, isNext: false };
        }
        
        // Extract start time for class (handles ranges like "20:00-20:45")
        const startTime = cls.time.split('-')[0];
        const [hours, minutes] = startTime.split(':').map(Number);
        const classTimeInMinutes = hours * 60 + minutes;
        
        if (!foundNextClass && classTimeInMinutes > currentTimeInMinutes) {
          foundNextClass = true;
          return { ...cls, isNext: true };
        }
        return { ...cls, isNext: false };
      });
      
      // If no "next" class was found (all times passed), highlight the first one for tomorrow
      if (!foundNextClass && classes_with_next.length > 0) {
        classes_with_next[0].isNext = true;
      }
      
      setDailyPrayers(prayers_with_next);
      setDailyClasses(classes_with_next);
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
    
    // Set up minute-by-minute refresh for "next" highlighting
    const refreshInterval = setInterval(() => {
      refreshDailySchedule();
    }, 60 * 1000); // Refresh every minute
    
    return () => clearInterval(refreshInterval);
  }, []);

  return { dailyPrayers, dailyClasses, isRoshChodesh };
}
