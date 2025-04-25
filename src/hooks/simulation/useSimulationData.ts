
import { useState, useEffect } from 'react';
import { useScheduleData } from '@/hooks/useScheduleData';
import { simulateHebrewDate } from './utils/hebrewDateUtils';
import { fetchRealHebrewDate } from './services/hebrewDateApi';
import { validateHebrewDate } from './services/hebrewDateValidation';
import { simulateZmanimData } from './zmanimSimulation';
import { simulatePrayerTimes } from './prayerSimulation';
import { simulateShabbatData } from './shabbatSimulation';
import { format } from 'date-fns';
import { getZmanimDatabase } from '@/lib/database';

// Types for simulation data
export interface SimulationData {
  simulatedDailyTimes: Array<{ name: string; time: string }>;
  simulatedDailyPrayers: Array<{ name: string; time: string }>;
  simulatedShabbatData: {
    title: string;
    subtitle: string;
    candlesPT: string;
    candlesTA: string;
    havdala: string;
    prayers: Array<{ name: string; time: string }>;
    classes: Array<{ name: string; time: string }>;
  };
  simulatedHebrewDate: string;
  simulatedGregorianDate: string;
  simulatedTodayHoliday: string;
  isLoading: boolean;
  validationResult?: {
    isValid: boolean;
    expectedDate: string;
    actualDate: string;
  };
}

/**
 * Hook to simulate schedule data for a given date
 * This hook provides a way to preview how the schedule will appear on different dates
 * by simulating the data that would normally be fetched from the API or database.
 * 
 * @param date - The date to simulate data for
 * @returns Simulated data for the selected date and loading state
 */
export function useSimulationData(date: Date): SimulationData {
  const { dailyTimes, dailyPrayers, dailyClasses, shabbatData } = useScheduleData();
  const [simulatedDailyTimes, setSimulatedDailyTimes] = useState(dailyTimes);
  const [simulatedDailyPrayers, setSimulatedDailyPrayers] = useState(dailyPrayers);
  const [simulatedShabbatData, setSimulatedShabbatData] = useState(shabbatData);
  const [simulatedHebrewDate, setSimulatedHebrewDate] = useState<string>("");
  const [simulatedGregorianDate, setSimulatedGregorianDate] = useState<string>("");
  const [simulatedTodayHoliday, setSimulatedTodayHoliday] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    expectedDate: string;
    actualDate: string;
  } | undefined>(undefined);

  useEffect(() => {
    // Update the simulated data when the date changes
    if (date) {
      console.log("Simulating data for date:", date);
      simulateDataForDate(date);
    }
  }, [date, shabbatData]); // Also react to changes in shabbatData

  const simulateDataForDate = async (selectedDate: Date) => {
    if (!selectedDate) return;
    
    setIsLoading(true);
    
    try {
      // First, try to get the real Hebrew date from the API
      const hebrewDate = await fetchRealHebrewDate(selectedDate);
      setSimulatedHebrewDate(hebrewDate);
      console.log("Real Hebrew date from API:", hebrewDate);
      
      // Validate the Hebrew date
      const validationResult = await validateHebrewDate(selectedDate, hebrewDate);
      setValidationResult(validationResult);
      
      if (!validationResult.isValid) {
        console.warn("Hebrew date validation failed:", validationResult);
      }
    } catch (error) {
      // If API call fails, fall back to simulated date
      const fallbackHebrewDate = simulateHebrewDate(selectedDate);
      setSimulatedHebrewDate(fallbackHebrewDate);
      console.log("Fallback Hebrew date (simulated):", fallbackHebrewDate);
      setValidationResult(undefined);
    }
    
    // Format Gregorian date properly in dd/mm/yyyy format
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const year = selectedDate.getFullYear();
    const gregorianDate = `${day}/${month}/${year}`;
    setSimulatedGregorianDate(gregorianDate);
    console.log("Simulated Gregorian date:", gregorianDate);
    
    // Update simulated times data
    const newSimulatedTimes = simulateZmanimData(selectedDate);
    setSimulatedDailyTimes(newSimulatedTimes);
    console.log("Simulated zmanim data:", newSimulatedTimes);
    
    // Update simulated prayer times
    const newSimulatedPrayers = simulatePrayerTimes(selectedDate);
    setSimulatedDailyPrayers(newSimulatedPrayers);
    console.log("Simulated prayer times:", newSimulatedPrayers);
    
    // Update simulated Shabbat data using current shabbatData as a template
    const newSimulatedShabbatData = simulateShabbatData(selectedDate, shabbatData);
    setSimulatedShabbatData(newSimulatedShabbatData);
    console.log("Simulated Shabbat data:", newSimulatedShabbatData);
    
    setIsLoading(false);
  };

  return {
    simulatedDailyTimes,
    simulatedDailyPrayers,
    simulatedShabbatData,
    simulatedHebrewDate,
    simulatedGregorianDate,
    simulatedTodayHoliday,
    isLoading,
    validationResult
  };
}

/**
 * Helper function to run tests for the simulation components
 * This is primarily used for development and debugging purposes
 */
export const runHebrewDateTests = async () => {
  const { runHebrewDateTests: runTests } = await import('./utils/hebrewDateTesting');
  return runTests();
};

/**
 * Exports the current database content for inspection
 * This is primarily used for development and debugging purposes
 */
export const getDatabaseContent = async () => {
  try {
    const zmanim = await getZmanimDatabase();
    return { zmanim };
  } catch (error) {
    console.error("Error getting database content:", error);
    return { zmanim: [] };
  }
};
