
// Time formatting utilities
export const formatTimeFromDB = (timeStr: string | null): string => {
  if (!timeStr) return '';
  
  try {
    // Check if already in HH:MM format
    if (timeStr.match(/^\d{2}:\d{2}$/)) return timeStr;
    
    // Check if in HH:MM:SS format
    const match = timeStr.match(/^(\d{2}):(\d{2}):\d{2}$/);
    if (match) {
      return `${match[1]}:${match[2]}`;
    }
    
    // Try to parse as date
    const date = new Date(timeStr);
    if (!isNaN(date.getTime())) {
      return date.toLocaleTimeString('he-IL', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    }
    
    return timeStr;
  } catch (error) {
    console.error('Error formatting time from database:', error);
    return timeStr;
  }
};
