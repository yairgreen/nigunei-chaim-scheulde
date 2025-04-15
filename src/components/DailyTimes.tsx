
import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface TimeItem {
  name: string;
  time: string;
  isNext?: boolean;
}

interface DailyTimesProps {
  times: TimeItem[];
  date: string;
  className?: string;
}

const DailyTimes: React.FC<DailyTimesProps> = ({
  times,
  date,
  className
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [localTimes, setLocalTimes] = useState<TimeItem[]>(times);
  
  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Format the current time as HH:MM
  const formattedTime = currentTime.toLocaleTimeString('he-IL', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  
  // Update times when prop times change or current time changes
  useEffect(() => {
    if (times.length === 0) return;
    
    // Make a deep copy of the times array to avoid modifying props
    const timesCopy = times.map(item => ({ ...item }));
    
    // Reset all isNext flags
    timesCopy.forEach(item => {
      item.isNext = false;
    });
    
    // Current time in HH:MM format
    const now = formattedTime;
    
    // Find the next time that hasn't passed yet
    const nextTimeIndex = timesCopy.findIndex(item => item.time > now);
    if (nextTimeIndex !== -1) {
      timesCopy[nextTimeIndex].isNext = true;
    }
    
    setLocalTimes(timesCopy);
  }, [times, formattedTime]);
  
  return (
    <div className={cn('schedule-card bg-times animate-fade-in-up delay-200', className)}>
      <h2 className="text-2xl font-bold mb-2 text-title border-b pb-2 border-accent1/20">זמני היום</h2>
      <p className="text-lg font-medium mb-4">זמני הלכה</p>
      
      <div className="flex justify-between items-center mb-6 bg-white/50 p-4 rounded-lg">
        <div>
          <h3 className="font-medium">תאריך</h3>
          <p className="font-bold">{date}</p>
        </div>
        <div className="h-10 w-px bg-gray-300"></div>
        <div>
          <h3 className="font-medium">שעה נוכחית</h3>
          <p className="font-bold animate-subtle-pulse">{formattedTime}</p>
        </div>
      </div>
      
      <div className="space-y-1">
        {localTimes.map((item, index) => (
          <div 
            key={index} 
            className={cn(
              "time-item",
              item.isNext && "bg-accent1/10 rounded-lg px-2 -mx-2 border-accent1/20"
            )}
          >
            <span className="font-medium">{item.name}</span>
            <span className={cn(
              "text-title",
              item.isNext && "font-bold text-accent1"
            )}>
              {item.time}
              {item.isNext && <span className="text-xs mr-2 py-1 px-2 bg-accent1/20 rounded-full">הבא</span>}
            </span>
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-xs text-gray-500 text-center bg-white/50 p-2 rounded">
        הזמנים מתעדכנים אוטומטית לפי אופק פתח תקוה
      </div>
    </div>
  );
};

export default DailyTimes;
