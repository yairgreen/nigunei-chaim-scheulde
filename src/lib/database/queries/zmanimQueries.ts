
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { getZmanimDatabase, setZmanimDatabase, updateZmanimEntry } from '../state/zmanimState';
import { getDemoZmanimmData } from '../utils/zmanimDemo';
import type { ZmanimData } from '../types/zmanimTypes';

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
      const mappedData = data.map(item => mapSupabaseToZmanim(item));
      setZmanimDatabase(mappedData);
      return mappedData;
    }
    
    console.log('No zmanim data found in Supabase');
    return [];
  } catch (error) {
    console.error('Error fetching zmanim data:', error);
    return [];
  }
};

export const getTodayZmanim = async (): Promise<ZmanimData | null> => {
  const today = format(new Date(), 'yyyy-MM-dd');
  return await getZmanimForDate(today);
};

export const getZmanimForSpecificDate = async (date: Date): Promise<ZmanimData | null> => {
  const formattedDate = format(date, 'yyyy-MM-dd');
  return await getZmanimForDate(formattedDate);
};

export const getZmanimForDate = async (date: string): Promise<ZmanimData | null> => {
  try {
    console.log(`Fetching zmanim for date (${date}) from Supabase`);
    const { data, error } = await supabase
      .from('daily_zmanim')
      .select('*')
      .eq('gregorian_date', date)
      .single();
    
    if (error) {
      console.log('No data found for date, using demo data');
      return getDemoZmanimmData(date);
    }
    
    console.log(`Found zmanim for date ${date} in Supabase`);
    const mappedData = mapSupabaseToZmanim(data);
    updateZmanimEntry(mappedData);
    return mappedData;
  } catch (error) {
    console.error(`Error fetching zmanim for date (${date}):`, error);
    return getDemoZmanimmData(date);
  }
};

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
    mappedData.forEach(updateZmanimEntry);
    
    return mappedData;
  } catch (error) {
    console.error(`Error fetching weekly zmanim (${startDate} - ${endDate}):`, error);
    return [getDemoZmanimmData(startDate)];
  }
};

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

