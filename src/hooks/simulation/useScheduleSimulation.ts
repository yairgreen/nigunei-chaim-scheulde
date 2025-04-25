
import { useState, useEffect } from 'react';
import { simulateZmanimData } from './zmanimSimulation';
import { simulatePrayerTimes } from './prayerSimulation';
import { simulateShabbatData } from './shabbatSimulation';
import type { ShabbatDataResponse } from '@/types/shabbat';

interface ScheduleSimulationResult {
  simulatedDailyTimes: Array<{ name: string; time: string }>;
  simulatedDailyPrayers: Array<{ name: string; time: string }>;
  simulatedShabbatData: ShabbatDataResponse;
}

export function useScheduleSimulation(date: Date, currentShabbatData: ShabbatDataResponse): ScheduleSimulationResult {
  const [simulatedDailyTimes, setSimulatedDailyTimes] = useState<Array<{ name: string; time: string }>>([]);
  const [simulatedDailyPrayers, setSimulatedDailyPrayers] = useState<Array<{ name: string; time: string }>>([]);
  const [simulatedShabbatData, setSimulatedShabbatData] = useState<ShabbatDataResponse>(currentShabbatData);

  useEffect(() => {
    // Update simulated times data
    const newSimulatedTimes = simulateZmanimData(date);
    setSimulatedDailyTimes(newSimulatedTimes);
    
    // Update simulated prayer times
    const newSimulatedPrayers = simulatePrayerTimes(date);
    setSimulatedDailyPrayers(newSimulatedPrayers);
    
    // Update simulated Shabbat data using current shabbatData as a template
    const newSimulatedShabbatData = simulateShabbatData(date, currentShabbatData);
    setSimulatedShabbatData(newSimulatedShabbatData);
  }, [date, currentShabbatData]);

  return {
    simulatedDailyTimes,
    simulatedDailyPrayers,
    simulatedShabbatData
  };
}
