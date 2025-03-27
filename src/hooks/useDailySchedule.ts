
import { useState, useEffect } from 'react';
import { 
  isRoshChodeshToday,
  recalculatePrayerTimes,
  fetchDailyZmanim
} from '@/lib/database/index';
import { format } from 'date-fns';

export interface DailyScheduleData {
  dailyPrayers: { name: string; time: string; isNext?: boolean }[];
  dailyClasses: { name: string; time: string }[];
  isRoshChodesh: boolean;
}

export function useDailySchedule(selectedDate?: Date): DailyScheduleData {
  const [dailyPrayers, setDailyPrayers] = useState<{ name: string; time: string; isNext?: boolean }[]>([]);
  const [dailyClasses, setDailyClasses] = useState<{ name: string; time: string }[]>([]);
  const [isRoshChodesh, setIsRoshChodesh] = useState(false);

  const refreshDailySchedule = async () => {
    try {
      // Use selected date or current date
      const date = selectedDate || new Date();
      
      // Check if selected date is Rosh Chodesh
      const roshChodesh = isRoshChodeshToday();
      console.log('Is Rosh Chodesh:', roshChodesh);
      setIsRoshChodesh(roshChodesh);
      
      // Get prayer times for the specific date
      const formattedDate = format(date, 'yyyy-MM-dd');
      
      // Fetch zmanim data for the week
      const startOfWeek = new Date(date);
      const currentDayOfWeek = date.getDay(); // 0 is Sunday
      startOfWeek.setDate(date.getDate() - currentDayOfWeek); // Go back to Sunday
      
      // Get zmanim for each day of the week (Sun-Thu)
      const weekDays = [];
      const weekZmanim = [];
      
      for (let i = 0; i < 5; i++) {
        const weekDate = new Date(startOfWeek);
        weekDate.setDate(startOfWeek.getDate() + i);
        const weekDateStr = format(weekDate, 'yyyy-MM-dd');
        weekDays.push(weekDateStr);
        
        // Get zmanim for this day
        const dayZmanim = await fetchDailyZmanim(weekDateStr);
        if (dayZmanim) {
          weekZmanim.push(dayZmanim);
        }
      }
      
      console.log('Week days:', weekDays);
      console.log('Week zmanim:', weekZmanim);
      
      // Calculate mincha and arvit times
      let minchaTime = "17:15";
      let arvitTime = "18:15";
      
      if (weekZmanim.length > 0) {
        // Convert to the format needed by calculateWeeklyMinchaTime
        const sunsetData = weekZmanim.map(item => ({
          date: item.date,
          sunset: item.sunset,
          beinHaShmashos: item.beinHaShmashos
        }));
        
        // Import directly from the module to make sure we're using the latest function
        const { calculateWeeklyMinchaTime, calculateWeeklyArvitTime } = require('@/lib/database/prayers');
        
        minchaTime = calculateWeeklyMinchaTime(sunsetData);
        arvitTime = calculateWeeklyArvitTime(sunsetData);
      } else {
        const { minchaTime: mTime, arvitTime: aTime } = recalculatePrayerTimes();
        minchaTime = mTime;
        arvitTime = aTime;
      }
      
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
      
      // Mark which prayer is next
      markNextPrayer(prayers, selectedDate);
      
      setDailyPrayers(prayers);
      
      // Set daily classes based on the day of the week
      const classDayOfWeek = date.getDay(); // 0 is Sunday
      const classes = [];
      
      // Daily class (Sunday-Thursday)
      if (classDayOfWeek >= 0 && classDayOfWeek <= 4) {
        classes.push({ name: 'שיעור הדף היומי מפי הרב דוד קלופפר', time: '20:00-20:45' });
      }
      
      // Tuesday class
      if (classDayOfWeek === 2) { // Tuesday
        classes.push({ name: 'שיעור חסידות מפי הרב אשר דייטש', time: '21:00-22:00' });
      }
      
      // Friday class
      if (classDayOfWeek === 5) { // Friday
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
  
  // Helper function to mark the next prayer
  const markNextPrayer = (prayers: Array<{ name: string; time: string; isNext?: boolean }>, date?: Date) => {
    // Reset all isNext flags
    prayers.forEach(prayer => {
      if ('isNext' in prayer) {
        delete prayer.isNext;
      }
    });
    
    // Get current time or simulated time based on date
    const currentDate = date || new Date();
    const currentTimeStr = `${String(currentDate.getHours()).padStart(2, '0')}:${String(currentDate.getMinutes()).padStart(2, '0')}`;
    
    // Find the next prayer that hasn't passed yet
    // If time contains a range (like "20:00-20:45"), use the start time
    const nextPrayerIndex = prayers.findIndex(prayer => {
      const prayerTimeStart = prayer.time.split('-')[0];
      return prayerTimeStart > currentTimeStr;
    });
    
    if (nextPrayerIndex !== -1) {
      prayers[nextPrayerIndex].isNext = true;
    }
  };

  useEffect(() => {
    refreshDailySchedule();
    
    // Set up refresh interval for next prayer indicator
    const refreshNextIndicator = () => {
      markNextPrayer(dailyPrayers);
      setDailyPrayers([...dailyPrayers]); // Force re-render with spread operator
    };
    
    const refreshInterval = setInterval(refreshNextIndicator, 60 * 1000);
    
    // Schedule daily refresh at midnight
    const scheduleNextDailyRefresh = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      tomorrow.setHours(0, 1, 0, 0); // 00:01 am
      
      const msUntilRefresh = tomorrow.getTime() - now.getTime();
      
      setTimeout(() => {
        console.log('Performing scheduled daily prayer schedule refresh');
        refreshDailySchedule();
        scheduleNextDailyRefresh(); // Schedule next refresh
      }, msUntilRefresh);
    };
    
    // Initial scheduling
    scheduleNextDailyRefresh();
    
    return () => {
      clearInterval(refreshInterval);
    };
  }, [selectedDate]);

  return { dailyPrayers, dailyClasses, isRoshChodesh };
}
