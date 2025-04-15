
import { createClient } from '@supabase/supabase-js';
import type { ZmanimData } from '@/lib/database/zmanim';

// First, try to use environment variables, otherwise use default mock values for development
// These mock values won't actually connect to a real Supabase instance but will prevent runtime errors
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mock-supabase-url.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'mock-supabase-key-for-development';

const supabase = createClient(supabaseUrl, supabaseKey);

// Create a flag to determine if we're using mock data
const isUsingMockData = !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY;

// If using mock data, log a warning
if (isUsingMockData) {
  console.warn('Using mock Supabase configuration. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
}

export const getZmanimForDate = async (date: string): Promise<ZmanimData | null> => {
  try {
    if (isUsingMockData) {
      // Return mock data for development
      return getMockZmanim(date);
    }

    const { data, error } = await supabase
      .from('daily_zmanim')
      .select('*')
      .eq('date', date)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching zmanim:', error);
    return getMockZmanim(date);
  }
};

export const getZmanimForWeek = async (startDate: string, endDate: string): Promise<ZmanimData[]> => {
  try {
    if (isUsingMockData) {
      // Return mock data for development
      return [getMockZmanim(startDate), getMockZmanim(endDate)];
    }

    const { data, error } = await supabase
      .from('daily_zmanim')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching weekly zmanim:', error);
    return [getMockZmanim(startDate), getMockZmanim(endDate)];
  }
};

export const getShabbatTimes = async (date: string) => {
  try {
    if (isUsingMockData) {
      // Return mock data for development
      return getMockShabbatTimes(date);
    }

    const { data, error } = await supabase
      .from('shabbat_times')
      .select('*')
      .eq('date', date)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching Shabbat times:', error);
    return getMockShabbatTimes(date);
  }
};

export const getHolidays = async (startDate: string, endDate: string) => {
  try {
    if (isUsingMockData) {
      // Return mock data for development
      return [getMockHoliday(startDate)];
    }

    const { data, error } = await supabase
      .from('holidays')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching holidays:', error);
    return [getMockHoliday(startDate)];
  }
};

// Helper functions for database operations
export const getZmanimDatabase = async () => {
  try {
    if (isUsingMockData) {
      // Return mock data for development
      const today = new Date().toISOString().split('T')[0];
      return [getMockZmanim(today)];
    }

    const { data, error } = await supabase.from('daily_zmanim').select('*').order('date');
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting zmanim database:', error);
    const today = new Date().toISOString().split('T')[0];
    return [getMockZmanim(today)];
  }
};

export const getHolidaysDatabase = async () => {
  try {
    if (isUsingMockData) {
      // Return mock data for development
      const today = new Date().toISOString().split('T')[0];
      return [getMockHoliday(today)];
    }

    const { data, error } = await supabase.from('holidays').select('*').order('date');
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting holidays database:', error);
    const today = new Date().toISOString().split('T')[0];
    return [getMockHoliday(today)];
  }
};

// Mock data functions for development when Supabase is not configured
const getMockZmanim = (date: string): ZmanimData => {
  return {
    date,
    alotHaShachar: '04:28',
    sunrise: '05:40',
    misheyakir: '04:50',
    sofZmanShmaMGA: '08:08',
    sofZmanShma: '08:44',
    sofZmanTfillaMGA: '09:21',
    sofZmanTfilla: '09:45',
    chatzot: '11:47',
    minchaGedola: '12:18',
    plagHaMincha: '16:38',
    sunset: '17:54',
    beinHaShmashos: '18:11'
  };
};

const getMockShabbatTimes = (date: string) => {
  return {
    date,
    parashat_hebrew: 'פרשת פקודי',
    holiday_hebrew: 'שבת החודש',
    candles_pt: '18:17',
    candles_ta: '18:39',
    havdalah: '19:35'
  };
};

const getMockHoliday = (date: string) => {
  return {
    date,
    title: 'Shabbat HaChodesh',
    hebrew: 'שבת החודש',
    category: 'shabbat'
  };
};
