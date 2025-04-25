
import { useState, useEffect } from 'react';
import { getZmanimForWeek } from '@/lib/database/index';
import { startOfWeek, addDays, format } from 'date-fns';
import { calculateWeeklyMinchaTime, calculateWeeklyArvitTime } from '@/lib/database/prayers';
import type { ZmanimData } from '@/lib/database/zmanim';

interface WeeklyPrayerTimes {
  minchaTime: string;
  arvitTime: string;
  calculatedAt: Date;
}

export function useWeeklyPrayers() {
  const [weeklyPrayers, setWeeklyPrayers] = useState<WeeklyPrayerTimes>({
    minchaTime: '',
    arvitTime: '',
    calculatedAt: new Date()
  });

  const calculateWeeklyPrayers = async () => {
    try {
      const today = new Date();
      const weekStart = startOfWeek(today);
      const weekEnd = addDays(weekStart, 6);
      
      // Get this week's zmanim data
      const weeklyZmanim = await getZmanimForWeek(
        format(weekStart, 'yyyy-MM-dd'),
        format(weekEnd, 'yyyy-MM-dd')
      );
      
      if (!weeklyZmanim || weeklyZmanim.length === 0) {
        console.warn('No zmanim data available for prayer calculations');
        return;
      }
      
      // Format data for calculations
      const zmanimForCalc = weeklyZmanim.map(z => ({
        date: z.date,
        sunset: z.sunset,
        beinHaShmashos: z.beinHaShmashos
      }));
      
      // Calculate prayer times
      const minchaTime = calculateWeeklyMinchaTime(zmanimForCalc);
      const arvitTime = calculateWeeklyArvitTime(zmanimForCalc);
      
      setWeeklyPrayers({
        minchaTime,
        arvitTime,
        calculatedAt: new Date()
      });
    } catch (error) {
      console.error('Error calculating weekly prayer times:', error);
    }
  };

  // Calculate on mount and when week changes
  useEffect(() => {
    calculateWeeklyPrayers();
    
    // Set up weekly recalculation every Sunday at midnight
    const checkForSunday = () => {
      const now = new Date();
      if (now.getDay() === 0 && now.getHours() === 0) {
        calculateWeeklyPrayers();
      }
    };
    
    const interval = setInterval(checkForSunday, 60 * 60 * 1000); // Check every hour
    
    return () => clearInterval(interval);
  }, []);

  return weeklyPrayers;
}
