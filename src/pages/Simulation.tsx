
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import ScheduleDisplay from '@/components/ScheduleDisplay';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, addDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { useScheduleData } from '@/hooks/useScheduleData';

const Simulation = () => {
  const navigate = useNavigate();
  const { dailyTimes, dailyPrayers, dailyClasses, shabbatData, isRoshChodesh } = useScheduleData();
  const [date, setDate] = useState<Date>(new Date());
  
  // Simulated Hebrew date - this would come from an API in a real implementation
  const simulatedHebrewDate = "כ״ג אדר תשפ״ה";
  const simulatedGregorianDate = format(date, 'dd/MM/yyyy');
  
  // Calculate if the selected date is Shabbat
  const isShabbat = date.getDay() === 6; // 6 is Saturday
  
  // Adjust times for future dates (this is just a simulation)
  const adjustTimeForFutureDate = (time: string, daysFromNow: number): string => {
    const [hours, minutes] = time.split(':').map(Number);
    const adjustedHours = (hours + Math.floor(daysFromNow / 7)) % 24;
    return `${String(adjustedHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  };
  
  // Calculate days from now
  const daysFromNow = Math.floor((date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  
  // Adjust all times for the selected date
  const adjustedDailyTimes = dailyTimes.map(time => ({
    ...time,
    time: adjustTimeForFutureDate(time.time, daysFromNow)
  }));
  
  const adjustedDailyPrayers = dailyPrayers.map(prayer => ({
    ...prayer,
    time: adjustTimeForFutureDate(prayer.time, daysFromNow)
  }));
  
  const adjustedShabbatData = {
    ...shabbatData,
    candlesPT: adjustTimeForFutureDate(shabbatData.candlesPT, daysFromNow),
    candlesTA: adjustTimeForFutureDate(shabbatData.candlesTA, daysFromNow),
    havdala: adjustTimeForFutureDate(shabbatData.havdala, daysFromNow),
    prayers: shabbatData.prayers.map(prayer => ({
      ...prayer,
      time: adjustTimeForFutureDate(prayer.time, daysFromNow)
    }))
  };
  
  return (
    <Layout>
      <div className="py-6 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">סימולציית לוח זמנים</h1>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => navigate('/')}>לדף הראשי</Button>
            <Button variant="outline" onClick={() => navigate('/admin')}>לדף ניהול</Button>
          </div>
        </div>
        
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
              {/* Find next Shabbat */}
              <Button 
                variant="outline" 
                onClick={() => {
                  const now = new Date();
                  const daysUntilShabbat = (6 - now.getDay() + 7) % 7; // 6 is Saturday
                  const nextShabbat = addDays(now, daysUntilShabbat || 7); // If today is Shabbat, go to next week
                  setDate(nextShabbat);
                }}
              >
                שבת הבאה
              </Button>
            </div>
          </div>
        </div>
        
        <Header 
          shabbatName='סימולציית לוח זמנים'
          hebrewDate={simulatedHebrewDate}
          gregorianDate={simulatedGregorianDate}
        />
        
        <ScheduleDisplay 
          dailyTimes={adjustedDailyTimes}
          dailyPrayers={adjustedDailyPrayers}
          dailyClasses={dailyClasses}
          shabbatData={adjustedShabbatData}
          isRoshChodesh={isRoshChodesh}
          hebrewDate={simulatedHebrewDate}
          gregorianDate={simulatedGregorianDate}
          currentDate={date}
          dataLoaded={true}
        />
      </div>
    </Layout>
  );
};

export default Simulation;
