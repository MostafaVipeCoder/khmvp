
import { supabase } from '@/lib/supabase';
import { Payment } from '@/types/core';

export type { Payment };

export const paymentService = {
    async createPayment(payment: Partial<Payment>) {
        const { data, error } = await supabase
            .from('payments')
            .insert(payment)
            .select()
            .single();

        if (error) throw error;
        return data as Payment;
    },

    async getBookingPayments(bookingId: string) {
        const { data, error } = await supabase
            .from('payments')
            .select('*')
            .eq('booking_id', bookingId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as Payment[];
    },

    async updatePaymentStatus(paymentId: string, status: Payment['status']) {
        const { error } = await supabase
            .from('payments')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', paymentId);

        if (error) throw error;
    },

    async getPayment(paymentId: string) {
        const { data, error } = await supabase
            .from('payments')
            .select('*')
            .eq('id', paymentId)
            .single();

        if (error) throw error;
        return data as Payment;
    }
};
