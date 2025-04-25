
import { supabase } from '@/integrations/supabase/client';
import { setZmanimDatabase } from '../state/zmanimState';
import { mapSupabaseToZmanim } from './utils/zmanimMapping';
import type { ZmanimData } from '../types/zmanimTypes';

export const fetchZmanim = async (): Promise<ZmanimData[]> => {
  try {
    console.log('Fetching zmanim data from Supabase');
    const { data, error } = await supabase
      .from('daily_zmanim')
      .select('*')
      .order('gregorian_date');

    if (error) throw error;

    if (data && data.length > 0) {
      console.log(`Retrieved ${data.length} zmanim records from Supabase`);
      const mappedData = data.map(item => mapSupabaseToZmanim(item));
      setZmanimDatabase(mappedData);
      return mappedData;
    }
    
    console.log('No zmanim data found in Supabase');
    return [];
  } catch (error) {
    console.error('Error fetching zmanim data:', error);
    return [];
  }
};
