
import { useScheduleData } from '@/hooks/useScheduleData';
import { useHebrewDateSimulation } from './simulation/useHebrewDateSimulation';
import { useScheduleSimulation } from './simulation/useScheduleSimulation';
import type { ShabbatDataResponse } from '@/types/shabbat';

export interface SimulationData {
  simulatedDailyTimes: Array<{ name: string; time: string }>;
  simulatedDailyPrayers: Array<{ name: string; time: string }>;
  simulatedShabbatData: ShabbatDataResponse;
  simulatedHebrewDate: string;
  simulatedGregorianDate: string;
  simulatedTodayHoliday: string;  // Added this line
  isLoading: boolean;
  validationResult?: {
    isValid: boolean;
    expectedDate: string;
    actualDate: string;
  };
}

export function useSimulationData(date: Date): SimulationData {
  const { shabbatData } = useScheduleData();
  const { 
    simulatedHebrewDate, 
    simulatedGregorianDate, 
    validationResult, 
    isLoading,
    simulatedTodayHoliday  // Added this line
  } = useHebrewDateSimulation(date);
  
  const { 
    simulatedDailyTimes, 
    simulatedDailyPrayers, 
    simulatedShabbatData 
  } = useScheduleSimulation(date, shabbatData);

  return {
    simulatedDailyTimes,
    simulatedDailyPrayers,
    simulatedShabbatData,
    simulatedHebrewDate,
    simulatedGregorianDate,
    simulatedTodayHoliday: simulatedTodayHoliday || "",  // Added this line with fallback to empty string
    isLoading,
    validationResult
  };
}

// Import and re-export test functions from hebrewDateSimulation
import { runHebrewDateTests, getDatabaseContent } from './simulation/hebrewDateSimulation';
export { runHebrewDateTests, getDatabaseContent };
