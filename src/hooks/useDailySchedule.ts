
import { useState, useEffect } from 'react';
import { 
  isRoshChodeshToday,
  recalculatePrayerTimes
} from '@/lib/database/index';
import { format } from 'date-fns';

export interface DailyScheduleData {
  dailyPrayers: { name: string; time: string; isNext?: boolean }[];
  dailyClasses: { name: string; time: string }[];
  isRoshChodesh: boolean;
}

export function useDailySchedule(): DailyScheduleData {
  const [dailyPrayers, setDailyPrayers] = useState<{ name: string; time: string; isNext?: boolean }[]>([]);
  const [dailyClasses, setDailyClasses] = useState<{ name: string; time: string }[]>([]);
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
      
      // Find which prayer is next
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTimeInMinutes = currentHour * 60 + currentMinute;
      
      // Mark which prayer is next
      let foundNext = false;
      const prayers_with_next = prayers.map(prayer => {
        if (!prayer.time) {
          return { ...prayer, time: '--:--', isNext: false };
        }
        
        // Handle time ranges (for classes)
        let prayerTime = prayer.time;
        if (prayerTime.includes('-')) {
          prayerTime = prayerTime.split('-')[0];
        }
        
        const [hours, minutes] = prayerTime.split(':').map(Number);
        const prayerTimeInMinutes = hours * 60 + minutes;
        
        if (!foundNext && prayerTimeInMinutes > currentTimeInMinutes) {
          foundNext = true;
          return { ...prayer, isNext: true };
        }
        return { ...prayer, isNext: false };
      });
      
      // If no "next" prayer was found (all times passed), highlight the first one for tomorrow
      if (!foundNext && prayers_with_next.length > 0) {
        prayers_with_next[0].isNext = true;
      }
      
      setDailyPrayers(prayers_with_next);
      
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
    
    // Set up minute refresh for next prayer indicator
    const refreshInterval = setInterval(() => {
      refreshDailySchedule();
    }, 60 * 1000); // Refresh every minute
    
    return () => clearInterval(refreshInterval);
  }, []);

  return { dailyPrayers, dailyClasses, isRoshChodesh };
}
