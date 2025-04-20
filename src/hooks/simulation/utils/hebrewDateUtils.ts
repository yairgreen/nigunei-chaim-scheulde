
const getHebrewDayChar = (digit: number): string => {
  const hebrewChars = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט'];
  return hebrewChars[digit - 1] || '';
};

const getHebrewYearLastLetter = (year: number): string => {
  const lastDigit = year % 10;
  const hebrewLastDigits = ['ה', 'ו', 'ז', 'ח', 'ט'];
  return hebrewLastDigits[lastDigit - 5] || 'ה';
};

export const simulateHebrewDate = (selectedDate: Date): string => {
  const day = selectedDate.getDate();
  const month = selectedDate.getMonth();
  const year = selectedDate.getFullYear();
  
  const hebrewMonths = [
    'טבת', 'שבט', 'אדר', 'ניסן', 'אייר', 'סיון', 
    'תמוז', 'אב', 'אלול', 'תשרי', 'חשון', 'כסלו'
  ];
  
  let hebrewMonthIndex;
  
  if (year === 2025 && month === 2) {
    hebrewMonthIndex = 2;
  } else {
    hebrewMonthIndex = (month + 3) % 12;
  }
  
  let hebrewMonth = hebrewMonths[hebrewMonthIndex];
  let hebrewDay;
  
  if (year === 2025 && month === 2) {
    hebrewDay = day + 13;
    if (hebrewDay > 29) {
      hebrewDay = hebrewDay - 29;
      if (hebrewDay > 0) {
        hebrewMonth = 'ניסן';
      }
    }
  } else {
    hebrewDay = ((day + 11) % 30) + 1;
  }
  
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
  
  const hebrewYearOffset = 5785 - 2025;
  const hebrewYear = (month >= 8) ? 
    year + hebrewYearOffset + 1 : 
    year + hebrewYearOffset;
  
  const hebrewYearStr = 'תשפ״' + getHebrewYearLastLetter(hebrewYear);
  
  return `${hebrewDayStr} ${hebrewMonth} ${hebrewYearStr}`;
};
