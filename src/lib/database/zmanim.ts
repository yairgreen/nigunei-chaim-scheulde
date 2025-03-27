
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

// Fetch zmanim data directly for a specific date
export const fetchDailyZmanim = async (date: string): Promise<ZmanimData | null> => {
  try {
    console.log(`Fetching zmanim for date: ${date}`);
    const response = await fetch(`https://www.hebcal.com/zmanim?cfg=json&geonameid=293918&date=${date}`);
    
    if (!response.ok) {
      console.error(`API error: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const data = await response.json();
    console.log('API response:', data);
    
    if (!data || !data.times) {
      console.error('Invalid API response format');
      return null;
    }
    
    // Process the data
    const zmanimData = processSingleDayZmanim(data, date);
    
    // Update the database
    if (zmanimData) {
      // Replace existing entry or add new one
      const existingIndex = zmanimDatabase.findIndex(item => item.date === date);
      if (existingIndex >= 0) {
        zmanimDatabase[existingIndex] = zmanimData;
      } else {
        zmanimDatabase.push(zmanimData);
      }
    }
    
    return zmanimData;
  } catch (error) {
    console.error(`Error fetching zmanim for date ${date}:`, error);
    return null;
  }
};

// Fetch zmanim data for the next 7 days
export const fetchZmanim = async (): Promise<ZmanimData[]> => {
  try {
    const today = format(new Date(), 'yyyy-MM-dd');
    
    // First, try to fetch today's specific zmanim
    const todayData = await fetchDailyZmanim(today);
    if (todayData) {
      console.log('Fetched today\'s zmanim successfully');
    }
    
    // Set up dates for the next 7 days
    const dates = [];
    const startDate = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(format(date, 'yyyy-MM-dd'));
    }
    
    // Fetch zmanim for each date
    const fetchPromises = dates.map(date => fetchDailyZmanim(date));
    const results = await Promise.allSettled(fetchPromises);
    
    console.log(`Fetched zmanim for ${results.length} days`);
    
    // Filter out failed requests
    const successfulResults = results
      .filter((result): result is PromiseFulfilledResult<ZmanimData | null> => 
        result.status === 'fulfilled' && result.value !== null)
      .map(result => result.value as ZmanimData);
    
    return zmanimDatabase;
  } catch (error) {
    console.error('Error fetching zmanim data batch:', error);
    return zmanimDatabase;
  }
};

// Process zmanim data for a single day
const processSingleDayZmanim = (data: any, date: string): ZmanimData | null => {
  try {
    const times = data.times;
    if (!times) return null;
    
    return {
      date,
      alotHaShachar: formatTime(times.alotHaShachar || ''),
      sunrise: formatTime(times.sunrise || ''),
      misheyakir: formatTime(times.misheyakir || ''),
      sofZmanShmaMGA: formatTime(times.sofZmanShmaMGA || ''),
      sofZmanShma: formatTime(times.sofZmanShma || ''),
      sofZmanTfillaMGA: formatTime(times.sofZmanTfillaMGA || ''),
      sofZmanTfilla: formatTime(times.sofZmanTfilla || ''),
      chatzot: formatTime(times.chatzot || ''),
      minchaGedola: formatTime(times.minchaGedola || ''),
      plagHaMincha: formatTime(times.plagHaMincha || ''),
      sunset: formatTime(times.sunset || ''),
      beinHaShmashos: formatTime(times.beinHaShmashos || '')
    };
  } catch (error) {
    console.error('Error processing single day zmanim data:', error);
    return null;
  }
};

// Get today's zmanim
export const getTodayZmanim = (): ZmanimData | null => {
  const today = format(new Date(), 'yyyy-MM-dd');
  
  // Find today's data in the database
  const todayData = zmanimDatabase.find(item => item.date === today);
  
  if (!todayData) {
    console.log('Today\'s zmanim not found in database, fetching from API');
    // We'll return null and let the caller fetch fresh data
    return null;
  }
  
  return todayData;
};

// Get zmanim for a specific date
export const getZmanimForDate = (date: string): ZmanimData | null => {
  return zmanimDatabase.find(item => item.date === date) || null;
};

// Get zmanim database
export const getZmanimDatabase = (): ZmanimData[] => {
  return zmanimDatabase;
};
