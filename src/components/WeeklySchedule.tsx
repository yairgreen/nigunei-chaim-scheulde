
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
  // Get current day of week in Hebrew
  const getDayOfWeekInHebrew = () => {
    const daysInHebrew = ['יום ראשון', 'יום שני', 'יום שלישי', 'יום רביעי', 'יום חמישי', 'יום שישי', 'יום שבת'];
    const dayIndex = new Date().getDay(); // 0 is Sunday
    return daysInHebrew[dayIndex];
  };

  return (
    <div className={cn('schedule-card bg-weekly animate-fade-in-up delay-100', className)}>
      <h2 className="text-2xl font-bold mb-2 text-title border-b pb-2 border-gray-200">לוח זמנים יומי</h2>
      <p className="text-lg font-medium mb-4">
        {isRoshChodesh ? 'ראש חודש' : getDayOfWeekInHebrew()}
      </p>
      
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
              <div key={index} className="flex flex-col mb-3 last:mb-0">
                <div className="flex justify-between w-full">
                  <span className="font-medium">{item.name.split(' מפי ')[0]}</span>
                  <span className="text-title">{item.time}</span>
                </div>
                {item.name.includes(' מפי ') && (
                  <span className="text-sm text-gray-600 text-right mt-1">{item.name.split(' מפי ')[1]}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="mt-6 pt-2 border-t border-gray-200">
        <p className="text-sm text-gray-600 text-center">
          הזמנים הקובעים לתפילות הם אלה המופיעים בלוח המודעות של בית הכנסת ומפורסמים במייל ובווטסאפ
        </p>
      </div>
    </div>
  );
};

export default DailySchedule;
