-- Drop all existing policies for profiles
DROP POLICY IF EXISTS "Admins can delete profiles." ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles." ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles." ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles." ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;

-- Create new policies
CREATE POLICY "Enable read access for all users"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Enable insert for users based on user_id"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update for users based on user_id"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can do everything"
  ON public.profiles FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));