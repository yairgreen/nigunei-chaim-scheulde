
import { useState, useEffect } from 'react';
import { getTodayZmanim, fetchDailyZmanim } from '@/lib/database/index';
import { format } from 'date-fns';

export interface DailyTimesData {
  dailyTimes: { name: string; time: string; isNext?: boolean }[];
}

export function useDailyTimes(selectedDate?: Date): DailyTimesData {
  const [dailyTimes, setDailyTimes] = useState<{ name: string; time: string; isNext?: boolean }[]>([]);

  const refreshDailyTimes = async () => {
    try {
      // Get zmanim for the selected date or today
      const date = selectedDate || new Date();
      const formattedDate = format(date, 'yyyy-MM-dd');
      console.log('Fetching zmanim for date:', formattedDate);
      
      // Fetch fresh data from API for the specific date
      const zmanimData = await fetchDailyZmanim(formattedDate);
      console.log('Fetched zmanim data:', zmanimData);
      
      if (!zmanimData) {
        console.warn('No zmanim data available, using defaults');
        setDailyTimes(getDefaultTimes());
        return;
      }
      
      // Format the zmanim for display
      const zmanim = [
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
      
      // Find which time is next
      markNextTime(zmanim);
      
      setDailyTimes(zmanim);
    } catch (error) {
      console.error('Error refreshing daily times:', error);
      setDailyTimes(getDefaultTimes());
    }
  };

  // Helper function to mark the next time
  const markNextTime = (times: Array<{ name: string; time: string; isNext?: boolean }>) => {
    // Reset all isNext flags
    times.forEach(time => {
      if ('isNext' in time) {
        delete time.isNext;
      }
    });
    
    // Current time in HH:MM format
    const now = new Date();
    const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    // Find the next time that hasn't passed yet
    const nextTimeIndex = times.findIndex(item => item.time > currentTimeStr);
    if (nextTimeIndex !== -1) {
      times[nextTimeIndex].isNext = true;
    }
  };
  
  // Default times if API fails
  const getDefaultTimes = () => {
    return [
      { name: 'עלות השחר (72 ד\')', time: '04:28' },
      { name: 'הנץ החמה', time: '05:40' },
      { name: 'זמן טלית ותפילין', time: '04:50' },
      { name: 'סוף זמן ק"ש (מג״א)', time: '08:08' },
      { name: 'סוף זמן ק"ש (גר״א)', time: '08:44' },
      { name: 'סוף זמן תפילה (מג״א)', time: '09:21' },
      { name: 'סוף זמן תפילה (גר"א)', time: '09:45' },
      { name: 'חצות היום והלילה', time: '11:47' },
      { name: 'זמן מנחה גדולה', time: '12:18' },
      { name: 'פלג המנחה', time: '16:38' },
      { name: 'שקיעה', time: '17:54' },
      { name: 'צאת הכוכבים', time: '18:11' }
    ];
  };

  useEffect(() => {
    refreshDailyTimes();
    
    // Refresh times every minute to update "next" time indicator
    const refreshInterval = setInterval(() => {
      markNextTime(dailyTimes);
      setDailyTimes([...dailyTimes]); // Force re-render with spread operator
    }, 60 * 1000);
    
    // Daily refresh at midnight
    const scheduleNextDailyRefresh = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const msUntilMidnight = tomorrow.getTime() - now.getTime();
      
      console.log(`Scheduling next daily refresh in ${Math.round(msUntilMidnight / 1000 / 60)} minutes`);
      
      setTimeout(() => {
        console.log('Performing daily refresh of zmanim data');
        refreshDailyTimes();
        scheduleNextDailyRefresh(); // Schedule next day's refresh
      }, msUntilMidnight);
    };
    
    // Initial scheduling
    scheduleNextDailyRefresh();
    
    return () => {
      clearInterval(refreshInterval);
    };
  }, [selectedDate]);

  return { dailyTimes };
}
