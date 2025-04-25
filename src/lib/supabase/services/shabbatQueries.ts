
import { supabase } from '@/integrations/supabase/client';
import { formatTimeFromDB } from '../utils/timeFormatting';

// Get Shabbat times from Supabase
export const getShabbatTimes = async (date: string) => {
  try {
    const { data, error } = await supabase
      .from('shabbat_times')
      .select('*')
      .eq('date', date)
      .single();

    if (error) throw error;

    return {
      date: data.date,
      parashat_hebrew: data.parasha,
      holiday_hebrew: data.special_shabbat,
      candles_pt: data.candle_lighting_petah_tikva,
      candles_ta: data.candle_lighting_tel_aviv,
      havdalah: data.havdalah_petah_tikva
    };
  } catch (error) {
    console.error('Error fetching Shabbat times from Supabase:', error);
    return null;
  }
};
