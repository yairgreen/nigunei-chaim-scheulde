
import { format } from 'date-fns';
import { getZmanimDatabase } from '@/lib/database/zmanim';
import { calculateWeeklyMinchaTime, calculateWeeklyArvitTime } from '@/lib/database/prayers';

/**
 * Functions for simulating prayer schedule data
 */

// Simulate prayer times based on the selected date
export const simulatePrayerTimes = (selectedDate: Date): Array<{ name: string; time: string }> => {
  const zmanimDatabase = getZmanimDatabase();
  const dayOfWeek = selectedDate.getDay();
  const startOfWeek = new Date(selectedDate);
  startOfWeek.setDate(selectedDate.getDate() - dayOfWeek);
  
  // Check if it's Shabbat (dayOfWeek === 6)
  if (dayOfWeek === 6) {
    // For Shabbat, we'll use the Shabbat prayers from the Shabbat simulation
    // Just return an empty array here as the Shabbat schedule will be displayed separately
    return [];
  }
  
  // Check if it's Friday (dayOfWeek === 5)
  if (dayOfWeek === 5) {
    // Special case for Friday (no afternoon/evening prayers)
    // Check if we're in daylight saving time 
    const month = selectedDate.getMonth(); // 0-11 (Jan-Dec)
    const isDaylightSaving = month >= 2 && month <= 9; // March through October
    
    return [
      { name: 'שחרית א׳', time: '06:15' },
      { name: 'שחרית ב׳', time: '07:00' },
      { name: 'שחרית ג׳', time: '08:00' },
      { name: 'מנחה גדולה', time: isDaylightSaving ? '13:20' : '12:30' },
      { name: 'מנחה ערב שבת', time: '13:30' }
    ];
  }
  
  // Get this week's days (Sun-Thu)
  const weekDays = [];
  for (let i = 0; i < 5; i++) {
    const weekDate = new Date(startOfWeek);
    weekDate.setDate(startOfWeek.getDate() + i);
    weekDays.push(format(weekDate, 'yyyy-MM-dd'));
  }
  
  // Filter zmanim for this week
  const zmanimForWeek = zmanimDatabase.filter(item => weekDays.includes(item.date));
  
  // If no actual zmanim data, create synthetic data for simulation
  if (zmanimForWeek.length === 0) {
    return generateSyntheticPrayerTimes(selectedDate, weekDays);
  } else {
    return generatePrayerTimesFromZmanim(selectedDate, zmanimForWeek);
  }
};

// Generate prayer times from synthetic data
const generateSyntheticPrayerTimes = (selectedDate: Date, weekDays: string[]): Array<{ name: string; time: string }> => {
  const syntheticZmanimForWeek = weekDays.map(date => {
    const dateParts = date.split('-');
    const day = parseInt(dateParts[2]);
    const month = parseInt(dateParts[1]) - 1;
    
    // Simple seasonal adjustment for sunset
    let sunsetHour = 17;
    if (month >= 3 && month <= 8) { // Spring and Summer
      sunsetHour = 19 - (Math.floor(day / 15) % 2);
    } else { // Fall and Winter
      sunsetHour = 16 + (Math.floor(day / 15) % 2);
    }

    // Calculate tzait_hakochavim (stars out) as approximately 18-25 minutes after sunset
    const tzaitMinutes = 20 + (day % 6); // Between 20-25 minutes after sunset
    let tzaitHour = sunsetHour;
    let tzaitMinute = 50 + (day % 10) + tzaitMinutes;
    
    if (tzaitMinute >= 60) {
      tzaitHour += 1;
      tzaitMinute -= 60;
    }
    
    // Create synthetic zmanim data for this day with some variation
    return {
      date,
      sunset: `${sunsetHour}:${50 + (day % 10)}`,
      tzait_hakochavim: `${tzaitHour}:${String(tzaitMinute).padStart(2, '0')}`
    };
  });

  // Calculate mincha and arvit times for the simulated week
  const simulatedMinchaTime = calculateWeeklyMinchaTime(syntheticZmanimForWeek);
  const simulatedArvitTime = calculateWeeklyArvitTime(syntheticZmanimForWeek);
  
  // Check if selected date is Rosh Chodesh (simplified for simulation)
  const isSelectedDateRoshChodesh = selectedDate.getDate() === 1 || selectedDate.getDate() === 30;
  
  // Check if we're in daylight saving time 
  const month = selectedDate.getMonth(); // 0-11 (Jan-Dec)
  const isDaylightSaving = month >= 2 && month <= 9; // March through October
  
  // Main daily classes for weekdays - ensure they appear in the simulation
  const mainClasses = [
    { name: 'שחרית א׳', time: isSelectedDateRoshChodesh ? '06:00' : '06:15' },
    { name: 'שחרית ב׳', time: '07:00' },
    { name: 'שחרית ג׳', time: '08:00' },
    { name: 'מנחה גדולה', time: isDaylightSaving ? '13:20' : '12:30' },
    { name: 'מנחה', time: simulatedMinchaTime },
    { name: 'ערבית א׳', time: simulatedArvitTime },
    { name: 'ערבית ב׳', time: '20:45' }
  ];
  
  return mainClasses;
};

// Generate prayer times from real zmanim data
const generatePrayerTimesFromZmanim = (selectedDate: Date, zmanimForWeek: any[]): Array<{ name: string; time: string }> => {
  // Calculate mincha and arvit times from actual zmanim data
  const simulatedMinchaTime = calculateWeeklyMinchaTime(zmanimForWeek);
  const simulatedArvitTime = calculateWeeklyArvitTime(zmanimForWeek);
  
  // Check if selected date is Rosh Chodesh (simplified for simulation)
  const isSelectedDateRoshChodesh = selectedDate.getDate() === 1 || selectedDate.getDate() === 30;
  
  // Check if we're in daylight saving time 
  const month = selectedDate.getMonth(); // 0-11 (Jan-Dec)
  const isDaylightSaving = month >= 2 && month <= 9; // March through October
  
  // Friday has different times
  if (selectedDate.getDay() === 5) { // Friday
    return [
      { name: 'שחרית א׳', time: isSelectedDateRoshChodesh ? '06:00' : '06:15' },
      { name: 'שחרית ב׳', time: '07:00' },
      { name: 'שחרית ג׳', time: '08:00' },
      { name: 'מנחה גדולה', time: isDaylightSaving ? '13:20' : '12:30' },
      { name: 'מנחה ערב שבת', time: '13:30' }
    ];
  }
  
  // Regular weekday
  return [
    { name: 'שחרית א׳', time: isSelectedDateRoshChodesh ? '06:00' : '06:15' },
    { name: 'שחרית ב׳', time: '07:00' },
    { name: 'שחרית ג׳', time: '08:00' },
    { name: 'מנחה גדולה', time: isDaylightSaving ? '13:20' : '12:30' },
    { name: 'מנחה', time: simulatedMinchaTime },
    { name: 'ערבית א׳', time: simulatedArvitTime },
    { name: 'ערבית ב׳', time: '20:45' }
  ];
};
