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
        { name: 'עלות השחר (72 ד\')', time: data.alotHaShachar },
        { name: 'הנץ החמה', time: data.sunrise },
        { name: 'זמן טלית ותפילין', time: data.misheyakir },
        { name: 'סוף זמן ק"ש (מג״א)', time: data.sofZmanShmaMGA },
        { name: 'סוף זמן ק"ש (גר״א)', time: data.sofZmanShma },
        { name: 'סוף זמן תפילה (מג״א)', time: data.sofZmanTfillaMGA },
        { name: 'סוף זמן תפילה (גר"א)', time: data.sofZmanTfilla },
        { name: 'חצות היום והלילה', time: data.chatzot },
        { name: 'זמן מנחה גדולה', time: data.minchaGedola },
        { name: 'פלג המנחה', time: data.plagHaMincha },
        { name: 'שקיעה', time: data.sunset },
        { name: 'צאת הכוכבים', time: data.beinHaShmashos }
      ];

      // Update with correct next time marker based on current time
      const now = new Date();
      const currentTimeStr = now.toLocaleTimeString('he-IL', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });

      const timesWithNext = times.map(item => {
        // Remove any previous next markers
        return { name: item.name, time: item.time };
      });

      // Find the next time that hasn't passed yet
      const nextTimeIndex = timesWithNext.findIndex(item => item.time > currentTimeStr);
      if (nextTimeIndex !== -1) {
        timesWithNext[nextTimeIndex].isNext = true;
      }

      setDailyTimes(timesWithNext);
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
          // Remove any previous next markers
          return { name: item.name, time: item.time };
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
