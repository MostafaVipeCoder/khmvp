import { View, Text, Pressable, Image } from '../../tw';
import { useState, useEffect } from 'react';
import {
  Star, MapPin, Calendar, Clock, Shield, ArrowLeft, ArrowRight, Home as HomeIcon,
  Building2, Plus, Minus, AlertCircle
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from "../ui/dialog";
// import {
//   Select, SelectContent, SelectItem, SelectTrigger, SelectValue
// } from "../ui/select";
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Checkbox } from '../ui/checkbox';
import { Calendar as CalendarComponent } from '../ui/calendar';
import { useAuthStore } from '../../stores/useAuthStore';
import { bookingService } from '../../services/booking';
import { childrenService } from '../../services/children';
import { sitterService } from '../../services/sitter';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { useTranslation } from '../../hooks/useTranslation';

import { Sitter, Service, SitterAvailability } from '../../types/core';

interface SitterProfileProps {
  sitter: Sitter;
  onBack: () => void;
}

export default function SitterProfile({ sitter, onBack }: SitterProfileProps) {
  const { user } = useAuthStore();
  const { t, language } = useTranslation();
  const sitterT = t.client.sitterProfile;

  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [serviceType, setServiceType] = useState<'home' | 'outside'>('home');
  const [selectedDates, setSelectedDates] = useState<Date[] | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState('09:00');
  const [duration, setDuration] = useState(3);
  // const [childrenCount, setChildrenCount] = useState(1); // Unused
  const [newAddress, setNewAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [isBooking, setIsBooking] = useState(false);

  // New State for Intelligent Selection
  const [childrenList, setChildrenList] = useState<any[]>([]);
  const [selectedChildIds, setSelectedChildIds] = useState<string[]>([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [isAddingNewChild, setIsAddingNewChild] = useState(false);
  const [newChildDetails, setNewChildDetails] = useState({ name: '', age: '', notes: '' });
  const [showAddressInput, setShowAddressInput] = useState(false);
  const [saveNewAddress, setSaveNewAddress] = useState(false);


  const [showServicesDialog, setShowServicesDialog] = useState(false);
  const [selectedServicePlan, setSelectedServicePlan] = useState<Service | null>(null);
  const [availability, setAvailability] = useState<SitterAvailability[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<{ start: string; end: string }[]>([]);

  useEffect(() => {
    if (user?.id) {
      loadClientData();
    }
  }, [user?.id]);

  useEffect(() => {
    if (sitter?.id) {
      loadSitterAvailability();
    }
  }, [sitter?.id]);

  const loadSitterAvailability = async () => {
    try {
      const data = await sitterService.getAvailability(sitter.id);
      setAvailability(data);
    } catch (error) {
      console.error('Error loading sitter availability:', error);
    }
  };

  const isDateAvailable = (date: Date) => {
    if (!availability.length) return false;

    // Normalize date to compare
    const dayOfWeek = date.getDay();
    const dateStr = date.toISOString().split('T')[0];

    return availability.some(slot => {
      if (slot.is_recurring) {
        return slot.day_of_week === dayOfWeek;
      } else {
        return slot.date === dateStr;
      }
    });
  };

  const getTimeSlotsForDate = (date: Date) => {
    const dayOfWeek = date.getDay();
    const dateStr = date.toISOString().split('T')[0];

    return availability
      .filter(slot => {
        if (slot.is_recurring) {
          return slot.day_of_week === dayOfWeek;
        } else {
          return slot.date === dateStr;
        }
      })
      .map(slot => ({
        start: slot.start_time,
        end: slot.end_time
      }));
  };

  const formatTime12h = (time24: string) => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12
      ? (language === 'ar' ? 'م' : 'PM')
      : (language === 'ar' ? 'ص' : 'AM');
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  useEffect(() => {
    if (selectedDates && selectedDates.length > 0) {
      const slots = getTimeSlotsForDate(selectedDates[0]);
      setAvailableTimeSlots(slots);
      if (slots.length > 0) {
        setSelectedTime(slots[0].start);
      }
    } else {
      setAvailableTimeSlots([]);
    }
  }, [selectedDates, availability]);

  const loadClientData = async () => {
    try {
      if (!user?.id) return;

      // Load Children using service to ensure correct table 'children' is used
      const childrenData = await childrenService.getChildren(user.id);

      if (childrenData) {
        setChildrenList(childrenData);
        if (childrenData.length > 0) {
          // Default to first child
          setSelectedChildIds([childrenData[0].id]);
          // setChildrenCount(1); // Removed as it is unused
        }
      }

      // Load Address
      const { data: profileData } = await supabase
        .from('profiles')
        .select('default_address')
        .eq('id', user.id)
        .single();

      if (profileData?.default_address) {
        setSelectedAddress(profileData.default_address);
      }

    } catch (error) {
      console.error('Error loading client data:', error);
    }
  };

  // Derive hourly rate from selected plan or fallback
  let hourlyRate = 0;
  if (selectedServicePlan) {
    hourlyRate = selectedServicePlan.pricePerHour || selectedServicePlan.price || 0;
  } else if (sitter.services && sitter.services.length > 0) {
    // Fallback for initial render or if logic is mixed
    const relevantService = sitter.services.find((s) =>
      (serviceType === 'home' && (s.name === 'weekly' || s.name === 'monthly' || s.name === 'home')) ||
      (serviceType === 'outside' && s.name === 'outside')
    );
    if (relevantService) {
      hourlyRate = relevantService.pricePerHour || relevantService.price || 0;
    } else {
      hourlyRate = sitter.services[0].pricePerHour || sitter.services[0].price || 0;
    }
  }

  const extraChildRate = 20;
  const numberOfDays = selectedDates?.length || 0;
  const totalHours = numberOfDays * duration;

  // Update pricing logic
  const activeChildCount = selectedChildIds.length;
  const estimatedCost = (hourlyRate * totalHours) + (Math.max(0, activeChildCount - 1) * extraChildRate * totalHours);

  const handleServiceSelect = (service: any) => {
    setSelectedServicePlan(service);
    setShowServicesDialog(false);
    setShowBookingDialog(true);
    // Auto-set service type based on plan if possible, or keep as selection
    if (service.name === 'outside' || service.service_type === 'outside') {
      setServiceType('outside');
    } else {
      setServiceType('home');
    }
  };

  const handleAddNewChild = async () => {
    try {
      if (!newChildDetails.name || !user?.id) return;

      // Save new child using service
      const savedChild = await childrenService.addChild({
        client_id: user.id,
        name: newChildDetails.name,
        age: Number(newChildDetails.age) || 0,
        gender: 'male',
        notes: newChildDetails.notes
      });

      // Add to list and select it
      setChildrenList([...childrenList, savedChild]);
      setSelectedChildIds([...selectedChildIds, savedChild.id]);

      // Reset form
      setIsAddingNewChild(false);
      setNewChildDetails({ name: '', age: '', notes: '' });
      toast.success(sitterT.childAddedSuccess);

    } catch (error) {
      console.error('Error adding child:', error);
      toast.error(sitterT.childAddedError);
    }
  };

  const handleBooking = async () => {
    if (!user) {
      toast.error(sitterT.loginRequired);
      return;
    }

    try {
      // Check verification status
      const { data: profileCheck, error: profileError } = await supabase
        .from('profiles')
        .select('is_verified')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      if (!profileCheck?.is_verified) {
        toast.error(sitterT.verificationRequiredMsg);
        return;
      }
    } catch (error) {
      console.error('Verification check error:', error);
      toast.error(sitterT.verificationCheckError);
      return;
    }

    if (!selectedDates || selectedDates.length === 0) {
      toast.error(sitterT.selectDateError);
      return;
    }

    if (isBooking) return;

    try {
      setIsBooking(true);

      // 2. Handle Address
      let bookingLocation = sitter.location || '';
      if (serviceType === 'home') {
        if (showAddressInput && newAddress) {
          bookingLocation = newAddress;
          // Save as default if requested
          if (saveNewAddress) {
            await supabase
              .from('profiles')
              .update({ default_address: newAddress })
              .eq('id', user.id);
          }
        } else if (selectedAddress) {
          bookingLocation = selectedAddress;
        } else {
          toast.error(sitterT.enterAddressError);
          setIsBooking(false);
          return;
        }
      }

      // Process each selected date
      for (const date of selectedDates) {
        const slots = getTimeSlotsForDate(date);
        const startTimeInMinutes = parseInt(selectedTime.split(':')[0]) * 60 + parseInt(selectedTime.split(':')[1]);
        const endTimeInMinutes = startTimeInMinutes + duration * 60;

        const isWithinRange = slots.some(slot => {
          const slotStartMinutes = parseInt(slot.start.split(':')[0]) * 60 + parseInt(slot.start.split(':')[1]);
          const slotEndMinutes = parseInt(slot.end.split(':')[0]) * 60 + parseInt(slot.end.split(':')[1]);
          return startTimeInMinutes >= slotStartMinutes && endTimeInMinutes <= slotEndMinutes;
        });

        if (!isWithinRange) {
          toast.error(
            sitterT.outsideWorkingHours.replace('{date}', date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US'))
          );
          setIsBooking(false);
          return;
        }

        const dateStr = date.toISOString().split('T')[0];

        await bookingService.createBooking({
          client_id: user.id,
          sitter_id: sitter.id,
          date: dateStr,
          start_time: selectedTime,
          duration_hours: duration,
          location: bookingLocation,
          booking_type: serviceType,
          total_price: estimatedCost / (selectedDates.length || 1), // Price per booking
          children_count: Math.max(1, activeChildCount)
        } as any);
      }

      toast.success(sitterT.successConfig);
      setShowBookingDialog(false);
      setSelectedDates([]);
      setIsAddingNewChild(false);
      setNewChildDetails({ name: '', age: '', notes: '' });
      setNewAddress('');
      setShowAddressInput(false);

    } catch (error: any) {
      console.error('Booking error:', error);
      toast.error(error.message || sitterT.error);
    } finally {
      setIsBooking(false);
    }
  };
  return (
    <View className="max-w-4xl mx-auto px-4 pb-8">
      {/* Sticky Header */}
      <View className="sticky top-0 z-50 bg-white dark:bg-gray-950 pt-6 pb-4 -mx-4 px-4 mb-4 border-b border-gray-100 dark:border-gray-800">
        <View className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onPress={onBack} className="rounded-full text-[#FB5E7A]">
            {language === 'ar' ? <ArrowRight className="w-6 h-6" /> : <ArrowLeft className="w-6 h-6" />}
          </Button>
          <Text className="text-[#FB5E7A] text-2xl font-bold truncate">{sitter.name}</Text>
        </View>
      </View>

      <Card className="p-6 mb-6">
        <View className="flex flex-col md:flex-row gap-6">
          <View className="flex-shrink-0">
            <Image src={sitter.image} alt={sitter.name} loading="lazy" className="w-32 h-32 rounded-full object-cover mx-auto md:mx-0" />
          </View>
          <View className="flex-1">
            <View className="flex items-start justify-between mb-2">
              <View>
                <Text className="text-[#FB5E7A] mb-1">{sitter.name}</Text>
                <View className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
                  <MapPin className="w-4 h-4" />
                  <Text>{sitter.location}</Text>
                </View>
              </View>
              <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                <Shield className="w-3 h-3 mr-1" />
                {sitterT.verified}
              </Badge>
            </View>
            <View className="flex items-center gap-4 mb-4">
              <View className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <Text>{sitter.rating}</Text>
                <Text className="text-sm text-gray-500">({sitter.reviews} {sitterT.reviews})</Text>
              </View>
            </View>
            <View className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <View className="text-center p-3 bg-[#FFD1DA]/20 rounded-lg">
                <View className="text-[#FB5E7A] font-bold">{sitter.experience}</View>
                <View className="text-xs text-gray-600">{sitterT.experience}</View>
              </View>
              <View className="text-center p-3 bg-[#FFD1DA]/20 rounded-lg">
                <View className="text-[#FB5E7A] font-bold">{sitter.reviews}</View>
                <View className="text-xs text-gray-600">{sitterT.completedJobs}</View>
              </View>
              <View className="text-center p-3 bg-[#FFD1DA]/20 rounded-lg">
                <View className="text-[#FB5E7A] font-bold">{hourlyRate > 0 ? `${hourlyRate} ${sitterT.egp}` : '---'}</View>
                <View className="text-xs text-gray-600">{sitterT.pricePerHour}</View>
              </View>
              <View className="text-center p-3 bg-[#FFD1DA]/20 rounded-lg flex items-center justify-center">
                <Text className="text-xs font-medium text-gray-700">
                  {sitter.availabilityType === 'home' && sitterT.atHomeOnly}
                  {sitter.availabilityType === 'outside' && sitterT.outsideOnly}
                  {sitter.availabilityType === 'both' && sitterT.both}
                </Text>
              </View>
            </View>

            {!(sitter.services && sitter.services.filter((s) => s.is_active !== false).length > 0) && (
              <Alert className="mb-4 bg-gray-50 border-gray-200">
                <AlertCircle className="h-4 w-4 text-gray-500" />
                <AlertDescription className="text-gray-600 text-sm">
                  {sitterT.currentlyUnavailable} - {language === 'ar' ? 'هذه الخالة لم تقم بتفعيل أي خدمات حجز حالياً.' : 'This sitter has not enabled any booking services yet.'}
                </AlertDescription>
              </Alert>
            )}

            {/* Main Book Trigger */}
            <Button
              onPress={() => setShowServicesDialog(true)}
              disabled={!(sitter.services && sitter.services.filter((s) => s.is_active !== false).length > 0)}
              className="w-full bg-[#FB5E7A] hover:bg-[#e5536e] h-12 text-lg font-bold disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Calendar className="w-4 h-4 mr-2" />
              {sitter.services && sitter.services.filter((s) => s.is_active !== false).length > 0
                ? sitterT.bookNow
                : sitterT.currentlyUnavailable}
            </Button>

            {/* Services Selection Dialog */}
            <Dialog open={showServicesDialog} onOpenChange={setShowServicesDialog}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{sitterT.selectServiceTitle}</DialogTitle>
                </DialogHeader>
                <View className="space-y-4 py-4">
                  {sitter.services && sitter.services.filter((s) => s.is_active !== false).map((service) => (
                    <View key={service.id} className="p-4 border rounded-lg flex justify-between items-center hover:bg-gray-50">
                      <View>
                        <Text className="font-bold text-[#FB5E7A]">
                          {service.name === 'hourly' && sitterT.serviceHourly}
                          {service.name === 'weekly' && sitterT.serviceWeekly}
                          {service.name === 'monthly' && sitterT.serviceMonthly}
                          {!['hourly', 'weekly', 'monthly'].includes(service.name) && service.name}
                        </Text>
                        <Text className="text-sm text-gray-600 font-medium">
                          {service.pricePerHour || service.price} {sitterT.egp} / {sitterT.perHourLabel}
                        </Text>
                        {service.description && <Text className="text-xs text-gray-500 mt-1">{service.description}</Text>}
                      </View>
                      <Button
                        size="sm"
                        onPress={() => handleServiceSelect(service)}
                        className="bg-[#FB5E7A] hover:bg-[#e5536e]"
                      >
                        {sitterT.bookNow}
                      </Button>
                    </View>
                  ))}
                </View>
              </DialogContent>
            </Dialog>


            <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{sitterT.bookingDetails}</DialogTitle>
                </DialogHeader>
                <View className="space-y-4 py-4">
                  <View className="space-y-3">
                    <Label className="text-sm font-semibold">{sitterT.serviceType}</Label>
                    <RadioGroup value={serviceType} onValueChange={(v: string) => setServiceType(v as "home" | "outside")} className="flex flex-col gap-2">
                      {(sitter.availabilityType === 'home' || sitter.availabilityType === 'both') && (
                        <View className="flex items-center space-x-2 rtl:space-x-reverse p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                          <RadioGroupItem value="home" id="home" />
                          <Label htmlFor="home" className="flex items-center flex-1 cursor-pointer">
                            <HomeIcon className="w-4 h-4 mr-2 ml-2" />
                            {sitterT.atHome}
                          </Label>
                        </View>
                      )}
                      {(sitter.availabilityType === 'outside' || sitter.availabilityType === 'both') && (
                        <View className="flex items-center space-x-2 rtl:space-x-reverse p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                          <RadioGroupItem value="outside" id="outside" />
                          <Label htmlFor="outside" className="flex items-center flex-1 cursor-pointer">
                            <Building2 className="w-4 h-4 mr-2 ml-2" />
                            {sitterT.outside}
                          </Label>
                        </View>
                      )}
                    </RadioGroup>
                  </View>

                  <View className="space-y-3">
                    <Label className="text-sm font-semibold">{sitterT.selectDate}</Label>
                    <View className="flex flex-wrap gap-2 text-xs text-gray-500 mb-2">
                      <View className="flex items-center gap-1">
                        <View className="w-3 h-3 rounded-full bg-[#FB5E7A]/20" />
                        <Text>{sitterT.available}</Text>
                      </View>
                    </View>
                    <CalendarComponent
                      mode="multiple"
                      selected={selectedDates}
                      onSelect={setSelectedDates}
                      disabled={(date: Date) => date < new Date() || !isDateAvailable(date)}
                      modifiers={{
                        available: (date: Date) => isDateAvailable(date)
                      }}
                      modifiersStyles={{
                        available: { backgroundColor: '#FB5E7A20', color: '#FB5E7A', fontWeight: 'bold' }
                      }}
                      className="rounded-md border p-3"
                    />
                  </View>

                  <View className="space-y-4">
                    <Label className="text-sm font-semibold">{sitterT.selectTime}</Label>
                    {availableTimeSlots.length > 0 ? (
                      <View className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {availableTimeSlots.flatMap((slot, slotIdx) => {
                          const startHour = parseInt(slot.start.split(':')[0]);
                          const endHour = parseInt(slot.end.split(':')[0]);
                          const hours: string[] = [];
                          for (let h = startHour; h < endHour; h++) {
                            hours.push(`${h.toString().padStart(2, '0')}:00`);
                          }
                          return hours.map((time) => (
                            <Pressable
                              key={`${slotIdx}-${time}`}
                              type="button"
                              onPress={() => setSelectedTime(time)}
                              className={`
                                  py-2 px-1 text-sm rounded-lg border transition-all duration-200
                                  ${selectedTime === time
                                  ? 'bg-[#FB5E7A] text-white border-[#FB5E7A] shadow-md transform scale-105'
                                  : 'bg-white text-gray-700 border-gray-200 hover:border-[#FB5E7A] hover:bg-[#FB5E7A]/5'}
                                `}
                            >
                              {formatTime12h(time)}
                            </Pressable>
                          ));
                        })}
                      </View>
                    ) : (
                      <View className="p-4 border border-dashed rounded-lg text-center text-sm text-gray-500 bg-gray-50">
                        {selectedDates && selectedDates.length > 0
                          ? sitterT.noSlotsAvailable
                          : sitterT.selectDateFirst}
                      </View>
                    )}

                    {availableTimeSlots.length > 0 && (
                      <View className="flex flex-wrap gap-2 mt-2">
                        {availableTimeSlots.map((slot, idx) => (
                          <View key={idx} className="flex items-center gap-1.5 px-2 py-1 bg-[#FB5E7A]/5 border border-[#FB5E7A]/10 rounded-full">
                            <Clock className="w-3 h-3 text-[#FB5E7A]" />
                            <Text className="text-[10px] font-medium text-[#FB5E7A]">
                              {formatTime12h(slot.start)} - {formatTime12h(slot.end)}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>

                  <View className="space-y-3">
                    <Label className="text-sm font-semibold">{sitterT.durationLabel}</Label>
                    <View className="flex items-center border rounded-lg h-11 px-1 bg-white">
                      <Button
                        variant="ghost"
                        size="icon"
                        onPress={() => setDuration(Math.max(2, duration - 1))}
                        className="h-9 w-9 text-gray-500"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <View className="flex-1 text-center font-medium">
                        {duration} {sitterT.minimumHoursLabel}
                      </View>
                      <Button
                        variant="ghost"
                        size="icon"
                        onPress={() => setDuration(duration + 1)}
                        className="h-9 w-9 text-gray-500"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </View>
                  </View>

                  <View className="space-y-3">
                    <Label className="text-sm font-semibold">{sitterT.childrenCount}</Label>

                    <View className="space-y-2">
                      {childrenList.length > 0 && childrenList.map((child: any) => (
                        <View key={child.id} className="flex items-center space-x-2 rtl:space-x-reverse p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                          <Checkbox
                            id={child.id}
                            checked={selectedChildIds.includes(child.id)}
                            onCheckedChange={(checked: boolean) => {
                              if (checked) setSelectedChildIds([...selectedChildIds, child.id]);
                              else setSelectedChildIds(selectedChildIds.filter(id => id !== child.id));
                            }}
                          />
                          <Label htmlFor={child.id} className="flex-1 cursor-pointer font-medium">
                            {child.name} ({child.age} {sitterT.yearsLabel})
                          </Label>
                        </View>
                      ))}
                    </View>

                    <View className="flex flex-col gap-2 mt-2">
                      {!isAddingNewChild ? (
                        <Button variant="outline" size="sm" onPress={() => setIsAddingNewChild(true)} className="w-full">
                          <Plus className="w-4 h-4 mr-2" />
                          {sitterT.addAnotherChild}
                        </Button>
                      ) : (
                        <View className="p-3 bg-gray-50 border rounded-lg space-y-3">
                          <Label className="text-sm font-medium">{sitterT.newChildTitle}</Label>
                          <Input
                            placeholder={sitterT.childNamePlaceholder}
                            value={newChildDetails.name}
                            onChange={(e: any) => setNewChildDetails({ ...newChildDetails, name: e.target.value })}
                          />
                          <Input
                            type="number"
                            placeholder={sitterT.childAgePlaceholder}
                            value={newChildDetails.age}
                            onChange={(e: any) => setNewChildDetails({ ...newChildDetails, age: e.target.value })}
                          />
                          <View className="flex gap-2 justify-end">
                            <Button variant="ghost" size="sm" onPress={() => setIsAddingNewChild(false)}>
                              {sitterT.cancel}
                            </Button>
                            <Button size="sm" onPress={handleAddNewChild} disabled={!newChildDetails.name}>
                              {sitterT.confirm}
                            </Button>
                          </View>
                          <Text className="text-xs text-muted-foreground">
                            {sitterT.extraCostNotice}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {serviceType === 'home' && (
                    <View className="space-y-3">
                      <Label className="text-sm font-semibold">{sitterT.address}</Label>

                      {selectedAddress && !showAddressInput && (
                        <View className="p-3 border rounded-lg bg-gray-50 flex justify-between items-center">
                          <View className="flex items-center gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <Text>{selectedAddress}</Text>
                          </View>
                          <Button variant="link" size="sm" onPress={() => setShowAddressInput(true)}>
                            {sitterT.change}
                          </Button>
                        </View>
                      )}

                      {(!selectedAddress || showAddressInput) && (
                        <View className="space-y-3">
                          <Input
                            value={newAddress}
                            onChange={(e: any) => setNewAddress(e.target.value)}
                            placeholder={sitterT.newAddress}
                            className="h-11"
                          />
                          <View className="flex items-center space-x-2 rtl:space-x-reverse">
                            <Checkbox
                              id="save-address"
                              checked={saveNewAddress}
                              onCheckedChange={(c: boolean) => setSaveNewAddress(c)}
                            />
                            <Label htmlFor="save-address" className="text-sm text-gray-600">
                              {sitterT.saveAsDefault}
                            </Label>
                          </View>
                        </View>
                      )}
                    </View>
                  )}

                  <View className="space-y-3">
                    <Label className="text-sm font-semibold">{sitterT.notes}</Label>
                    <Textarea
                      value={notes}
                      onChange={(e: any) => setNotes(e.target.value)}
                      placeholder={sitterT.notes}
                      rows={3}
                      className="resize-none"
                    />
                  </View>

                  <View className="p-4 bg-[#FFD1DA]/10 border border-[#FFD1DA] rounded-lg font-bold flex justify-between items-center mt-6">
                    <Text className="text-gray-700">{sitterT.estimatedCost}</Text>
                    <Text className="text-[#FB5E7A] text-xl font-black">{estimatedCost} {sitterT.egp}</Text>
                  </View>

                  {serviceType === 'home' && !selectedAddress && !newAddress && (
                    <Alert className="mb-4 bg-red-50 border-red-200">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <AlertDescription className="text-red-700 text-sm font-medium">
                        {sitterT.addressRequiredNotice}
                      </AlertDescription>
                    </Alert>
                  )}

                  <View className="flex gap-3 pt-6">
                    <Button
                      variant="outline"
                      onPress={() => setShowBookingDialog(false)}
                      className="flex-1 h-12"
                    >
                      {sitterT.cancel}
                    </Button>
                    <Button
                      onPress={handleBooking}
                      disabled={isBooking || !selectedDates?.length || (serviceType === 'home' && !selectedAddress && !newAddress)}
                      className="flex-[2] bg-[#FB5E7A] hover:bg-[#e5536e] h-12 font-bold"
                    >
                      {isBooking ? (language === 'ar' ? 'جاري الإرسال...' : 'Sending...') : sitterT.confirmBooking}
                    </Button>
                  </View>
                </View>
              </DialogContent>
            </Dialog>
          </View>
        </View>
      </Card>

      <Tabs defaultValue="about">
        <TabsList className="w-full grid grid-cols-3 mb-6">
          <TabsTrigger value="about">{sitterT.about}</TabsTrigger>
          <TabsTrigger value="services">{sitterT.services}</TabsTrigger>
          <TabsTrigger value="reviews">{sitterT.reviewsTab}</TabsTrigger>
        </TabsList>
        <TabsContent value="about" className="space-y-6">
          <Card className="p-6">
            <Text className="text-lg font-semibold mb-3">{sitterT.about}</Text>
            <Text className="text-gray-600 dark:text-gray-400">
              {sitter.raw?.bio || (language === 'ar' ? 'لا يوجد نبذة تعريفية' : 'No bio available')}
            </Text>
          </Card>
          <View className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <Text className="text-lg font-semibold mb-3">{sitterT.languages}</Text>
              <View className="flex flex-wrap gap-2">
                {sitter.languages.map((lang: string) => (
                  <Badge key={lang} variant="secondary">{lang}</Badge>
                ))}
              </View>
            </Card>
            <Card className="p-6">
              <Text className="text-lg font-semibold mb-3">{sitterT.specialties}</Text>
              <View className="flex flex-wrap gap-2">
                {sitter.specialties.map((spec: string) => (
                  <Badge key={spec} variant="secondary">{spec}</Badge>
                ))}
              </View>
            </Card>
          </View>
        </TabsContent>
        <TabsContent value="services">
          <Card className="p-6">
            <Text className="text-lg font-semibold mb-4">{sitterT.skills}</Text>
            <View className="space-y-4">
              {sitter.services.map((service) => (
                <View key={service.id} className="flex justify-between items-center p-3 border rounded-lg">
                  <View>
                    <View className="font-semibold text-gray-900 border-none">
                      {service.name === 'hourly' && sitterT.serviceHourly}
                      {service.name === 'weekly' && sitterT.serviceWeekly}
                      {service.name === 'monthly' && sitterT.serviceMonthly}
                      {!['hourly', 'weekly', 'monthly'].includes(service.name) && service.name}
                    </View>
                    {service.description && (
                      <Text className="text-sm text-gray-500">{service.description}</Text>
                    )}
                  </View>
                  <View className="text-[#FB5E7A] font-bold">
                    {service.pricePerHour || service.price} {sitterT.egp} / {sitterT.perHourLabel}
                  </View>
                </View>
              ))}
            </View>
          </Card>
        </TabsContent>
        <TabsContent value="reviews">
          <Card className="p-6">
            <Text className="text-lg font-semibold mb-4">{sitterT.reviewsTab}</Text>
            <View className="flex items-center justify-center p-8 text-gray-500">
              {sitterT.noReviews}
            </View>
          </Card>
        </TabsContent>
      </Tabs>
    </View>
  );
}