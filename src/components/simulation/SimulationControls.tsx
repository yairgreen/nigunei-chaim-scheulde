
import React from 'react';
import { Button } from '@/components/ui/button';
import TimeSelector from './TimeSelector';
import LoadingSpinner from '@/components/LoadingSpinner';

interface SimulationControlsProps {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  onApplyDate: () => void;
  isLoading: boolean;
}

const SimulationControls: React.FC<SimulationControlsProps> = ({
  selectedDate,
  setSelectedDate,
  onApplyDate,
  isLoading
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <TimeSelector date={selectedDate} setDate={setSelectedDate} />
      <div className="mt-4 flex justify-end">
        <Button 
          onClick={onApplyDate} 
          className="bg-accent1 hover:bg-accent1/80"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <LoadingSpinner />
              <span className="mr-2">טוען...</span>
            </>
          ) : (
            'הפעל סימולציה'
          )}
        </Button>
      </div>
    </div>
  );
};

export default SimulationControls;
