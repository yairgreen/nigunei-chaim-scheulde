
import { useState, useEffect } from 'react';
import { 
  isRoshChodeshToday,
  calculateWeeklyMinchaTime,
  calculateWeeklyArvitTime
} from '@/lib/database';

export interface DailyScheduleData {
  dailyPrayers: { name: string; time: string }[];
  dailyClasses: { name: string; time: string }[];
  isRoshChodesh: boolean;
}

export function useDailySchedule(): DailyScheduleData {
  const [dailyPrayers, setDailyPrayers] = useState<{ name: string; time: string }[]>([]);
  const [dailyClasses, setDailyClasses] = useState<{ name: string; time: string }[]>([]);
  const [isRoshChodesh, setIsRoshChodesh] = useState(false);

  const refreshDailySchedule = async () => {
    try {
      // Check if today is Rosh Chodesh
      const roshChodesh = isRoshChodeshToday();
      setIsRoshChodesh(roshChodesh);
      
      // Calculate prayer times
      const minchaTime = calculateWeeklyMinchaTime();
      const arvitTime = calculateWeeklyArvitTime();
      
      // Set daily prayers
      const prayers = [
        { name: 'שחרית א׳', time: roshChodesh ? '06:00' : '06:15' },
        { name: 'שחרית ב׳', time: '07:00' },
        { name: 'שחרית ג׳', time: '08:00' },
        { name: 'מנחה גדולה', time: '12:30' },
        { name: 'מנחה', time: minchaTime },
        { name: 'ערבית א׳', time: arvitTime },
        { name: 'ערבית ב׳', time: '20:45' }
      ];
      
      setDailyPrayers(prayers);
      
      // Set daily classes based on the day of the week
      const now = new Date();
      const dayOfWeek = now.getDay(); // 0 is Sunday
      const classes = [];
      
      // Daily class
      classes.push({ name: 'שיעור הדף היומי', time: '20:00-20:45' });
      
      // Tuesday class
      if (dayOfWeek === 2) { // Tuesday
        classes.push({ name: 'שיעור חסידות', time: '21:00-22:00' });
      }
      
      // Friday class
      if (dayOfWeek === 5) { // Friday
        classes.push({ name: 'מדרשישי', time: '09:00-10:00' });
      }
      
      setDailyClasses(classes);
    } catch (error) {
      console.error('Error refreshing daily schedule:', error);
    }
  };

  useEffect(() => {
    refreshDailySchedule();
  }, []);

  return { dailyPrayers, dailyClasses, isRoshChodesh };
}
