
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type DailyScheduleProps = {
  prayers: { name: string; time: string; isNext?: boolean }[];
  classes: { name: string; time: string }[];
  isRoshChodesh: boolean;
};

const DailySchedule: React.FC<DailyScheduleProps> = ({ prayers, classes, isRoshChodesh }) => {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold">
          זמני תפילות יומיים
          {isRoshChodesh && <span className="text-indigo-500 mr-2 text-base">(ראש חודש)</span>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
          <div className="space-y-1.5">
            <h3 className="font-semibold text-lg mb-2">תפילות</h3>
            {prayers.map((prayer, index) => (
              <div 
                key={index} 
                className={`flex justify-between py-1 ${
                  prayer.isNext ? 'bg-blue-50 font-bold -mx-2 px-2 rounded-md' : ''
                }`}
              >
                <span>{prayer.name}</span>
                <span>{prayer.time}</span>
              </div>
            ))}
          </div>
          
          {classes.length > 0 && (
            <div className="space-y-1.5 pt-3 border-t">
              <h3 className="font-semibold text-lg mb-2">שיעורים</h3>
              {classes.map((cls, index) => (
                <div key={index} className="flex justify-between py-1">
                  <span className="text-sm line-clamp-1">{cls.name}</span>
                  <span>{cls.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DailySchedule;
