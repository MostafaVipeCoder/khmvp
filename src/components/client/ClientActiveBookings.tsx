import { View, Text, Image } from '../../tw';
import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, MessageCircle, QrCode, CheckCircle, Loader2 } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import ChatPage from './ChatPage';
import TrackingPage from './TrackingPage';
import { bookingService } from '@/services/booking';
import { useAuthStore } from '@/stores/useAuthStore';
import { toast } from 'sonner';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useTranslation } from '@/hooks/useTranslation';
import { notificationService } from '@/services/notification';
import { supabase } from '@/lib/supabase';


interface FormattedBooking {
  id: string;
  sitter_id: string;
  sitterName: string;
  sitterImage: string;
  date: string;
  time: string;
  duration: number;
  location: string;
  type: 'home' | 'outside';
  status: 'confirmed' | 'ongoing' | 'upcoming' | 'waiting_payment';
  price: number;
}

// ... imports

interface ClientActiveBookingsProps {
  onNavigate?: (tab: 'home' | 'requests' | 'schedule' | 'profile') => void;
}

export default function ClientActiveBookings({ onNavigate }: ClientActiveBookingsProps) {
  const { user } = useAuthStore();
  const { t, language } = useTranslation();
  const activeT = t.client.activeBookings;

  const [activeBookings, setActiveBookings] = useState<FormattedBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [chatBooking, setChatBooking] = useState<FormattedBooking | null>(null);

  const [showTracking, setShowTracking] = useState(false);
  const [trackingBooking, setTrackingBooking] = useState<FormattedBooking | null>(null);

  const [showScanner, setShowScanner] = useState(false);
  const [scanningBooking, setScanningBooking] = useState<FormattedBooking | null>(null);

  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;

    if (showScanner && scanningBooking) {
      const timer = setTimeout(() => {
        scanner = new Html5QrcodeScanner(
          "reader",
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
          },
          false
        );

        scanner.render(async (decodedText: string) => {
          // Format: KHMVP-VERIFY:booking_id:sitter_id:client_id
          if (decodedText.startsWith('KHMVP-VERIFY:')) {
            const parts = decodedText.split(':');
            const [_, scannedBookingId, scannedSitterId, scannedClientId] = parts;

            // 1. Check if it's the right booking ID
            if (scannedBookingId !== scanningBooking.id) {
              toast.error(activeT.wrongSitter);
              // Report to the scanned sitter that a wrong client tried to scan them
              notificationService.createNotification({
                user_id: scannedSitterId,
                type: 'scan_mismatch',
                title: language === 'ar' ? 'تنبيه أمان' : 'Security Alert',
                message: language === 'ar' ? 'هذه ليست العميلة المطلوبة' : 'This is not the correct client',
                data: { scanned_by: user?.id, expected_client: scannedClientId }
              }).catch(e => console.error("Failed to report mismatch", e));
              return;
            }

            // 2. Check if it's the right sitter ID
            if (scannedSitterId !== scanningBooking.sitter_id) {
              toast.error(activeT.wrongSitter);
              return;
            }

            // 3. Check if it's the right client ID
            if (scannedClientId !== user?.id) {
              toast.error(activeT.wrongClient);
              // Report to the sitter that a wrong client tried to scan them
              notificationService.createNotification({
                user_id: scanningBooking.sitter_id,
                type: 'scan_mismatch',
                title: language === 'ar' ? 'تنبيه أمان' : 'Security Alert',
                message: language === 'ar' ? 'هذه ليست العميلة المطلوبة' : 'This is not the correct client',
                data: { scanned_by: user?.id, booking_id: scanningBooking.id }
              }).catch(e => console.error("Failed to report mismatch", e));
              return;
            }

            // All good!
            if (scanner) scanner.clear();
            await handleScanSuccess();
          } else {
            // Support legacy format for transition if needed, otherwise show error
            if (decodedText === `Booking-${scanningBooking.id}`) {
              if (scanner) scanner.clear();
              await handleScanSuccess();
            } else {
              toast.error(language === 'ar' ? 'كود خاطئ!' : 'Invalid code!');
            }
          }
        }, () => { });
      }, 500);

      return () => {
        clearTimeout(timer);
        if (scanner) {
          scanner.clear().catch(err => console.error("Failed to clear scanner", err));
        }
      };
    }
  }, [showScanner, scanningBooking]);

  useEffect(() => {
    async function fetchActiveBookings() {
      if (!user) return;
      try {
        setIsLoading(true);
        const data = await bookingService.getClientBookings(user.id);
        const active = data
          .filter(b => b.status === 'ongoing' || b.status === 'upcoming' || b.status === 'waiting_payment')
          .map(b => ({
            id: b.id,
            sitter_id: b.sitter_id,
            sitterName: b.sitter?.full_name || 'Khala',
            sitterImage: b.sitter?.avatar_url || 'https://via.placeholder.com/150',
            date: b.date,
            time: b.start_time,
            duration: b.duration_hours,
            location: b.location,
            type: b.booking_type,
            status: b.status,
            price: b.total_price
          } as FormattedBooking));

        setActiveBookings(active);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setIsLoading(false);
      }
    }

    if (user?.id) {
      fetchActiveBookings();

      const bookingChannel = supabase
        .channel('active-bookings')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'bookings',
            filter: `client_id=eq.${user.id}`
          },
          () => {
            fetchActiveBookings();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(bookingChannel);
      };
    }
  }, [user?.id]);

  const getStatusBadge = (status: FormattedBooking['status']) => {
    const styles = {
      confirmed: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      ongoing: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 animate-pulse',
      upcoming: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
      waiting_payment: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    };

    return (
      <Badge className={styles[status]}>
        {status === 'upcoming' || status === 'confirmed' ? activeT.confirmed :
          status === 'ongoing' ? activeT.ongoing :
            status}
      </Badge>
    );
  };

  const handleScanSuccess = async () => {
    if (scanningBooking) {
      try {
        const now = new Date();
        const [year, month, day] = scanningBooking.date.split('-').map(Number);
        const timeStr = scanningBooking.time;
        const [hoursMin, period] = timeStr.split(' ');
        let [hours, minutes] = hoursMin.split(':').map(Number);

        if (period === 'PM' && hours < 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;

        const bookingDate = new Date(year, month - 1, day, hours, minutes);

        if (now < bookingDate) {
          const earlyError = language === 'ar'
            ? 'لم يحن بعد وقت الطلب المتفق عليه'
            : 'The agreed time for the request has not yet arrived';
          toast.error(earlyError);
          return;
        }

        await bookingService.updateStatus(scanningBooking.id, 'ongoing');
        setActiveBookings((prev: FormattedBooking[]) => prev.map((b: FormattedBooking) => b.id === scanningBooking.id ? { ...b, status: 'ongoing' } : b));
        toast.success(activeT.scanSuccess);
        setShowScanner(false);
      } catch (error) {
        console.error('Error starting session:', error);
        toast.error(language === 'ar' ? 'حدث خطأ أثناء بدء الجلسة' : 'Error starting session');
      }
    }
  };

  if (showChat && chatBooking) {
    return (
      <ChatPage
        onBack={() => setShowChat(false)}
        bookingId={chatBooking.id}
        recipientId={chatBooking.sitter_id}
        recipientName={chatBooking.sitterName}
        recipientImage={chatBooking.sitterImage}
      />
    );
  }

  if (showTracking && trackingBooking) {
    return (
      <TrackingPage
        booking={{
          ...trackingBooking,
          startTime: trackingBooking.time,
          status: trackingBooking.status as 'ongoing' | 'confirmed'
        }}
        onBack={() => setShowTracking(false)}
      />
    );
  }

  return (
    <View className="max-w-4xl mx-auto px-4 pb-8">
      {/* Sticky Header */}
      <View className="sticky top-0 z-50 bg-white dark:bg-gray-950 pt-6 pb-4 -mx-4 px-4 mb-4 border-b border-gray-100 dark:border-gray-800">
        <Text className="text-[#FB5E7A] text-2xl font-bold">{activeT.mySchedule}</Text>
      </View>

      {isLoading ? (
        <View className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Loader2 className="w-12 h-12 animate-spin mb-4" />
          <Text>{activeT.loading}</Text>
        </View>
      ) : activeBookings.length === 0 ? (
        <View className="flex flex-col items-center justify-center py-16 text-center">
          <View className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
            <Calendar className="w-10 h-10 text-gray-400" />
          </View>
          <Text className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {activeT.noActiveBookings}
          </Text>
          <Text className="text-gray-500 mb-8 max-w-sm mx-auto">
            {language === 'ar'
              ? 'ليس لديك أي حجز نشط حالياً. تصفح قائمة الخالات واحجز موعدك الآن.'
              : 'You don\'t have any active bookings. Browse our sitters and book your session now.'}
          </Text>
          <Button
            onPress={() => onNavigate?.('home')}
            className="bg-[#FB5E7A] hover:bg-[#e5536e] px-8"
          >
            {language === 'ar' ? 'ابحث عن خالة' : 'Find a Sitter'}
          </Button>
        </View>
      ) : (
        <View className="space-y-4">
          {activeBookings.map((booking: FormattedBooking) => (
            <Card key={booking.id} className={`p-4 ${booking.status === 'ongoing' ? 'border-green-500 border-2' : ''}`}>
              <View className="flex gap-4">
                <Image
                  src={booking.sitterImage}
                  alt={booking.sitterName}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <View className="flex-1">
                  <View className="flex items-start justify-between mb-2">
                    <View>
                      <Text className="mb-1">{t.client.homePage.khala}{booking.sitterName}</Text>
                      {getStatusBadge(booking.status)}
                    </View>
                  </View>

                  <View className="space-y-1 text-sm text-gray-600 dark:text-gray-400 mb-3">
                    <View className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <Text>{booking.date}</Text>
                    </View>
                    <View className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <Text>{booking.time} ({booking.duration} {activeT.hours})</Text>
                    </View>
                    <View className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <Text>{booking.location}</Text>
                    </View>
                  </View>

                  <View className="flex items-center justify-between">
                    <View>
                      <Badge variant="outline">
                        {booking.type === 'home' ? activeT.atHome : activeT.outside}
                      </Badge>
                      <View className="text-[#FB5E7A] mt-1 font-bold">
                        {booking.price} {activeT.egp}
                      </View>
                    </View>

                    <View className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full w-10 h-10 p-0"
                        onPress={() => {
                          setChatBooking(booking);
                          setShowChat(true);
                        }}
                      >
                        <MessageCircle className="w-4 h-4" />
                      </Button>

                      {(booking.status === 'confirmed' || booking.status === 'upcoming') && (
                        <Button
                          size="sm"
                          className="rounded-full w-10 h-10 p-0 bg-[#FB5E7A] hover:bg-[#e5536e]"
                          onPress={() => {
                            setScanningBooking(booking);
                            setShowScanner(true);
                          }}
                        >
                          <QrCode className="w-4 h-4 text-white" />
                        </Button>
                      )}
                    </View>
                  </View>
                </View>
              </View>

              {booking.status === 'ongoing' && (
                <View className="mt-4 pt-4 border-t">
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    onPress={() => {
                      setTrackingBooking(booking);
                      setShowTracking(true);
                    }}
                  >
                    {activeT.trackBooking}
                  </Button>
                </View>
              )}
            </Card>
          ))}
        </View>
      )}

      {/* Scanner Modal */}
      <Dialog open={showScanner} onOpenChange={(open: boolean) => {
        if (!open) {
          setShowScanner(false);
        }
      }}>
        <DialogContent className="max-w-md w-[90vw]">
          <DialogHeader>
            <DialogTitle>{activeT.scanTitle}</DialogTitle>
          </DialogHeader>
          <View className="flex flex-col items-center gap-4 py-6">
            <View id="reader" className="w-full bg-black rounded-lg overflow-hidden min-h-[300px]"></View>

            <Text className="text-sm text-center text-gray-500 px-4">{activeT.scanDesc}</Text>

            <Button
              variant="outline"
              className="w-full border-dashed"
              onPress={handleScanSuccess}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {activeT.simulateScan}
            </Button>
          </View>
        </DialogContent>
      </Dialog>
    </View>
  );
}