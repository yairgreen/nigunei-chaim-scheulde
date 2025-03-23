
import { useState, useEffect } from 'react';
import { getTodayZmanim } from '@/lib/database/index';

export interface DailyTimesData {
  dailyTimes: { name: string; time: string; isNext?: boolean }[];
}

export function useDailyTimes(): DailyTimesData {
  const [dailyTimes, setDailyTimes] = useState<{ name: string; time: string; isNext?: boolean }[]>([]);

  const refreshDailyTimes = async () => {
    try {
      // Get today's zmanim
      const todayZmanim = getTodayZmanim();
      console.log('Today\'s zmanim:', todayZmanim);
      
      // If no zmanim data is available, create default data
      if (!todayZmanim) {
        const defaultTimes = [
          { name: 'עלות השחר (72 ד\')', time: '05:20' },
          { name: 'הנץ החמה', time: '06:07' },
          { name: 'זמן טלית ותפילין', time: '05:40' },
          { name: 'סוף זמן ק"ש (מג״א)', time: '08:44' },
          { name: 'סוף זמן ק"ש (גר״א)', time: '09:20', isNext: true },
          { name: 'סוף זמן תפילה (מג״א)', time: '09:48' },
          { name: 'סוף זמן תפילה (גר"א)', time: '10:26' },
          { name: 'חצות היום והלילה', time: '11:53' },
          { name: 'זמן מנחה גדולה', time: '12:25' },
          { name: 'פלג המנחה', time: '17:22' },
          { name: 'שקיעה', time: '17:39' },
          { name: 'צאת הכוכבים', time: '18:05' }
        ];
        setDailyTimes(defaultTimes);
        return;
      }
      
      // Find which time is next
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTimeInMinutes = currentHour * 60 + currentMinute;
      
      // Format the zmanim for display and mark the next time
      const zmanim = [
        { name: 'עלות השחר (72 ד\')', time: todayZmanim.alotHaShachar },
        { name: 'הנץ החמה', time: todayZmanim.sunrise },
        { name: 'זמן טלית ותפילין', time: todayZmanim.misheyakir },
        { name: 'סוף זמן ק"ש (מג״א)', time: todayZmanim.sofZmanShmaMGA },
        { name: 'סוף זמן ק"ש (גר״א)', time: todayZmanim.sofZmanShma },
        { name: 'סוף זמן תפילה (מג״א)', time: todayZmanim.sofZmanTfillaMGA },
        { name: 'סוף זמן תפילה (גר"א)', time: todayZmanim.sofZmanTfilla },
        { name: 'חצות היום והלילה', time: todayZmanim.chatzot },
        { name: 'זמן מנחה גדולה', time: todayZmanim.minchaGedola },
        { name: 'פלג המנחה', time: todayZmanim.plagHaMincha },
        { name: 'שקיעה', time: todayZmanim.sunset },
        { name: 'צאת הכוכבים', time: todayZmanim.beinHaShmashos }
      ];
      
      // Mark which time is next
      let foundNext = false;
      const zmanim_with_next = zmanim.map(zman => {
        const [hours, minutes] = zman.time.split(':').map(Number);
        const zmanTimeInMinutes = hours * 60 + minutes;
        
        if (!foundNext && zmanTimeInMinutes > currentTimeInMinutes) {
          foundNext = true;
          return { ...zman, isNext: true };
        }
        return zman;
      });
      
      // If no "next" time was found (all times passed), don't highlight any
      if (!foundNext) {
        zmanim_with_next[0].isNext = true; // Default to first time for tomorrow
      }
      
      setDailyTimes(zmanim_with_next);
    } catch (error) {
      console.error('Error refreshing daily times:', error);
      
      // Provide default times in case of error
      const defaultTimes = [
        { name: 'עלות השחר (72 ד\')', time: '05:20' },
        { name: 'הנץ החמה', time: '06:07' },
        { name: 'זמן טלית ותפילין', time: '05:40' },
        { name: 'סוף זמן ק"ש (מג״א)', time: '08:44' },
        { name: 'סוף זמן ק"ש (גר״א)', time: '09:20', isNext: true },
        { name: 'סוף זמן תפילה (מג״א)', time: '09:48' },
        { name: 'סוף זמן תפילה (גר"א)', time: '10:26' },
        { name: 'חצות היום והלילה', time: '11:53' },
        { name: 'זמן מנחה גדולה', time: '12:25' },
        { name: 'פלג המנחה', time: '17:22' },
        { name: 'שקיעה', time: '17:39' },
        { name: 'צאת הכוכבים', time: '18:05' }
      ];
      setDailyTimes(defaultTimes);
    }
  };

  useEffect(() => {
    refreshDailyTimes();
    
    // Refresh times every minute to update "next" time indicator
    const refreshInterval = setInterval(() => {
      refreshDailyTimes();
    }, 60 * 1000);
    
    return () => clearInterval(refreshInterval);
  }, []);

  return { dailyTimes };
}
