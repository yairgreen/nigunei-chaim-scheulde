
import { format } from 'date-fns';
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
            const holiday = holidaysDb.find(h => 
              h.date.split('T')[0] === item.date.split('T')[0] && 
              h.category === 'holiday' && 
              h.subcat === 'shabbat'
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

// Calculate Shabbat mincha time
export const calculateShabbatMinchaTime = (havdalah: string): string => {
  if (!havdalah) return "17:00"; // Fallback
  
  const [hours, minutes] = havdalah.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes;
  
  // One hour before havdalah, rounded to nearest 5 minutes (down)
  const minchaMinutes = totalMinutes - 60;
  const roundedMinutes = Math.floor(minchaMinutes / 5) * 5;
  
  // Convert back to HH:MM format
  const minchaHours = Math.floor(roundedMinutes / 60);
  const minchaMinutesPart = roundedMinutes % 60;
  
  return `${String(minchaHours).padStart(2, '0')}:${String(minchaMinutesPart).padStart(2, '0')}`;
};

// Calculate Shabbat kabalat time
export const calculateShabbatKabalatTime = (sunset: string): string => {
  if (!sunset) return "18:00"; // Fallback
  
  const [hours, minutes] = sunset.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes;
  
  // 11-15 minutes before sunset, rounded to nearest 5 minutes (up)
  const kabalatMinutes = totalMinutes - 15;
  const roundedMinutes = Math.ceil(kabalatMinutes / 5) * 5;
  
  // Convert back to HH:MM format
  const kabalatHours = Math.floor(roundedMinutes / 60);
  const kabalatMinutesPart = roundedMinutes % 60;
  
  return `${String(kabalatHours).padStart(2, '0')}:${String(kabalatMinutesPart).padStart(2, '0')}`;
};
