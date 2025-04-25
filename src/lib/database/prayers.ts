
import { format } from 'date-fns';

// Calculate mincha time based on the earliest sunset time
// Must be 11-16 minutes before sunset, rounded to nearest 5 minutes
export const calculateWeeklyMinchaTime = (zmanimForWeek: {date: string, sunset: string, beinHaShmashos?: string}[]): string => {
  if (zmanimForWeek.length === 0) {
    console.warn('No data provided for Mincha calculation');
    return ""; 
  }
  
  console.log('Calculating Mincha time with', zmanimForWeek.length, 'zmanim records');
  
  // Get sunset times for each day
  const sunsetTimes = zmanimForWeek.map(item => {
    if (!item.sunset) {
      console.warn(`Missing sunset time for date ${item.date}`);
      return Infinity;
    }
    const [hours, minutes] = item.sunset.split(':').map(Number);
    return hours * 60 + minutes;
  });
  
  // Find earliest sunset
  const earliestSunsetMinutes = Math.min(...sunsetTimes);
  if (earliestSunsetMinutes === Infinity) {
    console.error('No valid sunset times found for Mincha calculation');
    return "";
  }
  
  console.log('Earliest sunset (minutes):', earliestSunsetMinutes);
  
  // Calculate range between 11 and 16 minutes before sunset
  const rangeStart = earliestSunsetMinutes - 16;
  const rangeEnd = earliestSunsetMinutes - 11;
  
  // Find the nearest 5-minute mark within the allowed range
  const possibleTimes = [];
  for (let time = Math.floor(rangeStart / 5) * 5; time <= Math.ceil(rangeEnd / 5) * 5; time += 5) {
    if (time >= rangeStart && time <= rangeEnd) {
      possibleTimes.push(time);
    }
  }
  
  if (possibleTimes.length === 0) {
    console.error('No valid times found within Mincha calculation range');
    return "";
  }
  
  // Choose the time closest to the midpoint of the range
  const midpoint = (rangeStart + rangeEnd) / 2;
  const roundedMinutes = possibleTimes.reduce((closest, current) => 
    Math.abs(current - midpoint) < Math.abs(closest - midpoint) ? current : closest
  );
  
  // Convert back to HH:MM format
  const hours = Math.floor(roundedMinutes / 60);
  const minutes = roundedMinutes % 60;
  const result = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  
  console.log('Calculated Mincha time:', result);
  return result;
};

// Calculate arvit time based on the latest tzait hakochavim (beinHaShmashos) time
// Must be between 1 minute before and 4 minutes after tzait, rounded to nearest 5 minutes
export const calculateWeeklyArvitTime = (zmanimForWeek: {date: string, sunset: string, beinHaShmashos?: string}[]): string => {
  if (zmanimForWeek.length === 0) {
    console.warn('No data provided for Arvit calculation');
    return "";
  }
  
  console.log('Calculating Arvit time with', zmanimForWeek.length, 'zmanim records');
  
  // Get tzait hakochavim times for each day
  const tzaitTimes = zmanimForWeek.map(item => {
    if (item.beinHaShmashos) {
      const [hours, minutes] = item.beinHaShmashos.split(':').map(Number);
      return hours * 60 + minutes;
    }
    if (item.sunset) {
      // Fallback: calculate tzait as sunset + 18 minutes if beinHaShmashos is missing
      const [hours, minutes] = item.sunset.split(':').map(Number);
      console.log(`Using calculated tzait time for ${item.date} (sunset + 18 min)`);
      return (hours * 60 + minutes) + 18;
    }
    console.warn(`Missing both sunset and beinHaShmashos for date ${item.date}`);
    return -Infinity;
  });
  
  // Find latest tzait time
  const latestTzaitMinutes = Math.max(...tzaitTimes);
  if (latestTzaitMinutes === -Infinity) {
    console.error('No valid tzait times found for Arvit calculation');
    return "";
  }
  
  console.log('Latest tzait (minutes):', latestTzaitMinutes);
  
  // Calculate range between 1 minute before and 4 minutes after tzait
  const rangeStart = latestTzaitMinutes - 1;
  const rangeEnd = latestTzaitMinutes + 4;
  
  // Find the nearest 5-minute mark within the allowed range
  const possibleTimes = [];
  for (let time = Math.floor(rangeStart / 5) * 5; time <= Math.ceil(rangeEnd / 5) * 5; time += 5) {
    if (time >= rangeStart && time <= rangeEnd) {
      possibleTimes.push(time);
    }
  }
  
  if (possibleTimes.length === 0) {
    console.error('No valid times found within Arvit calculation range');
    return "";
  }
  
  // Choose the time closest to the midpoint of the range
  const midpoint = (rangeStart + rangeEnd) / 2;
  const roundedMinutes = possibleTimes.reduce((closest, current) => 
    Math.abs(current - midpoint) < Math.abs(closest - midpoint) ? current : closest
  );
  
  // Convert back to HH:MM format
  const hours = Math.floor(roundedMinutes / 60);
  const minutes = roundedMinutes % 60;
  const result = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  
  console.log('Calculated Arvit time:', result);
  return result;
};

// Add a function to recalculate prayer times from current zmanim data
export const recalculatePrayerTimes = async () => {
  try {
    console.log('Recalculating prayer times...');
    // Dynamic import to avoid circular dependencies
    const { getZmanimForWeek } = await import('@/lib/supabase/zmanim');
    const { startOfWeek, addDays, format } = await import('date-fns');
    
    const today = new Date();
    const weekStart = startOfWeek(today);
    const weekEnd = addDays(weekStart, 6);
    
    const zmanimData = await getZmanimForWeek(
      format(weekStart, 'yyyy-MM-dd'),
      format(weekEnd, 'yyyy-MM-dd')
    );
    
    if (!zmanimData || zmanimData.length === 0) {
      console.error('No zmanim data available for recalculation');
      return { minchaTime: '', arvitTime: '' };
    }
    
    // Filter to include only Sunday through Thursday
    const weekdayZmanim = zmanimData.filter(zmanim => {
      const date = new Date(zmanim.date);
      const day = date.getDay();
      return day >= 0 && day <= 4; // Sunday (0) through Thursday (4)
    });
    
    if (weekdayZmanim.length === 0) {
      console.error('No weekday zmanim available after filtering');
      return { minchaTime: '', arvitTime: '' };
    }
    
    const zmanimForCalc = weekdayZmanim.map(z => ({
      date: z.date,
      sunset: z.sunset,
      beinHaShmashos: z.beinHaShmashos
    }));
    
    const minchaTime = calculateWeeklyMinchaTime(zmanimForCalc);
    const arvitTime = calculateWeeklyArvitTime(zmanimForCalc);
    
    console.log('Recalculated times:', { minchaTime, arvitTime });
    
    return { minchaTime, arvitTime };
  } catch (error) {
    console.error('Error recalculating prayer times:', error);
    return { minchaTime: '', arvitTime: '' };
  }
};
