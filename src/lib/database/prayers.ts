
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

// Calculate arvit time based on beinHaShmashos (tzet hakochavim) times
export const calculateWeeklyArvitTime = (zmanimForWeek: {date: string, beinHaShmashos: string}[]): string => {
  if (zmanimForWeek.length === 0) return "18:45"; // Fallback
  
  // Get tzet times for each day
  const tzetTimes = zmanimForWeek.map(item => {
    if (!item.beinHaShmashos) return -Infinity; // Skip days without tzet data
    const [hours, minutes] = item.beinHaShmashos.split(':').map(Number);
    return hours * 60 + minutes; // Convert to minutes
  });
  
  // Find latest tzet
  const latestTzetMinutes = Math.max(...tzetTimes);
  
  // If no valid tzet times were found, return default
  if (latestTzetMinutes === -Infinity) return "18:45";
  
  // Round to nearest 5 minutes according to specified rules
  const remainder = latestTzetMinutes % 5;
  let roundedMinutes;
  
  if (remainder <= 2) {
    // Round down if remainder is 0, 1, or 2 minutes
    roundedMinutes = latestTzetMinutes - remainder;
  } else {
    // Round up if remainder is 3 or 4 minutes
    roundedMinutes = latestTzetMinutes + (5 - remainder);
  }
  
  // Convert back to HH:MM format
  const hours = Math.floor(roundedMinutes / 60);
  const minutes = roundedMinutes % 60;
  
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};
