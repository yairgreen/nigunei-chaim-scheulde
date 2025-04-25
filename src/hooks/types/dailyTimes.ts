
export interface TimeItem {
  name: string;
  time: string;
  isNext?: boolean;
}

export interface DailyTimesData {
  dailyTimes: TimeItem[];
}

