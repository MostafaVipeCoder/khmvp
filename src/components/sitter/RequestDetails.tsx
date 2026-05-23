import { View, Text, Image } from '../../tw';
import { Calendar, Clock, MapPin, User, ArrowLeft, ArrowRight, Check, X, CreditCard } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import type { Language } from '../../App';
import type { ReactNode } from 'react';

export interface BookingRequest {
  id: string; // Changed from number to string for UUID
  clientName: string;
  clientImage: string;
  date: string;
  time: string;
  duration: number;
  location: string;
  type: 'home' | 'outside';
  price: number;
  children: number;
  notes?: string;
  status?: string;
}

interface RequestDetailsProps {
  language: Language;
  request: BookingRequest;
  onBack: () => void;
  onAccept?: () => void;
  onDecline?: () => void;
  customActions?: ReactNode;
}

const translations = {
  ar: {
    requestDetails: 'تفاصيل الطلب',
    clientInfo: 'بيانات العميل',
    bookingInfo: 'تفاصيل الحجز',
    date: 'التاريخ',
    time: 'الوقت',
    duration: 'المدة',
    location: 'الموقع',
    price: 'السعر',
    type: 'النوع',
    children: 'عدد الأطفال',
    notes: 'ملاحظات',
    accept: 'قبول الطلب',
    decline: 'رفض الطلب',
    back: 'رجوع',
    egp: 'جنيه',
    hours: 'ساعات',
    atHome: 'في المنزل',
    outside: 'خارج المنزل',
    child: 'طفل',
    status: 'الحالة',
    upcoming: 'مؤكد (مدفوع)',
    ongoing: 'جاري',
    completed: 'مكتمل',
    pending: 'قيد الانتظار',
    waiting_payment: 'بانتظار الدفع',
    waitingPaymentDesc: 'لقد قمتِ بقبول هذا الطلب. الحجز معلق حتى تقوم العميلة بإتمام عملية الدفع.',
    paymentConfirmed: 'تم تأكيد الدفع'
  },
  en: {
    requestDetails: 'Request Details',
    clientInfo: 'Client Info',
    bookingInfo: 'Booking Info',
    date: 'Date',
    time: 'Time',
    duration: 'Duration',
    location: 'Location',
    price: 'Price',
    type: 'Type',
    children: 'Number of Children',
    notes: 'Notes',
    accept: 'Accept Request',
    decline: 'Decline Request',
    back: 'Back',
    egp: 'EGP',
    hours: 'hours',
    atHome: 'At Home',
    outside: 'Outside',
    child: 'child',
    status: 'Status',
    upcoming: 'Confirmed (Paid)',
    ongoing: 'Ongoing',
    completed: 'Completed',
    pending: 'Pending',
    waiting_payment: 'Waiting for Payment',
    waitingPaymentDesc: 'You have accepted this request. The booking is pending until the client completes the payment.',
    paymentConfirmed: 'Payment Confirmed'
  }
};

export default function RequestDetails({ language, request, onBack, onAccept, onDecline, customActions }: RequestDetailsProps) {
  const t = translations[language];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200">{t.pending}</Badge>;
      case 'waiting_payment':
        return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200">{t.waiting_payment}</Badge>;
      case 'upcoming':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">{t.upcoming}</Badge>;
      case 'ongoing':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-200">{t.ongoing}</Badge>;
      case 'completed':
        return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-200">{t.completed}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <View className="max-w-4xl mx-auto px-4 pb-8 pt-4">
      <View className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onPress={onBack} className="text-[#FB5E7A]">
          {language === 'ar' ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
        </Button>
        <Text className="text-xl font-bold text-[#FB5E7A]">{t.requestDetails}</Text>
      </View>

      <View className="grid gap-6">
        {/* Status Banner for Waiting Payment */}
        {request.status === 'waiting_payment' && (
          <View className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-3">
            <Clock className="w-5 h-5 text-orange-500 mt-0.5" />
            <View>
              <Text className="font-semibold text-orange-700 mb-1">{t.waiting_payment}</Text>
              <Text className="text-sm text-orange-600">{t.waitingPaymentDesc}</Text>
            </View>
          </View>
        )}

        {/* Status Banner for Upcoming (Paid) */}
        {request.status === 'upcoming' && (
          <View className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
            <CreditCard className="w-5 h-5 text-green-600 mt-0.5" />
            <View>
              <Text className="font-semibold text-green-700 mb-1">{t.paymentConfirmed}</Text>
              <Text className="text-sm text-green-600">
                {language === 'ar'
                  ? 'قامت العميلة بالدفع. الحجز مؤكد الآن.'
                  : 'Client has paid. Booking is now confirmed.'}
              </Text>
            </View>
          </View>
        )}

        {/* Client Info Card */}
        <Card className="p-6">
          <Text className="text-lg font-semibold mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-[#FB5E7A]" />
            {t.clientInfo}
          </Text>
          <View className="flex items-center gap-4">
            <Image
              src={request.clientImage}
              alt={request.clientName}
              className="w-20 h-20 rounded-full object-cover"
            />
            <View>
              <Text className="text-lg font-medium">{request.clientName}</Text>
              <Text className="text-gray-500 text-sm flex items-center gap-1 mt-1">
                <MapPin className="w-4 h-4" />
                {request.location}
              </Text>
            </View>
          </View>
        </Card>

        {/* Booking Info Card */}
        <Card className="p-6">
          <Text className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#FB5E7A]" />
            {t.bookingInfo}
          </Text>

          <View className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <View className="space-y-4">
              <View className="flex justify-between border-b pb-2">
                <Text className="text-gray-600 dark:text-gray-400">{t.date}</Text>
                <Text className="font-medium">{request.date}</Text>
              </View>
              <View className="flex justify-between border-b pb-2">
                <Text className="text-gray-600 dark:text-gray-400">{t.time}</Text>
                <Text className="font-medium">{request.time}</Text>
              </View>
              <View className="flex justify-between border-b pb-2">
                <Text className="text-gray-600 dark:text-gray-400">{t.duration}</Text>
                <Text className="font-medium">{request.duration} {t.hours}</Text>
              </View>
              <View className="flex justify-between border-b pb-2">
                <Text className="text-gray-600 dark:text-gray-400">{t.price}</Text>
                <Text className="font-medium text-[#FB5E7A]">{request.price} {t.egp}</Text>
              </View>
            </View>

            <View className="space-y-4">
              <View className="flex justify-between border-b pb-2">
                <Text className="text-gray-600 dark:text-gray-400">{t.type}</Text>
                <Badge className={request.type === 'home' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}>
                  {request.type === 'home' ? t.atHome : t.outside}
                </Badge>
              </View>

              {request.status && (
                <View className="flex justify-between border-b pb-2">
                  <Text className="text-gray-600 dark:text-gray-400">{t.status}</Text>
                  {getStatusBadge(request.status)}
                </View>
              )}

              <View className="flex justify-between border-b pb-2">
                <Text className="text-gray-600 dark:text-gray-400">{t.children}</Text>
                <Text className="font-medium">{request.children} {t.child}</Text>
              </View>
              <View className="flex flex-col gap-2 pt-1">
                <Text className="text-gray-600 dark:text-gray-400">{t.notes}</Text>
                <Text className="text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded-lg min-h-[60px]">
                  {request.notes || (language === 'ar' ? 'لا توجد ملاحظات' : 'No additional notes')}
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Actions */}
        {customActions ? (
          <View className="pt-4">
            {customActions}
          </View>
        ) : (
          onAccept && onDecline && (
            <View className="flex gap-4 pt-4">
              <Button
                onPress={onDecline}
                variant="outline"
                className="flex-1 h-12 border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10"
              >
                <X className="w-5 h-5 mr-2" />
                {t.decline}
              </Button>
              <Button
                onPress={onAccept}
                className="flex-1 h-12 bg-green-600 hover:bg-green-700 text-white"
              >
                <Check className="w-5 h-5 mr-2" />
                {t.accept}
              </Button>
            </View>
          )
        )}
      </View>
    </View>
  );
}