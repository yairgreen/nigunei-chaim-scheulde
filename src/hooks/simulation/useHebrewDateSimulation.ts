import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
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
        const formattedGregorianDate = format(date, 'dd MMMM yyyy', { locale: he });
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
        // Set fallback values
        setSimulatedHebrewDate('כ״ג אדר תשפ״ה');
        // Keep the formatted gregorian date as is
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

// Testing function for Hebrew dates
export const runHebrewDateTests = async () => {
  const testCases = [
    { date: new Date(2025, 3, 22), expectedHebrew: 'כ״ד ניסן תשפ״ה' }, // April 22, 2025
    { date: new Date(2025, 3, 15), expectedHebrew: 'י״ז ניסן תשפ״ה' },  // April 15, 2025
    { date: new Date(2025, 2, 15), expectedHebrew: 'ט״ו אדר ב׳ תשפ״ה' }, // March 15, 2025
  ];
  
  const results = [];
  
  for (const test of testCases) {
    try {
      const hebrewDate = await fetchRealHebrewDate(test.date);
      const isMatch = hebrewDate === test.expectedHebrew;
      
      results.push({
        date: format(test.date, 'yyyy-MM-dd'),
        expected: test.expectedHebrew,
        actual: hebrewDate,
        passed: isMatch
      });
    } catch (error) {
      results.push({
        date: format(test.date, 'yyyy-MM-dd'),
        expected: test.expectedHebrew,
        actual: 'Error fetching',
        passed: false,
        error: String(error)
      });
    }
  }
  
  console.table(results);
  
  return results;
};
