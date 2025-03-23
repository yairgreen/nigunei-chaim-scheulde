
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, addDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';

interface TimeSelectorProps {
  date: Date;
  setDate: (date: Date) => void;
}

const TimeSelector: React.FC<TimeSelectorProps> = ({ date, setDate }) => {
  const goToNextShabbat = () => {
    const now = new Date();
    const daysUntilShabbat = (6 - now.getDay() + 7) % 7; // 6 is Saturday
    const nextShabbat = addDays(now, daysUntilShabbat || 7); // If today is Shabbat, go to next week
    setDate(nextShabbat);
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-xl font-medium mb-4">בחר תאריך לסימולציה</h2>
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full md:w-auto justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, 'dd/MM/yyyy') : <span>בחר תאריך</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => newDate && setDate(newDate)}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setDate(new Date())}
          >
            היום
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setDate(addDays(new Date(), 1))}
          >
            מחר
          </Button>
          <Button 
            variant="outline" 
            onClick={goToNextShabbat}
          >
            שבת הבאה
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TimeSelector;
