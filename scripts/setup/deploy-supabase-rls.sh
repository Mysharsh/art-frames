#!/bin/bash

# Supabase RLS Migration Deployment Script
# This script helps apply RLS policy migrations to your Supabase project
# Usage: chmod +x deploy-supabase-rls.sh && ./deploy-supabase-rls.sh

set -e

echo "🚀 Supabase RLS Migration Deployment Tool"
echo "=========================================="
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Installing..."
    npm install -g supabase
    echo "✅ Supabase CLI installed"
fi

# Check if user is authenticated
if [ ! -d "$HOME/.supabase" ]; then
    echo "⚠️  Not authenticated with Supabase"
    echo ""
    echo "Steps to authenticate:"
    echo "1. Run: supabase login"
    echo "2. Create a personal access token at: https://app.supabase.com/account/tokens"
    echo "3. Paste the token when prompted"
    echo ""
    echo "After authenticating, run this script again."
    exit 1
fi

echo "✅ Supabase CLI authenticated"
echo ""

# Get project ref
echo "📋 Available Projects:"
supabase projects list

echo ""
echo "Enter your project reference (found in Supabase Settings > General)"
read -p "Project Ref: " PROJECT_REF

if [ -z "$PROJECT_REF" ]; then
    echo "❌ Project ref is required"
    exit 1
fi

# Link project
echo ""
echo "🔗 Linking to project: $PROJECT_REF"
supabase link --project-ref "$PROJECT_REF"

echo "✅ Project linked"
echo ""

# Create migration
TIMESTAMP=$(date +%s)
MIGRATION_FILE="supabase/migrations/${TIMESTAMP}_fix_rls_policies.sql"

echo "📝 Creating migration file: $MIGRATION_FILE"

mkdir -p supabase/migrations

cat > "$MIGRATION_FILE" << 'EOF'
-- Migration: Fix RLS Policies and Add Admin System
-- Date: 2026-02-28
-- Description: Fix critical waitlist count bug, add user deletion, implement admin role system

-- ===========================================================
-- MIGRATION 001: Fix Waitlist Count Bug (CRITICAL)
-- ===========================================================

DROP POLICY IF EXISTS "Anyone can view waitlist count" ON public.waitlist_entries;

CREATE POLICY "Anyone can view waitlist count" ON public.waitlist_entries
  FOR SELECT USING (true);

-- ===========================================================
-- MIGRATION 003: Add User Deletion
-- ===========================================================

CREATE POLICY IF NOT EXISTS "Users can delete own profile"
  ON public.users
  FOR DELETE
  USING (auth.uid() = id);

-- ===========================================================
-- MIGRATION 004: Add Admin Role System
-- ===========================================================

-- Add role column
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' 
CHECK (role IN ('user', 'admin'));

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- Add comment
COMMENT ON COLUMN public.users.role IS 'User role: user or admin. Admins can view and manage waitlist entries.';

-- ===========================================================
-- Waitlist Policies
-- ===========================================================

CREATE POLICY IF NOT EXISTS "Users can delete their waitlist entry" ON public.waitlist_entries
  FOR DELETE
  USING (
    auth.uid() IS NOT NULL AND
    email = (SELECT email FROM public.users WHERE id = auth.uid())
  );

CREATE POLICY IF NOT EXISTS "Admins can view all entries" ON public.waitlist_entries
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = auth.uid() 
      AND u.role = 'admin'
    )
  );

CREATE POLICY IF NOT EXISTS "Admins can update waitlist entries" ON public.waitlist_entries
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = auth.uid() 
      AND u.role = 'admin'
    )
  );

CREATE POLICY IF NOT EXISTS "Admins can delete waitlist entries" ON public.waitlist_entries
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = auth.uid() 
      AND u.role = 'admin'
    )
  );

-- ===========================================================
-- User Policies
-- ===========================================================

CREATE POLICY IF NOT EXISTS "Admins can view all users" ON public.users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = auth.uid() 
      AND u.role = 'admin'
    )
  ) OR (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Admins can update user profiles" ON public.users
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = auth.uid() 
      AND u.role = 'admin'
    )
  );

-- ===========================================================
-- Privilege Escalation Prevention
-- ===========================================================

CREATE OR REPLACE FUNCTION prevent_role_elevation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role != OLD.role AND NEW.role = 'admin' THEN
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

DROP TRIGGER IF EXISTS prevent_role_escalation ON public.users;
CREATE TRIGGER prevent_role_escalation
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION prevent_role_elevation();

-- ===========================================================
-- Documentation
-- ===========================================================

COMMENT ON TABLE public.waitlist_entries IS 'Stores waitlist signups. Admins can view and manage entries. Authenticated users can delete their own entries.';
EOF

echo "✅ Migration file created"
echo ""

# Push migration
echo "📤 Deploying migration to Supabase..."
supabase db push

echo ""
echo "✅ Migration deployed successfully!"
echo ""

# Verify deployment
echo "🔍 Verifying deployment..."
echo ""
echo "Checking policies..."

# Try to read the policies (this would require SQL access which we don't have in bash)
echo "✅ To verify policies were created, run in Supabase SQL Editor:"
echo ""
echo "SELECT policyname FROM pg_policies WHERE tablename = 'waitlist_entries' ORDER BY policyname;"
echo ""
echo "SELECT policyname FROM pg_policies WHERE tablename = 'users' ORDER BY policyname;"
echo ""

echo "🎉 Deployment Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Verify policies in Supabase dashboard (SQL Editor)"
echo "2. Promote an admin user:"
echo "   UPDATE public.users SET role = 'admin' WHERE email = 'your-email@example.com';"
echo "3. Test waitlist count: curl https://your-domain.com/api/waitlist"
echo ""
echo "📚 Documentation: See SUPABASE_MIGRATION_DEPLOYMENT.md for details"
