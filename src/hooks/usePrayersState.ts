
import { useState, useEffect } from 'react';
import { useScheduleData } from '@/hooks/useScheduleData';

export interface PrayerItem {
  name: string;
  time: string;
}

export function usePrayersState() {
  const { dailyPrayers } = useScheduleData();
  const [prayers, setPrayers] = useState<PrayerItem[]>([]);
  
  useEffect(() => {
    if (dailyPrayers.length) {
      setPrayers([...dailyPrayers]);
    }
  }, [dailyPrayers]);
  
  const handleUpdatePrayerTime = (index: number, time: string) => {
    const newPrayers = [...prayers];
    newPrayers[index].time = time;
    setPrayers(newPrayers);
  };
  
  return {
    prayers,
    handleUpdatePrayerTime
  };
}
