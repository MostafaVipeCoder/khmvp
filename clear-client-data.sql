
-- =============================================
-- Script to Clear All Client Data
-- =============================================

-- NOTE: This will delete ALL client-related data!

-- Disable triggers temporarily
SET session_replication_role = 'replica';

-- Delete data in reverse order of dependencies
DELETE FROM public.notifications WHERE user_id IN (SELECT id FROM public.profiles WHERE role = 'client');
DELETE FROM public.fcm_tokens WHERE user_id IN (SELECT id FROM public.profiles WHERE role = 'client');
DELETE FROM public.reviews WHERE reviewer_id IN (SELECT id FROM public.profiles WHERE role = 'client');
DELETE FROM public.chat_messages WHERE sender_id IN (SELECT id FROM public.profiles WHERE role = 'client') OR receiver_id IN (SELECT id FROM public.profiles WHERE role = 'client');
DELETE FROM public.transactions WHERE user_id IN (SELECT id FROM public.profiles WHERE role = 'client');
DELETE FROM public.children WHERE client_id IN (SELECT id FROM public.profiles WHERE role = 'client');
DELETE FROM public.bookings WHERE client_id IN (SELECT id FROM public.profiles WHERE role = 'client');
DELETE FROM public.profiles WHERE role = 'client';

-- Re-enable triggers
SET session_replication_role = 'origin';
