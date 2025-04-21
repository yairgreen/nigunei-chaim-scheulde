
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';

interface PrayerOverrideFormProps {
  onSubmit: (data: {
    time: string;
    startDate: string;
    endDate: string;
    dayOfWeek?: number | null;
  }) => Promise<void>;
  onCancel: () => void;
  defaultTime?: string;
}

export function PrayerOverrideForm({ onSubmit, onCancel, defaultTime }: PrayerOverrideFormProps) {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [time, setTime] = useState(defaultTime || '');
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [dayOfWeek, setDayOfWeek] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let dayOfWeekNumber: number | null = null;
    if (dayOfWeek !== null && dayOfWeek !== 'all') {
      dayOfWeekNumber = parseInt(dayOfWeek);
    }
    
    await onSubmit({
      time,
      startDate,
      endDate,
      dayOfWeek: dayOfWeekNumber
    });
  };
  
  return (
    <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <div>
          <label className="block text-sm font-medium mb-1">זמן חדש</label>
          <Input 
            type="time" 
            value={time} 
            onChange={(e) => setTime(e.target.value)} 
            required 
            className="w-full"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium mb-1">תאריך התחלה</label>
            <Input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)} 
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">תאריך סיום</label>
            <Input 
              type="date" 
              value={endDate}
              min={startDate}
              onChange={(e) => setEndDate(e.target.value)} 
              required
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">יום בשבוע (אופציונלי)</label>
          <Select value={dayOfWeek || 'all'} onValueChange={setDayOfWeek}>
            <SelectTrigger>
              <SelectValue placeholder="כל הימים" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל הימים</SelectItem>
              <SelectItem value="0">ראשון</SelectItem>
              <SelectItem value="1">שני</SelectItem>
              <SelectItem value="2">שלישי</SelectItem>
              <SelectItem value="3">רביעי</SelectItem>
              <SelectItem value="4">חמישי</SelectItem>
              <SelectItem value="5">שישי</SelectItem>
              <SelectItem value="6">שבת</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          ביטול
        </Button>
        <Button type="submit" size="sm">
          שמירה
        </Button>
      </div>
    </form>
  );
}
