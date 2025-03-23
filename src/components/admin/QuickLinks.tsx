
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const QuickLinks: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="mt-12 border-t pt-8">
      <h2 className="text-xl font-medium mb-4">קישורים מהירים</h2>
      <div className="flex flex-wrap gap-4">
        <Button 
          variant="outline" 
          onClick={() => {
            navigate('/');
          }}
        >
          לדף הראשי
        </Button>
        <Button 
          variant="outline" 
          onClick={() => {
            navigate('/simulation');
          }}
        >
          לדף סימולציה
        </Button>
      </div>
    </div>
  );
};

export default QuickLinks;
