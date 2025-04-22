
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import type { ShabbatDataResponse } from '@/types/shabbat';
import { 
  calculateWeeklyMinchaTime,
  calculateWeeklyArvitTime,
  calculateShabbatMinchaTime,
  calculateShabbatKabalatTime
} from '@/lib/database/prayers';

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
    const fetchData = async () => {
      try {
        const formattedDate = format(date, 'yyyy-MM-dd');

        // Fetch zmanim data
        const { data: zmanimData, error: zmanimError } = await supabase
          .from('daily_zmanim')
          .select('*')
          .eq('gregorian_date', formattedDate)
          .single();

        if (zmanimError) throw zmanimError;

        if (zmanimData) {
          setSimulatedDailyTimes([
            { name: 'עלות השחר (72 ד\')', time: zmanimData.alot_hashachar || '--:--' },
            { name: 'הנץ החמה', time: zmanimData.sunrise || '--:--' },
            { name: 'זמן טלית ותפילין', time: zmanimData.misheyakir || '--:--' },
            { name: 'סוף זמן ק"ש (מג״א)', time: zmanimData.sof_zman_shma_mga || '--:--' },
            { name: 'סוף זמן ק"ש (גר״א)', time: zmanimData.sof_zman_shma_gra || '--:--' },
            { name: 'סוף זמן תפילה (מג״א)', time: zmanimData.sof_zman_tfilla_mga || '--:--' },
            { name: 'סוף זמן תפילה (גר"א)', time: zmanimData.sof_zman_tfilla_gra || '--:--' },
            { name: 'חצות היום והלילה', time: zmanimData.chatzot || '--:--' },
            { name: 'זמן מנחה גדולה', time: zmanimData.mincha_gedola || '--:--' },
            { name: 'פלג המנחה', time: zmanimData.plag_hamincha || '--:--' },
            { name: 'שקיעה', time: zmanimData.sunset || '--:--' },
            { name: 'צאת הכוכבים', time: zmanimData.tzait_hakochavim || '--:--' }
          ]);

          // Calculate prayer times based on sunset
          const isShabbat = date.getDay() === 6;
          if (!isShabbat) {
            const minchaTime = calculateWeeklyMinchaTime([{
              date: formattedDate,
              sunset: zmanimData.sunset,
              beinHaShmashos: zmanimData.tzait_hakochavim
            }]);
            const arvitTime = calculateWeeklyArvitTime([{
              date: formattedDate,
              sunset: zmanimData.sunset,
              beinHaShmashos: zmanimData.tzait_hakochavim
            }]);

            setSimulatedDailyPrayers([
              { name: 'שחרית', time: '06:30' },
              { name: 'מנחה', time: minchaTime || '--:--' },
              { name: 'ערבית', time: arvitTime || '--:--' }
            ]);
          }
        }

        // Fetch Shabbat times if it's Friday or Saturday
        if (date.getDay() === 5 || date.getDay() === 6) {
          const { data: shabbatData, error: shabbatError } = await supabase
            .from('shabbat_times')
            .select('*')
            .eq('date', formattedDate)
            .single();

          if (shabbatError) throw shabbatError;

          if (shabbatData) {
            const minchaTime = calculateShabbatMinchaTime(shabbatData.candle_lighting_petah_tikva);
            const kabalatShabbatTime = calculateShabbatKabalatTime(shabbatData.candle_lighting_petah_tikva);

            setSimulatedShabbatData({
              title: shabbatData.parasha || 'שבת',
              subtitle: shabbatData.special_shabbat || '',
              candlesPT: shabbatData.candle_lighting_petah_tikva || '--:--',
              candlesTA: shabbatData.candle_lighting_tel_aviv || '--:--',
              havdala: shabbatData.havdalah_petah_tikva || '--:--',
              prayers: [
                { name: 'מנחה וקבלת שבת', time: minchaTime },
                { name: 'קבלת שבת', time: kabalatShabbatTime },
                { name: 'שחרית', time: '08:30' },
                { name: 'מנחה', time: '13:30' },
                { name: 'ערבית', time: '20:00' }
              ],
              classes: []
            });
          }
        }

      } catch (error) {
        console.error('Error fetching simulation data:', error);
      }
    };

    fetchData();
  }, [date, currentShabbatData]);

  return {
    simulatedDailyTimes,
    simulatedDailyPrayers,
    simulatedShabbatData
  };
}
