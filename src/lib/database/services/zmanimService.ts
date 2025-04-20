
import type { ZmanimData } from '../types/zmanim';
import { getZmanimFromMemory, setZmanimDatabase } from '../handlers/zmanimHandler';
import { getZmanimDatabase as fetchZmanimDatabase } from '@/lib/supabase/zmanim';
import { format, addDays } from 'date-fns';

// Get all zmanim from the database
export const getZmanimDatabase = (): ZmanimData[] => {
  return getZmanimFromMemory();
};

// Get zmanim for a specific date
export const getZmanimForDate = (date: string | Date): ZmanimData | undefined => {
  const formattedDate = typeof date === 'string' ? date : format(date, 'yyyy-MM-dd');
  const zmanimDatabase = getZmanimFromMemory();
  
  return zmanimDatabase.find(z => z.date === formattedDate);
};

// Get zmanim for a week
export const getZmanimForWeek = (startDate: Date | string, daysCount = 7): ZmanimData[] => {
  const zmanimDatabase = getZmanimFromMemory();
  const dates = [];
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  
  for (let i = 0; i < daysCount; i++) {
    const currentDate = addDays(start, i);
    dates.push(format(currentDate, 'yyyy-MM-dd'));
  }
  
  const filteredZmanim = zmanimDatabase.filter(item => dates.includes(item.date));
  
  // For debugging
  console.log('Dates to look for:', dates);
  console.log('Found zmanim count:', filteredZmanim.length);
  
  return filteredZmanim;
};

// Function to update the memory database with data from Supabase
export const refreshZmanimDatabase = async (): Promise<ZmanimData[]> => {
  try {
    const data = await fetchZmanimDatabase();
    setZmanimDatabase(data);
    return data;
  } catch (error) {
    console.error('Error refreshing zmanim database:', error);
    // Return current data if refresh fails
    return getZmanimFromMemory();
  }
};
