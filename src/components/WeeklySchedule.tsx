
import React from 'react';
import { cn } from '@/lib/utils';

interface Prayer {
  name: string;
  sunday: string;
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
}

interface WeeklyClass {
  day: string;
  name: string;
  time: string;
}

interface WeeklyScheduleProps {
  prayers: Prayer[];
  classes: WeeklyClass[];
  className?: string;
}

const WeeklySchedule: React.FC<WeeklyScheduleProps> = ({
  prayers,
  classes,
  className
}) => {
  // Hebrew day names
  const dayNames = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי"];
  
  return (
    <div className={cn('schedule-card bg-weekly animate-fade-in-up delay-100', className)}>
      <h2 className="text-2xl font-bold mb-4 text-title border-b pb-2 border-gray-200">לוח זמנים שבועי</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-title">תפילות</h3>
        
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="py-2 px-3 text-right font-medium bg-gray-50 rounded-tl-lg"></th>
                {dayNames.map((day, index) => (
                  <th key={index} className={cn(
                    "py-2 px-3 text-right font-medium bg-gray-50",
                    index === dayNames.length - 1 ? "rounded-tr-lg" : ""
                  )}>
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {prayers.map((prayer, index) => (
                <tr key={index} className="border-b border-gray-100 last:border-0">
                  <td className="py-3 px-3 font-medium">{prayer.name}</td>
                  <td className="py-3 px-3">{prayer.sunday}</td>
                  <td className="py-3 px-3">{prayer.monday}</td>
                  <td className="py-3 px-3">{prayer.tuesday}</td>
                  <td className="py-3 px-3">{prayer.wednesday}</td>
                  <td className="py-3 px-3">{prayer.thursday}</td>
                  <td className="py-3 px-3">{prayer.friday}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-3 text-title">שיעורים שבועיים</h3>
        <div className="divide-y divide-gray-100">
          {classes.map((cls, index) => (
            <div key={index} className="py-3 flex justify-between">
              <div>
                <span className="font-medium">{cls.name}</span>
                <span className="text-sm text-gray-600 block">{cls.day}</span>
              </div>
              <span className="text-title">{cls.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeeklySchedule;
