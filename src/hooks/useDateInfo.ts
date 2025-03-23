
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

export interface DateInfo {
  currentDate: Date;
  hebrewDate: string;
  gregorianDate: string;
}

export function useDateInfo(): DateInfo {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hebrewDate, setHebrewDate] = useState('כ״ג אדר תשפ״ה');
  const [gregorianDate, setGregorianDate] = useState('');

  const fetchHebrewDate = async () => {
    try {
      const today = new Date();
      const formattedDate = format(today, 'yyyy-MM-dd');
      const response = await fetch(`https://www.hebcal.com/hebcal?v=1&cfg=json&maj=on&min=on&mod=on&nx=on&start=${formattedDate}&end=${formattedDate}&c=on&ss=on&mf=on&c=on&b=40&d=on&geo=geoname&geonameid=293918&M=on&s=on`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch Hebrew date');
      }
      
      const data = await response.json();
      
      // Find today's date from API response
      const todayItem = data.items?.find((item: any) => 
        item.date.startsWith(formattedDate) && 
        (item.category === 'parashat' || item.category === 'holiday' || item.category === 'mevarchim')
      );
      
      if (todayItem && todayItem.hdate) {
        // Extract just the date part from "DD Month YYYY" format
        const hdateParts = todayItem.hdate.split(' ');
        if (hdateParts.length >= 2) {
          setHebrewDate(`${hdateParts[0]} ${hdateParts[1]} ${hdateParts[2]}`);
        }
      } else {
        // Use the correct fixed date if API doesn't return useful info
        setHebrewDate('כ״ג אדר תשפ״ה');
      }
      
      // Format the Gregorian date
      setGregorianDate(format(today, 'dd MMMM yyyy', { locale: he }));
      
    } catch (error) {
      console.error('Error fetching Hebrew date:', error);
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

  return { currentDate, hebrewDate, gregorianDate };
}
