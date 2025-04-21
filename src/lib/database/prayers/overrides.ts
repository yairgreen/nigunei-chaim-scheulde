
import { supabase } from '@/integrations/supabase/client';
import type { PrayerOverride, PrayerOverrideFormData } from '../types/prayers';

// Get all active prayer overrides
export async function getPrayerOverrides(): Promise<PrayerOverride[]> {
  const { data, error } = await supabase
    .from('prayer_overrides')
    .select('*')
    .eq('is_active', true);

  if (error) {
    console.error('Error fetching prayer overrides:', error);
    return [];
  }

  return data ?? [];
}

// Add a new prayer override
export async function addPrayerOverride(
  override: PrayerOverrideFormData
): Promise<PrayerOverride | null> {
  const { data, error } = await supabase
    .from('prayer_overrides')
    .insert([override])
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error adding prayer override:', error);
    return null;
  }

  // Return null if data is null (meaning insert failed for some reason)
  return data ?? null;
}

// Soft-delete a prayer override by setting is_active to false
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

// Find the first applicable override for a prayer on a specific date
export function getActiveOverride(
  prayerName: string,
  date: Date,
  overrides: PrayerOverride[]
): PrayerOverride | null {
  const dayOfWeek = date.getDay();
  const dateStr = date.toISOString().split('T')[0];

  return (
    overrides.find(
      (override) =>
        override.prayer_name === prayerName &&
        override.is_active &&
        override.start_date <= dateStr &&
        override.end_date >= dateStr &&
        (override.day_of_week === null || override.day_of_week === dayOfWeek)
    ) || null
  );
}
