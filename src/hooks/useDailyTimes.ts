
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
      
      // Format the zmanim for display
      const zmanim = [
        { name: 'עלות השחר (72 ד\')', time: todayZmanim.alotHaShachar },
        { name: 'הנץ החמה', time: todayZmanim.sunrise },
        { name: 'זמן טלית ותפילין', time: todayZmanim.misheyakir },
        { name: 'סוף זמן ק"ש (מג״א)', time: todayZmanim.sofZmanShmaMGA },
        { name: 'סוף זמן ק"ש (גר״א)', time: todayZmanim.sofZmanShma, isNext: true },
        { name: 'סוף זמן תפילה (מג״א)', time: todayZmanim.sofZmanTfillaMGA },
        { name: 'סוף זמן תפילה (גר"א)', time: todayZmanim.sofZmanTfilla },
        { name: 'חצות היום והלילה', time: todayZmanim.chatzot },
        { name: 'זמן מנחה גדולה', time: todayZmanim.minchaGedola },
        { name: 'פלג המנחה', time: todayZmanim.plagHaMincha },
        { name: 'שקיעה', time: todayZmanim.sunset },
        { name: 'צאת הכוכבים', time: todayZmanim.beinHaShmashos }
      ];
      
      setDailyTimes(zmanim);
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
  }, []);

  return { dailyTimes };
}
