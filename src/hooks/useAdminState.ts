
import { useState, useEffect } from 'react';
import { useScheduleData } from '@/hooks/useScheduleData';

export interface PrayerItem {
  name: string;
  time: string;
}

export interface ClassItem {
  name: string;
  time: string;
}

export interface ShabbatTimes {
  candlesPT: string;
  candlesTA: string;
  havdala: string;
}

export function useAdminState() {
  const [isDemoMode, setIsDemoMode] = useState(true);
  const { dailyPrayers, dailyClasses, shabbatData } = useScheduleData();
  
  const [prayers, setPrayers] = useState<PrayerItem[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [shabbatPrayers, setShabbatPrayers] = useState<PrayerItem[]>([]);
  const [shabbatTimes, setShabbatTimes] = useState<ShabbatTimes>({
    candlesPT: '',
    candlesTA: '',
    havdala: ''
  });
  
  useEffect(() => {
    // Always use demo mode now that we removed Clerk
    setIsDemoMode(true);
  }, []);
  
  useEffect(() => {
    if (dailyPrayers.length) {
      setPrayers([...dailyPrayers]);
    }
    
    if (dailyClasses.length) {
      setClasses([...dailyClasses]);
    }
    
    if (shabbatData.prayers.length) {
      setShabbatPrayers([...shabbatData.prayers]);
      setShabbatTimes({
        candlesPT: shabbatData.candlesPT,
        candlesTA: shabbatData.candlesTA,
        havdala: shabbatData.havdala
      });
    }
  }, [dailyPrayers, dailyClasses, shabbatData]);
  
  const handleUpdatePrayerTime = (index: number, time: string) => {
    const newPrayers = [...prayers];
    newPrayers[index].time = time;
    setPrayers(newPrayers);
  };
  
  const handleUpdateClassName = (index: number, name: string) => {
    const newClasses = [...classes];
    newClasses[index].name = name;
    setClasses(newClasses);
  };
  
  const handleUpdateClassTime = (index: number, time: string) => {
    const newClasses = [...classes];
    newClasses[index].time = time;
    setClasses(newClasses);
  };
  
  const handleUpdateShabbatPrayerTime = (index: number, time: string) => {
    const newPrayers = [...shabbatPrayers];
    newPrayers[index].time = time;
    setShabbatPrayers(newPrayers);
  };
  
  return {
    isDemoMode,
    prayers,
    classes,
    shabbatPrayers,
    shabbatTimes,
    setShabbatTimes,
    handleUpdatePrayerTime,
    handleUpdateClassName,
    handleUpdateClassTime,
    handleUpdateShabbatPrayerTime
  };
}
