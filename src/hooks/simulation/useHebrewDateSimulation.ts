
import { useState, useEffect } from 'react';
import { HebrewDateSimulationResult } from './types/hebrewDateTypes';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

export function useHebrewDateSimulation(date: Date): HebrewDateSimulationResult {
  const [simulatedHebrewDate, setSimulatedHebrewDate] = useState<string>("");
  const [simulatedGregorianDate, setSimulatedGregorianDate] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [simulatedTodayHoliday, setSimulatedTodayHoliday] = useState<string>("");

  useEffect(() => {
    const simulateDate = async () => {
      if (!date) return;
      
      setIsLoading(true);
      
      try {
        // Format date for Supabase query
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;
        
        // Get Hebrew date from Supabase
        const { data: dateData, error: dateError } = await supabase
          .from('daily_zmanim')
          .select('hebrew_date')
          .eq('gregorian_date', formattedDate)
          .single();

        if (dateError) {
          console.error('Error fetching Hebrew date:', dateError.message);
          setSimulatedHebrewDate('תאריך עברי לא זמין');
        } else if (dateData && dateData.hebrew_date) {
          setSimulatedHebrewDate(dateData.hebrew_date);
        } else {
          setSimulatedHebrewDate('תאריך עברי לא זמין');
        }
        
        // Get holiday info from Supabase
        const { data: holidayData, error: holidayError } = await supabase
          .from('holidays')
          .select('hebrew, title')
          .eq('date', formattedDate);
          
        if (!holidayError && holidayData && holidayData.length > 0) {
          // If there are multiple holidays, join them with a separator
          const holidayNames = holidayData.map(h => h.hebrew || h.title).filter(Boolean);
          setSimulatedTodayHoliday(holidayNames.join(' | '));
        } else {
          setSimulatedTodayHoliday('');
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setSimulatedHebrewDate('תאריך עברי לא זמין');
        setSimulatedTodayHoliday('');
      }
      
      // Format Gregorian date
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const gregorianDate = `${day}/${month}/${year}`;
      setSimulatedGregorianDate(gregorianDate);
      
      setIsLoading(false);
    };

    simulateDate();
  }, [date]);

  return {
    simulatedHebrewDate,
    simulatedGregorianDate,
    isLoading,
    simulatedTodayHoliday
  };
}
