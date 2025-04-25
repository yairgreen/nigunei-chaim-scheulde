
import { supabase } from '@/integrations/supabase/client';
import { formatTimeFromDB } from '../utils/timeFormatting';
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

// Get all zmanim database
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
