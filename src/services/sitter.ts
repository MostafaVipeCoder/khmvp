import { supabase } from '@/lib/supabase';

import { SitterProfile, SitterAvailability } from '../types/core';

export interface SitterService { // Keeping this as it's DB specific and slightly different from 'Service' view model, but could also be unified later
    id: string;
    service_type: string;
    price: number;
    description: string | null;
    minimum_hours: number;
    features: string[];
    is_active: boolean;
}

// ... existing code ...


export const sitterService = {
    // -- Profile Management --

    /**
     * Retrieves the profile for a specific user.
     * @param userId UUID of the user
     * @returns SitterProfile object
     */
    async getProfile(userId: string) {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();

        if (error) throw error;
        return data as SitterProfile;
    },

    /**
     * Updates the profile information for a user.
     * @param userId UUID of the user
     * @param updates Partial SitterProfile object with fields to update
     */
    async updateProfile(userId: string, updates: Partial<SitterProfile>) {
        const { error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', userId);

        if (error) throw error;
    },

    /**
     * Uploads and updates the user's avatar image.
     * @param userId UUID of the user
     * @param file Image file to upload
     * @returns Public URL of the uploaded avatar
     */
    async updateAvatar(userId: string, file: File) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}/avatar-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: true
            });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

        await this.updateProfile(userId, { avatar_url: data.publicUrl });
        return data.publicUrl;
    },

    // -- Services Management --

    /**
     * Retrieves all services offered by a sitter.
     * @param userId UUID of the sitter
     * @returns Array of SitterService objects
     */
    async getServices(userId: string) {
        const { data, error } = await supabase
            .from('sitter_services')
            .select('*')
            .eq('sitter_id', userId);

        if (error) throw error;
        return data as SitterService[];
    },

    /**
     * Creates or updates a service offering for a sitter.
     * Handles conflict resolution by checking for existing services first.
     */
    async upsertService(userId: string, serviceType: string, price: number, description?: string, minHours: number = 1, features: string[] = [], isActive: boolean = true) {
        // Check if exists first to update or insert
        const { data: existing } = await supabase
            .from('sitter_services')
            .select('id')
            .eq('sitter_id', userId)
            .eq('service_type', serviceType)
            .maybeSingle();

        if (existing) {
            const { error } = await supabase
                .from('sitter_services')
                .update({
                    price,
                    description,
                    minimum_hours: minHours,
                    features: JSON.stringify(features),
                    is_active: isActive
                })
                .eq('id', existing.id);
            if (error) throw error;
        } else {
            const { error } = await supabase
                .from('sitter_services')
                .insert({
                    sitter_id: userId,
                    service_type: serviceType,
                    price,
                    description,
                    minimum_hours: minHours,
                    features: JSON.stringify(features),
                    is_active: isActive
                });
            if (error) throw error;
        }
    },

    // -- Skills Management --

    /**
     * Retrieves all skills associated with a sitter.
     * @param userId UUID of the sitter
     */
    async getSkills(userId: string) {
        const { data, error } = await supabase
            .from('sitter_skills')
            .select('*')
            .eq('sitter_id', userId);

        if (error) throw error;
        return data;
    },

    /**
     * Adds a new skill to a sitter's profile.
     * @param userId UUID of the sitter
     * @param skill Name of the skill
     */
    async addSkill(userId: string, skill: string) {
        const { error } = await supabase
            .from('sitter_skills')
            .insert({ sitter_id: userId, skill });

        if (error) throw error;
    },

    /**
     * Removes a skill from a sitter's profile.
     * @param id ID of the skill record
     */
    async removeSkill(id: string) {
        const { error } = await supabase
            .from('sitter_skills')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    // -- Languages Management --

    /**
     * Retrieves all languages spoken by a sitter.
     * @param userId UUID of the sitter
     */
    async getLanguages(userId: string) {
        const { data, error } = await supabase
            .from('sitter_languages')
            .select('*')
            .eq('sitter_id', userId);

        if (error) throw error;
        return data;
    },

    /**
     * Adds a language to a sitter's profile.
     * @param userId UUID of the sitter
     * @param language Name of the language
     */
    async addLanguage(userId: string, language: string) {
        const { error } = await supabase
            .from('sitter_languages')
            .insert({ sitter_id: userId, language });

        if (error) throw error;
    },

    /**
     * Removes a language from a sitter's profile.
     * @param id ID of the language record
     */
    async removeLanguage(id: string) {
        const { error } = await supabase
            .from('sitter_languages')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    // -- Discovery --

    /**
     * Retrieves all active and verified "Khala" sitters.
     * Used for the client home page / discovery.
     */
    async getAllSitters() {
        const { data, error } = await supabase
            .from('profiles')
            .select(`
                id,
                full_name,
                avatar_url,
                bio,
                location,
                experience_years,
                availability_type,
                is_verified,
                is_active,
                sitter_services (*),
                sitter_skills (*),
                sitter_languages (*)
            `)
            .eq('role', 'khala')
            .eq('is_verified', true)
            .eq('is_active', true); // Only show active sitters

        if (error) throw error;
        return data as unknown as SitterProfile[];
    },

    // -- Availability Management --

    /**
     * Retrieves availability slots for a sitter.
     * @param userId UUID of the sitter
     */
    async getAvailability(userId: string) {
        const { data, error } = await supabase
            .from('sitter_availability')
            .select('*')
            .eq('sitter_id', userId);

        if (error) throw error;
        return data as SitterAvailability[];
    },

    /**
     * Adds a batch of availability slots.
     * @param userId UUID of the sitter
     * @param slots Array of availability slots
     */
    async addAvailability(userId: string, slots: Omit<SitterAvailability, 'id' | 'created_at' | 'sitter_id'>[]) {
        const { error } = await supabase
            .from('sitter_availability')
            .insert(slots.map(s => ({ ...s, sitter_id: userId })));

        if (error) throw error;
    },

    /**
     * Deletes a specific availability slot.
     * @param id ID of the availability record
     */
    async deleteAvailability(id: string) {
        const { error } = await supabase
            .from('sitter_availability')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    /**
     * Clears availability for specific dates.
     * Useful before re-populating slots to avoid duplication.
     * @param userId UUID of the sitter
     * @param dates Array of date strings
     */
    async clearAvailabilityForDates(userId: string, dates: string[]) {
        if (dates.length === 0) return;
        const { error } = await supabase
            .from('sitter_availability')
            .delete()
            .eq('sitter_id', userId)
            .in('date', dates)
            .eq('is_recurring', false);

        if (error) throw error;
    },

    // -- Verification --

    /**
     * Uploads a verification document to storage.
     * @param userId UUID of the user
     * @param file Document file to upload
     * @param path Sub-path/category for the document
     * @returns Public URL of the uploaded document
     */
    async uploadVerificationDocument(userId: string, file: File, path: string) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}/${path}/${Math.random().toString(36).substring(2)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
            .from('verification-docs')
            .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
            .from('verification-docs')
            .getPublicUrl(fileName);

        return data.publicUrl;
    },

    /**
     * Submits a request for document verification.
     * Creates a new request or updates an existing one if present.
     */
    async submitVerificationRequest(userId: string, documentType: string, documentUrl: string) {
        // Check if a request for this doc type already exists, if so update it
        const { data: existing } = await supabase
            .from('verification_requests')
            .select('id')
            .eq('sitter_id', userId)
            .eq('document_type', documentType)
            .maybeSingle();

        if (existing) {
            const { error } = await supabase
                .from('verification_requests')
                .update({
                    document_url: documentUrl,
                    status: 'pending',
                    created_at: new Date().toISOString()
                })
                .eq('id', existing.id);
            if (error) throw error;
        } else {
            const { error } = await supabase
                .from('verification_requests')
                .insert({
                    sitter_id: userId,
                    document_type: documentType,
                    document_url: documentUrl,
                    status: 'pending'
                });
            if (error) throw error;
        }
    },

    /**
     * Retrieves all verification requests for a sitter.
     * @param userId UUID of the sitter
     */
    async getVerificationRequests(userId: string) {
        const { data, error } = await supabase
            .from('verification_requests')
            .select('*')
            .eq('sitter_id', userId);

        if (error) throw error;
        return data as VerificationRequest[];
    },

    // -- Advanced Search (RPC) --

    /**
     * Searches for sitters based on various criteria using a database function.
     * @param params Search parameters (price, experience, service type, verification)
     */
    async searchSitters(params: {
        minPrice?: number;
        maxPrice?: number;
        minExperience?: number;
        serviceType?: string;
        isVerified?: boolean;
    }) {
        const { data, error } = await supabase.rpc('search_sitters', {
            p_min_price: params.minPrice,
            p_max_price: params.maxPrice,
            p_min_experience: params.minExperience,
            p_service_type: params.serviceType,
            p_is_verified: params.isVerified
        });

        if (error) throw error;
        return data;
    },

    /**
     * Retrieves analytics/stats for a sitter.
     * @param userId UUID of the sitter
     */
    async getStats(userId: string) {
        const { data, error } = await supabase.rpc('get_sitter_stats', {
            p_sitter_id: userId
        });

        if (error) throw error;
        return data;
    }
};


export interface VerificationRequest {
    id: string;
    sitter_id: string;
    document_type: string;
    document_url: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
}


