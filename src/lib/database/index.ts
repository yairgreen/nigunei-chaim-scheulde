
import { getLastUpdated, setLastUpdated } from './core';
import { fetchZmanim, getTodayZmanim, getZmanimDatabase } from './zmanim';
import { fetchHolidays, getTodayHoliday, isRoshChodeshToday } from './holidays';
import { 
  fetchShabbat, 
  getThisWeekShabbat, 
  calculateShabbatMinchaTime, 
  calculateShabbatKabalatTime 
} from './shabbat';
import { calculateWeeklyMinchaTime, calculateWeeklyArvitTime } from './prayers';
import { format } from 'date-fns';

export { formatTime } from './core';
export type { ZmanimData } from './zmanim';
export { getTodayZmanim, getZmanimDatabase } from './zmanim';
export type { HolidayData } from './holidays';
export { getTodayHoliday, isRoshChodeshToday } from './holidays';
export type { ShabbatData } from './shabbat';
export { 
  getThisWeekShabbat, 
  calculateShabbatMinchaTime, 
  calculateShabbatKabalatTime 
} from './shabbat';
export { calculateWeeklyMinchaTime, calculateWeeklyArvitTime } from './prayers';

// Initialize the database
export const initDatabase = async () => {
  try {
    // Initialize with default data first to prevent rendering empty components
    setDefaultData();
    
    const zmanimPromise = fetchZmanim();
    const holidaysPromise = fetchHolidays();
    const shabbatPromise = fetchShabbat();
    
    // Wait for all data to be fetched
    await Promise.all([zmanimPromise, holidaysPromise, shabbatPromise]);
    
    console.log('Database initialized');
    setLastUpdated(new Date());
    
    return {
      zmanim: getZmanimDatabase(),
      holidays: getTodayHoliday(),
      shabbat: getThisWeekShabbat()
    };
  } catch (error) {
    console.error('Error initializing database:', error);
    // Even if there's an error, continue with default data
    return {
      zmanim: getZmanimDatabase(),
      holidays: getTodayHoliday(),
      shabbat: getThisWeekShabbat()
    };
  }
};

// Set default data to ensure components don't render empty
const setDefaultData = () => {
  // Set default zmanim data if empty
  if (getZmanimDatabase().length === 0) {
    const defaultZmanim = {
      date: format(new Date(), 'yyyy-MM-dd'),
      alotHaShachar: '05:20',
      sunrise: '06:07',
      misheyakir: '05:40',
      sofZmanShmaMGA: '08:44',
      sofZmanShma: '09:20',
      sofZmanTfillaMGA: '09:48',
      sofZmanTfilla: '10:26',
      chatzot: '11:53',
      minchaGedola: '12:25',
      plagHaMincha: '17:22',
      sunset: '17:39',
      beinHaShmashos: '18:05'
    };
    
    (getZmanimDatabase() as any).push(defaultZmanim);
  }
};

// Update database - to be called by a cron job or scheduled task
export const updateDatabase = async () => {
  await fetchZmanim();
  await fetchHolidays();
  setLastUpdated(new Date());
  console.log('Daily update completed at', getLastUpdated());
};

// Update Shabbat info - to be called weekly
export const updateShabbatInfo = async () => {
  await fetchShabbat();
  console.log('Weekly Shabbat update completed at', new Date());
};

// Recalculate prayer times based on current zmanim
export const recalculatePrayerTimes = () => {
  try {
    const today = new Date();
    const startOfWeek = new Date(today);
    const dayOfWeek = today.getDay(); // 0 is Sunday
    
    // Set to start of current week (Sunday)
    startOfWeek.setDate(today.getDate() - dayOfWeek);
    
    // Get this week's days (Sun-Thu)
    const weekDays = [];
    for (let i = 0; i < 5; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDays.push(format(date, 'yyyy-MM-dd'));
    }
    
    // Get zmanim for these days
    const zmanimForWeek = getZmanimDatabase()
      .filter(item => weekDays.some(day => item.date.startsWith(day)));
    
    // If no data available, use default values
    if (zmanimForWeek.length === 0) {
      return { minchaTime: '17:15', arvitTime: '18:15' };
    }
    
    const minchaTime = calculateWeeklyMinchaTime(zmanimForWeek);
    const arvitTime = calculateWeeklyArvitTime(zmanimForWeek);
    
    return { minchaTime, arvitTime };
  } catch (error) {
    console.error('Error calculating prayer times:', error);
    return { minchaTime: '17:15', arvitTime: '18:15' };
  }
};
