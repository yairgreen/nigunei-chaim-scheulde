
import React from 'react';
import { cn } from '@/lib/utils';

interface TimeItem {
  name: string;
  time: string;
}

interface DailyScheduleProps {
  title?: string;
  prayers: TimeItem[];
  classes: TimeItem[];
  isRoshChodesh: boolean;
  className?: string;
}

const DailySchedule: React.FC<DailyScheduleProps> = ({
  title,
  prayers,
  classes,
  isRoshChodesh,
  className
}) => {
  return (
    <div className={cn('schedule-card bg-weekly animate-fade-in-up delay-100', className)}>
      <h2 className="text-2xl font-bold mb-2 text-title border-b pb-2 border-gray-200">לוח זמנים יומי</h2>
      <p className="text-lg font-medium mb-4">{isRoshChodesh ? 'ראש חודש' : 'יום חול'}</p>
      
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
                <span className="font-medium">{item.name}</span>
                <span className="text-title">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DailySchedule;
