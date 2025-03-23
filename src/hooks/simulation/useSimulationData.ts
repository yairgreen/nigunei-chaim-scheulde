
import { useState, useEffect } from 'react';
import { useScheduleData } from '@/hooks/useScheduleData';
import { simulateHebrewDate } from './hebrewDateSimulation';
import { simulateZmanimData } from './zmanimSimulation';
import { simulatePrayerTimes } from './prayerSimulation';
import { simulateShabbatData } from './shabbatSimulation';

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
    simulateDataForDate(date);
  }, [date]); // Important: react to changes in date

  const simulateDataForDate = (selectedDate: Date) => {
    // Update Hebrew date based on selected date
    setSimulatedHebrewDate(simulateHebrewDate(selectedDate));
    setSimulatedGregorianDate(selectedDate.toLocaleDateString('en-GB').split('/').join('/'));
    
    // Update simulated times data
    const newSimulatedTimes = simulateZmanimData(selectedDate);
    setSimulatedDailyTimes(newSimulatedTimes);
    
    // Update simulated prayer times
    const newSimulatedPrayers = simulatePrayerTimes(selectedDate);
    setSimulatedDailyPrayers(newSimulatedPrayers);
    
    // Update simulated Shabbat data
    const newSimulatedShabbatData = simulateShabbatData(selectedDate, shabbatData);
    setSimulatedShabbatData(newSimulatedShabbatData);
  };

  return {
    simulatedDailyTimes,
    simulatedDailyPrayers,
    simulatedShabbatData,
    simulatedHebrewDate,
    simulatedGregorianDate
  };
}
