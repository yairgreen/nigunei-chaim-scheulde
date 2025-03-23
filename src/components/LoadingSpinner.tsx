
import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex justify-center items-center py-20">
      <div className="animate-pulse text-center">
        <p className="text-xl">טוען נתונים...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
