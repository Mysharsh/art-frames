# Sentry Setup Quick Start

## Option 1: Automated Setup (Recommended)

Run the interactive setup script:

```bash
./setup-sentry.sh
```

The script will:
- ✅ Create/update `.env.local` with your Sentry DSN
- ✅ Optionally configure source maps
- ✅ Create a test page to verify the setup
- ✅ Guide you through each step

## Option 2: Manual Setup

### Step 1: Get Sentry DSN

1. Go to [sentry.io](https://sentry.io) and create an account
2. Create a new **Next.js** project
3. Copy your **DSN** (looks like: `https://xxxxx@xxxxx.ingest.sentry.io/xxxxx`)

### Step 2: Configure Environment

Create `.env.local` in your project root:

```env
# Sentry Configuration
NEXT_PUBLIC_SENTRY_DSN=https://YOUR_KEY@YOUR_ORG.ingest.sentry.io/YOUR_PROJECT_ID
SENTRY_DSN=https://YOUR_KEY@YOUR_ORG.ingest.sentry.io/YOUR_PROJECT_ID
```

Replace with your actual DSN from Step 1.

### Step 3: Test It

1. Start dev server: `pnpm dev`
2. Create a test error or use the test page
3. Check your Sentry dashboard for the error

## What's Already Configured

Your project includes:

- ✅ **@sentry/nextjs** installed
- ✅ Client-side error tracking (`sentry.client.config.ts`)
- ✅ Server-side error tracking (`sentry.server.config.ts`)
- ✅ Instrumentation hook (`instrumentation.ts`)
- ✅ Helper functions (`lib/sentry.ts`)
- ✅ Error boundary component (`components/sentry-error-boundary.tsx`)

## Quick Test

Create `app/test-error/page.tsx`:

```tsx
'use client'

export default function TestError() {
  return (
    <button onClick={() => {
      throw new Error('Test Sentry Error!')
    }}>
      Click to Test Sentry
    </button>
  )
}
```

Visit `http://localhost:3000/test-error`, click the button, and check Sentry dashboard!

## Production Deployment

Add these environment variables to your hosting platform (Vercel, etc.):

```
NEXT_PUBLIC_SENTRY_DSN=your-dsn-here
SENTRY_DSN=your-dsn-here
NODE_ENV=production
```

## Full Documentation

📖 Read the complete guide: [SENTRY_SETUP_GUIDE.md](SENTRY_SETUP_GUIDE.md)

## Need Help?

- Run: `./setup-sentry.sh` for guided setup
- Read: `SENTRY_SETUP_GUIDE.md` for detailed instructions
- Visit: https://docs.sentry.io/platforms/javascript/guides/nextjs/

---

**Time to setup:** 5 minutes ⏱️  
**Difficulty:** Easy 🟢
