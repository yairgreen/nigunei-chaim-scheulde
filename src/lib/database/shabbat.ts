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
      console.log('שליפת נתוני שבת: מאגר ריק, מרענן נתונים...');
      await fetchShabbat();
    }
    
    const targetDate = specificDate || new Date();
    const dayOfWeek = targetDate.getDay();
    const daysUntilSaturday = (dayOfWeek === 6) ? 0 : 6 - dayOfWeek;
    const saturday = new Date(targetDate);
    saturday.setDate(targetDate.getDate() + daysUntilSaturday);
    
    const saturdayFormatted = format(saturday, 'yyyy-MM-dd');
    console.log('מחפש נתונים עבור שבת בתאריך:', saturdayFormatted);
    
    // Find that Shabbat in our database
    const shabbat = shabbatDatabase.find(item => item.date === saturdayFormatted);
    
    if (!shabbat) {
      console.log(`לא נמצאו נתונים עבור שבת ${saturdayFormatted}, יוצר נתוני ברירת מחדל`);
      const demoData = getDemoShabbatData(saturdayFormatted);
      shabbatDatabase.push(demoData);
      return demoData;
    }
    
    console.log('נמצאו נתוני שבת:', {
      תאריך: shabbat.date,
      פרשה: shabbat.parasha || shabbat.parashat_hebrew,
      'שבת מיוחדת': shabbat.special_shabbat || shabbat.holiday_hebrew,
      'הדלקת נרות פ"ת': shabbat.candle_lighting_petah_tikva,
      'הדלקת נרות ת"א': shabbat.candle_lighting_tel_aviv,
      'צאת השבת': shabbat.havdalah_petah_tikva
    });
    
    return shabbat;
  } catch (error) {
    console.error('שגיאה בשליפת נתוני שבת:', error);
    return getDemoShabbatData(format(specificDate || new Date(), 'yyyy-MM-dd'));
  }
};

// Fetch Shabbat data from Supabase
export const fetchShabbat = async (): Promise<ShabbatData[]> => {
  try {
    console.log('מתחיל שליפת נתוני שבת מ-Supabase...');
    
    const { data, error } = await supabase
      .from('shabbat_times')
      .select('*')
      .order('date');

    if (error) {
      console.error('שגיאה בשליפה מ-Supabase:', error);
      throw error;
    }

    if (data && data.length > 0) {
      console.log(`נשלפו ${data.length} רשומות שבת מ-Supabase`);
      shabbatDatabase = data;
      return data;
    }
    
    console.log('לא נמצאו נתונים ב-Supabase, משתמש בנתוני דמו');
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
    console.error('שגיאה בשליפת נתוני שבת:', error);
    shabbatDatabase = [];
    return [];
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
