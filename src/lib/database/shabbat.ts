
import { format, addDays } from 'date-fns';
import { formatTime } from './core';
import { getHolidaysDatabase } from './holidays';

export interface ShabbatData {
  title: string;
  parashat: string;
  parashatHebrew: string;
  holiday?: string;
  holidayHebrew?: string;
  candlesPT: string;
  candlesTA: string;
  havdalah: string;
}

// In-memory storage
let shabbatDatabase: ShabbatData[] = [];

// Fetch Shabbat data from the API
export const fetchShabbat = async (): Promise<ShabbatData[]> => {
  try {
    // Fetch Petach Tikva Shabbat times
    const responsePT = await fetch('https://www.hebcal.com/shabbat?cfg=json&geonameid=293918&b=40&M=on');
    const dataPT = await responsePT.json();
    
    // Fetch Tel Aviv Shabbat times
    const responseTA = await fetch('https://www.hebcal.com/shabbat?cfg=json&geonameid=293397&b=18&M=on');
    const dataTA = await responseTA.json();
    
    if (dataPT.items && dataTA.items) {
      // Process Shabbat data
      const holidaysDb = getHolidaysDatabase();
      
      const processedData = dataPT.items
        .filter((item: any) => item.category === 'parashat' || 
                              (item.category === 'candles' || 
                               item.category === 'havdalah'))
        .reduce((acc: any, item: any, idx: number, arr: any[]) => {
          if (item.category === 'parashat') {
            acc.parashat = item.title;
            acc.parashatHebrew = item.hebrew;
            
            // Check if this Shabbat has a holiday
            const holiday = holidaysDb.find((h: any) => 
              h.subcat === 'shabbat' && 
              h.category === 'holiday'
            );
            
            if (holiday) {
              acc.holiday = holiday.title;
              acc.holidayHebrew = holiday.hebrew;
            }
          } else if (item.category === 'candles') {
            acc.candlesPT = formatTime(item.date);
            
            // Find matching Tel Aviv candle lighting
            const taCandleItem = dataTA.items.find((taItem: any) => 
              taItem.category === 'candles' && 
              format(new Date(taItem.date), 'yyyy-MM-dd') === format(new Date(item.date), 'yyyy-MM-dd')
            );
            
            if (taCandleItem) {
              acc.candlesTA = formatTime(taCandleItem.date);
            }
          } else if (item.category === 'havdalah') {
            acc.havdalah = formatTime(item.date);
          }
          
          return acc;
        }, { title: 'שבת' } as ShabbatData);
      
      shabbatDatabase = [processedData];
    }
    
    return shabbatDatabase;
  } catch (error) {
    console.error('Error fetching Shabbat data:', error);
    throw error;
  }
};

// Get this week's Shabbat
export const getThisWeekShabbat = (): ShabbatData | null => {
  return shabbatDatabase[0] || null;
};

// Calculate Shabbat mincha time - one hour before havdalah, rounded down to 5 min
export const calculateShabbatMinchaTime = (havdalah: string): string => {
  if (!havdalah) return "18:45"; // Fallback
  
  const [hours, minutes] = havdalah.split(':').map(Number);
  const havdalahTotalMinutes = hours * 60 + minutes;
  
  // Subtract 60 minutes for mincha time
  const minchaTotalMinutes = havdalahTotalMinutes - 60;
  
  // Round down to nearest 5 minutes
  const roundedMinutes = Math.floor(minchaTotalMinutes / 5) * 5;
  
  // Convert back to HH:MM format
  const minchaHours = Math.floor(roundedMinutes / 60);
  const minchaMinutes = roundedMinutes % 60;
  
  return `${String(minchaHours).padStart(2, '0')}:${String(minchaMinutes).padStart(2, '0')}`;
};

// Calculate Shabbat kabalat time
// Calculate between 11-16 minutes before sunset, rounded to nearest 5 minutes
export const calculateShabbatKabalatTime = (sunset: string): string => {
  if (!sunset) return "18:45"; // Fallback default
  
  // Parse sunset time
  const [hours, minutes] = sunset.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes;
  
  // Use 16 minutes before sunset for the initial calculation
  const maxBuffer = 16; // Maximum minutes before sunset
  const minBuffer = 11; // Minimum minutes before sunset
  
  // Apply maximum buffer to sunset time (16 minutes before)
  const kabalatMinutes = totalMinutes - maxBuffer;
  
  // Round to nearest 5 minutes
  const roundedMinutes = Math.round(kabalatMinutes / 5) * 5;
  
  // Ensure we're at least minBuffer minutes before sunset
  // but not more than maxBuffer minutes before sunset
  const finalMinutes = Math.max(totalMinutes - maxBuffer, Math.min(totalMinutes - minBuffer, roundedMinutes));
  
  // Convert back to HH:MM format
  const kabalatHours = Math.floor(finalMinutes / 60);
  const kabalatMinutesPart = finalMinutes % 60;
  
  console.log(`Calculated Kabalat time from sunset ${sunset}:`, 
    `Initial minutes: ${kabalatMinutes}`, 
    `Rounded: ${roundedMinutes}`, 
    `Final: ${finalMinutes}`,
    `Result: ${String(kabalatHours).padStart(2, '0')}:${String(kabalatMinutesPart).padStart(2, '0')}`);
  
  return `${String(kabalatHours).padStart(2, '0')}:${String(kabalatMinutesPart).padStart(2, '0')}`;
};

// Get Friday sunset time for Shabbat calculations
export const getFridaySunsetTime = async (): Promise<string> => {
  try {
    // Determine the next Friday's date
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 is Sunday, 5 is Friday
    const daysUntilFriday = (dayOfWeek <= 5) ? 5 - dayOfWeek : 5 + 7 - dayOfWeek;
    const nextFriday = addDays(today, daysUntilFriday);
    
    // Format date for API call
    const formattedDate = format(nextFriday, 'yyyy-MM-dd');
    
    // Fetch Friday's zmanim data
    const response = await fetch(`https://www.hebcal.com/zmanim?cfg=json&geonameid=293918&date=${formattedDate}`);
    const data = await response.json();
    
    // Extract sunset time
    if (data && data.times && data.times.sunset) {
      // Format time from ISO format to HH:MM
      const sunsetTime = formatTime(data.times.sunset);
      console.log(`Next Friday (${formattedDate}) sunset time: ${sunsetTime}`);
      return sunsetTime;
    }
    
    console.log(`No sunset data found for ${formattedDate}, using hardcoded fallback value`);
    return "18:57"; // Hardcoded fallback for this week
  } catch (error) {
    console.error('Error fetching Friday sunset time:', error);
    return "18:57"; // Hardcoded fallback for this week
  }
};

