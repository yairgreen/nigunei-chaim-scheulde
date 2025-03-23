
import { useState, useEffect } from 'react';
import { getTodayZmanim } from '@/lib/database';

export interface DailyTimesData {
  dailyTimes: { name: string; time: string; isNext?: boolean }[];
}

export function useDailyTimes(): DailyTimesData {
  const [dailyTimes, setDailyTimes] = useState<{ name: string; time: string; isNext?: boolean }[]>([]);

  const refreshDailyTimes = async () => {
    try {
      // Get today's zmanim
      const todayZmanim = getTodayZmanim();
      if (todayZmanim) {
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
      }
    } catch (error) {
      console.error('Error refreshing daily times:', error);
    }
  };

  useEffect(() => {
    refreshDailyTimes();
  }, []);

  return { dailyTimes };
}
