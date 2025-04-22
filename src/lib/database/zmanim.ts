
import { format } from 'date-fns';
import { formatTime } from './core';
import { supabase } from '@/integrations/supabase/client';

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

// Fetch zmanim data from Supabase
export const fetchZmanim = async (): Promise<ZmanimData[]> => {
  try {
    console.log('Fetching zmanim data from Supabase');
    const { data, error } = await supabase
      .from('daily_zmanim')
      .select('*')
      .order('gregorian_date');

    if (error) throw error;

    if (data && data.length > 0) {
      console.log(`Retrieved ${data.length} zmanim records from Supabase`);
      zmanimDatabase = data.map(item => mapSupabaseToZmanim(item));
      return zmanimDatabase;
    }
    
    console.log('No zmanim data found in Supabase');
    return [];
  } catch (error) {
    console.error('Error fetching zmanim data:', error);
    throw error;
  }
};

// Map Supabase data to ZmanimData format
const mapSupabaseToZmanim = (item: any): ZmanimData => {
  return {
    date: item.gregorian_date ? format(new Date(item.gregorian_date), 'yyyy-MM-dd') : '',
    alotHaShachar: formatTimeFromSupabase(item.alot_hashachar),
    sunrise: formatTimeFromSupabase(item.sunrise),
    misheyakir: formatTimeFromSupabase(item.misheyakir),
    sofZmanShmaMGA: formatTimeFromSupabase(item.sof_zman_shma_mga),
    sofZmanShma: formatTimeFromSupabase(item.sof_zman_shma_gra),
    sofZmanTfillaMGA: formatTimeFromSupabase(item.sof_zman_tfilla_mga),
    sofZmanTfilla: formatTimeFromSupabase(item.sof_zman_tfilla_gra),
    chatzot: formatTimeFromSupabase(item.chatzot),
    minchaGedola: formatTimeFromSupabase(item.mincha_gedola),
    plagHaMincha: formatTimeFromSupabase(item.plag_hamincha),
    sunset: formatTimeFromSupabase(item.sunset),
    beinHaShmashos: formatTimeFromSupabase(item.tzait_hakochavim)
  };
};

// Format time from Supabase to HH:mm format
const formatTimeFromSupabase = (timeStr: string | null): string => {
  if (!timeStr) return '';
  
  try {
    // Check if already in HH:MM format
    if (timeStr.match(/^\d{2}:\d{2}$/)) return timeStr;
    
    // Check if in HH:MM:SS format
    const match = timeStr.match(/^(\d{2}):(\d{2}):\d{2}$/);
    if (match) {
      return `${match[1]}:${match[2]}`;
    }
    
    // Try to parse as date
    const date = new Date(timeStr);
    if (!isNaN(date.getTime())) {
      return date.toLocaleTimeString('he-IL', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    }
    
    return timeStr;
  } catch (error) {
    console.error('Error formatting time from Supabase:', error);
    return timeStr;
  }
};

// Get today's zmanim
export const getTodayZmanim = async (): Promise<ZmanimData | null> => {
  const today = format(new Date(), 'yyyy-MM-dd');
  
  try {
    console.log(`Fetching zmanim for today (${today}) from Supabase`);
    const { data, error } = await supabase
      .from('daily_zmanim')
      .select('*')
      .eq('gregorian_date', today)
      .single();
    
    if (error) {
      console.log('No data found for today, checking in-memory database');
      // Try to get from in-memory database
      const existingData = zmanimDatabase.find(item => item.date === today);
      if (existingData) {
        console.log('Found today\'s data in in-memory database');
        return existingData;
      }
      
      console.log('Using demo data for today');
      // Provide demo data as fallback
      return getDemoZmanimmData(today);
    }
    
    console.log('Found today\'s zmanim in Supabase');
    const mappedData = mapSupabaseToZmanim(data);
    
    // Update in-memory database
    const existingIdx = zmanimDatabase.findIndex(item => item.date === today);
    if (existingIdx >= 0) {
      zmanimDatabase[existingIdx] = mappedData;
    } else {
      zmanimDatabase.push(mappedData);
    }
    
    return mappedData;
  } catch (error) {
    console.error(`Error fetching zmanim for today (${today}):`, error);
    return getDemoZmanimmData(today);
  }
};

// Get zmanim for a specific date
export const getZmanimForSpecificDate = async (date: Date): Promise<ZmanimData | null> => {
  const formattedDate = format(date, 'yyyy-MM-dd');
  
  try {
    console.log(`Fetching zmanim for specific date (${formattedDate}) from Supabase`);
    const { data, error } = await supabase
      .from('daily_zmanim')
      .select('*')
      .eq('gregorian_date', formattedDate)
      .single();
    
    if (error) {
      console.log('No data found for specific date, checking in-memory database');
      // Try to get from in-memory database
      const existingData = zmanimDatabase.find(item => item.date === formattedDate);
      if (existingData) {
        console.log('Found specific date data in in-memory database');
        return existingData;
      }
      
      console.log('Using demo data for specific date');
      // Provide demo data as fallback
      return getDemoZmanimmData(formattedDate);
    }
    
    console.log('Found specific date zmanim in Supabase');
    const mappedData = mapSupabaseToZmanim(data);
    
    // Update in-memory database
    const existingIdx = zmanimDatabase.findIndex(item => item.date === formattedDate);
    if (existingIdx >= 0) {
      zmanimDatabase[existingIdx] = mappedData;
    } else {
      zmanimDatabase.push(mappedData);
    }
    
    return mappedData;
  } catch (error) {
    console.error(`Error fetching zmanim for specific date (${formattedDate}):`, error);
    return getDemoZmanimmData(formattedDate);
  }
};

// Get zmanim for a week
export const getZmanimForWeek = async (startDate: string, endDate: string): Promise<ZmanimData[]> => {
  try {
    console.log(`Fetching zmanim for week (${startDate} - ${endDate}) from Supabase`);
    const { data, error } = await supabase
      .from('daily_zmanim')
      .select('*')
      .gte('gregorian_date', startDate)
      .lte('gregorian_date', endDate)
      .order('gregorian_date');
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      console.log('No weekly zmanim found, using demo data');
      return [getDemoZmanimmData(startDate)];
    }
    
    const mappedData = data.map(item => mapSupabaseToZmanim(item));
    console.log(`Retrieved ${mappedData.length} zmanim records for the week`);
    
    // Update in-memory database
    mappedData.forEach(item => {
      const existingIdx = zmanimDatabase.findIndex(z => z.date === item.date);
      if (existingIdx >= 0) {
        zmanimDatabase[existingIdx] = item;
      } else {
        zmanimDatabase.push(item);
      }
    });
    
    return mappedData;
  } catch (error) {
    console.error(`Error fetching weekly zmanim (${startDate} - ${endDate}):`, error);
    return [getDemoZmanimmData(startDate)];
  }
};

// Generate demo zmanim data
const getDemoZmanimmData = (date: string): ZmanimData => {
  console.log(`Generating demo data for ${date}`);
  return {
    date: date,
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
