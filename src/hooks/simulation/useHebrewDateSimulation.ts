
import { useState, useEffect } from 'react';
import { HebrewDateSimulationResult } from './types/hebrewDateTypes';
import { fetchRealHebrewDate } from './services/hebrewDateApi';
import { validateHebrewDate } from './services/hebrewDateValidation';
import { simulateHebrewDate } from './utils/hebrewDateUtils';

export { runHebrewDateTests } from './utils/hebrewDateTesting';

export function useHebrewDateSimulation(date: Date): HebrewDateSimulationResult {
  const [simulatedHebrewDate, setSimulatedHebrewDate] = useState<string>("");
  const [simulatedGregorianDate, setSimulatedGregorianDate] = useState<string>("");
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    expectedDate: string;
    actualDate: string;
  } | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [simulatedTodayHoliday, setSimulatedTodayHoliday] = useState<string>("");

  useEffect(() => {
    const simulateDate = async () => {
      if (!date) return;
      
      setIsLoading(true);
      
      try {
        const hebrewDate = await fetchRealHebrewDate(date);
        setSimulatedHebrewDate(hebrewDate);
        
        const validation = await validateHebrewDate(date, hebrewDate);
        setValidationResult(validation);
        
        if (!validation.isValid) {
          console.warn("Hebrew date validation failed:", validation);
        }

        const month = date.getMonth();
        const day = date.getDate();
        
        if (month === 2 && day === 15) {
          setSimulatedTodayHoliday("פורים");
        } else if (month === 3 && day === 15) {
          setSimulatedTodayHoliday("פסח");
        } else if (month === 8 && day === 25) {
          setSimulatedTodayHoliday("ראש השנה");
        } else {
          setSimulatedTodayHoliday("");
        }
      } catch (error) {
        const fallbackHebrewDate = simulateHebrewDate(date);
        setSimulatedHebrewDate(fallbackHebrewDate);
        setValidationResult(undefined);
      }
      
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
    validationResult,
    isLoading,
    simulatedTodayHoliday
  };
}
