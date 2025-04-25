
import { format } from 'date-fns';
import { formatTimeFromDB } from '../../utils/timeFormatting';
import type { ZmanimData } from '../types/zmanim';

export const mapSupabaseToZmanim = (item: any): ZmanimData => {
  return {
    date: item.gregorian_date ? format(new Date(item.gregorian_date), 'yyyy-MM-dd') : '',
    alotHaShachar: formatTimeFromDB(item.alot_hashachar),
    sunrise: formatTimeFromDB(item.sunrise),
    misheyakir: formatTimeFromDB(item.misheyakir),
    sofZmanShmaMGA: formatTimeFromDB(item.sof_zman_shma_mga),
    sofZmanShma: formatTimeFromDB(item.sof_zman_shma_gra),
    sofZmanTfillaMGA: formatTimeFromDB(item.sof_zman_tfilla_mga),
    sofZmanTfilla: formatTimeFromDB(item.sof_zman_tfilla_gra),
    chatzot: formatTimeFromDB(item.chatzot),
    minchaGedola: formatTimeFromDB(item.mincha_gedola),
    plagHaMincha: formatTimeFromDB(item.plag_hamincha),
    sunset: formatTimeFromDB(item.sunset),
    beinHaShmashos: formatTimeFromDB(item.tzait_hakochavim)
  };
};
