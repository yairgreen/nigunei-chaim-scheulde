
import React from 'react';
import { useScheduleData } from '@/hooks/useScheduleData';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LoadingSpinner from '@/components/LoadingSpinner';
import ScheduleDisplay from '@/components/ScheduleDisplay';

const Index = () => {
  const scheduleData = useScheduleData();
  const { dataLoaded, hebrewDate, gregorianDate } = scheduleData;

  return (
    <Layout>
      <Header 
        shabbatName='לוח זמנים - בית כנסת "ניגוני חיים"'
        hebrewDate={hebrewDate}
        gregorianDate={gregorianDate}
      />
      
      {dataLoaded ? (
        <ScheduleDisplay {...scheduleData} />
      ) : (
        <LoadingSpinner />
      )}
      
      <Footer 
        greeting="שבת שלום ומבורך"
        contactInfo='לשאלות וברורים: 054-1234567 | קהילת בית הכנסת "ניגוני חיים"'
      />
    </Layout>
  );
};

export default Index;
