
import { getLastUpdated, setLastUpdated } from './core';
import { fetchZmanim, getTodayZmanim, getZmanimDatabase } from './zmanim';
import { fetchHolidays, getTodayHoliday, isRoshChodeshToday, getHolidaysDatabase } from './holidays';
import { 
  fetchShabbat, 
  getThisWeekShabbat, 
  calculateShabbatMinchaTime, 
  calculateShabbatKabalatTime,
  getFridaySunsetTime 
} from './shabbat';
import { calculateWeeklyMinchaTime, calculateWeeklyArvitTime } from './prayers';
import { format } from 'date-fns';

export { formatTime } from './core';
export { getLastUpdated } from './core';
export type { ZmanimData } from './zmanim';
export { getTodayZmanim, getZmanimDatabase } from './zmanim';
export type { HolidayData } from './holidays';
export { getTodayHoliday, isRoshChodeshToday, getHolidaysDatabase } from './holidays';
export type { ShabbatData } from './shabbat';
export { 
  getThisWeekShabbat, 
  calculateShabbatMinchaTime, 
  calculateShabbatKabalatTime,
  getFridaySunsetTime 
} from './shabbat';
export { calculateWeeklyMinchaTime, calculateWeeklyArvitTime } from './prayers';

// Initialize the database with default values first
const setDefaultData = () => {
  // Set default zmanim data if empty
  if (getZmanimDatabase().length === 0) {
    const defaultZmanim = {
      date: format(new Date(), 'yyyy-MM-dd'),
      alotHaShachar: '04:28',
      sunrise: '05:40',
      misheyakir: '04:50',
      sofZmanShmaMGA: '08:08',
      sofZmanShma: '08:44',
      sofZmanTfillaMGA: '09:21',
      sofZmanTfilla: '09:45',
      chatzot: '11:47',
      minchaGedola: '12:18',
      plagHaMincha: '16:38',
      sunset: '17:54',
      beinHaShmashos: '18:24'
    };
    
    (getZmanimDatabase() as any).push(defaultZmanim);
  }
};

// Initialize the database
export const initDatabase = async () => {
  try {
    // Initialize with default data first to prevent rendering empty components
    setDefaultData();
    
    const zmanimPromise = fetchZmanim().catch(err => {
      console.error('Failed to fetch zmanim:', err);
      return [];
    });
    
    const holidaysPromise = fetchHolidays().catch(err => {
      console.error('Failed to fetch holidays:', err);
      return [];
    });
    
    const shabbatPromise = fetchShabbat().catch(err => {
      console.error('Failed to fetch shabbat data:', err);
      return [];
    });
    
    // Wait for all data to be fetched, but don't fail if one fails
    await Promise.allSettled([zmanimPromise, holidaysPromise, shabbatPromise]);
    
    console.log('Database initialized');
    setLastUpdated(new Date());
    
    return {
      zmanim: getZmanimDatabase(),
      holidays: getTodayHoliday(),
      shabbat: getThisWeekShabbat()
    };
  } catch (error) {
    console.error('Error initializing database:', error);
    return {
      zmanim: getZmanimDatabase(),
      holidays: getTodayHoliday(),
      shabbat: getThisWeekShabbat()
    };
  }
};

// Update database - to be called by a cron job or scheduled task
export const updateDatabase = async () => {
  try {
    await fetchZmanim();
    await fetchHolidays();
    setLastUpdated(new Date());
    console.log('Daily update completed at', getLastUpdated());
  } catch (error) {
    console.error('Error updating database:', error);
  }
};

// Update Shabbat info - to be called weekly
export const updateShabbatInfo = async () => {
  try {
    await fetchShabbat();
    console.log('Weekly Shabbat update completed at', new Date());
  } catch (error) {
    console.error('Error updating Shabbat info:', error);
  }
};

// Recalculate prayer times based on current zmanim
export const recalculatePrayerTimes = () => {
  try {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 is Sunday
    
    // Set to start of current week (Sunday)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);
    
    // Get this week's days (Sun-Thu)
    const weekDays = [];
    for (let i = 0; i < 5; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDays.push(format(date, 'yyyy-MM-dd'));
    }
    
    // Get zmanim for these days
    const zmanimDatabase = getZmanimDatabase();
    console.log('Week days:', weekDays);
    console.log('Zmanim database size:', zmanimDatabase.length);
    
    const zmanimForWeek = zmanimDatabase
      .filter(item => weekDays.includes(item.date));
    
    console.log('Zmanim for this week:', zmanimForWeek);
    
    // If no data available, use default values
    if (zmanimForWeek.length === 0) {
      console.log('No zmanim data for this week, using defaults');
      return { minchaTime: '17:45', arvitTime: '18:25' };
    }
    
    // Calculate times based on the week's data
    const minchaTime = calculateWeeklyMinchaTime(zmanimForWeek);
    const arvitTime = calculateWeeklyArvitTime(zmanimForWeek);
    
    console.log('Calculated mincha time:', minchaTime);
    console.log('Calculated arvit time:', arvitTime);
    
    return { minchaTime, arvitTime };
  } catch (error) {
    console.error('Error calculating prayer times:', error);
    return { minchaTime: '17:45', arvitTime: '18:25' };
  }
};
