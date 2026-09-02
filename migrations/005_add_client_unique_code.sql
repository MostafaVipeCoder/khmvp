-- Migration: Add client_unique_code column to profiles table

-- Add the column, allow NULL initially
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS client_unique_code TEXT UNIQUE;

-- Create a function to generate unique client codes
CREATE OR REPLACE FUNCTION generate_client_unique_code()
RETURNS TEXT AS $$
DECLARE
    new_code TEXT;
    exists_code BOOLEAN;
BEGIN
    LOOP
        -- Generate a code like "CLI-XXXXXX" where X is a random uppercase letter or digit
        new_code := 'CLI-' || upper(substring(md5(random()::text), 1, 6));
        
        -- Check if code exists
        SELECT EXISTS (
            SELECT 1 FROM public.profiles WHERE client_unique_code = new_code
        ) INTO exists_code;
        
        -- Exit loop if code is unique
        EXIT WHEN NOT exists_code;
    END LOOP;
    
    RETURN new_code;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- Update existing client profiles to have a unique code
UPDATE public.profiles 
SET client_unique_code = generate_client_unique_code()
WHERE role = 'client' AND client_unique_code IS NULL;

-- Create a trigger to automatically assign a code to new clients
CREATE OR REPLACE FUNCTION assign_client_unique_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.role = 'client' AND NEW.client_unique_code IS NULL THEN
        NEW.client_unique_code := generate_client_unique_code();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_assign_client_unique_code ON public.profiles;
CREATE TRIGGER trigger_assign_client_unique_code
BEFORE INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION assign_client_unique_code();
