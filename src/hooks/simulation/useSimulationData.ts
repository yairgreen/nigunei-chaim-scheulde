
import { useState, useEffect } from 'react';
import { useScheduleData } from '@/hooks/useScheduleData';
import { simulateHebrewDate } from './hebrewDateSimulation';
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
  }, [date, shabbatData]); // React to changes in date and shabbatData

  const simulateDataForDate = (selectedDate: Date) => {
    if (!selectedDate) return;
    
    // Update Hebrew date based on selected date
    const hebrewDate = simulateHebrewDate(selectedDate);
    setSimulatedHebrewDate(hebrewDate);
    console.log("Simulated Hebrew date:", hebrewDate);
    
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
    
    // Update simulated Shabbat data
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
