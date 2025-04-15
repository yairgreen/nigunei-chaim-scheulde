
import React, { useState } from 'react';
import { useScheduleData } from '@/hooks/useScheduleData';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import LoadingSpinner from '@/components/LoadingSpinner';
import ScheduleDisplay from '@/components/ScheduleDisplay';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const Index = () => {
  const scheduleData = useScheduleData();
  const { dataLoaded, hebrewDate, gregorianDate, forceRefresh } = scheduleData;
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    toast.info('מרענן את כל הנתונים...');
    
    try {
      await forceRefresh();
      toast.success('הנתונים עודכנו בהצלחה');
    } catch (error) {
      toast.error('שגיאה בעדכון הנתונים');
      console.error('Error refreshing data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Layout hideLogin={true}>
      <Header 
        shabbatName='לוח זמנים - בית כנסת "ניגוני חיים"'
        hebrewDate={hebrewDate}
        gregorianDate={gregorianDate}
      />
      
      <div className="flex justify-end mb-2">
        <Button 
          variant="outline" 
          size="sm"
          className="flex gap-2 items-center text-sm" 
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
          <span>{isRefreshing ? 'מעדכן...' : 'רענן נתונים'}</span>
        </Button>
      </div>
      
      {dataLoaded ? (
        <ScheduleDisplay {...scheduleData} />
      ) : (
        <LoadingSpinner />
      )}
    </Layout>
  );
};

export default Index;
