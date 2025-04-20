
import { format } from 'date-fns';
import { formatToHHMM } from '@/lib/utils/timeFormatters';

// Calculate mincha time based on earliest sunset time between Sunday-Thursday
export const calculateWeeklyMinchaTime = (zmanimForWeek: {date: string, sunset: string, tzait_hakochavim: string}[]): string => {
  if (!zmanimForWeek || zmanimForWeek.length === 0) return "17:30"; // Fallback

  // Filter for Sunday-Thursday only (0-4 are Sunday-Thursday)
  const weekdayZmanim = zmanimForWeek.filter(item => {
    const date = new Date(item.date);
    const dayOfWeek = date.getDay();
    return dayOfWeek >= 0 && dayOfWeek <= 4;
  });

  if (weekdayZmanim.length === 0) return "17:30";

  // Find earliest sunset
  let earliestSunsetMinutes = Infinity;
  
  weekdayZmanim.forEach(item => {
    if (!item.sunset) return;
    
    const [hours, minutes] = item.sunset.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;
    
    if (totalMinutes < earliestSunsetMinutes) {
      earliestSunsetMinutes = totalMinutes;
    }
  });

  if (earliestSunsetMinutes === Infinity) return "17:30";

  // Calculate range: 11-16 minutes before sunset
  const latestPossibleMincha = earliestSunsetMinutes - 11;
  const earliestPossibleMincha = earliestSunsetMinutes - 16;

  // Find nearest 5-minute interval within range
  let minchaMinutes = Math.floor(((latestPossibleMincha + earliestPossibleMincha) / 2) / 5) * 5;
  
  // Ensure time is within allowed range
  if (minchaMinutes > latestPossibleMincha) {
    minchaMinutes = Math.floor(latestPossibleMincha / 5) * 5;
  }
  if (minchaMinutes < earliestPossibleMincha) {
    minchaMinutes = Math.ceil(earliestPossibleMincha / 5) * 5;
  }

  // Convert to HH:MM format
  const hours = Math.floor(minchaMinutes / 60);
  const minutes = minchaMinutes % 60;
  
  return formatToHHMM(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`);
};

// Calculate arvit time based on latest tzait hakochavim time
export const calculateWeeklyArvitTime = (zmanimForWeek: {date: string, sunset: string, tzait_hakochavim: string}[]): string => {
  if (!zmanimForWeek || zmanimForWeek.length === 0) return "18:45"; // Fallback
  
  // Filter for Sunday-Thursday only
  const weekdayZmanim = zmanimForWeek.filter(item => {
    const date = new Date(item.date);
    const dayOfWeek = date.getDay();
    return dayOfWeek >= 0 && dayOfWeek <= 4;
  });

  if (weekdayZmanim.length === 0) return "18:45";

  // Find latest tzait hakochavim
  let latestTzaitMinutes = -Infinity;
  
  weekdayZmanim.forEach(item => {
    if (!item.tzait_hakochavim) return;
    
    const [hours, minutes] = item.tzait_hakochavim.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;
    
    if (totalMinutes > latestTzaitMinutes) {
      latestTzaitMinutes = totalMinutes;
    }
  });

  if (latestTzaitMinutes === -Infinity) return "18:45";

  // Calculate range: 1 minute before to 4 minutes after tzait
  const earliestPossibleArvit = latestTzaitMinutes - 1;
  const latestPossibleArvit = latestTzaitMinutes + 4;

  // Find nearest 5-minute interval within range
  let arvitMinutes = Math.round(((latestPossibleArvit + earliestPossibleArvit) / 2) / 5) * 5;
  
  // Ensure time is within allowed range
  if (arvitMinutes < earliestPossibleArvit) {
    arvitMinutes = Math.ceil(earliestPossibleArvit / 5) * 5;
  }
  if (arvitMinutes > latestPossibleArvit) {
    arvitMinutes = Math.floor(latestPossibleArvit / 5) * 5;
  }

  // Convert to HH:MM format
  const hours = Math.floor(arvitMinutes / 60);
  const minutes = arvitMinutes % 60;
  
  return formatToHHMM(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`);
};
