
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
    
    return zmanimDatabase;
  } catch (error) {
    console.error('Error fetching zmanim data:', error);
    throw error;
  }
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
