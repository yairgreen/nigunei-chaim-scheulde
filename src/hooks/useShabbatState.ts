
import { useState, useEffect } from 'react';
import { useScheduleData } from '@/hooks/useScheduleData';

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
  
  return {
    shabbatPrayers,
    shabbatTimes,
    setShabbatTimes,
    handleUpdateShabbatPrayerTime
  };
}
