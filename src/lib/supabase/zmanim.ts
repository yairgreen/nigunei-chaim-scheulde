
import { createClient } from '@supabase/supabase-js';
import type { ZmanimData } from '@/lib/database/zmanim';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || ''
);

export const getZmanimForDate = async (date: string): Promise<ZmanimData | null> => {
  try {
    const { data, error } = await supabase
      .from('zmanim')
      .select('*')
      .eq('date', date)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching zmanim:', error);
    return null;
  }
};

export const getZmanimForWeek = async (startDate: string, endDate: string): Promise<ZmanimData[]> => {
  try {
    const { data, error } = await supabase
      .from('zmanim')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching weekly zmanim:', error);
    return [];
  }
};
