
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { processShabbatData } from '@/services/shabbatService';
import type { ShabbatHookData } from '@/types/shabbat';
import { getPrayerOverrides, getActiveOverride } from '@/lib/database/prayers/overrides';
import type { PrayerOverride } from '@/lib/database/types/prayers';

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
  const [overrides, setOverrides] = useState<PrayerOverride[]>([]);

  const refreshShabbatData = async () => {
    try {
      // Get the current date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];
      
      // Load prayer overrides
      const prayerOverrides = await getPrayerOverrides();
      setOverrides(prayerOverrides);
      console.log('Loaded Shabbat prayer overrides:', prayerOverrides);
      
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
        
        // Apply any active prayer overrides to the Shabbat prayers
        const shabbatDate = new Date(nextShabbat.date);
        const updatedPrayers = processedData.prayers.map(prayer => {
          const override = getActiveOverride(prayer.name, shabbatDate, overrides);
          if (override) {
            console.log(`Found override for Shabbat prayer ${prayer.name}: ${override.override_time}`);
            return {
              ...prayer,
              time: override.override_time
            };
          }
          return prayer;
        });
        
        setShabbatData({
          ...processedData,
          prayers: updatedPrayers
        });
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
    
    const handlePrayerOverrideUpdate = () => {
      console.log('Prayer override update detected, refreshing Shabbat data...');
      refreshShabbatData();
    };
    
    window.addEventListener('shabbat-updated', handleShabbatUpdate);
    window.addEventListener('prayer-override-updated', handlePrayerOverrideUpdate);
    
    return () => {
      window.removeEventListener('shabbat-updated', handleShabbatUpdate);
      window.removeEventListener('prayer-override-updated', handlePrayerOverrideUpdate);
    };
  }, []);

  return { shabbatData };
}

export type { ShabbatHookData } from '@/types/shabbat';
