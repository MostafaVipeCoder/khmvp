-- Fix RLS policies to avoid infinite recursion

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for users based on user_id" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.profiles;
DROP POLICY IF EXISTS "Admins can do everything" ON public.profiles;

-- Create simple, non-recursive policies for profiles
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create admin policies using JWT claims instead of querying profiles table
-- First, let's check if we can use JWT role or if we need to set user metadata
-- For now, let's create a safe admin policy using security definer function if needed, but let's start simple
