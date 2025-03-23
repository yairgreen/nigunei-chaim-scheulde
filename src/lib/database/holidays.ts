
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
}

// In-memory storage
let holidaysDatabase: HolidayData[] = [];

// Fetch holidays data from the API
export const fetchHolidays = async (): Promise<HolidayData[]> => {
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
    
    return holidaysDatabase;
  } catch (error) {
    console.error('Error fetching holidays data:', error);
    throw error;
  }
};

// Get today's holiday if any
export const getTodayHoliday = (): HolidayData | null => {
  const today = format(new Date(), 'yyyy-MM-dd');
  return holidaysDatabase.find(item => item.date.startsWith(today)) || null;
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
