# Manual Production Error Generation with Sentry

This guide explains how to manually generate and test errors in production using Sentry with Next.js.

## Quick Start

### 1. Access the Test Page

Navigate to: **`/test-sentry`**

This page provides both client-side and server-side error testing options.

## Testing Options

### Client-Side Tests (Browser Errors)

Available on the Sentry test page:

- **Throw Error** - Directly throws a JavaScript error
- **Capture Error** - Manually captures and sends an error
- **Send Message** - Sends a message to Sentry
- **Set User Context** - Sets user information for tracking

### Server-Side Tests (Production Errors)

Simulates real production errors that occur on the backend:

#### Using the API Directly

```bash
# Generic error
curl http://localhost:3000/api/test-error?type=generic

# Validation error
curl http://localhost:3000/api/test-error?type=validation

# Database error
curl http://localhost:3000/api/test-error?type=database

# Authentication error
curl http://localhost:3000/api/test-error?type=unauthorized

# Rate limit error
curl http://localhost:3000/api/test-error?type=rate-limit

# Timeout error
curl http://localhost:3000/api/test-error?type=timeout
```

#### Using POST with Custom Data

```bash
curl -X POST http://localhost:3000/api/test-error \
  -H "Content-Type: application/json" \
  -d '{
    "errorType": "database",
    "message": "Custom database error message",
    "userId": "user-123"
  }'
```

#### Using JavaScript

```javascript
// Trigger server error from your application
const response = await fetch('/api/test-error?type=database')
const data = await response.json()
console.log('Server error triggered:', data)
```

## How Errors Are Captured

### Automatic Capture

Sentry automatically captures:
- Unhandled exceptions
- Promise rejections
- API errors (500+ status codes)

### Manual Capture

In your code, you can manually capture errors:

```typescript
import { captureException, captureMessage, setUserContext, addBreadcrumb } from '@/lib/sentry'

// Capture an exception
try {
  // some code
} catch (error) {
  captureException(error, { context: 'specific-operation' })
}

// Send a message
captureMessage('Something important happened', 'info')

// Set user context
setUserContext('user-id', 'user@example.com')

// Add breadcrumbs for debugging
addBreadcrumb('User clicked button', 'user-action')
```

## Environment Configuration

Ensure these environment variables are set:

```env
# Client-side DSN (Next.js public)
NEXT_PUBLIC_SENTRY_DSN=https://examplePublicKey@o123456.ingest.sentry.io/123456

# Server-side DSN
SENTRY_DSN=https://examplePrivateKey@o123456.ingest.sentry.io/123456
```

## API Route Documentation

**Endpoint:** `/api/test-error`

### Query Parameters (GET)

- `type` (string): Error type to simulate
  - `generic` - Generic error message
  - `validation` - Validation error
  - `database` - Database connection error
  - `unauthorized` - Authentication/Authorization error
  - `rate-limit` - Rate limiting error
  - `timeout` - Operation timeout
  - `message` - Send message instead of error

- `message` (string): Custom error message (optional)

### Request Body (POST)

```json
{
  "errorType": "database",
  "message": "Custom error message",
  "userId": "user-123",
  "customData": "any-additional-details"
}
```

### Response

```json
{
  "success": false,
  "error": "Error message",
  "type": "database",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Verifying Errors in Sentry

1. Visit your [Sentry Dashboard](https://sentry.io)
2. Select your **art-frames** project
3. Navigate to **Issues** tab
4. Look for your test error (may take 5-10 seconds to appear)
5. Click to see:
   - Full error message and stack trace
   - User context and breadcrumbs
   - Request details
   - Performance metrics

## Error Tags and Context

Each error includes automatic tags:

- `test: true` - Indicates this is a test error
- `errorType` - The type of error being tested
- `endpoint` - Which API endpoint was called
- `method` - HTTP method (GET/POST)

## Production Considerations

### Handling Test Errors in Production

To ensure test errors don't affect real monitoring:

1. **Use separate Sentry projects** for testing vs. production
2. **Filter test tags** in Sentry dashboard
3. **Set error sampling** to avoid quota waste
4. **Restrict access** to test endpoints in production

### Adding Error Guards

For production, consider protecting the test endpoint:

```typescript
// Only allow in development
if (process.env.NODE_ENV !== 'development') {
  return Response.json({ error: 'Not available in production' }, { status: 403 })
}
```

## Troubleshooting

### Errors Not Appearing in Sentry

1. **Check DSN** - Verify `NEXT_PUBLIC_SENTRY_DSN` is correct
2. **Check environment** - Ensure `NODE_ENV` is properly set
3. **Check sampling** - Verify trace sampling is enabled in config
4. **Wait time** - Sentry takes 5-10 seconds to process errors
5. **Check filters** - Ensure Sentry dashboard isn't filtering errors

### Too Many Test Errors

Use the Sentry dashboard to:
- **Mark as resolved** - Hide resolved errors
- **Ignore** - Permanently ignore error type
- **Delete** - Remove test errors

## Advanced Testing

### Test with Real Data

```javascript
// Post with real user data
const userId = 'user-456'
const response = await fetch('/api/test-error', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    errorType: 'database',
    message: 'Simulated DB error',
    userId,
    data: { attemptedOperation: 'fetchProducts' }
  })
})
```

### Test Error Boundaries

Trigger errors in error boundary components:

```typescript
// In a component
throw new Error('Error boundary test')
```

## Resources

- [Sentry Docs](https://docs.sentry.io)
- [Next.js Integration](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [API Reference](https://docs.sentry.io/error-reporting/quickstart/?platform=javascript)
