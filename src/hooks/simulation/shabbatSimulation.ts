import { format } from 'date-fns';

/**
 * Functions for simulating Shabbat data
 */

// Simulate Shabbat data based on the selected date
export const simulateShabbatData = (selectedDate: Date, currentShabbatData: any) => {
  // Check if the selected date is Shabbat
  const isShabbat = selectedDate.getDay() === 6; // 6 is Saturday
  
  // If not Shabbat, return the current data unchanged
  if (!isShabbat) {
    return currentShabbatData;
  }
  
  // This would be more sophisticated in a production app
  // Simple logic to adjust Shabbat times based on month for simulation
  const month = selectedDate.getMonth();
  let candleTime, havdalaTime;
  
  if (month >= 3 && month <= 8) { // Spring and Summer
    candleTime = `19:${15 + (selectedDate.getDate() % 10)}`;
    havdalaTime = `20:${25 + (selectedDate.getDate() % 5)}`;
  } else { // Fall and Winter
    candleTime = `16:${30 + (selectedDate.getDate() % 10)}`;
    havdalaTime = `17:${40 + (selectedDate.getDate() % 5)}`;
  }
  
  // Generate simulated Shabbat data using current data as template
  return {
    ...currentShabbatData,
    candlesPT: candleTime,
    candlesTA: format(new Date(`2025-01-01T${candleTime}`), 'HH:mm'),
    havdala: havdalaTime,
    prayers: currentShabbatData.prayers
  };
};
