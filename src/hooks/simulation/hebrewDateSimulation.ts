
/**
 * Functions for simulating and validating Hebrew date data
 */

// API function to fetch the real Hebrew date for a given Gregorian date
export const fetchRealHebrewDate = async (gregorianDate: Date): Promise<string> => {
  try {
    // Format the date as YYYY-MM-DD for API
    const year = gregorianDate.getFullYear();
    const month = String(gregorianDate.getMonth() + 1).padStart(2, '0');
    const day = String(gregorianDate.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    
    // Build the URL for the Hebcal API
    const url = `https://www.hebcal.com/hebcal?v=1&cfg=json&maj=on&min=on&mod=on&nx=on&start=${formattedDate}&end=${formattedDate}&c=on&ss=on&mf=on&c=on&b=40&d=on&geo=geoname&geonameid=293918&M=on&s=on`;
    
    console.log(`Fetching Hebrew date from: ${url}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch Hebrew date: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("Received Hebrew date data:", data);
    
    // Extract the Hebrew date from the response
    if (data.items && data.items.length > 0) {
      // Find the Hebrew date item
      const hebrewDateItem = data.items.find((item: any) => item.category === 'hebdate');
      
      if (hebrewDateItem && hebrewDateItem.hebrew) {
        return hebrewDateItem.hebrew;
      }
    }
    
    // If extraction fails, fall back to the simulated date
    throw new Error("Could not extract Hebrew date from API response");
  } catch (error) {
    console.error("Error fetching real Hebrew date:", error);
    // Fall back to simulated date
    return simulateHebrewDate(gregorianDate);
  }
};

/**
 * Generates a simulated Hebrew date based on the selected Gregorian date
 * This is a fallback when the API request fails
 * 
 * @param selectedDate - The Gregorian date for which to simulate a Hebrew date
 * @returns A formatted Hebrew date string
 */
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

/**
 * Unit tests for Hebrew date simulation
 * These are simple validation tests that can be run in the console
 */
export const runHebrewDateTests = () => {
  const testCases = [
    { date: new Date(2025, 2, 23), expected: "כ״ג אדר תשפ״ה" }, // March 23, 2025
    { date: new Date(2025, 2, 25), expected: "כ״ה אדר תשפ״ה" }, // March 25, 2025
    { date: new Date(2025, 8, 25), expected: "כ״ה אלול תשפ״ה" }, // September 25, 2025
    { date: new Date(2025, 9, 5), expected: "ה תשרי תשפ״ו" },   // October 5, 2025 - New Hebrew year
  ];
  
  console.log("Running Hebrew date simulation tests:");
  testCases.forEach((test, index) => {
    const result = simulateHebrewDate(test.date);
    const passed = result === test.expected;
    console.log(`Test ${index + 1}: ${passed ? 'PASSED' : 'FAILED'} - Date: ${test.date.toLocaleDateString()}`);
    console.log(`  Expected: ${test.expected}`);
    console.log(`  Actual: ${result}`);
  });
  
  console.log("Note: These are simplified tests. For accurate Hebrew dates, the API should be used.");
};

