
import { useState, useEffect } from 'react';
import { 
  isRoshChodeshToday,
  recalculatePrayerTimes,
  calculateWeeklyMinchaTime,
  calculateWeeklyArvitTime
} from '@/lib/database/index';

import { getPrayerOverrides, getActiveOverride } from '@/lib/database/prayers/overrides';
import type { PrayerOverride } from '@/lib/database/types/prayers';

export interface DailyScheduleData {
  dailyPrayers: { name: string; time: string }[];
  dailyClasses: { name: string; time: string }[];
  isRoshChodesh: boolean;
}

export function useDailySchedule(date?: Date): DailyScheduleData {
  const [dailyPrayers, setDailyPrayers] = useState<{ name: string; time: string }[]>([]);
  const [dailyClasses, setDailyClasses] = useState<{ name: string; time: string }[]>([]);
  const [isRoshChodesh, setIsRoshChodesh] = useState(false);
  const [overrides, setOverrides] = useState<PrayerOverride[]>([]);
  const [calculatedTimes, setCalculatedTimes] = useState<{ minchaTime: string; arvitTime: string }>({ 
    minchaTime: '', 
    arvitTime: '' 
  });

  const refreshDailySchedule = async () => {
    try {
      // Check if today is Rosh Chodesh using the provided date or current date
      const roshChodesh = isRoshChodeshToday(date);
      console.log('Is Rosh Chodesh:', roshChodesh);
      setIsRoshChodesh(roshChodesh);
      
      // Load prayer overrides
      const prayerOverrides = await getPrayerOverrides();
      setOverrides(prayerOverrides);
      
      // Get prayer times from the calculation function
      // If zmanim data is unavailable, these will be empty strings
      let minchaTime = '';
      let arvitTime = '';
      
      if (date) {
        // For simulation dates, let code calculate actual values
        minchaTime = '';
        arvitTime = '';
      } else {
        // For current date, get calculated values
        const prayerTimes = await recalculatePrayerTimes();
        console.log('Received prayer times from recalculation:', prayerTimes);
        minchaTime = prayerTimes.minchaTime;
        arvitTime = prayerTimes.arvitTime;
        
        // Store calculated times for reference
        setCalculatedTimes({ minchaTime, arvitTime });
      }
      
      console.log('Calculated prayer times for daily schedule - Mincha:', minchaTime || 'Not available', 'Arvit:', arvitTime || 'Not available');
      
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
      ];
      
      // Add mincha time if available, considering overrides
      if (minchaTime) {
        const override = getActiveOverride('מנחה', now, overrides);
        prayers.push({ 
          name: 'מנחה', 
          time: override?.override_time || minchaTime 
        });
      } else {
        console.warn('No calculated Mincha time available, using default');
        prayers.push({ name: 'מנחה', time: '17:30' });
      }
      
      // Add arvit times if available, considering overrides
      if (arvitTime) {
        const override = getActiveOverride('ערבית א׳', now, overrides);
        prayers.push({ 
          name: 'ערבית א׳', 
          time: override?.override_time || arvitTime 
        });
      } else {
        console.warn('No calculated Arvit time available, using default');
        prayers.push({ name: 'ערבית א׳', time: '18:30' });
      }
      
      // Fixed second arvit time
      const arvit2Override = getActiveOverride('ערבית ב׳', now, overrides);
      prayers.push({ 
        name: 'ערבית ב׳', 
        time: arvit2Override?.override_time || '20:45' 
      });
      
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
    
    // Add event listener for prayer override updates
    const handlePrayerOverrideUpdate = () => {
      console.log('Prayer override update detected, refreshing schedule...');
      refreshDailySchedule();
    };
    
    window.addEventListener('prayer-override-updated', handlePrayerOverrideUpdate);
    
    return () => {
      window.removeEventListener('prayers-updated', handlePrayersUpdate);
      window.removeEventListener('prayer-override-updated', handlePrayerOverrideUpdate);
    };
  }, [date]);

  return { dailyPrayers, dailyClasses, isRoshChodesh };
}
