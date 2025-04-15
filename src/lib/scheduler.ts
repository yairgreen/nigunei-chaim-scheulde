
import { 
  initDatabase, 
  updateDatabase, 
  updateShabbatInfo 
} from './database';

// Initialize the database when the app loads
export const initializeApp = async () => {
  console.log('Initializing application data...');
  try {
    await initDatabase();
    scheduleUpdates();
  } catch (error) {
    console.error('Failed to initialize application:', error);
  }
};

// Schedule automatic updates
const scheduleUpdates = () => {
  // Schedule daily zmanim update at 00:00
  scheduleDailyUpdate();
  
  // Schedule weekly prayer and Shabbat updates (Sundays at 05:00)
  scheduleWeeklyUpdate();
};

// Schedule daily zmanim database update
const scheduleDailyUpdate = () => {
  const now = new Date();
  const nextUpdate = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1, // Tomorrow
    0, // 00:00 hours
    0, // 00 minutes
    0
  );
  
  // Calculate milliseconds until next update
  const msUntilUpdate = nextUpdate.getTime() - now.getTime();
  
  console.log(`Daily zmanim update scheduled for ${nextUpdate.toLocaleString()}, in ${msUntilUpdate / 1000 / 60} minutes`);
  
  // Set a timeout for the next update
  setTimeout(() => {
    // Update the zmanim database
    updateDatabase()
      .then(() => {
        console.log('Daily zmanim database update completed');
        // Schedule the next update
        scheduleDailyUpdate();
      })
      .catch(error => {
        console.error('Error during daily update:', error);
        // Try again in 10 minutes
        setTimeout(scheduleDailyUpdate, 10 * 60 * 1000);
      });
  }, msUntilUpdate);
};

// Schedule weekly prayer and Shabbat updates (Sundays at 05:00)
const scheduleWeeklyUpdate = () => {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 is Sunday
  
  // Calculate days until next Sunday
  const daysUntilSunday = dayOfWeek === 0 ? 
    (now.getHours() >= 5 ? 7 : 0) : // If it's already Sunday after 5am, schedule for next Sunday
    7 - dayOfWeek; // Days until next Sunday
  
  const nextUpdate = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + daysUntilSunday,
    5, // 05:00 hours
    0, // 00 minutes
    0
  );
  
  // Calculate milliseconds until next update
  const msUntilUpdate = nextUpdate.getTime() - now.getTime();
  
  console.log(`Weekly prayer and Shabbat update scheduled for ${nextUpdate.toLocaleString()}, in ${msUntilUpdate / 1000 / 60 / 60} hours`);
  
  // Set a timeout for the next update
  setTimeout(() => {
    // Update Shabbat and prayer information
    Promise.all([
      updateShabbatInfo(),
      updatePrayerTimes()
    ])
      .then(() => {
        console.log('Weekly Shabbat and prayer times update completed');
        // Schedule the next update
        scheduleWeeklyUpdate();
      })
      .catch(error => {
        console.error('Error during weekly update:', error);
        // Try again in 1 hour
        setTimeout(scheduleWeeklyUpdate, 60 * 60 * 1000);
      });
  }, msUntilUpdate);
};

// For testing purposes - force an immediate update
export const forceUpdate = async () => {
  try {
    await updateDatabase();
    await updateShabbatInfo();
    await updatePrayerTimes();
    return true;
  } catch (error) {
    console.error('Forced update failed:', error);
    return false;
  }
};

// Helper function to update prayer times
const updatePrayerTimes = async () => {
  try {
    // Update prayer times based on the rules we defined
    // This will be implemented in the database module
    await updateDatabase();
    return true;
  } catch (error) {
    console.error('Error updating prayer times:', error);
    return false;
  }
};
