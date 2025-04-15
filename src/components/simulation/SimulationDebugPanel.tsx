
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface SimulationDebugPanelProps {
  testResults: string | null;
  validationResult?: {
    isValid: boolean;
    expectedDate: string;
    actualDate: string;
  };
  simulationData: {
    date: string;
    dayOfWeek: number;
    hebrewDate: string;
    gregorianDate: string;
    dailyTimesCount: number;
    dailyPrayersCount: number;
    shabbatTitle: string;
  };
}

const SimulationDebugPanel: React.FC<SimulationDebugPanelProps> = ({
  testResults,
  validationResult,
  simulationData
}) => {
  if (!testResults && !validationResult) return null;

  return (
    <div className="bg-gray-50 p-4 rounded-lg mb-8 border border-gray-200 overflow-auto max-h-96 text-right">
      {validationResult && !validationResult.isValid && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>שגיאת תאריך עברי</AlertTitle>
          <AlertDescription>
            התאריך העברי שחושב אינו תואם לתאריך האמיתי.
            <br />
            צפוי: {validationResult.expectedDate}
            <br />
            בפועל: {validationResult.actualDate}
          </AlertDescription>
        </Alert>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="simulation">
          <AccordionTrigger>נתוני סימולציה (תוצאה נוכחית)</AccordionTrigger>
          <AccordionContent>
            <pre className="text-xs overflow-auto rtl:text-right ltr:text-left whitespace-pre-wrap">
              {JSON.stringify(simulationData, null, 2)}
            </pre>
          </AccordionContent>
        </AccordionItem>

        {testResults && (
          <AccordionItem value="testResults">
            <AccordionTrigger>תוצאות בדיקות</AccordionTrigger>
            <AccordionContent>
              <pre className="text-xs overflow-auto rtl:text-right ltr:text-left whitespace-pre-wrap">
                {testResults}
              </pre>
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
    </div>
  );
};

export default SimulationDebugPanel;
