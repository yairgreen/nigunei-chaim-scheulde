import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import type { ShabbatDataResponse } from '@/types/shabbat';

interface ScheduleSimulationResult {
  simulatedDailyTimes: Array<{ name: string; time: string; isNext?: boolean }>;
  simulatedDailyPrayers: Array<{ name: string; time: string }>;
  simulatedShabbatData: ShabbatDataResponse;
}

export function useScheduleSimulation(date: Date, currentShabbatData: ShabbatDataResponse): ScheduleSimulationResult {
  const [simulatedDailyTimes, setSimulatedDailyTimes] = useState<Array<{ name: string; time: string; isNext?: boolean }>>([]);
  const [simulatedDailyPrayers, setSimulatedDailyPrayers] = useState<Array<{ name: string; time: string }>>([]);
  const [simulatedShabbatData, setSimulatedShabbatData] = useState<ShabbatDataResponse>(currentShabbatData);

  // Helper function to format time from database to HH:MM
  const formatTime = (timeStr: string | null): string => {
    if (!timeStr) return '';
    
    try {
      // Check if already in HH:MM format
      if (timeStr.match(/^\d{2}:\d{2}$/)) return timeStr;
      
      // Check if in HH:MM:SS format
      const match = timeStr.match(/^(\d{2}):(\d{2}):\d{2}$/);
      if (match) {
        return `${match[1]}:${match[2]}`;
      }
      
      // Try to parse as date
      const date = new Date(timeStr);
      if (!isNaN(date.getTime())) {
        return date.toLocaleTimeString('he-IL', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
      }
      
      return timeStr;
    } catch (error) {
      console.error('Error formatting time:', error);
      return timeStr;
    }
  };

  useEffect(() => {
    const fetchSimulatedData = async () => {
      try {
        // Format date for Supabase query
        const formattedDate = format(date, 'yyyy-MM-dd');
        
        // Fetch zmanim data for the selected date
        const { data: zmanimData, error: zmanimError } = await supabase
          .from('daily_zmanim')
          .select('*')
          .eq('gregorian_date', formattedDate)
          .single();
          
        if (zmanimError) {
          console.error('Error fetching zmanim:', zmanimError.message);
        } else if (zmanimData) {
          // Create daily times array from zmanim data
          const dailyTimes = [
            { name: 'עלות השחר (72 ד\')', time: formatTime(zmanimData.alot_hashachar) },
            { name: 'הנץ החמה', time: formatTime(zmanimData.sunrise) },
            { name: 'זמן טלית ותפילין', time: formatTime(zmanimData.misheyakir) },
            { name: 'סוף זמן ק"ש (מג״א)', time: formatTime(zmanimData.sof_zman_shma_mga) },
            { name: 'סוף זמן ק"ש (גר״א)', time: formatTime(zmanimData.sof_zman_shma_gra) },
            { name: 'סוף זמן תפילה (מג״א)', time: formatTime(zmanimData.sof_zman_tfilla_mga) },
            { name: 'סוף זמן תפילה (גר"א)', time: formatTime(zmanimData.sof_zman_tfilla_gra) },
            { name: 'חצות היום והלילה', time: formatTime(zmanimData.chatzot) },
            { name: 'זמן מנחה גדולה', time: formatTime(zmanimData.mincha_gedola) },
            { name: 'פלג המנחה', time: formatTime(zmanimData.plag_hamincha) },
            { name: 'שקיעה', time: formatTime(zmanimData.sunset) },
            { name: 'צאת הכוכבים', time: formatTime(zmanimData.tzait_hakochavim) }
          ];
          setSimulatedDailyTimes(dailyTimes);
        }
        
        // Simulate daily prayers based on day of week
        const dayOfWeek = date.getDay();
        const isDaylightSaving = date.getMonth() >= 2 && date.getMonth() <= 9; // March through October
        const defaultPrayers = [
          { name: 'שחרית א׳', time: '06:15' },
          { name: 'שחרית ב׳', time: '07:00' },
          { name: 'שחרית ג׳', time: '08:00' },
          { name: 'מנחה גדולה', time: isDaylightSaving ? '13:20' : '12:30' },
          { name: 'מנחה', time: isDaylightSaving ? '17:30' : '16:30' },
          { name: 'ערבית א׳', time: isDaylightSaving ? '18:30' : '17:30' },
          { name: 'ערבית ב׳', time: '20:45' }
        ];
        setSimulatedDailyPrayers(defaultPrayers);
        
        // Get the Saturday date for Shabbat data
        const daysTillSaturday = dayOfWeek === 6 ? 0 : 6 - dayOfWeek;
        const saturday = new Date(date);
        saturday.setDate(date.getDate() + daysTillSaturday);
        const saturdayFormatted = format(saturday, 'yyyy-MM-dd');
        
        // Fetch Shabbat data
        const { data: shabbatData, error: shabbatError } = await supabase
          .from('shabbat_times')
          .select('*')
          .eq('date', saturdayFormatted)
          .single();
          
        if (!shabbatError && shabbatData) {
          const updatedShabbatData = {
            title: shabbatData.parasha || 'שבת',
            subtitle: shabbatData.special_shabbat || '',
            candlesPT: formatTime(shabbatData.candle_lighting_petah_tikva) || '--:--',
            candlesTA: formatTime(shabbatData.candle_lighting_tel_aviv) || '--:--',
            havdala: formatTime(shabbatData.havdalah_petah_tikva) || '--:--',
            prayers: [
              { name: 'קבלת שבת', time: '18:30' },
              { name: 'שחרית', time: '08:15' },
              { name: 'מנחה', time: '17:00' },
              { name: 'ערבית', time: '18:45' }
            ],
            classes: [
              { name: 'שיעור בפרשת השבוע', time: '16:00' }
            ]
          };
          setSimulatedShabbatData(updatedShabbatData);
        } else {
          console.error('Error fetching Shabbat data:', shabbatError?.message);
          // Keep the current Shabbat data from props as fallback
        }
      } catch (error) {
        console.error('Error in useScheduleSimulation:', error);
      }
    };
    
    fetchSimulatedData();
  }, [date, currentShabbatData]);

  return {
    simulatedDailyTimes,
    simulatedDailyPrayers,
    simulatedShabbatData
  };
}
