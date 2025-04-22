
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

interface HebrewDateSimulationResult {
  simulatedHebrewDate: string;
  simulatedGregorianDate: string;
  simulatedTodayHoliday: string;
  validationResult?: {
    isValid: boolean;
    expectedDate: string;
    actualDate: string;
  };
  isLoading: boolean;
}

export function useHebrewDateSimulation(date: Date): HebrewDateSimulationResult {
  const [simulatedHebrewDate, setSimulatedHebrewDate] = useState<string>('');
  const [simulatedGregorianDate, setSimulatedGregorianDate] = useState<string>('');
  const [simulatedTodayHoliday, setSimulatedTodayHoliday] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const formattedDate = format(date, 'yyyy-MM-dd');
        setSimulatedGregorianDate(format(date, 'dd/MM/yyyy'));
        
        // Fetch hebrew date from daily_zmanim
        const { data: zmanimData, error: zmanimError } = await supabase
          .from('daily_zmanim')
          .select('hebrew_date')
          .eq('gregorian_date', formattedDate)
          .single();
        
        if (zmanimError) throw zmanimError;
        
        if (zmanimData?.hebrew_date) {
          setSimulatedHebrewDate(zmanimData.hebrew_date);
        }
        
        // Fetch holiday information from holidays table
        const { data: holidayData, error: holidayError } = await supabase
          .from('holidays')
          .select('hebrew, title')
          .eq('date', formattedDate)
          .eq('category', 'holiday');
        
        if (holidayError) throw holidayError;
        
        if (holidayData && holidayData.length > 0) {
          const holidayNames = holidayData
            .map(holiday => holiday.hebrew || holiday.title)
            .filter(Boolean)
            .join(' | ');
          setSimulatedTodayHoliday(holidayNames);
        }
        
      } catch (error) {
        console.error('Error in Hebrew Date Simulation:', error);
        setSimulatedHebrewDate('');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [date]);

  return {
    simulatedHebrewDate,
    simulatedGregorianDate,
    simulatedTodayHoliday,
    isLoading,
    validationResult: undefined // Remove validation since we're using DB data
  };
}
