
import { getLastUpdated, setLastUpdated } from './core';
import { getZmanimForDate, getZmanimForWeek, getShabbatTimes, getHolidays, getZmanimDatabase as getSupabaseZmanimDB, getHolidaysDatabase as getSupabaseHolidaysDB } from '@/lib/supabase/zmanim';
import type { ZmanimData } from './zmanim';
import { format, addDays, startOfWeek } from 'date-fns';
import { getThisWeekShabbat, fetchShabbat, getFridaySunsetTime } from './shabbat';
import { calculateWeeklyMinchaTime, calculateWeeklyArvitTime } from './prayers';

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

export const recalculatePrayerTimes = async () => {
  try {
    console.log('Recalculating prayer times...');
    const today = new Date();
    const currentDayOfWeek = today.getDay();
    
    // If it's Friday or Saturday, return empty values as we don't need them
    if (currentDayOfWeek === 5 || currentDayOfWeek === 6) {
      return {
        minchaTime: '',
        arvitTime: ''
      };
    }
    
    // Get start of current week (Sunday)
    const startOfCurrentWeek = startOfWeek(today);
    
    // Get the next 5 days (Sun-Thu)
    const weekDays = [];
    for (let i = 0; i < 5; i++) {
      const weekDate = new Date(startOfCurrentWeek);
      weekDate.setDate(startOfCurrentWeek.getDate() + i);
      weekDays.push(format(weekDate, 'yyyy-MM-dd'));
    }
    
    // Get zmanim data for this week
    try {
      const weeklyZmanim = await getZmanimForWeek(
        format(startOfCurrentWeek, 'yyyy-MM-dd'),
        format(addDays(startOfCurrentWeek, 4), 'yyyy-MM-dd')
      );
      
      if (!weeklyZmanim || weeklyZmanim.length === 0) {
        console.warn('No zmanim data available for this week');
        return {
          minchaTime: '',
          arvitTime: ''
        };
      }
      
      // Convert database zmanim to the format needed for calculation
      const zmanimForCalc = weeklyZmanim.map(z => ({
        date: z.date,
        sunset: z.sunset,
        beinHaShmashos: z.beinHaShmashos
      }));
      
      // Calculate mincha and arvit times
      const minchaTime = calculateWeeklyMinchaTime(zmanimForCalc);
      const arvitTime = calculateWeeklyArvitTime(zmanimForCalc);
      
      console.log('Calculated prayer times:', { minchaTime, arvitTime });
      
      return {
        minchaTime: minchaTime || '', // Use empty string if calculation returns falsy
        arvitTime: arvitTime || ''     // Use empty string if calculation returns falsy
      };
    } catch (error) {
      console.error('Error getting zmanim for recalculating prayer times:', error);
      return {
        minchaTime: '',
        arvitTime: ''
      };
    }
  } catch (error) {
    console.error('Error recalculating prayer times:', error);
    return {
      minchaTime: '',
      arvitTime: ''
    };
  }
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
export type { ShabbatData } from './types/shabbat';
export { 
  calculateShabbatMinchaTime, 
  calculateShabbatKabalatTime 
} from './utils/shabbatCalculations';
export { calculateWeeklyMinchaTime, calculateWeeklyArvitTime } from './prayers';
export { forceUpdate } from '@/lib/scheduler';

// Re-export functions from shabbat.ts
export { getThisWeekShabbat, fetchShabbat, getFridaySunsetTime } from './shabbat';
