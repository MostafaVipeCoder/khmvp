import { View, Text } from '../../tw';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/useAuthStore';
import { sitterService } from '../../services/sitter';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, Clock, Save, Plus, Trash2, Check, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Calendar as CalendarComponent } from '../ui/calendar';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import type { Language } from '../../stores/useAuthStore';

const translations = {
  ar: {
    back: 'رجوع',
    availabilityManagement: 'إدارة المواعيد المتاحة',
    selectDays: 'اختاري الأيام',
    selectDaysDesc: 'اختاري الأيام الي حابة تشتغلي فيها',
    selectedDays: 'الأيام المختارة',
    daySchedule: 'مواعيد اليوم',
    availableFrom: 'متاحة من',
    availableTo: 'إلى',
    addTimeSlot: 'إضافة وقت',
    removeTimeSlot: 'حذف',
    saveSchedule: 'حفظ المواعيد',
    bookedDays: 'أيام محجوزة',
    availableDays: 'أيام متاحة',
    unavailableDays: 'أيام غير متاحة',
    morning: 'صباحاً',
    evening: 'مساءً',
    allDay: 'طوال اليوم',
    customTime: 'وقت مخصص',
    noTimeSlotsYet: 'لم يتم تحديد أوقات بعد',
    mondayShort: 'الإثنين',
    tuesdayShort: 'الثلاثاء',
    wednesdayShort: 'الأربعاء',
    thursdayShort: 'الخميس',
    fridayShort: 'الجمعة',
    saturdayShort: 'السبت',
    sundayShort: 'الأحد',
    saved: 'تم الحفظ',
    invalidTime: 'الوقت غير صحيح',
    repeatWeekly: 'تكرار أسبوعياً',
    applyToAllDays: 'تطبيق على كل الأيام',
    clearAll: 'مسح الكل',
    quickPresets: 'إعدادات سريعة',
    morningShift: 'صباحي (8ص - 2م)',
    eveningShift: 'مسائي (2م - 8م)',
    fullDay: 'يوم كامل (8ص - 8م)',
    error: 'حدث خطأ ما',
  },
  en: {
    back: 'Back',
    availabilityManagement: 'Availability Management',
    selectDays: 'Select Days',
    selectDaysDesc: 'Select the days you want to work',
    selectedDays: 'Selected Days',
    daySchedule: 'Day Schedule',
    availableFrom: 'Available From',
    availableTo: 'To',
    addTimeSlot: 'Add Time',
    removeTimeSlot: 'Remove',
    saveSchedule: 'Save Schedule',
    bookedDays: 'Booked Days',
    availableDays: 'Available Days',
    unavailableDays: 'Unavailable Days',
    morning: 'AM',
    evening: 'PM',
    allDay: 'All Day',
    customTime: 'Custom Time',
    noTimeSlotsYet: 'No time slots set yet',
    mondayShort: 'Monday',
    tuesdayShort: 'Tuesday',
    wednesdayShort: 'Wednesday',
    thursdayShort: 'Thursday',
    fridayShort: 'Friday',
    saturdayShort: 'Saturday',
    sundayShort: 'Sunday',
    saved: 'Saved',
    invalidTime: 'Invalid Time',
    repeatWeekly: 'Repeat Weekly',
    applyToAllDays: 'Apply to All Days',
    clearAll: 'Clear All',
    quickPresets: 'Quick Presets',
    morningShift: 'Morning (8AM - 2PM)',
    eveningShift: 'Evening (2PM - 8PM)',
    fullDay: 'Full Day (8AM - 8PM)',
    error: 'Something went wrong',
  }
};

interface TimeSlot {
  id: string;
  from: string;
  to: string;
}

interface AvailabilityManagementProps {
  language: Language;
  onBack?: () => void;
}

export default function AvailabilityManagement({ language, onBack }: AvailabilityManagementProps) {
  const { user } = useAuthStore();
  const [selectedDates, setSelectedDates] = useState<Date[] | undefined>(undefined);
  const [schedules, setSchedules] = useState<Record<string, TimeSlot[]>>({});
  const [currentDateIndex, setCurrentDateIndex] = useState(0);
  const [repeatWeekly, setRepeatWeekly] = useState(false);
  // const [isLoading, setIsLoading] = useState(false);
  const t = translations[language];

  // Mock booked dates (dates with confirmed bookings)
  const bookedDates = [
    new Date(2024, 10, 25),
    new Date(2024, 10, 26),
    new Date(2024, 11, 5),
  ];

  const getDateKey = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  useEffect(() => {
    if (user?.id) {
      loadAvailability();
    }
  }, [user?.id]);

  const loadAvailability = async () => {
    if (!user?.id) return;
    try {
      // setIsLoading(true);
      const data = await sitterService.getAvailability(user.id);

      const newSchedules: Record<string, TimeSlot[]> = {};

      // Group by date
      data.forEach(slot => {
        if (slot.date) {
          if (!newSchedules[slot.date]) newSchedules[slot.date] = [];
          newSchedules[slot.date].push({
            id: slot.id,
            from: slot.start_time.substring(0, 5), // 'HH:MM:SS' -> 'HH:MM'
            to: slot.end_time.substring(0, 5)
          });
        }
      });

      // Populate selected dates
      const dates = Object.keys(newSchedules).map(d => new Date(d));
      setSchedules(newSchedules);
      if (dates.length > 0) {
        setSelectedDates(dates);
      }
    } catch (error) {
      console.error(error);
      toast.error(t.error || 'Failed to load availability');
    } finally {
      // setIsLoading(false);
    }
  };

  const currentDate = selectedDates?.[currentDateIndex];
  const currentDateKey = currentDate ? getDateKey(currentDate) : '';
  const currentTimeSlots = currentDateKey ? schedules[currentDateKey] || [] : [];

  const addTimeSlot = () => {
    if (!currentDateKey) return;

    const newSlot: TimeSlot = {
      id: Date.now().toString(),
      from: '09:00',
      to: '17:00',
    };

    setSchedules(prev => ({
      ...prev,
      [currentDateKey]: [...(prev[currentDateKey] || []), newSlot]
    }));
  };

  const removeTimeSlot = (slotId: string) => {
    if (!currentDateKey) return;

    setSchedules(prev => ({
      ...prev,
      [currentDateKey]: prev[currentDateKey].filter(slot => slot.id !== slotId)
    }));
  };

  const updateTimeSlot = (slotId: string, field: 'from' | 'to', value: string) => {
    if (!currentDateKey) return;

    setSchedules(prev => ({
      ...prev,
      [currentDateKey]: prev[currentDateKey].map(slot =>
        slot.id === slotId ? { ...slot, [field]: value } : slot
      )
    }));
  };

  const applyPreset = (preset: 'morning' | 'evening' | 'fullDay') => {
    if (!currentDateKey) return;

    const presets = {
      morning: [{ id: Date.now().toString(), from: '08:00', to: '14:00' }],
      evening: [{ id: Date.now().toString(), from: '14:00', to: '20:00' }],
      fullDay: [{ id: Date.now().toString(), from: '08:00', to: '20:00' }],
    };

    setSchedules(prev => ({
      ...prev,
      [currentDateKey]: presets[preset]
    }));
  };

  const applyToAllDays = () => {
    if (!currentDateKey || !selectedDates) return;

    const currentSlots = schedules[currentDateKey];
    if (!currentSlots || currentSlots.length === 0) return;

    const newSchedules = { ...schedules };
    selectedDates.forEach(date => {
      const dateKey = getDateKey(date);
      newSchedules[dateKey] = currentSlots.map(slot => ({
        ...slot,
        id: Date.now().toString() + Math.random()
      }));
    });

    setSchedules(newSchedules);
  };

  const clearAll = () => {
    setSchedules({});
    setSelectedDates(undefined);
  };

  const saveSchedule = async () => {
    if (!user?.id) return;
    try {
      // setIsLoading(true);
      const datesToUpdate = Object.keys(schedules);

      // 1. Clear existing non-recurring slots for these dates
      await sitterService.clearAvailabilityForDates(user.id, datesToUpdate);

      // 2. Prepare new slots
      const slotsToInsert: any[] = [];
      for (const date of datesToUpdate) {
        const slots = schedules[date];
        for (const slot of slots) {
          slotsToInsert.push({
            date: date,
            start_time: slot.from,
            end_time: slot.to,
            is_recurring: false, // For now assuming specific dates
            day_of_week: null
          });
        }
      }

      // 3. Insert new shots
      if (slotsToInsert.length > 0) {
        await sitterService.addAvailability(user.id, slotsToInsert);
      }

      toast.success(t.saved);
    } catch (error) {
      console.error(error);
      toast.error(t.error || 'Failed to save');
    } finally {
      // setIsLoading(false);
    }
  };

  const getDayName = (date: Date) => {
    const days = [
      t.sundayShort,
      t.mondayShort,
      t.tuesdayShort,
      t.wednesdayShort,
      t.thursdayShort,
      t.fridayShort,
      t.saturdayShort,
    ];
    return days[date.getDay()];
  };

  const formatDate = (date: Date) => {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return language === 'ar'
      ? `${day}/${month}/${year}`
      : `${month}/${day}/${year}`;
  };

  return (
    <View className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <View className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50">
        <View className="max-w-7xl mx-auto px-4 py-4">
          <View className="flex items-center gap-4">
            {onBack && (
              <Button
                onPress={onBack}
                variant="ghost"
                className="p-2"
              >
                {language === 'ar' ? <ArrowRight className="size-5" /> : <ArrowLeft className="size-5" />}
              </Button>
            )}
            <View className="flex-1">
              <Text className="text-xl">{t.availabilityManagement}</Text>
              <Text className="text-sm text-gray-600 dark:text-gray-400">{t.selectDaysDesc}</Text>
            </View>
            <Button
              onPress={saveSchedule}
              className="bg-[#FB5E7A] hover:bg-[#e5536e]"
            >
              <Save className="size-4" />
              {t.saveSchedule}
            </Button>
          </View>
        </View>
      </View>

      <View className="max-w-7xl mx-auto p-4">
        <View className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calendar Section */}
          <Card className="p-6">
            <View className="space-y-4">
              <View>
                <Text className="text-lg mb-2">{t.selectDays}</Text>
                <Text className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {t.selectDaysDesc}
                </Text>
              </View>

              <CalendarComponent
                mode="multiple"
                selected={selectedDates}
                onSelect={setSelectedDates}
                disabled={(date: Date) => {
                  // Disable past dates
                  if (date < new Date(new Date().setHours(0, 0, 0, 0))) return true;
                  // Disable booked dates
                  return bookedDates.some(bookedDate =>
                    getDateKey(bookedDate) === getDateKey(date)
                  );
                }}
                modifiers={{
                  booked: bookedDates
                }}
                className="rounded-md border mx-auto"
              />

              <View className="space-y-2">
                <View className="flex items-center gap-2">
                  <View className="w-3 h-3 bg-[#FB5E7A] rounded-full" />
                  <Text className="text-sm">{t.selectedDays}</Text>
                </View>
                <View className="flex items-center gap-2">
                  <View className="w-3 h-3 bg-gray-300 rounded-full" />
                  <Text className="text-sm">{t.bookedDays}</Text>
                </View>
              </View>

              {selectedDates && selectedDates.length > 0 && (
                <View className="pt-4 border-t">
                  <View className="flex items-center gap-2 mb-2">
                    <Checkbox
                      id="repeat-weekly"
                      checked={repeatWeekly}
                      onCheckedChange={(checked: any) => setRepeatWeekly(checked as boolean)}
                    />
                    <Label htmlFor="repeat-weekly" className="text-sm cursor-pointer">
                      {t.repeatWeekly}
                    </Label>
                  </View>
                  <Button
                    onPress={clearAll}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <X className="size-4" />
                    {t.clearAll}
                  </Button>
                </View>
              )}
            </View>
          </Card>

          {/* Time Slots Section */}
          <Card className="p-6">
            <View className="space-y-4">
              <View>
                <Text className="text-lg mb-2">{t.daySchedule}</Text>
                {selectedDates && selectedDates.length > 0 ? (
                  <View className="flex gap-2 flex-wrap">
                    {selectedDates.map((date: Date, index: number) => (
                      <Button
                        key={getDateKey(date)}
                        onPress={() => setCurrentDateIndex(index)}
                        variant={currentDateIndex === index ? "default" : "outline"}
                        size="sm"
                        className={currentDateIndex === index ? "bg-[#FB5E7A] hover:bg-[#e5536e]" : ""}
                      >
                        <View className="text-center">
                          <View className="text-xs">{getDayName(date)}</View>
                          <View className="text-xs">{formatDate(date)}</View>
                        </View>
                        {schedules[getDateKey(date)]?.length > 0 && (
                          <Check className="size-3" />
                        )}
                      </Button>
                    ))}
                  </View>
                ) : (
                  <Text className="text-sm text-gray-600 dark:text-gray-400">
                    {t.selectDaysDesc}
                  </Text>
                )}
              </View>

              {currentDate && (
                <View className="space-y-4">
                  {/* Quick Presets */}
                  <View>
                    <Label className="text-sm mb-2 block">{t.quickPresets}</Label>
                    <View className="grid grid-cols-3 gap-2">
                      {/* Presets buttons */}
                      <Button
                        onPress={() => applyPreset('morning')}
                        variant="outline"
                        size="sm"
                      >
                        {t.morningShift}
                      </Button>
                      <Button
                        onPress={() => applyPreset('evening')}
                        variant="outline"
                        size="sm"
                      >
                        {t.eveningShift}
                      </Button>
                      <Button
                        onPress={() => applyPreset('fullDay')}
                        variant="outline"
                        size="sm"
                      >
                        {t.fullDay}
                      </Button>
                    </View>
                  </View>

                  {/* Time Slots */}
                  <View className="space-y-3 border-t pt-4">
                    {currentTimeSlots.length === 0 ? (
                      <View className="text-center py-8 text-gray-500">
                        <Clock className="size-12 mx-auto mb-2 opacity-50" />
                        <Text className="text-sm">{t.noTimeSlotsYet}</Text>
                      </View>
                    ) : (
                      currentTimeSlots.map((slot) => (
                        <View key={slot.id} className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <View className="flex-1 grid grid-cols-2 gap-2">
                            <View>
                              <Label className="text-xs">{t.availableFrom}</Label>
                              <Input
                                type="time"
                                value={slot.from}
                                onChange={(e) => updateTimeSlot(slot.id, 'from', e.target.value)}
                                className="mt-1"
                              />
                            </View>
                            <View>
                              <Label className="text-xs">{t.availableTo}</Label>
                              <Input
                                type="time"
                                value={slot.to}
                                onChange={(e) => updateTimeSlot(slot.id, 'to', e.target.value)}
                                className="mt-1"
                              />
                            </View>
                          </View>
                          <Button
                            onPress={() => removeTimeSlot(slot.id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </View>
                      ))
                    )}

                    <Button
                      onPress={addTimeSlot}
                      variant="outline"
                      className="w-full"
                    >
                      <Plus className="size-4" />
                      {t.addTimeSlot}
                    </Button>

                    {currentTimeSlots.length > 0 && selectedDates && selectedDates.length > 1 && (
                      <Button
                        onPress={applyToAllDays}
                        variant="outline"
                        className="w-full"
                      >
                        <Check className="size-4" />
                        {t.applyToAllDays}
                      </Button>
                    )}
                  </View>
                </View>
              )}
            </View>
          </Card>
        </View>

        {/* Summary */}
        {selectedDates && selectedDates.length > 0 && (
          <Card className="mt-6 p-6">
            <Text className="text-lg mb-4">{t.selectedDays}</Text>
            <View className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedDates.map((date) => {
                const dateKey = getDateKey(date);
                const slots = schedules[dateKey] || [];
                return (
                  <View key={dateKey} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <View className="flex items-center justify-between mb-2">
                      <View>
                        <View className="text-sm">{getDayName(date)}</View>
                        <View className="text-xs text-gray-600 dark:text-gray-400">{formatDate(date)}</View>
                      </View>
                      {slots.length > 0 ? (
                        <Badge className="bg-green-500">{slots.length} {t.addTimeSlot}</Badge>
                      ) : (
                        <Badge variant="outline">{t.noTimeSlotsYet}</Badge>
                      )}
                    </View>
                    {slots.length > 0 && (
                      <View className="space-y-1 text-xs">
                        {slots.map(slot => (
                          <View key={slot.id} className="flex items-center gap-2">
                            <Clock className="size-3" />
                            <Text>{slot.from} - {slot.to}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </Card>
        )}
      </View>
    </View>
  );
}