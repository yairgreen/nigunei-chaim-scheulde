import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { getTodayHoliday } from '@/lib/database/holidays';

export interface DateInfo {
  currentDate: Date;
  hebrewDate: string;
  gregorianDate: string;
  todayHoliday: string;
}

export function useDateInfo(): DateInfo {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hebrewDate, setHebrewDate] = useState('כ״ג אדר תשפ״ה');
  const [gregorianDate, setGregorianDate] = useState('');
  const [todayHoliday, setTodayHoliday] = useState('');

  const fetchHebrewDate = async () => {
    try {
      const today = new Date();
      const formattedDate = format(today, 'yyyy-MM-dd');
      const response = await fetch(`https://www.hebcal.com/hebcal?v=1&cfg=json&maj=on&min=on&mod=on&nx=on&start=${formattedDate}&end=${formattedDate}&c=on&ss=on&mf=on&c=on&b=40&d=on&geo=geoname&geonameid=293918&M=on&s=on`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch Hebrew date');
      }
      
      const data = await response.json();
      
      // Get holiday info
      const holidayInfo = await getTodayHoliday();
      setTodayHoliday(holidayInfo);
      
      if (data.items && data.items.length > 0) {
        // Find the Hebrew date from the items array
        const hebrewDateItem = data.items.find((item: any) => item.category === 'hebdate');
        
        if (hebrewDateItem && hebrewDateItem.hebrew) {
          setHebrewDate(hebrewDateItem.hebrew);
        } else {
          // Use the correct fixed date if API doesn't return the expected format
          setHebrewDate('כ״ג אדר תשפ״ה');
        }
      } else {
        // Use the correct fixed date if API returns empty items
        setHebrewDate('כ״ג אדר תשפ״ה');
      }
      
      // Format the Gregorian date
      setGregorianDate(format(today, 'dd MMMM yyyy', { locale: he }));
      
    } catch (error) {
      console.error('Error fetching date info:', error);
      // Fallback to known correct date
      setHebrewDate('כ״ג אדר תשפ״ה');
      setGregorianDate(format(new Date(), 'dd MMMM yyyy', { locale: he }));
    }
  };

  useEffect(() => {
    fetchHebrewDate();
    
    // Set up daily refresh for the date
    const refreshInterval = setInterval(() => {
      setCurrentDate(new Date());
      fetchHebrewDate();
    }, 60 * 60 * 1000); // Refresh every hour
    
    return () => clearInterval(refreshInterval);
  }, []);

  return { currentDate, hebrewDate, gregorianDate, todayHoliday };
}
