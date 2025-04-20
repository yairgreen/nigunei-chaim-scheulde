
import { fetchRealHebrewDate } from '../services/hebrewDateApi';
import { simulateHebrewDate } from './hebrewDateUtils';
import { validateHebrewDate } from '../services/hebrewDateValidation';

export const runHebrewDateTests = async () => {
  const testCases = [
    { date: new Date(2025, 2, 23), expected: "כ״ג אדר תשפ״ה" },
    { date: new Date(2025, 2, 25), expected: "כ״ה אדר תשפ״ה" },
    { date: new Date(2025, 2, 28), expected: "כ״ח אדר תשפ״ה" },
    { date: new Date(2025, 8, 25), expected: "כ״ה אלול תשפ״ה" },
    { date: new Date(2025, 9, 5), expected: "ה תשרי תשפ״ו" },
  ];
  
  console.log("Running Hebrew date simulation tests:");
  
  console.log("Testing simulated Hebrew dates:");
  testCases.forEach((test, index) => {
    const result = simulateHebrewDate(test.date);
    const passed = result === test.expected;
    console.log(`Test ${index + 1}: ${passed ? 'PASSED' : 'FAILED'} - Date: ${test.date.toLocaleDateString()}`);
    console.log(`  Expected: ${test.expected}`);
    console.log(`  Actual: ${result}`);
  });
  
  console.log("\nTesting API Hebrew dates:");
  try {
    const apiTestDate = new Date(2025, 2, 25);
    const apiResult = await fetchRealHebrewDate(apiTestDate);
    console.log(`API result for ${apiTestDate.toLocaleDateString()}: ${apiResult}`);
    
    const validation = await validateHebrewDate(apiTestDate, apiResult);
    console.log(`Validation result: ${validation.isValid ? 'PASSED' : 'FAILED'}`);
    console.log(`  Expected: ${validation.expectedDate}`);
    console.log(`  Actual: ${validation.actualDate}`);
  } catch (error) {
    console.error("Error testing API:", error);
  }
};
