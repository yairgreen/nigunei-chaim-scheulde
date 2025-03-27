
import { format } from 'date-fns';

// Calculate mincha time based on sunset times
export const calculateWeeklyMinchaTime = (zmanimForWeek: {date: string, sunset: string}[]): string => {
  if (zmanimForWeek.length === 0) return "17:30"; // Fallback
  
  // Get sunset times for each day
  const sunsetTimes = zmanimForWeek.map(item => {
    if (!item.sunset) return Infinity; // Skip days without sunset data
    const [hours, minutes] = item.sunset.split(':').map(Number);
    return hours * 60 + minutes; // Convert to minutes
  });
  
  // Find earliest sunset
  const earliestSunsetMinutes = Math.min(...sunsetTimes);
  
  // If no valid sunset times were found, return default
  if (earliestSunsetMinutes === Infinity) return "17:30";
  
  // Subtract 11-15 minutes (use 15 for maximum buffer) and round to nearest 5 minutes (always up)
  const minchaMinutes = earliestSunsetMinutes - 15;
  const roundedMinutes = Math.ceil(minchaMinutes / 5) * 5;
  
  // Convert back to HH:MM format
  const hours = Math.floor(roundedMinutes / 60);
  const minutes = roundedMinutes % 60;
  
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

// Calculate arvit time based on sunset times (sunset + 18 minutes)
export const calculateWeeklyArvitTime = (zmanimForWeek: {date: string, sunset: string}[]): string => {
  if (zmanimForWeek.length === 0) return "18:45"; // Fallback
  
  // Get sunset times for each day
  const sunsetTimes = zmanimForWeek.map(item => {
    if (!item.sunset) return -Infinity; // Skip days without sunset data
    const [hours, minutes] = item.sunset.split(':').map(Number);
    return hours * 60 + minutes; // Convert to minutes
  });
  
  // Find latest sunset
  const latestSunsetMinutes = Math.max(...sunsetTimes);
  
  // If no valid sunset times were found, return default
  if (latestSunsetMinutes === -Infinity) return "18:45";
  
  // Add 18 minutes to represent tzet (star appearance) time
  const arvitMinutes = latestSunsetMinutes + 18;
  
  // Round up to the nearest 5 minutes
  const roundedMinutes = Math.ceil(arvitMinutes / 5) * 5;
  
  // Convert back to HH:MM format
  const hours = Math.floor(roundedMinutes / 60);
  const minutes = roundedMinutes % 60;
  
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};
