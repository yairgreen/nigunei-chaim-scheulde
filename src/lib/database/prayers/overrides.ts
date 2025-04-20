
import { supabase } from '@/integrations/supabase/client';
import type { PrayerOverride } from '../types/prayers';
import type { PrayerOverrideFormData } from '@/components/admin/PrayerOverrideForm';

export async function getPrayerOverrides(): Promise<PrayerOverride[]> {
  const { data, error } = await supabase
    .from('prayer_overrides')
    .select('*')
    .eq('is_active', true);
    
  if (error) {
    console.error('Error fetching prayer overrides:', error);
    return [];
  }
  
  return data;
}

export async function addPrayerOverride(override: PrayerOverrideFormData): Promise<PrayerOverride | null> {
  const { data, error } = await supabase
    .from('prayer_overrides')
    .insert([override])
    .select()
    .single();
    
  if (error) {
    console.error('Error adding prayer override:', error);
    return null;
  }
  
  return data;
}

export async function deletePrayerOverride(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('prayer_overrides')
    .update({ is_active: false })
    .eq('id', id);
    
  if (error) {
    console.error('Error deleting prayer override:', error);
    return false;
  }
  
  return true;
}

export function getActiveOverride(
  prayerName: string, 
  date: Date,
  overrides: PrayerOverride[]
): PrayerOverride | null {
  const dayOfWeek = date.getDay();
  const dateStr = date.toISOString().split('T')[0];
  
  return overrides.find(override => 
    override.prayer_name === prayerName &&
    override.is_active &&
    override.start_date <= dateStr &&
    override.end_date >= dateStr &&
    (override.day_of_week === null || override.day_of_week === dayOfWeek)
  ) || null;
}
