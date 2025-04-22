
import React from 'react';
import Header from '@/components/Header';
import ScheduleDisplay from '@/components/ScheduleDisplay';
import { ShabbatDataResponse } from '@/types/shabbat';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface SimulationDisplayProps {
  headerTitle: string;
  hebrewDate: string;
  gregorianDate: string;
  todayHoliday: string;
  dailyTimes: Array<{ name: string; time: string; isNext?: boolean }>;
  dailyPrayers: Array<{ name: string; time: string }>;
  dailyClasses: Array<{ name: string; time: string }>;
  shabbatData: ShabbatDataResponse;
  isRoshChodesh: boolean;
  currentDate: Date;
}

const SimulationDisplay: React.FC<SimulationDisplayProps> = ({
  headerTitle,
  hebrewDate,
  gregorianDate,
  todayHoliday,
  dailyTimes,
  dailyPrayers,
  dailyClasses,
  shabbatData,
  isRoshChodesh,
  currentDate
}) => {
  // Mock forceRefresh function for simulation purposes
  const mockForceRefresh = async () => {
    console.log('Simulation mode: refresh not available');
    return Promise.resolve();
  };

  return (
    <div className="relative">
      <Alert className="mb-4 bg-yellow-50 border-yellow-200">
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-800">
          מצב סימולציה - צפייה מקדימה בנתונים עבור {gregorianDate}
        </AlertDescription>
      </Alert>
      
      <Header 
        shabbatName={headerTitle}
        hebrewDate={hebrewDate}
        gregorianDate={gregorianDate}
        todayHoliday={todayHoliday}
      />
      
      <ScheduleDisplay 
        dailyTimes={dailyTimes}
        dailyPrayers={dailyPrayers}
        dailyClasses={dailyClasses}
        shabbatData={shabbatData}
        isRoshChodesh={isRoshChodesh}
        hebrewDate={hebrewDate}
        gregorianDate={gregorianDate}
        currentDate={currentDate}
        dataLoaded={true}
        forceRefresh={mockForceRefresh}
        todayHoliday={todayHoliday}
      />
    </div>
  );
};

export default SimulationDisplay;
