
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { mapSupabaseToZmanim } from '../utils/zmanimMapping';
import type { ZmanimData } from '../types/zmanim';

const getDemoZmanimmData = (date: string): ZmanimData => ({
  date: date,
  alotHaShachar: '04:52',
  sunrise: '06:08',
  misheyakir: '05:15',
  sofZmanShmaMGA: '08:48',
  sofZmanShma: '09:24',
  sofZmanTfillaMGA: '10:05',
  sofZmanTfilla: '10:29',
  chatzot: '12:40',
  minchaGedola: '13:13',
  plagHaMincha: '17:50',
  sunset: '19:12',
  beinHaShmashos: '19:29'
});

export const getTodayZmanim = async (): Promise<ZmanimData | null> => {
  const today = format(new Date(), 'yyyy-MM-dd');
  
  try {
    console.log(`Fetching zmanim for today (${today}) from Supabase`);
    const { data, error } = await supabase
      .from('daily_zmanim')
      .select('*')
      .eq('gregorian_date', today)
      .single();
    
    if (error) {
      console.log('No data found for today, using demo data');
      return getDemoZmanimmData(today);
    }
    
    console.log('Found today\'s zmanim in Supabase');
    return mapSupabaseToZmanim(data);
  } catch (error) {
    console.error(`Error fetching zmanim for today (${today}):`, error);
    return getDemoZmanimmData(today);
  }
};

export const getZmanimForSpecificDate = async (date: Date): Promise<ZmanimData | null> => {
  const formattedDate = format(date, 'yyyy-MM-dd');
  
  try {
    console.log(`Fetching zmanim for specific date (${formattedDate}) from Supabase`);
    const { data, error } = await supabase
      .from('daily_zmanim')
      .select('*')
      .eq('gregorian_date', formattedDate)
      .single();
    
    if (error) {
      console.log('No data found for specific date, using demo data');
      return getDemoZmanimmData(formattedDate);
    }
    
    console.log('Found specific date zmanim in Supabase');
    return mapSupabaseToZmanim(data);
  } catch (error) {
    console.error(`Error fetching zmanim for specific date (${formattedDate}):`, error);
    return getDemoZmanimmData(formattedDate);
  }
};
