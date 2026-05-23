import { View, Text, Pressable, Image } from '../../tw';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/useAuthStore';
import { Search, Star, MapPin, Clock, Bell } from 'lucide-react';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import SitterProfile from './SitterProfile';
import { sitterService } from '../../services/sitter';
import { notificationService, type Notification } from '../../services/notification';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { useTranslation } from '../../hooks/useTranslation';
import ErrorBoundary from '../ErrorBoundary';

import { Sitter, SitterDBProfile } from '../../types/core';

interface ClientHomeProps {
  onNavigate?: (tab: 'home' | 'requests' | 'schedule' | 'profile') => void;
}


export default function ClientHome({ onNavigate }: ClientHomeProps) {
  const { user } = useAuthStore();
  const { t, language } = useTranslation();
  const homeT = t.client.homePage;
  const userName = user?.user_metadata?.full_name?.split(' ')[0] || homeT.guest;

  const [searchQuery, setSearchQuery] = useState('');
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [selectedSitter, setSelectedSitter] = useState<Sitter | null>(null);
  const [sitters, setSitters] = useState<Sitter[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    loadSitters();
    if (user?.id) {
      loadNotifications();

      const channel = supabase
        .channel('client-notifications')
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
            toast.info(newNotification.title);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user?.id]);

  const loadNotifications = async () => {
    try {
      if (!user?.id) return;
      const data = await notificationService.getRecentNotifications(user.id);
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const loadSitters = async () => {
    try {
      setLoading(true);
      setHasError(false);

      const fetchPromise = sitterService.getAllSitters();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 8000)
      );

      const data = await Promise.race([fetchPromise, timeoutPromise]) as SitterDBProfile[];

      if (data) {
        const formattedSitters: Sitter[] = data.map((profile: SitterDBProfile) => {
          const activeServices = profile.sitter_services
            ?.filter((s) => s.is_active !== false)
            .map((s) => ({
              id: s.id,
              name: s.service_type,
              description: s.description || '',
              pricePerHour: s.price,
              minHours: s.minimum_hours || 1,
              features: typeof s.features === 'string' ? JSON.parse(s.features) : (s.features || [])
            })) || [];

          return {
            id: profile.id,
            name: profile.full_name || 'Khala',
            image: profile.avatar_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
            rating: profile.average_rating ? Number(profile.average_rating) : 5.0,
            reviews: profile.review_count ? Number(profile.review_count) : 0,
            experience: profile.experience_years || 0,
            location: profile.location || homeT.notSpecified,
            available: activeServices.length > 0,
            availabilityType: profile.availability_type || 'both',
            languages: profile.sitter_languages?.map((l) => l.language) || [],
            specialties: profile.sitter_skills?.map((s) => s.skill) || [],
            services: activeServices,
            raw: profile
          };
        });
        setSitters(formattedSitters);
      }
    } catch (error) {
      console.error("Failed to load sitters", error);
      setHasError(true);
    } finally {
      setLoading(false);
    }
  };

  const filteredSitters = sitters.filter(sitter => {
    const matchesSearch = sitter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sitter.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAvailable = !showAvailableOnly || sitter.available;
    return matchesSearch && matchesAvailable;
  });

  if (selectedSitter) {
    return (
      <SitterProfile
        sitter={selectedSitter}
        onBack={() => setSelectedSitter(null)}
      />
    );
  }

  return (
    <View className="max-w-4xl mx-auto px-4 pb-8">
      {/* Sticky Header Section */}
      <View className="sticky top-0 z-50 bg-gray-50 dark:bg-gray-900 pt-4 pb-2 -mx-4 px-4 mb-4 border-b border-gray-100 dark:border-gray-800">
        {/* Header */}
        <View className="mb-6 flex items-start justify-between">
          <View>
            <Text className="text-[#FB5E7A] mb-2 font-bold text-xl">
              {homeT.welcome.replace('{name}', userName)}
            </Text>
            <Text className="text-gray-600 dark:text-gray-400 text-sm">
              {homeT.description}
            </Text>
          </View>

          {/* Notification Bell */}
          <Popover>
            <PopoverTrigger asChild>
              <Pressable className="relative w-10 h-10 rounded-full bg-[#FB5E7A]/10 flex items-center justify-center hover:bg-[#FB5E7A]/20 transition-colors">
                <Bell className="w-5 h-5 text-[#FB5E7A]" />
                {notifications.filter(n => !n.is_read).length > 0 && (
                  <Text className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center">
                    {notifications.filter(n => !n.is_read).length}
                  </Text>
                )}
              </Pressable>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align={language === 'ar' ? 'start' : 'end'}>
              <View className="p-4 border-b flex items-center justify-between">
                <Text className="font-semibold text-[#FB5E7A]">{homeT.notifications}</Text>
                {notifications.length > 0 && (
                  <Pressable
                    onPress={async () => {
                      if (user?.id) {
                        await notificationService.markAllAsRead(user.id);
                        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
                      }
                    }}
                    className="text-xs text-gray-500 hover:text-[#FB5E7A]"
                  >
                    {homeT.markAllRead}
                  </Pressable>
                )}
              </View>
              <View className="max-h-[400px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <View className="p-8 text-center text-gray-500">
                    <Bell className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <Text className="text-sm">{homeT.noNotifications}</Text>
                  </View>
                ) : (
                  notifications.map((notification) => (
                    <View
                      key={notification.id}
                      className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors ${!notification.is_read ? 'bg-[#FFD1DA]/5' : ''}`}
                      onPress={async () => {
                        if (!notification.is_read) {
                          await notificationService.markAsRead(notification.id);
                          setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n));
                        }

                        if (notification.type.startsWith('booking_') && onNavigate) {
                          onNavigate('requests');
                        }
                      }}
                    >
                      <View className="flex items-start gap-3">
                        <View className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${!notification.is_read ? 'bg-[#FB5E7A]' : 'bg-transparent'}`} />
                        <View className="flex-1 min-w-0">
                          <Text className={`text-sm ${!notification.is_read ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                            {notification.title}
                          </Text>
                          <Text className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                            {notification.message}
                          </Text>
                          <Text className="text-[10px] text-gray-400 mt-1">
                            {new Date(notification.created_at).toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))
                )}
              </View>
            </PopoverContent>
          </Popover>
        </View>

        {/* Search */}
        <View className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" style={{ left: language === 'ar' ? undefined : 12, right: language === 'ar' ? 12 : undefined } as any} />
          <Input
            type="text"
            placeholder={homeT.searchPlaceholder}
            value={searchQuery}
            onChange={(e: any) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 border-[#FB5E7A] h-10 text-sm"
            style={{ paddingLeft: language === 'ar' ? 16 : 36, paddingRight: language === 'ar' ? 36 : 16 } as any}
          />
        </View>

        {/* Filter */}
        <View className="flex gap-2">
          <Button
            variant={!showAvailableOnly ? 'default' : 'outline'}
            onPress={() => setShowAvailableOnly(false)}
            size="sm"
            className={!showAvailableOnly ? 'bg-[#FB5E7A] hover:bg-[#e5536e]' : ''}
          >
            {homeT.allSitters}
          </Button>
          <Button
            variant={showAvailableOnly ? 'default' : 'outline'}
            onPress={() => setShowAvailableOnly(true)}
            size="sm"
            className={showAvailableOnly ? 'bg-[#FB5E7A] hover:bg-[#e5536e]' : ''}
          >
            {homeT.filterAvailable}
          </Button>
        </View>
      </View>

      {/* Sitters Grid */}
      <View className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <View className="col-span-2 text-center py-12">
            <View className="w-10 h-10 border-4 border-[#FB5E7A] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <Text className="text-gray-500">{homeT.findingSitters}</Text>
          </View>
        ) : hasError ? (
          <View className="col-span-2 text-center py-12 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/20">
            <Text className="text-red-500 mb-4 font-medium">
              {homeT.errorLoading}
            </Text>
            <Button
              onPress={loadSitters}
              className="bg-[#FB5E7A] hover:bg-[#e5536e]"
            >
              {homeT.retry}
            </Button>
          </View>
        ) : filteredSitters.length === 0 ? (
          <View className="col-span-2 text-center py-12 text-gray-500 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            {homeT.noSitters}
          </View>
        ) : (
          filteredSitters.map((sitter) => (
            <ErrorBoundary key={sitter.id} fallback={
              <Card className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20">
                <Text className="text-red-500 text-sm text-center">Unable to load this profile</Text>
              </Card>
            }>
              <Card className="p-4 hover:shadow-lg transition-shadow">
                <View className="flex gap-4">
                  {/* Image */}
                  <View className="relative">
                    <Image
                      src={sitter.image}
                      alt={sitter.name}
                      loading="lazy"
                      className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-md relative z-10"
                    />
                    <View className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white z-20 ${sitter.availabilityType === 'home' || sitter.availabilityType === 'both' ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                  </View>
                  {/* Info */}
                  <View className="flex-1">
                    <View className="flex items-start justify-between mb-2">
                      <View>
                        <Text className="mb-1">{t.client.homePage.khala}{sitter.name}</Text>
                        {!sitter.available && (
                          <Badge variant="secondary" className="bg-gray-100 text-gray-500 mb-2">
                            {homeT.currentlyUnavailable}
                          </Badge>
                        )}
                        <View className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 mb-1">
                          <MapPin className="w-3 h-3" />
                          <Text>{sitter.location}</Text>
                        </View>
                        <View className="flex items-center gap-1 text-sm text-gray-500">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <Text className="font-bold text-gray-900 dark:text-gray-100">{sitter.rating}</Text>
                          <Text>({sitter.reviews})</Text>
                        </View>
                      </View>
                      {sitter.available ? (
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                          <Clock className="w-3 h-3 mr-1" />
                          {homeT.availableNow}
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
                          <Clock className="w-3 h-3 mr-1" />
                          {homeT.busy}
                        </Badge>
                      )}
                    </View>

                    <View className="flex flex-wrap gap-1 mb-3">
                      {sitter.specialties.slice(0, 3).map((specialty, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                      {sitter.specialties.length > 3 && (
                        <Badge variant="outline" className="text-xs">+{sitter.specialties.length - 3}</Badge>
                      )}
                    </View>

                    <View className="flex items-center justify-between mt-4">
                      <Text className="text-sm text-gray-600 dark:text-gray-400 font-bold">
                        {sitter.experience} {homeT.years}
                      </Text>
                      <Button
                        size="sm"
                        onPress={() => setSelectedSitter(sitter)}
                        className="bg-[#FB5E7A] hover:bg-[#e5536e]"
                      >
                        {homeT.viewProfile}
                      </Button>
                    </View>
                  </View>
                </View>
              </Card>
            </ErrorBoundary>
          ))
        )}
      </View>
    </View>
  );
}