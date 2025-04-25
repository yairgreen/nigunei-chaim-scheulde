
import { useQuery } from '@tanstack/react-query';
import { getTodayZmanim, getZmanimForSpecificDate } from '@/lib/database/index';
import type { ZmanimData } from '@/lib/database/zmanim';

export function useZmanimData(date?: Date) {
  const { data: zmanimData, refetch: fetchZmanimData } = useQuery({
    queryKey: ['zmanim', date?.toISOString() ?? 'today'],
    queryFn: async () => {
      console.log('Fetching daily zmanim data from Supabase...');
      const data = date 
        ? await getZmanimForSpecificDate(date) 
        : await getTodayZmanim();
      
      if (!data) {
        console.error('No zmanim data available');
        return null;
      }

      console.log('Zmanim data received:', data);
      return data;
    },
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    refetchOnWindowFocus: true,
  });

  // Listen for zmanim-updated events to trigger refetch
  useEffect(() => {    
    const handleZmanimUpdate = () => {
      console.log('Zmanim update detected, refreshing...');
      fetchZmanimData();
    };
    
    window.addEventListener('zmanim-updated', handleZmanimUpdate);
    
    return () => {
      window.removeEventListener('zmanim-updated', handleZmanimUpdate);
    };
  }, [fetchZmanimData]);

  return { zmanimData, fetchZmanimData };
}

