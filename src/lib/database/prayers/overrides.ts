
import { supabase } from '@/integrations/supabase/client';
import type { PrayerOverride } from '../types/prayers';
import type { PrayerOverrideFormData } from '@/components/admin/PrayerOverrideForm';

export async function getPrayerOverrides(): Promise<PrayerOverride[]> {
  // Access table directly with explicit typing for the results
  const { data, error } = await supabase
    .from('prayer_overrides')
    .select('*')
    .eq('is_active', true);
    
  if (error) {
    console.error('Error fetching prayer overrides:', error);
    return [];
  }
  
  // Cast the data to the correct type
  return data as unknown as PrayerOverride[];
}

export async function addPrayerOverride(override: PrayerOverrideFormData): Promise<PrayerOverride | null> {
  // Access table directly with an explicit cast for the inserted data
  const { data, error } = await supabase
    .from('prayer_overrides')
    .insert([override as any])
    .select()
    .single();
    
  if (error) {
    console.error('Error adding prayer override:', error);
    return null;
  }
  
  // Cast the returned data to the correct type
  return data as unknown as PrayerOverride;
}

export async function deletePrayerOverride(id: string): Promise<boolean> {
  // Access table directly to update the is_active flag
  const { error } = await supabase
    .from('prayer_overrides')
    .update({ is_active: false } as any)
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
  
  // Find an active override for the current prayer and date
  return overrides.find(override => 
    override.prayer_name === prayerName &&
    override.is_active &&
    override.start_date <= dateStr &&
    override.end_date >= dateStr &&
    (override.day_of_week === null || override.day_of_week === dayOfWeek)
  ) || null;
}
