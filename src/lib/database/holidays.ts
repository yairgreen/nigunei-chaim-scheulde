
import { format } from 'date-fns';
import { formatTime } from './core';

export interface HolidayData {
  title: string;
  hebrew: string;
  date: string;
  category: string;
  subcat?: string;
  candles?: string;
  havdalah?: string;
  hdate?: string;
}

// In-memory storage
let holidaysDatabase: HolidayData[] = [];

// Fetch holidays data from the API
export const fetchHolidays = async (): Promise<HolidayData[]> => {
  try {
    const today = new Date();
    const formattedDate = format(today, 'yyyy-MM-dd');
    
    const response = await fetch(`https://www.hebcal.com/hebcal?v=1&cfg=json&maj=on&min=on&mod=on&nx=on&start=${formattedDate}&end=${formattedDate}&c=on&ss=on&mf=on&c=on&b=40&d=on&geo=geoname&geonameid=293918&M=on&s=on`);
    const data = await response.json();
    
    if (data.items) {
      holidaysDatabase = data.items.map((item: any) => ({
        title: item.title || '',
        hebrew: item.hebrew || '',
        date: item.date || '',
        category: item.category || '',
        subcat: item.subcat || '',
        candles: item.candles ? formatTime(item.candles) : undefined,
        havdalah: item.havdalah ? formatTime(item.havdalah) : undefined,
        hdate: item.hdate || ''
      }));
    }
    
    return holidaysDatabase;
  } catch (error) {
    console.error('Error fetching holidays data:', error);
    
    // Add fallback data for today
    const fallbackHoliday = {
      title: "Regular Day",
      hebrew: "יום רגיל",
      date: format(new Date(), 'yyyy-MM-dd'),
      category: "regular",
      hdate: "23 Adar 5785"
    };
    
    holidaysDatabase = [fallbackHoliday];
    return holidaysDatabase;
  }
};

// Get today's holiday if any
export const getTodayHoliday = (): HolidayData | null => {
  const today = format(new Date(), 'yyyy-MM-dd');
  
  // Find an exact match for today
  const exactMatch = holidaysDatabase.find(item => item.date.startsWith(today));
  
  if (exactMatch) {
    return exactMatch;
  }
  
  // If no holiday found, return a default object with the current Hebrew date
  return {
    title: "Regular Day",
    hebrew: "כ״ג אדר תשפ״ה",
    date: today,
    category: "regular",
    hdate: "23 Adar 5785"
  };
};

// Check if it's Rosh Chodesh today
export const isRoshChodeshToday = (): boolean => {
  const today = format(new Date(), 'yyyy-MM-dd');
  return holidaysDatabase.some(item => 
    item.date.startsWith(today) && 
    item.category === 'roshchodesh'
  );
};

// Get holidays database
export const getHolidaysDatabase = (): HolidayData[] => {
  return holidaysDatabase;
};
