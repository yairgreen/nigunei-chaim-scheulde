
export interface HebrewDateSimulationResult {
  simulatedHebrewDate: string;
  simulatedGregorianDate: string;
  validationResult?: {
    isValid: boolean;
    expectedDate: string;
    actualDate: string;
  };
  isLoading: boolean;
  simulatedTodayHoliday?: string;
}

export interface HebrewDateValidationResult {
  isValid: boolean;
  expectedDate: string;
  actualDate: string;
}
