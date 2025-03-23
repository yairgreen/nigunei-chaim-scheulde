import { useState, useEffect } from 'react';
import { format, addDays } from 'date-fns';
import { getZmanimDatabase } from '@/lib/database/zmanim';
import { calculateWeeklyMinchaTime, calculateWeeklyArvitTime } from '@/lib/database/prayers';
import { useScheduleData } from '@/hooks/useScheduleData';

// Types for simulation data
interface SimulationData {
  simulatedDailyTimes: Array<{ name: string; time: string }>;
  simulatedDailyPrayers: Array<{ name: string; time: string }>;
  simulatedShabbatData: {
    title: string;
    subtitle: string;
    candlesPT: string;
    candlesTA: string;
    havdala: string;
    prayers: Array<{ name: string; time: string }>;
    classes: Array<{ name: string; time: string }>;
  };
  simulatedHebrewDate: string;
  simulatedGregorianDate: string;
}

export function useSimulationData(date: Date): SimulationData {
  const { dailyTimes, dailyPrayers, dailyClasses, shabbatData } = useScheduleData();
  const [simulatedDailyTimes, setSimulatedDailyTimes] = useState(dailyTimes);
  const [simulatedDailyPrayers, setSimulatedDailyPrayers] = useState(dailyPrayers);
  const [simulatedShabbatData, setSimulatedShabbatData] = useState(shabbatData);
  const [simulatedHebrewDate, setSimulatedHebrewDate] = useState<string>("");
  const [simulatedGregorianDate, setSimulatedGregorianDate] = useState<string>("");

  useEffect(() => {
    // Update the simulated data when the date changes
    simulateDataForDate(date);
  }, [date]); // Important: react to changes in date

  const simulateDataForDate = (selectedDate: Date) => {
    // Update Hebrew date based on selected date
    setSimulatedHebrewDate(generateHebrewDate(selectedDate));
    setSimulatedGregorianDate(format(selectedDate, 'dd/MM/yyyy'));
    
    simulateZmanimData(selectedDate);
    simulatePrayerTimes(selectedDate);
    simulateShabbatData(selectedDate);
  };
  
  // Generate a Hebrew date based on the selected date (simplified simulation)
  const generateHebrewDate = (selectedDate: Date): string => {
    // This is a simplified algorithm - in a real app, this would use a proper Hebrew calendar library
    const day = selectedDate.getDate();
    const month = selectedDate.getMonth();
    const year = selectedDate.getFullYear();
    
    // Hebrew month names (simplified)
    const hebrewMonths = [
      'ניסן', 'אייר', 'סיון', 'תמוז', 'אב', 'אלול',
      'תשרי', 'חשון', 'כסלו', 'טבת', 'שבט', 'אדר'
    ];
    
    // Determine Hebrew month based on Gregorian date (very simplified)
    // In reality, this requires complex calculations with the Hebrew calendar
    let hebrewMonth = (month + 1) % 12; // Shift by 1 for simplified Hebrew months
    let hebrewDay = ((day + 10) % 29) + 1; // Simplified simulation
    let hebrewYear = year + 3761; // Simplified Hebrew year
    
    // Format the Hebrew date (this is a very simplified representation)
    // Hebrew dates use different formats for different day numbers
    let hebrewDayStr;
    if (hebrewDay === 15 || hebrewDay === 16) {
      hebrewDayStr = 'ט״ו';
    } else if (hebrewDay > 10 && hebrewDay < 20) {
      hebrewDayStr = 'י״' + getHebrewDayChar(hebrewDay - 10);
    } else if (hebrewDay === 20) {
      hebrewDayStr = 'כ׳';
    } else if (hebrewDay > 20) {
      hebrewDayStr = 'כ״' + getHebrewDayChar(hebrewDay - 20);
    } else {
      hebrewDayStr = getHebrewDayChar(hebrewDay);
    }
    
    return `${hebrewDayStr} ${hebrewMonths[hebrewMonth]} תשפ״ה`;
  };
  
  // Helper to convert digit to Hebrew character
  const getHebrewDayChar = (digit: number): string => {
    const hebrewChars = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט'];
    return hebrewChars[digit - 1] || '';
  };
  
  // Simulate zmanim data based on the selected date
  const simulateZmanimData = (selectedDate: Date) => {
    const zmanimDatabase = getZmanimDatabase();
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    
    // Find zmanim for the selected date or nearby dates
    const selectedDateZmanim = zmanimDatabase.find(z => z.date === formattedDate);
    
    // Simulate daily times
    if (selectedDateZmanim) {
      // Use actual data from the database if available
      const simulatedTimes = [
        { name: 'עלות השחר (72 ד\')', time: selectedDateZmanim.alotHaShachar },
        { name: 'הנץ החמה', time: selectedDateZmanim.sunrise },
        { name: 'זמן טלית ותפילין', time: selectedDateZmanim.misheyakir },
        { name: 'סוף זמן ק"ש (מג״א)', time: selectedDateZmanim.sofZmanShmaMGA },
        { name: 'סוף זמן ק"ש (גר״א)', time: selectedDateZmanim.sofZmanShma },
        { name: 'סוף זמן תפילה (מג״א)', time: selectedDateZmanim.sofZmanTfillaMGA },
        { name: 'סוף זמן תפילה (גר"א)', time: selectedDateZmanim.sofZmanTfilla },
        { name: 'חצות היום והלילה', time: selectedDateZmanim.chatzot },
        { name: 'זמן מנחה גדולה', time: selectedDateZmanim.minchaGedola },
        { name: 'פלג המנחה', time: selectedDateZmanim.plagHaMincha },
        { name: 'שקיעה', time: selectedDateZmanim.sunset },
        { name: 'צאת הכוכבים', time: selectedDateZmanim.beinHaShmashos }
      ];
      setSimulatedDailyTimes(simulatedTimes);
    } else {
      // Generate simulated times if no zmanim data is found
      const day = selectedDate.getDate();
      const month = selectedDate.getMonth();
      
      // Simulate seasonal changes - earlier sunrise in summer, later in winter
      let sunriseHour = 5;
      let sunsetHour = 17;
      
      // Simple seasonal adjustment
      if (month >= 3 && month <= 8) { // Spring and Summer (April-September)
        sunriseHour = 5 + (Math.floor(day / 10) % 2); // Varies between 5 and 6
        sunsetHour = 19 - (Math.floor(day / 15) % 2); // Varies between 18 and 19
      } else { // Fall and Winter (October-March)
        sunriseHour = 6 + (Math.floor(day / 10) % 2); // Varies between 6 and 7
        sunsetHour = 16 + (Math.floor(day / 15) % 2); // Varies between 16 and 17
      }
      
      // Format times with leading zeros
      const formatTimeWithLeadingZeros = (hour: number, minute: number): string => {
        return `${hour < 10 ? '0' + hour : hour}:${minute < 10 ? '0' + minute : minute}`;
      };
      
      // Create simulated times with proper formatting
      const simulatedTimes = [
        { name: 'עלות השחר (72 ד\')', time: formatTimeWithLeadingZeros(sunriseHour - 1, 30 + (day % 20)) },
        { name: 'הנץ החמה', time: formatTimeWithLeadingZeros(sunriseHour, 40 + (day % 20)) },
        { name: 'זמן טלית ותפילין', time: formatTimeWithLeadingZeros(sunriseHour - 1, 50 + (day % 10)) },
        { name: 'סוף זמן ק"ש (מג״א)', time: formatTimeWithLeadingZeros(sunriseHour + 2, 10 + (day % 15)) },
        { name: 'סוף זמן ק"ש (גר״א)', time: formatTimeWithLeadingZeros(sunriseHour + 3, 5 + (day % 15)) }, 
        { name: 'סוף זמן תפילה (מג״א)', time: formatTimeWithLeadingZeros(sunriseHour + 3, 40 + (day % 10)) },
        { name: 'סוף זמן תפילה (גר"א)', time: formatTimeWithLeadingZeros(sunriseHour + 4, 5 + (day % 10)) },
        { name: 'חצות היום והלילה', time: formatTimeWithLeadingZeros(11 + (day % 2), 45 + (day % 5)) },
        { name: 'זמן מנחה גדולה', time: formatTimeWithLeadingZeros(12 + (day % 2), 15 + (day % 5)) },
        { name: 'פלג המנחה', time: formatTimeWithLeadingZeros(sunsetHour - 2, 30 + (day % 10)) },
        { name: 'שקיעה', time: formatTimeWithLeadingZeros(sunsetHour, 50 + (day % 10)) },
        { name: 'צאת הכוכבים', time: formatTimeWithLeadingZeros(sunsetHour + 1, 20 + (day % 5)) }
      ];
      
      setSimulatedDailyTimes(simulatedTimes);
    }
  };
  
  const simulatePrayerTimes = (selectedDate: Date) => {
    const zmanimDatabase = getZmanimDatabase();
    const dayOfWeek = selectedDate.getDay();
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(selectedDate.getDate() - dayOfWeek);
    
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
        
        // Create synthetic zmanim data for this day with some variation
        return {
          date,
          sunset: `${sunsetHour}:${50 + (day % 10)}`
        };
      });

      // Calculate mincha and arvit times for the simulated week
      const simulatedMinchaTime = calculateWeeklyMinchaTime(syntheticZmanimForWeek);
      const simulatedArvitTime = calculateWeeklyArvitTime(syntheticZmanimForWeek);
      
      // Simulate prayer times
      const isSelectedDateRoshChodesh = false; // This would come from an API in a real implementation
      const simulatedPrayers = [
        { name: 'שחרית א׳', time: isSelectedDateRoshChodesh ? '06:00' : '06:15' },
        { name: 'שחרית ב׳', time: '07:00' },
        { name: 'שחרית ג׳', time: '08:00' },
        { name: 'מנחה גדולה', time: '12:30' },
        { name: 'מנחה', time: simulatedMinchaTime },
        { name: 'ערבית א׳', time: simulatedArvitTime },
        { name: 'ערבית ב׳', time: '20:45' }
      ];
      setSimulatedDailyPrayers(simulatedPrayers);
    } else {
      // Calculate mincha and arvit times for the actual zmanim data
      const simulatedMinchaTime = calculateWeeklyMinchaTime(zmanimForWeek);
      const simulatedArvitTime = calculateWeeklyArvitTime(zmanimForWeek);
      
      // Simulate prayer times
      const isSelectedDateRoshChodesh = false; // This would come from an API in a real implementation
      const simulatedPrayers = [
        { name: 'שחרית א׳', time: isSelectedDateRoshChodesh ? '06:00' : '06:15' },
        { name: 'שחרית ב׳', time: '07:00' },
        { name: 'שחרית ג׳', time: '08:00' },
        { name: 'מנחה גדולה', time: '12:30' },
        { name: 'מנחה', time: simulatedMinchaTime },
        { name: 'ערבית א׳', time: simulatedArvitTime },
        { name: 'ערבית ב׳', time: '20:45' }
      ];
      setSimulatedDailyPrayers(simulatedPrayers);
    }
  };
  
  const simulateShabbatData = (selectedDate: Date) => {
    // Calculate if the selected date is Shabbat
    const isShabbat = selectedDate.getDay() === 6; // 6 is Saturday
    
    // Simulate Shabbat data if needed
    if (isShabbat) {
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
      
      const simulatedShabbatTimes = {
        ...shabbatData,
        candlesPT: candleTime,
        candlesTA: format(new Date(`2025-01-01T${candleTime}`), 'HH:mm'),
        havdala: havdalaTime,
        prayers: shabbatData.prayers
      };
      setSimulatedShabbatData(simulatedShabbatTimes);
    }
  };

  return {
    simulatedDailyTimes,
    simulatedDailyPrayers,
    simulatedShabbatData,
    simulatedHebrewDate,
    simulatedGregorianDate
  };
}
