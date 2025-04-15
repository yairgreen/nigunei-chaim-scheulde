import { useState, useEffect } from 'react';
import { getTodayZmanim, getZmanimForSpecificDate } from '@/lib/database/index';
import type { ZmanimData } from '@/lib/database/zmanim';

export interface DailyTimesData {
  dailyTimes: { name: string; time: string; isNext?: boolean }[];
}

export function useDailyTimes(date?: Date): DailyTimesData {
  const [dailyTimes, setDailyTimes] = useState<{ name: string; time: string; isNext?: boolean }[]>([]);
  const [zmanimData, setZmanimData] = useState<ZmanimData | null>(null);

  const refreshDailyTimes = async () => {
    try {
      // If a specific date is provided, get zmanim for that date
      // Otherwise get today's zmanim
      const data = date 
        ? await getZmanimForSpecificDate(date) 
        : await getTodayZmanim();
      
      if (!data) {
        console.error('No zmanim data available');
        return;
      }

      setZmanimData(data);
      
      const times = [
        { name: 'עלות השחר (72 ד\')', time: data.alotHaShachar, isNext: false },
        { name: 'הנץ החמה', time: data.sunrise, isNext: false },
        { name: 'זמן טלית ותפילין', time: data.misheyakir, isNext: false },
        { name: 'סוף זמן ק"ש (מג״א)', time: data.sofZmanShmaMGA, isNext: false },
        { name: 'סוף זמן ק"ש (גר״א)', time: data.sofZmanShma, isNext: false },
        { name: 'סוף זמן תפילה (מג״א)', time: data.sofZmanTfillaMGA, isNext: false },
        { name: 'סוף זמן תפילה (גר"א)', time: data.sofZmanTfilla, isNext: false },
        { name: 'חצות היום והלילה', time: data.chatzot, isNext: false },
        { name: 'זמן מנחה גדולה', time: data.minchaGedola, isNext: false },
        { name: 'פלג המנחה', time: data.plagHaMincha, isNext: false },
        { name: 'שקיעה', time: data.sunset, isNext: false },
        { name: 'צאת הכוכבים', time: data.beinHaShmashos, isNext: false }
      ];

      // Update with correct next time marker based on current time
      const now = new Date();
      const currentTimeStr = now.toLocaleTimeString('he-IL', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });

      // Find the next time that hasn't passed yet
      const nextTimeIndex = times.findIndex(item => item.time > currentTimeStr);
      if (nextTimeIndex !== -1) {
        times[nextTimeIndex].isNext = true;
      }

      setDailyTimes(times);
    } catch (error) {
      console.error('Error refreshing daily times:', error);
    }
  };

  useEffect(() => {
    // Initial refresh
    refreshDailyTimes();
    
    // Set up event listener for zmanim updates
    const handleZmanimUpdate = () => {
      console.log('Zmanim update detected in useDailyTimes, refreshing...');
      refreshDailyTimes();
    };
    
    window.addEventListener('zmanim-updated', handleZmanimUpdate);
    
    // Refresh times every minute to update the "next" indicator
    const refreshInterval = setInterval(() => {
      // If we have zmanim data, just update the next indicator without fetching new data
      if (zmanimData) {
        const now = new Date();
        const currentTimeStr = now.toLocaleTimeString('he-IL', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });

        const updatedTimes = dailyTimes.map(item => {
          return { ...item, isNext: false };
        });

        // Find the next time that hasn't passed yet
        const nextTimeIndex = updatedTimes.findIndex(item => item.time > currentTimeStr);
        if (nextTimeIndex !== -1) {
          updatedTimes[nextTimeIndex].isNext = true;
        }

        setDailyTimes(updatedTimes);
      } else {
        // If no data, do a full refresh
        refreshDailyTimes();
      }
    }, 60 * 1000); // Check every minute
    
    // Full data refresh every hour
    const hourlyRefreshInterval = setInterval(() => {
      refreshDailyTimes();
    }, 60 * 60 * 1000);
    
    return () => {
      clearInterval(refreshInterval);
      clearInterval(hourlyRefreshInterval);
      window.removeEventListener('zmanim-updated', handleZmanimUpdate);
    };
  }, [date, zmanimData]);

  return { dailyTimes };
}
