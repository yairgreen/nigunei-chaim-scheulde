
import React, { useState } from 'react';
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
import { forceUpdate } from '@/lib/scheduler';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader } from 'lucide-react';

const Admin = () => {
  const { toast } = useToast();
  const {
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
  
  const [refreshLogsVisible, setRefreshLogsVisible] = useState(false);
  const [refreshLogs, setRefreshLogs] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handleSaveChanges = () => {
    // In a real implementation, this would save to a database or localStorage
    // For now, just show a toast
    toast({
      title: "השינויים נשמרו בהצלחה",
      description: "הזמנים המעודכנים יופיעו בלוח הזמנים",
    });
  };
  
  const handleForceRefresh = async () => {
    setIsRefreshing(true);
    setRefreshLogs('מתחיל רענון נתונים...\n');
    setRefreshLogsVisible(true);
    
    try {
      // Use the global console.log to capture logs
      const originalConsoleLog = console.log;
      const originalConsoleError = console.error;
      const originalConsoleWarn = console.warn;
      
      let logs: string[] = [];
      
      console.log = (...args) => {
        originalConsoleLog(...args);
        logs.push(args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg
        ).join(' '));
        setRefreshLogs(prev => prev + args.join(' ') + '\n');
      };
      
      console.error = (...args) => {
        originalConsoleError(...args);
        logs.push('שגיאה: ' + args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg
        ).join(' '));
        setRefreshLogs(prev => prev + 'שגיאה: ' + args.join(' ') + '\n');
      };
      
      console.warn = (...args) => {
        originalConsoleWarn(...args);
        logs.push('אזהרה: ' + args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg
        ).join(' '));
        setRefreshLogs(prev => prev + 'אזהרה: ' + args.join(' ') + '\n');
      };
      
      // Perform the update
      const result = await forceUpdate();
      
      // Restore console functions
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
      
      if (result.success) {
        toast({
          title: "הנתונים עודכנו בהצלחה",
          description: "הזמנים המעודכנים יופיעו בלוח הזמנים",
        });
      } else {
        toast({
          title: "שגיאה בעדכון הנתונים",
          description: result.error || "אירעה שגיאה לא ידועה",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "שגיאה בעדכון הנתונים",
        description: error instanceof Error ? error.message : "אירעה שגיאה לא ידועה",
        variant: "destructive"
      });
      
      setRefreshLogs(prev => prev + 'שגיאה: ' + (error instanceof Error ? error.message : String(error)) + '\n');
    } finally {
      setIsRefreshing(false);
    }
  };
  
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <AdminHeader />
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>רענון נתונים</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <p>לחץ על הכפתור כדי לרענן את כל הנתונים מהשרת ולחשב מחדש את הזמנים הדינמיים.</p>
              <div className="flex gap-4">
                <Button 
                  onClick={handleForceRefresh} 
                  disabled={isRefreshing}
                  className="w-fit"
                >
                  {isRefreshing ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      מרענן נתונים...
                    </>
                  ) : "רענן נתונים"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setRefreshLogsVisible(!refreshLogsVisible)}
                  className="w-fit"
                >
                  {refreshLogsVisible ? "הסתר לוג" : "הצג לוג"}
                </Button>
              </div>
              
              {refreshLogsVisible && (
                <Textarea
                  value={refreshLogs}
                  readOnly
                  className="font-mono text-sm h-64 overflow-auto direction-ltr"
                  dir="ltr"
                />
              )}
            </div>
          </CardContent>
        </Card>
        
        <Tabs defaultValue="daily" className="space-y-6">
          <TabsList className="w-full bg-white shadow">
            <TabsTrigger value="daily" className="flex-1">זמנים יומיים</TabsTrigger>
            <TabsTrigger value="shabbat" className="flex-1">זמני שבת</TabsTrigger>
            <TabsTrigger value="classes" className="flex-1">שיעורים</TabsTrigger>
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
