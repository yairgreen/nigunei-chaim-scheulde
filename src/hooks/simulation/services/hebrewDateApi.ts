
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

export const fetchHolidayForDate = async (date: Date): Promise<string> => {
  try {
    const formattedDate = format(date, 'yyyy-MM-dd');
    
    const { data: holidays, error } = await supabase
      .from('holidays')
      .select('*')
      .eq('date', formattedDate)
      .eq('category', 'holiday')
      .order('title', { ascending: true });
    
    if (error) throw error;
    
    // If no holidays found, return empty string
    if (!holidays || holidays.length === 0) return '';
    
    // Return all holiday names joined with separator
    return holidays.map(holiday => holiday.hebrew || holiday.title).join(' | ');
    
  } catch (error) {
    console.error('Error fetching holiday:', error);
    return '';
  }
};

export const fetchRealHebrewDate = async (date: Date): Promise<string> => {
  try {
    const formattedDate = format(date, 'yyyy-MM-dd');
    
    const { data: zmanimData, error } = await supabase
      .from('daily_zmanim')
      .select('hebrew_date')
      .eq('gregorian_date', formattedDate)
      .single();
    
    if (error || !zmanimData?.hebrew_date) {
      console.log('No Hebrew date found in database, using fallback');
      return 'כ״ג אדר תשפ״ה';
    }
    
    return zmanimData.hebrew_date;
  } catch (error) {
    console.error('Error fetching Hebrew date:', error);
    return 'כ״ג אדר תשפ״ה';
  }
};

