
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import Header from '@/components/Header';
import ShabbatSchedule from '@/components/ShabbatSchedule';
import DailySchedule from '@/components/WeeklySchedule';
import DailyTimes from '@/components/DailyTimes';
import Footer from '@/components/Footer';
import { 
  getTodayZmanim, 
  getTodayHoliday, 
  getThisWeekShabbat,
  isRoshChodeshToday,
  calculateWeeklyMinchaTime,
  calculateWeeklyArvitTime,
  calculateShabbatMinchaTime,
  calculateShabbatKabalatTime,
  initDatabase
} from '@/lib/database';
import { initializeApp } from '@/lib/scheduler';

const Index = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hebrewDate, setHebrewDate] = useState('');
  const [gregorianDate, setGregorianDate] = useState('');
  const [dailyTimes, setDailyTimes] = useState<{ name: string; time: string; isNext?: boolean }[]>([]);
  const [dailyPrayers, setDailyPrayers] = useState<{ name: string; time: string }[]>([]);
  const [dailyClasses, setDailyClasses] = useState<{ name: string; time: string }[]>([]);
  const [shabbatData, setShabbatData] = useState({
    title: 'שבת',
    subtitle: '',
    candlesPT: '17:45',
    candlesTA: '17:40',
    havdala: '18:43',
    prayers: [] as { name: string; time: string }[],
    classes: [] as { name: string; time: string }[]
  });
  const [dataLoaded, setDataLoaded] = useState(false);
  const [isRoshChodesh, setIsRoshChodesh] = useState(false);

  useEffect(() => {
    // Initialize app and load data
    const loadData = async () => {
      try {
        await initializeApp();
        await refreshData();
        setDataLoaded(true);
      } catch (error) {
        console.error('Failed to load initial data:', error);
      }
    };

    loadData();

    // Set up daily refresh
    const refreshInterval = setInterval(() => {
      setCurrentDate(new Date());
      refreshData();
    }, 60 * 60 * 1000); // Refresh every hour

    return () => clearInterval(refreshInterval);
  }, []);

  const refreshData = async () => {
    try {
      // Get today's date
      const now = new Date();
      
      // Format the dates
      setGregorianDate(format(now, 'dd MMMM yyyy', { locale: he }));
      
      // In a real app, you would get the Hebrew date from the API
      // For now, we'll use the holiday data if available
      const todayHoliday = getTodayHoliday();
      if (todayHoliday) {
        setHebrewDate(todayHoliday.hebrew);
      } else {
        // Fallback Hebrew date format
        setHebrewDate(format(now, "d MMMM yyyy", { locale: he }));
      }
      
      // Check if today is Rosh Chodesh
      const roshChodesh = isRoshChodeshToday();
      setIsRoshChodesh(roshChodesh);
      
      // Get today's zmanim
      const todayZmanim = getTodayZmanim();
      if (todayZmanim) {
        // Format the zmanim for display
        const zmanim = [
          { name: 'עלות השחר (72 ד\')', time: todayZmanim.alotHaShachar },
          { name: 'הנץ החמה', time: todayZmanim.sunrise },
          { name: 'זמן טלית ותפילין', time: todayZmanim.misheyakir },
          { name: 'סוף זמן ק"ש (מג״א)', time: todayZmanim.sofZmanShmaMGA },
          { name: 'סוף זמן ק"ש (גר״א)', time: todayZmanim.sofZmanShma, isNext: true },
          { name: 'סוף זמן תפילה (מג״א)', time: todayZmanim.sofZmanTfillaMGA },
          { name: 'סוף זמן תפילה (גר"א)', time: todayZmanim.sofZmanTfilla },
          { name: 'חצות היום והלילה', time: todayZmanim.chatzot },
          { name: 'זמן מנחה גדולה', time: todayZmanim.minchaGedola },
          { name: 'פלג המנחה', time: todayZmanim.plagHaMincha },
          { name: 'שקיעה', time: todayZmanim.sunset },
          { name: 'צאת הכוכבים', time: todayZmanim.beinHaShmashos }
        ];
        
        setDailyTimes(zmanim);
        
        // Calculate prayer times
        const minchaTime = calculateWeeklyMinchaTime();
        const arvitTime = calculateWeeklyArvitTime();
        
        // Set daily prayers
        const prayers = [
          { name: 'שחרית א׳', time: roshChodesh ? '06:00' : '06:15' },
          { name: 'שחרית ב׳', time: '07:00' },
          { name: 'שחרית ג׳', time: '08:00' },
          { name: 'מנחה גדולה', time: '12:30' },
          { name: 'מנחה', time: minchaTime },
          { name: 'ערבית א׳', time: arvitTime },
          { name: 'ערבית ב׳', time: '20:45' }
        ];
        
        setDailyPrayers(prayers);
        
        // Set daily classes based on the day of the week
        const dayOfWeek = now.getDay(); // 0 is Sunday
        const classes = [];
        
        // Daily class
        classes.push({ name: 'שיעור הדף היומי', time: '20:00-20:45' });
        
        // Tuesday class
        if (dayOfWeek === 2) { // Tuesday
          classes.push({ name: 'שיעור חסידות', time: '21:00-22:00' });
        }
        
        // Friday class
        if (dayOfWeek === 5) { // Friday
          classes.push({ name: 'מדרשישי', time: '09:00-10:00' });
        }
        
        setDailyClasses(classes);
        
        // Get Shabbat data
        const shabbat = getThisWeekShabbat();
        if (shabbat) {
          // Calculate Shabbat times
          const kabalatTime = calculateShabbatKabalatTime(todayZmanim.sunset);
          const shabbatMinchaTime = calculateShabbatMinchaTime(shabbat.havdalah);
          
          // Set Shabbat subtitle
          let subtitle = shabbat.parashatHebrew;
          if (shabbat.holidayHebrew) {
            subtitle += ` | ${shabbat.holidayHebrew}`;
          }
          
          // Set Shabbat prayers
          const shabbatPrayers = [
            { name: 'קבלת שבת מוקדמת', time: '17:30' },
            { name: 'מנחה וקבלת שבת', time: kabalatTime },
            { name: 'שחרית א׳', time: '06:45' },
            { name: 'שחרית ב׳', time: '08:30' },
            { name: 'מנחה גדולה', time: '12:30' },
            { name: 'מנחה', time: shabbatMinchaTime },
            { name: 'ערבית מוצ״ש', time: shabbat.havdalah }
          ];
          
          // Set Shabbat classes (empty for now)
          const shabbatClasses = [];
          
          setShabbatData({
            title: 'שבת',
            subtitle: subtitle,
            candlesPT: shabbat.candlesPT,
            candlesTA: shabbat.candlesTA,
            havdala: shabbat.havdalah,
            prayers: shabbatPrayers,
            classes: shabbatClasses
          });
        }
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <Header 
          shabbatName="לוח זמנים - בית כנסת \"ניגוני חיים\""
          hebrewDate={hebrewDate}
          gregorianDate={gregorianDate}
        />
        
        {dataLoaded ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            <DailyTimes 
              date={hebrewDate}
              times={dailyTimes}
            />
            
            <DailySchedule 
              prayers={dailyPrayers}
              classes={dailyClasses}
              isRoshChodesh={isRoshChodesh}
            />
            
            <ShabbatSchedule 
              title={shabbatData.title}
              subtitle={shabbatData.subtitle}
              candlesPT={shabbatData.candlesPT}
              candlesTA={shabbatData.candlesTA}
              havdala={shabbatData.havdala}
              prayers={shabbatData.prayers}
              classes={shabbatData.classes}
            />
          </div>
        ) : (
          <div className="flex justify-center items-center py-20">
            <div className="animate-pulse text-center">
              <p className="text-xl">טוען נתונים...</p>
            </div>
          </div>
        )}
        
        <Footer 
          greeting="שבת שלום ומבורך"
          contactInfo="לשאלות וברורים: 054-1234567 | קהילת בית הכנסת \"ניגוני חיים\""
        />
      </div>
    </div>
  );
};

export default Index;
