
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
    // Removed automatic scheduling - manual refresh only
  } catch (error) {
    console.error('Failed to initialize application:', error);
  }
};

// For testing purposes - force an immediate update
export const forceUpdate = async () => {
  try {
    console.log('Starting forced update of all data...');
    
    // Update zmanim database first
    console.log('Updating zmanim database...');
    await updateDatabase();
    
    // Update Shabbat information
    console.log('Updating Shabbat information...');
    await updateShabbatInfo();
    
    // Update prayer times
    console.log('Updating prayer times...');
    await updatePrayerTimes();
    
    // Dispatch events to notify components
    window.dispatchEvent(new CustomEvent('zmanim-updated'));
    window.dispatchEvent(new CustomEvent('shabbat-updated'));
    window.dispatchEvent(new CustomEvent('prayers-updated'));
    
    console.log('All updates completed successfully');
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
