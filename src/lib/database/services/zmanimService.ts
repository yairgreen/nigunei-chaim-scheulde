
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import type { ZmanimData } from '../types/zmanim';
import { mapSupabaseToZmanim } from '../utils/zmanimMappers';

export const getZmanimForDate = async (date: string): Promise<ZmanimData | null> => {
  try {
    const { data, error } = await supabase
      .from('daily_zmanim')
      .select('*')
      .eq('gregorian_date', date)
      .single();

    if (error) throw error;
    return mapSupabaseToZmanim(data, date);
  } catch (error) {
    console.error('Error fetching zmanim from Supabase:', error);
    return null;
  }
};

export const getZmanimForWeek = async (startDate: string, endDate: string): Promise<ZmanimData[]> => {
  try {
    const { data, error } = await supabase
      .from('daily_zmanim')
      .select('*')
      .gte('gregorian_date', startDate)
      .lte('gregorian_date', endDate)
      .order('gregorian_date');

    if (error) throw error;
    return data.map(item => 
      mapSupabaseToZmanim(item, format(new Date(item.gregorian_date), 'yyyy-MM-dd'))
    );
  } catch (error) {
    console.error('Error fetching weekly zmanim from Supabase:', error);
    return [];
  }
};

export const getZmanimDatabase = async (): Promise<ZmanimData[]> => {
  try {
    const { data, error } = await supabase
      .from('daily_zmanim')
      .select('*')
      .order('gregorian_date');

    if (error) throw error;
    return data.map(item => 
      mapSupabaseToZmanim(item, format(new Date(item.gregorian_date), 'yyyy-MM-dd'))
    );
  } catch (error) {
    console.error('Error getting zmanim database from Supabase:', error);
    return [];
  }
};
