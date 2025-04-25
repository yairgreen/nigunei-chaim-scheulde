
import { useState, useEffect } from 'react';
import { useScheduleData } from '@/hooks/useScheduleData';
import { useHebrewDateSimulation } from './simulation/useHebrewDateSimulation';
import { useScheduleSimulation } from './simulation/useScheduleSimulation';
import type { ShabbatDataResponse } from '@/types/shabbat';
import { supabase } from '@/integrations/supabase/client';

export interface SimulationData {
  simulatedDailyTimes: Array<{ name: string; time: string; isNext?: boolean }>;
  simulatedDailyPrayers: Array<{ name: string; time: string }>;
  simulatedShabbatData: ShabbatDataResponse;
  simulatedHebrewDate: string;
  simulatedGregorianDate: string;
  simulatedTodayHoliday: string;
  isLoading: boolean;
}

export function useSimulationData(date: Date): SimulationData {
  const { shabbatData } = useScheduleData();
  const { 
    simulatedHebrewDate, 
    simulatedGregorianDate, 
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
    isLoading
  };
}

// Export function to get database content
export const getDatabaseContent = async () => {
  try {
    const { data: zmanim, error: zmanimError } = await supabase
      .from('daily_zmanim')
      .select('*')
      .order('gregorian_date');
      
    const { data: holidays, error: holidaysError } = await supabase
      .from('holidays')
      .select('*')
      .order('date');
      
    const { data: shabbatTimes, error: shabbatError } = await supabase
      .from('shabbat_times')
      .select('*')
      .order('date');
    
    if (zmanimError) console.error("Error getting zmanim database:", zmanimError);
    if (holidaysError) console.error("Error getting holidays database:", holidaysError);
    if (shabbatError) console.error("Error getting shabbat_times database:", shabbatError);
    
    return { 
      zmanim: zmanim || [], 
      holidays: holidays || [],
      shabbatTimes: shabbatTimes || []
    };
  } catch (error) {
    console.error("Error getting database content:", error);
    return { 
      zmanim: [], 
      holidays: [],
      shabbatTimes: []
    };
  }
};
