
import { useState, useEffect } from 'react';
import { useScheduleData } from '@/hooks/useScheduleData';
import { useToast } from '@/hooks/use-toast';
import { getPrayerOverrides, addPrayerOverride, deletePrayerOverride, getActiveOverride } from '@/lib/database/prayers/overrides';
import type { Prayer, PrayerOverride } from '@/lib/database/types/prayers';

export interface ShabbatTimes {
  candlesPT: string;
  candlesTA: string;
  havdala: string;
}

export function useShabbatState() {
  const { shabbatData } = useScheduleData();
  const { toast } = useToast();
  
  const [shabbatPrayers, setShabbatPrayers] = useState<Prayer[]>([]);
  const [shabbatTimes, setShabbatTimes] = useState<ShabbatTimes>({
    candlesPT: '',
    candlesTA: '',
    havdala: ''
  });
  const [overrides, setOverrides] = useState<PrayerOverride[]>([]);
  
  // Load prayer overrides
  useEffect(() => {
    const loadOverrides = async () => {
      const prayerOverrides = await getPrayerOverrides();
      setOverrides(prayerOverrides);
    };
    
    loadOverrides();
  }, []);
  
  useEffect(() => {
    if (shabbatData && shabbatData.prayers && shabbatData.prayers.length) {
      // Transform shabbat prayers to the unified Prayer format
      const currentDate = new Date();
      const prayers = shabbatData.prayers.map((prayer, index) => {
        const id = `shabbat-${prayer.name.replace(/\s+/g, '-').toLowerCase()}`;
        const override = getActiveOverride(id, currentDate, overrides);
        
        return {
          id,
          name: prayer.name,
          defaultTime: prayer.time,
          category: 'shabbat' as const,
          overrideTime: override?.override_time,
          overrideInfo: override ? {
            id: override.id,
            startDate: override.start_date,
            endDate: override.end_date,
            dayOfWeek: override.day_of_week
          } : undefined
        };
      });
      
      setShabbatPrayers(prayers);
      setShabbatTimes({
        candlesPT: shabbatData.candlesPT,
        candlesTA: shabbatData.candlesTA,
        havdala: shabbatData.havdala
      });
    }
  }, [shabbatData, overrides]);
  
  const handleUpdateShabbatPrayerTime = (index: number, time: string) => {
    const newPrayers = [...shabbatPrayers];
    newPrayers[index].defaultTime = time;
    setShabbatPrayers(newPrayers);
  };
  
  const handleAddOverride = async (prayerId: string, data: {
    time: string;
    startDate: string;
    endDate: string;
    dayOfWeek?: number | null;
  }) => {
    try {
      const result = await addPrayerOverride({
        prayer_name: prayerId,
        override_time: data.time,
        start_date: data.startDate,
        end_date: data.endDate,
        day_of_week: data.dayOfWeek ?? null
      });
      
      if (result) {
        // Refresh overrides
        const prayerOverrides = await getPrayerOverrides();
        setOverrides(prayerOverrides);
        
        toast({
          title: "דריסת זמן נוספה",
          description: "זמן התפילה עודכן בהצלחה",
        });
      }
    } catch (error) {
      console.error('Error adding override:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בהוספת דריסת הזמן",
        variant: "destructive"
      });
    }
  };
  
  const handleRemoveOverride = async (prayerId: string, overrideId: string) => {
    try {
      const success = await deletePrayerOverride(overrideId);
      
      if (success) {
        // Refresh overrides
        const prayerOverrides = await getPrayerOverrides();
        setOverrides(prayerOverrides);
        
        toast({
          title: "דריסת זמן בוטלה",
          description: "זמן התפילה חזר לערך המחושב",
        });
      }
    } catch (error) {
      console.error('Error removing override:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בביטול דריסת הזמן",
        variant: "destructive"
      });
    }
  };
  
  const saveShabbatChanges = async () => {
    try {
      // Here you would call an API to save the changes
      // For now, we'll just show a success toast
      toast({
        title: "השינויים נשמרו",
        description: "זמני השבת עודכנו בהצלחה",
      });
      return true;
    } catch (error) {
      console.error('Error saving Shabbat changes:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בשמירת השינויים",
        variant: "destructive"
      });
      return false;
    }
  };
  
  return {
    shabbatPrayers,
    shabbatTimes,
    setShabbatTimes,
    handleUpdateShabbatPrayerTime,
    handleAddOverride,
    handleRemoveOverride,
    saveShabbatChanges
  };
}
