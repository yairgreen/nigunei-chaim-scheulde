
import { useScheduleData } from '@/hooks/useScheduleData';
import { useHebrewDateSimulation } from './simulation/useHebrewDateSimulation';
import { useScheduleSimulation } from './simulation/useScheduleSimulation';
import { runHebrewDateTests } from './simulation/utils/hebrewDateTesting';
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
  const { shabbatData } = useScheduleData();
  const { 
    simulatedHebrewDate, 
    simulatedGregorianDate, 
    validationResult, 
    isLoading,
    simulatedTodayHoliday
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
    simulatedTodayHoliday: simulatedTodayHoliday || "",
    isLoading,
    validationResult
  };
}

// Import and re-export test functions directly from the utility file
export { runHebrewDateTests };

// Add a function to get database content from simulation/utils/hebrewDateTesting
export const getDatabaseContent = async () => {
  try {
    const { getZmanimDatabase } = await import('@/lib/database/zmanim');
    const zmanim = await getZmanimDatabase();
    return { zmanim };
  } catch (error) {
    console.error("Error getting database content:", error);
    return { zmanim: [] };
  }
};
