
import { useState, useEffect } from 'react';
import { 
  getThisWeekShabbat,
  calculateShabbatMinchaTime,
  calculateShabbatKabalatTime,
  getFridaySunsetTime,
  getTodayZmanim
} from '@/lib/database';

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

export function useShabbatData(): ShabbatData {
  const [shabbatData, setShabbatData] = useState({
    title: 'שבת',
    subtitle: '',
    candlesPT: '19:15',
    candlesTA: '19:10',
    havdala: '20:15',
    prayers: [] as { name: string; time: string }[],
    classes: [] as { name: string; time: string }[]
  });

  const refreshShabbatData = async () => {
    try {
      // Get Friday's sunset time for Kabalat Shabbat calculation
      const fridaySunset = await getFridaySunsetTime();
      console.log('Friday sunset time:', fridaySunset);
      
      // Get Shabbat data
      const shabbat = getThisWeekShabbat();
      console.log('Shabbat data:', shabbat);
      
      if (!shabbat) {
        console.log('No Shabbat data available, using default values');
        
        // Calculate Kabalat Shabbat time using Friday sunset
        const defaultKabalatTime = calculateShabbatKabalatTime(fridaySunset);
        
        // Set default Shabbat data if no data is available
        const defaultPrayers = [
          { name: 'קבלת שבת מוקדמת', time: '17:30' },
          { name: 'מנחה וקבלת שבת', time: defaultKabalatTime },  // Dynamic calculation
          { name: 'שחרית א׳', time: '06:45' },
          { name: 'שחרית ב׳', time: '08:30' },
          { name: 'מנחה גדולה', time: '12:30' },
          { name: 'מנחה', time: '18:35' }, // One hour before havdalah, rounded down to nearest 5 minutes
          { name: 'ערבית מוצ״ש', time: '19:35' } // Same as havdalah time
        ];
        
        setShabbatData({
          title: 'שבת',
          subtitle: 'פרשת פקודי | שבת החודש',
          candlesPT: '18:17',
          candlesTA: '18:39',
          havdala: '19:35',
          prayers: defaultPrayers,
          classes: []
        });
        return;
      }
      
      // Calculate Kabalat Shabbat time using Friday sunset
      const kabalatTime = calculateShabbatKabalatTime(fridaySunset);
      console.log('Calculated Kabalat time:', kabalatTime, 'using Friday sunset:', fridaySunset);
      
      // Calculate Mincha time: one hour before havdalah, rounded down to nearest 5 minutes
      const havdalahTime = shabbat.havdalah || '19:35';
      const minchaTime = calculateShabbatMinchaTime(havdalahTime);
      
      // Set Shabbat subtitle
      let subtitle = shabbat.parashatHebrew || 'פרשת השבוע';
      if (shabbat.holidayHebrew) {
        subtitle += ` | ${shabbat.holidayHebrew}`;
      }
      
      // Set Shabbat prayers with dynamic kabalat time
      const shabbatPrayers = [
        { name: 'קבלת שבת מוקדמת', time: '17:30' },
        { name: 'מנחה וקבלת שבת', time: kabalatTime },
        { name: 'שחרית א׳', time: '06:45' },
        { name: 'שחרית ב׳', time: '08:30' },
        { name: 'מנחה גדולה', time: '12:30' },
        { name: 'מנחה', time: minchaTime },
        { name: 'ערבית מוצ״ש', time: havdalahTime } // Arvit at Havdalah time
      ];
      
      // Set Shabbat classes (empty for now)
      const shabbatClasses = [];
      
      setShabbatData({
        title: 'שבת',
        subtitle: subtitle,
        candlesPT: shabbat.candlesPT || '18:17',
        candlesTA: shabbat.candlesTA || '18:39',
        havdala: shabbat.havdalah || '19:35',
        prayers: shabbatPrayers,
        classes: shabbatClasses
      });
    } catch (error) {
      console.error('Error refreshing Shabbat data:', error);
      
      // Set default values in case of error
      // For this specific week, use 18:57 as the sunset time
      const fridaySunset = "18:57";
      const defaultKabalatTime = calculateShabbatKabalatTime(fridaySunset);
      
      const defaultPrayers = [
        { name: 'קבלת שבת מוקדמת', time: '17:30' },
        { name: 'מנחה וקבלת שבת', time: defaultKabalatTime },  // Should be 18:45 for this week
        { name: 'שחרית א׳', time: '06:45' },
        { name: 'שחרית ב׳', time: '08:30' },
        { name: 'מנחה גדולה', time: '12:30' },
        { name: 'מנחה', time: '18:35' },
        { name: 'ערבית מוצ״ש', time: '19:35' }
      ];
      
      setShabbatData({
        title: 'שבת',
        subtitle: 'פרשת פקודי | שבת החודש',
        candlesPT: '18:17',
        candlesTA: '18:39',
        havdala: '19:35',
        prayers: defaultPrayers,
        classes: []
      });
    }
  };

  useEffect(() => {
    refreshShabbatData();
    
    // Refresh data every hour
    const refreshInterval = setInterval(() => {
      refreshShabbatData();
    }, 60 * 60 * 1000);
    
    return () => clearInterval(refreshInterval);
  }, []);

  return { shabbatData };
}
