
import React from 'react';
import DailyTimes from './DailyTimes';
import DailySchedule from './WeeklySchedule';
import ShabbatSchedule from './ShabbatSchedule';
import { useIsMobile } from '@/hooks/use-mobile';
import type { ScheduleData } from '@/hooks/useScheduleData';

type ScheduleDisplayProps = ScheduleData;

const ScheduleDisplay: React.FC<ScheduleDisplayProps> = ({
  dailyTimes,
  dailyPrayers,
  dailyClasses,
  shabbatData,
  isRoshChodesh,
  hebrewDate,
  currentDate,
  getHebrewDate
}) => {
  const isMobile = useIsMobile();
  
  // Render components in different order for mobile
  if (isMobile) {
    return (
      <div className="grid grid-cols-1 gap-8 mt-8">
        <DailySchedule 
          prayers={dailyPrayers}
          classes={dailyClasses}
          isRoshChodesh={isRoshChodesh}
        />
        
        <DailyTimes 
          times={dailyTimes}
          date={hebrewDate}
        />
        
        <ShabbatSchedule 
          title={shabbatData.title}
          subtitle={shabbatData.subtitle}
          candlesPT={shabbatData.candlesPT}
          candlesTA={shabbatData.candlesTA}
          havdala={shabbatData.havdala}
          prayers={shabbatData.prayers}
          classes={shabbatData.classes}
        />
      </div>
    );
  }
  
  // Desktop layout
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
      <DailyTimes 
        times={dailyTimes}
        date={hebrewDate}
      />
      
      <DailySchedule 
        prayers={dailyPrayers}
        classes={dailyClasses}
        isRoshChodesh={isRoshChodesh}
      />
      
      <ShabbatSchedule 
        title={shabbatData.title}
        subtitle={shabbatData.subtitle}
        candlesPT={shabbatData.candlesPT}
        candlesTA={shabbatData.candlesTA}
        havdala={shabbatData.havdala}
        prayers={shabbatData.prayers}
        classes={shabbatData.classes}
      />
    </div>
  );
};

export default ScheduleDisplay;
