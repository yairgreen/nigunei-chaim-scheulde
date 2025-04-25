
import { supabase } from '@/integrations/supabase/client';
import { getDemoZmanimmData } from '../utils/zmanimDemo';
import { mapSupabaseToZmanim } from './utils/zmanimMapping';
import { updateZmanimEntry } from '../state/zmanimState';
import type { ZmanimData } from '../types/zmanimTypes';

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
      console.log('No weekly zmanim found, using demo data');
      return [getDemoZmanimmData(startDate)];
    }
    
    const mappedData = data.map(item => mapSupabaseToZmanim(item));
    console.log(`Retrieved ${mappedData.length} zmanim records for the week`);
    
    // Update in-memory database
    mappedData.forEach(updateZmanimEntry);
    
    return mappedData;
  } catch (error) {
    console.error(`Error fetching weekly zmanim (${startDate} - ${endDate}):`, error);
    return [getDemoZmanimmData(startDate)];
  }
};
