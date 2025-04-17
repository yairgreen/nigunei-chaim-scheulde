import { getShabbatParashaName, getSpecialShabbatName, formatShabbatSubtitle, getShabbatPrayerTimes } from '@/utils/shabbatFormatters';
import { calculateShabbatMinchaTime, calculateShabbatKabalatTime } from '@/lib/database/utils/shabbatCalculations';
import type { ShabbatDataResponse } from '@/types/shabbat';

export const processShabbatData = (shabbat: any | null, fridaySunset: string): ShabbatDataResponse => {
  if (!shabbat) {
    console.log('No Shabbat data available, using default values');
    const defaultPrayers = getShabbatPrayerTimes(true, '18:45', '18:35', '19:35');
    
    return {
      title: 'שבת',
      subtitle: 'פרשת השבוע',
      candlesPT: '18:17',
      candlesTA: '18:39',
      havdala: '19:35',
      prayers: defaultPrayers,
      classes: []
    };
  }

  // Get havdalah time and calculate Mincha time
  const havdalahTime = shabbat.havdalah || shabbat.havdalah_petah_tikva || '19:35';
  const minchaTime = calculateShabbatMinchaTime(havdalahTime);
  
  // Calculate Kabalat Shabbat time using Friday sunset
  const kabalatTime = calculateShabbatKabalatTime(fridaySunset);
  
  // Check if we're in daylight saving time
  const now = new Date();
  const month = now.getMonth();
  const isDaylightSaving = month >= 2 && month <= 9;

  // Get parasha and special Shabbat
  const parasha = getShabbatParashaName(shabbat);
  const specialShabbat = getSpecialShabbatName(shabbat);
  
  // Format the title based on whether this is a holiday Shabbat or a regular parasha
  const title = specialShabbat || (parasha ? `פרשת ${parasha}` : 'שבת');
  
  // Keep the subtitle logic for backward compatibility
  const subtitle = formatShabbatSubtitle(parasha, specialShabbat);

  // Get prayer times
  const shabbatPrayers = getShabbatPrayerTimes(isDaylightSaving, kabalatTime, minchaTime, havdalahTime);

  return {
    title: title,
    subtitle,
    candlesPT: shabbat.candle_lighting_petah_tikva || shabbat.candlesPT || shabbat.candles_pt || '18:17',
    candlesTA: shabbat.candle_lighting_tel_aviv || shabbat.candlesTA || shabbat.candles_ta || '18:39',
    havdala: havdalahTime,
    prayers: shabbatPrayers,
    classes: []
  };
};
