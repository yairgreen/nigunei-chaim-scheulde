
import type { ZmanimData } from '../types/zmanimTypes';

export const getDemoZmanimmData = (date: string): ZmanimData => {
  console.log(`Generating demo data for ${date}`);
  return {
    date: date,
    alotHaShachar: '04:52',
    sunrise: '06:08',
    misheyakir: '05:15',
    sofZmanShmaMGA: '08:48',
    sofZmanShma: '09:24',
    sofZmanTfillaMGA: '10:05',
    sofZmanTfilla: '10:29',
    chatzot: '12:40',
    minchaGedola: '13:13',
    plagHaMincha: '17:50',
    sunset: '19:12',
    beinHaShmashos: '19:29'
  };
};

