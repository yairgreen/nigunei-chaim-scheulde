
export interface ShabbatData {
  title?: string;
  parashat?: string;
  parashatHebrew?: string;
  holiday?: string;
  holidayHebrew?: string;
  candlesPT?: string;
  candlesTA?: string;
  havdalah?: string;
  date?: string;
  // Legacy API field names
  parashat_hebrew?: string;
  holiday_hebrew?: string;
  candles_pt?: string;
  candles_ta?: string;
  // Supabase field names
  parasha?: string;
  special_shabbat?: string;
  candle_lighting_petah_tikva?: string;
  candle_lighting_tel_aviv?: string;
  havdalah_petah_tikva?: string;
}
