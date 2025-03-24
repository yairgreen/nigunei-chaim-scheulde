import { useState, useEffect } from 'react';
import { 
  getThisWeekShabbat,
  calculateShabbatMinchaTime,
  calculateShabbatKabalatTime,
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
      // Get today's zmanim for sunset time
      const todayZmanim = getTodayZmanim();
      
      // Get Shabbat data
      const shabbat = getThisWeekShabbat();
      console.log('Shabbat data:', shabbat);
      
      if (!shabbat || !todayZmanim) {
        console.log('No Shabbat or zmanim data available, using default values');
        // Set default Shabbat data if no data is available
        const defaultPrayers = [
          { name: 'קבלת שבת מוקדמת', time: '17:30' },
          { name: 'מנחה וקבלת שבת', time: '17:38' },  // 16 minutes before sunset (17:54)
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
      
      // Calculate Kabalat Shabbat time: 16 minutes before sunset
      const kabalatTime = calculateShabbatKabalatTime(todayZmanim.sunset);
      
      // Calculate Mincha time: one hour before havdalah, rounded down to nearest 5 minutes
      const havdalahTime = shabbat.havdalah || '19:35';
      const minchaTime = calculateShabbatMinchaTime(havdalahTime);
      
      // Set Shabbat subtitle
      let subtitle = shabbat.parashatHebrew || 'פרשת השבוע';
      if (shabbat.holidayHebrew) {
        subtitle += ` | ${shabbat.holidayHebrew}`;
      }
      
      // Set Shabbat prayers with fixed kabalat time
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
      const defaultPrayers = [
        { name: 'קבלת שבת מוקדמת', time: '17:30' },
        { name: 'מנחה וקבלת שבת', time: '17:38' },  // 16 minutes before sunset (17:54)
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
