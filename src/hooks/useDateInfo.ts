
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';

export interface DateInfo {
  currentDate: Date;
  hebrewDate: string;
  gregorianDate: string;
  todayHoliday: string;
}

export function useDateInfo(): DateInfo {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hebrewDate, setHebrewDate] = useState('');
  const [gregorianDate, setGregorianDate] = useState('');
  const [todayHoliday, setTodayHoliday] = useState('');

  const fetchHebrewDate = async () => {
    try {
      const today = new Date();
      const formattedDate = format(today, 'yyyy-MM-dd');
      
      // Get Hebrew date from Supabase
      const { data: dateData, error: dateError } = await supabase
        .from('daily_zmanim')
        .select('hebrew_date')
        .eq('gregorian_date', formattedDate)
        .single();

      if (dateError) {
        console.error('Failed to fetch Hebrew date:', dateError.message);
        setHebrewDate('תאריך עברי לא זמין');
      } else if (dateData && dateData.hebrew_date) {
        setHebrewDate(dateData.hebrew_date);
      } else {
        setHebrewDate('תאריך עברי לא זמין');
      }
      
      // Get holiday info from Supabase
      const { data: holidayData, error: holidayError } = await supabase
        .from('holidays')
        .select('hebrew, title')
        .eq('date', formattedDate);
        
      if (!holidayError && holidayData && holidayData.length > 0) {
        // If there are multiple holidays, join them with a separator
        const holidayNames = holidayData.map(h => h.hebrew || h.title).filter(Boolean);
        setTodayHoliday(holidayNames.join(' | '));
      } else {
        setTodayHoliday('');
      }
      
      // Format the Gregorian date
      setGregorianDate(format(today, 'dd/MM/yyyy', { locale: he }));
    } catch (error) {
      console.error('Error fetching date info:', error);
      setHebrewDate('תאריך עברי לא זמין');
      setGregorianDate(format(new Date(), 'dd/MM/yyyy', { locale: he }));
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
