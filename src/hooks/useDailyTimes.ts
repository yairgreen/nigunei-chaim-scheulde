
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
        // Get start of current week
        const weekStart = startOfWeek(date || new Date(), { weekStartsOn: 0 });
        
        // Get zmanim for the whole week
        const weeklyZmanim = getZmanimForWeek(weekStart);
        
        // Get specific date's zmanim
        const targetDate = date || new Date();
        const formattedDate = format(targetDate, 'yyyy-MM-dd');
        const todayZmanim = weeklyZmanim.find(z => z.date === formattedDate);

        if (todayZmanim) {
          setZmanimData(todayZmanim);
          updateTimesFromData(todayZmanim, weeklyZmanim);
        }
      } catch (error) {
        console.error('Error fetching daily times:', error);
      }
    };

    fetchZmanimData();
    
    // Set up minute interval for updating "next" indicator
    const minuteInterval = setInterval(() => {
      if (zmanimData) {
        const weekStart = startOfWeek(date || new Date(), { weekStartsOn: 0 });
        const weeklyZmanim = getZmanimForWeek(weekStart);
        updateTimesFromData(zmanimData, weeklyZmanim);
      }
    }, 60 * 1000);
    
    return () => clearInterval(minuteInterval);
  }, [date, zmanimData]);

  return { dailyTimes };
}
