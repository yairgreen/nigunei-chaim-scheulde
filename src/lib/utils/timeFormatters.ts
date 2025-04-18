
/**
 * Formats a time string to HH:MM format, removing seconds if present
 * Handles various input formats:
 * - HH:MM:SS
 * - HH:MM
 * - Date objects
 * - ISO strings
 */
export const formatToHHMM = (timeString: string | Date | null | undefined): string => {
  if (!timeString) return '--:--';
  
  try {
    // If it's already in HH:MM format, return as is
    if (typeof timeString === 'string' && timeString.match(/^\d{2}:\d{2}$/)) {
      return timeString;
    }
    
    // If it's a Date object, convert to string
    const timeValue = typeof timeString === 'string' ? timeString : timeString.toLocaleTimeString('he-IL');
    
    // Extract hours and minutes using regex
    const match = timeValue.match(/^(\d{2}):(\d{2})/);
    if (match) {
      return `${match[1]}:${match[2]}`;
    }
    
    // If all else fails, try to parse as date and format
    const date = new Date(timeString);
    if (!isNaN(date.getTime())) {
      return date.toLocaleTimeString('he-IL', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    }
    
    return '--:--';
  } catch (error) {
    console.error('Error formatting time:', error);
    return '--:--';
  }
};
