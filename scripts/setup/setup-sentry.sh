#!/bin/bash

# Sentry Quick Setup Script for Art Frames
# Run this script to quickly configure Sentry

echo "========================================="
echo "Sentry Setup for Art Frames"
echo "========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env.local exists
if [ -f ".env.local" ]; then
    echo -e "${YELLOW}⚠️  .env.local already exists${NC}"
    echo "Do you want to add Sentry configuration to it? (y/n)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        echo "Aborted."
        exit 0
    fi
else
    echo -e "${BLUE}Creating .env.local file...${NC}"
    touch .env.local
fi

echo ""
echo "========================================="
echo "Step 1: Get Your Sentry DSN"
echo "========================================="
echo ""
echo "1. Go to https://sentry.io"
echo "2. Sign up or log in"
echo "3. Create a new Next.js project"
echo "4. Copy your DSN (looks like: https://xxxxx@xxxxx.ingest.sentry.io/xxxxx)"
echo ""
echo -e "${YELLOW}Press Enter when you're ready to continue...${NC}"
read -r

echo ""
echo "Please paste your Sentry DSN:"
read -r sentry_dsn

# Validate DSN format
if [[ ! "$sentry_dsn" =~ ^https://.+@.+\.ingest\.sentry\.io/.+ ]]; then
    echo -e "${RED}❌ Invalid DSN format. Expected format: https://xxxxx@xxxxx.ingest.sentry.io/xxxxx${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✓ DSN looks valid!${NC}"
echo ""

# Check if Sentry config already exists in .env.local
if grep -q "NEXT_PUBLIC_SENTRY_DSN" .env.local; then
    echo -e "${YELLOW}⚠️  Sentry configuration already exists in .env.local${NC}"
    echo "Updating existing configuration..."
    
    # Update existing values
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s|NEXT_PUBLIC_SENTRY_DSN=.*|NEXT_PUBLIC_SENTRY_DSN=$sentry_dsn|" .env.local
        sed -i '' "s|SENTRY_DSN=.*|SENTRY_DSN=$sentry_dsn|" .env.local
    else
        # Linux
        sed -i "s|NEXT_PUBLIC_SENTRY_DSN=.*|NEXT_PUBLIC_SENTRY_DSN=$sentry_dsn|" .env.local
        sed -i "s|SENTRY_DSN=.*|SENTRY_DSN=$sentry_dsn|" .env.local
    fi
else
    echo "Adding Sentry configuration to .env.local..."
    
    # Add Sentry configuration
    cat >> .env.local << EOF

# Sentry Error Tracking
NEXT_PUBLIC_SENTRY_DSN=$sentry_dsn
SENTRY_DSN=$sentry_dsn

# Optional: Sentry Auth Token for source maps
# Get this from: https://sentry.io/settings/account/api/auth-tokens/
# SENTRY_AUTH_TOKEN=your-auth-token-here
EOF
fi

echo -e "${GREEN}✓ Configuration saved!${NC}"
echo ""
echo "========================================="
echo "Optional: Source Maps (Recommended)"
echo "========================================="
echo ""
echo "Source maps help you see exact code locations for errors in production."
echo "Do you want to configure source maps now? (y/n)"
read -r response

if [[ "$response" =~ ^[Yy]$ ]]; then
    echo ""
    echo "1. Go to https://sentry.io/settings/account/api/auth-tokens/"
    echo "2. Click 'Create New Token'"
    echo "3. Name it: 'art-frames-sourcemaps'"
    echo "4. Select scopes: project:releases, project:write"
    echo "5. Copy the token"
    echo ""
    echo "Paste your Sentry Auth Token (or press Enter to skip):"
    read -r auth_token
    
    if [ -n "$auth_token" ]; then
        if grep -q "SENTRY_AUTH_TOKEN" .env.local; then
            # Update existing value
            if [[ "$OSTYPE" == "darwin"* ]]; then
                sed -i '' "s|# SENTRY_AUTH_TOKEN=.*|SENTRY_AUTH_TOKEN=$auth_token|" .env.local
                sed -i '' "s|SENTRY_AUTH_TOKEN=.*|SENTRY_AUTH_TOKEN=$auth_token|" .env.local
            else
                sed -i "s|# SENTRY_AUTH_TOKEN=.*|SENTRY_AUTH_TOKEN=$auth_token|" .env.local
                sed -i "s|SENTRY_AUTH_TOKEN=.*|SENTRY_AUTH_TOKEN=$auth_token|" .env.local
            fi
        else
            echo "SENTRY_AUTH_TOKEN=$auth_token" >> .env.local
        fi
        echo -e "${GREEN}✓ Auth token configured!${NC}"
    else
        echo "Skipped auth token configuration."
    fi
fi

echo ""
echo "========================================="
echo "Step 2: Test Your Setup"
echo "========================================="
echo ""
echo "Would you like to create a test error page? (y/n)"
read -r response

if [[ "$response" =~ ^[Yy]$ ]]; then
    mkdir -p app/test-sentry
    
    cat > app/test-sentry/page.tsx << 'EOF'
'use client'

import { captureException, captureMessage, addBreadcrumb } from '@/lib/sentry'
import { Button } from '@/components/ui/button'

export default function SentryTestPage() {
  const testError = () => {
    addBreadcrumb('User clicked test error button', 'user-action')
    throw new Error('Sentry Test Error - This is intentional!')
  }

  const testCapture = () => {
    captureException(new Error('Manual error capture test'), {
      context: 'test-page',
      testData: 'This was manually captured'
    })
    alert('Error captured! Check your Sentry dashboard.')
  }

  const testMessage = () => {
    captureMessage('Test message from Art Frames', 'info')
    alert('Message sent! Check your Sentry dashboard.')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-4">
        <h1 className="text-2xl font-bold mb-4">Sentry Test Page</h1>
        
        <div className="space-y-2">
          <Button onClick={testError} variant="destructive" className="w-full">
            Test Error (Throws Exception)
          </Button>
          
          <Button onClick={testCapture} variant="outline" className="w-full">
            Test Manual Capture
          </Button>
          
          <Button onClick={testMessage} variant="secondary" className="w-full">
            Test Message
          </Button>
          
          <a href="/">
            <Button variant="ghost" className="w-full">
              Back to Home
            </Button>
          </a>
        </div>

        <div className="mt-4 p-4 bg-muted rounded-md text-sm">
          <p className="font-semibold mb-2">Instructions:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Click any test button above</li>
            <li>Check your Sentry dashboard at sentry.io</li>
            <li>You should see the error/message appear within seconds</li>
            <li>Delete this test page when done: <code>rm -rf app/test-sentry</code></li>
          </ol>
        </div>
      </div>
    </div>
  )
}
EOF

    echo -e "${GREEN}✓ Test page created at app/test-sentry/page.tsx${NC}"
    echo ""
    echo "Start your dev server and visit: http://localhost:3000/test-sentry"
fi

echo ""
echo "========================================="
echo "📋 Next Steps"
echo "========================================="
echo ""
echo "1. Start your development server:"
echo -e "   ${BLUE}pnpm dev${NC}"
echo ""
echo "2. Visit the test page (if created):"
echo -e "   ${BLUE}http://localhost:3000/test-sentry${NC}"
echo ""
echo "3. Click a test button and check your Sentry dashboard"
echo ""
echo "4. Delete the test page when done:"
echo -e "   ${BLUE}rm -rf app/test-sentry${NC}"
echo ""
echo "5. For production, add the same environment variables to your hosting platform"
echo ""
echo "========================================="
echo "📚 Documentation"
echo "========================================="
echo ""
echo "Read the full setup guide:"
echo -e "   ${BLUE}cat SENTRY_SETUP_GUIDE.md${NC}"
echo ""
echo "Sentry documentation:"
echo -e "   ${BLUE}https://docs.sentry.io/platforms/javascript/guides/nextjs/${NC}"
echo ""
echo -e "${GREEN}✅ Sentry setup complete!${NC}"
echo ""
