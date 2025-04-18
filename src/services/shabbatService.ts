
import type { ShabbatDataResponse } from '@/types/shabbat';
import { calculateShabbatMinchaTime, calculateShabbatKabalatTime, isIsraeliDaylightTime } from '@/lib/utils/shabbatCalculations';

export const processShabbatData = (shabbat: any, fridaySunset: string): ShabbatDataResponse => {
  if (!shabbat) {
    console.log('No Shabbat data available');
    return {
      title: 'שבת',
      subtitle: '',
      candlesPT: '--:--',
      candlesTA: '--:--',
      havdala: '--:--',
      prayers: [],
      classes: []
    };
  }

  // Format the title based on whether this is a special Shabbat or regular parasha
  const title = shabbat.special_shabbat || (shabbat.parasha ? `פרשת ${shabbat.parasha}` : 'שבת');
  
  // Format the subtitle according to the provided logic
  let subtitle = '';
  if (shabbat.parasha && shabbat.special_shabbat) {
    subtitle = `${shabbat.parasha} | ${shabbat.special_shabbat}`;
  } else if (shabbat.parasha) {
    subtitle = shabbat.parasha;
  } else if (shabbat.special_shabbat) {
    subtitle = shabbat.special_shabbat;
  }

  // Get the early mincha time from the shabbat record or use the provided fallback
  const earlyMinchaTime = shabbat.early_mincha_time || '17:30';
  
  // Calculate mincha time before Shabbat (for kabalat Shabbat) using sunset
  const kabalatShabbatTime = calculateShabbatKabalatTime(fridaySunset);
  
  // Calculate afternoon (mincha) time on Shabbat - one hour before havdalah
  const shabbatMinchaTime = calculateShabbatMinchaTime(shabbat.havdalah_petah_tikva || '19:45');
  
  // Determine if we're in DST for the proper mincha gedola time
  const shabbatDate = shabbat.date ? new Date(shabbat.date) : new Date();
  const isDST = isIsraeliDaylightTime(shabbatDate);
  const minchaGedolaTime = isDST ? '13:20' : '12:30';

  // Get prayer times using all the calculated values
  const prayers = [
    { name: 'קבלת שבת מוקדמת', time: earlyMinchaTime },
    { name: 'מנחה וקבלת שבת', time: kabalatShabbatTime },
    { name: 'שחרית א׳', time: '06:45' },
    { name: 'שחרית ב׳', time: '08:30' },
    { name: 'מנחה גדולה', time: minchaGedolaTime },
    { name: 'מנחה', time: shabbatMinchaTime },
    { name: 'ערבית מוצ״ש', time: shabbat.havdalah_petah_tikva || '--:--' }
  ];

  return {
    title,
    subtitle,
    candlesPT: shabbat.candle_lighting_petah_tikva || '--:--',
    candlesTA: shabbat.candle_lighting_tel_aviv || '--:--',
    havdala: shabbat.havdalah_petah_tikva || '--:--',
    prayers,
    classes: []
  };
};
