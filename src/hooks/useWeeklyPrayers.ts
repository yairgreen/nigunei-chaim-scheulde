
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
  
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const calculateWeeklyPrayers = async () => {
    try {
      console.log('Calculating weekly prayer times...');
      const today = new Date();
      const weekStart = startOfWeek(today);
      const weekEnd = addDays(weekStart, 6);
      
      // Get this week's zmanim data
      console.log('Requesting zmanim data for', format(weekStart, 'yyyy-MM-dd'), 'to', format(weekEnd, 'yyyy-MM-dd'));
      const weeklyZmanim = await getZmanimForWeek(
        format(weekStart, 'yyyy-MM-dd'),
        format(weekEnd, 'yyyy-MM-dd')
      );
      
      if (!weeklyZmanim || weeklyZmanim.length === 0) {
        console.error('No zmanim data available for prayer calculations');
        setErrorMessage('No zmanim data available for prayer calculations');
        return;
      }
      
      console.log('Retrieved zmanim data with', weeklyZmanim.length, 'records');

      // Filter to include only Sunday through Thursday (0-4)
      const weekdayZmanim = weeklyZmanim.filter(zmanim => {
        const date = new Date(zmanim.date);
        const day = date.getDay();
        return day >= 0 && day <= 4; // Sunday (0) through Thursday (4)
      });
      
      console.log('Filtered weekday zmanim:', weekdayZmanim);
      
      // Check if we have enough data after filtering
      if (weekdayZmanim.length === 0) {
        console.error('No weekday zmanim (Sunday-Thursday) available after filtering');
        setErrorMessage('No weekday zmanim available after filtering');
        return;
      }
      
      // Format data for calculations
      const zmanimForCalc = weekdayZmanim.map(z => ({
        date: z.date,
        sunset: z.sunset,
        beinHaShmashos: z.beinHaShmashos
      }));
      
      // Calculate prayer times
      console.log('Calculating times with filtered data...');
      const minchaTime = calculateWeeklyMinchaTime(zmanimForCalc);
      const arvitTime = calculateWeeklyArvitTime(zmanimForCalc);
      
      console.log('Calculated times:', { minchaTime, arvitTime });
      
      // Check if the calculation provided valid times
      if (!minchaTime || !arvitTime) {
        console.error('Failed to calculate valid prayer times:', { minchaTime, arvitTime });
        setErrorMessage('Failed to calculate valid prayer times');
        return;
      }
      
      setWeeklyPrayers({
        minchaTime,
        arvitTime,
        calculatedAt: new Date()
      });
      
      // Reset any previous errors
      setErrorMessage(null);
      
      // Dispatch an event to notify that prayer times have been updated
      window.dispatchEvent(new Event('prayers-updated'));
    } catch (error) {
      console.error('Error calculating weekly prayer times:', error);
      setErrorMessage('Error calculating weekly prayer times');
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

  return { ...weeklyPrayers, errorMessage };
}
