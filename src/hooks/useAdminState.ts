
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getPrayerOverrides, addPrayerOverride, deletePrayerOverride, getActiveOverride } from '@/lib/database/prayers/overrides';
import type { Prayer, PrayerOverride } from '@/lib/database/types/prayers';

const DEFAULT_PRAYERS = [
  { id: 'daily-shacharit-1', name: 'שחרית א׳', category: 'daily' as const },
  { id: 'daily-shacharit-2', name: 'שחרית ב׳', category: 'daily' as const },
  { id: 'daily-shacharit-3', name: 'שחרית ג׳', category: 'daily' as const },
  { id: 'daily-mincha-gedola', name: 'מנחה גדולה', category: 'daily' as const },
  { id: 'daily-mincha', name: 'מנחה', category: 'daily' as const },
  { id: 'daily-arvit-1', name: 'ערבית א׳', category: 'daily' as const },
  { id: 'daily-arvit-2', name: 'ערבית ב׳', category: 'daily' as const },
];

export function useAdminState() {
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [overrides, setOverrides] = useState<PrayerOverride[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadPrayerTimes();
  }, []);

  const getCalculatedTimes = async () => {
    // דמו זמנים מחושבים - בתכל'ס תמשוך מהלוגיקת החישוב הראשית
    return {
      'daily-shacharit-1': '06:15',
      'daily-shacharit-2': '07:00',
      'daily-shacharit-3': '08:00',
      'daily-mincha-gedola': '12:30',
      'daily-mincha': '17:15',
      'daily-arvit-1': '18:15',
      'daily-arvit-2': '20:45',
    };
  };

  const loadPrayerTimes = async () => {
    try {
      const [calculatedTimes, activeOverrides] = await Promise.all([
        getCalculatedTimes(),
        getPrayerOverrides()
      ]);

      const currentDate = new Date();
      const updatedPrayers: Prayer[] = DEFAULT_PRAYERS.map(prayer => {
        const override = getActiveOverride(prayer.id, currentDate, activeOverrides);
        
        return {
          ...prayer,
          defaultTime: calculatedTimes[prayer.id] || '',
          overrideTime: override?.override_time,
          overrideInfo: override
            ? {
                id: override.id,
                startDate: override.start_date,
                endDate: override.end_date,
                dayOfWeek: override.day_of_week
              }
            : undefined,
        };
      });

      setPrayers(updatedPrayers);
      setOverrides(activeOverrides);
    } catch (error) {
      console.error('Error loading prayer times:', error);
      toast({
        title: 'שגיאה',
        description: 'אירעה שגיאה בטעינת הזמנים',
        variant: 'destructive'
      });
    }
  };

  const handleAddOverride = async (prayerId: string, data: {
    time: string;
    startDate: string;
    endDate: string;
    dayOfWeek?: number | null;
  }) => {
    try {
      await addPrayerOverride({
        prayer_name: prayerId,
        override_time: data.time,
        start_date: data.startDate,
        end_date: data.endDate,
        day_of_week: data.dayOfWeek ?? null,
      });
      
      // Refresh prayer data
      await loadPrayerTimes();

      toast({
        title: 'דריסת זמן נוספה',
        description: 'הזמן עודכן בהצלחה'
      });
    } catch (error) {
      console.error('Error adding override:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן היה להוסיף את דריסת הזמן',
        variant: 'destructive'
      });
    }
  };

  const handleRemoveOverride = async (prayerId: string, overrideId: string) => {
    try {
      await deletePrayerOverride(overrideId);
      
      // Refresh prayer data
      await loadPrayerTimes();

      toast({
        title: 'דריסת זמן בוטלה',
        description: 'הזמן חזר לערך המחושב'
      });
    } catch (error) {
      console.error('Error removing override:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן היה לבטל את דריסת הזמן',
        variant: 'destructive'
      });
    }
  };

  return {
    prayers,
    handleAddOverride,
    handleRemoveOverride
  };
}
