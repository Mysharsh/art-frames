#!/usr/bin/env bash

# Art Frames - Deployment Execution Checklist
# Usage: Print this out and check off each step as you complete it
# Time Estimate: 1.5-2 hours total

cat << 'EOF'

╔════════════════════════════════════════════════════════════════════════════════╗
║                    ART FRAMES - DEPLOYMENT EXECUTION CHECKLIST                ║
║                                                                                ║
║  Estimated Time: 1.5-2 hours                                                  ║
║  Status: Ready for Execution                                                  ║
║  Date: February 21, 2026                                                      ║
╚════════════════════════════════════════════════════════════════════════════════╝


PHASE 1: SUPABASE DATABASE SETUP (20-30 min)
═════════════════════════════════════════════════════════════════════════════════

  [ ] 1.1 Sign in to Supabase (https://supabase.com)
  
  [ ] 1.2 Create new project
      □ Name: art-frames
      □ Region: [Choose closest to users]
      □ Database password: [Use strong password, save it]
      □ Click "Create new project"
      □ Wait 2-5 minutes for initialization
  
  [ ] 1.3 Collect credentials from Dashboard > Settings > API
      □ Project URL: https://xxx.supabase.co
      □ Anon Key: eyJhbGc...
      □ Service Role Key: eyJhbGc...
      □ Save these securely (DO NOT COMMIT TO GIT)
  
  [ ] 1.4 Verify project is ready
      □ Dashboard is accessible
      □ Table Editor works
      □ SQL Editor works


PHASE 2: DATABASE MIGRATIONS (5-10 min)
═════════════════════════════════════════════════════════════════════════════════

  [ ] 2.1 Migration 001: Initial Schema
      □ Open Supabase Dashboard > SQL Editor
      □ Click "New Query"
      □ Copy content from scripts/001_create_tables.sql
      □ Click "Run"
      □ Should see "✓ No errors" message
  
  [ ] 2.2 Verify Migration 001
      □ Click "Table Editor" in sidebar
      □ Confirm waitlist_entries table exists
      □ Check columns: id, email, product_id, product_title, created_at
      □ Confirm RLS policies are listed
  
  [ ] 2.3 Migration 002: Enhanced Schema
      □ Back to SQL Editor > New Query
      □ Copy content from scripts/002_enhance_waitlist_table.sql
      □ Click "Run"
      □ Should see "✓ No errors" message
  
  [ ] 2.4 Verify Migration 002
      □ Table Editor > waitlist_entries
      □ Confirm updated_at column added
      □ Check indexes: 5 indexes should exist
      □ Run test query: SELECT COUNT(*) FROM waitlist_entries;
      □ Should return "0"
  
  [ ] 2.5 Test database connection
      □ SQL Editor > New Query
      □ Type: SELECT NOW();
      □ Click Run
      □ Should return current timestamp


PHASE 3: ENVIRONMENT CONFIGURATION (5 min)
═════════════════════════════════════════════════════════════════════════════════

  [ ] 3.1 Create .env.local (on your local machine)
      □ cd /workspaces/art-frames
      □ cp .env.example .env.local
      □ nano .env.local (or edit in VS Code)
  
  [ ] 3.2 Fill in Supabase credentials
      □ NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
      □ NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY-HERE
      □ Save file
  
  [ ] 3.3 Test environment locally (optional but recommended)
      □ pnpm dev
      □ Visit http://localhost:3000/api/health
      □ Should return {"status":"healthy","checks":{"database":"connected"}}
      □ Stop dev server (Ctrl+C)


PHASE 4: DOCKER BUILD (10-15 min)
═════════════════════════════════════════════════════════════════════════════════

  [ ] 4.1 Build Docker image
      □ Ensure you're in project root: /workspaces/art-frames
      □ Run: docker build -t art-frames:latest .
      □ Wait for build to complete (2-5 minutes)
      □ Should see "Successfully tagged art-frames:latest"
  
  [ ] 4.2 Verify image was created
      □ Run: docker images | grep art-frames
      □ Image should be listed (~150MB size)
  
  [ ] 4.3 Test image locally (optional but recommended)
      □ docker run -p 3000:3000 \
          -e NEXT_PUBLIC_SUPABASE_URL="https://YOUR-PROJECT.supabase.co" \
          -e NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR-ANON-KEY" \
          art-frames:latest
      □ In another terminal: curl http://localhost:3000/api/health
      □ Should return healthy status
      □ Stop container with Ctrl+C


PHASE 5: DOCKER DEPLOYMENT (15-30 min)
═════════════════════════════════════════════════════════════════════════════════

  [ ] 5.1 Push image to registry (choose one):

      Option A: Docker Hub (easiest)
      □ docker login
      □ docker tag art-frames:latest YOUR-USERNAME/art-frames:latest
      □ docker push YOUR-USERNAME/art-frames:latest
      □ Verify at https://hub.docker.com

      Option B: VPS/Server (with docker-compose)
      □ Prepare docker-compose.prod.yml on your server
      □ Create .env file with Supabase credentials
      □ Run: docker-compose -f docker-compose.prod.yml up -d
      □ Verify: docker-compose logs -f

      Option C: Cloud Platform (Vercel, Railway, Fly.io, etc.)
      □ Follow platform-specific deployment steps
      □ Connect GitHub repository
      □ Set environment variables in platform UI
      □ Platform auto-deploys on git push

  [ ] 5.2 Set up reverse proxy (if using VPS)
      □ Install Nginx: sudo apt-get install nginx
      □ Create Nginx config file
      □ Enable Let's Encrypt SSL: sudo certbot --nginx
      □ Verify SSL certificate


PHASE 6: VERIFICATION & TESTING (30-60 min)
═════════════════════════════════════════════════════════════════════════════════

  [ ] 6.1 Health Check
      □ curl https://your-domain.com/api/health -i
      □ Should return: HTTP 200 OK
      □ Response should include: "status": "healthy"
  
  [ ] 6.2 Smoke Test - Homepage
      □ Open https://your-domain.com in browser
      □ Page loads without errors
      □ Products are displayed
      □ Navigation works
  
  [ ] 6.3 Smoke Test - Product Page
      □ Click on a product
      □ Page loads: https://your-domain.com/product/p1
      □ Product details visible
      □ Images load correctly
  
  [ ] 6.4 Smoke Test - Waitlist
      □ Click "Join Waitlist" button
      □ Modal opens
      □ Submit with: test@example.com
      □ Should see success or submitted message
      □ Verify in Supabase > Table Editor > check waitlist_entries
  
  [ ] 6.5 Rate Limiting Test
      □ Submit 11 requests to /api/waitlist
      □ First 10 should succeed
      □ 11th should return 429 (Too Many Requests)
  
  [ ] 6.6 Run Unit Tests
      □ pnpm test:run
      □ Should show: "39 passed"
  
  [ ] 6.7 Run E2E Tests Against Production
      □ PLAYWRIGHT_TEST_BASE_URL=https://your-domain.com pnpm test:e2e
      □ Should show: "78 passed"
      □ If any fail, check logs: docker logs art-frames
  
  [ ] 6.8 Database Verification
      □ Supabase > Table Editor > waitlist_entries
      □ Should see test entries
      □ Verify unique constraint works (duplicate email fails)
  
  [ ] 6.9 Performance Check
      □ Time a page load: curl -o /dev/null -s -w "%{time_total}\n" https://your-domain.com
      □ Should be < 3 seconds
  
  [ ] 6.10 SSL Certificate Check
      □ curl -vI https://your-domain.com 2>&1 | grep certificate
      □ Should show valid certificate
      □ Website icon should show lock


PHASE 7: LAUNCH & MONITORING (Ongoing)
═════════════════════════════════════════════════════════════════════════════════

  [ ] 7.1 Pre-Launch Preparation
      □ Prepare beta user list (100-1,000 users)
      □ Create beta access email template
      □ Brief support team on new features
      □ Prepare rollback procedure
  
  [ ] 7.2 Set Up Monitoring
      □ Configure uptime monitoring (UptimeRobot, Pingdom, etc.)
      □ Set alerts for: health check failures, high error rates
      □ Configure log aggregation (optional: DataDog, New Relic)
      □ Create runbooks for common issues
  
  [ ] 7.3 Launch to Beta Users
      □ Send beta access emails
      □ Monitor error logs: docker logs -f art-frames
      □ Track health: curl https://your-domain.com/api/health (every 5 min)
      □ Collect user feedback
  
  [ ] 7.4 First 24 Hours Monitoring
      □ Check errors < 0.1% of total requests
      □ Verify response times < 500ms p95
      □ Monitor Supabase database load
      □ Watch for rate limiting issues
      □ Collect customer feedback
  
  [ ] 7.5 Weekly Maintenance
      □ Review error logs
      □ Check Supabase database size
      □ Verify backups are running
      □ Monitor waitlist growth
  
  [ ] 7.6 Monthly Maintenance
      □ Security audit
      □ Dependency updates
      □ Performance analysis
      □ Backup verification


ROLLBACK PLAN (In case of emergency)
═════════════════════════════════════════════════════════════════════════════════

  [ ] Have previous version docker image tagged and ready
  
  [ ] Rollback steps if critical issue occurs:
      □ docker stop art-frames
      □ docker run -d --name art-frames [previous-image]
      □ docker logs art-frames (verify it starts)
      □ curl https://your-domain.com/api/health (verify health)
      □ Notify team of rollback


TROUBLESHOOTING DURING DEPLOYMENT
═════════════════════════════════════════════════════════════════════════════════

  Q: Health check returns "database": "disconnected"
  A: □ Verify SUPABASE_URL and SUPABASE_KEY in environment
     □ Check Supabase project is not paused
     □ Ping database from server

  Q: Rate limiting too strict / too lenient  
  A: □ Edit lib/rate-limit.ts
     □ Rebuild and redeploy: docker build -t art-frames:latest .

  Q: E2E tests failing against production
  A: □ Check docker logs: docker logs -f art-frames
     □ Verify database has test data
     □ Check URL is accessible: curl https://your-domain.com

  Q: High memory/CPU usage
  A: □ docker ps (check resource usage)
     □ docker stop art-frames
     □ Increase container resources and restart

  Q: 404 errors on product pages
  A: □ Verify products exist in lib/products.ts
     □ Check URL format: /product/p1 (lowercase p, number)


SUCCESS CRITERIA - DEPLOYMENT COMPLETE ✓
═════════════════════════════════════════════════════════════════════════════════

  ✓ Supabase project created and migrations executed
  ✓ Docker image built and deployed to production
  ✓ Health check endpoint returns 200 OK
  ✓ All 78 E2E tests pass against production URL
  ✓ Waitlist signup working end-to-end
  ✓ No errors in Docker logs
  ✓ SSL certificate valid
  ✓ Response times < 500ms p95


QUICK COMMAND REFERENCE
═════════════════════════════════════════════════════════════════════════════════

  # Local testing
  pnpm dev                          # Start dev server
  pnpm build                        # Build for production
  pnpm test:run                     # Run unit tests
  pnpm test:e2e                     # Run E2E tests

  # Docker commands
  docker build -t art-frames .      # Build image
  docker run -p 3000:3000 art-frames    # Run locally
  docker ps                         # List running containers
  docker logs -f art-frames         # View logs
  docker stop art-frames            # Stop container

  # Verification
  curl https://your-domain.com/api/health                    # Health check
  curl https://your-domain.com/product/p1                    # Product page
  PLAYWRIGHT_TEST_BASE_URL=https://your-domain.com pnpm test:e2e  # E2E tests

  # Database operations
  psql postgresql://user:pass@host/db -c "SELECT COUNT(*) FROM waitlist_entries;"


DOCUMENTATION REFERENCES
═════════════════════════════════════════════════════════════════════════════════

  📖 EXECUTION_PLAN.md              Comprehensive step-by-step guide (THIS DOCUMENT)
  📖 DEPLOYMENT_GUIDE.md            Deployment procedures and methods
  📖 PRODUCTION_READINESS.md        Pre-launch checklist
  📖 README.md                      Setup and troubleshooting
  📖 QUICK_REFERENCE.md             Command reference

  🔧 Validation: ./validate-production.sh


═════════════════════════════════════════════════════════════════════════════════
  START TIME: ________        COMPLETION TIME: ________
  
  Print this checklist and check off each item as you complete it.
  Estimated total time: 1.5-2 hours
  
  Questions? See EXECUTION_PLAN.md for detailed instructions
═════════════════════════════════════════════════════════════════════════════════

EOF
