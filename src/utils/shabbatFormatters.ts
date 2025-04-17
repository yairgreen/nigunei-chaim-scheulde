
export const formatShabbatSubtitle = (parasha: string, specialShabbat: string): string => {
  // If both parasha and specialShabbat exist, concatenate them
  if (parasha && specialShabbat) {
    return `${parasha} | ${specialShabbat}`;
  }
  // If only parasha exists, return it
  if (parasha) {
    return parasha;
  }
  // If only specialShabbat exists, return it
  if (specialShabbat) {
    return specialShabbat;
  }
  // Default case
  return 'פרשת השבוע';
};

export const getShabbatParashaName = (shabbat: any): string => {
  return shabbat.parasha || shabbat.parashat || shabbat.parashat_hebrew || '';
};

export const getSpecialShabbatName = (shabbat: any): string => {
  return shabbat.special_shabbat || shabbat.holiday || shabbat.holiday_hebrew || '';
};

export const getShabbatPrayerTimes = (
  isDaylightSaving: boolean,
  kabalatTime: string,
  minchaTime: string,
  havdalahTime: string
): Array<{ name: string; time: string }> => {
  return [
    { name: 'קבלת שבת מוקדמת', time: '17:30' },
    { name: 'מנחה וקבלת שבת', time: kabalatTime },
    { name: 'שחרית א׳', time: '06:45' },
    { name: 'שחרית ב׳', time: '08:30' },
    { name: 'מנחה גדולה', time: isDaylightSaving ? '13:20' : '12:30' },
    { name: 'מנחה', time: minchaTime },
    { name: 'ערבית מוצ״ש', time: havdalahTime }
  ];
};
