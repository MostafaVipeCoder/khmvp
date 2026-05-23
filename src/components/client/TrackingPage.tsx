import { View, Text, Image } from '../../tw';
import { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft, CheckCircle, Clock, Shield, Loader2, Phone, MapPin } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { supabase } from '../../lib/supabase';
import { locationService } from '../../services/location';
import { useTranslation } from '../../hooks/useTranslation';

interface TrackingPageProps {
  booking: {
    id: string;
    sitterName: string;
    sitterImage: string;
    startTime: string; // Format "HH:MM"
    duration: number; // In hours
    status: 'ongoing' | 'confirmed';
  };
  onBack: () => void;
}

export default function TrackingPage({ booking, onBack }: TrackingPageProps) {
  const { t, language } = useTranslation();
  const trackingT = t.client.trackingPage;

  const [checkStatus, setCheckStatus] = useState<'idle' | 'sending' | 'confirmed'>('idle');
  const [currentLocation, setCurrentLocation] = useState<any>(null);

  useEffect(() => {
    const loadInitialLocation = async () => {
      try {
        const latest = await locationService.getLatestLocation(booking.id);
        if (latest) setCurrentLocation(latest);
      } catch (error) {
        console.error('Error loading initial location:', error);
      }
    };
    loadInitialLocation();

    const channel = supabase
      .channel(`sitter-location-${booking.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'sitter_locations',
          filter: `booking_id=eq.${booking.id}`
        },
        (payload) => {
          setCurrentLocation(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [booking.id]);

  const currentProgressPercent = 50; // 50% completed
  const calculateTime = (startTime: string, offsetHours: number) => {
    try {
      const [time, period] = startTime.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      if (period === 'PM' && hours < 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;

      const date = new Date();
      date.setHours(hours + offsetHours, minutes, 0, 0);

      return date.toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      });
    } catch (e) {
      return startTime;
    }
  };

  const timePoints = Array.from({ length: booking.duration + 1 }, (_, i) => ({
    label: i === 0 ? trackingT.sessionStarted :
      i === booking.duration ? trackingT.sessionEnds :
        `${trackingT.hourLabel} ${i}`,
    time: calculateTime(booking.startTime, i)
  }));

  const handleSafetyCheck = () => {
    if (checkStatus !== 'idle') return;

    setCheckStatus('sending');

    setTimeout(() => {
      setCheckStatus('confirmed');
      alert(trackingT.safetyCheckConfirmed);

      setTimeout(() => {
        setCheckStatus('idle');
      }, 5000);
    }, 3000);
  };

  return (
    <View className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <View className="bg-white dark:bg-gray-800 p-4 shadow-sm sticky top-0 z-10">
        <View className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onPress={onBack}>
            {language === 'ar' ? <ArrowRight className="size-5" /> : <ArrowLeft className="size-5" />}
          </Button>
          <Text className="font-bold text-lg">{trackingT.trackingTitle}</Text>
        </View>
      </View>

      <View className="p-4 max-w-md mx-auto space-y-6">

        {/* Info Card */}
        <Card className="p-4">
          <View className="flex gap-4 items-center">
            <View className="relative">
              <Image
                src={booking.sitterImage}
                alt={booking.sitterName}
                className="w-16 h-16 rounded-full object-cover border-2 border-green-500"
              />
              <View className="absolute -bottom-1 -right-1 bg-green-500 text-white p-0.5 rounded-full">
                <Shield className="w-3 h-3" />
              </View>
            </View>
            <View>
              <Text className="font-bold text-lg">{booking.sitterName}</Text>
              <Badge className="bg-green-100 text-green-700 mt-1">
                {trackingT.sessionStarted} {booking.startTime}
              </Badge>
            </View>
          </View>
        </Card>

        {/* Live Tracking Card */}
        {currentLocation && (
          <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-100">
            <View className="flex items-center gap-3">
              <View className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-blue-600" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-blue-900 dark:text-blue-100">
                  {trackingT.liveTracking}
                </Text>
                <Text className="text-xs text-blue-700 dark:text-blue-300">
                  {trackingT.sitterMoving}
                </Text>
              </View>
              <Badge variant="outline" className="animate-pulse bg-white">
                Live
              </Badge>
            </View>
            <View className="mt-3 text-[10px] text-gray-400 font-mono">
              Lat: {currentLocation.latitude.toFixed(4)}, Lng: {currentLocation.longitude.toFixed(4)}
            </View>
          </Card>
        )}

        {/* Timeline Visualization */}
        <Card className="p-6">
          <View className="relative pl-4 pr-4">
            {/* Progress Bar Background (Line) */}
            <View className="absolute left-8 top-2 bottom-2 w-1 bg-gray-200 rounded-full rtl:right-8 rtl:left-auto"></View>

            {/* Active Progress Line (Dynamic Height) */}
            <View
              className="absolute left-8 top-2 w-1 bg-[#FB5E7A] rounded-full transition-all duration-1000 rtl:right-8 rtl:left-auto"
              style={{ height: `${currentProgressPercent}%` }}
            ></View>

            {/* Time Points */}
            <View className="space-y-8 relative">
              {timePoints.map((tp, index) => {
                const progressStep = (index / booking.duration) * 100;
                const isCompleted = progressStep < currentProgressPercent;
                const isCurrent = Math.abs(progressStep - currentProgressPercent) < (100 / booking.duration / 2);

                return (
                  <View key={index} className="flex items-center gap-4 relative z-10">
                    <View className={`
                                    w-8 h-8 rounded-full flex items-center justify-center border-2 
                                    ${isCompleted || isCurrent ? 'bg-[#FB5E7A] border-[#FB5E7A] text-white' : 'bg-white border-gray-300 text-gray-300'}
                                    ${isCurrent ? 'ring-4 ring-[#FB5E7A]/20 animate-pulse' : ''}
                                `}>
                      {isCompleted ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                    </View>
                    <View>
                      <Text className={`font-bold text-sm ${isCompleted || isCurrent ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400'}`}>
                        {tp.label}
                      </Text>
                      <Text className="text-[10px] text-gray-500">{tp.time}</Text>
                      {isCurrent && (
                        <Text className="text-xs text-[#FB5E7A] font-medium">
                          {trackingT.currentStage}
                        </Text>
                      )}
                    </View>
                  </View>
                );
              })}

              <View
                className="absolute left-6 w-6 h-6 bg-white border-2 border-[#FB5E7A] rounded-full flex items-center justify-center shadow-md transition-all duration-1000 rtl:right-6 rtl:left-auto z-20"
                style={{ top: `calc(${currentProgressPercent}% - 12px)` }}
              >
                <View className="w-2 h-2 bg-[#FB5E7A] rounded-full animate-ping"></View>
              </View>
            </View>
          </View>
        </Card>

        {/* Actions */}
        <View className="grid grid-cols-2 gap-4">
          <Button
            variant={checkStatus === 'confirmed' ? 'default' : 'outline'}
            className={`h-auto py-4 flex flex-col gap-2 ${checkStatus === 'confirmed' ? 'bg-green-600 hover:bg-green-700 text-white' : ''}`}
            onPress={handleSafetyCheck}
            disabled={checkStatus === 'sending'}
          >
            {checkStatus === 'sending' ? (
              <Loader2 className="w-6 h-6 animate-spin text-[#FB5E7A]" />
            ) : checkStatus === 'confirmed' ? (
              <CheckCircle className="w-6 h-6" />
            ) : (
              <Shield className="w-6 h-6 text-green-600" />
            )}

            <Text>
              {checkStatus === 'sending' ? trackingT.waitingResponse :
                checkStatus === 'confirmed' ? trackingT.verified : trackingT.safetyCheck}
            </Text>
          </Button>

          <Button variant="destructive" className="h-auto py-4 flex flex-col gap-2 opacity-80 hover:opacity-100">
            <Phone className="w-6 h-6" />
            <Text>{trackingT.emergency}</Text>
          </Button>
        </View>

        {checkStatus === 'sending' && (
          <Text className="text-center text-sm text-gray-500 animate-pulse">{trackingT.safetyCheckSent}</Text>
        )}

      </View>
    </View>
  );
}