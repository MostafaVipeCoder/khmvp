import { supabase } from '@/lib/supabase';
import { Booking } from '@/types/core';

export type { Booking };

/**
 * Service for managing booking operations.
 * Handles creation, retrieval, and status updates for bookings.
 */
export const bookingService = {
    /**
     * Creates a new booking in the database.
     * @param booking Booking data object
     * @returns Created booking data
     */
    async createBooking(booking: Partial<Booking>) {
        const { data, error } = await supabase
            .from('bookings')
            .insert(booking)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Retrieves all bookings for a specific client.
     * Includes sitter details (full name, avatar).
     * @param clientId UUID of the client
     * @returns Array of booking objects
     */
    async getClientBookings(clientId: string) {
        const { data, error } = await supabase
            .from('bookings')
            .select(`
                *,
                sitter:sitter_id (
                    full_name,
                    avatar_url
                )
            `)
            .eq('client_id', clientId)
            .order('date', { ascending: false });

        if (error) throw error;
        return data;
    },

    /**
     * Retrieves all bookings for a specific sitter.
     * Includes client details (full name, avatar).
     * @param sitterId UUID of the sitter
     * @returns Array of booking objects
     */
    async getSitterBookings(sitterId: string) {
        const { data, error } = await supabase
            .from('bookings')
            .select(`
                *,
                client:client_id (
                    full_name,
                    avatar_url
                )
            `)
            .eq('sitter_id', sitterId)
            .order('date', { ascending: false });

        if (error) throw error;
        return data;
    },

    /**
     * Updates the status of a specific booking.
     * @param bookingId UUID of the booking
     * @param status New status to set
     */
    async updateStatus(bookingId: string, status: Booking['status']) {
        const { error } = await supabase
            .from('bookings')
            .update({ status })
            .eq('id', bookingId);

        if (error) throw error;
    },

    /**
     * Retrieves a single booking by its ID.
     * Includes client details.
     * @param bookingId UUID of the booking
     * @returns Booking object
     */
    async getBooking(bookingId: string) {
        const { data, error } = await supabase
            .from('bookings')
            .select(`
                *,
                client:client_id (
                    full_name,
                    avatar_url
                )
            `)
            .eq('id', bookingId)
            .single();

        if (error) throw error;
        return data as Booking;
    }
};
