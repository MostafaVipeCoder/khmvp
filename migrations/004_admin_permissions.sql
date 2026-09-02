-- =============================================
-- Migration: Add Admin Roles and Permissions
-- =============================================

-- 1. Update profiles table role constraint to support new admin roles
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('client', 'khala', 'admin', 'super_admin', 'client_manager', 'sitter_manager'));

-- 2. Create admin_permissions table to store role -> tab access
CREATE TABLE IF NOT EXISTS public.admin_permissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    role TEXT NOT NULL UNIQUE CHECK (role IN ('super_admin', 'client_manager', 'sitter_manager')),
    allowed_tabs TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS on admin_permissions
ALTER TABLE public.admin_permissions ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for admin_permissions
DROP POLICY IF EXISTS "Admins can view permissions." ON public.admin_permissions;
CREATE POLICY "Admins can view permissions."
  ON public.admin_permissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

DROP POLICY IF EXISTS "Only super admins can update permissions." ON public.admin_permissions;
CREATE POLICY "Only super admins can update permissions."
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

-- 5. Insert default permissions
INSERT INTO public.admin_permissions (role, allowed_tabs)
VALUES 
  ('super_admin', ARRAY['dashboard', 'orders', 'interviews', 'sitters', 'clients', 'finance', 'withdrawals', 'settings']),
  ('client_manager', ARRAY['dashboard', 'orders', 'clients', 'finance', 'withdrawals', 'settings']),
  ('sitter_manager', ARRAY['dashboard', 'orders', 'interviews', 'sitters', 'finance', 'withdrawals', 'settings'])
ON CONFLICT (role) DO NOTHING;

-- 6. Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Trigger for admin_permissions updated_at
DROP TRIGGER IF EXISTS update_admin_permissions_updated_at ON public.admin_permissions;
CREATE TRIGGER update_admin_permissions_updated_at
  BEFORE UPDATE ON public.admin_permissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
