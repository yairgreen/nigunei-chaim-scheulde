
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import ScheduleDisplay from '@/components/ScheduleDisplay';
import Header from '@/components/Header';
import TimeSelector from '@/components/simulation/TimeSelector';
import { useSimulationData } from '@/hooks/useSimulationData';
import { useScheduleData } from '@/hooks/useScheduleData';

const Simulation = () => {
  const [date, setDate] = useState<Date>(new Date());
  const { dailyClasses, isRoshChodesh } = useScheduleData();
  const { 
    simulatedDailyTimes, 
    simulatedDailyPrayers, 
    simulatedShabbatData,
    simulatedHebrewDate,
    simulatedGregorianDate
  } = useSimulationData(date);
  
  return (
    <Layout>
      <div className="py-6 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">סימולציית לוח זמנים</h1>
        </div>
        
        <TimeSelector date={date} setDate={setDate} />
        
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
