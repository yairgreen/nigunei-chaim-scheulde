
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { useForm } from 'react-hook-form';

interface DailyPrayersTabProps {
  prayers: {
    id: string;
    name: string;
    defaultTime: string;
    overrideTime?: string;
    overrideInfo?: {
      id: string;
      startDate: string;
      endDate: string;
      dayOfWeek: string | null;
    };
  }[];
  onAddOverride: (
    prayerId: string,
    data: {
      time: string;
      startDate: string;
      endDate: string;
      dayOfWeek?: string;
    }
  ) => Promise<void>;
  onRemoveOverride: (prayerId: string, overrideId: string) => Promise<void>;
}

type OverrideFormProps = {
  onSubmit: (data: {
    time: string;
    startDate: string;
    endDate: string;
    dayOfWeek?: string;
  }) => Promise<void>;
  onCancel: () => void;
};

// טופס פשוט לדריסת זמן
const OverrideForm: React.FC<OverrideFormProps> = ({ onSubmit, onCancel }) => {
  const [time, setTime] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState<string>('');

  return (
    <form className="mt-4 space-y-2" onSubmit={e => {
      e.preventDefault();
      onSubmit({ time, startDate, endDate, dayOfWeek: dayOfWeek || undefined });
    }}>
      <div className="flex gap-2">
        <Input type="time" value={time} onChange={e => setTime(e.target.value)} required />
        <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required />
        <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required />
        <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="כל הימים" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">כל הימים</SelectItem>
            <SelectItem value="ראשון">ראשון</SelectItem>
            <SelectItem value="שני">שני</SelectItem>
            <SelectItem value="שלישי">שלישי</SelectItem>
            <SelectItem value="רביעי">רביעי</SelectItem>
            <SelectItem value="חמישי">חמישי</SelectItem>
            <SelectItem value="שישי">שישי</SelectItem>
            <SelectItem value="שבת">שבת</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>ביטול</Button>
        <Button type="submit" size="sm">שמירה</Button>
      </div>
    </form>
  );
};

const DailyPrayersTab: React.FC<DailyPrayersTabProps> = ({
  prayers,
  onAddOverride,
  onRemoveOverride
}) => {
  const [showOverrideForm, setShowOverrideForm] = useState<string | null>(null);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-medium mb-4">תפילות יומיות</h2>
      <div className="space-y-6">
        {prayers.map((prayer) => (
          <div key={prayer.id} className="border p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
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
            
            <div className="grid grid-cols-2 gap-4">
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
              <div>
                <label className="text-sm text-gray-500 block mb-1">
                  {prayer.overrideTime ? 'זמן נדרס' : '\u00A0'}
                </label>
                <div className="flex gap-2">
                  <Input
                    type="time"
                    value={prayer.overrideTime || ''}
                    readOnly
                    className="w-full"
                  />
                  {prayer.overrideTime && prayer.overrideInfo && (
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
            </div>
            
            {prayer.overrideInfo && (
              <div className="mt-2 text-xs text-gray-600">
                {prayer.overrideInfo.dayOfWeek ? 
                  `יום ${prayer.overrideInfo.dayOfWeek} | ` : ''}
                בתוקף: {new Date(prayer.overrideInfo.startDate).toLocaleDateString()} - 
                {new Date(prayer.overrideInfo.endDate).toLocaleDateString()}
              </div>
            )}
            
            {showOverrideForm === prayer.id && (
              <OverrideForm
                onSubmit={async (data) => {
                  await onAddOverride(prayer.id, data);
                  setShowOverrideForm(null);
                }}
                onCancel={() => setShowOverrideForm(null)}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DailyPrayersTab;
