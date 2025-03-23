
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
    
    // First, try to fetch today's specific zmanim for validation
    const todayResponse = await fetch(`https://www.hebcal.com/zmanim?cfg=json&geonameid=293918&date=${today}`);
    
    if (todayResponse.ok) {
      const todayData = await todayResponse.json();
      if (todayData.times) {
        const processedItem = processSingleDayZmanim(todayData, today);
        if (processedItem) {
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
    
    // Use tzeit7083deg for tzet if available, otherwise use beinHaShmashos
    const tzeitTime = times.tzeit7083deg?.[date] || times.beinHaShmashos?.[date] || '';
    
    return {
      date,
      alotHaShachar: formatTime(times.alotHaShachar?.[date] || ''),
      sunrise: formatTime(times.sunrise?.[date] || ''),
      misheyakir: formatTime(times.misheyakir?.[date] || ''),
      sofZmanShmaMGA: formatTime(times.sofZmanShmaMGA?.[date] || ''),
      sofZmanShma: formatTime(times.sofZmanShma?.[date] || ''),
      sofZmanTfillaMGA: formatTime(times.sofZmanTfillaMGA?.[date] || ''),
      sofZmanTfilla: formatTime(times.sofZmanTfilla?.[date] || ''),
      chatzot: formatTime(times.chatzot?.[date] || ''),
      minchaGedola: formatTime(times.minchaGedola?.[date] || ''),
      plagHaMincha: formatTime(times.plagHaMincha?.[date] || ''),
      sunset: formatTime(times.sunset?.[date] || ''),
      beinHaShmashos: formatTime(tzeitTime)
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
      // Use tzeit7083deg for tzet if available, otherwise use beinHaShmashos
      const tzeitTime = times.tzeit7083deg?.[date] || times.beinHaShmashos?.[date] || '';
      
      processed.push({
        date,
        alotHaShachar: formatTime(times.alotHaShachar?.[date] || ''),
        sunrise: formatTime(times.sunrise?.[date] || ''),
        misheyakir: formatTime(times.misheyakir?.[date] || ''),
        sofZmanShmaMGA: formatTime(times.sofZmanShmaMGA?.[date] || ''),
        sofZmanShma: formatTime(times.sofZmanShma?.[date] || ''),
        sofZmanTfillaMGA: formatTime(times.sofZmanTfillaMGA?.[date] || ''),
        sofZmanTfilla: formatTime(times.sofZmanTfilla?.[date] || ''),
        chatzot: formatTime(times.chatzot?.[date] || ''),
        minchaGedola: formatTime(times.minchaGedola?.[date] || ''),
        plagHaMincha: formatTime(times.plagHaMincha?.[date] || ''),
        sunset: formatTime(times.sunset?.[date] || ''),
        beinHaShmashos: formatTime(tzeitTime)
      });
    } catch (error) {
      console.error(`Error processing zmanim for date ${date}:`, error);
    }
  }
  
  return processed;
};

// Get today's zmanim
export const getTodayZmanim = (): ZmanimData | null => {
  const today = format(new Date(), 'yyyy-MM-dd');
  return zmanimDatabase.find(item => item.date.startsWith(today)) || null;
};

// Get zmanim database
export const getZmanimDatabase = (): ZmanimData[] => {
  return zmanimDatabase;
};
