
import React from 'react';
import Header from '@/components/Header';
import ScheduleDisplay from '@/components/ScheduleDisplay';
import { ShabbatDataResponse } from '@/types/shabbat';

interface SimulationDisplayProps {
  headerTitle: string;
  hebrewDate: string;
  gregorianDate: string;
  todayHoliday: string;  // Added this line
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
  todayHoliday,  // Added this line
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
    <>
      <Header 
        shabbatName={headerTitle}
        hebrewDate={hebrewDate}
        gregorianDate={gregorianDate}
        todayHoliday={todayHoliday}  // Added this line
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
        todayHoliday={todayHoliday}  // Added this line
      />
    </>
  );
};

export default SimulationDisplay;
