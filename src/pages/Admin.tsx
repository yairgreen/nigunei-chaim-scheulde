
import React, { useEffect } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAdminState } from '@/hooks/useAdminState';
import DailyPrayersTab from '@/components/admin/DailyPrayersTab';
import ShabbatTab from '@/components/admin/ShabbatTab';
import ClassesTab from '@/components/admin/ClassesTab';
import QuickLinks from '@/components/admin/QuickLinks';
import AdminHeader from '@/components/admin/AdminHeader';
import ReloadData from '@/components/admin/ReloadData';

const Admin = () => {
  const { toast } = useToast();
  const {
    isDemoMode,
    prayers,
    classes,
    shabbatPrayers,
    shabbatTimes,
    setShabbatTimes,
    handleUpdatePrayerTime,
    handleUpdateClassName,
    handleUpdateClassTime,
    handleUpdateShabbatPrayerTime
  } = useAdminState();
  
  useEffect(() => {
    toast({
      title: "מצב דמו",
      description: "המסך מוצג במצב דמו. שינויים לא יישמרו באופן קבוע.",
    });
  }, [toast]);
  
  const handleSaveChanges = () => {
    // In a real implementation, this would save to a database or localStorage
    // For now, just show a toast
    toast({
      title: "השינויים נשמרו בהצלחה",
      description: "הזמנים המעודכנים יופיעו בלוח הזמנים",
    });
  };
  
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <AdminHeader isDemoMode={isDemoMode} />
        
        <Tabs defaultValue="daily" className="space-y-6">
          <TabsList className="w-full bg-white shadow">
            <TabsTrigger value="daily" className="flex-1">זמנים יומיים</TabsTrigger>
            <TabsTrigger value="shabbat" className="flex-1">זמני שבת</TabsTrigger>
            <TabsTrigger value="classes" className="flex-1">שיעורים</TabsTrigger>
            <TabsTrigger value="reload" className="flex-1">עדכון נתונים</TabsTrigger>
          </TabsList>
          
          <TabsContent value="daily" className="space-y-6">
            <DailyPrayersTab 
              prayers={prayers} 
              handleUpdatePrayerTime={handleUpdatePrayerTime} 
            />
          </TabsContent>
          
          <TabsContent value="shabbat" className="space-y-6">
            <ShabbatTab 
              shabbatPrayers={shabbatPrayers}
              shabbatTimes={shabbatTimes}
              handleUpdateShabbatPrayerTime={handleUpdateShabbatPrayerTime}
              setShabbatTimes={setShabbatTimes}
            />
          </TabsContent>
          
          <TabsContent value="classes" className="space-y-6">
            <ClassesTab 
              classes={classes}
              handleUpdateClassName={handleUpdateClassName}
              handleUpdateClassTime={handleUpdateClassTime}
            />
          </TabsContent>
          
          <TabsContent value="reload" className="space-y-6">
            <ReloadData />
          </TabsContent>
        </Tabs>
        
        <div className="mt-8 flex justify-end">
          <Button onClick={handleSaveChanges}>שמור שינויים</Button>
        </div>
        
        <QuickLinks />
      </div>
    </Layout>
  );
};

export default Admin;
