
import { useState, useEffect } from 'react';
import { useScheduleData } from '@/hooks/useScheduleData';
import { simulateHebrewDate, fetchRealHebrewDate } from './hebrewDateSimulation';
import { simulateZmanimData } from './zmanimSimulation';
import { simulatePrayerTimes } from './prayerSimulation';
import { simulateShabbatData } from './shabbatSimulation';
import { format } from 'date-fns';

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
}

/**
 * Hook to simulate schedule data for a given date
 * 
 * @param date - The date to simulate data for
 * @returns Simulated data for the selected date
 */
export function useSimulationData(date: Date): SimulationData {
  const { dailyTimes, dailyPrayers, dailyClasses, shabbatData } = useScheduleData();
  const [simulatedDailyTimes, setSimulatedDailyTimes] = useState(dailyTimes);
  const [simulatedDailyPrayers, setSimulatedDailyPrayers] = useState(dailyPrayers);
  const [simulatedShabbatData, setSimulatedShabbatData] = useState(shabbatData);
  const [simulatedHebrewDate, setSimulatedHebrewDate] = useState<string>("");
  const [simulatedGregorianDate, setSimulatedGregorianDate] = useState<string>("");

  useEffect(() => {
    // Update the simulated data when the date changes
    if (date) {
      console.log("Simulating data for date:", date);
      simulateDataForDate(date);
    }
  }, [date, shabbatData]); // Also react to changes in shabbatData

  const simulateDataForDate = async (selectedDate: Date) => {
    if (!selectedDate) return;
    
    try {
      // First, try to get the real Hebrew date from the API
      const hebrewDate = await fetchRealHebrewDate(selectedDate);
      setSimulatedHebrewDate(hebrewDate);
      console.log("Real Hebrew date from API:", hebrewDate);
    } catch (error) {
      // If API call fails, fall back to simulated date
      const fallbackHebrewDate = simulateHebrewDate(selectedDate);
      setSimulatedHebrewDate(fallbackHebrewDate);
      console.log("Fallback Hebrew date (simulated):", fallbackHebrewDate);
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
  };

  return {
    simulatedDailyTimes,
    simulatedDailyPrayers,
    simulatedShabbatData,
    simulatedHebrewDate,
    simulatedGregorianDate
  };
}

// Helper function to run tests for the simulation
export const runSimulationTests = () => {
  console.log("Running simulation tests...");
  
  // Test simulation for different days of the week
  const testDates = [
    new Date(2025, 2, 23), // Sunday
    new Date(2025, 2, 25), // Tuesday
    new Date(2025, 2, 28), // Friday
    new Date(2025, 2, 29), // Saturday
  ];
  
  testDates.forEach(date => {
    console.log(`Testing simulation for ${date.toDateString()}`);
    console.log(`Day of week: ${date.getDay()}`);
    console.log(`Expected Hebrew date: ${simulateHebrewDate(date)}`);
    // Additional test logic can be added here
  });
};

