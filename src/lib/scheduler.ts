
import { 
  initDatabase, 
  updateDatabase, 
  updateShabbatInfo,
  fetchDailyZmanim,
  fetchShabbat,
  getZmanimDatabase
} from './database';
import { format } from 'date-fns';

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
  // Schedule daily update at 00:00
  scheduleDailyUpdate();
  
  // Schedule weekly Shabbat update (Sundays at 04:00)
  scheduleWeeklyUpdate();
};

// Schedule daily database update
const scheduleDailyUpdate = () => {
  const now = new Date();
  const midnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1, // Tomorrow
    0, // 00:00 hours
    0, // 00 minutes
    0
  );
  
  // Calculate milliseconds until midnight
  const msUntilMidnight = midnight.getTime() - now.getTime();
  
  console.log(`Daily update scheduled for ${midnight.toLocaleString()}, in ${msUntilMidnight / 1000 / 60} minutes`);
  
  // Set a timeout for the next update
  setTimeout(() => {
    // Update the database
    updateDatabase()
      .then(() => {
        console.log('Daily database update completed at 00:00');
        // Schedule the next update
        scheduleDailyUpdate();
      })
      .catch(error => {
        console.error('Error during daily update:', error);
        // Try again in 10 minutes
        setTimeout(scheduleDailyUpdate, 10 * 60 * 1000);
      });
  }, msUntilMidnight);
  
  // Schedule prayer times update at 00:01
  const prayerUpdateTime = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1, // Tomorrow
    0, // 00:00 hours
    1, // 01 minutes
    0
  );
  
  const msUntilPrayerUpdate = prayerUpdateTime.getTime() - now.getTime();
  
  console.log(`Prayer times update scheduled for ${prayerUpdateTime.toLocaleString()}, in ${msUntilPrayerUpdate / 1000 / 60} minutes`);
  
  setTimeout(() => {
    // Recalculate prayer times based on fresh zmanim
    console.log('Recalculating prayer times at 00:01');
    // This will happen automatically due to how the hooks are structured
  }, msUntilPrayerUpdate);
};

// Schedule weekly Shabbat update (Sundays at 04:00)
const scheduleWeeklyUpdate = () => {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 is Sunday
  
  // Calculate days until next Sunday
  const daysUntilSunday = dayOfWeek === 0 ? 
    (now.getHours() >= 4 ? 7 : 0) : // If it's already Sunday after 4am, schedule for next Sunday
    7 - dayOfWeek; // Days until next Sunday
  
  const nextUpdate = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + daysUntilSunday,
    4, // 04:00 hours
    0, // 00 minutes
    0
  );
  
  // Calculate milliseconds until next update
  const msUntilUpdate = nextUpdate.getTime() - now.getTime();
  
  console.log(`Weekly Shabbat update scheduled for ${nextUpdate.toLocaleString()}, in ${msUntilUpdate / 1000 / 60 / 60} hours`);
  
  // Set a timeout for the next update
  setTimeout(() => {
    // Update Shabbat information
    updateShabbatInfo()
      .then(() => {
        console.log('Weekly Shabbat update completed');
        // Schedule the next update
        scheduleWeeklyUpdate();
      })
      .catch(error => {
        console.error('Error during weekly Shabbat update:', error);
        // Try again in 1 hour
        setTimeout(scheduleWeeklyUpdate, 60 * 60 * 1000);
      });
  }, msUntilUpdate);
};

// For testing and admin page - force an immediate update with logging
export const forceUpdate = async () => {
  console.log('=== FORCE UPDATE STARTED ===');
  
  try {
    // First load today's zmanim
    const today = format(new Date(), 'yyyy-MM-dd');
    console.log(`Fetching zmanim for today (${today})...`);
    
    const todayZmanim = await fetchDailyZmanim(today);
    console.log('Today\'s zmanim data:', todayZmanim);
    
    // Calculate prayer times based on this data
    console.log('\n=== PRAYER TIME CALCULATION ===');
    console.log('Getting zmanim database for prayer time calculation');
    
    const zmanimDatabase = getZmanimDatabase();
    console.log(`Database has ${zmanimDatabase.length} entries`);
    
    // Force Shabbat data refresh
    console.log('\n=== SHABBAT DATA REFRESH ===');
    const shabbatData = await fetchShabbat();
    console.log('Updated Shabbat data:', shabbatData);
    
    return {
      success: true,
      zmanim: todayZmanim,
      shabbatData: shabbatData[0] || null
    };
  } catch (error) {
    console.error('Forced update failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  } finally {
    console.log('=== FORCE UPDATE COMPLETED ===');
  }
};
