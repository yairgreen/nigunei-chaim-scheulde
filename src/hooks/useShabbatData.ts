
import { useState, useEffect } from 'react';
import { getThisWeekShabbat, getFridaySunsetTime } from '@/lib/database';
import type { ShabbatHookData } from '@/types/shabbat';
import { processShabbatData } from '@/services/shabbatService';

export function useShabbatData(specificDate?: Date): ShabbatHookData {
  const [shabbatData, setShabbatData] = useState({
    title: 'שבת',
    subtitle: 'טוען פרשת השבוע...',
    candlesPT: '--:--',
    candlesTA: '--:--',
    havdala: '--:--',
    prayers: [],
    classes: []
  });

  const refreshShabbatData = async () => {
    try {
      // Get Friday's sunset time for Kabalat Shabbat calculation
      const fridaySunset = await getFridaySunsetTime(specificDate);
      console.log('Friday sunset time:', fridaySunset);
      
      // Get Shabbat data for this week or the specific date
      const shabbat = await getThisWeekShabbat(specificDate);
      console.log('Shabbat data:', shabbat);
      
      const processedData = processShabbatData(shabbat, fridaySunset);
      setShabbatData(processedData);
    } catch (error) {
      console.error('Error refreshing Shabbat data:', error);
      const processedData = processShabbatData(null, '18:57');
      setShabbatData(processedData);
    }
  };

  useEffect(() => {
    refreshShabbatData();
    
    // Set up event listener for Shabbat updates
    const handleShabbatUpdate = () => {
      console.log('Shabbat update detected, refreshing data...');
      refreshShabbatData();
    };
    
    window.addEventListener('shabbat-updated', handleShabbatUpdate);
    
    return () => {
      window.removeEventListener('shabbat-updated', handleShabbatUpdate);
    };
  }, [specificDate]);

  return { shabbatData };
}

export type { ShabbatHookData, ShabbatDataResponse } from '@/types/shabbat';
