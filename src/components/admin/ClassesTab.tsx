
import React from 'react';
import { Input } from '@/components/ui/input';

interface ClassesTabProps {
  classes: { name: string; time: string }[];
  handleUpdateClassName: (index: number, name: string) => void;
  handleUpdateClassTime: (index: number, time: string) => void;
}

const ClassesTab: React.FC<ClassesTabProps> = ({ 
  classes, 
  handleUpdateClassName, 
  handleUpdateClassTime 
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-medium mb-4">שיעורים</h2>
      <div className="space-y-6">
        {classes.map((classItem, index) => (
          <div key={index} className="space-y-2 border-b pb-4 last:border-0">
            <div className="flex flex-col space-y-2">
              <label className="block text-sm font-medium">שם השיעור</label>
              <Input
                value={classItem.name}
                onChange={(e) => handleUpdateClassName(index, e.target.value)}
              />
            </div>
            <div className="flex flex-col space-y-2">
              <label className="block text-sm font-medium">זמן</label>
              <Input
                value={classItem.time}
                onChange={(e) => handleUpdateClassTime(index, e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClassesTab;
