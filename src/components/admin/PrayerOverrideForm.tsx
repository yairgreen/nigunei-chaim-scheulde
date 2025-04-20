
import React from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';

interface PrayerOverrideFormProps {
  isOpen: boolean;
  onClose: () => void;
  prayerName: string;
  currentTime: string;
  onSubmit: (data: PrayerOverrideFormData) => void;
}

export interface PrayerOverrideFormData {
  prayer_name: string;
  override_time: string;
  start_date: string;
  end_date: string;
  day_of_week: number | null;
}

export function PrayerOverrideForm({ isOpen, onClose, prayerName, currentTime, onSubmit }: PrayerOverrideFormProps) {
  const form = useForm<PrayerOverrideFormData>({
    defaultValues: {
      prayer_name: prayerName,
      override_time: currentTime,
      start_date: format(new Date(), 'yyyy-MM-dd'),
      end_date: format(new Date(), 'yyyy-MM-dd'),
      day_of_week: null
    }
  });

  const handleSubmit = (data: PrayerOverrideFormData) => {
    onSubmit(data);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>הוספת דריסת זמן - {prayerName}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="override_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>זמן חדש</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="day_of_week"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>יום בשבוע (אופציונלי)</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(value ? parseInt(value) : null)} 
                    value={field.value?.toString() ?? ''}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="כל הימים" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">כל הימים</SelectItem>
                      <SelectItem value="0">ראשון</SelectItem>
                      <SelectItem value="1">שני</SelectItem>
                      <SelectItem value="2">שלישי</SelectItem>
                      <SelectItem value="3">רביעי</SelectItem>
                      <SelectItem value="4">חמישי</SelectItem>
                      <SelectItem value="5">שישי</SelectItem>
                      <SelectItem value="6">שבת</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="start_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>תאריך התחלה</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="end_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>תאריך סיום</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>ביטול</Button>
              <Button type="submit">שמירה</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
