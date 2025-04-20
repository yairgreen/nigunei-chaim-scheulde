
import React from 'react';
import { Button } from '@/components/ui/button';
import type { PrayerOverride } from '@/lib/database/types/prayers';
import { format } from 'date-fns';

interface PrayerOverrideDisplayProps {
  override: PrayerOverride;
  onDelete: () => void;
}

const getDayName = (day: number | null) => {
  if (day === null) return 'כל הימים';
  const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  return days[day];
};

export function PrayerOverrideDisplay({ override, onDelete }: PrayerOverrideDisplayProps) {
  return (
    <div className="bg-muted p-3 rounded-md text-sm space-y-2">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <p>
            <span className="font-semibold">זמן נדרס: </span>
            {override.override_time}
          </p>
          <p>
            <span className="font-semibold">תקף מתאריך: </span>
            {format(new Date(override.start_date), 'dd/MM/yyyy')}
          </p>
          <p>
            <span className="font-semibold">עד תאריך: </span>
            {format(new Date(override.end_date), 'dd/MM/yyyy')}
          </p>
          <p>
            <span className="font-semibold">ימים: </span>
            {getDayName(override.day_of_week)}
          </p>
        </div>
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={onDelete}
        >
          בטל דריסה
        </Button>
      </div>
    </div>
  );
}
