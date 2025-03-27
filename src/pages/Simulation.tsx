
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import ScheduleDisplay from '@/components/ScheduleDisplay';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDailyTimes } from '@/hooks/useDailyTimes';
import { useDailySchedule } from '@/hooks/useDailySchedule';
import { useShabbatData } from '@/hooks/useShabbatData';
import { useDateInfo } from '@/hooks/useDateInfo';
import { Loader } from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

/**
 * Simulation Page Component
 * 
 * This page allows users to see how the schedule will look on a specific date.
 */
const Simulation = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [appliedDate, setAppliedDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Get Hebrew date for the selected date
  const { getHebrewDate } = useDateInfo();
  const [hebrewDate, setHebrewDate] = useState('');
  const [gregorianDate, setGregorianDate] = useState('');
  
  // Get data for the simulation based on the applied date
  const { dailyTimes } = useDailyTimes(appliedDate || undefined);
  const { dailyPrayers, dailyClasses, isRoshChodesh } = useDailySchedule(appliedDate || undefined);
  const { shabbatData } = useShabbatData(appliedDate || undefined);
  
  // Apply the selected date for simulation
  const applyDate = async () => {
    setIsLoading(true);
    
    try {
      // Get Hebrew date for display
      const hebrew = await getHebrewDate(selectedDate);
      setHebrewDate(hebrew);
      
      // Format Gregorian date as dd/mm/yyyy
      const gregorian = format(selectedDate, 'dd/MM/yyyy', { locale: he });
      setGregorianDate(gregorian);
      
      // Set the applied date to trigger data fetching
      setAppliedDate(selectedDate);
    } catch (error) {
      console.error('Error applying date:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get the Hebrew day of week
  const getHebrewDayOfWeek = (date: Date) => {
    const daysInHebrew = ['יום ראשון', 'יום שני', 'יום שלישי', 'יום רביעי', 'יום חמישי', 'יום שישי', 'שבת קודש'];
    return daysInHebrew[date.getDay()];
  };
  
  // Get the title for the header based on day of week
  const getHeaderTitle = () => {
    if (!appliedDate) return '';
    
    const dayOfWeek = appliedDate.getDay();
    if (dayOfWeek === 6) {
      // If it's Shabbat, use the Shabbat title
      return shabbatData.title;
    } else {
      // For weekdays, show the day of week
      return getHebrewDayOfWeek(appliedDate);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 text-center">סימולציית לוח זמנים</h1>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>בחירת תאריך</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6 items-center justify-center">
              <div className="border rounded-lg p-3">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="pointer-events-auto"
                />
              </div>
              
              <div className="flex flex-col gap-4">
                <div className="text-center">
                  <h3 className="font-medium mb-1">תאריך נבחר:</h3>
                  <p className="text-lg font-bold">{format(selectedDate, 'dd/MM/yyyy')}</p>
                  <p className="text-md">{getHebrewDayOfWeek(selectedDate)}</p>
                </div>
                
                <Button 
                  onClick={applyDate} 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      טוען נתונים...
                    </>
                  ) : "הצג נתונים"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {appliedDate && (
          <>
            <Header 
              shabbatName={getHeaderTitle()}
              hebrewDate={hebrewDate}
              gregorianDate={gregorianDate}
            />
            
            <ScheduleDisplay 
              dailyTimes={dailyTimes}
              dailyPrayers={dailyPrayers}
              dailyClasses={dailyClasses}
              shabbatData={shabbatData}
              hebrewDate={hebrewDate}
              gregorianDate={gregorianDate}
              isRoshChodesh={isRoshChodesh}
              currentDate={appliedDate}
              dataLoaded={true}
            />
          </>
        )}
      </div>
    </Layout>
  );
};

export default Simulation;
