
import { format } from 'date-fns';

// Database state variables
let lastUpdated: Date | null = null;

// Format time from ISO date string
export const formatTime = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return format(date, 'HH:mm');
  } catch (e) {
    console.error('Error formatting time:', e);
    return '';
  }
};

// Get database last updated timestamp
export const getLastUpdated = (): Date | null => {
  return lastUpdated;
};

// Set database last updated timestamp
export const setLastUpdated = (date: Date): void => {
  lastUpdated = date;
};
