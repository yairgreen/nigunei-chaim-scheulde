
import { useState, useEffect } from 'react';
import { getTodayZmanim, getZmanimForSpecificDate } from '@/lib/database/index';
import { formatToHHMM } from '@/lib/utils/timeFormatters';
import type { ZmanimData } from '@/lib/database/zmanim';

export interface DailyTimesData {
  dailyTimes: { name: string; time: string; isNext?: boolean }[];
}

export function useDailyTimes(date?: Date): DailyTimesData {
  const [dailyTimes, setDailyTimes] = useState<{ name: string; time: string; isNext?: boolean }[]>([]);
  const [zmanimData, setZmanimData] = useState<ZmanimData | null>(null);

  // Format time to HH:MM format
  const formatToHHMM = (timeString: string): string => {
    try {
      // If the time is already in HH:MM format, return it
      if (timeString.match(/^\d{2}:\d{2}$/)) return timeString;
      
      // Try to parse as HH:MM:SS format
      const match = timeString.match(/^(\d{2}):(\d{2}):\d{2}$/);
      if (match) {
        return `${match[1]}:${match[2]}`;
      }
      
      // If it's a valid date string, convert to HH:MM
      const date = new Date(timeString);
      if (!isNaN(date.getTime())) {
        return date.toLocaleTimeString('he-IL', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
      }
      
      // Return original if parsing fails
      return timeString;
    } catch (error) {
      console.error('Error formatting time:', error);
      return timeString;
    }
  };

  // Fetch zmanim data from the database
  const fetchZmanimData = async () => {
    try {
      console.log('Fetching daily zmanim data...');
      // If a specific date is provided, get zmanim for that date
      // Otherwise get today's zmanim
      const data = date 
        ? await getZmanimForSpecificDate(date) 
        : await getTodayZmanim();
      
      if (!data) {
        console.error('No zmanim data available');
        return;
      }

      console.log('Zmanim data received:', data);
      setZmanimData(data);
      
      // Process the data into times array with formatted times
      updateTimesFromData(data);
    } catch (error) {
      console.error('Error fetching daily times:', error);
    }
  };

  // Update the dailyTimes array based on zmanimData
  const updateTimesFromData = (data: ZmanimData) => {
    const times = [
      { name: 'עלות השחר (72 ד\')', time: formatToHHMM(data.alotHaShachar), isNext: false },
      { name: 'הנץ החמה', time: formatToHHMM(data.sunrise), isNext: false },
      { name: 'זמן טלית ותפילין', time: formatToHHMM(data.misheyakir), isNext: false },
      { name: 'סוף זמן ק"ש (מג״א)', time: formatToHHMM(data.sofZmanShmaMGA), isNext: false },
      { name: 'סוף זמן ק"ש (גר״א)', time: formatToHHMM(data.sofZmanShma), isNext: false },
      { name: 'סוף זמן תפילה (מג״א)', time: formatToHHMM(data.sofZmanTfillaMGA), isNext: false },
      { name: 'סוף זמן תפילה (גר"א)', time: formatToHHMM(data.sofZmanTfilla), isNext: false },
      { name: 'חצות היום והלילה', time: formatToHHMM(data.chatzot), isNext: false },
      { name: 'זמן מנחה גדולה', time: formatToHHMM(data.minchaGedola), isNext: false },
      { name: 'פלג המנחה', time: formatToHHMM(data.plagHaMincha), isNext: false },
      { name: 'שקיעה', time: formatToHHMM(data.sunset), isNext: false },
      { name: 'צאת הכוכבים', time: formatToHHMM(data.beinHaShmashos), isNext: false }
    ];

    updateNextTimeIndicator(times);
  };

  // Update the "next" indicator based on current time
  const updateNextTimeIndicator = (times: Array<{ name: string; time: string; isNext?: boolean }>) => {
    const now = new Date();
    const currentTimeStr = now.toLocaleTimeString('he-IL', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    console.log('Current time for next marker:', currentTimeStr);

    // Reset all isNext flags
    const updatedTimes = times.map(item => {
      return { ...item, isNext: false };
    });

    // Find the next time that hasn't passed yet
    const nextTimeIndex = updatedTimes.findIndex(item => item.time > currentTimeStr);
    if (nextTimeIndex !== -1) {
      updatedTimes[nextTimeIndex].isNext = true;
      console.log('Next time is:', updatedTimes[nextTimeIndex].name, 'at', updatedTimes[nextTimeIndex].time);
    } else {
      console.log('No next time found');
    }

    setDailyTimes(updatedTimes);
  };

  useEffect(() => {
    // Initial data fetch
    fetchZmanimData();
    
    // Set up event listener for zmanim updates
    const handleZmanimUpdate = () => {
      console.log('Zmanim update detected in useDailyTimes, refreshing...');
      fetchZmanimData();
    };
    
    window.addEventListener('zmanim-updated', handleZmanimUpdate);
    
    // Still keep the minute interval just to update the "next" indicator
    // This doesn't fetch new data, only updates the UI based on current time
    const minuteInterval = setInterval(() => {
      if (zmanimData) {
        // Just update the "next" indicator without fetching new data
        const times = [
          { name: 'עלות השחר (72 ד\')', time: formatToHHMM(zmanimData.alotHaShachar), isNext: false },
          { name: 'הנץ החמה', time: formatToHHMM(zmanimData.sunrise), isNext: false },
          { name: 'זמן טלית ותפילין', time: formatToHHMM(zmanimData.misheyakir), isNext: false },
          { name: 'סוף זמן ק"ש (מג״א)', time: formatToHHMM(zmanimData.sofZmanShmaMGA), isNext: false },
          { name: 'סוף זמן ק"ש (גר״א)', time: formatToHHMM(zmanimData.sofZmanShma), isNext: false },
          { name: 'סוף זמן תפילה (מג״א)', time: formatToHHMM(zmanimData.sofZmanTfillaMGA), isNext: false },
          { name: 'סוף זמן תפילה (גר"א)', time: formatToHHMM(zmanimData.sofZmanTfilla), isNext: false },
          { name: 'חצות היום והלילה', time: formatToHHMM(zmanimData.chatzot), isNext: false },
          { name: 'זמן מנחה גדולה', time: formatToHHMM(zmanimData.minchaGedola), isNext: false },
          { name: 'פלג המנחה', time: formatToHHMM(zmanimData.plagHaMincha), isNext: false },
          { name: 'שקיעה', time: formatToHHMM(zmanimData.sunset), isNext: false },
          { name: 'צאת הכוכבים', time: formatToHHMM(zmanimData.beinHaShmashos), isNext: false }
        ];
        updateNextTimeIndicator(times);
      }
    }, 60 * 1000); // Update every minute
    
    // Full data refresh every day at midnight
    const setupDailyRefresh = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const msUntilMidnight = tomorrow.getTime() - now.getTime();
      
      console.log(`Scheduling next daily zmanim refresh in ${msUntilMidnight / 1000 / 60} minutes`);
      
      return setTimeout(() => {
        console.log('Performing scheduled daily zmanim refresh');
        fetchZmanimData();
        // Set up the next day's refresh
        const nextRefresh = setupDailyRefresh();
        return nextRefresh;
      }, msUntilMidnight);
    };
    
    // Initialize the daily refresh scheduler
    const dailyRefreshTimeout = setupDailyRefresh();
    
    return () => {
      clearInterval(minuteInterval);
      clearTimeout(dailyRefreshTimeout);
      window.removeEventListener('zmanim-updated', handleZmanimUpdate);
    };
  }, [date, zmanimData]);

  return { dailyTimes };
}
