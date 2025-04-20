
import { useState, useEffect } from 'react';
import { getZmanimForWeek, ZmanimData } from '@/lib/database/zmanim';
import { formatToHHMM } from '@/lib/utils/timeFormatters';
import { startOfWeek, addDays, format } from 'date-fns';

export interface DailyTimesData {
  dailyTimes: { name: string; time: string; isNext?: boolean }[];
}

export function useDailyTimes(date?: Date): DailyTimesData {
  const [dailyTimes, setDailyTimes] = useState<{ name: string; time: string; isNext?: boolean }[]>([]);
  const [zmanimData, setZmanimData] = useState<ZmanimData | null>(null);

  // Calculate Mincha time based on earliest sunset
  const calculateMinchaTime = (weeklyZmanim: ZmanimData[]): string => {
    // Filter for Sunday-Thursday only
    const weekdayZmanim = weeklyZmanim.filter(item => {
      const dayOfWeek = new Date(item.date).getDay();
      return dayOfWeek >= 0 && dayOfWeek <= 4;
    });

    if (weekdayZmanim.length === 0) return "17:30"; // Fallback

    // Find earliest sunset
    const earliestSunset = weekdayZmanim
      .map(z => z.sunset)
      .filter(Boolean)
      .reduce((earliest, current) => !earliest || current < earliest ? current : earliest);

    if (!earliestSunset) return "17:30";

    // Convert sunset to minutes
    const [hours, minutes] = earliestSunset.split(':').map(Number);
    const sunsetMinutes = hours * 60 + minutes;

    // Calculate range: 11-16 minutes before sunset
    const latestPossible = sunsetMinutes - 11;
    const earliestPossible = sunsetMinutes - 16;

    // Find nearest 5-minute interval within range
    let minchaMinutes = Math.round(((latestPossible + earliestPossible) / 2) / 5) * 5;
    
    // Ensure time is within allowed range
    if (minchaMinutes > latestPossible) {
      minchaMinutes = Math.floor(latestPossible / 5) * 5;
    }
    if (minchaMinutes < earliestPossible) {
      minchaMinutes = Math.ceil(earliestPossible / 5) * 5;
    }

    // Convert back to HH:MM format
    const minchaHours = Math.floor(minchaMinutes / 60);
    const minchaMinutesPart = minchaMinutes % 60;
    return `${String(minchaHours).padStart(2, '0')}:${String(minchaMinutesPart).padStart(2, '0')}`;
  };

  // Calculate Arvit time based on latest tzait hakochavim
  const calculateArvitTime = (weeklyZmanim: ZmanimData[]): string => {
    // Filter for Sunday-Thursday only
    const weekdayZmanim = weeklyZmanim.filter(item => {
      const dayOfWeek = new Date(item.date).getDay();
      return dayOfWeek >= 0 && dayOfWeek <= 4;
    });

    if (weekdayZmanim.length === 0) return "18:45"; // Fallback

    // Find latest tzait hakochavim
    const latestTzait = weekdayZmanim
      .map(z => z.beinHaShmashos)
      .filter(Boolean)
      .reduce((latest, current) => !latest || current > latest ? current : latest);

    if (!latestTzait) return "18:45";

    // Convert tzait to minutes
    const [hours, minutes] = latestTzait.split(':').map(Number);
    const tzaitMinutes = hours * 60 + minutes;

    // Calculate range: 1 minute before to 4 minutes after
    const earliestPossible = tzaitMinutes - 1;
    const latestPossible = tzaitMinutes + 4;

    // Find nearest 5-minute interval within range
    let arvitMinutes = Math.round(((latestPossible + earliestPossible) / 2) / 5) * 5;
    
    // Ensure time is within allowed range
    if (arvitMinutes < earliestPossible) {
      arvitMinutes = Math.ceil(earliestPossible / 5) * 5;
    }
    if (arvitMinutes > latestPossible) {
      arvitMinutes = Math.floor(latestPossible / 5) * 5;
    }

    // Convert back to HH:MM format
    const arvitHours = Math.floor(arvitMinutes / 60);
    const arvitMinutesPart = arvitMinutes % 60;
    return `${String(arvitHours).padStart(2, '0')}:${String(arvitMinutesPart).padStart(2, '0')}`;
  };

  // Update times from zmanim data
  const updateTimesFromData = (data: ZmanimData, weeklyZmanim: ZmanimData[]) => {
    console.log('Updating times from data:', data);
    
    // Make sure we have valid data to work with
    if (!data) {
      console.error('No zmanim data provided to updateTimesFromData');
      setDailyTimes([]);
      return;
    }
    
    // Create times array with formatted values
    const times = [
      { name: 'עלות השחר (72 ד\')', time: formatToHHMM(data.alotHaShachar) },
      { name: 'הנץ החמה', time: formatToHHMM(data.sunrise) },
      { name: 'זמן טלית ותפילין', time: formatToHHMM(data.misheyakir) },
      { name: 'סוף זמן ק"ש (מג״א)', time: formatToHHMM(data.sofZmanShmaMGA) },
      { name: 'סוף זמן ק"ש (גר״א)', time: formatToHHMM(data.sofZmanShma) },
      { name: 'סוף זמן תפילה (מג״א)', time: formatToHHMM(data.sofZmanTfillaMGA) },
      { name: 'סוף זמן תפילה (גר"א)', time: formatToHHMM(data.sofZmanTfilla) },
      { name: 'חצות היום והלילה', time: formatToHHMM(data.chatzot) },
      { name: 'זמן מנחה גדולה', time: formatToHHMM(data.minchaGedola) },
      { name: 'מנחה', time: calculateMinchaTime(weeklyZmanim) },
      { name: 'שקיעה', time: formatToHHMM(data.sunset) },
      { name: 'צאת הכוכבים', time: formatToHHMM(data.beinHaShmashos) },
      { name: 'ערבית א׳', time: calculateArvitTime(weeklyZmanim) }
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

    // Reset all isNext flags
    const updatedTimes = times.map(item => ({ ...item, isNext: false }));

    // Find the next time that hasn't passed yet
    const nextTimeIndex = updatedTimes.findIndex(item => item.time > currentTimeStr);
    if (nextTimeIndex !== -1) {
      updatedTimes[nextTimeIndex].isNext = true;
    }

    setDailyTimes(updatedTimes);
  };

  useEffect(() => {
    const fetchZmanimData = async () => {
      try {
        console.log('Fetching zmanim data...');
        
        // Get start of current week
        const weekStart = startOfWeek(date || new Date(), { weekStartsOn: 0 });
        console.log('Week start:', format(weekStart, 'yyyy-MM-dd'));
        
        // Get zmanim for the whole week
        const weeklyZmanim = getZmanimForWeek(weekStart);
        console.log('Weekly zmanim:', weeklyZmanim);
        
        // Get specific date's zmanim
        const targetDate = date || new Date();
        const formattedDate = format(targetDate, 'yyyy-MM-dd');
        console.log('Looking for zmanim for date:', formattedDate);
        
        const todayZmanim = weeklyZmanim.find(z => z.date === formattedDate);
        console.log('Today zmanim:', todayZmanim);

        if (todayZmanim) {
          setZmanimData(todayZmanim);
          updateTimesFromData(todayZmanim, weeklyZmanim);
        } else {
          console.error('No zmanim found for today:', formattedDate);
          // Use default times if no data available
          const defaultTimes = [
            { name: 'עלות השחר (72 ד\')', time: '05:00' },
            { name: 'הנץ החמה', time: '06:00' },
            { name: 'זמן טלית ותפילין', time: '05:40' },
            { name: 'סוף זמן ק"ש (מג״א)', time: '08:30' },
            { name: 'סוף זמן ק"ש (גר״א)', time: '09:10' },
            { name: 'סוף זמן תפילה (מג״א)', time: '09:40' },
            { name: 'סוף זמן תפילה (גר"א)', time: '10:10' },
            { name: 'חצות היום והלילה', time: '12:00' },
            { name: 'זמן מנחה גדולה', time: '12:30' },
            { name: 'מנחה', time: '17:30' },
            { name: 'שקיעה', time: '18:00' },
            { name: 'צאת הכוכבים', time: '18:30' },
            { name: 'ערבית א׳', time: '18:45' }
          ];
          updateNextTimeIndicator(defaultTimes);
        }
      } catch (error) {
        console.error('Error fetching daily times:', error);
        
        // Set default times in case of error
        const defaultTimes = [
          { name: 'עלות השחר (72 ד\')', time: '05:00' },
          { name: 'הנץ החמה', time: '06:00' },
          { name: 'זמן טלית ותפילין', time: '05:40' },
          { name: 'סוף זמן ק"ש (מג״א)', time: '08:30' },
          { name: 'סוף זמן ק"ש (גר״א)', time: '09:10' },
          { name: 'סוף זמן תפילה (מג״א)', time: '09:40' },
          { name: 'סוף זמן תפילה (גר"א)', time: '10:10' },
          { name: 'חצות היום והלילה', time: '12:00' },
          { name: 'זמן מנחה גדולה', time: '12:30' },
          { name: 'מנחה', time: '17:30' },
          { name: 'שקיעה', time: '18:00' },
          { name: 'צאת הכוכבים', time: '18:30' },
          { name: 'ערבית א׳', time: '18:45' }
        ];
        updateNextTimeIndicator(defaultTimes);
      }
    };

    fetchZmanimData();
    
    // Set up minute interval for updating "next" indicator
    const minuteInterval = setInterval(() => {
      if (zmanimData) {
        const weekStart = startOfWeek(date || new Date(), { weekStartsOn: 0 });
        const weeklyZmanim = getZmanimForWeek(weekStart);
        updateTimesFromData(zmanimData, weeklyZmanim);
      } else {
        // Try to fetch data again if it wasn't available
        fetchZmanimData();
      }
    }, 60 * 1000);
    
    return () => clearInterval(minuteInterval);
  }, [date]);

  return { dailyTimes };
}
