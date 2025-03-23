
import { useState, useEffect } from 'react';
import { useScheduleData } from '@/hooks/useScheduleData';

export interface ClassItem {
  name: string;
  time: string;
}

export function useClassesState() {
  const { dailyClasses } = useScheduleData();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  
  useEffect(() => {
    if (dailyClasses.length) {
      setClasses([...dailyClasses]);
    }
  }, [dailyClasses]);
  
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
  
  return {
    classes,
    handleUpdateClassName,
    handleUpdateClassTime
  };
}
