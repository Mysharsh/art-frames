# Sentry Setup Guide

This guide will walk you through setting up Sentry error tracking for your Art Frames application.

## Prerequisites

✅ **Already Installed:**
- `@sentry/nextjs@10.40.0` - Installed in your project
- Sentry configuration files created
- Error boundary component ready

## Step 1: Create a Sentry Account

1. Go to [https://sentry.io](https://sentry.io)
2. Click **"Get Started"** or **"Sign Up"**
3. Choose one of these options:
   - Sign up with GitHub (recommended)
   - Sign up with Google
   - Sign up with email

## Step 2: Create a New Project

1. After logging in, click **"Create Project"**
2. Select **"Next.js"** as the platform
3. Configure the project:
   - **Alert frequency:** Set to your preference (default is fine)
   - **Project name:** `art-frames` (or your preferred name)
   - **Team:** Select your team or create a new one
4. Click **"Create Project"**

## Step 3: Get Your DSN (Data Source Name)

After creating the project, Sentry will show you installation instructions. You need to find your DSN:

1. In the Sentry dashboard, go to **Settings** → **Projects**
2. Click on your **art-frames** project
3. Go to **Client Keys (DSN)**
4. Copy the **DSN** value (it looks like: `https://examplePublicKey@o0.ingest.sentry.io/0`)

### There are TWO DSN values you need:
- **Client DSN** (`NEXT_PUBLIC_SENTRY_DSN`) - For browser/client-side errors
- **Server DSN** (`SENTRY_DSN`) - For server-side errors

**Note:** These are usually the same DSN value.

## Step 4: Configure Environment Variables

### For Local Development:

1. Create a `.env.local` file in your project root:
   ```bash
   touch .env.local
   ```

2. Add your Sentry DSN values to `.env.local`:
   ```env
   # Sentry Error Tracking
   NEXT_PUBLIC_SENTRY_DSN=https://YOUR_KEY@o0.ingest.sentry.io/YOUR_PROJECT_ID
   SENTRY_DSN=https://YOUR_KEY@o0.ingest.sentry.io/YOUR_PROJECT_ID
   ```

3. **Replace** `YOUR_KEY` and `YOUR_PROJECT_ID` with the actual values from Step 3

### For Production (Vercel/Other Hosting):

Add these environment variables in your hosting platform:

**Example for Vercel:**
1. Go to your project in Vercel Dashboard
2. Click **Settings** → **Environment Variables**
3. Add these variables:
   - `NEXT_PUBLIC_SENTRY_DSN` = Your DSN
   - `SENTRY_DSN` = Your DSN (same value)
   - `NODE_ENV` = `production`

## Step 5: Optional - Get Auth Token for Source Maps

Source maps help you see the exact line of code that caused an error in production.

1. In Sentry, go to **Settings** → **Account** → **API** → **Auth Tokens**
2. Click **"Create New Token"**
3. Configure the token:
   - **Name:** `art-frames-sourcemaps`
   - **Scopes:** Select `project:releases` and `project:write`
4. Copy the token and add to `.env.local`:
   ```env
   SENTRY_AUTH_TOKEN=your-auth-token-here
   ```

## Step 6: Test Your Setup

### Local Testing:

1. Start your development server:
   ```bash
   pnpm dev
   ```

2. Create a test error page at `app/test-error/page.tsx`:
   ```tsx
   'use client'
   
   export default function TestErrorPage() {
     return (
       <button onClick={() => {
         throw new Error('Sentry Test Error!');
       }}>
         Trigger Test Error
       </button>
     )
   }
   ```

3. Visit `http://localhost:3000/test-error` and click the button

4. Check your Sentry dashboard - you should see the error appear within seconds!

5. **Delete the test file** after confirming it works

### Production Testing:

After deploying to production:
1. Visit your production site
2. Trigger an intentional error (or wait for a real error)
3. Check Sentry dashboard for the error

## Step 7: Using Sentry in Your Code

### Automatic Error Capture

Errors are automatically captured by Sentry when they occur. No additional code needed!

### Manual Error Capture

Use the helper functions provided in `lib/sentry.ts`:

```typescript
import { 
  captureException, 
  captureMessage, 
  setUserContext,
  addBreadcrumb 
} from '@/lib/sentry'

// Capture an exception
try {
  // some code
} catch (error) {
  captureException(error, { 
    context: 'user-action',
    additionalInfo: 'some data' 
  })
}

// Capture a message
captureMessage('User completed checkout', 'info')

// Set user context (after login)
setUserContext('user-123', 'user@example.com')

// Add breadcrumb for debugging
addBreadcrumb('User clicked checkout button', 'navigation')
```

### Wrap Components with Error Boundary

To add error boundaries to specific parts of your app:

```tsx
import { SentryErrorBoundary } from '@/components/sentry-error-boundary'

export default function MyComponent() {
  return (
    <SentryErrorBoundary>
      <YourComponent />
    </SentryErrorBoundary>
  )
}
```

## What's Already Configured

Your project already has these Sentry files configured:

### 1. **Client Configuration** (`sentry.client.config.ts`)
- Captures browser-side errors
- Performance monitoring enabled
- Session replay enabled
- 10% sample rate in production (adjustable)

### 2. **Server Configuration** (`sentry.server.config.ts`)
- Captures server-side errors
- API route errors
- 10% sample rate in production (adjustable)

### 3. **Instrumentation** (`instrumentation.ts`)
- Loads Sentry on Next.js runtime
- Automatically initializes server-side tracking

### 4. **Helper Functions** (`lib/sentry.ts`)
- `captureException()` - Manual error capture
- `captureMessage()` - Log messages
- `setUserContext()` - Associate errors with users
- `addBreadcrumb()` - Debug trail

### 5. **Error Boundary** (`components/sentry-error-boundary.tsx`)
- Catches React component errors
- Shows user-friendly error UI
- Automatically reports to Sentry

## Sentry Dashboard Features

Once set up, you can use these Sentry features:

### 1. **Issues**
- See all errors with stack traces
- Group similar errors together
- Track error frequency and affected users

### 2. **Performance**
- Monitor page load times
- API endpoint performance
- Database query performance
- Frontend transaction times

### 3. **Releases**
- Track errors by deployment version
- See which release introduced a bug
- Monitor regression detection

### 4. **Alerts**
- Get notified via email/Slack when errors occur
- Set up custom alert rules
- Configure thresholds

### 5. **Session Replay** (Enabled)
- Watch video recordings of user sessions where errors occurred
- See exactly what the user did before the error
- Review user interactions

## Sample Rate Configuration

Your current configuration:

```typescript
// Development: 100% of errors and traces captured
// Production: 10% of errors and traces captured

tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0
```

**To adjust sample rates:**
- Edit `sentry.client.config.ts` and `sentry.server.config.ts`
- Change `0.1` to your desired rate (0.0 to 1.0)
- Higher rates = more data but higher Sentry costs
- Lower rates = less data but reduced costs

**Recommended rates:**
- Startup/small traffic: `1.0` (100%)
- Medium traffic: `0.1` (10%)
- High traffic: `0.01` (1%)

## Troubleshooting

### DSN Not Found Error
**Symptoms:** Warning in console: `No DSN provided, client will not send events`

**Solution:**
1. Verify `.env.local` exists with `NEXT_PUBLIC_SENTRY_DSN`
2. Restart dev server: `pnpm dev`
3. Check DSN is correctly copied from Sentry dashboard

### Errors Not Appearing in Sentry
**Check:**
1. DSN is correct in environment variables
2. Internet connection is working
3. Wait 30-60 seconds (errors may be delayed)
4. Check Sentry project is the correct one
5. Verify sample rate isn't filtering out your errors

### Source Maps Not Working
**Symptoms:** Minified code in stack traces

**Solution:**
1. Add `SENTRY_AUTH_TOKEN` to environment variables
2. Ensure token has `project:releases` scope
3. Rebuild your project
4. Check Sentry → Settings → Source Maps

### Transport Disabled Error
**Symptoms:** `Sentry Logger [error]: Transport disabled`

**Cause:** This is expected in development when DSN is not set

**Solution:**
- If testing locally: Add DSN to `.env.local`
- If you don't want Sentry in dev: Ignore this message

## Cost Optimization Tips

Sentry has generous free tiers but here's how to optimize:

1. **Adjust Sample Rates:** Use 10% in production instead of 100%
2. **Filter Unimportant Errors:** Configure `ignoreErrors` in config
3. **Set Up Quotas:** In Sentry dashboard, set monthly error quotas
4. **Use Spike Protection:** Prevents sudden cost increases from error storms
5. **Archive Old Issues:** Keep dashboard clean and focused

## Free Tier Limits (as of 2026)

Sentry Free Plan includes:
- **5,000 errors per month**
- **10,000 performance units per month**
- **Unlimited projects**
- **30-day error retention**
- **1 team member**

Perfect for development and small production apps!

## Security Best Practices

1. **Never commit `.env.local`** - It's in `.gitignore` by default
2. **Don't expose DSN in client code** - Use environment variables only
3. **Filter sensitive data:**
   ```typescript
   Sentry.init({
     dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
     beforeSend(event) {
       // Remove sensitive data
       if (event.request) {
         delete event.request.cookies;
       }
       return event;
     }
   })
   ```
4. **Review error data** - Ensure no passwords/tokens in error messages

## Next Steps

1. ✅ Create Sentry account
2. ✅ Create Next.js project in Sentry
3. ✅ Copy DSN to `.env.local`
4. ✅ Test with a sample error
5. ✅ Configure alerts in Sentry dashboard
6. ✅ Add DSN to production environment variables
7. ✅ Deploy and monitor!

## Useful Links

- **Sentry Dashboard:** https://sentry.io
- **Sentry Next.js Docs:** https://docs.sentry.io/platforms/javascript/guides/nextjs/
- **Your Project Logs:** Check dev server console for Sentry messages
- **Configuration Files:** 
  - `sentry.client.config.ts`
  - `sentry.server.config.ts`
  - `instrumentation.ts`

## Support

If you need help:
- **Sentry Docs:** https://docs.sentry.io
- **Community Discord:** https://discord.gg/sentry
- **GitHub Issues:** https://github.com/getsentry/sentry-javascript

---

## Quick Reference Commands

```bash
# Start dev server (loads Sentry)
pnpm dev

# Build for production
pnpm build

# Check Sentry configuration
cat .env.local | grep SENTRY

# Test error capture (create test page first)
# Visit http://localhost:3000/test-error

# View Sentry logs in dev mode
# Check terminal where `pnpm dev` is running
```

---

**You're all set!** 🎉

Once you add your DSN to `.env.local`, Sentry will automatically start capturing errors and performance data from your Art Frames application.
