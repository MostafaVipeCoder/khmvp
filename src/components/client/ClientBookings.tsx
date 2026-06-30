import { useState, useRef, useEffect } from 'react';
import { Calendar, Clock, MapPin, Star, X, CreditCard, MessageCircle, QrCode, CheckCircle, Mic, StopCircle } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { bookingService } from '../../services/booking';
import { reviewService } from '../../services/review';
import { useAuthStore } from '../../stores/useAuthStore';
import PaymentPage from './PaymentPage';
import ChatPage from './ChatPage';
import { toast } from 'sonner';
import { useTranslation } from '../../hooks/useTranslation';
import { supabase } from '../../lib/supabase';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { qrService } from '../../services/qr';

interface ClientBookingsProps {
}

interface Booking {
  id: string; // Updated to string for UUID
  sitterId: string;
  sitterName: string;
  sitterImage: string;
  date: string;
  time: string;
  duration: number;
  location: string;
  type: 'home' | 'outside';
  status: 'pending' | 'waiting_payment' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  price: number;
  rating?: number;
}

export default function ClientBookings({ }: ClientBookingsProps) {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const bookingsT = t.client.bookings;

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showPaymentPage, setShowPaymentPage] = useState(false);
  const [paymentBooking, setPaymentBooking] = useState<Booking | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [chatBooking, setChatBooking] = useState<Booking | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [isScannerReady, setIsScannerReady] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');

  // QR Scanner Effect
  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;

    if (showScanner && isScannerReady && selectedBooking && user) {
      console.log('Initializing QR scanner...');
      const timer = setTimeout(() => {
        try {
          const readerElement = document.getElementById("client-reader");
          if (!readerElement) {
            console.error('Reader element not found!');
            toast.error('عذراً، فشل تحميل الكاميرا');
            return;
          }

          scanner = new Html5QrcodeScanner(
            "client-reader",
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
              aspectRatio: 1.0
            },
            false
          );

          scanner.render(async (decodedText: string) => {
            console.log('Scanned:', decodedText);
            try {
              const verificationResult = await qrService.verifyQRData(
                decodedText,
                user.id,
                'client'
              );

              if (!verificationResult.success) {
                toast.error(verificationResult.error || 'فشل التحقق');
                return;
              }

              const verifiedData = verificationResult.data!;
              
              if (verifiedData.bookingId !== selectedBooking.id) {
                toast.error('هذا ليس الحجز الصحيح');
                return;
              }

              if (scanner) scanner.clear();
              await handleScanSuccess(verifiedData.sessionStartTime, verifiedData.sessionEndTime);
            } catch (error) {
              console.error('QR verification failed:', error);
              toast.error('حدث خطأ أثناء المسح');
            }
          }, (errorMessage) => {
            // Ignore non-critical errors like "no QR found"
            console.debug('QR scan error:', errorMessage);
          });
        } catch (err) {
          console.error('Failed to initialize scanner:', err);
          toast.error('فشل تشغيل الكاميرا، يرجى التأكد من الإذن');
        }
      }, 300);

      return () => {
        clearTimeout(timer);
        if (scanner) {
          scanner.clear().catch(err => console.error("Failed to clear scanner", err));
        }
      };
    }
  }, [showScanner, isScannerReady, selectedBooking, user]);

  // Set scanner ready after dialog opens
  useEffect(() => {
    if (showScanner) {
      setIsScannerReady(true);
    } else {
      setIsScannerReady(false);
    }
  }, [showScanner]);

  // Voice Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadBookings();

      const bookingChannel = supabase
        .channel('client-bookings')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'bookings',
            filter: `client_id=eq.${user.id}`
          },
          () => {
            loadBookings();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(bookingChannel);
      };
    }
  }, [user?.id]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      if (!user?.id) return;

      const data = await bookingService.getClientBookings(user.id);

      if (data) {
        const formattedBookings: Booking[] = data.map((b: any) => ({
          id: b.id,
          sitterId: b.sitter_id,
          sitterName: b.sitter?.full_name || 'Sitter',
          sitterImage: b.sitter?.avatar_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
          date: b.date,
          time: b.start_time,
          duration: b.duration_hours,
          location: b.location,
          type: b.booking_type,
          status: b.status,
          price: b.total_price
        }));
        setBookings(formattedBookings);
      }
    } catch (error) {
      console.error(error);
      toast.error(bookingsT.error);
    } finally {
      setLoading(false);
    }
  };

  const toggleRecording = () => {
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

  const getStatusBadge = (status: Booking['status']) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
      waiting_payment: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
      upcoming: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      ongoing: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      completed: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      cancelled: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
    };

    return (
      <Badge className={styles[status]}>
        {status === 'waiting_payment' ? bookingsT.waitingPayment : (bookingsT[status as keyof typeof bookingsT] || status)}
      </Badge>
    );
  };

  const filterBookings = (status: 'pending' | 'waiting_payment' | 'upcoming' | 'history') => {
    return bookings.filter(booking => {
      if (status === 'history') {
        return booking.status === 'completed' || booking.status === 'cancelled';
      }
      if (status === 'upcoming') {
        return booking.status === 'upcoming' || booking.status === 'ongoing';
      }
      return booking.status === status;
    });
  };

  const handleRating = async () => {
    if (!selectedBooking || rating === 0 || !user?.id) return;

    try {
      await reviewService.createReview({
        booking_id: selectedBooking.id,
        reviewer_id: user.id,
        reviewee_id: selectedBooking.sitterId,
        rating: rating,
        comment: review
      });

      toast.success(bookingsT.thankYouReview);
      setShowRatingDialog(false);
      setRating(0);
      setReview('');
      setAudioBlob(null);
      loadBookings();
    } catch (error) {
      console.error(error);
      toast.error(bookingsT.error);
    }
  };

  const handleCancelBooking = async () => {
    if (!selectedBooking) return;
    try {
      await bookingService.updateStatus(selectedBooking.id, 'cancelled');
      toast.success(bookingsT.bookingCancelled);
      setShowCancelDialog(false);
      setSelectedBooking(null);
      loadBookings();
    } catch (error) {
      toast.error(bookingsT.error);
    }
  };

  const handlePaymentSuccess = async () => {
    if (paymentBooking) {
      try {
        await bookingService.updateStatus(paymentBooking.id, 'upcoming');
        toast.success(bookingsT.paymentSuccess);
        setShowPaymentPage(false);
        setPaymentBooking(null);
        loadBookings();
      } catch (error) {
        toast.error(bookingsT.error);
      }
    }
  };

  const handleScanSuccess = async (sessionStartTime?: string, sessionEndTime?: string) => {
    if (selectedBooking) {
      try {
        await bookingService.updateStatus(selectedBooking.id, 'ongoing', sessionStartTime, sessionEndTime);
        toast.success(bookingsT.scanSuccess);
        setShowScanner(false);
        loadBookings();
      } catch (error) {
        toast.error(bookingsT.error);
      }
    }
  };

  if (showPaymentPage && paymentBooking) {
    return (
      <PaymentPage
        bookingData={{
          sitterName: paymentBooking.sitterName,
          service: paymentBooking.type === 'home' ? bookingsT.homeCare : bookingsT.outsideCare,
          date: paymentBooking.date,
          duration: paymentBooking.duration,
          amount: paymentBooking.price
        }}
        onBack={() => {
          setShowPaymentPage(false);
          setPaymentBooking(null);
        }}
        onPaymentSuccess={handlePaymentSuccess}
      />
    );
  }

  if (showChat && chatBooking) {
    return (
      <ChatPage
        onBack={() => setShowChat(false)}
        bookingId={chatBooking.id}
        recipientId={chatBooking.sitterId}
        recipientName={chatBooking.sitterName}
        recipientImage={chatBooking.sitterImage}
      />
    );
  }

  const renderBookingCard = (booking: Booking) => (
    <Card key={booking.id} className="p-4">
      <div className="flex gap-4">
        <img
          src={booking.sitterImage}
          alt={booking.sitterName}
          className="w-16 h-16 rounded-full object-cover"
        />
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="mb-1">{bookingsT.khalaLabel}{booking.sitterName}</h3>
              {getStatusBadge(booking.status)}
            </div>
          </div>

          <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400 mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{booking.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{booking.time} ({booking.duration} {bookingsT.hours})</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{booking.location}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Badge variant="outline">
                {booking.type === 'home' ? bookingsT.atHome : bookingsT.outside}
              </Badge>
              <div className="text-[#FB5E7A] mt-1 font-bold">
                {bookingsT.total}: {booking.price} {bookingsT.egp}
              </div>
            </div>

            <div className="flex gap-2">
              {booking.status === 'completed' && !booking.rating && (
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedBooking(booking);
                    setShowRatingDialog(true);
                  }}
                  className="bg-[#FB5E7A] hover:bg-[#e5536e]"
                >
                  <Star className="w-4 h-4 mr-1" />
                  {bookingsT.rateService}
                </Button>
              )}

              {booking.status === 'waiting_payment' && (
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    setPaymentBooking(booking);
                    setShowPaymentPage(true);
                  }}
                >
                  <CreditCard className="w-4 h-4 mr-1" />
                  {bookingsT.payNow}
                </Button>
              )}

              {booking.status === 'upcoming' && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setChatBooking(booking);
                      setShowChat(true);
                    }}
                  >
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    className="bg-[#FB5E7A] hover:bg-[#e5536e]"
                    onClick={() => {
                      setSelectedBooking(booking);
                      setShowScanner(true);
                    }}
                  >
                    <QrCode className="w-4 h-4 mr-1" />
                    {bookingsT.scanQR}
                  </Button>
                </>
              )}

              {booking.status === 'ongoing' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setChatBooking(booking);
                    setShowChat(true);
                  }}
                  className="w-full"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  {bookingsT.chat}
                </Button>
              )}

              {booking.status === 'pending' && (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600"
                  onClick={() => {
                    setSelectedBooking(booking);
                    setShowCancelDialog(true);
                  }}
                >
                  <X className="w-4 h-4 mr-1" />
                  {bookingsT.cancel}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 pb-8">
      {loading ? (
        <div className="text-center py-12 text-gray-500">{bookingsT.loading}</div>
      ) : (
        <Tabs defaultValue="pending" className="space-y-4">
          {/* Sticky Header */}
          <div className="sticky top-0 z-50 bg-gray-50 dark:bg-gray-900 pt-4 pb-4 -mx-4 px-4 mb-2 border-b border-gray-100 dark:border-gray-800">
            <h1 className="text-[#FB5E7A] mb-4 text-2xl font-bold">{bookingsT.title}</h1>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="pending">{bookingsT.pending}</TabsTrigger>
              <TabsTrigger value="waiting_payment">{bookingsT.waitingPayment}</TabsTrigger>
              <TabsTrigger value="upcoming">{bookingsT.upcoming}</TabsTrigger>
              <TabsTrigger value="history">{bookingsT.completed}</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="pending" className="space-y-4 pt-2">
            {filterBookings('pending').length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                {bookingsT.noRequests}
              </div>
            ) : (
              filterBookings('pending').map(renderBookingCard)
            )}
          </TabsContent>

          <TabsContent value="waiting_payment" className="space-y-4">
            {filterBookings('waiting_payment').length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                {bookingsT.noRequests}
              </div>
            ) : (
              filterBookings('waiting_payment').map(renderBookingCard)
            )}
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-4">
            {filterBookings('upcoming').length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                {bookingsT.noRequests}
              </div>
            ) : (
              filterBookings('upcoming').map(renderBookingCard)
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {filterBookings('history').length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                {bookingsT.noRequests}
              </div>
            ) : (
              filterBookings('history').map(renderBookingCard)
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Rating Dialog */}
      <Dialog open={showRatingDialog} onOpenChange={setShowRatingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{bookingsT.rateService}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{bookingsT.rating}</Label>
              <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 ${star <= rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                        }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="review">{bookingsT.writeReview}</Label>
              <Textarea
                id="review"
                value={review}
                onChange={(e) => setReview(e.target.value)}
                rows={4}
                placeholder={bookingsT.reviewPlaceholder}
              />
            </div>

            <div className="flex flex-col items-center gap-3 border-t pt-4">
              <Button
                variant={isRecording ? "destructive" : "outline"}
                size="lg"
                onClick={toggleRecording}
                className={`rounded-full w-16 h-16 flex items-center justify-center ${isRecording ? 'animate-pulse' : ''}`}
              >
                {isRecording ? <StopCircle className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
              </Button>
              <span className="text-sm font-mono mt-2 text-gray-600 dark:text-gray-400">
                {isRecording ? formatDuration(recordingDuration) : (audioBlob ? bookingsT.voiceMessage : bookingsT.tapToRecord)}
              </span>
            </div>

            <Button
              onClick={handleRating}
              disabled={rating === 0}
              className="w-full bg-[#FB5E7A] hover:bg-[#e5536e]"
            >
              {bookingsT.submit}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{bookingsT.cancelBooking}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-gray-600 dark:text-gray-400">{bookingsT.cancelConfirm}</p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowCancelDialog(false)}
                className="flex-1"
              >
                {bookingsT.no}
              </Button>
              <Button
                onClick={handleCancelBooking}
                className="flex-1 bg-red-500 hover:bg-red-600"
              >
                {bookingsT.yes}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Scanner Modal */}
      <Dialog open={showScanner} onOpenChange={setShowScanner}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{bookingsT.scanTitle}</DialogTitle>
            <DialogDescription>{bookingsT.scanDesc}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-6">
            <div id="client-reader" className="w-full bg-black rounded-lg overflow-hidden min-h-[300px]"></div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}