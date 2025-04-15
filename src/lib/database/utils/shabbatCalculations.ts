
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

// Calculate Shabbat kabalat time
export const calculateShabbatKabalatTime = (sunset: string): string => {
  if (!sunset) return "18:45"; // Fallback default
  
  const [hours, minutes] = sunset.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes;
  
  const maxBuffer = 16;
  const minBuffer = 11;
  
  const earliestMinutes = totalMinutes - maxBuffer;
  const latestMinutes = totalMinutes - minBuffer;
  
  const roundedMinutes = Math.round((earliestMinutes + latestMinutes) / 2 / 5) * 5;
  
  const finalMinutes = Math.max(
    earliestMinutes, 
    Math.min(latestMinutes, roundedMinutes)
  );
  
  const kabalatHours = Math.floor(finalMinutes / 60);
  const kabalatMinutesPart = finalMinutes % 60;
  
  return `${String(kabalatHours).padStart(2, '0')}:${String(kabalatMinutesPart).padStart(2, '0')}`;
};

