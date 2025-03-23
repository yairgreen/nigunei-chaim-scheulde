
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
      
      // Format the Gregorian date
      setGregorianDate(format(now, 'dd MMMM yyyy', { locale: he }));
      
      // Get the Hebrew date from the holiday data if available
      const todayHoliday = getTodayHoliday();
      if (todayHoliday && todayHoliday.hebrew) {
        setHebrewDate(todayHoliday.hebrew);
      } else {
        // Use a more current fallback Hebrew date
        setHebrewDate('ד׳ סיון תשפ״ד');
      }
    } catch (error) {
      console.error('Error refreshing date info:', error);
      // Fallback to hardcoded values
      setGregorianDate(format(new Date(), "d MMMM yyyy", { locale: he }));
      setHebrewDate('ד׳ סיון תשפ״ד');
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
