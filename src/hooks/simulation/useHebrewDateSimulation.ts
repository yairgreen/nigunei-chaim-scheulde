
import { useState, useEffect } from 'react';
import { fetchRealHebrewDate, simulateHebrewDate, validateHebrewDate } from './hebrewDateSimulation';

export interface HebrewDateSimulationResult {
  simulatedHebrewDate: string;
  simulatedGregorianDate: string;
  validationResult?: {
    isValid: boolean;
    expectedDate: string;
    actualDate: string;
  };
  isLoading: boolean;
}

export function useHebrewDateSimulation(date: Date): HebrewDateSimulationResult {
  const [simulatedHebrewDate, setSimulatedHebrewDate] = useState<string>("");
  const [simulatedGregorianDate, setSimulatedGregorianDate] = useState<string>("");
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    expectedDate: string;
    actualDate: string;
  } | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const simulateDate = async () => {
      if (!date) return;
      
      setIsLoading(true);
      
      try {
        // First, try to get the real Hebrew date from the API
        const hebrewDate = await fetchRealHebrewDate(date);
        setSimulatedHebrewDate(hebrewDate);
        
        // Validate the Hebrew date
        const validation = await validateHebrewDate(date, hebrewDate);
        setValidationResult(validation);
        
        if (!validation.isValid) {
          console.warn("Hebrew date validation failed:", validation);
        }
      } catch (error) {
        // If API call fails, fall back to simulated date
        const fallbackHebrewDate = simulateHebrewDate(date);
        setSimulatedHebrewDate(fallbackHebrewDate);
        setValidationResult(undefined);
      }
      
      // Format Gregorian date properly in dd/mm/yyyy format
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
    isLoading
  };
}
