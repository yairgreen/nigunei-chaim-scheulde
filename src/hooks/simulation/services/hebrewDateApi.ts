
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

export const fetchRealHebrewDate = async (gregorianDate: Date): Promise<string> => {
  try {
    const year = gregorianDate.getFullYear();
    const month = String(gregorianDate.getMonth() + 1).padStart(2, '0');
    const day = String(gregorianDate.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    
    console.log(`Fetching Hebrew date for: ${formattedDate} from Supabase`);
    
    // Get the Hebrew date from Supabase
    const { data, error } = await supabase
      .from('daily_zmanim')
      .select('hebrew_date')
      .eq('gregorian_date', formattedDate)
      .single();
    
    if (error) {
      console.error(`Error fetching Hebrew date from Supabase: ${error.message}`);
      throw error;
    }
    
    if (!data || !data.hebrew_date) {
      console.error(`No Hebrew date found in Supabase for ${formattedDate}`);
      // Return a fallback value when no data is found
      return "תאריך עברי לא זמין";
    }
    
    console.log(`Successfully found Hebrew date in Supabase: ${data.hebrew_date} for ${formattedDate}`);
    return data.hebrew_date;
  } catch (error) {
    console.error("Error fetching Hebrew date:", error);
    return "תאריך עברי לא זמין";
  }
};
