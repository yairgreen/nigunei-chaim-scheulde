
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw, Calendar, Clock } from 'lucide-react';
import { 
  initDatabase, 
  updateDatabase, 
  updateShabbatInfo, 
  recalculatePrayerTimes,
  getLastUpdated
} from '@/lib/database';

const ReloadData = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [logTab, setLogTab] = useState<string>('all');

  const addLog = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] [${type.toUpperCase()}] ${message}`;
    setLogs(prev => [...prev, logMessage]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const handleReloadZmanim = async () => {
    setIsLoading(true);
    addLog('Starting Zmanim data reload...', 'info');
    try {
      // Override console.log to capture logs
      const originalConsoleLog = console.log;
      console.log = (message: any, ...args: any[]) => {
        originalConsoleLog(message, ...args);
        if (typeof message === 'string') {
          addLog(message, 'info');
        } else if (message && typeof message === 'object') {
          try {
            addLog(JSON.stringify(message), 'info');
          } catch (e) {
            addLog('[Object data]', 'info');
          }
        }
      };

      const originalConsoleError = console.error;
      console.error = (message: any, ...args: any[]) => {
        originalConsoleError(message, ...args);
        if (typeof message === 'string') {
          addLog(message, 'error');
        } else if (message && typeof message === 'object') {
          try {
            addLog(JSON.stringify(message), 'error');
          } catch (e) {
            addLog('[Object error data]', 'error');
          }
        }
      };

      await updateDatabase();
      
      // Restore console functions
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
      
      addLog('Zmanim data reloaded successfully', 'success');
      toast({
        title: "זמנים עודכנו",
        description: "הזמנים עודכנו בהצלחה",
      });
    } catch (error) {
      addLog(`Error reloading Zmanim data: ${error}`, 'error');
      toast({
        title: "שגיאה בעדכון",
        description: "אירעה שגיאה בעת עדכון הזמנים",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReloadShabbat = async () => {
    setIsLoading(true);
    addLog('Starting Shabbat data reload...', 'info');
    try {
      // Override console.log to capture logs
      const originalConsoleLog = console.log;
      console.log = (message: any, ...args: any[]) => {
        originalConsoleLog(message, ...args);
        if (typeof message === 'string') {
          addLog(message, 'info');
        } else if (message && typeof message === 'object') {
          try {
            addLog(JSON.stringify(message), 'info');
          } catch (e) {
            addLog('[Object data]', 'info');
          }
        }
      };

      const originalConsoleError = console.error;
      console.error = (message: any, ...args: any[]) => {
        originalConsoleError(message, ...args);
        if (typeof message === 'string') {
          addLog(message, 'error');
        } else if (message && typeof message === 'object') {
          try {
            addLog(JSON.stringify(message), 'error');
          } catch (e) {
            addLog('[Object error data]', 'error');
          }
        }
      };

      await updateShabbatInfo();
      
      // Restore console functions
      console.log = originalConsoleLog;
      console.error = originalConsoleError;

      addLog('Shabbat data reloaded successfully', 'success');
      toast({
        title: "מידע שבת עודכן",
        description: "מידע שבת עודכן בהצלחה",
      });
    } catch (error) {
      addLog(`Error reloading Shabbat data: ${error}`, 'error');
      toast({
        title: "שגיאה בעדכון",
        description: "אירעה שגיאה בעת עדכון מידע שבת",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecalculateTimes = async () => {
    setIsLoading(true);
    addLog('Recalculating prayer times...', 'info');
    try {
      // Override console.log to capture logs
      const originalConsoleLog = console.log;
      console.log = (message: any, ...args: any[]) => {
        originalConsoleLog(message, ...args);
        if (typeof message === 'string') {
          addLog(message, 'info');
        } else if (message && typeof message === 'object') {
          try {
            addLog(JSON.stringify(message), 'info');
          } catch (e) {
            addLog('[Object data]', 'info');
          }
        }
      };

      const originalConsoleError = console.error;
      console.error = (message: any, ...args: any[]) => {
        originalConsoleError(message, ...args);
        if (typeof message === 'string') {
          addLog(message, 'error');
        } else if (message && typeof message === 'object') {
          try {
            addLog(JSON.stringify(message), 'error');
          } catch (e) {
            addLog('[Object error data]', 'error');
          }
        }
      };

      const times = recalculatePrayerTimes();
      addLog(`Calculated prayer times - Mincha: ${times.minchaTime}, Arvit: ${times.arvitTime}`, 'info');
      
      // Restore console functions
      console.log = originalConsoleLog;
      console.error = originalConsoleError;

      addLog('Prayer times recalculated successfully', 'success');
      toast({
        title: "זמני תפילה חושבו מחדש",
        description: "זמני התפילה חושבו מחדש בהצלחה",
      });
    } catch (error) {
      addLog(`Error recalculating prayer times: ${error}`, 'error');
      toast({
        title: "שגיאה בחישוב",
        description: "אירעה שגיאה בעת חישוב זמני תפילה",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReloadAll = async () => {
    setIsLoading(true);
    addLog('Starting complete data reload...', 'info');
    try {
      // Override console.log to capture logs
      const originalConsoleLog = console.log;
      console.log = (message: any, ...args: any[]) => {
        originalConsoleLog(message, ...args);
        if (typeof message === 'string') {
          addLog(message, 'info');
        } else if (message && typeof message === 'object') {
          try {
            addLog(JSON.stringify(message), 'info');
          } catch (e) {
            addLog('[Object data]', 'info');
          }
        }
      };

      const originalConsoleError = console.error;
      console.error = (message: any, ...args: any[]) => {
        originalConsoleError(message, ...args);
        if (typeof message === 'string') {
          addLog(message, 'error');
        } else if (message && typeof message === 'object') {
          try {
            addLog(JSON.stringify(message), 'error');
          } catch (e) {
            addLog('[Object error data]', 'error');
          }
        }
      };

      addLog('Initializing database...', 'info');
      await initDatabase();
      
      // Restore console functions
      console.log = originalConsoleLog;
      console.error = originalConsoleError;

      addLog('All data reloaded successfully', 'success');
      toast({
        title: "כל הנתונים עודכנו",
        description: "כל הנתונים עודכנו בהצלחה",
      });
    } catch (error) {
      addLog(`Error reloading all data: ${error}`, 'error');
      toast({
        title: "שגיאה בעדכון",
        description: "אירעה שגיאה בעת עדכון כל הנתונים",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter logs based on current tab
  const filteredLogs = logs.filter(log => {
    if (logTab === 'all') return true;
    if (logTab === 'info') return log.includes('[INFO]');
    if (logTab === 'success') return log.includes('[SUCCESS]');
    if (logTab === 'error') return log.includes('[ERROR]');
    return true;
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>עדכון נתונים</CardTitle>
        <CardDescription>עדכון נתונים מהשרת וחישוב זמנים מחדש</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button 
            onClick={handleReloadZmanim} 
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            עדכן זמנים
          </Button>
          
          <Button 
            onClick={handleReloadShabbat} 
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            עדכן מידע שבת
          </Button>
          
          <Button 
            onClick={handleRecalculateTimes} 
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <Clock className="h-4 w-4" />
            חשב זמני תפילה מחדש
          </Button>
          
          <Button 
            onClick={handleReloadAll} 
            disabled={isLoading}
            variant="secondary"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            עדכן הכל
          </Button>
        </div>
        
        <div className="mt-8">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">יומן עדכונים</h3>
            <Button 
              onClick={clearLogs} 
              variant="outline" 
              size="sm"
            >
              נקה יומן
            </Button>
          </div>
          
          <Tabs defaultValue="all" value={logTab} onValueChange={setLogTab}>
            <TabsList className="mb-2">
              <TabsTrigger value="all">הכל</TabsTrigger>
              <TabsTrigger value="info">מידע</TabsTrigger>
              <TabsTrigger value="success">הצלחה</TabsTrigger>
              <TabsTrigger value="error">שגיאות</TabsTrigger>
            </TabsList>
            
            <ScrollArea className="h-64 border rounded-md p-2 bg-gray-50 dark:bg-gray-900">
              {filteredLogs.length > 0 ? (
                <div className="space-y-1 text-xs font-mono">
                  {filteredLogs.map((log, index) => (
                    <div 
                      key={index} 
                      className={`p-1 ${
                        log.includes('[ERROR]') ? 'text-red-600 dark:text-red-400' : 
                        log.includes('[SUCCESS]') ? 'text-green-600 dark:text-green-400' : 
                        'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {log}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-sm text-gray-500">
                  אין יומני עדכונים. בצע פעולת עדכון כדי לראות את היומנים כאן.
                </div>
              )}
            </ScrollArea>
          </Tabs>
        </div>
      </CardContent>
      <CardFooter className="text-sm text-gray-500 justify-between">
        <div>עדכון אחרון: {getLastUpdated() ? new Date(getLastUpdated()).toLocaleString('he-IL') : 'לא ידוע'}</div>
        {isLoading && <div className="text-blue-500">מעדכן נתונים...</div>}
      </CardFooter>
    </Card>
  );
};

export default ReloadData;
