import { View, Text, Image } from '../../tw';
import { CheckCircle, MapPin, MessageCircle, Shield, Bell, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import type { Language } from '../../App';
import { locationService } from '../../services/location';
import { useAuthStore } from '../../stores/useAuthStore';

interface SitterSessionPageProps {
    language: Language;
    booking: {
        id: string;
        clientName: string;
        clientImage: string;
        date: string;
        time: string;
        duration: number;
        status: 'upcoming' | 'ongoing';
        location: string;
    };
    onBack: () => void;
    onChat?: () => void;
}

const translations = {
    ar: {
        sessionManagement: 'إدارة الجلسة',
        client: 'العميل',
        status: 'الحالة',
        upcoming: 'قادمة',
        ongoing: 'جارية الآن',
        startService: 'بدء الخدمة',
        qrInstructions: 'اطلبي من العميل مسح الكود لبدء احتساب الوقت',
        sessionTimeline: 'جدول الجلسة',
        hour: 'ساعة',
        minute: 'دقيقة',
        safetyCheck: 'الاطمئنان الدوري',
        noRequests: 'لا توجد طلبات اطمئنان حالياً',
        incomingRequest: 'طلب اطمئنان جديد من العميل!',
        confirmSafety: 'تأكيد أن الطفل بخير',
        simulateRequest: 'محاكاة طلب استلام (تجريبي)',
        safetyConfirmed: 'تم تأكيد الاطمئنان بنجاح',
        contactClient: 'مراسلة العميل'
    },
    en: {
        sessionManagement: 'Session Management',
        client: 'Client',
        status: 'Status',
        upcoming: 'Upcoming',
        ongoing: 'Ongoing',
        startService: 'Start Service',
        qrInstructions: 'Ask client to scan code to start timer',
        sessionTimeline: 'Session Timeline',
        hour: 'hour',
        minute: 'min',
        safetyCheck: 'Safety Check',
        noRequests: 'No active safety check requests',
        incomingRequest: 'New Safety Check Request!',
        confirmSafety: 'Confirm Child is Safe',
        simulateRequest: 'Simulate Incoming Request (Demo)',
        safetyConfirmed: 'Safety confirmed successfully',
        contactClient: 'Contact Client'
    }
};

export default function SitterSessionPage({ language, booking: initialBooking, onBack, onChat }: SitterSessionPageProps) {
    const t = translations[language];
    const { user } = useAuthStore();
    const [booking, setBooking] = useState(initialBooking);
    const [hasIncomingCheck, setHasIncomingCheck] = useState(false);
    const [qrDataUrl, setQrDataUrl] = useState<string>('');
    const [qrLoading, setQrLoading] = useState(true);

    useEffect(() => {
        const generateQR = async () => {
            try {
                // Format: KHMVP-VERIFY:booking_id:sitter_id:client_id
                const qrContent = `KHMVP-VERIFY:${booking.id}:${user?.id}:${(booking as any).client_id || (booking as any).clientId}`;
                const url = await QRCode.toDataURL(qrContent, {
                    width: 400,
                    margin: 2,
                    color: {
                        dark: '#FB5E7A',
                        light: '#FFFFFF'
                    }
                });
                setQrDataUrl(url);
            } catch (err) {
                console.error('QR code generation failed:', err);
            } finally {
                setQrLoading(false);
            }
        };

        if (booking.status === 'upcoming') {
            generateQR();
        }
    }, [booking.id, booking.status]);

    useEffect(() => {
        const channel = supabase
            .channel(`booking-session-${booking.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'bookings',
                    filter: `id=eq.${booking.id}`
                },
                (payload) => {
                    const updatedBooking = payload.new as any;
                    if (updatedBooking.status) {
                        setBooking((prev: any) => ({
                            ...prev,
                            status: updatedBooking.status
                        }));
                        if (updatedBooking.status === 'ongoing') {
                            toast.success(language === 'ar' ? 'بدأت الجلسة!' : 'Session Started!');
                        }
                    }
                }
            )
            .subscribe();

        // Also listen for scan mismatch notifications
        const notificationChannel = supabase
            .channel(`sitter-notifications-${user?.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${user?.id}`
                },
                (payload) => {
                    const newNotification = payload.new as any;
                    if (newNotification.type === 'scan_mismatch' && (newNotification.data?.booking_id === booking.id || !newNotification.data?.booking_id)) {
                        toast.error(language === 'ar' ? 'هذه ليست العميلة المطلوبة!' : 'This is not the correct client!', {
                            duration: 5000,
                            style: { backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca' }
                        });
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
            supabase.removeChannel(notificationChannel);
        };
    }, [booking.id, language, user?.id]);

    useEffect(() => {
        let watchId: number | null = null;

        if (booking.status === 'ongoing' && user?.id) {
            if ('geolocation' in navigator) {
                watchId = navigator.geolocation.watchPosition(
                    async (position) => {
                        try {
                            await locationService.updateLocation({
                                sitter_id: user.id,
                                booking_id: booking.id,
                                latitude: position.coords.latitude,
                                longitude: position.coords.longitude,
                                accuracy: position.coords.accuracy
                            });
                        } catch (error) {
                            console.error('Error updating location:', error);
                        }
                    },
                    (error) => {
                        console.error('Geolocation error:', error);
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 30000
                    }
                );
            }
        }

        return () => {
            if (watchId !== null) {
                navigator.geolocation.clearWatch(watchId);
            }
        };
    }, [booking.status, booking.id, user?.id]);

    const progress = booking.status === 'ongoing' ? 50 : 0;
    const timePoints = Array.from({ length: booking.duration + 1 }, (_, i) => i);

    const handleConfirmSafety = () => {
        alert(t.safetyConfirmed);
        setHasIncomingCheck(false);
    };

    return (
        <View className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
            {/* Header */}
            <View className="p-4 flex items-center gap-4">
                <Button variant="ghost" size="icon" onPress={onBack} className="rounded-full">
                    {language === 'ar' ? <ChevronRight className="w-6 h-6" /> : <ChevronLeft className="w-6 h-6" />}
                </Button>
                <Text className="text-xl font-bold">{t.sessionManagement}</Text>
            </View>

            <View className="p-4 max-w-md mx-auto space-y-6">
                <Card className="p-4">
                    <View className="flex justify-between items-start">
                        <View className="flex gap-4">
                            <Image
                                src={booking.clientImage}
                                alt={booking.clientName}
                                className="w-14 h-14 rounded-full object-cover"
                            />
                            <View>
                                <Text className="font-bold">{booking.clientName}</Text>
                                <View className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                                    <MapPin className="w-3 h-3" />
                                    {booking.location}
                                </View>
                            </View>
                        </View>
                        <Button
                            size="icon"
                            variant="outline"
                            className="rounded-full"
                            onPress={onChat}
                        >
                            <MessageCircle className="w-4 h-4" />
                        </Button>
                    </View>
                </Card>

                {booking.status === 'upcoming' ? (
                    <Card className="p-6 flex flex-col items-center text-center space-y-4">
                        <Text className="font-bold text-lg">{t.startService}</Text>
                        <Text className="text-sm text-gray-500">{t.qrInstructions}</Text>
                        <View className="border-4 border-[#FB5E7A] p-2 rounded-xl bg-white inline-block relative min-w-[200px] min-h-[200px]">
                            {qrLoading ? (
                                <View className="absolute inset-0 flex items-center justify-center">
                                    <Loader2 className="w-8 h-8 animate-spin text-[#FB5E7A]" />
                                </View>
                            ) : qrDataUrl ? (
                                <Image
                                    src={qrDataUrl}
                                    alt="QR Code"
                                    className="w-48 h-48"
                                />
                            ) : null}
                        </View>
                    </Card>
                ) : (
                    <View className="space-y-6">
                        <Card className={`p-4 border-2 transition-colors ${hasIncomingCheck ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-transparent'}`}>
                            <View className="flex justify-between items-center mb-4">
                                <Text className="font-bold flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-green-600" />
                                    {t.safetyCheck}
                                </Text>
                                {hasIncomingCheck && (
                                    <Text className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-red-400 opacity-75 right-8"></Text>
                                )}
                            </View>

                            {hasIncomingCheck ? (
                                <View className="space-y-4 text-center">
                                    <View className="flex flex-col items-center text-red-600 gap-2 animate-pulse">
                                        <Bell className="w-8 h-8" />
                                        <Text className="font-bold">{t.incomingRequest}</Text>
                                    </View>
                                    <Button
                                        className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg"
                                        onPress={handleConfirmSafety}
                                    >
                                        <CheckCircle className="w-5 h-5 mr-2" />
                                        {t.confirmSafety}
                                    </Button>
                                </View>
                            ) : (
                                <View className="text-center space-y-4">
                                    <Text className="text-gray-500 text-sm py-2">{t.noRequests}</Text>
                                    <View className="pt-8 border-t border-dashed mt-4">
                                        <Text className="text-xs text-gray-400 mb-2 text-center">
                                            {language === 'ar' ? '(أدوات العرض التجريبي)' : '(Demo Tools)'}
                                        </Text>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full border-dashed text-gray-500 hover:text-gray-700"
                                            onPress={() => setHasIncomingCheck(true)}
                                        >
                                            <Bell className="w-3 h-3 mr-2" />
                                            {t.simulateRequest}
                                        </Button>
                                    </View>
                                </View>
                            )}
                        </Card>

                        <Card className="p-6">
                            <Text className="font-bold mb-4">{t.sessionTimeline}</Text>
                            <View className="relative pl-4 pr-4">
                                <View className="absolute left-2 top-2 bottom-2 w-0.5 bg-gray-200 rtl:right-2 rtl:left-auto"></View>
                                <View className="space-y-6">
                                    {timePoints.map((_point, index) => {
                                        const isCompleted = (index / booking.duration) * 100 <= progress;
                                        return (
                                            <View key={index} className="flex items-center gap-4 relative">
                                                <View className={`
                                                    w-4 h-4 rounded-full z-10 
                                                    ${isCompleted ? 'bg-[#FB5E7A]' : 'bg-gray-300'}
                                                `}></View>
                                                <Text className={isCompleted ? 'text-black dark:text-white font-medium' : 'text-gray-400'}>
                                                    {index === 0 ? 'Start' : `${index} ${t.hour}`}
                                                </Text>
                                            </View>
                                        );
                                    })}
                                </View>
                            </View>
                        </Card>
                    </View>
                )}
            </View>
        </View>
    );
}