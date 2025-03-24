
import { format, addDays } from 'date-fns';
import { calculateShabbatMinchaTime, calculateShabbatKabalatTime } from '@/lib/database/shabbat';
import { getZmanimDatabase } from '@/lib/database/zmanim';

/**
 * Functions for simulating Shabbat data
 */

// Simulate Shabbat data based on the selected date
export const simulateShabbatData = (selectedDate: Date, currentShabbatData: any) => {
  // Find the next or current Shabbat date
  const dayOfWeek = selectedDate.getDay(); // 0 = Sunday, 6 = Saturday
  const daysUntilShabbat = (6 - dayOfWeek + 7) % 7; // 0 if it's Shabbat, otherwise days until next Shabbat
  const shabbatDate = new Date(selectedDate);
  
  // If not already Shabbat, find the next Shabbat
  if (daysUntilShabbat > 0) {
    shabbatDate.setDate(selectedDate.getDate() + daysUntilShabbat);
  }
  
  // Get the parasha name based on the Shabbat date
  const parashatName = getParashaForDate(shabbatDate);
  
  // Get Friday date (for sunset calculation)
  const fridayDate = new Date(shabbatDate);
  fridayDate.setDate(shabbatDate.getDate() - 1);
  
  // Format for API lookup
  const fridayFormatted = format(fridayDate, 'yyyy-MM-dd');
  
  // Get zmanim data for Friday to have accurate sunset time
  const zmanimDatabase = getZmanimDatabase();
  const fridayZmanim = zmanimDatabase.find(z => z.date === fridayFormatted);
  
  // Get zmanim data for Shabbat for havdalah time
  const formattedDate = format(shabbatDate, 'yyyy-MM-dd');
  const shabbatZmanim = zmanimDatabase.find(z => z.date === formattedDate);
  
  // Use sunset from zmanim if available, otherwise use simulation
  let sunsetTime, havdalaTime, candleLightingPT, candleLightingTA;
  
  if (fridayZmanim && fridayZmanim.sunset) {
    // Use actual sunset from database for Friday
    sunsetTime = fridayZmanim.sunset;
    
    // Generate simulated times based on sunset
    const sunsetHour = parseInt(sunsetTime.split(':')[0]);
    const sunsetMinute = parseInt(sunsetTime.split(':')[1]);
    
    // Candle lighting is typically 18-20 minutes before sunset
    const candleHour = sunsetHour;
    const candleMinute = Math.max(0, sunsetMinute - 20);
    candleLightingPT = `${String(candleHour).padStart(2, '0')}:${String(candleMinute).padStart(2, '0')}`;
    candleLightingTA = `${String(candleHour).padStart(2, '0')}:${String(Math.max(0, candleMinute - 2)).padStart(2, '0')}`;
  } else {
    // Fallback to seasonal simulation if no database data
    const month = shabbatDate.getMonth();
    
    if (month >= 3 && month <= 8) { // Spring and Summer
      candleLightingPT = `19:${15 + (shabbatDate.getDate() % 10)}`;
      candleLightingTA = `19:${13 + (shabbatDate.getDate() % 10)}`;
      sunsetTime = `19:${35 + (shabbatDate.getDate() % 10)}`;
    } else { // Fall and Winter
      candleLightingPT = `16:${30 + (shabbatDate.getDate() % 10)}`;
      candleLightingTA = `16:${28 + (shabbatDate.getDate() % 10)}`;
      sunsetTime = `16:${50 + (shabbatDate.getDate() % 10)}`;
    }
  }
  
  // Use Shabbat zmanim for beinHaShmashos (for havdalah) if available
  if (shabbatZmanim && shabbatZmanim.beinHaShmashos) {
    havdalaTime = shabbatZmanim.beinHaShmashos;
  } else {
    // If no Shabbat zmanim, calculate havdala time (using fixed 42 minutes)
    const [hours, minutes] = sunsetTime.split(':').map(Number);
    const sunsetTotalMinutes = hours * 60 + minutes;
    const havdalaTotalMinutes = sunsetTotalMinutes + 42;  // Typical time for 3 stars
    
    const havdalaHours = Math.floor(havdalaTotalMinutes / 60);
    const havdalaMinutes = havdalaTotalMinutes % 60;
    
    havdalaTime = `${String(havdalaHours).padStart(2, '0')}:${String(havdalaMinutes).padStart(2, '0')}`;
  }
  
  // Calculate prayer times based on simulated sunset and havdalah
  const kabalatTime = calculateShabbatKabalatTime(sunsetTime);
  const minchaTime = calculateShabbatMinchaTime(havdalaTime);
  
  // Generate simulated Shabbat prayers
  const shabbatPrayers = [
    { name: 'קבלת שבת מוקדמת', time: '17:30' },
    { name: 'מנחה וקבלת שבת', time: kabalatTime },
    { name: 'שחרית א׳', time: '06:45' },
    { name: 'שחרית ב׳', time: '08:30' },
    { name: 'מנחה גדולה', time: '12:30' },
    { name: 'מנחה', time: minchaTime },
    { name: 'ערבית מוצ״ש', time: havdalaTime }
  ];
  
  // No Shabbat classes
  const shabbatClasses = [];
  
  // Check if the Shabbat has a special name (מברכין, החודש, etc)
  const specialShabbat = getSpecialShabbatName(shabbatDate);
  
  // Generate title based on parasha
  const title = parashatName ? `שבת פרשת ${parashatName}` : 'שבת';
  
  // Generate simulated Shabbat data using current data as template
  return {
    title: title,
    subtitle: specialShabbat,
    candlesPT: candleLightingPT,
    candlesTA: candleLightingTA,
    havdala: havdalaTime,
    prayers: shabbatPrayers,
    classes: shabbatClasses
  };
};

// Get parasha name for a specific date
const getParashaForDate = (date: Date): string => {
  // Real parasha cycle based on the Jewish year
  const parashotNames = [
    'בראשית', 'נח', 'לך לך', 'וירא', 'חיי שרה', 
    'תולדות', 'ויצא', 'וישלח', 'וישב', 'מקץ',
    'ויגש', 'ויחי', 'שמות', 'וארא', 'בא',
    'בשלח', 'יתרו', 'משפטים', 'תרומה', 'תצוה',
    'כי תשא', 'ויקהל', 'פקודי', 'ויקרא', 'צו',
    'שמיני', 'תזריע', 'מצורע', 'אחרי מות', 'קדושים',
    'אמור', 'בהר', 'בחוקותי', 'במדבר', 'נשא',
    'בהעלותך', 'שלח', 'קרח', 'חקת', 'בלק',
    'פינחס', 'מטות', 'מסעי', 'דברים', 'ואתחנן',
    'עקב', 'ראה', 'שופטים', 'כי תצא', 'כי תבוא',
    'ניצבים', 'וילך', 'האזינו', 'וזאת הברכה'
  ];
  
  // Calculate weeks from a fixed reference point (Rosh Hashanah 2024)
  const referenceDate = new Date(2024, 8, 30); // September 30, 2024 (Rosh Hashanah)
  const weeksDiff = Math.floor((date.getTime() - referenceDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
  
  // Adjust to get current parasha index
  let parashaIndex = (weeksDiff + 51) % parashotNames.length; // Start with Bereshit
  
  // Handle double parshiot in certain weeks based on date
  const month = date.getMonth();
  const day = date.getDate();
  
  // Simple logic to combine certain parshiot in non-leap years
  if ((month === 1 && day > 20) || (month === 2 && day < 10)) { // Late February/Early March
    if (parashaIndex === 22) return 'ויקהל-פקודי'; // Combine Vayakhel-Pekudei
  }
  else if ((month === 3 && day > 10) || (month === 4 && day < 5)) { // April/May
    if (parashaIndex === 27) return 'תזריע-מצורע'; // Combine Tazria-Metzora
    if (parashaIndex === 29) return 'אחרי מות-קדושים'; // Combine Acharei Mot-Kedoshim
  }
  else if (month === 6 && day > 5) { // July
    if (parashaIndex === 41) return 'מטות-מסעי'; // Combine Matot-Masei
  }
  
  return parashotNames[parashaIndex];
};

// Check if the Shabbat has a special name
const getSpecialShabbatName = (date: Date): string => {
  const month = date.getMonth();
  const day = date.getDate();
  
  // Check if it's Shabbat Mevarchim (the Shabbat before Rosh Chodesh)
  // Simple approximation: last Shabbat of the month except for Elul
  if (day >= 23 && day <= 29 && month !== 5) {
    return 'שבת מברכין';
  }
  
  // Check for special Shabbatot (simplified logic)
  if (month === 0 && day >= 15 && day <= 21) return 'שבת שירה'; // Mid-January
  if (month === 1 && day >= 25) return 'שבת שקלים'; // Late February
  if (month === 2 && day <= 7) return 'שבת זכור'; // Early March
  if (month === 2 && day >= 8 && day <= 15) return 'שבת פרה'; // Mid-March
  if (month === 2 && day >= 16 && day <= 23) return 'שבת החודש'; // Late March
  if (month === 2 && day >= 24) return 'שבת הגדול'; // Late March/Early April
  if (month === 6 && day >= 1 && day <= 9) return 'שבת חזון'; // Early August
  if (month === 6 && day >= 10 && day <= 16) return 'שבת נחמו'; // Mid-August
  
  return '';
};
