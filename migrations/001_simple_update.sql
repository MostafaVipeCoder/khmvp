-- Step 1: Add user_id column
ALTER TABLE verification_requests ADD COLUMN user_id UUID REFERENCES profiles(id) ON DELETE CASCADE;

-- Step 2: Add rejection_reason
ALTER TABLE verification_requests ADD COLUMN rejection_reason TEXT;

-- Step 3: Add reviewed_by
ALTER TABLE verification_requests ADD COLUMN reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- Step 4: Add reviewed_at
ALTER TABLE verification_requests ADD COLUMN reviewed_at TIMESTAMPTZ;

-- Step 5: Migrate sitter_id to user_id
UPDATE verification_requests SET user_id = sitter_id WHERE user_id IS NULL AND sitter_id IS NOT NULL;

-- Step 6: Drop NOT NULL from sitter_id
ALTER TABLE verification_requests ALTER COLUMN sitter_id DROP NOT NULL;

-- Step 7: Add indexes
CREATE INDEX idx_verification_requests_user_id ON verification_requests(user_id);
CREATE INDEX idx_verification_requests_sitter_id ON verification_requests(sitter_id);
CREATE INDEX idx_verification_requests_status ON verification_requests(status);

-- Step 8: Update RLS policies
DROP POLICY IF EXISTS "Sitters can view their own verification requests." ON verification_requests;
DROP POLICY IF EXISTS "Sitters can create/update their own verification requests." ON verification_requests;

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
