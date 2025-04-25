
export const updateNextTimeIndicator = (times: Array<{ name: string; time: string; isNext?: boolean }>) => {
  const now = new Date();
  const currentTimeStr = now.toLocaleTimeString('he-IL', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  console.log('Current time for next marker:', currentTimeStr);

  // Reset all isNext flags
  const updatedTimes = times.map(item => ({
    ...item,
    isNext: false
  }));

  // Find the next time that hasn't passed yet
  const nextTimeIndex = updatedTimes.findIndex(item => item.time > currentTimeStr);
  if (nextTimeIndex !== -1) {
    updatedTimes[nextTimeIndex].isNext = true;
    console.log('Next time is:', updatedTimes[nextTimeIndex].name, 'at', updatedTimes[nextTimeIndex].time);
  } else {
    console.log('No next time found');
  }

  return updatedTimes;
};

export const getDailyTimesArray = (zmanimData: any, weeklyPrayers: any, date?: Date) => {
  if (!zmanimData) return [];
  
  const currentDate = date || new Date();
  const currentDay = currentDate.getDay();
  const includePrayerTimes = currentDay !== 5 && currentDay !== 6;
  
  const times = [
    { name: 'עלות השחר (72 ד\')', time: zmanimData.alotHaShachar, isNext: false },
    { name: 'הנץ החמה', time: zmanimData.sunrise, isNext: false },
    { name: 'זמן טלית ותפילין', time: zmanimData.misheyakir, isNext: false },
    { name: 'סוף זמן ק"ש (מג״א)', time: zmanimData.sofZmanShmaMGA, isNext: false },
    { name: 'סוף זמן ק"ש (גר״א)', time: zmanimData.sofZmanShma, isNext: false },
    { name: 'סוף זמן תפילה (מג״א)', time: zmanimData.sofZmanTfillaMGA, isNext: false },
    { name: 'סוף זמן תפילה (גר"א)', time: zmanimData.sofZmanTfilla, isNext: false },
    { name: 'חצות היום והלילה', time: zmanimData.chatzot, isNext: false },
    { name: 'זמן מנחה גדולה', time: zmanimData.minchaGedola, isNext: false },
    { name: 'פלג המנחה', time: zmanimData.plagHaMincha, isNext: false }
  ];
  
  // Add weekly prayer times if not Friday/Saturday
  if (includePrayerTimes) {
    if (weeklyPrayers.minchaTime) {
      times.push({ name: 'מנחה', time: weeklyPrayers.minchaTime, isNext: false });
    }
    if (weeklyPrayers.arvitTime) {
      times.push({ name: 'ערבית', time: weeklyPrayers.arvitTime, isNext: false });
    }
  }
  
  times.push(
    { name: 'שקיעה', time: zmanimData.sunset, isNext: false },
    { name: 'צאת הכוכבים', time: zmanimData.beinHaShmashos, isNext: false }
  );
  
  return times;
};

