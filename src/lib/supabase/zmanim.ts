
import { createClient } from '@supabase/supabase-js';
import type { ZmanimData } from '@/lib/database/zmanim';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || ''
);

export const getZmanimForDate = async (date: string): Promise<ZmanimData | null> => {
  try {
    const { data, error } = await supabase
      .from('daily_zmanim')
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
      .from('daily_zmanim')
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

export const getShabbatTimes = async (date: string) => {
  try {
    const { data, error } = await supabase
      .from('shabbat_times')
      .select('*')
      .eq('date', date)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching Shabbat times:', error);
    return null;
  }
};

export const getHolidays = async (startDate: string, endDate: string) => {
  try {
    const { data, error } = await supabase
      .from('holidays')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching holidays:', error);
    return [];
  }
};

// Helper functions for database operations
export const getZmanimDatabase = async () => {
  const { data } = await supabase.from('daily_zmanim').select('*').order('date');
  return data || [];
};

export const getHolidaysDatabase = async () => {
  const { data } = await supabase.from('holidays').select('*').order('date');
  return data || [];
};

