
import type { ShabbatDataResponse } from '@/types/shabbat';

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

  // Get prayer times using the provided sunset time
  const prayers = [
    { name: 'קבלת שבת מוקדמת', time: '17:30' },
    { name: 'מנחה וקבלת שבת', time: fridaySunset },
    { name: 'שחרית א׳', time: '06:45' },
    { name: 'שחרית ב׳', time: '08:30' },
    { name: 'מנחה גדולה', time: '13:20' },
    { name: 'מנחה', time: '17:30' },
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
