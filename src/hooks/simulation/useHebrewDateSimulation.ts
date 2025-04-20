
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
  simulatedTodayHoliday?: string; // Added this property to the interface
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
  const [simulatedTodayHoliday, setSimulatedTodayHoliday] = useState<string>(""); // Added state for holiday

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

        // For simulation purposes, we'll set some holiday data based on the date
        // This is a simple implementation - in a real app, this would come from an API or database
        const month = date.getMonth();
        const day = date.getDate();
        
        // Simple mapping for demo holidays
        if (month === 2 && day === 15) { // March 15
          setSimulatedTodayHoliday("פורים");
        } else if (month === 3 && day === 15) { // April 15
          setSimulatedTodayHoliday("פסח");
        } else if (month === 8 && day === 25) { // September 25
          setSimulatedTodayHoliday("ראש השנה");
        } else {
          setSimulatedTodayHoliday("");
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
    isLoading,
    simulatedTodayHoliday // Return the holiday property
  };
}
