
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
export { ZmanimData, getTodayZmanim } from './zmanim';
export { HolidayData, getTodayHoliday, isRoshChodeshToday } from './holidays';
export { 
  ShabbatData, 
  getThisWeekShabbat, 
  calculateShabbatMinchaTime, 
  calculateShabbatKabalatTime 
} from './shabbat';
export { calculateWeeklyMinchaTime, calculateWeeklyArvitTime } from './prayers';

// Initialize the database
export const initDatabase = async () => {
  try {
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
    throw error;
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
  
  const minchaTime = calculateWeeklyMinchaTime(zmanimForWeek);
  const arvitTime = calculateWeeklyArvitTime(zmanimForWeek);
  
  return { minchaTime, arvitTime };
};
