
import { HebrewDateValidationResult } from '../types/hebrewDateTypes';
import { fetchRealHebrewDate } from './hebrewDateApi';

export const validateHebrewDate = async (
  gregorianDate: Date,
  hebrewDate: string
): Promise<HebrewDateValidationResult> => {
  try {
    const apiHebrewDate = await fetchRealHebrewDate(gregorianDate);
    return {
      isValid: apiHebrewDate === hebrewDate,
      expectedDate: apiHebrewDate,
      actualDate: hebrewDate
    };
  } catch (error) {
    console.error("Error validating Hebrew date:", error);
    return {
      isValid: false,
      expectedDate: "Unknown (API error)",
      actualDate: hebrewDate
    };
  }
};
