
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
