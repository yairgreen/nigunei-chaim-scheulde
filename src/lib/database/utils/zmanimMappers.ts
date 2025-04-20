
import { format } from 'date-fns';
import type { ZmanimData } from '../types/zmanim';

export const mapSupabaseToZmanim = (data: any, date: string): ZmanimData => ({
  date,
  alotHaShachar: data.alot_hashachar || '',
  sunrise: data.sunrise || '',
  misheyakir: data.misheyakir || '',
  sofZmanShmaMGA: data.sof_zman_shma_mga || '',
  sofZmanShma: data.sof_zman_shma_gra || '',
  sofZmanTfillaMGA: data.sof_zman_tfilla_mga || '',
  sofZmanTfilla: data.sof_zman_tfilla_gra || '',
  chatzot: data.chatzot || '',
  minchaGedola: data.mincha_gedola || '',
  plagHaMincha: data.plag_hamincha || '',
  sunset: data.sunset || '',
  beinHaShmashos: data.tzait_hakochavim || ''
});
