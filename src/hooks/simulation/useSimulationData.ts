import { useState, useEffect } from 'react';
import { useHebrewDateSimulation } from './useHebrewDateSimulation';
import { simulateZmanimData } from './zmanimSimulation';
import { simulatePrayerTimes } from './prayerSimulation';
import { simulateShabbatData } from './shabbatSimulation';
import type { ShabbatDataResponse } from '@/types/shabbat';
import { validateHebrewDate } from './services/hebrewDateValidation';
import { getHolidaysForDate } from './services/holidayService';

interface SimulationDataResult {
  simulatedDailyTimes: Array<{ name: string; time: string }>;
  simulatedDailyPrayers: Array<{ name: string; time: string }>;
  simulatedShabbatData: ShabbatDataResponse;
  simulatedHebrewDate: string;
  simulatedGregorianDate: string;
  validationResult?: {
    isValid: boolean;
    expectedDate: string;
    actualDate: string;
  };
  isLoading: boolean;
  simulatedTodayHoliday?: string;
}

export function useSimulationData(date: Date): SimulationDataResult {
  const [simulatedDailyTimes, setSimulatedDailyTimes] = useState<Array<{ name: string; time: string }>>([]);
  const [simulatedDailyPrayers, setSimulatedDailyPrayers] = useState<Array<{ name: string; time: string }>>([]);
  const [simulatedShabbatData, setSimulatedShabbatData] = useState<ShabbatDataResponse>({
    title: '',
    subtitle: '',
    candlesPT: '',
    candlesTA: '',
    havdala: '',
    prayers: [],
    classes: []
  });
  const [validationResult, setValidationResult] = useState<{ isValid: boolean; expectedDate: string; actualDate: string; } | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [simulatedTodayHoliday, setSimulatedTodayHoliday] = useState<string | undefined>(undefined);
  
  const {
    simulatedHebrewDate,
    simulatedGregorianDate,
  } = useHebrewDateSimulation(date);

  useEffect(() => {
    const simulateData = async () => {
      setIsLoading(true);
      
      // Simulate daily times
      const newSimulatedTimes = simulateZmanimData(date);
      setSimulatedDailyTimes(newSimulatedTimes);
      
      // Simulate prayer times
      const newSimulatedPrayers = simulatePrayerTimes(date);
      setSimulatedDailyPrayers(newSimulatedPrayers);
      
      // Simulate Shabbat data
      const newSimulatedShabbatData = simulateShabbatData(date, {
        title: '',
        subtitle: '',
        candlesPT: '',
        candlesTA: '',
        havdala: '',
        prayers: [],
        classes: []
      });
      setSimulatedShabbatData(newSimulatedShabbatData);

      // Fetch today's holiday
      const todayHoliday = await getHolidaysForDate(date);
      setSimulatedTodayHoliday(todayHoliday);
      
      // Validate Hebrew date
      const validation = await validateHebrewDate(date, simulatedHebrewDate);
      setValidationResult(validation);
      
      setIsLoading(false);
    };

    simulateData();
  }, [date, simulatedHebrewDate]);

  return {
    simulatedDailyTimes,
    simulatedDailyPrayers,
    simulatedShabbatData,
    simulatedHebrewDate,
    simulatedGregorianDate,
    validationResult,
    isLoading,
    simulatedTodayHoliday
  };
}
