
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getPrayerOverrides as fetchPrayerOverrides, addPrayerOverride, deletePrayerOverride } from '@/lib/database/prayers/overrides';

const DEFAULT_PRAYERS = [
  { id: 'shacharit', name: 'שחרית' },
  { id: 'mincha', name: 'מנחה' },
  { id: 'arvit', name: 'ערבית' },
  // ניתן להרחיב לפי הצורך...
];

type Prayer = {
  id: string;
  name: string;
  defaultTime: string;
  overrideTime?: string;
  overrideInfo?: {
    id: string;
    startDate: string;
    endDate: string;
    dayOfWeek: string | null;
  }
};

export function useAdminState() {
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadPrayerTimes();
  }, []);

  const getCalculatedTimes = async () => {
    // חישוב דמו בלבד - בתכל'ס תמשוך מהלוגיקת החישוב הראשית
    // כאן פשוט שחזור נתון זמני לצורך הדמו
    return {
      shacharit: '07:00',
      mincha: '13:30',
      arvit: '20:00',
    };
  };

  const getActiveOverrides = async () => {
    const overrides = await fetchPrayerOverrides();
    return overrides.filter(o => o.is_active);
  };

  const loadPrayerTimes = async () => {
    try {
      const [calculatedTimes, activeOverrides] = await Promise.all([
        getCalculatedTimes(),
        getActiveOverrides()
      ]);

      const updatedPrayers: Prayer[] = DEFAULT_PRAYERS.map(prayer => {
        const override = activeOverrides.find(o => o.prayer_name === prayer.id);
        return {
          ...prayer,
          defaultTime: calculatedTimes[prayer.id] || '',
          overrideTime: override?.override_time,
          overrideInfo: override
            ? {
                id: override.id,
                startDate: override.start_date,
                endDate: override.end_date,
                dayOfWeek:
                  override.day_of_week !== null && override.day_of_week !== undefined
                    ? ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'][override.day_of_week]
                    : null,
              }
            : undefined,
        };
      });

      setPrayers(updatedPrayers);
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
    dayOfWeek?: string;
  }) => {
    try {
      await addPrayerOverride({
        prayer_name: prayerId,
        override_time: data.time,
        start_date: data.startDate,
        end_date: data.endDate,
        day_of_week:
          data.dayOfWeek
            ? ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'].indexOf(data.dayOfWeek)
            : null,
      });
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

  const handleRemoveOverride = async (_prayerId: string, overrideId: string) => {
    try {
      await deletePrayerOverride(overrideId);
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
