import { View, Text, Pressable, Image } from '../../tw';
import { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, FileText, Mic, StopCircle, Star, Eye, Activity, MessageCircle } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Calendar } from '../ui/calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import RequestDetails, { BookingRequest } from './RequestDetails';
import SitterChatPage from './SitterChatPage';
import SitterSessionPage from './SitterSessionPage';
import { useAuthStore } from '../../stores/useAuthStore';
import { bookingService } from '../../services/booking';
import { sitterService } from '../../services/sitter';
import { toast } from 'sonner';
import type { Language } from '../../App';

interface SitterBookingsProps {
  language: Language;
}

interface Booking {
  id: string;
  client_id: string;
  clientName: string;
  clientImage: string;
  date: string;
  time: string;
  duration: number;
  location: string;
  type: 'home' | 'outside';
  status: 'pending' | 'waiting_payment' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  price: number;
  children: number;
  notes?: string;
}

const translations = {
  ar: {
    myBookings: 'إدارة الحجوزات',
    calendar: 'التقويم',
    list: 'القائمة',
    requests: 'طلبات الانتظار',
    confirmed: 'المؤكدة',
    ongoing: 'الجارية',
    upcoming: 'القادمة',
    completed: 'المكتملة',
    date: 'التاريخ',
    time: 'الوقت',
    duration: 'المدة',
    hours: 'ساعات',
    children: 'طفل',
    atHome: 'في المنزل',
    outside: 'خارج المنزل',
    contact: 'تواصل',
    sendReport: 'إرسال تقرير',
    noBookings: 'لا توجد حجوزات في هذا القسم',
    egp: 'جنيه',
    writeReport: 'اكتبي تقرير الجلسة',
    submit: 'إرسال',
    cancel: 'إلغاء',
    reportSent: 'تم إرسال التقرير بنجاح',
    recordVoice: 'تسجيل صوتي',
    startRecording: 'بدء التسجيل',
    stopRecording: 'إيقاف التسجيل',
    playRecording: 'تشغيل التسجيل',
    rating: 'تقييم العميل',
    rateClient: 'كيف كانت تجربتك مع العميل؟',
    or: 'أو',
    voiceMessage: 'رسالة صوتية',
    viewDetails: 'عرض التفاصيل',
    pending: 'قيد الانتظار',
    waiting_payment: 'بانتظار الدفع',
    requestAccepted: 'تم قبول الطلب بنجاح. بانتظار دفع العميلة.',
    requestDeclined: 'تم رفض الطلب',
    showQR: 'عرض كود QR',
    qrTitle: 'كود تأكيد الهوية',
    qrDesc: 'اطلبي من العميلة مسح هذا الكود عند الوصول لبدء الخدمة.',
    manageSession: 'إدارة الجلسة',
    cancelled: 'ملغي',
    error: 'حدث خطأ'
  },
  en: {
    myBookings: 'Booking Management',
    calendar: 'Calendar',
    list: 'List',
    requests: 'Pending Requests',
    confirmed: 'Confirmed',
    ongoing: 'Ongoing',
    upcoming: 'Upcoming',
    completed: 'Completed',
    date: 'Date',
    time: 'Time',
    duration: 'Duration',
    hours: 'hours',
    children: 'child',
    atHome: 'At Home',
    outside: 'Outside',
    contact: 'Contact',
    sendReport: 'Send Report',
    noBookings: 'No bookings in this section',
    egp: 'EGP',
    writeReport: 'Write session report',
    submit: 'Submit',
    cancel: 'Cancel',
    reportSent: 'Report sent successfully',
    recordVoice: 'Voice Record',
    startRecording: 'Start Recording',
    stopRecording: 'Stop Recording',
    playRecording: 'Play Recording',
    rating: 'Rate Client',
    rateClient: 'How was your experience with the client?',
    or: 'OR',
    voiceMessage: 'Voice Message',
    viewDetails: 'View Details',
    pending: 'Pending',
    waiting_payment: 'Waiting Payment',
    requestAccepted: 'Request accepted. Waiting for client payment.',
    requestDeclined: 'Request declined',
    showQR: 'Show QR Code',
    qrTitle: 'Identity Verification Code',
    qrDesc: 'Ask the client to scan this code upon arrival to start the service.',
    manageSession: 'Manage Session',
    cancelled: 'Cancelled',
    error: 'Error occurred'
  }
};

export default function SitterBookings({ language }: SitterBookingsProps) {
  const { user } = useAuthStore();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showSessionPage, setShowSessionPage] = useState(false);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const [chatBooking, setChatBooking] = useState<Booking | null>(null);
  const [selectedBookingDetail, setSelectedBookingDetail] = useState<Booking | null>(null);
  const [sessionBooking, setSessionBooking] = useState<Booking | null>(null);

  const [report, setReport] = useState('');
  const [clientRating, setClientRating] = useState(0);
  const [activeSubTab, setActiveSubTab] = useState('ongoing');

  // Voice Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const t = translations[language];

  useEffect(() => {
    if (user?.id) {
      loadBookings();
    }
  }, [user?.id]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      if (!user?.id) return;

      const data = await bookingService.getSitterBookings(user.id);

      if (data) {
        const formattedBookings: Booking[] = data.map((b: any) => ({
          id: b.id,
          client_id: b.client_id,
          clientName: b.client?.full_name || 'Client',
          clientImage: b.client?.avatar_url || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
          date: b.date,
          time: b.start_time,
          duration: b.duration_hours,
          location: b.location,
          type: b.booking_type,
          status: b.status,
          price: b.total_price,
          children: 1, // Assumption for now as it's not in bookings table directly yet, likely need to parse notes or add column
          notes: ''
        }));
        setBookings(formattedBookings);
      }
    } catch (error) {
      console.error(error);
      toast.error(t.error);
    } finally {
      setLoading(false);
    }
  };

  const getBookingsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return bookings.filter(booking => booking.date === dateStr);
  };

  const handleSendReport = () => {
    // TODO: Implement actual report submission
    if ((report.trim() || audioBlob) && clientRating > 0) {
      alert(t.reportSent);
      setShowReportDialog(false);
      setReport('');
      setAudioBlob(null);
      setClientRating(0);
      setSelectedBookingDetail(null);
    } else {
      if (clientRating === 0) {
        alert(language === 'ar' ? 'يرجى تقييم العميل' : 'Please rate the client');
      }
    }
  };

  const handleAccept = async (id: string) => {
    try {
      // Check verification status
      const profile = await sitterService.getProfile(user!.id);
      if (!profile.is_verified) {
        toast.error(language === 'ar' ? 'يجب توثيق حسابك أولاً لقبول الطلبات' : 'You must verify your account first to accept requests');
        return;
      }

      await bookingService.updateStatus(id, 'waiting_payment');
      toast.success(t.requestAccepted);
      setSelectedBookingDetail(null);
      loadBookings();
    } catch (error) {
      toast.error(t.error);
    }
  };

  const handleDecline = async (id: string) => {
    try {
      await bookingService.updateStatus(id, 'cancelled');
      toast.success(t.requestDeclined);
      setSelectedBookingDetail(null);
      loadBookings();
    } catch (error) {
      toast.error(t.error);
    }
  };

  const toggleRecording = () => {
    // ... same recording logic ...
    if (isRecording) {
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      setAudioBlob(new Blob(["mock audio"], { type: 'audio/webm' }));
    } else {
      setIsRecording(true);
      setAudioBlob(null);
      setRecordingDuration(0);
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const renderBookingCard = (booking: Booking) => (
    <Card key={booking.id} className={`p-4 ${booking.status === 'ongoing' ? 'border-green-500 border-2' : ''}`}>
      <View className="flex gap-4">
        <Image
          src={booking.clientImage}
          alt={booking.clientName}
          className="w-16 h-16 rounded-full object-cover"
        />
        <View className="flex-1">
          <View className="flex items-start justify-between mb-2">
            <View>
              <Text className="mb-1">{booking.clientName}</Text>
              <Badge variant="outline">
                {booking.children} {t.children}
              </Badge>
            </View>
            <Badge className={
              booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                booking.status === 'waiting_payment' ? 'bg-orange-100 text-orange-700' :
                  booking.status === 'upcoming' ? 'bg-blue-100 text-blue-700' :
                    booking.status === 'ongoing' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-700'
            }>
              {booking.status === 'pending' ? t.pending :
                booking.status === 'waiting_payment' ? t.waiting_payment :
                  t[booking.status]}
            </Badge>
          </View>

          <View className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
            <View className="flex items-center gap-1">
              <CalendarIcon className="w-4 h-4" />
              <Text>{booking.date}</Text>
            </View>
            <View className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <Text>{booking.time}</Text>
            </View>
            <View className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <Text>{booking.duration} {t.hours}</Text>
            </View>
            <View className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <Text>{booking.location}</Text>
            </View>
          </View>

          <View className="flex items-center justify-between">
            <Badge className={booking.type === 'home' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}>
              {booking.type === 'home' ? t.atHome : t.outside}
            </Badge>
            <View className="text-[#FB5E7A]">{booking.price} {t.egp}</View>
          </View>

          <View className="flex gap-2 mt-3">
            {/* Ongoing/Upcoming Special Actions */}
            {(booking.status === 'ongoing' || booking.status === 'upcoming') ? (
              <View className="flex gap-2 w-full">
                <Button
                  className={`flex-1 ${booking.status === 'ongoing' ? 'bg-green-600 hover:bg-green-700' : 'bg-[#FB5E7A] hover:bg-[#e5536e]'}`}
                  onPress={() => {
                    setSessionBooking(booking);
                    setShowSessionPage(true);
                  }}
                >
                  <Activity className="w-4 h-4 mr-2" />
                  {t.manageSession}
                </Button>
                <Button
                  variant="outline"
                  onPress={() => {
                    setChatBooking(booking);
                    setShowChat(true);
                  }}
                >
                  <MessageCircle className="w-4 h-4" />
                </Button>
              </View>
            ) : (
              <Button
                className="w-full bg-[#FB5E7A] hover:bg-[#e5536e]"
                onPress={() => setSelectedBookingDetail(booking)}
              >
                <Eye className="w-4 h-4 mr-2" />
                {t.viewDetails}
              </Button>
            )}
          </View>
        </View>
      </View>
    </Card>
  );

  const renderDetailActions = () => {
    if (!selectedBookingDetail) return null;

    if (selectedBookingDetail.status === 'waiting_payment') {
      return (
        <Button size="lg" variant="outline" className="w-full cursor-not-allowed opacity-70">
          <Clock className="w-5 h-5 mr-2" />
          {t.waiting_payment}
        </Button>
      );
    }

    return (
      <View className="flex flex-col gap-2 w-full">
        <View className="flex gap-2">
          {(selectedBookingDetail.status === 'upcoming' || selectedBookingDetail.status === 'ongoing') && (
            <>
              <Button
                size="lg"
                className="flex-1 bg-green-600 hover:bg-green-700"
                onPress={() => {
                  setSessionBooking(selectedBookingDetail);
                  setShowSessionPage(true);
                }}
              >
                <Activity className="w-5 h-5 mr-2" />
                {t.manageSession}
              </Button>
            </>
          )}
          {selectedBookingDetail.status === 'completed' && (
            <Button
              size="lg"
              onPress={() => {
                setShowReportDialog(true);
              }}
              className="flex-1 bg-[#FB5E7A] hover:bg-[#e5536e]"
            >
              <FileText className="w-5 h-5 mr-2" />
              {t.sendReport}
            </Button>
          )}
        </View>
      </View>
    );
  };

  // Render Conditional Pages
  if (showChat && chatBooking) {
    return (
      <SitterChatPage
        language={language}
        onBack={() => {
          setShowChat(false);
          setChatBooking(null);
        }}
        bookingId={chatBooking.id}
        recipientId={chatBooking.client_id}
        recipientName={chatBooking.clientName}
        recipientImage={chatBooking.clientImage}
      />
    );
  }

  if (showSessionPage && sessionBooking) {
    return (
      <SitterSessionPage
        language={language}
        booking={{
          ...sessionBooking,
          status: sessionBooking.status === 'upcoming' ? 'upcoming' : 'ongoing'
        }}
        onBack={() => setShowSessionPage(false)}
        onChat={() => {
          setChatBooking(sessionBooking);
          setShowChat(true);
        }}
      />
    );
  }

  return (
    <View className="max-w-4xl mx-auto px-4 pb-8">
      {selectedBookingDetail ? (
        <RequestDetails
          language={language}
          request={selectedBookingDetail as unknown as BookingRequest}
          onBack={() => setSelectedBookingDetail(null)}
          onAccept={selectedBookingDetail.status === 'pending' ? () => handleAccept(selectedBookingDetail.id) : undefined}
          onDecline={selectedBookingDetail.status === 'pending' ? () => handleDecline(selectedBookingDetail.id) : undefined}
          customActions={selectedBookingDetail.status !== 'pending' ? renderDetailActions() : undefined}
        />
      ) : (
        <>
          {loading ? (
            <View className="text-center py-12 text-gray-500">Loading...</View>
          ) : (
            <Tabs defaultValue="list" className="space-y-4">
              {/* Consolidated Sticky Header */}
              <View className="sticky top-0 z-50 bg-gray-50 dark:bg-gray-900 pt-6 pb-2 -mx-4 px-4 mb-2 border-b border-gray-100 dark:border-gray-800">
                <Text className="text-[#FB5E7A] text-2xl font-bold mb-4">{t.myBookings}</Text>

                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="list">{t.list}</TabsTrigger>
                  <TabsTrigger value="calendar">{t.calendar}</TabsTrigger>
                </TabsList>

                <TabsContent value="list" className="mt-0">
                  <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-4 h-auto bg-gray-100 dark:bg-gray-800 border-none">
                      <TabsTrigger value="ongoing" className="text-[10px] py-3 px-1 data-[state=active]:bg-[#FB5E7A] data-[state=active]:text-white">{t.ongoing}</TabsTrigger>
                      <TabsTrigger value="requests" className="text-[10px] py-3 px-1 data-[state=active]:bg-[#FB5E7A] data-[state=active]:text-white">{t.requests}</TabsTrigger>
                      <TabsTrigger value="confirmed" className="text-[10px] py-3 px-1 data-[state=active]:bg-[#FB5E7A] data-[state=active]:text-white">{t.confirmed}</TabsTrigger>
                      <TabsTrigger value="completed" className="text-[10px] py-3 px-1 data-[state=active]:bg-[#FB5E7A] data-[state=active]:text-white">{t.completed}</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </TabsContent>
              </View>

              <TabsContent value="list" className="space-y-4 mt-0">
                <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="space-y-4">
                  {/* Removed duplicate sticky div here */}

                  <TabsContent value="ongoing" className="space-y-4">
                    {bookings.filter(b => b.status === 'ongoing').length === 0 ? (
                      <View className="text-center py-12 text-gray-500">{t.noBookings}</View>
                    ) : (
                      bookings.filter(b => b.status === 'ongoing').map(renderBookingCard)
                    )}
                  </TabsContent>

                  <TabsContent value="requests" className="space-y-4">
                    {bookings.filter(b => b.status === 'pending').length === 0 ? (
                      <View className="text-center py-12 text-gray-500">{t.noBookings}</View>
                    ) : (
                      bookings.filter(b => b.status === 'pending').map(renderBookingCard)
                    )}
                  </TabsContent>

                  <TabsContent value="confirmed" className="space-y-4">
                    {bookings.filter(b => b.status === 'waiting_payment' || b.status === 'upcoming').length === 0 ? (
                      <View className="text-center py-12 text-gray-500">{t.noBookings}</View>
                    ) : (
                      bookings.filter(b => b.status === 'waiting_payment' || b.status === 'upcoming').map(renderBookingCard)
                    )}
                  </TabsContent>

                  <TabsContent value="completed" className="space-y-4">
                    {bookings.filter(b => b.status === 'completed').length === 0 ? (
                      <View className="text-center py-12 text-gray-500">{t.noBookings}</View>
                    ) : (
                      bookings.filter(b => b.status === 'completed').map(renderBookingCard)
                    )}
                  </TabsContent>
                </Tabs>
              </TabsContent>

              <TabsContent value="calendar">
                <Card className="p-6">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date: Date | undefined) => date && setSelectedDate(date)}
                    className="mx-auto"
                  />

                  <View className="mt-6 space-y-4">
                    <Text className="font-bold">{selectedDate.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}</Text>
                    {getBookingsForDate(selectedDate).length === 0 ? (
                      <Text className="text-center py-8 text-gray-500">{t.noBookings}</Text>
                    ) : (
                      getBookingsForDate(selectedDate).map(renderBookingCard)
                    )}
                  </View>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </>
      )}

      {/* Report Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.sendReport}</DialogTitle>
            <DialogDescription>
              {language === 'ar' ? 'يرجى كتابة تقرير مفصل عن الجلسة أو تسجيل رسالة صوتية.' : 'Please write a detailed report about the session or record a voice message.'}
            </DialogDescription>
          </DialogHeader>
          <View className="space-y-6 py-4">
            <View className="space-y-2 text-center">
              <Label>{t.rateClient}</Label>
              <View className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Pressable
                    key={star}
                    onPress={() => setClientRating(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 ${star <= clientRating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                        }`}
                    />
                  </Pressable>
                ))}
              </View>
            </View>

            <View className="border-t pt-4 space-y-4">
              <Textarea
                value={report}
                onChange={(e) => setReport(e.target.value)}
                placeholder={t.writeReport}
                rows={4}
              />
              <View className="text-center text-gray-500 text-sm">{t.or}</View>
              <View className="flex flex-col items-center gap-3">
                <Button
                  variant={isRecording ? "destructive" : "outline"}
                  size="lg"
                  onPress={toggleRecording}
                  className={`rounded-full w-16 h-16 flex items-center justify-center ${isRecording ? 'animate-pulse' : ''}`}
                >
                  {isRecording ? <StopCircle className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                </Button>
                <Text className="text-sm font-mono">
                  {isRecording ? formatDuration(recordingDuration) : (audioBlob ? t.voiceMessage : t.recordVoice)}
                </Text>
              </View>
            </View>
            <View className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onPress={() => setShowReportDialog(false)}
                className="flex-1"
              >
                {t.cancel}
              </Button>
              <Button
                onPress={handleSendReport}
                disabled={(!report.trim() && !audioBlob) || clientRating === 0}
                className="flex-1 bg-[#FB5E7A] hover:bg-[#e5536e]"
              >
                {t.submit}
              </Button>
            </View>
          </View>
        </DialogContent>
      </Dialog>
    </View>
  );
}