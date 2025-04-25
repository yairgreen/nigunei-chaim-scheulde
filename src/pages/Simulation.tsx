
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { TestTube, Database, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useSimulationData } from '@/hooks/useSimulationData';
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
    simulatedTodayHoliday
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
      // Test database connectivity
      const { data, error } = await fetch('/api/test-db-connection').then(res => res.json());
      
      if (error) {
        setTestResults(`Database connection error: ${error.message}`);
        setTestStatus('error');
        toast.error('שגיאה בחיבור למסד הנתונים');
      } else {
        setTestResults(`Database connection successful. Connected to Supabase project: ${data.projectId}`);
        setTestStatus('success');
        toast.success('בדיקת חיבור למסד הנתונים הצליחה');
      }
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
              {testStatus === 'running' ? 'בודק חיבור...' : 'בדוק חיבור לדאטהבייס'}
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

        {testResults && (
          <div className={`p-4 mb-4 border ${testStatus === 'success' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'} rounded-md`}>
            <p className="text-sm">{testResults}</p>
          </div>
        )}
        
        {showDatabase && <DatabaseViewer />}
        
        {showDebugInfo && (
          <SimulationDebugPanel 
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
            todayHoliday={simulatedTodayHoliday || ""}
          />
        )}
      </div>
    </Layout>
  );
};

export default Simulation;
