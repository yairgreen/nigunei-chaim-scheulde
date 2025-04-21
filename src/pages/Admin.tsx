
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

const Admin = () => {
  const { toast } = useToast();
  const {
    prayers,
    handleAddOverride,
    handleRemoveOverride,
    // השאר כפי שהיה
    // ... השארת נתונים לקלאסים, שבת, וכו'
  } = useAdminState();
  
  useEffect(() => {
    toast({
      title: "מצב דמו",
      description: "המסך מוצג במצב דמו. שינויים לא יישמרו באופן קבוע.",
    });
  }, [toast]);
  
  const handleSaveChanges = () => {
    toast({
      title: "השינויים נשמרו בהצלחה",
      description: "הזמנים המעודכנים יופיעו בלוח הזמנים",
    });
  };
  
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <AdminHeader isDemoMode={true} />
        
        <Tabs defaultValue="daily" className="space-y-6">
          <TabsList className="w-full bg-white shadow">
            <TabsTrigger value="daily" className="flex-1">זמנים יומיים</TabsTrigger>
            <TabsTrigger value="shabbat" className="flex-1">זמני שבת</TabsTrigger>
            <TabsTrigger value="classes" className="flex-1">שיעורים</TabsTrigger>
          </TabsList>
          
          <TabsContent value="daily" className="space-y-6">
            <DailyPrayersTab
              prayers={prayers}
              onAddOverride={handleAddOverride}
              onRemoveOverride={handleRemoveOverride}
            />
          </TabsContent>
          
          <TabsContent value="shabbat" className="space-y-6">
            <ShabbatTab />
          </TabsContent>
          
          <TabsContent value="classes" className="space-y-6">
            <ClassesTab />
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
