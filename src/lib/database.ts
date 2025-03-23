
import { format } from 'date-fns';

export interface ZmanimData {
  date: string;
  alotHaShachar: string;
  sunrise: string;
  misheyakir: string;
  sofZmanShmaMGA: string;
  sofZmanShma: string;
  sofZmanTfillaMGA: string;
  sofZmanTfilla: string;
  chatzot: string;
  minchaGedola: string;
  plagHaMincha: string;
  sunset: string;
  beinHaShmashos: string;
}

export interface HolidayData {
  title: string;
  hebrew: string;
  date: string;
  category: string;
  subcat?: string;
  candles?: string;
  havdalah?: string;
}

export interface ShabbatData {
  title: string;
  parashat: string;
  parashatHebrew: string;
  holiday?: string;
  holidayHebrew?: string;
  candlesPT: string;
  candlesTA: string;
  havdalah: string;
}

// In-memory storage for our data
let zmanimDatabase: ZmanimData[] = [];
let holidaysDatabase: HolidayData[] = [];
let shabbatDatabase: ShabbatData[] = [];
let lastUpdated: Date | null = null;

// Initialize the database
export const initDatabase = async () => {
  try {
    if (zmanimDatabase.length === 0) {
      await fetchZmanim();
    }
    
    if (holidaysDatabase.length === 0) {
      await fetchHolidays();
    }
    
    if (shabbatDatabase.length === 0) {
      await fetchShabbat();
    }
    
    console.log('Database initialized');
    lastUpdated = new Date();
    
    return {
      zmanim: zmanimDatabase,
      holidays: holidaysDatabase,
      shabbat: shabbatDatabase
    };
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// Fetch zmanim data from the API
const fetchZmanim = async () => {
  try {
    const response = await fetch('https://www.hebcal.com/zmanim?cfg=json&geonameid=293918&start=2025-03-01&end=2026-12-31');
    const data = await response.json();
    
    if (data.items) {
      zmanimDatabase = data.items.map((item: any) => ({
        date: item.date,
        alotHaShachar: formatTime(item.alotHaShachar),
        sunrise: formatTime(item.sunrise),
        misheyakir: formatTime(item.misheyakir),
        sofZmanShmaMGA: formatTime(item.sofZmanShmaMGA),
        sofZmanShma: formatTime(item.sofZmanShma),
        sofZmanTfillaMGA: formatTime(item.sofZmanTfillaMGA),
        sofZmanTfilla: formatTime(item.sofZmanTfilla),
        chatzot: formatTime(item.chatzot),
        minchaGedola: formatTime(item.minchaGedola),
        plagHaMincha: formatTime(item.plagHaMincha),
        sunset: formatTime(item.sunset),
        beinHaShmashos: formatTime(item.beinHaShmashos)
      }));
    }
  } catch (error) {
    console.error('Error fetching zmanim data:', error);
    throw error;
  }
};

// Fetch holidays data from the API
const fetchHolidays = async () => {
  try {
    const response = await fetch('https://www.hebcal.com/hebcal?v=1&cfg=json&maj=on&min=on&mod=on&nx=on&year=now&month=x&ss=on&mf=on&c=on&geo=geoname&geonameid=293918&M=on&s=on');
    const data = await response.json();
    
    if (data.items) {
      holidaysDatabase = data.items.map((item: any) => ({
        title: item.title,
        hebrew: item.hebrew || '',
        date: item.date,
        category: item.category,
        subcat: item.subcat,
        candles: item.candles ? formatTime(item.candles) : undefined,
        havdalah: item.havdalah ? formatTime(item.havdalah) : undefined
      }));
    }
  } catch (error) {
    console.error('Error fetching holidays data:', error);
    throw error;
  }
};

// Fetch Shabbat data from the API
const fetchShabbat = async () => {
  try {
    // Fetch Petach Tikva Shabbat times
    const responsePT = await fetch('https://www.hebcal.com/shabbat?cfg=json&geonameid=293918&b=40&M=on');
    const dataPT = await responsePT.json();
    
    // Fetch Tel Aviv Shabbat times
    const responseTA = await fetch('https://www.hebcal.com/shabbat?cfg=json&geonameid=293397&b=18&M=on');
    const dataTA = await responseTA.json();
    
    if (dataPT.items && dataTA.items) {
      // Process Shabbat data
      const processedData = dataPT.items
        .filter((item: any) => item.category === 'parashat' || 
                              (item.category === 'candles' || 
                               item.category === 'havdalah'))
        .reduce((acc: any, item: any, idx: number, arr: any[]) => {
          if (item.category === 'parashat') {
            acc.parashat = item.title;
            acc.parashatHebrew = item.hebrew;
            
            // Check if this Shabbat has a holiday
            const holiday = holidaysDatabase.find(h => 
              h.date.split('T')[0] === item.date.split('T')[0] && 
              h.category === 'holiday' && 
              h.subcat === 'shabbat'
            );
            
            if (holiday) {
              acc.holiday = holiday.title;
              acc.holidayHebrew = holiday.hebrew;
            }
          } else if (item.category === 'candles') {
            acc.candlesPT = formatTime(item.date);
            
            // Find matching Tel Aviv candle lighting
            const taCandleItem = dataTA.items.find((taItem: any) => 
              taItem.category === 'candles' && 
              format(new Date(taItem.date), 'yyyy-MM-dd') === format(new Date(item.date), 'yyyy-MM-dd')
            );
            
            if (taCandleItem) {
              acc.candlesTA = formatTime(taCandleItem.date);
            }
          } else if (item.category === 'havdalah') {
            acc.havdalah = formatTime(item.date);
          }
          
          return acc;
        }, {} as ShabbatData);
      
      shabbatDatabase = [processedData];
    }
  } catch (error) {
    console.error('Error fetching Shabbat data:', error);
    throw error;
  }
};

// Helper function to format time from ISO date string
export const formatTime = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return format(date, 'HH:mm');
  } catch (e) {
    console.error('Error formatting time:', e);
    return '';
  }
};

// Get today's zmanim
export const getTodayZmanim = (): ZmanimData | null => {
  const today = format(new Date(), 'yyyy-MM-dd');
  return zmanimDatabase.find(item => item.date.startsWith(today)) || null;
};

// Get today's holiday if any
export const getTodayHoliday = (): HolidayData | null => {
  const today = format(new Date(), 'yyyy-MM-dd');
  return holidaysDatabase.find(item => item.date.startsWith(today)) || null;
};

// Get this week's Shabbat
export const getThisWeekShabbat = (): ShabbatData | null => {
  // In a real app, would look for the next Shabbat
  return shabbatDatabase[0] || null;
};

// Check if it's Rosh Chodesh today
export const isRoshChodeshToday = (): boolean => {
  const today = format(new Date(), 'yyyy-MM-dd');
  return holidaysDatabase.some(item => 
    item.date.startsWith(today) && 
    item.category === 'roshchodesh'
  );
};

// Calculate mincha time based on sunset times
export const calculateWeeklyMinchaTime = (): string => {
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
  
  // Get sunset times for each day
  const sunsetTimes = zmanimDatabase
    .filter(item => weekDays.some(day => item.date.startsWith(day)))
    .map(item => {
      const [hours, minutes] = item.sunset.split(':').map(Number);
      return hours * 60 + minutes; // Convert to minutes
    });
  
  if (sunsetTimes.length === 0) return "17:30"; // Fallback
  
  // Find earliest sunset
  const earliestSunsetMinutes = Math.min(...sunsetTimes);
  
  // Subtract 11-15 minutes and round to nearest 5 minutes (up)
  const minchaMinutes = earliestSunsetMinutes - 15;
  const roundedMinutes = Math.ceil(minchaMinutes / 5) * 5;
  
  // Convert back to HH:MM format
  const hours = Math.floor(roundedMinutes / 60);
  const minutes = roundedMinutes % 60;
  
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

// Calculate arvit time based on beinHaShmashos (tzet hakochavim) times
export const calculateWeeklyArvitTime = (): string => {
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
  
  // Get tzet times for each day
  const tzetTimes = zmanimDatabase
    .filter(item => weekDays.some(day => item.date.startsWith(day)))
    .map(item => {
      const [hours, minutes] = item.beinHaShmashos.split(':').map(Number);
      return hours * 60 + minutes; // Convert to minutes
    });
  
  if (tzetTimes.length === 0) return "18:45"; // Fallback
  
  // Find latest tzet
  const latestTzetMinutes = Math.max(...tzetTimes);
  
  // Round to nearest 5 minutes according to rules
  let roundedMinutes;
  const remainder = latestTzetMinutes % 5;
  
  if (remainder <= 2) {
    // Round down
    roundedMinutes = latestTzetMinutes - remainder;
  } else {
    // Round up
    roundedMinutes = latestTzetMinutes + (5 - remainder);
  }
  
  // Convert back to HH:MM format
  const hours = Math.floor(roundedMinutes / 60);
  const minutes = roundedMinutes % 60;
  
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

// Calculate Shabbat mincha time
export const calculateShabbatMinchaTime = (havdalah: string): string => {
  if (!havdalah) return "17:00"; // Fallback
  
  const [hours, minutes] = havdalah.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes;
  
  // One hour before havdalah, rounded to nearest 5 minutes (down)
  const minchaMinutes = totalMinutes - 60;
  const roundedMinutes = Math.floor(minchaMinutes / 5) * 5;
  
  // Convert back to HH:MM format
  const minchaHours = Math.floor(roundedMinutes / 60);
  const minchaMinutesPart = roundedMinutes % 60;
  
  return `${String(minchaHours).padStart(2, '0')}:${String(minchaMinutesPart).padStart(2, '0')}`;
};

// Calculate Shabbat kabalat time
export const calculateShabbatKabalatTime = (sunset: string): string => {
  if (!sunset) return "18:00"; // Fallback
  
  const [hours, minutes] = sunset.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes;
  
  // 11-15 minutes before sunset, rounded to nearest 5 minutes (up)
  const kabalatMinutes = totalMinutes - 15;
  const roundedMinutes = Math.ceil(kabalatMinutes / 5) * 5;
  
  // Convert back to HH:MM format
  const kabalatHours = Math.floor(roundedMinutes / 60);
  const kabalatMinutesPart = roundedMinutes % 60;
  
  return `${String(kabalatHours).padStart(2, '0')}:${String(kabalatMinutesPart).padStart(2, '0')}`;
};

// Update database - to be called by a cron job or scheduled task
export const updateDatabase = async () => {
  await fetchZmanim();
  await fetchHolidays();
  lastUpdated = new Date();
  console.log('Daily update completed at', lastUpdated);
};

// Update Shabbat info - to be called weekly
export const updateShabbatInfo = async () => {
  await fetchShabbat();
  console.log('Weekly Shabbat update completed at', new Date());
};
