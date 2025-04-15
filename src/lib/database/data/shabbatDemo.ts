
export const getDemoShabbatData = (date: string) => {
  const demoData = [
    {
      date: '2025-04-05',
      parashat_hebrew: 'פרשת צו',
      holiday_hebrew: 'שבת הגדול',
      candles_pt: '18:17',
      candles_ta: '18:39',
      havdalah: '19:35'
    },
    {
      date: '2025-04-12',
      parashat_hebrew: 'פרשת שמיני',
      candles_pt: '18:17',
      candles_ta: '18:39',
      havdalah: '19:35'
    },
    {
      date: '2025-04-19',
      parashat_hebrew: 'פרשת תזריע-מצורע',
      candles_pt: '18:17',
      candles_ta: '18:39',
      havdalah: '19:35'
    },
    {
      date: '2025-04-26',
      parashat_hebrew: 'פרשת אחרי מות-קדושים',
      candles_pt: '18:17',
      candles_ta: '18:39',
      havdalah: '19:35'
    }
  ];

  return demoData.find(item => item.date === date) || {
    date,
    parashat_hebrew: 'פרשת השבוע',
    candles_pt: '18:17',
    candles_ta: '18:39',
    havdalah: '19:35'
  };
};

