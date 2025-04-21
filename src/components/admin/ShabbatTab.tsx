
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PrayerOverrideForm } from './PrayerOverrideForm';
import type { Prayer } from '@/lib/database/types/prayers';

interface ShabbatTabProps {
  shabbatPrayers: Prayer[];
  shabbatTimes: {
    candlesPT: string;
    candlesTA: string;
    havdala: string;
  };
  handleUpdateShabbatPrayerTime: (index: number, time: string) => void;
  setShabbatTimes: React.Dispatch<React.SetStateAction<{
    candlesPT: string;
    candlesTA: string;
    havdala: string;
  }>>;
  handleAddOverride: (prayerId: string, data: {
    time: string;
    startDate: string;
    endDate: string;
    dayOfWeek?: number | null;
  }) => Promise<void>;
  handleRemoveOverride: (prayerId: string, overrideId: string) => Promise<void>;
}

const ShabbatTab: React.FC<ShabbatTabProps> = ({ 
  shabbatPrayers,
  shabbatTimes,
  handleUpdateShabbatPrayerTime,
  setShabbatTimes,
  handleAddOverride,
  handleRemoveOverride
}) => {
  const [editMode, setEditMode] = useState<boolean>(false);
  const [showOverrideForm, setShowOverrideForm] = useState<string | null>(null);
  
  const getDayOfWeekName = (day: number | null) => {
    if (day === null) return 'כל הימים';
    const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
    return days[day];
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-medium">זמני שבת</h2>
        <Button 
          variant={editMode ? "default" : "outline"} 
          size="sm"
          onClick={() => setEditMode(!editMode)}
        >
          {editMode ? 'סיים עריכה' : 'ערוך זמנים'}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">הדלקת נרות (פ"ת)</label>
          <Input
            type="time"
            value={shabbatTimes.candlesPT}
            onChange={(e) => setShabbatTimes({...shabbatTimes, candlesPT: e.target.value})}
            className="text-left"
            readOnly={!editMode}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">הדלקת נרות (ת"א)</label>
          <Input
            type="time"
            value={shabbatTimes.candlesTA}
            onChange={(e) => setShabbatTimes({...shabbatTimes, candlesTA: e.target.value})}
            className="text-left"
            readOnly={!editMode}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">צאת שבת</label>
          <Input
            type="time"
            value={shabbatTimes.havdala}
            onChange={(e) => setShabbatTimes({...shabbatTimes, havdala: e.target.value})}
            className="text-left"
            readOnly={!editMode}
          />
        </div>
      </div>
      
      <h3 className="text-lg font-medium mb-4">תפילות שבת</h3>
      <div className="space-y-4">
        {shabbatPrayers.map((prayer, index) => (
          <div key={prayer.id} className="border p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">{prayer.name}</span>
              {!prayer.overrideTime && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowOverrideForm(prayer.id)}
                  disabled={!editMode}
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
                  onChange={(e) => handleUpdateShabbatPrayerTime(index, e.target.value)}
                  className="text-left"
                  readOnly={true}
                />
              </div>
              
              {/* זמן נדרס */}
              {prayer.overrideTime && (
                <div>
                  <label className="text-sm text-gray-500 block mb-1">זמן נדרס</label>
                  <div className="flex gap-2">
                    <Input
                      type="time"
                      value={prayer.overrideTime}
                      className="text-left"
                      readOnly={true}
                    />
                    {editMode && prayer.overrideInfo && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveOverride(prayer.id, prayer.overrideInfo!.id)}
                      >
                        בטל
                      </Button>
                    )}
                  </div>
                </div>
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
                    await handleAddOverride(prayer.id, data);
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

export default ShabbatTab;
