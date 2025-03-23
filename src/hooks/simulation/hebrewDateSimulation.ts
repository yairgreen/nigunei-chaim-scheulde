
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
    'טבת', 'שבט', 'אדר', 'ניסן', 'אייר', 'סיון', 
    'תמוז', 'אב', 'אלול', 'תשרי', 'חשון', 'כסלו'
  ];
  
  // Better approximation of Hebrew month based on Gregorian date
  // This is still a simplified approach but gives more realistic results
  const hebrewMonthIndex = (month + 3) % 12;
  const hebrewMonth = hebrewMonths[hebrewMonthIndex];
  
  // Adjust Hebrew day based on selected date for better simulation
  // The Hebrew date is usually 10-12 days ahead of the Gregorian date
  // But we need to wrap around at the end of the month
  const hebrewDay = ((day + 11) % 30) + 1;
  
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
  
  // Hebrew year changes around Rosh Hashanah (Sep-Oct)
  // Determine which Hebrew year to use based on current month
  const hebrewYearOffset = 5785 - 2025; // Difference between Hebrew 5785 and Gregorian 2025
  
  // Determine Hebrew year based on month
  // After September (month 8), we're in the next Hebrew year
  const hebrewYear = (month >= 8) ? 
    year + hebrewYearOffset + 1 : 
    year + hebrewYearOffset;
  
  // Format Hebrew year (only show the last two digits with geresh)
  const hebrewYearStr = 'תשפ״' + getHebrewYearLastLetter(hebrewYear);
  
  return `${hebrewDayStr} ${hebrewMonth} ${hebrewYearStr}`;
};

// Helper to convert digit to Hebrew character
const getHebrewDayChar = (digit: number): string => {
  const hebrewChars = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט'];
  return hebrewChars[digit - 1] || '';
};

// Helper to get the last letter of the Hebrew year (for 5785-5789)
const getHebrewYearLastLetter = (year: number): string => {
  const lastDigit = year % 10;
  // Map 5-9 to ה-ט
  const hebrewLastDigits = ['ה', 'ו', 'ז', 'ח', 'ט'];
  return hebrewLastDigits[lastDigit - 5] || 'ה';
};
