
import React from 'react';
import Header from '@/components/Header';
import ScheduleDisplay from '@/components/ScheduleDisplay';

interface SimulationDisplayProps {
  headerTitle: string;
  hebrewDate: string;
  gregorianDate: string;
  dailyTimes: Array<{ name: string; time: string }>;
  dailyPrayers: Array<{ name: string; time: string }>;
  dailyClasses: Array<{ name: string; time: string }>;
  shabbatData: {
    title: string;
    subtitle: string;
    candlesPT: string;
    candlesTA: string;
    havdala: string;
    prayers: Array<{ name: string; time: string }>;
    classes: Array<{ name: string; time: string }>;
  };
  isRoshChodesh: boolean;
  currentDate: Date;
}

const SimulationDisplay: React.FC<SimulationDisplayProps> = ({
  headerTitle,
  hebrewDate,
  gregorianDate,
  dailyTimes,
  dailyPrayers,
  dailyClasses,
  shabbatData,
  isRoshChodesh,
  currentDate
}) => {
  return (
    <>
      <Header 
        shabbatName={headerTitle}
        hebrewDate={hebrewDate}
        gregorianDate={gregorianDate}
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
      />
    </>
  );
};

export default SimulationDisplay;
