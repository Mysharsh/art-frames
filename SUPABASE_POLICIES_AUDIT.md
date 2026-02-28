# Supabase Policies Audit Report

**Date:** February 28, 2026  
**Repository:** art-frames  
**Status:** ✅ RLS Enabled on All Tables

---

## 📋 Executive Summary

Your Supabase implementation has Row Level Security (RLS) enabled on all tables with clearly defined policies. The current configuration supports public waitlist signups while protecting user profile data from unauthorized access.

---

## 🔐 Current Policies by Table

### 1. **waitlist_entries** Table

**RLS Status:** ✅ Enabled  
**Location:** [scripts/001_create_tables.sql](scripts/001_create_tables.sql)

| Policy Name | Operation | Condition | Access |
|---|---|---|---|
| "Anyone can join waitlist" | INSERT | `true` | ✅ Public (anyone can insert) |
| "Anyone can view waitlist count" | SELECT | `false` | ❌ Disabled (no one can select) |

**Purpose:** Allow public waitlist signups while preventing data exposure.

**Constraints:**
- **Unique:** `(email, product_id)` - prevents duplicate signups for same product
- **Email Validation:** Database-level regex check: `^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$`

**Indexes:**
- `idx_waitlist_email` - for email lookups
- `idx_waitlist_product` - for product filtering
- `idx_waitlist_created_at` - for sorting by date
- `idx_waitlist_product_created` - for common queries (product + date)
- `idx_waitlist_email_unique` - for unique constraint performance

**Audit Trail:** `updated_at` column with automatic trigger to track modifications

---

### 2. **users** Table

**RLS Status:** ✅ Enabled  
**Location:** [scripts/003_create_users_table.sql](scripts/003_create_users_table.sql)

| Policy Name | Operation | Condition | Access |
|---|---|---|---|
| "Users can view own profile" | SELECT | `auth.uid() = id` | ✅ Own profile only |
| "Users can update own profile" | UPDATE | `auth.uid() = id` | ✅ Own profile only |

**Purpose:** Protect user profile data while allowing self-management.

**Features:**
- Synced with Supabase Auth via trigger `on_auth_user_created()`
- Auto-updates `updated_at` timestamp on modification
- Stores: `id`, `email`, `full_name`, `avatar_url`
- Foreign key reference to `auth.users(id)` with ON DELETE CASCADE

**Indexes:**
- `idx_users_email` - for email lookups
- `idx_users_created_at` - for sorting by registration date

---

## ⚠️ Critical Issues & Recommendations

### 🔴 **CRITICAL: Waitlist Count Display Always Returns 0**
**Status:** 🔴 CRITICAL - Affects User Experience  
**Location:** [app/api/waitlist/route.ts](app/api/waitlist/route.ts) (GET handler)  
**Issue:** The `"Anyone can view waitlist count"` SELECT policy is set to `USING (false)`, which blocks ALL reads. The API endpoint tries to fetch the count but silently fails and returns 0 to all users.

**Current Code Behavior:**
```typescript
// Attempts to read count but fails silently due to RLS
const { count, error } = await supabase
  .from("waitlist_entries")
  .select("*", { count: "exact", head: true })

// Returns 0 if policy blocks access (which it does)
return NextResponse.json({ count: count || 0 })
```

**Impact:**
- ❌ User-facing waitlist count always shows 0 on homepage
- ⚠️ No transparency to users about product interest
- ✅ Safe from data leakage standpoint

**Recommendation:**
```sql
-- Allow public to view only count (HEAD request returns count but no data)
DROP POLICY "Anyone can view waitlist count" ON public.waitlist_entries;

CREATE POLICY "Anyone can view waitlist count" ON public.waitlist_entries
  FOR SELECT
  USING (true);  -- Changed from false to true
```

**Why This Works:**
- Using `.select("*", { count: "exact", head: true })` with `head: true` means no actual row data is returned
- Only the count metadata is exposed
- No email addresses or sensitive data is leaked
- Users see accurate interest metrics

---

### 2. **No Read-All Policy for Administrators**
**Status:** ⚠️ Limited admin capabilities  
**Issue:** With the fix above, admin dashboard would still need explicit policy for viewing individual entries.

**Recommendation:**
```sql
-- Add policy for service role (required for analytics via service_role)
CREATE POLICY "Service role can view all entries" ON public.waitlist_entries
  FOR SELECT
  USING (auth.jwt()::jsonb->>'role' = 'service_role');
```

Or for auth-based admin dashboards:
```sql
-- Only if you create an admin role system
CREATE POLICY "Admins can view all entries" ON public.waitlist_entries
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = auth.uid() 
      AND u.role = 'admin'
    )
  );
```
*Note: Requires adding `role` column to `users` table.*

---

### 3. **No Delete Policy for Users**
**Status:** ⚠️ Users cannot delete their own accounts  
**Issue:** INSERT/UPDATE allowed but no DELETE policy for users table.

**Recommendation:**
```sql
-- Allow users to delete their own profile
CREATE POLICY "Users can delete own profile"
  ON public.users
  FOR DELETE
  USING (auth.uid() = id);
```

---

### 4. **Waitlist No Update/Delete Capability**
**Status:** ⚠️ Limited data management  
**Issue:** Users cannot modify or remove their waitlist entries.

**Recommendation:**
```sql
-- Allow users to remove their waitlist entry
CREATE POLICY "Users can delete their waitlist entry" ON public.waitlist_entries
  FOR DELETE
  USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.email = waitlist_entries.email
    )
  );

-- Allow admins to update entries for support
CREATE POLICY "Admins can update waitlist entries" ON public.waitlist_entries
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );
```
*Note: Requires `role` column in `users` table.*

---

### 5. **Missing Service Role Policies**
**Status:** ℹ️ Informational  
**Issue:** Server-side operations use `NEXT_PUBLIC_SUPABASE_ANON_KEY`, which respects RLS. Functions/triggers using `SECURITY DEFINER` bypass RLS (working as intended for user creation).

**Current Implementation:**
- ✅ `handle_new_user()` - uses `SECURITY DEFINER` to bypass RLS on user creation
- ✅ `update_updated_at_column()` - uses default security (respects RLS)

---

## 🔍 Security Checklist

| Item | Status | Notes |
|---|---|---|
| RLS Enabled on All Tables | ✅ Yes | Both `waitlist_entries` and `users` |
| Key Foreign Key Constraints | ✅ Yes | `users.id` → `auth.users(id)` with CASCADE |
| Email Validation | ✅ Yes | Database-level regex check on `waitlist_entries` |
| Unique Constraints | ✅ Yes | `(email, product_id)` prevents duplicates |
| Audit Timestamps | ✅ Partial | `updated_at` on both tables, but `created_at` immutable |
| Auth Integration | ✅ Yes | OAuth via Google/GitHub, user sync on signup |
| Anonymous Access | ✅ Controlled | Waitlist INSERT allowed, SELECT restricted |
| Authenticated Access | ✅ Proper | Users can only access own profile |
| Admin Role System | ❌ Missing | No role column in `users` table |
| Policy Testing | ❓ Unknown | Check against test suite |

---

## 📊 Quick Policy Statistics

- **Tables with RLS:** 2/2 (100%)
- **Total Policies:** 4
- **Public Write Access:** 1 (waitlist insert)
- **Public Read Access:** 0
- **Authenticated Access:** 2 (user profile read/update)
- **Missing Admin Policies:** 2 (recommended additions)

---

---

## 🚀 Implementation Priority

**Priority 1 - CRITICAL BUG FIX:**
1. ✅ Fix waitlist count display by changing SELECT policy from `USING (false)` to `USING (true)`
   - Single-line change in [scripts/001_create_tables.sql](scripts/001_create_tables.sql)
   - Or apply migration: `ALTER POLICY "Anyone can view waitlist count" ON public.waitlist_entries USING (true);`
   - This fixes the zero-count display bug without leaking any data

**Priority 2 - Security Hardening:**
1. Add DELETE policy for `users` table (allows profile deletion)
2. Add READ policy for admins to access waitlist data

**Priority 3 - User Experience:**
1. Add DELETE policy for waitlist entries (user self-service removal)
2. Add UPDATE policy for user profile (if bio/status fields added)

**Priority 4 - Administration:**
1. Create `admin` role system in `users` table
2. Build admin-only policies for analytics/exports

---

## 🔗 Related Files

- Migration Scripts: [scripts/](scripts/)
  - [001_create_tables.sql](scripts/001_create_tables.sql) - Waitlist table & policies
  - [002_enhance_waitlist_table.sql](scripts/002_enhance_waitlist_table.sql) - Constraints & indexes
  - [003_create_users_table.sql](scripts/003_create_users_table.sql) - Users table & policies

- Supabase Client Code: [lib/supabase/](lib/supabase/)
  - [client.ts](lib/supabase/client.ts) - Browser client
  - [server.ts](lib/supabase/server.ts) - Server client
  - [auth.ts](lib/supabase/auth.ts) - Auth functions

---

## ✅ Conclusion

Your current Supabase policies provide **solid foundational security** with one critical bug that needs immediate fixing:

**🔴 CRITICAL BUG:** The waitlist count display always shows 0 due to overly-restrictive SELECT policy. This is a **one-line fix** that restores the feature without compromising security.

**Strengths:**
- ✅ Proper RLS implementation on all tables
- ✅ Public waitlist access with data validation
- ✅ Protected user profiles (auth-only)
- ✅ Automatic user sync on signup
- ✅ Rate limiting and input validation

**Immediate Action Required:**
Update [scripts/001_create_tables.sql](scripts/001_create_tables.sql) line ~20 to change `USING (false)` to `USING (true)` in the waitlist count policy, or apply the migration via Supabase dashboard.

**Next Steps:** 
1. Fix the critical waitlist count bug (Priority 1)
2. Implement Priority 2-4 recommendations based on your roadmap
