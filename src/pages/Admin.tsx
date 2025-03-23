
import React, { useState, useEffect } from 'react';
import { useUser, useAuth, SignOutButton } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useScheduleData } from '@/hooks/useScheduleData';

const ADMIN_EMAILS = ['yair.green@gmail.com'];

const Admin = () => {
  const [isClerkAvailable, setIsClerkAvailable] = useState<boolean | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  
  // Using try/catch since these hooks will throw errors if Clerk is not available
  let user, isSignedIn, isLoaded;
  
  try {
    // @ts-ignore - checking if useUser is available
    if (typeof useUser === 'function') {
      const userHook = useUser();
      user = userHook.user;
      isSignedIn = userHook.isSignedIn;
      isLoaded = userHook.isLoaded;
    }
  } catch (error) {
    console.error("Error using Clerk hooks:", error);
    // Instead of direct assignment, use the state setter
    setIsClerkAvailable(false);
  }
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const { dailyPrayers, dailyClasses, shabbatData } = useScheduleData();
  
  const [prayers, setPrayers] = useState<{ name: string; time: string }[]>([]);
  const [classes, setClasses] = useState<{ name: string; time: string }[]>([]);
  const [shabbatPrayers, setShabbatPrayers] = useState<{ name: string; time: string }[]>([]);
  const [shabbatTimes, setShabbatTimes] = useState({
    candlesPT: '',
    candlesTA: '',
    havdala: ''
  });
  
  useEffect(() => {
    // Check if Clerk is available
    try {
      // @ts-ignore - we're checking if Clerk exists on window
      const hasClerk = typeof window.Clerk !== 'undefined';
      setIsClerkAvailable(hasClerk);
      
      if (!hasClerk) {
        setIsDemoMode(true);
        toast({
          title: "מצב דמו",
          description: "המסך מוצג במצב דמו. שינויים לא יישמרו באופן קבוע.",
        });
      }
    } catch (error) {
      console.error("Error checking Clerk availability:", error);
      setIsClerkAvailable(false);
      setIsDemoMode(true);
    }
  }, [toast]);
  
  useEffect(() => {
    // Redirect non-admin users if authentication is available
    if (isClerkAvailable && isLoaded && (!isSignedIn || !user?.emailAddresses.some(email => 
      ADMIN_EMAILS.includes(email.emailAddress)))) {
      navigate('/');
    }
  }, [isClerkAvailable, isLoaded, isSignedIn, user, navigate]);
  
  useEffect(() => {
    if (dailyPrayers.length) {
      setPrayers([...dailyPrayers]);
    }
    
    if (dailyClasses.length) {
      setClasses([...dailyClasses]);
    }
    
    if (shabbatData.prayers.length) {
      setShabbatPrayers([...shabbatData.prayers]);
      setShabbatTimes({
        candlesPT: shabbatData.candlesPT,
        candlesTA: shabbatData.candlesTA,
        havdala: shabbatData.havdala
      });
    }
  }, [dailyPrayers, dailyClasses, shabbatData]);
  
  const handleUpdatePrayerTime = (index: number, time: string) => {
    const newPrayers = [...prayers];
    newPrayers[index].time = time;
    setPrayers(newPrayers);
  };
  
  const handleUpdateClassName = (index: number, name: string) => {
    const newClasses = [...classes];
    newClasses[index].name = name;
    setClasses(newClasses);
  };
  
  const handleUpdateClassTime = (index: number, time: string) => {
    const newClasses = [...classes];
    newClasses[index].time = time;
    setClasses(newClasses);
  };
  
  const handleUpdateShabbatPrayerTime = (index: number, time: string) => {
    const newPrayers = [...shabbatPrayers];
    newPrayers[index].time = time;
    setShabbatPrayers(newPrayers);
  };
  
  const handleSaveChanges = () => {
    // In a real implementation, this would save to a database or localStorage
    // For now, just show a toast
    toast({
      title: "השינויים נשמרו בהצלחה",
      description: "הזמנים המעודכנים יופיעו בלוח הזמנים",
    });
  };
  
  if (isClerkAvailable && !isLoaded) {
    return <div className="text-center py-12">טוען...</div>;
  }
  
  if (isClerkAvailable && isLoaded && !isSignedIn && !isDemoMode) {
    navigate('/sign-in');
    return null;
  }
  
  const isAuthorized = isDemoMode || (isClerkAvailable && user?.emailAddresses.some(email => 
    ADMIN_EMAILS.includes(email.emailAddress)));
    
  if (!isAuthorized) {
    navigate('/');
    return null;
  }
  
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">ניהול לוח זמנים</h1>
          <div className="flex items-center gap-4">
            {isDemoMode ? (
              <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded">מצב דמו</span>
            ) : (
              <>
                <span className="text-sm">{user?.primaryEmailAddress?.emailAddress}</span>
                <SignOutButton>
                  <Button variant="outline" size="sm">התנתק</Button>
                </SignOutButton>
              </>
            )}
          </div>
        </div>
        
        
        <Tabs defaultValue="daily" className="space-y-6">
          <TabsList className="w-full bg-white shadow">
            <TabsTrigger value="daily" className="flex-1">זמנים יומיים</TabsTrigger>
            <TabsTrigger value="shabbat" className="flex-1">זמני שבת</TabsTrigger>
            <TabsTrigger value="classes" className="flex-1">שיעורים</TabsTrigger>
          </TabsList>
          
          
          <TabsContent value="daily" className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-medium mb-4">תפילות יומיות</h2>
              <div className="space-y-4">
                {prayers.map((prayer, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="font-medium">{prayer.name}</span>
                    <Input
                      type="time"
                      value={prayer.time}
                      onChange={(e) => handleUpdatePrayerTime(index, e.target.value)}
                      className="w-32 text-left"
                    />
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="shabbat" className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-medium mb-4">זמני שבת</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-1">הדלקת נרות (פ"ת)</label>
                  <Input
                    type="time"
                    value={shabbatTimes.candlesPT}
                    onChange={(e) => setShabbatTimes({...shabbatTimes, candlesPT: e.target.value})}
                    className="text-left"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">הדלקת נרות (ת"א)</label>
                  <Input
                    type="time"
                    value={shabbatTimes.candlesTA}
                    onChange={(e) => setShabbatTimes({...shabbatTimes, candlesTA: e.target.value})}
                    className="text-left"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">צאת שבת</label>
                  <Input
                    type="time"
                    value={shabbatTimes.havdala}
                    onChange={(e) => setShabbatTimes({...shabbatTimes, havdala: e.target.value})}
                    className="text-left"
                  />
                </div>
              </div>
              
              <h3 className="text-lg font-medium mb-4">תפילות שבת</h3>
              <div className="space-y-4">
                {shabbatPrayers.map((prayer, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="font-medium">{prayer.name}</span>
                    <Input
                      type="time"
                      value={prayer.time}
                      onChange={(e) => handleUpdateShabbatPrayerTime(index, e.target.value)}
                      className="w-32 text-left"
                    />
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="classes" className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-medium mb-4">שיעורים</h2>
              <div className="space-y-6">
                {classes.map((classItem, index) => (
                  <div key={index} className="space-y-2 border-b pb-4 last:border-0">
                    <div className="flex flex-col space-y-2">
                      <label className="block text-sm font-medium">שם השיעור</label>
                      <Input
                        value={classItem.name}
                        onChange={(e) => handleUpdateClassName(index, e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col space-y-2">
                      <label className="block text-sm font-medium">זמן</label>
                      <Input
                        value={classItem.time}
                        onChange={(e) => handleUpdateClassTime(index, e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-8 flex justify-end">
          <Button onClick={handleSaveChanges}>שמור שינויים</Button>
        </div>
        
        <div className="mt-12 border-t pt-8">
          <h2 className="text-xl font-medium mb-4">קישורים מהירים</h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="outline" onClick={() => navigate('/')}>לדף הראשי</Button>
            <Button variant="outline" onClick={() => navigate('/simulation')}>לדף סימולציה</Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Admin;
