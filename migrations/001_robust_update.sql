-- Step 1: Add user_id column (without constraint first)
ALTER TABLE verification_requests ADD COLUMN IF NOT EXISTS user_id UUID;

-- Step 2: Add rejection_reason
ALTER TABLE verification_requests ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Step 3: Add reviewed_by
ALTER TABLE verification_requests ADD COLUMN IF NOT EXISTS reviewed_by UUID;

-- Step 4: Add reviewed_at
ALTER TABLE verification_requests ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

-- Step 5: Now add the foreign key constraint (IF NOT EXISTS only works in PG 12+, so we'll try to add safely)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'verification_requests_user_id_fkey'
  ) THEN
    ALTER TABLE verification_requests ADD CONSTRAINT verification_requests_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Step 6: Migrate sitter_id to user_id
UPDATE verification_requests SET user_id = sitter_id WHERE user_id IS NULL AND sitter_id IS NOT NULL;

-- Step 7: Drop NOT NULL from sitter_id (if it's currently NOT NULL)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'verification_requests' 
      AND column_name = 'sitter_id' 
      AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE verification_requests ALTER COLUMN sitter_id DROP NOT NULL;
  END IF;
END $$;

-- Step 8: Add indexes (if not exists)
CREATE INDEX IF NOT EXISTS idx_verification_requests_user_id ON verification_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_sitter_id ON verification_requests(sitter_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_status ON verification_requests(status);

-- Step 9: Update RLS policies
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
