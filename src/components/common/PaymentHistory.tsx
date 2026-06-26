
import { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { useAuthStore } from '../../stores/useAuthStore';
import { bookingService } from '../../services/booking';

interface PaymentHistoryProps {
  onBack: () => void;
}

export default function PaymentHistory({ onBack }: PaymentHistoryProps) {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    if (user?.id) {
      loadBookings();
    }
  }, [user?.id]);

  const loadBookings = async () => {
    if (!user?.id) return;
    try {
      let data;
      if (user.userType === 'client') {
        data = await bookingService.getClientBookings(user.id);
      } else {
        data = await bookingService.getSitterBookings(user.id);
      }
      setBookings(data);
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { label: 'Pending', variant: 'secondary' as const },
      waiting_payment: { label: 'Waiting Payment', variant: 'warning' as const },
      completed: { label: 'Completed', variant: 'success' as const },
      cancelled: { label: 'Cancelled', variant: 'outline' as const },
    };
    return (
      <Badge variant={config[status as keyof typeof config]?.variant || config.pending.variant}>
        {config[status as keyof typeof config]?.label || status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            </CardHeader>
            <CardContent>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const paidBookings = bookings.filter(b => b.status !== 'cancelled');

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Payment History</h2>
        <button onClick={onBack} className="text-[#FB5E7A] hover:underline">
          Back
        </button>
      </div>

      {paidBookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <CreditCard className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300">No Payment History Yet</h3>
          <p className="text-gray-500 dark:text-gray-400">Your payment history will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {paidBookings.map((booking) => (
            <Card key={booking.id} className="overflow-hidden">
              <CardHeader className="pb-2 flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    {booking.sitter?.full_name || booking.client?.full_name}
                    {getStatusIcon(booking.status)}
                  </CardTitle>
                  <p className="text-xs text-gray-500">{new Date(booking.date).toLocaleDateString()}</p>
                </div>
                {getStatusBadge(booking.status)}
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {new Date(booking.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {booking.duration_hours} hours
                    </p>
                    <p className="text-xs text-gray-400">{booking.booking_type} • {booking.location}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-[#FB5E7A]">
                    {booking.total_price} EGP
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
