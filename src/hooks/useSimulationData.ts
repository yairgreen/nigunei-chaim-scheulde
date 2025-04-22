
import { useEffect } from 'react';
import { useHebrewDateSimulation } from './simulation/useHebrewDateSimulation';
import { useScheduleSimulation } from './simulation/useScheduleSimulation';
import type { ShabbatDataResponse } from '@/types/shabbat';

export interface SimulationData {
  simulatedDailyTimes: Array<{ name: string; time: string }>;
  simulatedDailyPrayers: Array<{ name: string; time: string }>;
  simulatedShabbatData: ShabbatDataResponse;
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

export function useSimulationData(date: Date): SimulationData {
  // Default shabbat data structure
  const defaultShabbatData: ShabbatDataResponse = {
    title: 'שבת',
    subtitle: '',
    candlesPT: '--:--',
    candlesTA: '--:--',
    havdala: '--:--',
    prayers: [],
    classes: []
  };
  
  const { 
    simulatedHebrewDate, 
    simulatedGregorianDate,
    simulatedTodayHoliday,
    validationResult,
    isLoading
  } = useHebrewDateSimulation(date);
  
  const { 
    simulatedDailyTimes, 
    simulatedDailyPrayers, 
    simulatedShabbatData 
  } = useScheduleSimulation(date, defaultShabbatData);

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
