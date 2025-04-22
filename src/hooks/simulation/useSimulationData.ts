
import { useEffect } from 'react';
import { format } from 'date-fns';
import { useHebrewDateSimulation } from './useHebrewDateSimulation';
import { useScheduleSimulation } from './useScheduleSimulation';
import type { ShabbatDataResponse } from '@/types/shabbat';
import { supabase } from '@/integrations/supabase/client';

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
  // Get the current shabbatData to pass to the simulation
  const { shabbatData } = { shabbatData: {
    title: 'שבת',
    subtitle: '',
    candlesPT: '--:--',
    candlesTA: '--:--',
    havdala: '--:--',
    prayers: [],
    classes: []
  }}; // Default value to avoid undefined
  
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
  } = useScheduleSimulation(date, shabbatData); // Fixed: Added second parameter

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

// Helper function to get database content
export const getDatabaseContent = async () => {
  try {
    const { data: zmanim, error } = await supabase
      .from('daily_zmanim')
      .select('*')
      .order('gregorian_date', { ascending: true });
    
    if (error) throw error;
    return { zmanim };
  } catch (error) {
    console.error("Error getting database content:", error);
    return { zmanim: [] };
  }
};
