
import { useState, useEffect } from 'react';
import { useScheduleData } from '@/hooks/useScheduleData';
import { useToast } from '@/hooks/use-toast';

export interface PrayerItem {
  name: string;
  time: string;
}

export interface ShabbatTimes {
  candlesPT: string;
  candlesTA: string;
  havdala: string;
}

export function useShabbatState() {
  const { shabbatData } = useScheduleData();
  const { toast } = useToast();
  
  const [shabbatPrayers, setShabbatPrayers] = useState<PrayerItem[]>([]);
  const [shabbatTimes, setShabbatTimes] = useState<ShabbatTimes>({
    candlesPT: '',
    candlesTA: '',
    havdala: ''
  });
  
  useEffect(() => {
    if (shabbatData && shabbatData.prayers && shabbatData.prayers.length) {
      setShabbatPrayers([...shabbatData.prayers]);
      setShabbatTimes({
        candlesPT: shabbatData.candlesPT,
        candlesTA: shabbatData.candlesTA,
        havdala: shabbatData.havdala
      });
    }
  }, [shabbatData]);
  
  const handleUpdateShabbatPrayerTime = (index: number, time: string) => {
    const newPrayers = [...shabbatPrayers];
    newPrayers[index].time = time;
    setShabbatPrayers(newPrayers);
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
    saveShabbatChanges
  };
}
