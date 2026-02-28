-- Add Admin Role System and Enhanced Security Policies
-- This migration adds admin functionality to the users table and admin-only access policies

-- Add role column to users table (defaults to 'user')
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- Create index on role for faster queries
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- Add comment for documentation
COMMENT ON COLUMN public.users.role IS 'User role: user or admin. Admins can view and manage waitlist entries.';

---
--- WAITLIST POLICIES - Add missing operations
---

-- Allow authenticated users to delete their own waitlist entry (by email match)
CREATE POLICY IF NOT EXISTS "Users can delete their waitlist entry" ON public.waitlist_entries
  FOR DELETE
  USING (
    auth.uid() IS NOT NULL AND
    email = (SELECT email FROM public.users WHERE id = auth.uid())
  );

-- Allow admins to view all waitlist entries
CREATE POLICY IF NOT EXISTS "Admins can view all entries" ON public.waitlist_entries
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = auth.uid() 
      AND u.role = 'admin'
    )
  );

-- Allow admins to update waitlist entries (e.g., mark as contacted/converted)
CREATE POLICY IF NOT EXISTS "Admins can update waitlist entries" ON public.waitlist_entries
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = auth.uid() 
      AND u.role = 'admin'
    )
  );

-- Allow admins to delete waitlist entries (for data cleanup)
CREATE POLICY IF NOT EXISTS "Admins can delete waitlist entries" ON public.waitlist_entries
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = auth.uid() 
      AND u.role = 'admin'
    )
  );

---
--- USERS POLICIES - Add admin access policies
---

-- Allow admins to view all user profiles (for user management)
CREATE POLICY IF NOT EXISTS "Admins can view all users" ON public.users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = auth.uid() 
      AND u.role = 'admin'
    )
  ) OR (auth.uid() = id);  -- OR allow viewing own profile

-- Allow admins to update other user profiles (for support/moderation)
CREATE POLICY IF NOT EXISTS "Admins can update user profiles" ON public.users
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = auth.uid() 
      AND u.role = 'admin'
    )
  );

-- Add trigger to prevent non-admins from changing the role column
CREATE OR REPLACE FUNCTION prevent_role_elevation()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if user is trying to change their own role to admin
  IF NEW.role != OLD.role AND NEW.role = 'admin' THEN
    -- Only allow if user is already an admin
    IF NOT EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = auth.uid() 
      AND u.role = 'admin'
    ) THEN
      RAISE EXCEPTION 'Insufficient permissions to change user role';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to prevent privilege escalation
DROP TRIGGER IF EXISTS prevent_role_escalation ON public.users;
CREATE TRIGGER prevent_role_escalation
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION prevent_role_elevation();

-- Add helpful comment for documentation
COMMENT ON TABLE public.waitlist_entries IS 'Stores waitlist signups. Admins can view and manage entries. Authenticated users can delete their own entries.';
