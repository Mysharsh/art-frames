# Supabase RLS Migration Deployment Guide

**Status:** Ready for Deployment  
**Date:** February 28, 2026  
**Repository:** Mysharsh/art-frames

---

## 🚀 Deployment Instructions

Your RLS policy changes are committed and ready to deploy to Supabase. Follow one of the methods below based on your setup:

---

## Option 1: Supabase Dashboard (Recommended for Quick Testing)

### Step 1: Access Supabase SQL Editor
1. Log in to [https://app.supabase.com](https://app.supabase.com)
2. Select your **art-frames** project
3. Navigate to **SQL Editor** (left sidebar)
4. Click **New Query**

### Step 2: Apply Migration 001 Fix (Critical Bug Fix)
**File:** `scripts/001_create_tables.sql`

Copy and paste this into the SQL Editor:
```sql
-- Fix critical waitlist count bug (already committed)
DROP POLICY "Anyone can view waitlist count" ON public.waitlist_entries;

CREATE POLICY "Anyone can view waitlist count" ON public.waitlist_entries
  FOR SELECT USING (true);
```

**Click "Run"** to apply

**Expected Result:**
```
✓ Successfully dropped policy
✓ Successfully created policy
```

### Step 3: Apply Migration 003 Update (User Deletion)
**File:** `scripts/003_create_users_table.sql`

Copy and paste:
```sql
-- Add DELETE policy for users (self-service account deletion)
CREATE POLICY IF NOT EXISTS "Users can delete own profile"
  ON public.users
  FOR DELETE
  USING (auth.uid() = id);
```

**Click "Run"** to apply

**Expected Result:**
```
✓ Successfully created policy
```

### Step 4: Apply Migration 004 (Admin System)
**File:** `scripts/004_add_admin_policies.sql`

Copy the **entire file content** from [scripts/004_add_admin_policies.sql](../scripts/004_add_admin_policies.sql) and paste into SQL Editor.

**Click "Run"** to apply all at once

**Expected Result:**
```
✓ Successfully added role column
✓ Successfully created 4 admin policies on waitlist_entries
✓ Successfully created 2 admin policies on users  
✓ Successfully created role prevention trigger
```

---

## Option 2: Supabase CLI (Best for CI/CD Integration)

### Prerequisites
```bash
npm install supabase@latest --save-dev
# or
pnpm add -D supabase
```

### Step 1: Link Your Project
```bash
npx supabase link --project-ref <your-project-ref>
```

Find your project ref at: https://app.supabase.com/project/_/settings/general

### Step 2: Create Migration from Existing Code
```bash
npx supabase migration new fix_rls_policies
```

This creates: `supabase/migrations/<timestamp>_fix_rls_policies.sql`

### Step 3: Copy Migration Content
Paste the content of all three migrations into the newly created file:

```sql
-- Migration: Fix RLS Policies and Add Admin System
-- Date: 2026-02-28

-- ===========================================================
-- MIGRATION 001: Fix Waitlist Count Bug
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

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' 
CHECK (role IN ('user', 'admin'));

CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

COMMENT ON COLUMN public.users.role IS 'User role: user or admin. Admins can view and manage waitlist entries.';

-- Waitlist policies
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

-- User policies
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

-- Privilege escalation prevention
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

COMMENT ON TABLE public.waitlist_entries IS 'Stores waitlist signups. Admins can view and manage entries. Authenticated users can delete their own entries.';
```

### Step 4: Deploy Migration
```bash
npx supabase db push
```

This will:
- Apply migration to your linked Supabase project
- Create local migration file for version control
- Sync your local schema with remote

### Step 5: Verify Deployment
```bash
npx supabase db remote set <your-project-ref>
npx supabase db pull  # Pulls current remote schema to local
```

---

## Option 3: Vercel (If Deployed via Vercel)

### Using Vercel Environment Variables + Supabase

If you have Vercel deployed, you can trigger the migrations:

```bash
# 1. Install Supabase CLI
npm install -g supabase

# 2. Authenticate with your personal token
supabase login

# 3. Push migrations
supabase db push --project-ref <your-project-ref>
```

---

## ✅ Post-Deployment Verification

### 1. Verify Policies Were Created
Run in Supabase SQL Editor:

```sql
-- Check waitlist policies
SELECT policyname, qual, with_check 
FROM pg_policies 
WHERE tablename = 'waitlist_entries'
ORDER BY policyname;

-- Check users policies  
SELECT policyname, qual, with_check 
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;
```

**Expected Result (8 policies per table):**
```
waitlist_entries:
✓ No one (system policy)
✓ Anyone can join waitlist (INSERT)
✓ Anyone can view waitlist count (SELECT)  ← FIXED
✓ Users can delete their waitlist entry (DELETE)
✓ Admins can view all entries (SELECT)
✓ Admins can update waitlist entries (UPDATE)
✓ Admins can delete waitlist entries (DELETE)

users:
✓ No one (system policy)
✓ Users can view own profile (SELECT)
✓ Users can update own profile (UPDATE)
✓ Users can delete own profile (DELETE)  ← NEW
✓ Admins can view all users (SELECT)
✓ Admins can update user profiles (UPDATE)
```

### 2. Verify Role Column Was Added
```sql
-- Check users table structure
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;
```

**Expected Result:**
```
✓ role TEXT DEFAULT 'user'::text
```

### 3. Test Waitlist Count Endpoint
```bash
# Should return actual count instead of 0
curl https://your-domain.com/api/waitlist

# Expected response:
# { "count": 5 }  (or your actual number)
```

### 4. Test Admin Access (Optional)
```sql
-- Set yourself as admin
UPDATE public.users SET role = 'admin' 
WHERE email = 'your-email@example.com';

-- Verify you can read all waitlist entries
SELECT COUNT(*) FROM public.waitlist_entries;
```

---

## 🔍 Troubleshooting

### Issue: "Policy already exists" Error
**Solution:** The migrations use `CREATE POLICY IF NOT EXISTS`, so re-running is safe. If you get an error about double-creation:
- Go to **Policies** tab in Supabase SQL Editor
- Manually delete the duplicate policy
- Re-run the migration

### Issue: "Function prevent_role_elevation already exists" Error
**Solution:** The migration uses `CREATE OR REPLACE FUNCTION`, which handles updates. If you still get an error:
```sql
DROP TRIGGER IF EXISTS prevent_role_escalation ON public.users;
DROP FUNCTION IF EXISTS prevent_role_elevation();

-- Then re-run migration 004
```

### Issue: Waitlist Count Still Shows 0
**Solution:** 
1. Verify policy change by running verification SQL above
2. Clear browser cache (Cloudflare/CDN might cache old response)
3. Test with `curl` to bypass cache:
   ```bash
   curl -H "Cache-Control: no-cache" https://your-domain.com/api/waitlist
   ```

### Issue: Admin Access Not Working
**Solution:**
1. Verify user was promoted:
   ```sql
   SELECT id, email, role FROM public.users WHERE email = 'your-email@example.com';
   ```
2. Log out and log back in (session token needs refresh)
3. Check browser console for Supabase client errors

---

## 📋 Migration Checklist

- [ ] **Migration 001 Applied:** Waitlist count SELECT policy fixed (USING: false → true)
- [ ] **Migration 003 Applied:** User DELETE policy added
- [ ] **Migration 004 Applied:** Admin role system (role column, 6 new policies, privilege prevention)
- [ ] **Policies Verified:** All 8+ policies show in `pg_policies` query
- [ ] **Role Column Added:** `public.users.role` exists with default 'user'
- [ ] **Waitlist Count Tests:** API returns non-zero count
- [ ] **Admin Testing:** At least one admin user created and tested

---

## 📞 Support

If you encounter issues:

1. **Check Supabase Status:** https://status.supabase.com
2. **Review Error Logs:** Supabase dashboard → Logs tab
3. **Test in SQL Editor:** Run individual statements to isolate errors
4. **Ask Supabase Support:** https://supabase.com/docs/guides/getting-help

---

## 🎯 Next Steps After Deployment

1. **Promote an Admin User:**
   ```sql
   UPDATE public.users SET role = 'admin' WHERE email = 'your-email@example.com';
   ```

2. **Build Admin Dashboard** (Optional):
   - Create `/app/admin/waitlist/page.tsx` to view all signups
   - Add `/app/admin/users/page.tsx` for user management
   - Protect routes with `role = 'admin'` check

3. **User Account Deletion UI** (Optional):
   - Add "Delete Account" button in user settings
   - Call `/api/users/[id]/delete` endpoint with `DELETE` method
   - Show confirmation modal before deletion

4. **Enable Audit Logging** (Advanced):
   - Create `audit_logs` table
   - Add trigger to track admin actions
   - Use for compliance/support purposes

---

## 📚 Reference

- **Audit Document:** [SUPABASE_POLICIES_AUDIT.md](../SUPABASE_POLICIES_AUDIT.md)
- **Implementation Guide:** [SUPABASE_RLS_IMPLEMENTATION.md](../SUPABASE_RLS_IMPLEMENTATION.md)
- **Migration Files:**
  - [scripts/001_create_tables.sql](../scripts/001_create_tables.sql)
  - [scripts/003_create_users_table.sql](../scripts/003_create_users_table.sql)
  - [scripts/004_add_admin_policies.sql](../scripts/004_add_admin_policies.sql)

**Current Commit:** `13b9c7d` (main branch)
