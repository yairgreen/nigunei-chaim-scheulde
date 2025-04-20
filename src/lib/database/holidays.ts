import { format } from 'date-fns';
import { formatTime } from './core';
import { supabase } from '@/integrations/supabase/client';

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

export const fetchHolidays = async (): Promise<HolidayData[]> => {
  try {
    const today = new Date();
    const formattedDate = format(today, 'yyyy-MM-dd');
    
    const { data: holidays, error } = await supabase
      .from('holidays')
      .select('*')
      .eq('date', formattedDate)
      .eq('category', 'holiday')
      .order('subcat', { ascending: true });  // 'major' comes before 'minor'
    
    if (error) throw error;
    
    if (holidays) {
      holidaysDatabase = holidays.map((item: any) => ({
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
    return [];
  }
};

// Get today's holiday if any
export const getTodayHoliday = async (): Promise<string> => {
  const holidays = await fetchHolidays();
  
  // If no holidays, return empty string
  if (!holidays.length) return '';
  
  // Sort holidays: major first, then minor, then others
  const sortedHolidays = holidays.sort((a, b) => {
    if (a.subcat === 'major') return -1;
    if (b.subcat === 'major') return 1;
    if (a.subcat === 'minor') return -1;
    if (b.subcat === 'minor') return 1;
    return 0;
  });
  
  // Combine holiday names with separator
  return sortedHolidays.map(holiday => holiday.hebrew).join(' | ');
};

// Get holidays database
export const getHolidaysDatabase = (): HolidayData[] => {
  return holidaysDatabase;
};

// Get today's holiday if any
export const isRoshChodeshToday = (): boolean => {
  const today = format(new Date(), 'yyyy-MM-dd');
  return holidaysDatabase.some(item => 
    item.date.startsWith(today) && 
    item.category === 'roshchodesh'
  );
};
