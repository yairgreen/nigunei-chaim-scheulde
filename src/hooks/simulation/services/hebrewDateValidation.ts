
import { HebrewDateValidationResult } from '../types/hebrewDateTypes';
import { fetchRealHebrewDate } from './hebrewDateApi';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

export const validateHebrewDate = async (
  gregorianDate: Date,
  hebrewDate: string
): Promise<HebrewDateValidationResult> => {
  try {
    const year = gregorianDate.getFullYear();
    const month = String(gregorianDate.getMonth() + 1).padStart(2, '0');
    const day = String(gregorianDate.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    
    // Get the Hebrew date from Supabase
    const { data, error } = await supabase
      .from('daily_zmanim')
      .select('hebrew_date')
      .eq('gregorian_date', formattedDate)
      .single();
      
    if (error) {
      console.error(`Error validating Hebrew date: ${error.message}`);
      return {
        isValid: false,
        expectedDate: "Unknown (Database error)",
        actualDate: hebrewDate
      };
    }
    
    const expectedHebrewDate = data?.hebrew_date || "Unknown";
    
    return {
      isValid: expectedHebrewDate === hebrewDate,
      expectedDate: expectedHebrewDate,
      actualDate: hebrewDate
    };
  } catch (error) {
    console.error("Error validating Hebrew date:", error);
    return {
      isValid: false,
      expectedDate: "Unknown (API error)",
      actualDate: hebrewDate
    };
  }
};
