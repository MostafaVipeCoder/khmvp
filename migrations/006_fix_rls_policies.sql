-- =============================================
-- Migration: Fix RLS Policies for All Admin Roles
-- =============================================

-- 1. Update profiles table RLS policies to include all admin roles
-- Drop existing admin policy that only checks for 'admin' role
DROP POLICY IF EXISTS "Admins can do everything" ON public.profiles;

CREATE POLICY "Admins can manage all profiles"
  ON public.profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin', 'client_manager', 'sitter_manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin', 'client_manager', 'sitter_manager')
    )
  );

-- 2. Update admin_permissions table RLS policies
DROP POLICY IF EXISTS "Admins can view permissions." ON public.admin_permissions;
DROP POLICY IF EXISTS "Only super admins can update permissions." ON public.admin_permissions;

CREATE POLICY "All admins can view permissions"
  ON public.admin_permissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin', 'client_manager', 'sitter_manager')
    )
  );

CREATE POLICY "Only super admins can manage permissions"
  ON public.admin_permissions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );
