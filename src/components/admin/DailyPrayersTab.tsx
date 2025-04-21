
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PrayerOverrideForm } from './PrayerOverrideForm';
import type { Prayer } from '@/lib/database/types/prayers';

interface DailyPrayersTabProps {
  prayers: Prayer[];
  onAddOverride: (
    prayerId: string,
    data: {
      time: string;
      startDate: string;
      endDate: string;
      dayOfWeek?: number | null;
    }
  ) => Promise<void>;
  onRemoveOverride: (prayerId: string, overrideId: string) => Promise<void>;
}

const DailyPrayersTab: React.FC<DailyPrayersTabProps> = ({
  prayers,
  onAddOverride,
  onRemoveOverride
}) => {
  const [showOverrideForm, setShowOverrideForm] = useState<string | null>(null);
  
  const getDayOfWeekName = (day: number | null) => {
    if (day === null) return 'כל הימים';
    const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
    return days[day];
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-medium mb-4">תפילות יומיות</h2>
      <div className="space-y-4">
        {prayers.map((prayer) => (
          <div key={prayer.id} className="border p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">{prayer.name}</h3>
              {!prayer.overrideTime && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowOverrideForm(prayer.id)}
                >
                  הוסף דריסת זמן
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* זמן מחושב */}
              <div>
                <label className="text-sm text-gray-500 block mb-1">זמן מחושב</label>
                <Input
                  type="time"
                  value={prayer.defaultTime}
                  readOnly
                  className="w-full"
                />
              </div>
              
              {/* זמן נדרס */}
              {prayer.overrideTime ? (
                <div>
                  <label className="text-sm text-gray-500 block mb-1">זמן נדרס</label>
                  <div className="flex gap-2">
                    <Input
                      type="time"
                      value={prayer.overrideTime}
                      readOnly
                      className="w-full"
                    />
                    {prayer.overrideInfo && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onRemoveOverride(prayer.id, prayer.overrideInfo!.id)}
                      >
                        בטל
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="hidden sm:block"></div>
              )}
            </div>
            
            {prayer.overrideInfo && (
              <div className="mt-2 text-xs text-gray-600">
                <span>יום: {getDayOfWeekName(prayer.overrideInfo.dayOfWeek)} | </span>
                <span>בתוקף: {new Date(prayer.overrideInfo.startDate).toLocaleDateString()} - {new Date(prayer.overrideInfo.endDate).toLocaleDateString()}</span>
              </div>
            )}
            
            {showOverrideForm === prayer.id && (
              <div className="mt-4 border-t pt-4">
                <h4 className="text-sm font-medium mb-2">הוספת דריסת זמן</h4>
                <PrayerOverrideForm
                  onSubmit={async (data) => {
                    await onAddOverride(prayer.id, data);
                    setShowOverrideForm(null);
                  }}
                  onCancel={() => setShowOverrideForm(null)}
                  defaultTime={prayer.defaultTime}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DailyPrayersTab;
