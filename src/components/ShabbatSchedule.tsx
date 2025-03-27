
import React from 'react';
import { cn } from '@/lib/utils';

interface TimeItem {
  name: string;
  time: string;
}

interface ShabbatScheduleProps {
  title: string;
  subtitle?: string;
  candlesPT: string;
  candlesTA: string;
  havdala: string;
  prayers: TimeItem[];
  classes: TimeItem[];
  className?: string;
}

const ShabbatSchedule: React.FC<ShabbatScheduleProps> = ({
  title,
  subtitle,
  candlesPT,
  candlesTA,
  havdala,
  prayers,
  classes,
  className
}) => {
  return (
    <div className={cn('schedule-card bg-shabbat animate-fade-in-up', className)}>
      <h2 className="text-2xl font-bold mb-2 text-title border-b pb-2 border-accent2/20">זמני שבת</h2>
      {subtitle && <p className="text-lg font-medium mb-4">{subtitle}</p>}
      
      <div className="flex justify-between items-center mb-6 bg-white/50 p-4 rounded-lg">
        <div>
          <h3 className="font-medium">הדלקת נרות</h3>
          <div className="flex flex-col">
            <div className="flex items-center justify-between">
              <span className="text-sm">פ"ת</span>
              <span className="text-base font-bold mr-2">{candlesPT}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">ת"א</span>
              <span className="text-base font-bold mr-2">{candlesTA}</span>
            </div>
          </div>
        </div>
        <div className="h-10 w-px bg-gray-300"></div>
        <div>
          <h3 className="font-medium">צאת השבת</h3>
          <p className="text-base font-bold">{havdala}</p>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-title">תפילות</h3>
        <div className="space-y-2">
          {prayers.map((prayer, index) => (
            <div key={index} className="time-item">
              <span className="font-medium">{prayer.name}</span>
              <span className="text-title">{prayer.time}</span>
            </div>
          ))}
        </div>
      </div>
      
      {classes.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 text-title">שיעורים</h3>
          <div className="space-y-2">
            {classes.map((item, index) => (
              <div key={index} className="time-item">
                <div className="flex justify-between w-full">
                  <span className="font-medium">{item.name.split(' מפי ')[0]}</span>
                  <span className="text-title">{item.time}</span>
                </div>
                {item.name.includes(' מפי ') && (
                  <span className="text-sm text-gray-600 text-right">{item.name.split(' מפי ')[1]}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShabbatSchedule;
