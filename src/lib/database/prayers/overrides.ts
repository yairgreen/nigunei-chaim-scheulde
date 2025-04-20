
import { supabase } from '@/integrations/supabase/client';
import type { PrayerOverride } from '../types/prayers';
import type { PrayerOverrideFormData } from '@/components/admin/PrayerOverrideForm';

export async function getPrayerOverrides(): Promise<PrayerOverride[]> {
  // Use the generic query method to avoid type errors
  const { data, error } = await supabase
    .from('prayer_overrides')
    .select('*')
    .eq('is_active', true) as any;
    
  if (error) {
    console.error('Error fetching prayer overrides:', error);
    return [];
  }
  
  return data as PrayerOverride[];
}

export async function addPrayerOverride(override: PrayerOverrideFormData): Promise<PrayerOverride | null> {
  // Use the generic query method with 'as any' to avoid type errors
  const { data, error } = await supabase
    .from('prayer_overrides')
    .insert([override])
    .select()
    .single() as any;
    
  if (error) {
    console.error('Error adding prayer override:', error);
    return null;
  }
  
  return data as PrayerOverride;
}

export async function deletePrayerOverride(id: string): Promise<boolean> {
  // Use the generic query method with 'as any' to avoid type errors
  const { error } = await supabase
    .from('prayer_overrides')
    .update({ is_active: false })
    .eq('id', id) as any;
    
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
  
  // Find an active override for the current prayer and date
  return overrides.find(override => 
    override.prayer_name === prayerName &&
    override.is_active &&
    override.start_date <= dateStr &&
    override.end_date >= dateStr &&
    (override.day_of_week === null || override.day_of_week === dayOfWeek)
  ) || null;
}
