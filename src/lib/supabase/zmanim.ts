
// Re-export all functionality from the service files
export { getTodayZmanim, getZmanimForSpecificDate } from './services/zmanimQueries';
export { getZmanimForDate, getZmanimForWeek, getZmanimDatabase, getHolidaysDatabase } from './services/zmanimQueries';
export * from './services/shabbatQueries';
export * from './services/holidayQueries';
export { formatTimeFromDB } from './utils/timeFormatting';

// Direct implementation of getZmanimForWeek to fix path issues
export const getZmanimForWeek = async (startDate: string, endDate: string) => {
  // Import directly from the database module to ensure we're using the correct function
  const { getZmanimForWeek: fetchWeeklyZmanim } = await import('@/lib/database/queries/weeklyZmanim');
  return fetchWeeklyZmanim(startDate, endDate);
};
