
import React from 'react';
import { useScheduleData } from '@/hooks/useScheduleData';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import LoadingSpinner from '@/components/LoadingSpinner';
import ScheduleDisplay from '@/components/ScheduleDisplay';

const Index = () => {
  const scheduleData = useScheduleData();
  const { dataLoaded, hebrewDate, gregorianDate, todayHoliday } = scheduleData;

  return (
    <Layout hideLogin={true}>
      <Header 
        shabbatName='לוח זמנים - בית כנסת "ניגוני חיים"'
        hebrewDate={hebrewDate}
        gregorianDate={gregorianDate}
        todayHoliday={todayHoliday}
      />
      
      {dataLoaded ? (
        <ScheduleDisplay {...scheduleData} />
      ) : (
        <LoadingSpinner />
      )}
    </Layout>
  );
};

export default Index;
