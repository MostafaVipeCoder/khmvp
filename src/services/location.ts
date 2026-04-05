import { supabase } from '@/lib/supabase';

export interface SitterLocation {
    sitter_id: string;
    booking_id: string;
    latitude: number;
    longitude: number;
    accuracy?: number;
}

/**
 * Service for tracking and retrieving sitter locations during active bookings.
 */
export const locationService = {
    /**
     * Updates the current location of a sitter.
     * @param location SitterLocation object containing coords and accuracy
     */
    async updateLocation(location: SitterLocation) {
        const { error } = await supabase
            .from('sitter_locations')
            .insert(location);

        if (error) throw error;
    },

    /**
     * Retrieves the historical path/route of a sitter for a specific booking.
     * @param bookingId UUID of the booking
     * @returns Array of location points ordered by time
     */
    async getSitterPath(bookingId: string) {
        const { data, error } = await supabase
            .from('sitter_locations')
            .select('*')
            .eq('booking_id', bookingId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data;
    },

    /**
     * Retrieves the most recently recorded location for a booking.
     * @param bookingId UUID of the booking
     * @returns Single most recent SitterLocation object
     */
    async getLatestLocation(bookingId: string) {
        const { data, error } = await supabase
            .from('sitter_locations')
            .select('*')
            .eq('booking_id', bookingId)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) throw error;
        return data;
    }
};
