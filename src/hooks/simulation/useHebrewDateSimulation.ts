
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fetchRealHebrewDate, fetchHolidayForDate } from './services/hebrewDateApi';
import { validateHebrewDate } from './services/hebrewDateValidation';

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
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    expectedDate: string;
    actualDate: string;
  } | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        // Format gregorian date for display
        const formattedGregorianDate = format(date, 'dd/MM/yyyy');
        setSimulatedGregorianDate(formattedGregorianDate);
        
        // Fetch hebrew date
        const hebrewDate = await fetchRealHebrewDate(date);
        setSimulatedHebrewDate(hebrewDate);
        
        // Fetch holiday information
        const holidayInfo = await fetchHolidayForDate(date);
        setSimulatedTodayHoliday(holidayInfo);
        
        // Validate the hebrew date
        const validationResults = await validateHebrewDate(date, hebrewDate);
        setValidationResult(validationResults);
        
      } catch (error) {
        console.error('Error in Hebrew Date Simulation:', error);
        setSimulatedHebrewDate('כ״ג אדר תשפ״ה');
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
    validationResult,
    isLoading
  };
}
