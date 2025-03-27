
import { useState, useEffect } from 'react';

export const useAdminState = () => {
  // Daily prayers state
  const [prayers, setPrayers] = useState([
    { name: 'שחרית א׳', time: '06:15' },
    { name: 'שחרית ב׳', time: '07:00' },
    { name: 'שחרית ג׳', time: '08:00' },
    { name: 'מנחה גדולה', time: '12:30' },
    { name: 'מנחה', time: '17:15' },
    { name: 'ערבית א׳', time: '18:15' },
    { name: 'ערבית ב׳', time: '20:45' }
  ]);
  
  // Daily classes state
  const [classes, setClasses] = useState([
    { name: 'שיעור הדף היומי מפי הרב דוד קלופפר', time: '20:00-20:45' },
    { name: 'שיעור חסידות מפי הרב אשר דייטש', time: '21:00-22:00' }
  ]);
  
  // Shabbat prayers state
  const [shabbatPrayers, setShabbatPrayers] = useState([
    { name: 'קבלת שבת מוקדמת', time: '17:30' },
    { name: 'מנחה וקבלת שבת', time: '18:45' },
    { name: 'שחרית א׳', time: '06:45' },
    { name: 'שחרית ב׳', time: '08:30' },
    { name: 'מנחה גדולה', time: '12:30' },
    { name: 'מנחה', time: '18:35' },
    { name: 'ערבית מוצ״ש', time: '19:35' }
  ]);
  
  // Shabbat times state
  const [shabbatTimes, setShabbatTimes] = useState({
    candlesPT: '18:17',
    candlesTA: '18:39',
    havdala: '19:35'
  });
  
  // Update daily prayer time
  const handleUpdatePrayerTime = (index: number, time: string) => {
    const updatedPrayers = [...prayers];
    updatedPrayers[index].time = time;
    setPrayers(updatedPrayers);
  };
  
  // Update class name
  const handleUpdateClassName = (index: number, name: string) => {
    const updatedClasses = [...classes];
    updatedClasses[index].name = name;
    setClasses(updatedClasses);
  };
  
  // Update class time
  const handleUpdateClassTime = (index: number, time: string) => {
    const updatedClasses = [...classes];
    updatedClasses[index].time = time;
    setClasses(updatedClasses);
  };
  
  // Update Shabbat prayer time
  const handleUpdateShabbatPrayerTime = (index: number, time: string) => {
    const updatedPrayers = [...shabbatPrayers];
    updatedPrayers[index].time = time;
    setShabbatPrayers(updatedPrayers);
  };
  
  // Load saved data on component mount
  useEffect(() => {
    // In a real implementation, this would load from a database or localStorage
    // For now, just use the default state
  }, []);
  
  return {
    prayers,
    classes,
    shabbatPrayers,
    shabbatTimes,
    setShabbatTimes,
    handleUpdatePrayerTime,
    handleUpdateClassName,
    handleUpdateClassTime,
    handleUpdateShabbatPrayerTime
  };
};
