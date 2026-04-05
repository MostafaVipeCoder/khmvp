import { supabase } from '@/lib/supabase';

export interface Transaction {
    id: string;
    user_id: string;
    amount: number;
    type: 'earning' | 'withdrawal';
    status: 'completed' | 'pending' | 'failed';
    description: string;
    booking_id?: string;
    created_at: string;
}

/**
 * Service for managing user wallet and financial transactions.
 */
export const walletService = {
    /**
     * Retrieves all transactions for a specific user.
     * @param userId UUID of the user
     * @returns Array of transactions ordered by date descending
     */
    async getTransactions(userId: string) {
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as Transaction[];
    },

    /**
     * Retrieves the current balance for a user.
     * Calculated via database function.
     * @param userId UUID of the user
     * @returns Current balance amount
     */
    async getBalance(userId: string) {
        const { data, error } = await supabase
            .rpc('get_user_balance', { uid: userId });

        if (error) throw error;
        return data as number;
    },

    /**
     * Submits a new withdrawal request.
     * @param userId UUID of the user
     * @param amount Amount to withdraw
     */
    async requestWithdrawal(userId: string, amount: number) {
        const { error } = await supabase
            .from('transactions')
            .insert({
                user_id: userId,
                amount: amount,
                type: 'withdrawal',
                status: 'pending',
                description: `Withdrawal request`
            });

        if (error) throw error;
    },

    // -- Admin Methods --

    /**
     * RETRIEVES all pending withdrawal requests.
     * Intended for admin use only.
     * Includes user profile details.
     */
    async getAllPendingWithdrawals() {
        const { data, error } = await supabase
            .from('transactions')
            .select(`
                *,
                profiles:user_id (
                    full_name,
                    phone
                )
            `)
            .eq('type', 'withdrawal')
            .eq('status', 'pending')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    /**
     * Updates the status of a transaction (e.g., approving a withdrawal).
     * @param id UUID of the transaction
     * @param status New status
     */
    async updateTransactionStatus(id: string, status: Transaction['status']) {
        const { error } = await supabase
            .from('transactions')
            .update({ status })
            .eq('id', id);

        if (error) throw error;
    }
};
