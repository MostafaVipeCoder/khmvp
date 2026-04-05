import { supabase } from '@/lib/supabase';

export interface Review {
    id: string;
    booking_id: string;
    reviewer_id: string;
    reviewee_id: string;
    rating: number;
    comment: string;
    created_at: string;
    // Joined data
    reviewer?: {
        full_name: string;
        avatar_url: string;
    };
    reviewee?: {
        full_name: string;
        avatar_url: string;
    };
}

/**
 * Service for managing reviews and ratings.
 */
export const reviewService = {
    /**
     * Creates a new review for a booking.
     * @param review Review data (booking_id, reviewer info, rating, comment)
     * @returns Created Review object
     */
    async createReview(review: {
        booking_id: string;
        reviewer_id: string;
        reviewee_id: string;
        rating: number;
        comment: string;
    }) {
        const { data, error } = await supabase
            .from('reviews')
            .insert(review)
            .select()
            .single();

        if (error) throw error;
        return data as Review;
    },

    /**
     * Retrieves all reviews for a specific sitter (reviewee).
     * Includes reviewer profile information.
     * @param sitterId UUID of the sitter
     * @returns Array of Review objects
     */
    async getSitterReviews(sitterId: string) {
        const { data, error } = await supabase
            .from('reviews')
            .select(`
                *,
                reviewer:reviewer_id (
                    full_name,
                    avatar_url
                )
            `)
            .eq('reviewee_id', sitterId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as Review[];
    },

    /**
     * Retrieves the existing review for a specific booking (if any).
     * @param bookingId UUID of the booking
     * @returns Review object or null
     */
    async getBookingReview(bookingId: string) {
        const { data, error } = await supabase
            .from('reviews')
            .select('*')
            .eq('booking_id', bookingId)
            .maybeSingle();

        if (error) throw error;
        return data as Review | null;
    },

    /**
     * Calculates the average rating and review count for a sitter.
     * @param sitterId UUID of the sitter
     * @returns Object with average rating and count
     */
    async getSitterAverageRating(sitterId: string) {
        const { data, error } = await supabase
            .from('reviews')
            .select('rating')
            .eq('reviewee_id', sitterId);

        if (error) throw error;

        if (!data || data.length === 0) return { average: 0, count: 0 };

        const sum = data.reduce((acc, review) => acc + (review.rating || 0), 0);
        const average = sum / data.length;

        return {
            average: Math.round(average * 10) / 10, // Round to 1 decimal
            count: data.length
        };
    }
};
