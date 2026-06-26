
import { supabase } from '@/lib/supabase';
import { SupportTicket, TicketMessage } from '@/types/core';

export type { SupportTicket, TicketMessage };

export const supportTicketService = {
    async createTicket(ticket: Partial<SupportTicket>) {
        const { data, error } = await supabase
            .from('support_tickets')
            .insert(ticket)
            .select()
            .single();

        if (error) throw error;
        return data as SupportTicket;
    },

    async getUserTickets(userId: string) {
        const { data, error } = await supabase
            .from('support_tickets')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as SupportTicket[];
    },

    async getTicket(ticketId: string) {
        const { data, error } = await supabase
            .from('support_tickets')
            .select('*')
            .eq('id', ticketId)
            .single();

        if (error) throw error;
        return data as SupportTicket;
    },

    async updateTicket(ticketId: string, updates: Partial<SupportTicket>) {
        const { error } = await supabase
            .from('support_tickets')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', ticketId);

        if (error) throw error;
    },

    async addTicketMessage(message: Partial<TicketMessage>) {
        const { data, error } = await supabase
            .from('ticket_messages')
            .insert(message)
            .select()
            .single();

        if (error) throw error;
        return data as TicketMessage;
    },

    async getTicketMessages(ticketId: string) {
        const { data, error } = await supabase
            .from('ticket_messages')
            .select('*')
            .eq('ticket_id', ticketId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data as TicketMessage[];
    }
};
