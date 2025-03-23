
import { useState, useEffect } from 'react';
import { usePrayersState, PrayerItem } from './usePrayersState';
import { useClassesState, ClassItem } from './useClassesState';
import { useShabbatState, ShabbatTimes } from './useShabbatState';

export { PrayerItem, ClassItem, ShabbatTimes };

export function useAdminState() {
  const [isDemoMode, setIsDemoMode] = useState(true);
  
  // Use our specialized hooks
  const { prayers, handleUpdatePrayerTime } = usePrayersState();
  const { classes, handleUpdateClassName, handleUpdateClassTime } = useClassesState();
  const { 
    shabbatPrayers, 
    shabbatTimes, 
    setShabbatTimes, 
    handleUpdateShabbatPrayerTime 
  } = useShabbatState();
  
  useEffect(() => {
    // Always use demo mode
    setIsDemoMode(true);
  }, []);
  
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
