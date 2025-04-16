
export interface ShabbatDataResponse {
  title: string;
  subtitle: string;
  candlesPT: string;
  candlesTA: string;
  havdala: string;
  prayers: Array<{ name: string; time: string }>;
  classes: Array<{ name: string; time: string }>;
}

export interface ShabbatHookData {
  shabbatData: ShabbatDataResponse;
}
