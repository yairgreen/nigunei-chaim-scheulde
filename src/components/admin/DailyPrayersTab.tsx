
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PrayerOverrideForm, PrayerOverrideFormData } from './PrayerOverrideForm';
import { PrayerOverrideDisplay } from './PrayerOverrideDisplay';
import { getPrayerOverrides, addPrayerOverride, deletePrayerOverride, getActiveOverride } from '@/lib/database/prayers/overrides';
import type { PrayerOverride } from '@/lib/database/types/prayers';
import { useToast } from '@/hooks/use-toast';

interface DailyPrayersTabProps {
  prayers: { name: string; time: string }[];
  handleUpdatePrayerTime: (index: number, time: string) => void;
}

const DailyPrayersTab: React.FC<DailyPrayersTabProps> = ({ 
  prayers, 
  handleUpdatePrayerTime 
}) => {
  const [overrides, setOverrides] = useState<PrayerOverride[]>([]);
  const [selectedPrayer, setSelectedPrayer] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    loadOverrides();
  }, []);

  const loadOverrides = async () => {
    const data = await getPrayerOverrides();
    setOverrides(data);
  };

  const handleOpenOverrideForm = (prayerName: string, time: string) => {
    setSelectedPrayer(prayerName);
    setCurrentTime(time);
  };

  const handleCloseOverrideForm = () => {
    setSelectedPrayer(null);
  };

  const handleAddOverride = async (data: PrayerOverrideFormData) => {
    const override = await addPrayerOverride(data);
    if (override) {
      toast({
        title: "דריסת זמן נוספה בהצלחה",
        description: `הזמן ${data.override_time} נוסף עבור ${data.prayer_name}`,
      });
      loadOverrides();
    }
  };

  const handleDeleteOverride = async (id: string) => {
    const success = await deletePrayerOverride(id);
    if (success) {
      toast({
        title: "דריסת זמן בוטלה",
        description: "הזמן המקורי ישוחזר",
      });
      loadOverrides();
    }
  };

  const getOverrideForPrayer = (prayerName: string): PrayerOverride | null => {
    return getActiveOverride(prayerName, new Date(), overrides);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-medium mb-4">תפילות יומיות</h2>
      <div className="space-y-4">
        {prayers.map((prayer, index) => {
          const activeOverride = getOverrideForPrayer(prayer.name);
          
          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                <span className="font-medium min-w-[120px]">{prayer.name}</span>
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    type="time"
                    value={prayer.time}
                    onChange={(e) => handleUpdatePrayerTime(index, e.target.value)}
                    className="w-32 text-left bg-gray-50"
                    readOnly
                  />
                  <Input
                    type="time"
                    value={activeOverride?.override_time || prayer.time}
                    className="w-32 text-left"
                    readOnly
                  />
                  <Button 
                    variant="outline"
                    onClick={() => handleOpenOverrideForm(prayer.name, prayer.time)}
                  >
                    הוסף דריסת זמן
                  </Button>
                </div>
              </div>
              
              {activeOverride && (
                <PrayerOverrideDisplay
                  override={activeOverride}
                  onDelete={() => handleDeleteOverride(activeOverride.id)}
                />
              )}
            </div>
          );
        })}
      </div>

      {selectedPrayer && (
        <PrayerOverrideForm
          isOpen={true}
          onClose={handleCloseOverrideForm}
          prayerName={selectedPrayer}
          currentTime={currentTime}
          onSubmit={handleAddOverride}
        />
      )}
    </div>
  );
};

export default DailyPrayersTab;
