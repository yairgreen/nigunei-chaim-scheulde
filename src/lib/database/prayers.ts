import { format } from 'date-fns';

// Calculate mincha time based on the earliest sunset time
// Must be 11-16 minutes before sunset, rounded to nearest 5 minutes
export const calculateWeeklyMinchaTime = (zmanimForWeek: {date: string, sunset: string, beinHaShmashos?: string}[]): string => {
  if (zmanimForWeek.length === 0) return ""; 
  
  // Get sunset times for each day
  const sunsetTimes = zmanimForWeek.map(item => {
    if (!item.sunset) return Infinity;
    const [hours, minutes] = item.sunset.split(':').map(Number);
    return hours * 60 + minutes;
  });
  
  // Find earliest sunset
  const earliestSunsetMinutes = Math.min(...sunsetTimes);
  if (earliestSunsetMinutes === Infinity) return "";
  
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
  
  // Choose the time closest to the midpoint of the range
  const midpoint = (rangeStart + rangeEnd) / 2;
  const roundedMinutes = possibleTimes.reduce((closest, current) => 
    Math.abs(current - midpoint) < Math.abs(closest - midpoint) ? current : closest
  );
  
  // Convert back to HH:MM format
  const hours = Math.floor(roundedMinutes / 60);
  const minutes = roundedMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

// Calculate arvit time based on the latest tzait hakochavim (beinHaShmashos) time
// Must be between 1 minute before and 4 minutes after tzait, rounded to nearest 5 minutes
export const calculateWeeklyArvitTime = (zmanimForWeek: {date: string, sunset: string, beinHaShmashos?: string}[]): string => {
  if (zmanimForWeek.length === 0) return "";
  
  // Get tzait hakochavim times for each day
  const tzaitTimes = zmanimForWeek.map(item => {
    if (item.beinHaShmashos) {
      const [hours, minutes] = item.beinHaShmashos.split(':').map(Number);
      return hours * 60 + minutes;
    }
    if (item.sunset) {
      const [hours, minutes] = item.sunset.split(':').map(Number);
      return (hours * 60 + minutes) + 18;
    }
    return -Infinity;
  });
  
  // Find latest tzait time
  const latestTzaitMinutes = Math.max(...tzaitTimes);
  if (latestTzaitMinutes === -Infinity) return "";
  
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
  
  // Choose the time closest to the midpoint of the range
  const midpoint = (rangeStart + rangeEnd) / 2;
  const roundedMinutes = possibleTimes.reduce((closest, current) => 
    Math.abs(current - midpoint) < Math.abs(closest - midpoint) ? current : closest
  );
  
  // Convert back to HH:MM format
  const hours = Math.floor(roundedMinutes / 60);
  const minutes = roundedMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};
