
import { supabase } from '@/integrations/supabase/client';
import type { ZmanimData } from '@/lib/database/zmanim';
import { format } from 'date-fns';

// Get zmanim for a specific date from Supabase
export const getZmanimForDate = async (date: string): Promise<ZmanimData | null> => {
  try {
    const { data, error } = await supabase
      .from('daily_zmanim')
      .select('*')
      .eq('gregorian_date', date)
      .single();

    if (error) throw error;

    // Map Supabase data to ZmanimData format
    return {
      date,
      alotHaShachar: data.alot_hashachar || '',
      sunrise: data.sunrise || '',
      misheyakir: data.misheyakir || '',
      sofZmanShmaMGA: data.sof_zman_shma_mga || '',
      sofZmanShma: data.sof_zman_shma_gra || '',
      sofZmanTfillaMGA: data.sof_zman_tfilla_mga || '',
      sofZmanTfilla: data.sof_zman_tfilla_gra || '',
      chatzot: data.chatzot || '',
      minchaGedola: data.mincha_gedola || '',
      plagHaMincha: data.plag_hamincha || '',
      sunset: data.sunset || '',
      beinHaShmashos: data.tzait_hakochavim || ''
    };
  } catch (error) {
    console.error('Error fetching zmanim from Supabase:', error);
    return null;
  }
};

// Get zmanim for a week from Supabase
export const getZmanimForWeek = async (startDate: string, endDate: string): Promise<ZmanimData[]> => {
  try {
    const { data, error } = await supabase
      .from('daily_zmanim')
      .select('*')
      .gte('gregorian_date', startDate)
      .lte('gregorian_date', endDate)
      .order('gregorian_date');

    if (error) throw error;

    return data.map(item => ({
      date: format(new Date(item.gregorian_date), 'yyyy-MM-dd'),
      alotHaShachar: item.alot_hashachar || '',
      sunrise: item.sunrise || '',
      misheyakir: item.misheyakir || '',
      sofZmanShmaMGA: item.sof_zman_shma_mga || '',
      sofZmanShma: item.sof_zman_shma_gra || '',
      sofZmanTfillaMGA: item.sof_zman_tfilla_mga || '',
      sofZmanTfilla: item.sof_zman_tfilla_gra || '',
      chatzot: item.chatzot || '',
      minchaGedola: item.mincha_gedola || '',
      plagHaMincha: item.plag_hamincha || '',
      sunset: item.sunset || '',
      beinHaShmashos: item.tzait_hakochavim || ''
    }));
  } catch (error) {
    console.error('Error fetching weekly zmanim from Supabase:', error);
    return [];
  }
};

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

// Get holidays from Supabase
export const getHolidays = async (startDate: string, endDate: string) => {
  try {
    const { data, error } = await supabase
      .from('holidays')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date');

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching holidays from Supabase:', error);
    return [];
  }
};

// Get all zmanim from Supabase
export const getZmanimDatabase = async () => {
  try {
    const { data, error } = await supabase
      .from('daily_zmanim')
      .select('*')
      .order('gregorian_date');

    if (error) throw error;

    return data.map(item => ({
      date: format(new Date(item.gregorian_date), 'yyyy-MM-dd'),
      alotHaShachar: item.alot_hashachar || '',
      sunrise: item.sunrise || '',
      misheyakir: item.misheyakir || '',
      sofZmanShmaMGA: item.sof_zman_shma_mga || '',
      sofZmanShma: item.sof_zman_shma_gra || '',
      sofZmanTfillaMGA: item.sof_zman_tfilla_mga || '',
      sofZmanTfilla: item.sof_zman_tfilla_gra || '',
      chatzot: item.chatzot || '',
      minchaGedola: item.mincha_gedola || '',
      plagHaMincha: item.plag_hamincha || '',
      sunset: item.sunset || '',
      beinHaShmashos: item.tzait_hakochavim || ''
    }));
  } catch (error) {
    console.error('Error getting zmanim database from Supabase:', error);
    return [];
  }
};

// Get holidays database from Supabase
export const getHolidaysDatabase = async () => {
  try {
    const { data, error } = await supabase
      .from('holidays')
      .select('*')
      .order('date');

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting holidays database from Supabase:', error);
    return [];
  }
};
