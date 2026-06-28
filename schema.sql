
-- =============================================
-- Khala Al Ayal Database Schema
-- =============================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- =============================================
-- Handle New User Function
-- =============================================
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, role, is_active, is_verified)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'phone',
    COALESCE(NEW.raw_user_meta_data->>'role', 'client'),
    TRUE,
    FALSE
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- New User Trigger
-- =============================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- Table: Profiles (User Profiles)
-- =============================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    location TEXT,
    experience_years INTEGER DEFAULT 0,
    average_rating NUMERIC(3, 2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    role TEXT DEFAULT 'client' CHECK (role IN ('client', 'khala', 'admin')),
    availability_type TEXT CHECK (availability_type IN ('home', 'outside', 'both')),
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    phone TEXT,
    mother_job TEXT,
    father_job TEXT,
    default_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns if they don't exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS mother_job TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS father_job TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS default_address TEXT;

-- =============================================
-- Table: Sitter Services
-- =============================================
CREATE TABLE IF NOT EXISTS public.sitter_services (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sitter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    service_type TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    description TEXT,
    minimum_hours INTEGER DEFAULT 1,
    features JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Table: Sitter Skills
-- =============================================
CREATE TABLE IF NOT EXISTS public.sitter_skills (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sitter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    skill TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Table: Sitter Languages
-- =============================================
CREATE TABLE IF NOT EXISTS public.sitter_languages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sitter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    language TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Table: Sitter Availability
-- =============================================
CREATE TABLE IF NOT EXISTS public.sitter_availability (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sitter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    date DATE,
    day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_recurring BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Table: Bookings
-- =============================================
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    sitter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    duration_hours INTEGER NOT NULL,
    location TEXT NOT NULL,
    booking_type TEXT CHECK (booking_type IN ('home', 'outside')) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'waiting_payment', 'upcoming', 'ongoing', 'completed', 'cancelled')),
    total_price NUMERIC(10, 2) NOT NULL,
    children_count INTEGER DEFAULT 1,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Table: Children
-- =============================================
CREATE TABLE IF NOT EXISTS public.children (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    age INTEGER NOT NULL,
    gender TEXT CHECK (gender IN ('male', 'female')) NOT NULL,
    notes TEXT,
    medical_conditions TEXT,
    allergies TEXT,
    special_needs TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Table: Notifications
-- =============================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Table: FCM Tokens
-- =============================================
CREATE TABLE IF NOT EXISTS public.fcm_tokens (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    token TEXT NOT NULL,
    device_type TEXT CHECK (device_type IN ('ios', 'android', 'web')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, token)
);

-- =============================================
-- Table: Chat Messages
-- =============================================
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Table: Reviews
-- =============================================
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
    reviewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    reviewee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5) NOT NULL,
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(booking_id)
);

-- =============================================
-- Table: Verification Requests
-- =============================================
CREATE TABLE IF NOT EXISTS public.verification_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    sitter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL,
    document_url TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    rejection_reason TEXT,
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add check constraint to ensure either user_id or sitter_id is present
ALTER TABLE public.verification_requests 
ADD CONSTRAINT chk_user_or_sitter 
CHECK (user_id IS NOT NULL OR sitter_id IS NOT NULL);

-- =============================================
-- Table: Transactions (Wallet)
-- =============================================
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    type TEXT CHECK (type IN ('earning', 'withdrawal')) NOT NULL,
    status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'failed')) NOT NULL,
    description TEXT NOT NULL,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Table: Sitter Locations
-- =============================================
CREATE TABLE IF NOT EXISTS public.sitter_locations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sitter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
    latitude NUMERIC(10, 6) NOT NULL,
    longitude NUMERIC(10, 6) NOT NULL,
    accuracy NUMERIC(10, 2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Table: Disputes
-- =============================================
CREATE TABLE IF NOT EXISTS public.disputes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
    reported_by TEXT CHECK (reported_by IN ('client', 'khala')) NOT NULL,
    type TEXT CHECK (type IN ('no_show', 'late', 'quality', 'payment', 'behavior', 'other')) NOT NULL,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_review', 'resolved', 'closed')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    evidence JSONB DEFAULT '[]',
    resolution TEXT,
    resolved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    closed_at TIMESTAMPTZ
);

-- =============================================
-- Table: Support Tickets
-- =============================================
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    user_type TEXT CHECK (user_type IN ('client', 'khala')) NOT NULL,
    category TEXT CHECK (category IN ('technical', 'account', 'payment', 'booking', 'other')) NOT NULL,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high')) NOT NULL,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting_response', 'resolved', 'closed')) NOT NULL,
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    attachments JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Table: Ticket Messages
-- =============================================
CREATE TABLE IF NOT EXISTS public.ticket_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    sender_type TEXT CHECK (sender_type IN ('user', 'support')) NOT NULL,
    message TEXT NOT NULL,
    attachments JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Table: Payments
-- =============================================
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    payment_method TEXT CHECK (payment_method IN ('card', 'instapay', 'vodafone', 'fawry')) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    transaction_id TEXT,
    gateway_response JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Function: Handle New User Signup
-- =============================================
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'phone',
    COALESCE(NEW.raw_user_meta_data->>'role', 'client')
  );
  RETURN NEW;
END;
$$;

-- =============================================
-- Trigger: On User Signup
-- =============================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- Function: Get User Balance
-- =============================================
DROP FUNCTION IF EXISTS public.get_user_balance(UUID) CASCADE;
CREATE OR REPLACE FUNCTION public.get_user_balance(uid UUID)
RETURNS NUMERIC(10, 2)
LANGUAGE PLPGSQL
SECURITY DEFINER
AS $$
DECLARE
  total_earnings NUMERIC(10, 2) := 0;
  total_withdrawals NUMERIC(10, 2) := 0;
BEGIN
  SELECT COALESCE(SUM(amount), 0) INTO total_earnings
  FROM public.transactions
  WHERE user_id = uid AND type = 'earning' AND status = 'completed';

  SELECT COALESCE(SUM(amount), 0) INTO total_withdrawals
  FROM public.transactions
  WHERE user_id = uid AND type = 'withdrawal' AND status = 'completed';

  RETURN total_earnings - total_withdrawals;
END;
$$;

-- =============================================
-- Function: Get Sitter Stats
-- =============================================
DROP FUNCTION IF EXISTS public.get_sitter_stats(UUID) CASCADE;
CREATE OR REPLACE FUNCTION public.get_sitter_stats(p_sitter_id UUID)
RETURNS TABLE (
  total_bookings INTEGER,
  completed_bookings INTEGER,
  total_earnings NUMERIC(10, 2),
  average_rating NUMERIC(3, 2)
)
LANGUAGE PLPGSQL
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INTEGER AS total_bookings,
    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END)::INTEGER AS completed_bookings,
    COALESCE(SUM(CASE WHEN status = 'completed' THEN total_price ELSE 0 END), 0) AS total_earnings,
    COALESCE(AVG(rating), 0) AS average_rating
  FROM public.bookings b
  LEFT JOIN public.reviews r ON b.id = r.booking_id AND r.reviewee_id = p_sitter_id
  WHERE b.sitter_id = p_sitter_id;
END;
$$;

-- =============================================
-- Function: Search Sitters
-- =============================================
DROP FUNCTION IF EXISTS public.search_sitters(NUMERIC, NUMERIC, INTEGER, TEXT, BOOLEAN) CASCADE;
CREATE OR REPLACE FUNCTION public.search_sitters(
  p_min_price NUMERIC(10, 2) DEFAULT NULL,
  p_max_price NUMERIC(10, 2) DEFAULT NULL,
  p_min_experience INTEGER DEFAULT NULL,
  p_service_type TEXT DEFAULT NULL,
  p_is_verified BOOLEAN DEFAULT NULL
)
RETURNS SETOF public.profiles
LANGUAGE PLPGSQL
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT p.*
  FROM public.profiles p
  LEFT JOIN public.sitter_services s ON p.id = s.sitter_id
  WHERE p.role = 'khala'
    AND p.is_active = TRUE
    AND (p_is_verified IS NULL OR p.is_verified = p_is_verified)
    AND (p_min_experience IS NULL OR p.experience_years >= p_min_experience)
    AND (
      p_service_type IS NULL OR
      EXISTS (
        SELECT 1 FROM public.sitter_services
        WHERE sitter_id = p.id AND service_type = p_service_type
      )
    )
    AND (
      p_min_price IS NULL OR
      EXISTS (
        SELECT 1 FROM public.sitter_services
        WHERE sitter_id = p.id AND price >= p_min_price
      )
    )
    AND (
      p_max_price IS NULL OR
      EXISTS (
        SELECT 1 FROM public.sitter_services
        WHERE sitter_id = p.id AND price <= p_max_price
      )
    )
  GROUP BY p.id;
END;
$$;

-- =============================================
-- Row Level Security (RLS) Policies
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sitter_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sitter_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sitter_languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sitter_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fcm_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sitter_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone."
  ON public.profiles FOR SELECT
  USING (true);
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
CREATE POLICY "Users can insert their own profile."
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
CREATE POLICY "Users can update their own profile."
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Sitter Services Policies
DROP POLICY IF EXISTS "Sitter services are viewable by everyone." ON public.sitter_services;
CREATE POLICY "Sitter services are viewable by everyone."
  ON public.sitter_services FOR SELECT
  USING (true);
DROP POLICY IF EXISTS "Sitters can insert their own services." ON public.sitter_services;
CREATE POLICY "Sitters can insert their own services."
  ON public.sitter_services FOR INSERT
  WITH CHECK (auth.uid() = sitter_id);
DROP POLICY IF EXISTS "Sitters can update their own services." ON public.sitter_services;
CREATE POLICY "Sitters can update their own services."
  ON public.sitter_services FOR UPDATE
  USING (auth.uid() = sitter_id);
DROP POLICY IF EXISTS "Sitters can delete their own services." ON public.sitter_services;
CREATE POLICY "Sitters can delete their own services."
  ON public.sitter_services FOR DELETE
  USING (auth.uid() = sitter_id);

-- Sitter Skills Policies
DROP POLICY IF EXISTS "Sitter skills are viewable by everyone." ON public.sitter_skills;
CREATE POLICY "Sitter skills are viewable by everyone."
  ON public.sitter_skills FOR SELECT
  USING (true);
DROP POLICY IF EXISTS "Sitters can manage their own skills." ON public.sitter_skills;
CREATE POLICY "Sitters can manage their own skills."
  ON public.sitter_skills FOR ALL
  USING (auth.uid() = sitter_id);

-- Sitter Languages Policies
DROP POLICY IF EXISTS "Sitter languages are viewable by everyone." ON public.sitter_languages;
CREATE POLICY "Sitter languages are viewable by everyone."
  ON public.sitter_languages FOR SELECT
  USING (true);
DROP POLICY IF EXISTS "Sitters can manage their own languages." ON public.sitter_languages;
CREATE POLICY "Sitters can manage their own languages."
  ON public.sitter_languages FOR ALL
  USING (auth.uid() = sitter_id);

-- Sitter Availability Policies
DROP POLICY IF EXISTS "Sitter availability is viewable by everyone." ON public.sitter_availability;
CREATE POLICY "Sitter availability is viewable by everyone."
  ON public.sitter_availability FOR SELECT
  USING (true);
DROP POLICY IF EXISTS "Sitters can manage their own availability." ON public.sitter_availability;
CREATE POLICY "Sitters can manage their own availability."
  ON public.sitter_availability FOR ALL
  USING (auth.uid() = sitter_id);

-- Bookings Policies
DROP POLICY IF EXISTS "Users can view bookings they are part of." ON public.bookings;
CREATE POLICY "Users can view bookings they are part of."
  ON public.bookings FOR SELECT
  USING (auth.uid() = client_id OR auth.uid() = sitter_id);
DROP POLICY IF EXISTS "Clients can create bookings." ON public.bookings;
CREATE POLICY "Clients can create bookings."
  ON public.bookings FOR INSERT
  WITH CHECK (auth.uid() = client_id);
DROP POLICY IF EXISTS "Users can update bookings they are part of." ON public.bookings;
CREATE POLICY "Users can update bookings they are part of."
  ON public.bookings FOR UPDATE
  USING (auth.uid() = client_id OR auth.uid() = sitter_id);

-- Children Policies
DROP POLICY IF EXISTS "Parents can view their own children." ON public.children;
CREATE POLICY "Parents can view their own children."
  ON public.children FOR SELECT
  USING (auth.uid() = client_id);
DROP POLICY IF EXISTS "Parents can manage their own children." ON public.children;
CREATE POLICY "Parents can manage their own children."
  ON public.children FOR ALL
  USING (auth.uid() = client_id);

-- Notifications Policies
DROP POLICY IF EXISTS "Users can view their own notifications." ON public.notifications;
CREATE POLICY "Users can view their own notifications."
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update their own notifications." ON public.notifications;
CREATE POLICY "Users can update their own notifications."
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- FCM Tokens Policies
DROP POLICY IF EXISTS "Users can manage their own FCM tokens." ON public.fcm_tokens;
CREATE POLICY "Users can manage their own FCM tokens."
  ON public.fcm_tokens FOR ALL
  USING (auth.uid() = user_id);

-- Chat Messages Policies
DROP POLICY IF EXISTS "Users can view messages in their bookings." ON public.chat_messages;
CREATE POLICY "Users can view messages in their bookings."
  ON public.chat_messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
DROP POLICY IF EXISTS "Users can send messages." ON public.chat_messages;
CREATE POLICY "Users can send messages."
  ON public.chat_messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);
DROP POLICY IF EXISTS "Users can mark messages as read." ON public.chat_messages;
CREATE POLICY "Users can mark messages as read."
  ON public.chat_messages FOR UPDATE
  USING (auth.uid() = receiver_id);

-- Reviews Policies
DROP POLICY IF EXISTS "Reviews are viewable by everyone." ON public.reviews;
CREATE POLICY "Reviews are viewable by everyone."
  ON public.reviews FOR SELECT
  USING (true);
DROP POLICY IF EXISTS "Users can create reviews for bookings they were part of." ON public.reviews;
CREATE POLICY "Users can create reviews for bookings they were part of."
  ON public.reviews FOR INSERT
  WITH CHECK (
    auth.uid() = reviewer_id AND
    EXISTS (
      SELECT 1 FROM public.bookings
      WHERE id = booking_id AND (client_id = auth.uid() OR sitter_id = auth.uid())
    )
  );

-- Verification Requests Policies
DROP POLICY IF EXISTS "Sitters can view their own verification requests." ON public.verification_requests;
DROP POLICY IF EXISTS "Sitters can create/update their own verification requests." ON public.verification_requests;
DROP POLICY IF EXISTS "Users can view their own verification requests." ON public.verification_requests;
DROP POLICY IF EXISTS "Users can create/update their own verification requests." ON public.verification_requests;
DROP POLICY IF EXISTS "Admins can view and manage all verification requests." ON public.verification_requests;

CREATE POLICY "Users can view their own verification requests."
  ON public.verification_requests FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = sitter_id);

CREATE POLICY "Users can create/update their own verification requests."
  ON public.verification_requests FOR ALL
  USING (auth.uid() = user_id OR auth.uid() = sitter_id)
  WITH CHECK (auth.uid() = user_id OR auth.uid() = sitter_id);

CREATE POLICY "Admins can view and manage all verification requests."
  ON public.verification_requests FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Transactions Policies
DROP POLICY IF EXISTS "Users can view their own transactions." ON public.transactions;
CREATE POLICY "Users can view their own transactions."
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Sitter Locations Policies
DROP POLICY IF EXISTS "Users can view locations for their bookings." ON public.sitter_locations;
CREATE POLICY "Users can view locations for their bookings."
  ON public.sitter_locations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings
      WHERE id = booking_id
      AND (client_id = auth.uid() OR sitter_id = auth.uid())
    )
  );
DROP POLICY IF EXISTS "Sitters can insert their own locations." ON public.sitter_locations;
CREATE POLICY "Sitters can insert their own locations."
  ON public.sitter_locations FOR INSERT
  WITH CHECK (auth.uid() = sitter_id);

-- Disputes Policies
DROP POLICY IF EXISTS "Users can view disputes for their bookings." ON public.disputes;
CREATE POLICY "Users can view disputes for their bookings."
  ON public.disputes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings
      WHERE id = booking_id
      AND (client_id = auth.uid() OR sitter_id = auth.uid())
    )
  );
DROP POLICY IF EXISTS "Users can create disputes for their bookings." ON public.disputes;
CREATE POLICY "Users can create disputes for their bookings."
  ON public.disputes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.bookings
      WHERE id = booking_id
      AND (client_id = auth.uid() OR sitter_id = auth.uid())
    )
  );
DROP POLICY IF EXISTS "Users can update disputes for their bookings." ON public.disputes;
CREATE POLICY "Users can update disputes for their bookings."
  ON public.disputes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings
      WHERE id = booking_id
      AND (client_id = auth.uid() OR sitter_id = auth.uid())
    )
  );
DROP POLICY IF EXISTS "Admins can manage all disputes." ON public.disputes;
CREATE POLICY "Admins can manage all disputes."
  ON public.disputes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Support Tickets Policies
DROP POLICY IF EXISTS "Users can view their own support tickets." ON public.support_tickets;
CREATE POLICY "Users can view their own support tickets."
  ON public.support_tickets FOR SELECT
  USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Users can create support tickets." ON public.support_tickets;
CREATE POLICY "Users can create support tickets."
  ON public.support_tickets FOR INSERT
  WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "Users can update their own support tickets." ON public.support_tickets;
CREATE POLICY "Users can update their own support tickets."
  ON public.support_tickets FOR UPDATE
  USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Admins can manage all support tickets." ON public.support_tickets;
CREATE POLICY "Admins can manage all support tickets."
  ON public.support_tickets FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Ticket Messages Policies
DROP POLICY IF EXISTS "Users can view messages for their tickets." ON public.ticket_messages;
CREATE POLICY "Users can view messages for their tickets."
  ON public.ticket_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.support_tickets
      WHERE id = ticket_id AND user_id = auth.uid()
    )
  );
DROP POLICY IF EXISTS "Users can add messages to their tickets." ON public.ticket_messages;
CREATE POLICY "Users can add messages to their tickets."
  ON public.ticket_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.support_tickets
      WHERE id = ticket_id AND user_id = auth.uid()
    )
  );
DROP POLICY IF EXISTS "Admins can manage all ticket messages." ON public.ticket_messages;
CREATE POLICY "Admins can manage all ticket messages."
  ON public.ticket_messages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Payments Policies
DROP POLICY IF EXISTS "Users can view payments for their bookings." ON public.payments;
CREATE POLICY "Users can view payments for their bookings."
  ON public.payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings
      WHERE id = booking_id
      AND (client_id = auth.uid() OR sitter_id = auth.uid())
    )
  );
DROP POLICY IF EXISTS "Users can create payments for their bookings." ON public.payments;
CREATE POLICY "Users can create payments for their bookings."
  ON public.payments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.bookings
      WHERE id = booking_id AND client_id = auth.uid()
    )
  );
DROP POLICY IF EXISTS "Admins can manage all payments." ON public.payments;
CREATE POLICY "Admins can manage all payments."
  ON public.payments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =============================================
-- Audit Log Table
-- =============================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id UUID,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Audit Logs Policies
DROP POLICY IF EXISTS "Only admins can view audit logs." ON public.audit_logs;
CREATE POLICY "Only admins can view audit logs."
  ON public.audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Only admins can insert audit logs." ON public.audit_logs;
CREATE POLICY "Only admins can insert audit logs."
  ON public.audit_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =============================================
-- Storage Buckets
-- =============================================
-- Note: These should be created via the Supabase dashboard or SQL editor
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('verification-docs', 'verification-docs', false);
