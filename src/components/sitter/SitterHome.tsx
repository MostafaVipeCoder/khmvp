import { TrendingUp, Calendar, Star, Clock, Bell, Loader2, Settings, ShieldCheck, Eye, Wallet } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import AvailabilityManagement from './AvailabilityManagement';
import ServicesManagement from './ServicesManagement';
import SitterVerification from './SitterVerification';
import BookingRequests from './BookingRequests';
import RequestDetails from './RequestDetails';
import type { Language } from '../../App';
import { useAuthStore } from '../../stores/useAuthStore';
import { bookingService, type Booking } from '../../services/booking';
import { sitterService } from '../../services/sitter';
import { notificationService, type Notification } from '../../services/notification';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import type { BookingRequest } from './RequestDetails';

const mapBookingToRequest = (booking: Booking): BookingRequest => ({
  id: booking.id,
  clientName: booking.client?.full_name || '---',
  clientImage: booking.client?.avatar_url || '',
  date: booking.date,
  time: booking.start_time,
  duration: booking.duration_hours,
  location: booking.location,
  type: booking.booking_type,
  price: booking.total_price,
  children: (booking as any).children_count || 1,
  status: booking.status,
  notes: (booking as any).notes
});

interface SitterHomeProps {
  language: Language;
}

const translations = {
  ar: {
    dashboard: 'لوحة التحكم الخاصة بك اليوم',
    totalEarnings: 'إجمالي الأرباح',
    completedJobs: 'الجلسات المكتملة',
    totalHours: 'إجمالي الساعات',
    rating: 'التقييم العام',
    newRequests: 'طلبات جديدة',
    noRequests: 'لا توجد طلبات جديدة حالياً',
    viewDetails: 'عرض التفاصيل',
    manageSchedule: 'إدارة الجدول',
    manageServices: 'إدارة الخدمات',
    verificationStatus: 'حالة التوثيق',
    egp: 'جنيه',
    hours: 'ساعة',
    children: 'أطفال',
    atHome: 'في المنزل',
    outside: 'خارج المنزل',
  },
  en: {
    dashboard: 'Your sitter dashboard at a glance',
    totalEarnings: 'Total Earnings',
    completedJobs: 'Completed Jobs',
    totalHours: 'Total Hours',
    rating: 'Overall Rating',
    newRequests: 'New Requests',
    noRequests: 'No new requests at the moment',
    viewDetails: 'View Details',
    manageSchedule: 'Manage Schedule',
    manageServices: 'Manage Services',
    verificationStatus: 'Verification Status',
    egp: 'EGP',
    hours: 'hrs',
    children: 'children',
    atHome: 'At Home',
    outside: 'Outside',
  }
};

export default function SitterHome({ language }: SitterHomeProps) {
  const t = translations[language];
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    completedJobs: 0,
    totalHours: 0,
    rating: 0,
    ratingCount: 0
  });

  const [pendingRequests, setPendingRequests] = useState<Booking[]>([]);
  const [showAvailabilityManagement, setShowAvailabilityManagement] = useState(false);
  const [showServicesManagement, setShowServicesManagement] = useState(false);
  const [showSitterVerification, setShowSitterVerification] = useState(false);
  const [showBookingRequests, setShowBookingRequests] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Booking | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Withdrawal State
  const [showWithdrawalDialog, setShowWithdrawalDialog] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [nationalIdConfirm, setNationalIdConfirm] = useState('');

  const handleWithdrawalSubmit = () => {
    if (!withdrawalAmount || !nationalIdConfirm) {
      toast.error(language === 'ar' ? 'يرجى ملء جميع الحقول' : 'Please fill all fields');
      return;
    }
    // Mock API call
    toast.success(language === 'ar' ? 'تم استلام طلب السحب بنجاح' : 'Withdrawal request received successfully');
    setShowWithdrawalDialog(false);
    setWithdrawalAmount('');
    setNationalIdConfirm('');
  };

  const loadProfile = async () => {
    try {
      if (!user?.id) return;
      const profileData = await sitterService.getProfile(user.id);
      setProfile(profileData);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      if (!user?.id) return;
      const data = await notificationService.getRecentNotifications(user.id);
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadData();
      loadProfile();
      loadNotifications();

      // Subscribe to realtime notifications
      const notificationChannel = supabase
        .channel('sitter-notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            const newNotification = payload.new as Notification;
            setNotifications(prev => [newNotification, ...prev]);
          }
        )
        .subscribe();

      // Subscribe to realtime bookings
      const bookingChannel = supabase
        .channel('sitter-bookings')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'bookings',
            filter: `sitter_id=eq.${user.id}`
          },
          () => {
            loadData();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(notificationChannel);
        supabase.removeChannel(bookingChannel);
      };
    }
  }, [user?.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      setHasError(false);
      if (!user?.id) return;

      const [bookings, statsData] = await Promise.all([
        bookingService.getSitterBookings(user.id),
        sitterService.getStats(user.id)
      ]);

      setStats({
        totalEarnings: Number(statsData.total_earnings || 0),
        completedJobs: Number(statsData.completed_jobs || 0),
        totalHours: Number(statsData.total_hours || 0),
        rating: Number(statsData.average_rating || 0),
        ratingCount: Number(statsData.review_count || 0)
      });

      setPendingRequests(bookings.filter((b: any) => b.status === 'pending'));

    } catch (error) {
      console.error('Error loading sitter home data:', error);
      setHasError(true);
      toast.error(language === 'ar' ? 'حدث خطأ في تحميل البيانات' : 'Error loading dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (request: Booking) => {
    try {
      await bookingService.updateStatus(request.id, 'waiting_payment');

      // Send notification to client (non-blocking)
      notificationService.createNotification({
        user_id: request.client_id,
        type: 'booking_accepted',
        title: language === 'ar' ? 'تم قبول طلبك' : 'Booking Accepted',
        message: language === 'ar'
          ? `تم قبول طلبك من أختك ${profile?.full_name || 'الخالة'}. يرجى إتمام عملية الدفع.`
          : `Your booking has been accepted by ${profile?.full_name || 'the sitter'}. Please complete the payment.`,
        data: { booking_id: request.id }
      }).catch(err => console.error('Notification failed to send:', err));

      toast.success(language === 'ar' ? 'تم قبول الطلب وبانتظار الدفع' : 'Request accepted, waiting for payment');
      loadData();
    } catch (error) {
      console.error('Error accepting booking:', error);
      toast.error(language === 'ar' ? 'حدث خطأ' : 'Error updating status');
    }
  };

  const handleDecline = async (request: Booking) => {
    try {
      await bookingService.updateStatus(request.id, 'cancelled');

      // Send notification to client (non-blocking)
      notificationService.createNotification({
        user_id: request.client_id,
        type: 'booking_declined',
        title: language === 'ar' ? 'تم رفض الطلب' : 'Booking Declined',
        message: language === 'ar'
          ? `نعتذر، تم اعتذار أختك ${profile?.full_name || 'الخالة'} عن قبول الطلب.`
          : `Sorry, ${profile?.full_name || 'the sitter'} has declined your booking request.`,
        data: { booking_id: request.id }
      }).catch(err => console.error('Notification failed to send:', err));

      toast.success(language === 'ar' ? 'تم رفض الطلب' : 'Request declined');
      loadData();
    } catch (error) {
      console.error('Error declining booking:', error);
      toast.error(language === 'ar' ? 'حدث خطأ' : 'Error updating status');
    }
  };

  if (showAvailabilityManagement) {
    return <AvailabilityManagement language={language} onBack={() => setShowAvailabilityManagement(false)} />;
  }

  if (showServicesManagement) {
    return <ServicesManagement language={language} onBack={() => setShowServicesManagement(false)} />;
  }

  if (showSitterVerification) {
    return <SitterVerification language={language} onBack={() => setShowSitterVerification(false)} />;
  }

  if (showBookingRequests) {
    return <BookingRequests language={language} onBack={() => setShowBookingRequests(false)} isVerified={true} />;
  }

  // Removed early return to use Dialog instead

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <div className="max-w-4xl mx-auto px-4 pt-0 pb-8">
        {/* Sticky Header */}
        <div className="sticky top-0 z-50 bg-gray-50 dark:bg-gray-900 pt-6 pb-4 -mx-4 px-4 mb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src={user?.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400'}
                alt={user?.user_metadata?.full_name}
                className="w-12 h-12 rounded-full border-2 border-[#FFD1DA] object-cover"
              />
              <div>
                <h1 className="text-xl font-bold text-[#FB5E7A]">
                  {language === 'ar' ? 'مرحباً، ' : 'Welcome, '}
                  {profile?.full_name?.split(' ')[0] || 'Khala'}
                </h1>
                <p className="text-xs text-gray-500">{t.dashboard}</p>
              </div>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full relative w-10 h-10">
                  <Bell className="w-5 h-5" />
                  {notifications.filter(n => !n.is_read).length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#FB5E7A] text-white text-[10px] rounded-full flex items-center justify-center border-2 border-white">
                      {notifications.filter(n => !n.is_read).length}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align={language === 'ar' ? 'start' : 'end'}>
                <div className="p-4 border-b">
                  <h3 className="font-semibold text-[#FB5E7A]">
                    {language === 'ar' ? 'الإشعارات' : 'Notifications'}
                  </h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <Bell className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm">{language === 'ar' ? 'لا توجد إشعارات' : 'No notifications'}</p>
                    </div>
                  ) : (
                    notifications.slice(0, 5).map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${!notification.is_read ? 'bg-[#FFD1DA]/10' : ''}`}
                        onClick={async () => {
                          // Mark as read
                          if (!notification.is_read) {
                            await notificationService.markAsRead(notification.id);
                            setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n));
                          }

                          // Navigate to booking if it's a booking notification
                          if (notification.type === 'new_booking' && notification.data?.booking_id) {
                            try {
                              const booking = await bookingService.getBooking(notification.data.booking_id);
                              if (booking) {
                                setSelectedRequest(booking);
                                // Close popover if needed - but here it's fine
                              }
                            } catch (error) {
                              console.error('Error loading booking:', error);
                              // Fallback to searching in pendingRequests if already loaded
                              const localBooking = pendingRequests.find(b => b.id === notification.data.booking_id);
                              if (localBooking) {
                                setSelectedRequest(localBooking);
                              } else {
                                toast.error(language === 'ar' ? 'حدث خطأ في تحميل الطلب' : 'Error loading request');
                              }
                            }
                          }
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <Bell className="w-4 h-4 text-[#FB5E7A] mt-1" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">
                              {notification.type === 'new_booking' && language === 'ar'
                                ? 'طلب حجز جديد'
                                : notification.title}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              {notification.type === 'new_booking' && language === 'ar'
                                ? `لديك طلب جديد من أختك ${notification.data?.client_name || ''}`
                                : notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(notification.created_at).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
                            </p>
                          </div>
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-[#FB5E7A] rounded-full mt-2"></div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Loader2 className="w-12 h-12 animate-spin mb-4" />
            <p>{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
          </div>
        ) : hasError ? (
          <div className="text-center py-20">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {language === 'ar' ? 'فشل تحميل البيانات' : 'Failed to load data'}
            </h3>
            <Button onClick={loadData} variant="outline" className="mt-4">
              {language === 'ar' ? 'إعادة المحاولة' : 'Retry'}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="h-auto py-6 flex flex-col gap-2 border-dashed border-2 hover:border-[#FB5E7A] hover:bg-[#FB5E7A]/5"
                onClick={() => setShowAvailabilityManagement(true)}
              >
                <Calendar className="w-6 h-6 text-[#FB5E7A]" />
                <p className="text-sm font-bold">{t.manageSchedule}</p>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-6 flex flex-col gap-2 border-dashed border-2 hover:border-[#FB5E7A] hover:bg-[#FB5E7A]/5"
                onClick={() => setShowServicesManagement(true)}
              >
                <Settings className="w-6 h-6 text-[#FB5E7A]" />
                <p className="text-sm font-bold">{t.manageServices}</p>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-6 flex flex-col gap-2 border-dashed border-2 hover:border-[#FB5E7A] hover:bg-[#FB5E7A]/5 md:col-span-1 col-span-2"
                onClick={() => setShowSitterVerification(true)}
              >
                <ShieldCheck className="w-6 h-6 text-[#FB5E7A]" />
                <p className="text-sm font-bold">{t.verificationStatus}</p>
              </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4 relative overflow-hidden group">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <div className="p-2 w-fit rounded-lg bg-green-100 text-green-600"><TrendingUp className="w-5 h-5" /></div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-100"
                      onClick={() => setShowWithdrawalDialog(true)}
                      title={language === 'ar' ? 'سحب الأموال' : 'Withdraw Funds'}
                    >
                      <Wallet className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500">{t.totalEarnings}</p>
                  <h3 className="text-xl font-bold text-[#FB5E7A]">{stats.totalEarnings} {t.egp}</h3>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex flex-col gap-2">
                  <div className="p-2 w-fit rounded-lg bg-blue-100 text-blue-600"><Calendar className="w-5 h-5" /></div>
                  <p className="text-sm text-gray-500">{t.completedJobs}</p>
                  <h3 className="text-xl font-bold text-[#FB5E7A]">{stats.completedJobs}</h3>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex flex-col gap-2">
                  <div className="p-2 w-fit rounded-lg bg-purple-100 text-purple-600"><Clock className="w-5 h-5" /></div>
                  <p className="text-sm text-gray-500">{t.totalHours}</p>
                  <h3 className="text-xl font-bold text-[#FB5E7A]">{stats.totalHours}</h3>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex flex-col gap-2">
                  <div className="p-2 w-fit rounded-lg bg-yellow-100 text-yellow-600"><Star className="w-5 h-5" /></div>
                  <p className="text-sm text-gray-500">{t.rating}</p>
                  <h3 className="text-xl font-bold text-[#FB5E7A]">{stats.rating}</h3>
                </div>
              </Card>
            </div>

            {/* Withdrawal Dialog */}
            <Dialog open={showWithdrawalDialog} onOpenChange={setShowWithdrawalDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{language === 'ar' ? 'طلب سحب رصيد' : 'Withdrawal Request'}</DialogTitle>
                  <DialogDescription>
                    {language === 'ar' ? 'أدخل المبلغ الذي ترغب في سحبه ورقمك القومي للتأكيد.' : 'Enter the amount you want to withdraw and your national ID for confirmation.'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'المبلغ المطلوب (جنيه)' : 'Amount (EGP)'}</Label>
                    <Input
                      type="number"
                      value={withdrawalAmount}
                      onChange={(e) => setWithdrawalAmount(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'الرقم القومي (للتأكيد)' : 'National ID (Confirmation)'}</Label>
                    <Input
                      value={nationalIdConfirm}
                      onChange={(e) => setNationalIdConfirm(e.target.value)}
                      placeholder={language === 'ar' ? 'أدخل الرقم القومي' : 'Enter National ID'}
                    />
                  </div>
                  <div className="pt-2">
                    <Button
                      className="w-full bg-[#FB5E7A] hover:bg-[#e5536e]"
                      onClick={handleWithdrawalSubmit}
                    >
                      {language === 'ar' ? 'إرسال الطلب' : 'Submit Request'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* New Requests Section */}
            <div>
              <h3 className="mb-4 font-bold flex items-center gap-2">
                <Bell className="w-5 h-5 text-[#FB5E7A]" />
                {t.newRequests}
              </h3>
              {pendingRequests.length === 0 ? (
                <Card className="p-8 text-center text-gray-500">{t.noRequests}</Card>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map((request) => (
                    <Card key={request.id} className="p-4">
                      <div className="flex gap-4">
                        <img src={request.client?.avatar_url || ''} className="w-16 h-16 rounded-full object-cover" />
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-bold">{request.client?.full_name}</h4>
                              <Badge variant="outline">1 {t.children}</Badge>
                            </div>
                            <Badge className="bg-[#FB5E7A]/10 text-[#FB5E7A] border-none">
                              {request.booking_type === 'home' ? t.atHome : t.outside}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-y-1 text-sm text-gray-500 mb-4">
                            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {request.date}</span>
                            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {request.start_time}</span>
                          </div>
                          <Button onClick={() => setSelectedRequest(request)} className="w-full bg-[#FB5E7A]">
                            <Eye className="w-4 h-4 mr-2" /> {t.viewDetails}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Booking Details Dialog */}
      {selectedRequest && (
        <Dialog open={!!selectedRequest} onOpenChange={(open: boolean) => !open && setSelectedRequest(null)}>
          <DialogContent className="max-w-4xl p-0 max-h-[90vh] overflow-y-auto">
            <RequestDetails
              request={mapBookingToRequest(selectedRequest as Booking)}
              language={language}
              onBack={() => setSelectedRequest(null)}
              onAccept={(selectedRequest as Booking).status === 'pending' ? async () => {
                await handleAccept(selectedRequest as Booking);
                setSelectedRequest(null);
              } : undefined}
              onDecline={(selectedRequest as Booking).status === 'pending' ? async () => {
                await handleDecline(selectedRequest as Booking);
                setSelectedRequest(null);
              } : undefined}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
