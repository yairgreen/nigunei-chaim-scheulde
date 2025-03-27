
import { format } from 'date-fns';

// Calculate mincha time based on sunset times - now 11-16 minutes before earliest sunset
export const calculateWeeklyMinchaTime = (zmanimForWeek: {date: string, sunset: string}[]): string => {
  if (zmanimForWeek.length === 0) return "17:30"; // Fallback
  
  console.log('Calculating mincha time from zmanim data:', zmanimForWeek);
  
  // Get sunset times for each day
  const sunsetTimes = zmanimForWeek.map(item => {
    if (!item.sunset) return Infinity; // Skip days without sunset data
    const [hours, minutes] = item.sunset.split(':').map(Number);
    return hours * 60 + minutes; // Convert to minutes
  });
  
  // Find earliest sunset
  const earliestSunsetMinutes = Math.min(...sunsetTimes);
  
  // If no valid sunset times were found, return default
  if (earliestSunsetMinutes === Infinity) {
    console.log('No valid sunset times found, using default mincha time');
    return "17:30";
  }
  
  console.log(`Earliest sunset: ${Math.floor(earliestSunsetMinutes/60)}:${earliestSunsetMinutes%60}`);
  
  // Calculate range: 11-16 minutes before sunset
  const latestMinchaMinutes = earliestSunsetMinutes - 11; // 11 minutes before
  const earliestMinchaMinutes = earliestSunsetMinutes - 16; // 16 minutes before
  
  console.log(`Mincha time range: ${Math.floor(earliestMinchaMinutes/60)}:${earliestMinchaMinutes%60} to ${Math.floor(latestMinchaMinutes/60)}:${latestMinchaMinutes%60}`);
  
  // Find nearest 5-minute mark within range
  const midpoint = (earliestMinchaMinutes + latestMinchaMinutes) / 2;
  const roundedMinutes = Math.round(midpoint / 5) * 5;
  
  // Ensure rounded time is within range
  const finalMinutes = Math.max(
    earliestMinchaMinutes,
    Math.min(latestMinchaMinutes, roundedMinutes)
  );
  
  console.log(`Rounded to 5-minute mark: ${Math.floor(roundedMinutes/60)}:${roundedMinutes%60}`);
  console.log(`Final mincha time: ${Math.floor(finalMinutes/60)}:${finalMinutes%60}`);
  
  // Convert back to HH:MM format
  const hours = Math.floor(finalMinutes / 60);
  const minutes = finalMinutes % 60;
  
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

// Calculate arvit time based on beinHaShmashos times
export const calculateWeeklyArvitTime = (zmanimForWeek: {date: string, sunset: string, beinHaShmashos?: string}[]): string => {
  if (zmanimForWeek.length === 0) return "18:45"; // Fallback
  
  console.log('Calculating arvit time from zmanim data:', zmanimForWeek);
  
  // Get beinHaShmashos times for each day
  const beinHaShmashosArray = zmanimForWeek
    .filter(item => !!item.beinHaShmashos && item.date)
    .map(item => {
      const [hours, minutes] = item.beinHaShmashos?.split(':').map(Number) || [0, 0];
      return {
        date: item.date,
        timeInMinutes: hours * 60 + minutes
      };
    });
  
  if (beinHaShmashosArray.length === 0) {
    // Fall back to calculating based on sunset if no beinHaShmashos data
    console.log('No beinHaShmashos data available, calculating from sunset');
    
    const sunsetTimes = zmanimForWeek
      .filter(item => !!item.sunset)
      .map(item => {
        const [hours, minutes] = item.sunset.split(':').map(Number);
        return hours * 60 + minutes + 18; // Add 18 minutes to sunset
      });
    
    if (sunsetTimes.length === 0) {
      console.log('No sunset data available, using default arvit time');
      return "18:45";
    }
    
    // Find latest sunset + 18 min
    const latestTzet = Math.max(...sunsetTimes);
    console.log(`Latest tzet time (from sunset): ${Math.floor(latestTzet/60)}:${latestTzet%60}`);
    
    // Round to the nearest 5 minutes
    const roundedMinutes = Math.ceil(latestTzet / 5) * 5;
    
    // Convert back to HH:MM format
    const hours = Math.floor(roundedMinutes / 60);
    const minutes = roundedMinutes % 60;
    
    console.log(`Rounded arvit time: ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`);
    
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }
  
  // Find latest beinHaShmashos
  const latestBeinHaShmashosInfo = beinHaShmashosArray.reduce((latest, current) => {
    return current.timeInMinutes > latest.timeInMinutes ? current : latest;
  }, beinHaShmashosArray[0]);
  
  console.log(`Latest beinHaShmashos: ${Math.floor(latestBeinHaShmashosInfo.timeInMinutes/60)}:${latestBeinHaShmashosInfo.timeInMinutes%60} on ${latestBeinHaShmashosInfo.date}`);
  
  // Calculate range: -1 minute to +4 minutes from beinHaShmashos
  const earliestArvitMinutes = latestBeinHaShmashosInfo.timeInMinutes - 1;
  const latestArvitMinutes = latestBeinHaShmashosInfo.timeInMinutes + 4;
  
  console.log(`Arvit time range: ${Math.floor(earliestArvitMinutes/60)}:${earliestArvitMinutes%60} to ${Math.floor(latestArvitMinutes/60)}:${latestArvitMinutes%60}`);
  
  // Find nearest 5-minute mark within range
  const midpoint = (earliestArvitMinutes + latestArvitMinutes) / 2;
  const roundedMinutes = Math.round(midpoint / 5) * 5;
  
  // Ensure rounded time is within range
  const finalMinutes = Math.max(
    earliestArvitMinutes,
    Math.min(latestArvitMinutes, roundedMinutes)
  );
  
  console.log(`Rounded to 5-minute mark: ${Math.floor(roundedMinutes/60)}:${roundedMinutes%60}`);
  console.log(`Final arvit time: ${Math.floor(finalMinutes/60)}:${finalMinutes%60}`);
  
  // Convert back to HH:MM format
  const hours = Math.floor(finalMinutes / 60);
  const minutes = finalMinutes % 60;
  
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};
