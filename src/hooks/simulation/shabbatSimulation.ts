
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
  
  // Get zmanim data for this date to have accurate sunset time
  const zmanimDatabase = getZmanimDatabase();
  const formattedDate = format(shabbatDate, 'yyyy-MM-dd');
  const shabbatZmanim = zmanimDatabase.find(z => z.date === formattedDate);
  
  // Use sunset from zmanim if available, otherwise use simulation
  let sunsetTime, havdalaTime, candleLightingPT, candleLightingTA;
  
  if (shabbatZmanim && shabbatZmanim.sunset) {
    // Use actual sunset from database
    sunsetTime = shabbatZmanim.sunset;
    
    // Generate simulated times based on sunset
    const sunsetHour = parseInt(sunsetTime.split(':')[0]);
    const sunsetMinute = parseInt(sunsetTime.split(':')[1]);
    
    // Candle lighting is typically 18-20 minutes before sunset
    const candleHour = sunsetHour;
    const candleMinute = Math.max(0, sunsetMinute - 20);
    candleLightingPT = `${String(candleHour).padStart(2, '0')}:${String(candleMinute).padStart(2, '0')}`;
    candleLightingTA = `${String(candleHour).padStart(2, '0')}:${String(candleMinute - 2).padStart(2, '0')}`;
    
    // Havdalah is typically 42 minutes after sunset (3 medium stars)
    const havdalaHour = sunsetHour + (sunsetMinute + 42 >= 60 ? 1 : 0);
    const havdalaMinute = (sunsetMinute + 42) % 60;
    havdalaTime = `${String(havdalaHour).padStart(2, '0')}:${String(havdalaMinute).padStart(2, '0')}`;
  } else {
    // Fallback to seasonal simulation if no database data
    const month = shabbatDate.getMonth();
    
    if (month >= 3 && month <= 8) { // Spring and Summer
      candleLightingPT = `19:${15 + (shabbatDate.getDate() % 10)}`;
      havdalaTime = `20:${25 + (shabbatDate.getDate() % 5)}`;
      sunsetTime = `19:${45 + (shabbatDate.getDate() % 10)}`;
    } else { // Fall and Winter
      candleLightingPT = `16:${30 + (shabbatDate.getDate() % 10)}`;
      havdalaTime = `17:${40 + (shabbatDate.getDate() % 5)}`;
      sunsetTime = `17:${10 + (shabbatDate.getDate() % 10)}`;
    }
    
    candleLightingTA = format(new Date(`2025-01-01T${candleLightingPT}`), 'HH:mm');
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
  
  // Generate simulated Shabbat classes - Limited to standard ones with fixed times
  const shabbatClasses = [
    { name: 'שיעור הלכה לפני מנחה', time: `${(parseInt(minchaTime.split(':')[0]) - 1)}:00` }
  ];
  
  // Check if the Shabbat has a special name (מברכין, החודש, etc)
  const specialShabbat = getSpecialShabbatName(shabbatDate);
  
  // Generate simulated Shabbat data using current data as template
  return {
    title: `שבת פרשת ${parashatName}`,
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
