
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

// Get holidays from Supabase
export const getHolidays = async (startDate: string, endDate: string) => {
  try {
    const { data, error } = await supabase
      .from('holidays')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date');

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching holidays from Supabase:', error);
    return [];
  }
};

// Get holidays database
export const getHolidaysDatabase = async () => {
  try {
    const { data, error } = await supabase
      .from('holidays')
      .select('*')
      .order('date');

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting holidays database from Supabase:', error);
    return [];
  }
};
