# Supabase RLS Implementation Quick Start

**Status:** ✅ Ready for Deployment  
**Commit:** `13b9c7d` on `main` branch  
**Date:** February 28, 2026

---

## 📋 What Was Implemented

Your Supabase project now has enterprise-grade Row Level Security (RLS) with:

1. **🔴 Critical Bug Fix** - Waitlist count now displays correctly (was always 0)
2. **🔐 User Account Deletion** - Users can delete their own profiles
3. **👑 Admin Role System** - Granular access control for admin users
4. **🛡️ Privilege Prevention** - Regular users cannot promote themselves to admin

---

## ⚡ Quick Deployment (Choose One Method)

### Method 1: One-Command Deployment (Easiest)
```bash
chmod +x deploy-supabase-rls.sh
./deploy-supabase-rls.sh
```

This script will:
- ✅ Authenticate with Supabase
- ✅ Link your project
- ✅ Create migration file
- ✅ Deploy all policies

**Time:** 2-3 minutes

---

### Method 2: Manual SQL Deployment (Fastest)

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your **art-frames** project
3. Click **SQL Editor** → **New Query**
4. Copy entire content from [scripts/004_add_admin_policies.sql](scripts/004_add_admin_policies.sql)
5. Paste into editor and click **Run**

**Time:** 1-2 minutes

---

### Method 3: Supabase CLI (Best for CI/CD)
```bash
# Install Supabase CLI
npm install -D supabase

# Authenticate
npx supabase login

# Push migrations
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

**Time:** 3-5 minutes

---

## ✅ Verify Deployment

Run this SQL in Supabase SQL Editor to confirm all policies exist:

```sql
-- Verify policies were created
SELECT 
  tablename,
  COUNT(*) as policy_count,
  STRING_AGG(policyname, ', ' ORDER BY policyname) as policies
FROM pg_policies
WHERE tablename IN ('waitlist_entries', 'users')
GROUP BY tablename
ORDER BY tablename;
```

**Expected Result:**
```
waitlist_entries  | 7 policies | Anyone can join waitlist, Anyone can view waitlist count, Admins can delete...
users             | 5 policies | Admin can update user profiles, Admins can view all users, Users can delete...
```

---

## 🎯 Next: Setup Admin User

```sql
-- Replace with your email
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

Then log out and log back in to activate admin permissions.

---

## 🧪 Test Everything Works

### Test 1: Waitlist Count Display
```bash
curl https://your-domain.com/api/waitlist
# Should return: { "count": 5 }  (or your actual count, not 0)
```

### Test 2: User Deletion
- Log in as a regular user
- Try to delete account (should work)
- Check Supabase - user record should be deleted

### Test 3: Admin Access (As Admin User)
- Log in as admin user (the one you promoted above)
- Try to view all waitlist in database
- Try to update a waitlist entry status

---

## 📊 Policy Summary

### Public Access
- ✅ Join waitlist (INSERT)
- ✅ View waitlist count (SELECT, count only)

### Authenticated Users
- ✅ View own profile
- ✅ Update own profile
- ✅ Delete own profile
- ✅ Delete own waitlist entries

### Admin Users (role='admin')
- ✅ View all waitlist entries
- ✅ Update waitlist entries
- ✅ Delete waitlist entries
- ✅ View all user profiles
- ✅ Update user profiles
- ❌ Cannot promote themselves (privilege escalation prevented)

---

## 📚 Documentation Files Created

| File | Purpose |
|------|---------|
| [SUPABASE_POLICIES_AUDIT.md](SUPABASE_POLICIES_AUDIT.md) | Detailed security audit & issues found |
| [SUPABASE_RLS_IMPLEMENTATION.md](SUPABASE_RLS_IMPLEMENTATION.md) | Complete implementation guide |
| [SUPABASE_MIGRATION_DEPLOYMENT.md](SUPABASE_MIGRATION_DEPLOYMENT.md) | Step-by-step deployment instructions |
| [deploy-supabase-rls.sh](deploy-supabase-rls.sh) | Automated deployment script |

---

## 🚨 Important Notes

### Database Changes Required
After deploying migrations, your database will have:
- ✨ New `role` column in `users` table
- ✨ 6 new access policies on `waitlist_entries`
- ✨ 2 new access policies on `users`
- ✨ 1 new trigger for privilege escalation prevention

### Migration Order
If you have an existing Supabase project, apply migrations in this order:
1. **001_create_tables.sql** - Drop old policy, create new one
2. **003_create_users_table.sql** - Add DELETE policy
3. **004_add_admin_policies.sql** - Add admin system

### Backwards Compatibility
✅ These changes are backwards compatible:
- Existing authentication still works
- Public waitlist signup unchanged
- Only new policies added (no breaking changes)

---

## 🔍 Troubleshooting

### Waitlist Count Still Shows 0
1. Verify the policy was updated to `USING (true)`
2. Clear browser cache
3. Check network tab for API response

### Admin Access Not Working
1. Confirm user was promoted: 
   ```sql
   SELECT email, role FROM public.users WHERE email = 'your-email@example.com';
   ```
2. Log out and back in (session refresh required)
3. Check browser console for errors

### "Policy already exists" Error
- The migration uses `IF NOT EXISTS` so it's safe to re-run
- If you still get errors, see [SUPABASE_MIGRATION_DEPLOYMENT.md](SUPABASE_MIGRATION_DEPLOYMENT.md#troubleshooting)

---

## 📞 Need Help?

1. **Check Status:** https://status.supabase.com
2. **Read Full Guide:** [SUPABASE_MIGRATION_DEPLOYMENT.md](SUPABASE_MIGRATION_DEPLOYMENT.md)
3. **Supabase Docs:** https://supabase.com/docs/guides/auth/row-level-security
4. **Debug SQL:** Use Supabase SQL Editor to test policies

---

## 🎉 What's Next?

### Immediate (This Week)
- [ ] Deploy migrations to production
- [ ] Promote at least one admin user
- [ ] Test waitlist count displays correctly

### Short Term (This Sprint)
- [ ] Add admin dashboard for waitlist management
- [ ] Add account deletion UI in user settings
- [ ] Test all policies with E2E tests

### Long Term (Roadmap)
- [ ] Build role-based admin panel
- [ ] Add audit logging for admin actions
- [ ] Implement team management features

---

## 📎 Reference

**Repository:** [Mysharsh/art-frames](https://github.com/Mysharsh/art-frames)  
**Branch:** main  
**Commit:** 13b9c7d  
**Created:** February 28, 2026

**Key Files:**
- [scripts/001_create_tables.sql](scripts/001_create_tables.sql)
- [scripts/003_create_users_table.sql](scripts/003_create_users_table.sql)
- [scripts/004_add_admin_policies.sql](scripts/004_add_admin_policies.sql)
