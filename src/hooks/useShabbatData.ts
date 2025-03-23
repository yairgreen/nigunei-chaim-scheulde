
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
      
      if (!shabbat || !todayZmanim) {
        // Set default Shabbat data if no data is available
        const defaultPrayers = [
          { name: 'קבלת שבת מוקדמת', time: '17:30' },
          { name: 'מנחה וקבלת שבת', time: '19:00' },
          { name: 'שחרית א׳', time: '06:45' },
          { name: 'שחרית ב׳', time: '08:30' },
          { name: 'מנחה גדולה', time: '12:30' },
          { name: 'מנחה', time: '19:15' },
          { name: 'ערבית מוצ״ש', time: '20:15' }
        ];
        
        setShabbatData({
          title: 'שבת',
          subtitle: 'שלח לך',
          candlesPT: '19:15',
          candlesTA: '19:10',
          havdala: '20:15',
          prayers: defaultPrayers,
          classes: []
        });
        return;
      }
      
      // Calculate Shabbat times
      const kabalatTime = calculateShabbatKabalatTime(todayZmanim.sunset);
      const shabbatMinchaTime = calculateShabbatMinchaTime(shabbat.havdalah);
      
      // Set Shabbat subtitle
      let subtitle = shabbat.parashatHebrew || 'פרשת השבוע';
      if (shabbat.holidayHebrew) {
        subtitle += ` | ${shabbat.holidayHebrew}`;
      }
      
      // Set Shabbat prayers
      const shabbatPrayers = [
        { name: 'קבלת שבת מוקדמת', time: '17:30' },
        { name: 'מנחה וקבלת שבת', time: kabalatTime },
        { name: 'שחרית א׳', time: '06:45' },
        { name: 'שחרית ב׳', time: '08:30' },
        { name: 'מנחה גדולה', time: '12:30' },
        { name: 'מנחה', time: shabbatMinchaTime },
        { name: 'ערבית מוצ״ש', time: shabbat.havdalah }
      ];
      
      // Set Shabbat classes (empty for now)
      const shabbatClasses = [];
      
      setShabbatData({
        title: 'שבת',
        subtitle: subtitle,
        candlesPT: shabbat.candlesPT || '19:15',
        candlesTA: shabbat.candlesTA || '19:10',
        havdala: shabbat.havdalah || '20:15',
        prayers: shabbatPrayers,
        classes: shabbatClasses
      });
    } catch (error) {
      console.error('Error refreshing Shabbat data:', error);
      
      // Set default values in case of error
      const defaultPrayers = [
        { name: 'קבלת שבת מוקדמת', time: '17:30' },
        { name: 'מנחה וקבלת שבת', time: '19:00' },
        { name: 'שחרית א׳', time: '06:45' },
        { name: 'שחרית ב׳', time: '08:30' },
        { name: 'מנחה גדולה', time: '12:30' },
        { name: 'מנחה', time: '19:15' },
        { name: 'ערבית מוצ״ש', time: '20:15' }
      ];
      
      setShabbatData({
        title: 'שבת',
        subtitle: 'שלח לך',
        candlesPT: '19:15',
        candlesTA: '19:10',
        havdala: '20:15',
        prayers: defaultPrayers,
        classes: []
      });
    }
  };

  useEffect(() => {
    refreshShabbatData();
  }, []);

  return { shabbatData };
}
