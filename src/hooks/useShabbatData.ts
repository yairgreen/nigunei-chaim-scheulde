
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { processShabbatData } from '@/services/shabbatService';
import type { ShabbatHookData } from '@/types/shabbat';

export function useShabbatData(): ShabbatHookData {
  const [shabbatData, setShabbatData] = useState({
    title: 'שבת',
    subtitle: '',
    candlesPT: '--:--',
    candlesTA: '--:--',
    havdala: '--:--',
    prayers: [],
    classes: []
  });

  const refreshShabbatData = async () => {
    try {
      // Get the current date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];
      
      // Query for the next Shabbat
      const { data: nextShabbat, error } = await supabase
        .from('shabbat_times')
        .select('*')
        .gte('date', today)
        .order('date')
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching Shabbat data:', error);
        return;
      }

      if (nextShabbat) {
        console.log('Found next Shabbat:', nextShabbat);
        
        // Get the Friday sunset time for this Shabbat from daily_zmanim
        let fridaySunset = '';
        try {
          const { data: fridayZmanim, error: fridayError } = await supabase
            .from('daily_zmanim')
            .select('sunset')
            .eq('gregorian_date', nextShabbat.date)
            .single();
            
          if (!fridayError && fridayZmanim && fridayZmanim.sunset) {
            fridaySunset = fridayZmanim.sunset;
            console.log(`Found Friday sunset time for Shabbat: ${fridaySunset}`);
          } else {
            console.warn('Could not find sunset time for Friday, using default');
            fridaySunset = '19:00'; // Default if not found
          }
        } catch (zmanimError) {
          console.error('Error getting Friday zmanim:', zmanimError);
          fridaySunset = '19:00'; // Default if error
        }
        
        // Process the Shabbat data with the correct Friday sunset time
        const processedData = processShabbatData(nextShabbat, fridaySunset);
        setShabbatData(processedData);
      }
    } catch (error) {
      console.error('Error refreshing Shabbat data:', error);
    }
  };

  useEffect(() => {
    refreshShabbatData();
    
    const handleShabbatUpdate = () => {
      console.log('Shabbat update detected, refreshing data...');
      refreshShabbatData();
    };
    
    window.addEventListener('shabbat-updated', handleShabbatUpdate);
    
    return () => {
      window.removeEventListener('shabbat-updated', handleShabbatUpdate);
    };
  }, []);

  return { shabbatData };
}

export type { ShabbatHookData } from '@/types/shabbat';
