
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import ScheduleDisplay from '@/components/ScheduleDisplay';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, addDays, isEqual } from 'date-fns';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { useScheduleData } from '@/hooks/useScheduleData';
import { getZmanimDatabase } from '@/lib/database/zmanim';
import { calculateWeeklyMinchaTime, calculateWeeklyArvitTime } from '@/lib/database/prayers';

const Simulation = () => {
  const navigate = useNavigate();
  const { dailyTimes, dailyPrayers, dailyClasses, shabbatData, isRoshChodesh } = useScheduleData();
  const [date, setDate] = useState<Date>(new Date());
  const [simulatedDailyTimes, setSimulatedDailyTimes] = useState(dailyTimes);
  const [simulatedDailyPrayers, setSimulatedDailyPrayers] = useState(dailyPrayers);
  const [simulatedShabbatData, setSimulatedShabbatData] = useState(shabbatData);
  
  // Simulated Hebrew date - this would come from an API in a real implementation
  const simulatedHebrewDate = "כ״ג אדר תשפ״ה";
  const simulatedGregorianDate = format(date, 'dd/MM/yyyy');
  
  // Calculate if the selected date is Shabbat
  const isShabbat = date.getDay() === 6; // 6 is Saturday
  
  useEffect(() => {
    // Update the simulated data when the date changes
    if (!isEqual(date, new Date())) {
      simulateDataForDate(date);
    } else {
      // Reset to original data for today
      setSimulatedDailyTimes(dailyTimes);
      setSimulatedDailyPrayers(dailyPrayers);
      setSimulatedShabbatData(shabbatData);
    }
  }, [date, dailyTimes, dailyPrayers, shabbatData]);
  
  const simulateDataForDate = (selectedDate: Date) => {
    const zmanimDatabase = getZmanimDatabase();
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    
    // Find zmanim for the selected date or nearby dates
    const selectedDateZmanim = zmanimDatabase.find(z => z.date === formattedDate);
    
    // Simulate daily times
    if (selectedDateZmanim) {
      const simulatedTimes = [
        { name: 'עלות השחר (72 ד\')', time: selectedDateZmanim.alotHaShachar },
        { name: 'הנץ החמה', time: selectedDateZmanim.sunrise },
        { name: 'זמן טלית ותפילין', time: selectedDateZmanim.misheyakir },
        { name: 'סוף זמן ק"ש (מג״א)', time: selectedDateZmanim.sofZmanShmaMGA },
        { name: 'סוף זמן ק"ש (גר״א)', time: selectedDateZmanim.sofZmanShma },
        { name: 'סוף זמן תפילה (מג״א)', time: selectedDateZmanim.sofZmanTfillaMGA },
        { name: 'סוף זמן תפילה (גר"א)', time: selectedDateZmanim.sofZmanTfilla },
        { name: 'חצות היום והלילה', time: selectedDateZmanim.chatzot },
        { name: 'זמן מנחה גדולה', time: selectedDateZmanim.minchaGedola },
        { name: 'פלג המנחה', time: selectedDateZmanim.plagHaMincha },
        { name: 'שקיעה', time: selectedDateZmanim.sunset },
        { name: 'צאת הכוכבים', time: selectedDateZmanim.beinHaShmashos }
      ];
      setSimulatedDailyTimes(simulatedTimes);
    }
    
    // Simulate the week of the selected date for prayer times
    const dayOfWeek = selectedDate.getDay();
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(selectedDate.getDate() - dayOfWeek);
    
    // Get this week's days (Sun-Thu)
    const weekDays = [];
    for (let i = 0; i < 5; i++) {
      const weekDate = new Date(startOfWeek);
      weekDate.setDate(startOfWeek.getDate() + i);
      weekDays.push(format(weekDate, 'yyyy-MM-dd'));
    }
    
    // Filter zmanim for this week
    const zmanimForWeek = zmanimDatabase.filter(item => weekDays.includes(item.date));
    
    if (zmanimForWeek.length > 0) {
      // Calculate mincha and arvit times for the simulated week
      const simulatedMinchaTime = calculateWeeklyMinchaTime(zmanimForWeek);
      const simulatedArvitTime = calculateWeeklyArvitTime(zmanimForWeek);
      
      // Simulate prayer times
      const isSelectedDateRoshChodesh = false; // This would come from an API in a real implementation
      const simulatedPrayers = [
        { name: 'שחרית א׳', time: isSelectedDateRoshChodesh ? '06:00' : '06:15' },
        { name: 'שחרית ב׳', time: '07:00' },
        { name: 'שחרית ג׳', time: '08:00' },
        { name: 'מנחה גדולה', time: '12:30' },
        { name: 'מנחה', time: simulatedMinchaTime },
        { name: 'ערבית א׳', time: simulatedArvitTime },
        { name: 'ערבית ב׳', time: '20:45' }
      ];
      setSimulatedDailyPrayers(simulatedPrayers);
    }
    
    // Simulate Shabbat data if needed
    if (isShabbat) {
      // This would be more sophisticated in a production app
      const simulatedShabbatTimes = {
        ...shabbatData,
        candlesPT: "17:30",
        candlesTA: "17:45",
        havdala: "18:30",
        prayers: shabbatData.prayers
      };
      setSimulatedShabbatData(simulatedShabbatTimes);
    }
  };
  
  return (
    <Layout>
      <div className="py-6 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">סימולציית לוח זמנים</h1>
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
          dailyTimes={simulatedDailyTimes}
          dailyPrayers={simulatedDailyPrayers}
          dailyClasses={dailyClasses}
          shabbatData={simulatedShabbatData}
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
