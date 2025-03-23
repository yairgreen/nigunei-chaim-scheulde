
import React from 'react';
import Header from '@/components/Header';
import ShabbatSchedule from '@/components/ShabbatSchedule';
import WeeklySchedule from '@/components/WeeklySchedule';
import DailyTimes from '@/components/DailyTimes';
import Footer from '@/components/Footer';

// Sample data - in a real application this would come from an API
const sampleData = {
  shabbat: {
    name: "שבת פרשת נח",
    hebrewDate: "ד' חשוון תשפ״ד",
    gregorianDate: "October 14, 2023",
    candles: "17:45",
    havdala: "18:43",
    prayers: [
      { name: "קבלת שבת", time: "18:00" },
      { name: "שחרית", time: "08:30" },
      { name: "מנחה", time: "17:15" },
      { name: "ערבית", time: "18:45" }
    ],
    classes: [
      { name: "שיעור הלכה", time: "16:30" },
      { name: "דף יומי", time: "20:00" },
      { name: "פרקי אבות", time: "16:00" }
    ]
  },
  weekly: {
    prayers: [
      {
        name: "שחרית",
        sunday: "06:30, 08:00",
        monday: "06:15, 08:00",
        tuesday: "06:15, 08:00",
        wednesday: "06:15, 08:00",
        thursday: "06:15, 08:00",
        friday: "06:30, 08:00"
      },
      {
        name: "מנחה",
        sunday: "17:30",
        monday: "17:30",
        tuesday: "17:30",
        wednesday: "17:30",
        thursday: "17:30",
        friday: "17:00"
      },
      {
        name: "ערבית",
        sunday: "19:00, 21:00",
        monday: "19:00, 21:00",
        tuesday: "19:00, 21:00",
        wednesday: "19:00, 21:00",
        thursday: "19:00, 21:00",
        friday: "קבלת שבת"
      }
    ],
    classes: [
      { day: "יום ראשון", name: "שיעור גמרא", time: "20:15" },
      { day: "יום שני", name: "פרשת שבוע", time: "20:15" },
      { day: "יום שלישי", name: "עין יעקב", time: "20:15" },
      { day: "יום רביעי", name: "שיעור הלכה", time: "20:15" },
      { day: "יום חמישי", name: "פרקי אבות", time: "20:15" }
    ]
  },
  dailyTimes: {
    date: "ד' חשוון תשפ״ד",
    times: [
      { name: "עלות השחר", time: "05:10" },
      { name: "נץ החמה", time: "06:24" },
      { name: "סוף זמן ק״ש", time: "09:27", isNext: true },
      { name: "סוף זמן תפילה", time: "10:26" },
      { name: "חצות", time: "12:36" },
      { name: "מנחה גדולה", time: "13:06" },
      { name: "פלג המנחה", time: "16:57" },
      { name: "שקיעה", time: "17:47" },
      { name: "צאת הכוכבים", time: "18:10" }
    ]
  }
};

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <Header 
          shabbatName={sampleData.shabbat.name}
          hebrewDate={sampleData.shabbat.hebrewDate}
          gregorianDate={sampleData.shabbat.gregorianDate}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
          <ShabbatSchedule 
            candles={sampleData.shabbat.candles}
            havdala={sampleData.shabbat.havdala}
            prayers={sampleData.shabbat.prayers}
            classes={sampleData.shabbat.classes}
          />
          
          <WeeklySchedule 
            prayers={sampleData.weekly.prayers}
            classes={sampleData.weekly.classes}
          />
          
          <DailyTimes 
            date={sampleData.dailyTimes.date}
            times={sampleData.dailyTimes.times}
          />
        </div>
        
        <Footer 
          greeting="שבת שלום ומבורך"
          contactInfo="לשאלות וברורים: 054-1234567 | קהילת בית הכנסת"
        />
      </div>
    </div>
  );
};

export default Index;
