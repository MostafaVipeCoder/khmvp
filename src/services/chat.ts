import { supabase } from '@/lib/supabase';

export interface ChatMessage {
    id: string;
    booking_id: string;
    sender_id: string;
    receiver_id: string;
    content: string;
    created_at: string;
    read_at: string | null;
}

/**
 * Service for handling real-time chat functionality.
 */
export const chatService = {
    /**
     * Retrieves chat history for a specific booking.
     * @param bookingId UUID of the booking context
     * @returns Array of messages ordered chronologically
     */
    async getMessages(bookingId: string) {
        const { data, error } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('booking_id', bookingId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data as ChatMessage[];
    },

    /**
     * Sends a new message in a chat context.
     * @param bookingId UUID of the booking
     * @param senderId UUID of the sender
     * @param receiverId UUID of the receiver
     * @param content Message text content
     */
    async sendMessage(bookingId: string, senderId: string, receiverId: string, content: string) {
        const { data, error } = await supabase
            .from('chat_messages')
            .insert({
                booking_id: bookingId,
                sender_id: senderId,
                receiver_id: receiverId,
                content: content
            })
            .select()
            .single();

        if (error) throw error;
        return data as ChatMessage;
    },

    /**
     * Marks all unread messages in a conversation as read for the current user.
     * @param bookingId UUID of the booking
     * @param userId Current user ID (receiver)
     */
    async markAsRead(bookingId: string, userId: string) {
        // userId here is the current user (receiver), so we mark messages where receiver_id = userId
        const { error } = await supabase
            .from('chat_messages')
            .update({ read_at: new Date().toISOString() })
            .eq('booking_id', bookingId)
            .eq('receiver_id', userId)
            .is('read_at', null);

        if (error) throw error;
    },

    /**
     * Subscribes to real-time new message events for a booking.
     * @param bookingId UUID of the booking to listen to
     * @param callback Function to execute when a new message arrives
     * @returns Subscription object
     */
    subscribeToMessages(bookingId: string, callback: (payload: ChatMessage) => void) {
        return supabase
            .channel(`chat_messages_channel_${bookingId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'chat_messages'
                },
                (payload) => {
                    const newMessage = payload.new as ChatMessage;
                    if (newMessage.booking_id.toLowerCase() === bookingId.toLowerCase()) {
                        callback(newMessage);
                    }
                }
            )
            .subscribe();
    }
};
