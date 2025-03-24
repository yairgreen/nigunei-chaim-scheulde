
import { format } from 'date-fns';
import { getZmanimDatabase } from '@/lib/database/zmanim';

/**
 * Functions for simulating Zmanim (daily times) data
 */

// Simulate zmanim data based on the selected date
export const simulateZmanimData = (selectedDate: Date): Array<{ name: string; time: string }> => {
  const zmanimDatabase = getZmanimDatabase();
  const formattedDate = format(selectedDate, 'yyyy-MM-dd');
  
  // Find zmanim for the selected date or nearby dates
  const selectedDateZmanim = zmanimDatabase.find(z => z.date === formattedDate);
  
  // Simulate daily times
  if (selectedDateZmanim) {
    // Use actual data from the database if available
    return [
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
  } else {
    // Generate simulated times if no zmanim data is found
    return generateSimulatedTimes(selectedDate);
  }
};

// Generate simulated times based on season and date
const generateSimulatedTimes = (selectedDate: Date): Array<{ name: string; time: string }> => {
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
  
  // Calculate tzet time (beinHaShmashos) - typically 18-42 minutes after sunset
  const tzet = getSunsetWithMinutesAdded(sunsetHour, 50 + (day % 10), 18);
  
  // Create simulated times with proper formatting
  return [
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
    { name: 'צאת הכוכבים', time: tzet }
  ];
};

// Format times with leading zeros
const formatTimeWithLeadingZeros = (hour: number, minute: number): string => {
  return `${hour < 10 ? '0' + hour : hour}:${minute < 10 ? '0' + minute : minute}`;
};

// Calculate time with minutes added, handling hour overflow
const getSunsetWithMinutesAdded = (hour: number, minute: number, minutesToAdd: number): string => {
  let totalMinutes = hour * 60 + minute + minutesToAdd;
  const newHour = Math.floor(totalMinutes / 60);
  const newMinute = totalMinutes % 60;
  return formatTimeWithLeadingZeros(newHour, newMinute);
};
