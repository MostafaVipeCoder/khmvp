import { supabase } from '@/lib/supabase';

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  data: any;
  created_at: string;
}

/**
 * Service for managing user notifications and FCM tokens.
 */
export const notificationService = {
  /**
   * Retrieves all notifications for a user.
   * @param userId UUID of the user
   * @returns Array of notifications ordered by newest first
   */
  async getNotifications(userId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Notification[];
  },

  /**
   * Retrieves notifications from the last 24 hours.
   * @param userId UUID of the user
   * @returns Array of recent notifications
   */
  async getRecentNotifications(userId: string) {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', oneDayAgo.toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Notification[];
  },

  /**
   * Marks a specific notification as read.
   * @param notificationId UUID of the notification
   */
  async markAsRead(notificationId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) throw error;
  },

  /**
   * Marks ALL unread notifications for a user as read.
   * @param userId UUID of the user
   */
  async markAllAsRead(userId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;
  },

  /**
   * Saves or updates an FCM token for push notifications.
   * @param userId UUID of the user
   * @param token FCM token string
   * @param deviceType Device platform ('ios', 'android', 'web')
   */
  async saveToken(userId: string, token: string, deviceType: 'ios' | 'android' | 'web') {
    const { error } = await supabase
      .from('fcm_tokens')
      .upsert({
        user_id: userId,
        token: token,
        device_type: deviceType
      }, {
        onConflict: 'user_id,token'
      });

    if (error) throw error;
  },

  /**
   * Creates a new notification in the database.
   * @param notification Partial notification data
   * @returns Created Notification object
   */
  async createNotification(notification: Partial<Notification>) {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        ...notification,
        is_read: false
      })
      .select()
      .single();

    if (error) throw error;
    return data as Notification;
  }
};
