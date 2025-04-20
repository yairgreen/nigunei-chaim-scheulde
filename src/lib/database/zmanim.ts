
import { format } from 'date-fns';
import { formatTime } from './core';

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

// In-memory storage
let zmanimDatabase: ZmanimData[] = [];

// Fetch zmanim data from the API
export const fetchZmanim = async (): Promise<ZmanimData[]> => {
  try {
    const today = format(new Date(), 'yyyy-MM-dd');
    console.log(`Fetching zmanim for today: ${today}`);
    
    // First, try to fetch today's specific zmanim
    const todayResponse = await fetch(`https://www.hebcal.com/zmanim?cfg=json&geonameid=293918&date=${today}`);
    
    if (todayResponse.ok) {
      const todayData = await todayResponse.json();
      console.log('API response for today:', todayData);
      
      if (todayData.times) {
        const processedItem = processSingleDayZmanim(todayData, today);
        if (processedItem) {
          console.log('Processed zmanim for today:', processedItem);
          zmanimDatabase = [processedItem];
          return zmanimDatabase;
        }
      }
    }
    
    // If today's specific data fails, fetch the range
    const response = await fetch('https://www.hebcal.com/zmanim?cfg=json&geonameid=293918&start=2025-03-01&end=2026-12-31');
    const data = await response.json();
    
    if (data.times) {
      zmanimDatabase = processZmanimData(data);
    }
    
    return zmanimDatabase;
  } catch (error) {
    console.error('Error fetching zmanim data:', error);
    throw error;
  }
};

// Process zmanim data for a single day
const processSingleDayZmanim = (data: any, date: string): ZmanimData | null => {
  try {
    const times = data.times;
    if (!times) return null;
    
    // Extract time portion from ISO format
    const extractTime = (isoTime: string): string => {
      if (!isoTime) return '';
      try {
        // Parse the ISO time string
        const timeObj = new Date(isoTime);
        // Format as HH:MM
        return timeObj.toLocaleTimeString('he-IL', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
      } catch (e) {
        console.error('Error parsing time:', isoTime, e);
        return '';
      }
    };
    
    return {
      date,
      alotHaShachar: extractTime(times.alotHaShachar || ''),
      sunrise: extractTime(times.sunrise || ''),
      misheyakir: extractTime(times.misheyakir || ''),
      sofZmanShmaMGA: extractTime(times.sofZmanShmaMGA || ''),
      sofZmanShma: extractTime(times.sofZmanShma || ''),
      sofZmanTfillaMGA: extractTime(times.sofZmanTfillaMGA || ''),
      sofZmanTfilla: extractTime(times.sofZmanTfilla || ''),
      chatzot: extractTime(times.chatzot || ''),
      minchaGedola: extractTime(times.minchaGedola || ''),
      plagHaMincha: extractTime(times.plagHaMincha || ''),
      sunset: extractTime(times.sunset || ''),
      beinHaShmashos: extractTime(times.beinHaShmashos || '')
    };
  } catch (error) {
    console.error('Error processing single day zmanim data:', error);
    return null;
  }
};

// Process zmanim data for a range of dates
const processZmanimData = (data: any): ZmanimData[] => {
  const processed: ZmanimData[] = [];
  const times = data.times;
  if (!times || !times.sunrise) return processed;
  
  // Get all the dates from the sunrise object as it should be present for all days
  const dates = Object.keys(times.sunrise);
  
  for (const date of dates) {
    try {
      // Extract time portion from ISO format
      const extractTime = (isoTime: string): string => {
        if (!isoTime) return '';
        try {
          // Parse the ISO time string
          const timeObj = new Date(isoTime);
          // Format as HH:MM
          return timeObj.toLocaleTimeString('he-IL', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          });
        } catch (e) {
          console.error('Error parsing time:', isoTime, e);
          return '';
        }
      };
      
      processed.push({
        date,
        alotHaShachar: extractTime(times.alotHaShachar?.[date] || ''),
        sunrise: extractTime(times.sunrise?.[date] || ''),
        misheyakir: extractTime(times.misheyakir?.[date] || ''),
        sofZmanShmaMGA: extractTime(times.sofZmanShmaMGA?.[date] || ''),
        sofZmanShma: extractTime(times.sofZmanShma?.[date] || ''),
        sofZmanTfillaMGA: extractTime(times.sofZmanTfillaMGA?.[date] || ''),
        sofZmanTfilla: extractTime(times.sofZmanTfilla?.[date] || ''),
        chatzot: extractTime(times.chatzot?.[date] || ''),
        minchaGedola: extractTime(times.minchaGedola?.[date] || ''),
        plagHaMincha: extractTime(times.plagHaMincha?.[date] || ''),
        sunset: extractTime(times.sunset?.[date] || ''),
        beinHaShmashos: extractTime(times.beinHaShmashos?.[date] || '')
      });
    } catch (error) {
      console.error(`Error processing zmanim for date ${date}:`, error);
    }
  }
  
  return processed;
};

// Get today's zmanim
export const getTodayZmanim = async (): Promise<ZmanimData | null> => {
  const today = format(new Date(), 'yyyy-MM-dd');
  
  // Always try to get fresh data from the API
  try {
    // For today's specific date, we'll try to get real-time data
    console.log(`Fetching fresh zmanim for today: ${today}`);
    const response = await fetch(`https://www.hebcal.com/zmanim?cfg=json&geonameid=293918&date=${today}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Fresh zmanim API response:', data);
      
      if (data.times) {
        // Process the zmanim data for today
        const processedItem = processSingleDayZmanim(data, today);
        if (processedItem) {
          // Add it to our in-memory database
          const existingIdx = zmanimDatabase.findIndex(item => item.date === today);
          if (existingIdx >= 0) {
            zmanimDatabase[existingIdx] = processedItem;
          } else {
            zmanimDatabase.push(processedItem);
          }
          console.log('Using fresh zmanim data:', processedItem);
          return processedItem;
        }
      }
    } else {
      console.error('Failed to fetch fresh zmanim:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('Error fetching today\'s zmanim:', error);
  }
  
  // If we couldn't get fresh data, look in our database
  const existingData = zmanimDatabase.find(item => item.date === today);
  if (existingData) {
    console.log('Using cached zmanim data:', existingData);
    return existingData;
  }
  
  // If not in database, return demo data appropriate for April 15, 2025
  console.log('Using demo zmanim data for today:', today);
  return {
    date: today,
    alotHaShachar: '04:52',
    sunrise: '06:08',
    misheyakir: '05:15',
    sofZmanShmaMGA: '08:48',
    sofZmanShma: '09:24',
    sofZmanTfillaMGA: '10:05',
    sofZmanTfilla: '10:29',
    chatzot: '12:40',
    minchaGedola: '13:13',
    plagHaMincha: '17:50',
    sunset: '19:12',
    beinHaShmashos: '19:29'
  };
};

// Get zmanim for a specific date
export const getZmanimForSpecificDate = async (date: Date): Promise<ZmanimData | null> => {
  const formattedDate = format(date, 'yyyy-MM-dd');
  
  // Check if we already have this date in our database
  const existingData = zmanimDatabase.find(item => item.date === formattedDate);
  if (existingData) {
    console.log('Using cached zmanim for specific date:', existingData);
    return existingData;
  }
  
  // If not, try to fetch it
  try {
    console.log(`Fetching zmanim for date: ${formattedDate}`);
    const response = await fetch(`https://www.hebcal.com/zmanim?cfg=json&geonameid=293918&date=${formattedDate}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Zmanim API response for specific date:', data);
      
      if (data.times) {
        const processedItem = processSingleDayZmanim(data, formattedDate);
        if (processedItem) {
          zmanimDatabase.push(processedItem);
          console.log('Using fresh zmanim for specific date:', processedItem);
          return processedItem;
        }
      }
    } else {
      console.error('Failed to fetch zmanim for specific date:', response.status, response.statusText);
    }
  } catch (error) {
    console.error(`Error fetching zmanim for date ${formattedDate}:`, error);
  }
  
  // If we couldn't get data, create a default based on today's data
  console.log('Using demo zmanim data for date:', formattedDate);
  return {
    date: formattedDate,
    alotHaShachar: '04:52',
    sunrise: '06:08',
    misheyakir: '05:15',
    sofZmanShmaMGA: '08:48',
    sofZmanShma: '09:24',
    sofZmanTfillaMGA: '10:05',
    sofZmanTfilla: '10:29',
    chatzot: '12:40',
    minchaGedola: '13:13',
    plagHaMincha: '17:50',
    sunset: '19:12',
    beinHaShmashos: '19:29'
  };
};

// Get zmanim database
export const getZmanimDatabase = (): ZmanimData[] => {
  return zmanimDatabase;
};
