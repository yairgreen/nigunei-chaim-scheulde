
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import ScheduleDisplay from '@/components/ScheduleDisplay';
import Header from '@/components/Header';
import TimeSelector from '@/components/simulation/TimeSelector';
import { useSimulationData } from '@/hooks/simulation';
import { useScheduleData } from '@/hooks/useScheduleData';
import { Button } from '@/components/ui/button';

const Simulation = () => {
  // Keep track of both selected date and applied date
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [appliedDate, setAppliedDate] = useState<Date>(new Date());
  
  const { dailyClasses, isRoshChodesh } = useScheduleData();
  const { 
    simulatedDailyTimes, 
    simulatedDailyPrayers, 
    simulatedShabbatData,
    simulatedHebrewDate,
    simulatedGregorianDate
  } = useSimulationData(appliedDate);
  
  // Apply the selected date
  const applyDate = () => {
    setAppliedDate(selectedDate);
  };
  
  return (
    <Layout hideLogin={true}>
      <div className="py-6 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">סימולציית לוח זמנים</h1>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <TimeSelector date={selectedDate} setDate={setSelectedDate} />
          <div className="mt-4 flex justify-end">
            <Button onClick={applyDate} className="bg-accent1 hover:bg-accent1/80">
              הפעל סימולציה
            </Button>
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
          currentDate={appliedDate}
          dataLoaded={true}
        />
      </div>
    </Layout>
  );
};

export default Simulation;
