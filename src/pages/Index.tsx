
import React from 'react';
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
  
  const handleRefresh = async () => {
    toast.info('מרענן את כל הנתונים...');
    try {
      await forceRefresh();
      toast.success('הנתונים עודכנו בהצלחה');
    } catch (error) {
      toast.error('שגיאה בעדכון הנתונים');
      console.error('Error refreshing data:', error);
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
        >
          <RefreshCw size={14} />
          <span>רענן נתונים</span>
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
