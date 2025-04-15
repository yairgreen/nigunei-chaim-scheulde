
import { useState, useEffect } from 'react';
import { getTodayZmanim } from '@/lib/database/index';
import type { ZmanimData } from '@/lib/database/zmanim';

export interface DailyTimesData {
  dailyTimes: { name: string; time: string; isNext?: boolean }[];
}

export function useDailyTimes(date?: Date): DailyTimesData {
  const [dailyTimes, setDailyTimes] = useState<{ name: string; time: string; isNext?: boolean }[]>([]);
  const [refreshCounter, setRefreshCounter] = useState(0);

  const refreshDailyTimes = async () => {
    try {
      const zmanimData = await getTodayZmanim();
      
      if (!zmanimData) {
        console.error('No zmanim data available');
        return;
      }

      const times = [
        { name: 'עלות השחר (72 ד\')', time: zmanimData.alotHaShachar },
        { name: 'הנץ החמה', time: zmanimData.sunrise },
        { name: 'זמן טלית ותפילין', time: zmanimData.misheyakir },
        { name: 'סוף זמן ק"ש (מג״א)', time: zmanimData.sofZmanShmaMGA },
        { name: 'סוף זמן ק"ש (גר״א)', time: zmanimData.sofZmanShma },
        { name: 'סוף זמן תפילה (מג״א)', time: zmanimData.sofZmanTfillaMGA },
        { name: 'סוף זמן תפילה (גר"א)', time: zmanimData.sofZmanTfilla },
        { name: 'חצות היום והלילה', time: zmanimData.chatzot },
        { name: 'זמן מנחה גדולה', time: zmanimData.minchaGedola },
        { name: 'פלג המנחה', time: zmanimData.plagHaMincha },
        { name: 'שקיעה', time: zmanimData.sunset },
        { name: 'צאת הכוכבים', time: zmanimData.beinHaShmashos }
      ];

      setDailyTimes(times);
    } catch (error) {
      console.error('Error refreshing daily times:', error);
    }
  };

  useEffect(() => {
    refreshDailyTimes();
    
    // Set up event listener for zmanim updates
    const handleZmanimUpdate = () => {
      console.log('Zmanim update detected in useDailyTimes, refreshing...');
      refreshDailyTimes();
      setRefreshCounter(prev => prev + 1);
    };
    
    window.addEventListener('zmanim-updated', handleZmanimUpdate);
    
    // Refresh times every hour
    const refreshInterval = setInterval(() => {
      refreshDailyTimes();
    }, 60 * 60 * 1000);
    
    return () => {
      clearInterval(refreshInterval);
      window.removeEventListener('zmanim-updated', handleZmanimUpdate);
    };
  }, [date]);

  return { dailyTimes };
}
