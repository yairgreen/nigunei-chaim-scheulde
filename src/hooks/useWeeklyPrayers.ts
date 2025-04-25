
import { useState, useEffect } from 'react';
import { getZmanimForWeek } from '@/lib/supabase/zmanim';
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

      // Filter to include only Sunday through Thursday (0-4)
      const weekdayZmanim = weeklyZmanim.filter(zmanim => {
        const date = new Date(zmanim.date);
        const day = date.getDay();
        return day >= 0 && day <= 4; // Sunday (0) through Thursday (4)
      });
      
      console.log('Filtered weekday zmanim:', weekdayZmanim);
      
      // Format data for calculations
      const zmanimForCalc = weekdayZmanim.map(z => ({
        date: z.date,
        sunset: z.sunset,
        beinHaShmashos: z.beinHaShmashos
      }));
      
      // Calculate prayer times
      const minchaTime = calculateWeeklyMinchaTime(zmanimForCalc);
      const arvitTime = calculateWeeklyArvitTime(zmanimForCalc);
      
      console.log('Calculated times:', { minchaTime, arvitTime });
      
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
