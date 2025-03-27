
import { useState, useEffect } from 'react';
import { 
  getThisWeekShabbat,
  calculateShabbatMinchaTime,
  calculateShabbatKabalatTime,
  getFridaySunsetTime,
  fetchShabbat
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

export function useShabbatData(selectedDate?: Date): ShabbatData {
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
      
      // If we're in simulation mode and have a selected date, we should
      // fetch Shabbat data for that week
      if (selectedDate) {
        // This will be implemented in the simulation components
        // For now, we'll just use the current Shabbat data
      }
      
      // Get Shabbat data or fetch it if not available
      let shabbat = getThisWeekShabbat();
      if (!shabbat) {
        console.log('No Shabbat data found, fetching from API');
        await fetchShabbat();
        shabbat = getThisWeekShabbat();
      }
      
      console.log('Shabbat data:', shabbat);
      
      // Calculate Kabalat Shabbat time using Friday sunset
      const kabalatTime = calculateShabbatKabalatTime(fridaySunset);
      console.log('Calculated Kabalat time:', kabalatTime, 'using Friday sunset:', fridaySunset);
      
      if (!shabbat) {
        console.log('No Shabbat data available after fetch, using default values');
        
        // Set default Shabbat data if no data is available
        const defaultPrayers = [
          { name: 'קבלת שבת מוקדמת', time: '17:30' },
          { name: 'מנחה וקבלת שבת', time: kabalatTime },  // Dynamic calculation
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
      const fridaySunset = "18:57";
      const kabalatTime = "18:45";
      console.log('Using fallback sunset time:', fridaySunset, 'calculated Kabalat time:', kabalatTime);
      
      const defaultPrayers = [
        { name: 'קבלת שבת מוקדמת', time: '17:30' },
        { name: 'מנחה וקבלת שבת', time: kabalatTime },
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
    
    // Weekly refresh on Sundays at 04:00
    const scheduleWeeklyRefresh = () => {
      const now = new Date();
      const dayOfWeek = now.getDay(); // 0 is Sunday
      const daysUntilSunday = dayOfWeek === 0 ? 
        (now.getHours() >= 4 ? 7 : 0) : // If it's already Sunday after 4am, schedule for next Sunday
        7 - dayOfWeek; // Days until next Sunday
      
      const nextSunday = new Date(now);
      nextSunday.setDate(now.getDate() + daysUntilSunday);
      nextSunday.setHours(4, 0, 0, 0); // 4am
      
      const msUntilRefresh = nextSunday.getTime() - now.getTime();
      
      setTimeout(() => {
        console.log('Performing scheduled weekly Shabbat data refresh');
        refreshShabbatData();
        scheduleWeeklyRefresh(); // Schedule next refresh
      }, msUntilRefresh);
    };
    
    // Initial scheduling
    scheduleWeeklyRefresh();
    
    return () => {};
  }, [selectedDate]);

  return { shabbatData };
}
