-- Migration to update verification_requests table
-- Adds user_id, rejection_reason, reviewed_by, reviewed_at columns
-- Makes sitter_id optional
-- Adds check constraint

-- Step 1: Add new columns
ALTER TABLE verification_requests 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE verification_requests 
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

ALTER TABLE verification_requests 
ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE verification_requests 
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

-- Step 2: Migrate existing sitter_id to user_id
UPDATE verification_requests 
SET user_id = sitter_id 
WHERE user_id IS NULL AND sitter_id IS NOT NULL;

-- Step 3: Make sitter_id optional (remove NOT NULL constraint)
ALTER TABLE verification_requests 
ALTER COLUMN sitter_id DROP NOT NULL;

-- Step 4: Add check constraint
ALTER TABLE verification_requests 
ADD CONSTRAINT IF NOT EXISTS chk_user_or_sitter 
CHECK (user_id IS NOT NULL OR sitter_id IS NOT NULL);

-- Step 5: Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_verification_requests_user_id ON verification_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_sitter_id ON verification_requests(sitter_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_status ON verification_requests(status);

-- Step 6: Update RLS policies
DROP POLICY IF EXISTS "Sitters can view their own verification requests." ON verification_requests;
DROP POLICY IF EXISTS "Sitters can create/update their own verification requests." ON verification_requests;
DROP POLICY IF EXISTS "Users can view their own verification requests." ON verification_requests;
DROP POLICY IF EXISTS "Users can create/update their own verification requests." ON verification_requests;
DROP POLICY IF EXISTS "Admins can view and manage all verification requests." ON verification_requests;

CREATE POLICY "Users can view their own verification requests."
  ON verification_requests FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = sitter_id);

CREATE POLICY "Users can create/update their own verification requests."
  ON verification_requests FOR ALL
  USING (auth.uid() = user_id OR auth.uid() = sitter_id)
  WITH CHECK (auth.uid() = user_id OR auth.uid() = sitter_id);

CREATE POLICY "Admins can view and manage all verification requests."
  ON verification_requests FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
