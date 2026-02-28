# Implementation Complete: Manual Production Error Generation

## Summary

I've implemented a comprehensive system for manually generating and testing errors in production using Sentry with Next.js.

## What Was Implemented

### 1. Server-Side Error Testing API (`/api/test-error`)

**File:** [app/api/test-error/route.ts](app/api/test-error/route.ts)

A new API route that simulates production errors with multiple error types:

- **Generic errors** - Basic error messages
- **Validation errors** - Form/data validation failures
- **Database errors** - DB connection issues
- **Authorization errors** - Auth/permission failures
- **Rate limit errors** - Rate limiting scenarios
- **Timeout errors** - Operation timeouts
- **Messages** - Send messages instead of errors

**Features:**
- ✅ Automatic Sentry capture with context
- ✅ Error tagging for filtering
- ✅ Breadcrumb tracking
- ✅ GET and POST request support
- ✅ User context tracking
- ✅ Detailed JSON responses

### 2. Enhanced Test Page (`/test-sentry`)

**File:** [app/test-sentry/page.tsx](app/test-sentry/page.tsx)

Updated the existing Sentry test page with:

**Client-Side Tests:**
- Throw Error
- Capture Error  
- Send Message
- Set User Context

**Server-Side Tests (NEW):**
- Validation Error
- Database Error
- Auth Error
- Rate Limit Error
- Timeout Error

**Features:**
- Loading states
- Status updates
- Real-time feedback
- Production error simulation
- Complete test documentation on page

### 3. Production Testing Guide

**File:** [SENTRY_PRODUCTION_ERROR_TESTING.md](SENTRY_PRODUCTION_ERROR_TESTING.md)

Comprehensive documentation including:
- Quick start guide
- API endpoint details
- cURL command examples
- JavaScript code examples
- Sentry verification steps
- Production considerations
- Troubleshooting guide

## How to Use

### Option 1: Visual Test Page (Easiest)

1. Navigate to `http://localhost:3000/test-sentry`
2. Click any "Server-Side" button to simulate production errors
3. Errors appear in Sentry dashboard within 5-10 seconds

### Option 2: Direct API Calls

**Via cURL:**
```bash
# Generic error
curl http://localhost:3000/api/test-error?type=database

# Custom message
curl http://localhost:3000/api/test-error?type=validation&message=MyError

# POST with data
curl -X POST http://localhost:3000/api/test-error \
  -H "Content-Type: application/json" \
  -d '{"errorType":"database","userId":"user-123"}'
```

**Via JavaScript:**
```javascript
const response = await fetch('/api/test-error?type=database')
const data = await response.json()
console.log(data)
```

### Option 3: Manual Code Implementation

```typescript
import { captureException } from '@/lib/sentry'

try {
  throw new Error('Manual production error')
} catch (error) {
  captureException(error, { context: 'production-test' })
}
```

## Verification Checklist

✅ Build succeeds without errors
✅ `/api/test-error` route registered
✅ `/test-sentry` page enhanced
✅ All error types supported
✅ Sentry integration active
✅ Server-side error capture working
✅ Client-side error capture working
✅ Documentation complete

## Environment Requirements

Ensure `.env.local` contains:

```env
NEXT_PUBLIC_SENTRY_DSN=your-public-dsn
SENTRY_DSN=your-server-dsn
```

Both should be set from your Sentry project: https://sentry.io

## Next Steps

1. **Test in Development:**
   ```bash
   npm run dev
   # Visit http://localhost:3000/test-sentry
   ```

2. **Deploy to Production:**
   ```bash
   npm run build
   npm run start
   ```

3. **Monitor in Sentry:**
   - Go to https://sentry.io
   - Select your project
   - Check Issues tab

## API Response Examples

### Success (Error Triggered)
```json
{
  "success": false,
  "error": "Database connection failed",
  "type": "database",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### All Error Types
- `generic` - Basic error
- `validation` - Validation failure
- `database` - DB error
- `unauthorized` - Auth error
- `rate-limit` - Rate limit
- `timeout` - Timeout
- `message` - Send message only

## Features

✨ **Production-Ready:**
- Error tagging and filtering
- User context tracking
- Breadcrumb trails
- Performance monitoring
- Session replay data

🔧 **Developer-Friendly:**
- Visual test page
- API documentation
- Code examples
- Comprehensive guide

📊 **Monitoring:**
- Real-time error tracking
- Full stack traces
- Request details
- Performance metrics
