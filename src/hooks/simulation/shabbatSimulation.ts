
import { format } from 'date-fns';
import { calculateShabbatMinchaTime, calculateShabbatKabalatTime } from '@/lib/database/shabbat';

/**
 * Functions for simulating Shabbat data
 */

// Simulate Shabbat data based on the selected date
export const simulateShabbatData = (selectedDate: Date, currentShabbatData: any) => {
  // Generate parashat name based on the date
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
  
  // Simple algorithm to pick parashat based on date
  const dayOfYear = Math.floor((selectedDate.getTime() - new Date(selectedDate.getFullYear(), 0, 0).getTime()) / (24 * 60 * 60 * 1000));
  const parashatIndex = Math.floor(dayOfYear / 7) % parashotNames.length;
  const parashatName = parashotNames[parashatIndex];
  
  // This would be more sophisticated in a production app
  // Simple logic to adjust Shabbat times based on month for simulation
  const month = selectedDate.getMonth();
  let candleTime, havdalaTime, sunsetTime;
  
  if (month >= 3 && month <= 8) { // Spring and Summer
    candleTime = `19:${15 + (selectedDate.getDate() % 10)}`;
    havdalaTime = `20:${25 + (selectedDate.getDate() % 5)}`;
    sunsetTime = `19:${45 + (selectedDate.getDate() % 10)}`;
  } else { // Fall and Winter
    candleTime = `16:${30 + (selectedDate.getDate() % 10)}`;
    havdalaTime = `17:${40 + (selectedDate.getDate() % 5)}`;
    sunsetTime = `17:${10 + (selectedDate.getDate() % 10)}`;
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
  
  // Generate simulated classes
  const shabbatClasses = [
    { name: 'פרשת השבוע מפי הרב אברהם כהן', time: '08:15' },
    { name: 'שיעור הלכה מפי הרב יצחק לוי', time: '16:30' },
    { name: 'דף יומי מפי הרב משה ישראל', time: `${(parseInt(minchaTime.split(':')[0]) - 1)}:00` }
  ];
  
  // Generate simulated Shabbat data using current data as template
  return {
    title: `שבת פרשת ${parashatName}`,
    subtitle: selectedDate.getDate() % 5 === 0 ? 'שבת מברכין' : '',
    candlesPT: candleTime,
    candlesTA: format(new Date(`2025-01-01T${candleTime}`), 'HH:mm'),
    havdala: havdalaTime,
    prayers: shabbatPrayers,
    classes: shabbatClasses
  };
};
