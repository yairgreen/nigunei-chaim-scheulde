
import React, { useEffect, useState } from 'react';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { RefreshCw } from 'lucide-react';

const Admin = () => {
  const { toast } = useToast();
  const [logMessages, setLogMessages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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
  
  // Capture console logs for display in admin panel
  useEffect(() => {
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
    
    console.log = (...args) => {
      originalConsoleLog(...args);
      setLogMessages(prev => [...prev, `LOG: ${args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ')}`]);
    };
    
    console.error = (...args) => {
      originalConsoleError(...args);
      setLogMessages(prev => [...prev, `ERROR: ${args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ')}`]);
    };
    
    console.warn = (...args) => {
      originalConsoleWarn(...args);
      setLogMessages(prev => [...prev, `WARN: ${args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ')}`]);
    };
    
    return () => {
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
    };
  }, []);
  
  const handleSaveChanges = () => {
    // In a real implementation, this would save to a database or localStorage
    // For now, just show a toast
    toast({
      title: "השינויים נשמרו בהצלחה",
      description: "הזמנים המעודכנים יופיעו בלוח הזמנים",
    });
  };
  
  const handleReloadData = async () => {
    setIsLoading(true);
    setLogMessages([]);
    
    try {
      console.log("Starting data reload from API...");
      const result = await forceUpdate();
      
      if (result) {
        toast({
          title: "נתונים עודכנו בהצלחה",
          description: "כל הנתונים נטענו מחדש מה-API"
        });
      } else {
        toast({
          title: "שגיאה בטעינת נתונים",
          description: "אירעה שגיאה בעת טעינת הנתונים. בדוק את הלוג לפרטים נוספים.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error reloading data:", error);
      toast({
        title: "שגיאה בטעינת נתונים",
        description: "אירעה שגיאה בעת טעינת הנתונים. בדוק את הלוג לפרטים נוספים.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <AdminHeader isDemoMode={isDemoMode} />
        
        <div className="mb-6 flex justify-between items-center">
          <Button 
            onClick={handleReloadData} 
            disabled={isLoading} 
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            טען נתונים מחדש מה-API
          </Button>
        </div>
        
        <Tabs defaultValue="daily" className="space-y-6">
          <TabsList className="w-full bg-white shadow">
            <TabsTrigger value="daily" className="flex-1">זמנים יומיים</TabsTrigger>
            <TabsTrigger value="shabbat" className="flex-1">זמני שבת</TabsTrigger>
            <TabsTrigger value="classes" className="flex-1">שיעורים</TabsTrigger>
            <TabsTrigger value="logs" className="flex-1">לוג עדכונים</TabsTrigger>
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
          
          <TabsContent value="logs" className="space-y-6">
            <div className="bg-white rounded-md shadow p-4">
              <h2 className="text-lg font-semibold mb-4">יומן עדכונים</h2>
              <ScrollArea className="h-[400px] border rounded-md p-4 bg-gray-50">
                {logMessages.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">אין רשומות יומן. לחץ על "טען נתונים מחדש" כדי לראות את תהליך החישוב.</p>
                ) : (
                  <pre className="text-xs whitespace-pre-wrap">
                    {logMessages.map((message, idx) => (
                      <div key={idx} className={`py-1 ${message.startsWith('ERROR') ? 'text-red-600' : message.startsWith('WARN') ? 'text-yellow-600' : 'text-gray-800'}`}>
                        {message}
                      </div>
                    ))}
                  </pre>
                )}
              </ScrollArea>
            </div>
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
