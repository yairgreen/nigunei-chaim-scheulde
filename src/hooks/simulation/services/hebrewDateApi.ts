
import { supabase } from '@/integrations/supabase/client';

export const fetchRealHebrewDate = async (gregorianDate: Date): Promise<string> => {
  try {
    const year = gregorianDate.getFullYear();
    const month = String(gregorianDate.getMonth() + 1).padStart(2, '0');
    const day = String(gregorianDate.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    
    console.log(`Fetching Hebrew date for: ${formattedDate} from Supabase`);
    
    // First try to get the Hebrew date from Supabase
    const { data, error } = await supabase
      .from('daily_zmanim')
      .select('hebrew_date')
      .eq('gregorian_date', formattedDate)
      .single();
    
    if (!error && data && data.hebrew_date) {
      console.log(`Successfully found Hebrew date in Supabase: ${data.hebrew_date} for ${formattedDate}`);
      return data.hebrew_date;
    }
    
    // Fallback to external API if not in Supabase
    console.log(`No Hebrew date found in Supabase, using external API for: ${formattedDate}`);
    const url = `https://www.hebcal.com/hebcal?v=1&cfg=json&maj=on&min=on&mod=on&nx=on&start=${formattedDate}&end=${formattedDate}&c=on&ss=on&mf=on&c=on&b=40&d=on&geo=geoname&geonameid=293918&M=on&s=on`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch Hebrew date: ${response.status} ${response.statusText}`);
    }
    
    const apiData = await response.json();
    console.log("Received Hebrew date data:", apiData);
    
    if (apiData.items && apiData.items.length > 0) {
      const hebrewDateItem = apiData.items.find((item: any) => item.category === 'hebdate');
      
      if (hebrewDateItem && hebrewDateItem.hebrew) {
        console.log(`Successfully found Hebrew date from API: ${hebrewDateItem.hebrew} for ${formattedDate}`);
        
        // Store this in Supabase for future use if the database has this date
        try {
          const { error: updateError } = await supabase
            .from('daily_zmanim')
            .update({ hebrew_date: hebrewDateItem.hebrew })
            .eq('gregorian_date', formattedDate);
            
          if (!updateError) {
            console.log(`Saved Hebrew date to Supabase for future use: ${hebrewDateItem.hebrew}`);
          }
        } catch (dbError) {
          console.log('Could not update Supabase with Hebrew date', dbError);
          // Non-critical error, continue
        }
        
        return hebrewDateItem.hebrew;
      }
    }
    
    throw new Error("Could not extract Hebrew date from API response");
  } catch (error) {
    console.error("Error fetching real Hebrew date:", error);
    throw error;
  }
};
