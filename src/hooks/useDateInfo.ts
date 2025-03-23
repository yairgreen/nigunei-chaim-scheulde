
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { getTodayHoliday } from '@/lib/database/index';

export interface DateInfo {
  currentDate: Date;
  hebrewDate: string;
  gregorianDate: string;
}

export function useDateInfo(): DateInfo {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hebrewDate, setHebrewDate] = useState('כ״ט אדר ב׳ תשפ״ד');
  const [gregorianDate, setGregorianDate] = useState('');

  const refreshDateInfo = () => {
    try {
      // Get today's date
      const now = new Date();
      
      // Format the dates
      setGregorianDate(format(now, 'dd MMMM yyyy', { locale: he }));
      
      // In a real app, you would get the Hebrew date from the API
      // For now, we'll use the holiday data if available
      const todayHoliday = getTodayHoliday();
      if (todayHoliday && todayHoliday.hebrew) {
        setHebrewDate(todayHoliday.hebrew);
      } else {
        // Fallback Hebrew date - hardcoded for display purposes
        setHebrewDate('כ״ט אדר ב׳ תשפ״ד');
      }
    } catch (error) {
      console.error('Error refreshing date info:', error);
      // Fallback to hardcoded values
      setGregorianDate(format(new Date(), "d MMMM yyyy", { locale: he }));
      setHebrewDate('כ״ט אדר ב׳ תשפ״ד');
    }
  };

  useEffect(() => {
    refreshDateInfo();
    
    // Set up daily refresh for the date
    const refreshInterval = setInterval(() => {
      setCurrentDate(new Date());
      refreshDateInfo();
    }, 60 * 60 * 1000); // Refresh every hour
    
    return () => clearInterval(refreshInterval);
  }, []);

  return { currentDate, hebrewDate, gregorianDate };
}
