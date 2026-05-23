import { View, Text } from '../../tw';
import { ArrowRight, Bell } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { ScrollArea } from '../ui/scroll-area';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: string;
    is_read: boolean;
    created_at: string;
    booking_id?: string;
}

interface SitterHeaderProps {
    language: 'ar' | 'en';
    userName: string;
    onBack?: () => void;
    showBack?: boolean;
}

const translations = {
    ar: {
        welcome: 'أهلاً بك،',
        notifications: 'التنبيهات',
        noNotifications: 'لا توجد تنبيهات',
        markAllRead: 'تحديد الكل كمقروء',
    },
    en: {
        welcome: 'Welcome,',
        notifications: 'Notifications',
        noNotifications: 'No notifications',
        markAllRead: 'Mark all as read',
    }
};

export default function SitterHeader({ language, userName, onBack, showBack = false }: SitterHeaderProps) {
    const t = translations[language];
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        fetchNotifications();

        // Subscribe to new notifications
        const channel = supabase
            .channel('internal-notifications')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'notifications' },
                (payload) => {
                    const newNotif = payload.new as Notification;
                    setNotifications(prev => [newNotif, ...prev]);
                    setUnreadCount(prev => prev + 1);
                    toast.info(newNotif.title);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchNotifications = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(10);

        if (data) {
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.is_read).length);
        }
    };

    const markAsRead = async (id: string) => {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id);

        if (!error) {
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        }
    };

    const markAllAsRead = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', user.id)
            .eq('is_read', false);

        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
    };

    return (
        <View className="bg-white dark:bg-gray-800 p-4 shadow-sm sticky top-0 z-50">
            <View className="max-w-4xl mx-auto flex items-center justify-between">
                <View className="flex items-center gap-3">
                    {showBack && (
                        <Button variant="ghost" size="sm" onPress={onBack} className="p-0 h-8 w-8 rounded-full hover:bg-gray-100">
                            <ArrowRight className={`w-5 h-5 ${language === 'en' ? 'rotate-180' : ''}`} />
                        </Button>
                    )}
                    <View>
                        <Text className="text-gray-500 text-sm">{t.welcome}</Text>
                        <Text className="font-bold text-lg leading-tight">{userName}</Text>
                    </View>
                </View>

                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full hover:bg-gray-100">
                            <Bell className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                            {unreadCount > 0 && (
                                <Badge className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[20px] h-5 flex items-center justify-center bg-[#FB5E7A] text-white border-2 border-white dark:border-gray-800 rounded-full text-[10px]">
                                    {unreadCount}
                                </Badge>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0" align="end">
                        <View className="p-3 border-b flex items-center justify-between">
                            <Text className="font-bold">{t.notifications}</Text>
                            {unreadCount > 0 && (
                                <Button variant="ghost" size="sm" onPress={markAllAsRead} className="text-xs text-[#FB5E7A] hover:text-[#e5536e] p-0 h-auto">
                                    {t.markAllRead}
                                </Button>
                            )}
                        </View>
                        <ScrollArea className="h-[300px]">
                            {notifications.length > 0 ? (
                                <View className="divide-y">
                                    {notifications.map((notif) => (
                                        <View
                                            key={notif.id}
                                            className={`p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors ${!notif.is_read ? 'bg-[#FB5E7A]/5 border-r-2 border-[#FB5E7A]' : ''}`}
                                            onPress={() => markAsRead(notif.id)}
                                        >
                                            <Text className="font-bold text-sm mb-0.5">{notif.title}</Text>
                                            <Text className="text-xs text-gray-600 dark:text-gray-400 leading-normal">{notif.message}</Text>
                                            <Text className="text-[10px] text-gray-400 mt-1 block">
                                                {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            ) : (
                                <View className="p-8 text-center text-gray-500 text-sm">
                                    {t.noNotifications}
                                </View>
                            )}
                        </ScrollArea>
                    </PopoverContent>
                </Popover>
            </View>
        </View>
    );
}
