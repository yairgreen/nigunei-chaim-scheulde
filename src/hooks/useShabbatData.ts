
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
        const processedData = processShabbatData(nextShabbat, nextShabbat.early_mincha_time || '18:57');
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
