
import { getLastUpdated, setLastUpdated } from './core';
import { getZmanimForDate, getZmanimForWeek, getShabbatTimes, getHolidays } from '@/lib/supabase/zmanim';
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
    
    // Get zmanim for the current week
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
export const isRoshChodeshToday = () => {
  // This will be implemented with actual logic later
  return false;
};

export const recalculatePrayerTimes = () => {
  return {
    minchaTime: '17:30',
    arvitTime: '18:30'
  };
};

export const getThisWeekShabbat = async () => {
  const today = new Date();
  const saturday = addDays(startOfWeek(today), 6);
  return await getShabbatTimes(format(saturday, 'yyyy-MM-dd'));
};

export const updateDatabase = async () => {
  await initDatabase();
};

export const updateShabbatInfo = async () => {
  const shabbat = await getThisWeekShabbat();
  return shabbat;
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

