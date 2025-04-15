
import { useState, useEffect } from 'react';
import { 
  getThisWeekShabbat,
  calculateShabbatMinchaTime,
  calculateShabbatKabalatTime,
  getFridaySunsetTime
} from '@/lib/database';
import { format } from 'date-fns';

export interface ShabbatData {
  shabbatData: {
    title: string;
    subtitle: string;
    candlesPT: string;
    candlesTA: string;
    havdala: string;
    prayers: { name: string; time: string }[];
    classes: { name: string; time: string }[];
  };
}

export function useShabbatData(specificDate?: Date): ShabbatData {
  const [shabbatData, setShabbatData] = useState({
    title: 'שבת',
    subtitle: 'טוען פרשת השבוע...',
    candlesPT: '--:--',
    candlesTA: '--:--',
    havdala: '--:--',
    prayers: [] as { name: string; time: string }[],
    classes: [] as { name: string; time: string }[]
  });

  const refreshShabbatData = async () => {
    try {
      // Check if we're in daylight saving time (March-October)
      const now = new Date();
      const month = now.getMonth(); // 0-11 (Jan-Dec)
      const isDaylightSaving = month >= 2 && month <= 9; // March through October
      const minchaGedolaTime = isDaylightSaving ? '13:20' : '12:30';
      
      // Get Friday's sunset time for Kabalat Shabbat calculation
      const fridaySunset = await getFridaySunsetTime(specificDate);
      console.log('Friday sunset time:', fridaySunset);
      
      // Get Shabbat data for this week or the specific date
      const shabbat = await getThisWeekShabbat(specificDate);
      console.log('Shabbat data:', shabbat);
      
      // Calculate Kabalat Shabbat time using Friday sunset
      const kabalatTime = calculateShabbatKabalatTime(fridaySunset);
      console.log('Calculated Kabalat time:', kabalatTime, 'using Friday sunset:', fridaySunset);
      
      if (!shabbat) {
        console.log('No Shabbat data available, using default values');
        
        // Set default Shabbat data if no data is available
        const defaultPrayers = [
          { name: 'קבלת שבת מוקדמת', time: '17:30' },
          { name: 'מנחה וקבלת שבת', time: kabalatTime },  // Dynamic calculation
          { name: 'שחרית א׳', time: '06:45' },
          { name: 'שחרית ב׳', time: '08:30' },
          { name: 'מנחה גדולה', time: minchaGedolaTime }, // Use daylight saving aware time
          { name: 'מנחה', time: '18:35' }, // One hour before havdalah, rounded down to nearest 5 minutes
          { name: 'ערבית מוצ״ש', time: '19:35' } // Same as havdalah time
        ];
        
        // For demo week in April 2025
        const currentWeek = format(now, 'yyyy-MM-dd');
        const parashah = getParashaForDate(currentWeek);
        
        setShabbatData({
          title: 'שבת',
          subtitle: parashah || 'פרשת השבוע',
          candlesPT: '18:17',
          candlesTA: '18:39',
          havdala: '19:35',
          prayers: defaultPrayers,
          classes: []
        });
        return;
      }
      
      // Calculate Mincha time: one hour before havdalah, rounded down to nearest 5 minutes
      const havdalahTime = shabbat.havdalah || '19:35';
      const minchaTime = calculateShabbatMinchaTime(havdalahTime);
      
      // Set Shabbat subtitle with parashat and holiday information
      let subtitle = shabbat.parashat_hebrew || 'פרשת השבוע';
      if (shabbat.holiday_hebrew) {
        subtitle += ` | ${shabbat.holiday_hebrew}`;
      }
      
      // Set Shabbat prayers with dynamic kabalat time
      const shabbatPrayers = [
        { name: 'קבלת שבת מוקדמת', time: '17:30' },
        { name: 'מנחה וקבלת שבת', time: kabalatTime },
        { name: 'שחרית א׳', time: '06:45' },
        { name: 'שחרית ב׳', time: '08:30' },
        { name: 'מנחה גדולה', time: minchaGedolaTime }, // Use daylight saving aware time
        { name: 'מנחה', time: minchaTime },
        { name: 'ערבית מוצ״ש', time: havdalahTime } // Arvit at Havdalah time
      ];
      
      // Set Shabbat classes (empty for now)
      const shabbatClasses = [];
      
      setShabbatData({
        title: 'שבת',
        subtitle: subtitle,
        candlesPT: shabbat.candles_pt || '18:17',
        candlesTA: shabbat.candles_ta || '18:39',
        havdala: shabbat.havdalah || '19:35',
        prayers: shabbatPrayers,
        classes: shabbatClasses
      });
    } catch (error) {
      console.error('Error refreshing Shabbat data:', error);
      
      // Check if we're in daylight saving time for fallback values
      const now = new Date();
      const month = now.getMonth();
      const isDaylightSaving = month >= 2 && month <= 9;
      const minchaGedolaTime = isDaylightSaving ? '13:20' : '12:30';
      
      // Set default values in case of error
      const fridaySunset = "18:57";
      const kabalatTime = "18:45";
      console.log('Using fallback sunset time:', fridaySunset, 'calculated Kabalat time:', kabalatTime);
      
      const defaultPrayers = [
        { name: 'קבלת שבת מוקדמת', time: '17:30' },
        { name: 'מנחה וקבלת שבת', time: kabalatTime },
        { name: 'שחרית א׳', time: '06:45' },
        { name: 'שחרית ב׳', time: '08:30' },
        { name: 'מנחה גדולה', time: minchaGedolaTime },
        { name: 'מנחה', time: '18:35' },
        { name: 'ערבית מוצ״ש', time: '19:35' }
      ];
      
      // For demo week in April 2025
      const currentWeek = format(now, 'yyyy-MM-dd');
      const parashah = getParashaForDate(currentWeek);
      
      setShabbatData({
        title: 'שבת',
        subtitle: parashah,
        candlesPT: '18:17',
        candlesTA: '18:39',
        havdala: '19:35',
        prayers: defaultPrayers,
        classes: []
      });
    }
  };

  // Helper function to get parasha for a specific date (demo data for April 2025)
  const getParashaForDate = (dateStr: string): string => {
    // For April 2025 we'll use these parshiyot
    const parshiyotApril2025: Record<string, string> = {
      "2025-04-05": "פרשת צו | שבת הגדול",
      "2025-04-12": "פרשת שמיני",
      "2025-04-19": "פרשת תזריע-מצורע",
      "2025-04-26": "פרשת אחרי מות-קדושים"
    };
    
    // Find the closest Saturday (Shabbat)
    const date = new Date(dateStr);
    const dayOfWeek = date.getDay(); // 0 is Sunday, 6 is Saturday
    const daysUntilSaturday = dayOfWeek <= 6 ? 6 - dayOfWeek : 0;
    
    const saturday = new Date(date);
    saturday.setDate(date.getDate() + daysUntilSaturday);
    
    const saturdayString = format(saturday, 'yyyy-MM-dd');
    
    // Return the parasha for this Saturday or a default
    return parshiyotApril2025[saturdayString] || "פרשת השבוע";
  };

  useEffect(() => {
    refreshShabbatData();
    
    // Set up event listener for Shabbat updates
    const handleShabbatUpdate = () => {
      console.log('Shabbat update detected, refreshing data...');
      refreshShabbatData();
    };
    
    window.addEventListener('shabbat-updated', handleShabbatUpdate);
    
    // Refresh data every hour
    const refreshInterval = setInterval(() => {
      refreshShabbatData();
    }, 60 * 60 * 1000);
    
    return () => {
      clearInterval(refreshInterval);
      window.removeEventListener('shabbat-updated', handleShabbatUpdate);
    };
  }, [specificDate]);

  return { shabbatData };
}
