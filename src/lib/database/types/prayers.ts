
export interface PrayerOverride {
  id: string;
  prayer_name: string;
  override_time: string;
  start_date: string;
  end_date: string;
  day_of_week: number | null;
  created_at: string;
  is_active: boolean;
}
