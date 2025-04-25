
import { useState, useEffect } from 'react';
import { getTodayZmanim, getZmanimForSpecificDate } from '@/lib/database/index';
import type { ZmanimData } from '@/lib/database/zmanim';

export function useZmanimData(date?: Date) {
  const [zmanimData, setZmanimData] = useState<ZmanimData | null>(null);

  const fetchZmanimData = async () => {
    try {
      console.log('Fetching daily zmanim data from Supabase...');
      const data = date 
        ? await getZmanimForSpecificDate(date) 
        : await getTodayZmanim();
      
      if (!data) {
        console.error('No zmanim data available');
        return;
      }

      console.log('Zmanim data received:', data);
      setZmanimData(data);
    } catch (error) {
      console.error('Error fetching daily times:', error);
    }
  };

  useEffect(() => {
    fetchZmanimData();
    
    const handleZmanimUpdate = () => {
      console.log('Zmanim update detected, refreshing...');
      fetchZmanimData();
    };
    
    window.addEventListener('zmanim-updated', handleZmanimUpdate);
    
    return () => {
      window.removeEventListener('zmanim-updated', handleZmanimUpdate);
    };
  }, [date]);

  return { zmanimData, fetchZmanimData };
}

