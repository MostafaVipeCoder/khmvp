import { supabase } from '@/lib/supabase';

import { Child } from '@/types/core';

/**
 * Service for managing child profiles associated with a client.
 */
export const childrenService = {
    /**
     * Retrieves all children for a specific client.
     * @param clientId UUID of the client
     * @returns Array of Child objects ordered by creation date
     */
    async getChildren(clientId: string) {
        const { data, error } = await supabase
            .from('children')
            .select('*')
            .eq('client_id', clientId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as Child[];
    },

    /**
     * Adds a new child to the client's profile.
     * @param child Child data object (excluding ID and timestamp)
     * @returns Created Child object
     */
    async addChild(child: Omit<Child, 'id' | 'created_at'>) {
        const { data, error } = await supabase
            .from('children')
            .insert(child)
            .select()
            .single();

        if (error) throw error;
        return data as Child;
    },

    /**
     * Updates an existing child's profile.
     * @param id UUID of the child record
     * @param updates Partial Child object with fields to update
     * @returns Updated Child object
     */
    async updateChild(id: string, updates: Partial<Omit<Child, 'id' | 'client_id' | 'created_at'>>) {
        const { data, error } = await supabase
            .from('children')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as Child;
    },

    /**
     * Deletes a child's profile.
     * @param id UUID of the child record
     */
    async deleteChild(id: string) {
        const { error } = await supabase
            .from('children')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
