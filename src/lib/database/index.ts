
import { getLastUpdated, setLastUpdated } from './core';
import { getZmanimForDate, getZmanimForWeek, getShabbatTimes, getHolidays, getZmanimDatabase as getSupabaseZmanimDB, getHolidaysDatabase as getSupabaseHolidaysDB } from '@/lib/supabase/zmanim';
import { fetchZmanim } from './zmanim';
import type { ZmanimData } from './zmanim';
import { format, addDays, startOfWeek } from 'date-fns';

// Initialize zmanim database with default values first
let zmanimDatabase: ZmanimData[] = [];

// Initialize the database
export const initDatabase = async () => {
  try {
    // Get current week's dates
    const today = new Date();
    const startOfCurrentWeek = startOfWeek(today);
    const endOfWeek = addDays(startOfCurrentWeek, 6);
    
    // First try to use the Supabase data
    try {
      const supabaseData = await getSupabaseZmanimDB();
      if (supabaseData && supabaseData.length > 0) {
        console.log('Database initialized with Supabase zmanim data');
        zmanimDatabase = supabaseData;
        setLastUpdated(new Date());
        return supabaseData;
      }
    } catch (error) {
      console.error('Error loading from Supabase, falling back to API:', error);
    }
    
    // If Supabase fails or returns no data, fall back to API
    // Get zmanim for the current week
    try {
      const apiData = await fetchZmanim();
      if (apiData && apiData.length > 0) {
        zmanimDatabase = apiData;
        console.log('Database initialized with API zmanim data:', apiData);
        setLastUpdated(new Date());
        return apiData;
      }
    } catch (apiError) {
      console.error('API data fetch failed:', apiError);
    }
    
    // Last resort: Use the getZmanimForWeek function which has fallback data
    const weeklyZmanim = await getZmanimForWeek(
      format(startOfCurrentWeek, 'yyyy-MM-dd'),
      format(endOfWeek, 'yyyy-MM-dd')
    );
    
    zmanimDatabase = weeklyZmanim;
    console.log('Database initialized with weekly zmanim fallback:', weeklyZmanim);
    
    setLastUpdated(new Date());
    return weeklyZmanim;
  } catch (error) {
    console.error('Error initializing database:', error);
    return [];
  }
};

// Get today's zmanim
export const getTodayZmanim = async (): Promise<ZmanimData | null> => {
  const today = format(new Date(), 'yyyy-MM-dd');
  return await getZmanimForDate(today);
};

// Get zmanim for a specific date
export const getZmanimForSpecificDate = async (date: Date): Promise<ZmanimData | null> => {
  const formattedDate = format(date, 'yyyy-MM-dd');
  return await getZmanimForDate(formattedDate);
};

// Helper functions
export const isRoshChodeshToday = (specificDate?: Date) => {
  // This will be implemented with actual logic later
  // For now return false since we know today isn't Rosh Chodesh
  return false;
};

export const recalculatePrayerTimes = () => {
  // Implement proper calculation based on sunset times
  // This is a simplified version for now
  return {
    minchaTime: '17:30',
    arvitTime: '18:30'
  };
};

export const getThisWeekShabbat = async (specificDate?: Date) => {
  const today = specificDate || new Date();
  const dayOfWeek = today.getDay(); // 0 is Sunday, 6 is Saturday
  
  // Calculate the next Saturday - if today is Saturday, use today
  const daysToSaturday = dayOfWeek === 6 ? 0 : 6 - dayOfWeek;
  const saturday = addDays(today, daysToSaturday);
  
  return await getShabbatTimes(format(saturday, 'yyyy-MM-dd'));
};

export const updateDatabase = async () => {
  console.log('Updating database...');
  await initDatabase();
  // Dispatch events to notify components about data changes
  window.dispatchEvent(new Event('zmanim-updated'));
};

export const updateShabbatInfo = async () => {
  console.log('Updating Shabbat information...');
  const shabbat = await getThisWeekShabbat();
  // Dispatch events to notify components about Shabbat data changes
  window.dispatchEvent(new Event('shabbat-updated'));
  return shabbat;
};

// REMOVED: Removed duplicate forceUpdate export here to fix the duplicate export error

// Export database access functions
export const getZmanimDatabase = async () => {
  try {
    return await getSupabaseZmanimDB();
  } catch (error) {
    console.error('Error getting zmanim database:', error);
    return [];
  }
};

export const getHolidaysDatabase = async () => {
  try {
    return await getSupabaseHolidaysDB();
  } catch (error) {
    console.error('Error getting holidays database:', error);
    return [];
  }
};

// Export other functions
export * from './core';
export type { ZmanimData } from './zmanim';
export type { HolidayData } from './holidays';
export type { ShabbatData } from './shabbat';
export { 
  calculateShabbatMinchaTime, 
  calculateShabbatKabalatTime,
  getFridaySunsetTime 
} from './shabbat';
export { calculateWeeklyMinchaTime, calculateWeeklyArvitTime } from './prayers';
// Import forceUpdate from scheduler instead of redefining it here
export { forceUpdate } from '@/lib/scheduler';
