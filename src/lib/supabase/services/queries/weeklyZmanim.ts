
import { supabase } from '@/integrations/supabase/client';
import { mapSupabaseToZmanim } from '../utils/zmanimMapping';
import type { ZmanimData } from '../types/zmanim';

export const getZmanimForWeek = async (startDate: string, endDate: string): Promise<ZmanimData[]> => {
  try {
    console.log(`Fetching zmanim for week (${startDate} - ${endDate}) from Supabase`);
    const { data, error } = await supabase
      .from('daily_zmanim')
      .select('*')
      .gte('gregorian_date', startDate)
      .lte('gregorian_date', endDate)
      .order('gregorian_date');
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      console.log('No weekly zmanim found, returning empty array');
      return [];
    }
    
    const mappedData = data.map(item => mapSupabaseToZmanim(item));
    console.log(`Retrieved ${mappedData.length} zmanim records for the week`);
    
    return mappedData;
  } catch (error) {
    console.error(`Error fetching weekly zmanim (${startDate} - ${endDate}):`, error);
    return [];
  }
};
