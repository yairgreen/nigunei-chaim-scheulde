
/**
 * Functions for simulating Hebrew date data
 */

// Generate a Hebrew date based on the selected date
export const simulateHebrewDate = (selectedDate: Date): string => {
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
  // This better simulates Hebrew date variations based on selected date
  const hebrewMonthIndex = (month + Math.floor(day / 10)) % 12;
  const hebrewMonth = hebrewMonths[hebrewMonthIndex];
  
  // Adjust Hebrew day based on selected date for better simulation
  const hebrewDay = ((day + selectedDate.getDay()) % 29) + 1;
  
  // Current Hebrew year (approximation)
  const hebrewYear = year + 3761;
  
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
  
  // Use a different Hebrew year abbreviation for simulation
  const hebrewYearCode = getHebrewYearCode(selectedDate);
  
  return `${hebrewDayStr} ${hebrewMonth} ${hebrewYearCode}`;
};

// Helper to convert digit to Hebrew character
const getHebrewDayChar = (digit: number): string => {
  const hebrewChars = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט'];
  return hebrewChars[digit - 1] || '';
};

// Generate different Hebrew year codes based on the date for better simulation
const getHebrewYearCode = (date: Date): string => {
  const hebrewYearCodes = ['תשפ״ג', 'תשפ״ד', 'תשפ״ה', 'תשפ״ו'];
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  
  // Use the day of year to select a Hebrew year code for variety
  return hebrewYearCodes[dayOfYear % hebrewYearCodes.length];
};
