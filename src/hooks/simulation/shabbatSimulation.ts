
import { format } from 'date-fns';
import { calculateShabbatMinchaTime, calculateShabbatKabalatTime } from '@/lib/database/shabbat';

/**
 * Functions for simulating Shabbat data
 */

// Simulate Shabbat data based on the selected date
export const simulateShabbatData = (selectedDate: Date, currentShabbatData: any) => {
  // Check if the selected date is Shabbat
  const isShabbat = selectedDate.getDay() === 6; // 6 is Saturday
  
  // This would be more sophisticated in a production app
  // Simple logic to adjust Shabbat times based on month for simulation
  const month = selectedDate.getMonth();
  let candleTime, havdalaTime, sunsetTime;
  
  if (month >= 3 && month <= 8) { // Spring and Summer
    candleTime = `19:${15 + (selectedDate.getDate() % 10)}`;
    havdalaTime = `20:${25 + (selectedDate.getDate() % 5)}`;
    sunsetTime = `19:${45 + (selectedDate.getDate() % 10)}`;
  } else { // Fall and Winter
    candleTime = `16:${30 + (selectedDate.getDate() % 10)}`;
    havdalaTime = `17:${40 + (selectedDate.getDate() % 5)}`;
    sunsetTime = `17:${10 + (selectedDate.getDate() % 10)}`;
  }
  
  // Calculate prayer times based on simulated sunset and havdalah
  const kabalatTime = calculateShabbatKabalatTime(sunsetTime);
  const minchaTime = calculateShabbatMinchaTime(havdalaTime);
  
  // Generate simulated Shabbat prayers
  const shabbatPrayers = [
    { name: 'קבלת שבת מוקדמת', time: '17:30' },
    { name: 'מנחה וקבלת שבת', time: kabalatTime },
    { name: 'שחרית א׳', time: '06:45' },
    { name: 'שחרית ב׳', time: '08:30' },
    { name: 'מנחה גדולה', time: '12:30' },
    { name: 'מנחה', time: minchaTime },
    { name: 'ערבית מוצ״ש', time: havdalaTime }
  ];
  
  // Generate simulated Shabbat data using current data as template
  return {
    ...currentShabbatData,
    candlesPT: candleTime,
    candlesTA: format(new Date(`2025-01-01T${candleTime}`), 'HH:mm'),
    havdala: havdalaTime,
    prayers: shabbatPrayers
  };
};
