
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ShabbatTabProps {
  shabbatPrayers: { name: string; time: string }[];
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
}

const ShabbatTab: React.FC<ShabbatTabProps> = ({ 
  shabbatPrayers,
  shabbatTimes,
  handleUpdateShabbatPrayerTime,
  setShabbatTimes
}) => {
  const [editMode, setEditMode] = useState<boolean>(false);
  
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
          <div key={index} className="flex items-center justify-between">
            <span className="font-medium">{prayer.name}</span>
            <Input
              type="time"
              value={prayer.time}
              onChange={(e) => handleUpdateShabbatPrayerTime(index, e.target.value)}
              className="w-32 text-left"
              readOnly={!editMode}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShabbatTab;
