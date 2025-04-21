
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

export interface Prayer {
  id: string;
  name: string;
  defaultTime: string;
  overrideTime?: string;
  overrideInfo?: {
    id: string;
    startDate: string;
    endDate: string;
    dayOfWeek: number | null;
  };
  category: 'daily' | 'shabbat';
}

export interface PrayerOverrideFormData {
  prayer_name: string;
  override_time: string;
  start_date: string;
  end_date: string;
  day_of_week: number | null;
}
