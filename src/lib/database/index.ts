
import { getLastUpdated, setLastUpdated } from './core';
import { getZmanimForDate, getZmanimForWeek, getShabbatTimes, getHolidays, getZmanimDatabase as getSupabaseZmanimDB, getHolidaysDatabase as getSupabaseHolidaysDB } from '@/lib/supabase/zmanim';
import type { ZmanimData } from './zmanim';
import { format, addDays, startOfWeek } from 'date-fns';

// Initialize zmanim database
let zmanimDatabase: ZmanimData[] = [];

// Initialize the database
export const initDatabase = async () => {
  try {
    // Get current week's dates
    const today = new Date();
    const startOfCurrentWeek = startOfWeek(today);
    const endOfWeek = addDays(startOfCurrentWeek, 6);
    
    // Get data from Supabase
    const supabaseData = await getSupabaseZmanimDB();
    if (supabaseData && supabaseData.length > 0) {
      console.log('Database initialized with Supabase zmanim data');
      zmanimDatabase = supabaseData;
      setLastUpdated(new Date());
      return supabaseData;
    }
    
    // If no data in Supabase, get weekly zmanim
    const weeklyZmanim = await getZmanimForWeek(
      format(startOfCurrentWeek, 'yyyy-MM-dd'),
      format(endOfWeek, 'yyyy-MM-dd')
    );
    
    zmanimDatabase = weeklyZmanim;
    console.log('Database initialized with weekly zmanim:', weeklyZmanim);
    
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
  return false;
};

export const recalculatePrayerTimes = () => {
  return {
    minchaTime: '17:30',
    arvitTime: '18:30'
  };
};

export const getThisWeekShabbat = async (specificDate?: Date) => {
  const today = specificDate || new Date();
  const dayOfWeek = today.getDay();
  const daysToSaturday = dayOfWeek === 6 ? 0 : 6 - dayOfWeek;
  const saturday = addDays(today, daysToSaturday);
  
  return await getShabbatTimes(format(saturday, 'yyyy-MM-dd'));
};

// Update database functions
export const updateDatabase = async () => {
  console.log('Updating database...');
  await initDatabase();
  window.dispatchEvent(new Event('zmanim-updated'));
};

export const updateShabbatInfo = async () => {
  console.log('Updating Shabbat information...');
  const shabbat = await getThisWeekShabbat();
  window.dispatchEvent(new Event('shabbat-updated'));
  return shabbat;
};

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
export { forceUpdate } from '@/lib/scheduler';
