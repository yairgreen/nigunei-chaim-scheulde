
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { TestTube, Database, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useSimulationData, runHebrewDateTests } from '@/hooks/useSimulationData';
import SimulationControls from '@/components/simulation/SimulationControls';
import SimulationDebugPanel from '@/components/simulation/SimulationDebugPanel';
import SimulationDisplay from '@/components/simulation/SimulationDisplay';
import DatabaseViewer from '@/components/simulation/DatabaseViewer';
import { useScheduleData } from '@/hooks/useScheduleData';
import { forceUpdate } from '@/lib/scheduler';

const Simulation = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [appliedDate, setAppliedDate] = useState<Date>(new Date());
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [showDatabase, setShowDatabase] = useState(false);
  const [testResults, setTestResults] = useState<string | null>(null);
  const [testStatus, setTestStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');

  const { dailyClasses, isRoshChodesh } = useScheduleData();
  
  const { 
    simulatedDailyTimes,
    simulatedDailyPrayers,
    simulatedShabbatData,
    simulatedHebrewDate,
    simulatedGregorianDate,
    isLoading,
    validationResult,
    simulatedTodayHoliday  // Add this to destructure the property from useSimulationData
  } = useSimulationData(appliedDate);
  
  const applyDate = () => {
    setAppliedDate(new Date(selectedDate));
    toast.success('סימולציה עודכנה בהצלחה');
  };
  
  const getHebrewDayOfWeek = (date: Date) => {
    const daysInHebrew = ['יום ראשון', 'יום שני', 'יום שלישי', 'יום רביעי', 'יום חמישי', 'יום שישי', 'שבת קודש'];
    return daysInHebrew[date.getDay()];
  };
  
  const getHeaderTitle = () => {
    return getHebrewDayOfWeek(appliedDate);
  };
  
  const runTests = async () => {
    setTestStatus('running');
    setTestResults(null);
    
    try {
      await runHebrewDateTests();
      setTestStatus('success');
      toast.success('בדיקות בוצעו בהצלחה');
    } catch (error) {
      setTestStatus('error');
      setTestResults(`Error running tests: ${error instanceof Error ? error.message : String(error)}`);
      toast.error('שגיאה בהרצת הבדיקות');
    }
  };

  const handleForceUpdate = async () => {
    try {
      toast.loading('מעדכן את כל הנתונים...');
      const success = await forceUpdate();
      if (success) {
        toast.success('כל הנתונים עודכנו בהצלחה');
      } else {
        toast.error('אירעה שגיאה בעדכון הנתונים');
      }
    } catch (error) {
      console.error('Error during force update:', error);
      toast.error('אירעה שגיאה בעדכון הנתונים');
    }
  };

  return (
    <Layout hideLogin={true}>
      <div className="py-6 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">סימולציית לוח זמנים</h1>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleForceUpdate}
              className="text-sm flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              עדכן נתונים
            </Button>
            <Button 
              variant="outline" 
              onClick={runTests}
              className="text-sm flex items-center gap-2"
              disabled={testStatus === 'running'}
            >
              <TestTube className="h-4 w-4" />
              {testStatus === 'running' ? 'מריץ בדיקות...' : 'הרץ בדיקות'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowDatabase(!showDatabase)}
              className="text-sm flex items-center gap-2"
            >
              <Database className="h-4 w-4" />
              {showDatabase ? 'הסתר database' : 'הצג מסד נתונים מלא'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowDebugInfo(!showDebugInfo)}
              className="text-sm flex items-center gap-2"
            >
              <AlertCircle className="h-4 w-4" />
              {showDebugInfo ? 'הסתר מידע דיבאג' : 'הצג מידע דיבאג'}
            </Button>
          </div>
        </div>

        {validationResult && !validationResult.isValid && (
          <SimulationDebugPanel 
            validationResult={validationResult}
            testResults={testResults}
            simulationData={{
              date: appliedDate.toISOString(),
              dayOfWeek: appliedDate.getDay(),
              hebrewDate: simulatedHebrewDate,
              gregorianDate: simulatedGregorianDate,
              dailyTimesCount: simulatedDailyTimes.length,
              dailyPrayersCount: simulatedDailyPrayers.length,
              shabbatTitle: simulatedShabbatData.title
            }}
          />
        )}
        
        {showDatabase && <DatabaseViewer />}
        
        {showDebugInfo && (
          <SimulationDebugPanel 
            testResults={testResults}
            validationResult={validationResult}
            simulationData={{
              date: appliedDate.toISOString(),
              dayOfWeek: appliedDate.getDay(),
              hebrewDate: simulatedHebrewDate,
              gregorianDate: simulatedGregorianDate,
              dailyTimesCount: simulatedDailyTimes.length,
              dailyPrayersCount: simulatedDailyPrayers.length,
              shabbatTitle: simulatedShabbatData.title
            }}
          />
        )}

        <SimulationControls
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          onApplyDate={applyDate}
          isLoading={isLoading}
        />

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner />
          </div>
        ) : (
          <SimulationDisplay
            headerTitle={getHeaderTitle()}
            hebrewDate={simulatedHebrewDate}
            gregorianDate={simulatedGregorianDate}
            dailyTimes={simulatedDailyTimes}
            dailyPrayers={simulatedDailyPrayers}
            dailyClasses={dailyClasses}
            shabbatData={simulatedShabbatData}
            isRoshChodesh={isRoshChodesh}
            currentDate={appliedDate}
            todayHoliday={simulatedTodayHoliday || ""}  // Added this line with fallback to empty string
          />
        )}
      </div>
    </Layout>
  );
};

export default Simulation;
