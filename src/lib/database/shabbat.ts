
import { format, addDays } from 'date-fns';
import { formatTime } from './core';
import { ShabbatData } from './types/shabbat';
import { calculateShabbatMinchaTime, calculateShabbatKabalatTime } from './utils/shabbatCalculations';
import { getDemoShabbatData } from './data/shabbatDemo';
import { supabase } from '@/integrations/supabase/client';

// In-memory storage
let shabbatDatabase: ShabbatData[] = [];

// Get this week's Shabbat
export const getThisWeekShabbat = async (specificDate?: Date): Promise<ShabbatData | null> => {
  try {
    // First refresh the database if it's empty
    if (shabbatDatabase.length === 0) {
      await fetchShabbat();
    }
    
    const targetDate = specificDate || new Date();
    const dayOfWeek = targetDate.getDay();
    const daysUntilSaturday = (dayOfWeek === 6) ? 0 : 6 - dayOfWeek;
    const saturday = new Date(targetDate);
    saturday.setDate(targetDate.getDate() + daysUntilSaturday);
    
    const saturdayFormatted = format(saturday, 'yyyy-MM-dd');
    
    // Find that Shabbat in our database
    const shabbat = shabbatDatabase.find(item => item.date === saturdayFormatted);
    
    if (!shabbat) {
      console.log(`No Shabbat found for date ${saturdayFormatted}, creating default`);
      const demoData = getDemoShabbatData(saturdayFormatted);
      shabbatDatabase.push(demoData);
      return demoData;
    }
    
    return shabbat;
  } catch (error) {
    console.error('Error in getThisWeekShabbat:', error);
    return getDemoShabbatData(format(specificDate || new Date(), 'yyyy-MM-dd'));
  }
};

// Get Friday sunset time for Shabbat calculations
export const getFridaySunsetTime = async (specificDate?: Date): Promise<string> => {
  try {
    const today = specificDate || new Date();
    const dayOfWeek = today.getDay();
    const daysUntilFriday = (dayOfWeek <= 5) ? 5 - dayOfWeek : 5 + 7 - dayOfWeek;
    const nextFriday = addDays(today, daysUntilFriday);
    const formattedDate = format(nextFriday, 'yyyy-MM-dd');
    
    const { data, error } = await supabase
      .from('daily_zmanim')
      .select('sunset')
      .eq('gregorian_date', formattedDate)
      .single();

    if (error) throw error;
    
    if (data?.sunset) {
      return formatTime(data.sunset);
    }
    
    // Return hardcoded values for April 2025
    if (formattedDate.startsWith("2025-04")) {
      const week = Math.floor(parseInt(formattedDate.slice(8, 10)) / 7);
      const aprilSunsets = ["19:03", "19:08", "19:12", "19:18", "19:18"];
      return aprilSunsets[week] || "19:12";
    }
    
    return "19:12"; // Default fallback
  } catch (error) {
    console.error('Error fetching Friday sunset time:', error);
    const now = new Date();
    return now.getMonth() >= 3 && now.getMonth() <= 8 ? "19:15" : "17:00";
  }
};

// Fetch Shabbat data from Supabase
export const fetchShabbat = async (): Promise<ShabbatData[]> => {
  try {
    const { data, error } = await supabase
      .from('shabbat_times')
      .select('*')
      .order('date');

    if (error) throw error;

    if (data && data.length > 0) {
      shabbatDatabase = data;
      return data;
    }
    
    // Return demo data if no data in Supabase
    const demoData = [
      getDemoShabbatData('2025-04-05'),
      getDemoShabbatData('2025-04-12'),
      getDemoShabbatData('2025-04-19'),
      getDemoShabbatData('2025-04-26')
    ];
    
    shabbatDatabase = demoData;
    return demoData;
  } catch (error) {
    console.error('Error fetching Shabbat data:', error);
    shabbatDatabase = [];
    return [];
  }
};

export { calculateShabbatMinchaTime, calculateShabbatKabalatTime };

