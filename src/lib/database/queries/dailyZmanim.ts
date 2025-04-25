
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { getDemoZmanimmData } from '../utils/zmanimDemo';
import { mapSupabaseToZmanim } from './utils/zmanimMapping';
import { updateZmanimEntry } from '../state/zmanimState';
import type { ZmanimData } from '../types/zmanimTypes';

export const getTodayZmanim = async (): Promise<ZmanimData | null> => {
  const today = format(new Date(), 'yyyy-MM-dd');
  return await getZmanimForDate(today);
};

export const getZmanimForSpecificDate = async (date: Date): Promise<ZmanimData | null> => {
  const formattedDate = format(date, 'yyyy-MM-dd');
  return await getZmanimForDate(formattedDate);
};

export const getZmanimForDate = async (date: string): Promise<ZmanimData | null> => {
  try {
    console.log(`Fetching zmanim for date (${date}) from Supabase`);
    const { data, error } = await supabase
      .from('daily_zmanim')
      .select('*')
      .eq('gregorian_date', date)
      .single();
    
    if (error) {
      console.log('No data found for date, using demo data');
      return getDemoZmanimmData(date);
    }
    
    console.log(`Found zmanim for date ${date} in Supabase`);
    const mappedData = mapSupabaseToZmanim(data);
    updateZmanimEntry(mappedData);
    return mappedData;
  } catch (error) {
    console.error(`Error fetching zmanim for date (${date}):`, error);
    return getDemoZmanimmData(date);
  }
};
