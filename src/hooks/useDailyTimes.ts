import { useState, useEffect } from 'react';
import { getTodayZmanim, getZmanimForSpecificDate } from '@/lib/database/index';
import type { ZmanimData } from '@/lib/database/zmanim';
import { format } from 'date-fns';

export interface DailyTimesData {
  dailyTimes: { name: string; time: string; isNext?: boolean }[];
}

export function useDailyTimes(date?: Date): DailyTimesData {
  const [dailyTimes, setDailyTimes] = useState<{ name: string; time: string; isNext?: boolean }[]>([]);
  const [zmanimData, setZmanimData] = useState<ZmanimData | null>(null);

  // Helper function to format time to HH:MM
  const formatTimeToHHMM = (timeStr: string): string => {
    if (!timeStr) return '--:--';
    
    try {
      // If timeStr is already in HH:MM format, return as is
      if (/^\d{2}:\d{2}$/.test(timeStr)) return timeStr;
      
      // If it's a full date/time string, parse and format
      const parsedTime = new Date(timeStr);
      return format(parsedTime, 'HH:mm');
    } catch (error) {
      console.error('Error formatting time:', error);
      return '--:--';
    }
  };

  const refreshDailyTimes = async () => {
    try {
      const data = date 
        ? await getZmanimForSpecificDate(date) 
        : await getTodayZmanim();
      
      if (!data) {
        console.error('No zmanim data available');
        return;
      }

      const times = [
        { name: 'עלות השחר (72 ד\')', time: formatTimeToHHMM(data.alotHaShachar), isNext: false },
        { name: 'הנץ החמה', time: formatTimeToHHMM(data.sunrise), isNext: false },
        { name: 'זמן טלית ותפילין', time: formatTimeToHHMM(data.misheyakir), isNext: false },
        { name: 'סוף זמן ק"ש (מג״א)', time: formatTimeToHHMM(data.sofZmanShmaMGA), isNext: false },
        { name: 'סוף זמן ק"ש (גר״א)', time: formatTimeToHHMM(data.sofZmanShma), isNext: false },
        { name: 'סוף זמן תפילה (מג״א)', time: formatTimeToHHMM(data.sofZmanTfillaMGA), isNext: false },
        { name: 'סוף זמן תפילה (גר"א)', time: formatTimeToHHMM(data.sofZmanTfilla), isNext: false },
        { name: 'חצות היום והלילה', time: formatTimeToHHMM(data.chatzot), isNext: false },
        { name: 'זמן מנחה גדולה', time: formatTimeToHHMM(data.minchaGedola), isNext: false },
        { name: 'פלג המנחה', time: formatTimeToHHMM(data.plagHaMincha), isNext: false },
        { name: 'שקיעה', time: formatTimeToHHMM(data.sunset), isNext: false },
        { name: 'צאת הכוכבים', time: formatTimeToHHMM(data.beinHaShmashos), isNext: false }
      ];

      // Current time in HH:MM format
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
