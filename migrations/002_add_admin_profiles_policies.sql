-- Migration to add admin policies for profiles table

-- Add policy for admins to view all profiles
DROP POLICY IF EXISTS "Admins can view all profiles." ON public.profiles;
CREATE POLICY "Admins can view all profiles."
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Add policy for admins to update all profiles
DROP POLICY IF EXISTS "Admins can update all profiles." ON public.profiles;
CREATE POLICY "Admins can update all profiles."
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Add policy for admins to insert profiles
DROP POLICY IF EXISTS "Admins can insert profiles." ON public.profiles;
CREATE POLICY "Admins can insert profiles."
  ON public.profiles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Add policy for admins to delete profiles
DROP POLICY IF EXISTS "Admins can delete profiles." ON public.profiles;
CREATE POLICY "Admins can delete profiles."
  ON public.profiles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
