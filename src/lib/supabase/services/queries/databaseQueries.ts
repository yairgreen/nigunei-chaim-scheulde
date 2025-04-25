
import { supabase } from '@/integrations/supabase/client';
import { mapSupabaseToZmanim } from '../utils/zmanimMapping';
import type { ZmanimData } from '../types/zmanim';

// Get zmanim data for a specific date
export const getZmanimForDate = async (date: string): Promise<ZmanimData | null> => {
  try {
    console.log(`Fetching zmanim for date (${date}) from Supabase`);
    const { data, error } = await supabase
      .from('daily_zmanim')
      .select('*')
      .eq('gregorian_date', date)
      .single();
    
    if (error) {
      console.log(`No data found for date ${date}, returning null`);
      return null;
    }
    
    console.log(`Found zmanim for date ${date} in Supabase`);
    return mapSupabaseToZmanim(data);
  } catch (error) {
    console.error(`Error fetching zmanim for date (${date}):`, error);
    return null;
  }
};

// Get entire zmanim database
export const getZmanimDatabase = async (): Promise<ZmanimData[]> => {
  try {
    console.log('Fetching all zmanim data from Supabase');
    const { data, error } = await supabase
      .from('daily_zmanim')
      .select('*')
      .order('gregorian_date');

    if (error) throw error;

    if (data && data.length > 0) {
      console.log(`Retrieved ${data.length} zmanim records from Supabase`);
      return data.map(item => mapSupabaseToZmanim(item));
    }
    
    console.log('No zmanim data found in Supabase');
    return [];
  } catch (error) {
    console.error('Error fetching zmanim data:', error);
    return [];
  }
};

// Get holidays database
export const getHolidaysDatabase = async () => {
  try {
    console.log('Fetching all holidays data from Supabase');
    const { data, error } = await supabase
      .from('holidays')
      .select('*')
      .order('date');

    if (error) throw error;

    if (data && data.length > 0) {
      console.log(`Retrieved ${data.length} holiday records from Supabase`);
      return data;
    }
    
    console.log('No holidays data found in Supabase');
    return [];
  } catch (error) {
    console.error('Error fetching holidays data:', error);
    return [];
  }
};
