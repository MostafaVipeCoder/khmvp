
import { supabase } from '@/lib/supabase';
import { Dispute } from '@/types/core';

export type { Dispute };

export const disputeService = {
    async createDispute(dispute: Partial<Dispute>) {
        const { data, error } = await supabase
            .from('disputes')
            .insert(dispute)
            .select()
            .single();

        if (error) throw error;
        return data as Dispute;
    },

    async getBookingDispute(bookingId: string) {
        const { data, error } = await supabase
            .from('disputes')
            .select('*')
            .eq('booking_id', bookingId)
            .single();

        if (error) throw error;
        return data as Dispute;
    },

    async updateDispute(disputeId: string, updates: Partial<Dispute>) {
        const { error } = await supabase
            .from('disputes')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', disputeId);

        if (error) throw error;
    }
};
