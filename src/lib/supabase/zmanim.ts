
import { supabase } from '@/integrations/supabase/client';
import type { ZmanimData } from '@/lib/database/zmanim';
import { format } from 'date-fns';

// Get zmanim for a specific date from Supabase
export const getZmanimForDate = async (date: string): Promise<ZmanimData | null> => {
  try {
    console.log(`Fetching zmanim for date ${date} from Supabase`);
    const { data, error } = await supabase
      .from('daily_zmanim')
      .select('*')
      .eq('gregorian_date', date)
      .single();

    if (error) {
      console.error('Error fetching zmanim from Supabase:', error);
      throw error;
    }

    if (!data) {
      console.log(`No zmanim found for date ${date}`);
      return null;
    }

    console.log(`Successfully fetched zmanim for date ${date} from Supabase`);
    
    // Map Supabase data to ZmanimData format
    return {
      date,
      alotHaShachar: formatTimeFromDB(data.alot_hashachar),
      sunrise: formatTimeFromDB(data.sunrise),
      misheyakir: formatTimeFromDB(data.misheyakir),
      sofZmanShmaMGA: formatTimeFromDB(data.sof_zman_shma_mga),
      sofZmanShma: formatTimeFromDB(data.sof_zman_shma_gra),
      sofZmanTfillaMGA: formatTimeFromDB(data.sof_zman_tfilla_mga),
      sofZmanTfilla: formatTimeFromDB(data.sof_zman_tfilla_gra),
      chatzot: formatTimeFromDB(data.chatzot),
      minchaGedola: formatTimeFromDB(data.mincha_gedola),
      plagHaMincha: formatTimeFromDB(data.plag_hamincha),
      sunset: formatTimeFromDB(data.sunset),
      beinHaShmashos: formatTimeFromDB(data.tzait_hakochavim)
    };
  } catch (error) {
    console.error('Error fetching zmanim from Supabase:', error);
    return null;
  }
};

// Format time from database to HH:MM format
const formatTimeFromDB = (timeStr: string | null): string => {
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
    console.error('Error formatting time from database:', error);
    return timeStr;
  }
};

// Get zmanim for a week from Supabase
export const getZmanimForWeek = async (startDate: string, endDate: string): Promise<ZmanimData[]> => {
  try {
    console.log(`Fetching zmanim for week ${startDate} to ${endDate} from Supabase`);
    const { data, error } = await supabase
      .from('daily_zmanim')
      .select('*')
      .gte('gregorian_date', startDate)
      .lte('gregorian_date', endDate)
      .order('gregorian_date');

    if (error) {
      console.error('Error fetching weekly zmanim from Supabase:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.log(`No zmanim found for week ${startDate} to ${endDate}`);
      return [];
    }

    console.log(`Successfully fetched ${data.length} zmanim records for week from Supabase`);
    
    return data.map(item => ({
      date: format(new Date(item.gregorian_date), 'yyyy-MM-dd'),
      alotHaShachar: formatTimeFromDB(item.alot_hashachar),
      sunrise: formatTimeFromDB(item.sunrise),
      misheyakir: formatTimeFromDB(item.misheyakir),
      sofZmanShmaMGA: formatTimeFromDB(item.sof_zman_shma_mga),
      sofZmanShma: formatTimeFromDB(item.sof_zman_shma_gra),
      sofZmanTfillaMGA: formatTimeFromDB(item.sof_zman_tfilla_mga),
      sofZmanTfilla: formatTimeFromDB(item.sof_zman_tfilla_gra),
      chatzot: formatTimeFromDB(item.chatzot),
      minchaGedola: formatTimeFromDB(item.mincha_gedola),
      plagHaMincha: formatTimeFromDB(item.plag_hamincha),
      sunset: formatTimeFromDB(item.sunset),
      beinHaShmashos: formatTimeFromDB(item.tzait_hakochavim)
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
    console.log('Fetching all zmanim records from Supabase');
    const { data, error } = await supabase
      .from('daily_zmanim')
      .select('*')
      .order('gregorian_date');

    if (error) {
      console.error('Error fetching zmanim database from Supabase:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.log('No zmanim records found in the database');
      return [];
    }

    console.log(`Successfully fetched ${data.length} zmanim records from Supabase`);
    
    return data.map(item => ({
      date: format(new Date(item.gregorian_date), 'yyyy-MM-dd'),
      alotHaShachar: formatTimeFromDB(item.alot_hashachar),
      sunrise: formatTimeFromDB(item.sunrise),
      misheyakir: formatTimeFromDB(item.misheyakir),
      sofZmanShmaMGA: formatTimeFromDB(item.sof_zman_shma_mga),
      sofZmanShma: formatTimeFromDB(item.sof_zman_shma_gra),
      sofZmanTfillaMGA: formatTimeFromDB(item.sof_zman_tfilla_mga),
      sofZmanTfilla: formatTimeFromDB(item.sof_zman_tfilla_gra),
      chatzot: formatTimeFromDB(item.chatzot),
      minchaGedola: formatTimeFromDB(item.mincha_gedola),
      plagHaMincha: formatTimeFromDB(item.plag_hamincha),
      sunset: formatTimeFromDB(item.sunset),
      beinHaShmashos: formatTimeFromDB(item.tzait_hakochavim)
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
