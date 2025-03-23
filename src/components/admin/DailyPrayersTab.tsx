
import React from 'react';
import { Input } from '@/components/ui/input';

interface DailyPrayersTabProps {
  prayers: { name: string; time: string }[];
  handleUpdatePrayerTime: (index: number, time: string) => void;
}

const DailyPrayersTab: React.FC<DailyPrayersTabProps> = ({ 
  prayers, 
  handleUpdatePrayerTime 
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-medium mb-4">תפילות יומיות</h2>
      <div className="space-y-4">
        {prayers.map((prayer, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="font-medium">{prayer.name}</span>
            <Input
              type="time"
              value={prayer.time}
              onChange={(e) => handleUpdatePrayerTime(index, e.target.value)}
              className="w-32 text-left"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default DailyPrayersTab;
