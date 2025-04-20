
import type { ZmanimData } from '../types/zmanim';
import { getZmanimFromMemory, setZmanimDatabase } from '../handlers/zmanimHandler';
import { getZmanimDatabase as fetchZmanimDatabase } from '@/lib/supabase/zmanim';
import { format, addDays } from 'date-fns';

// Get all zmanim from the database
export const getZmanimDatabase = (): ZmanimData[] => {
  return getZmanimFromMemory();
};

// Get zmanim for a specific date
export const getZmanimForDate = (date: Date): ZmanimData | undefined => {
  const formattedDate = format(date, 'yyyy-MM-dd');
  const zmanimDatabase = getZmanimFromMemory();
  
  return zmanimDatabase.find(z => z.date === formattedDate);
};

// Get zmanim for a week
export const getZmanimForWeek = (startDate: Date, daysCount = 7): ZmanimData[] => {
  const zmanimDatabase = getZmanimFromMemory();
  const dates = [];
  
  for (let i = 0; i < daysCount; i++) {
    const currentDate = addDays(startDate, i);
    dates.push(format(currentDate, 'yyyy-MM-dd'));
  }
  
  return zmanimDatabase.filter(item => dates.includes(item.date));
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
