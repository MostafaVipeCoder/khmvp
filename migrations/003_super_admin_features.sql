
-- =============================================
-- Super Admin Features Migration
-- =============================================

-- 1. Update profiles table to support admin sub-roles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS admin_role TEXT 
CHECK (admin_role IN ('super_admin', 'client_manager', 'sitter_manager'));

-- 2. Table: Sitter Evaluations (Interviews)
CREATE TABLE IF NOT EXISTS public.sitter_evaluations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sitter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    evaluated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    
    -- Basic info
    interview_date TIMESTAMPTZ,
    punctuality_score INTEGER CHECK (punctuality_score BETWEEN 1 AND 5),
    education_level TEXT,
    age INTEGER,
    secondary_phone TEXT,
    residence_area TEXT,
    nearest_metro TEXT,
    phone_type TEXT,
    marital_status TEXT,
    number_of_children INTEGER,
    current_employment_status TEXT,
    additional_work_notes TEXT,
    
    -- Evaluation questions (weighted scores)
    q1_score INTEGER CHECK (q1_score BETWEEN 0 AND 10),
    q2_score INTEGER CHECK (q2_score BETWEEN 0 AND 10),
    q3_score INTEGER CHECK (q3_score BETWEEN 0 AND 10),
    q4_score INTEGER CHECK (q4_score BETWEEN 0 AND 10),
    q5_score INTEGER CHECK (q5_score BETWEEN 0 AND 10),
    q6_score INTEGER CHECK (q6_score BETWEEN 0 AND 10),
    q7_score INTEGER CHECK (q7_score BETWEEN 0 AND 10),
    q8_score INTEGER CHECK (q8_score BETWEEN 0 AND 10),
    
    -- Open-ended questions
    open_answer_1 TEXT,
    open_answer_2 TEXT,
    open_answer_3 TEXT,
    
    -- Yes/No questions
    has_camera_issue BOOLEAN DEFAULT FALSE,
    camera_issue_notes TEXT,
    
    -- Additional info
    courses TEXT,
    certificates TEXT,
    general_notes TEXT,
    photo_url TEXT,
    
    -- Calculated results
    total_score NUMERIC(5, 2),
    evaluation_percentage NUMERIC(5, 2),
    summary TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Table: Booking Status History
CREATE TABLE IF NOT EXISTS public.booking_status_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
    old_status TEXT,
    new_status TEXT NOT NULL,
    changed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    notes TEXT,
    attachments JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Update bookings table to support new statuses and additional fields
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS payment_screenshot_url TEXT,
ADD COLUMN IF NOT EXISTS feedback_screenshot_url TEXT,
ADD COLUMN IF NOT EXISTS assigned_sitter_code TEXT;

-- Enable RLS on new tables
ALTER TABLE public.sitter_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_status_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Sitter Evaluations
DROP POLICY IF EXISTS "Admins can manage sitter evaluations." ON public.sitter_evaluations;
CREATE POLICY "Admins can manage sitter evaluations."
  ON public.sitter_evaluations FOR ALL
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

-- RLS Policies for Booking Status History
DROP POLICY IF EXISTS "Admins can manage booking status history." ON public.booking_status_history;
CREATE POLICY "Admins can manage booking status history."
  ON public.booking_status_history FOR ALL
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

-- Also allow users involved in the booking to view history
DROP POLICY IF EXISTS "Users can view booking status history for their bookings." ON public.booking_status_history;
CREATE POLICY "Users can view booking status history for their bookings."
  ON public.booking_status_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings
      WHERE id = booking_id AND (client_id = auth.uid() OR sitter_id = auth.uid())
    )
  );
