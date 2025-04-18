
import { format } from 'date-fns';

// Calculate Shabbat mincha time - one hour before havdalah, rounded down to 5 min
export const calculateShabbatMinchaTime = (havdalah: string): string => {
  if (!havdalah) return "18:45"; // Fallback
  
  const [hours, minutes] = havdalah.split(':').map(Number);
  const havdalahTotalMinutes = hours * 60 + minutes;
  
  // Subtract 60 minutes for mincha time
  const minchaTotalMinutes = havdalahTotalMinutes - 60;
  
  // Round down to nearest 5 minutes
  const roundedMinutes = Math.floor(minchaTotalMinutes / 5) * 5;
  
  // Convert back to HH:MM format
  const minchaHours = Math.floor(roundedMinutes / 60);
  const minchaMinutes = roundedMinutes % 60;
  
  return `${String(minchaHours).padStart(2, '0')}:${String(minchaMinutes).padStart(2, '0')}`;
};

// Calculate Shabbat kabalat time based on sunset (11-15 minutes before sunset, rounded to 5 minutes)
export const calculateShabbatKabalatTime = (sunset: string): string => {
  if (!sunset) return "18:45"; // Fallback default
  
  const [hours, minutes] = sunset.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes;
  
  // Buffer between 11 and 15 minutes (using 13 as an average)
  const bufferMinutes = 13;
  
  // Calculate mincha time before sunset
  const minchaMinutes = totalMinutes - bufferMinutes;
  
  // Round up to the nearest 5 minutes
  const roundedMinutes = Math.ceil(minchaMinutes / 5) * 5;
  
  // Convert back to HH:MM format
  const minchaHours = Math.floor(roundedMinutes / 60);
  const minchaMinutesPart = roundedMinutes % 60;
  
  return `${String(minchaHours).padStart(2, '0')}:${String(minchaMinutesPart).padStart(2, '0')}`;
};

// Determine if a date is during Daylight Saving Time in Israel
export const isIsraeliDaylightTime = (date: Date): boolean => {
  const year = date.getFullYear();
  
  // Find the last Sunday of March
  const lastSundayMarch = new Date(year, 2, 31);
  while (lastSundayMarch.getDay() !== 0) {
    lastSundayMarch.setDate(lastSundayMarch.getDate() - 1);
  }
  
  // Find the last Sunday of October
  const lastSundayOctober = new Date(year, 9, 31);
  while (lastSundayOctober.getDay() !== 0) {
    lastSundayOctober.setDate(lastSundayOctober.getDate() - 1);
  }
  
  // The Friday before the last Sunday in March is the start of DST
  const dstStart = new Date(lastSundayMarch);
  // Go back to the previous Friday
  while (dstStart.getDay() !== 5) { // 5 is Friday
    dstStart.setDate(dstStart.getDate() - 1);
  }
  
  // Set the DST start and end times (2 AM)
  dstStart.setHours(2, 0, 0, 0);
  lastSundayOctober.setHours(2, 0, 0, 0);
  
  // Check if the current date is between DST start and end
  return date >= dstStart && date < lastSundayOctober;
};
