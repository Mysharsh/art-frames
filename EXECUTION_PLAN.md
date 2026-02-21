# Art Frames - Database & Docker Deployment Execution Plan

**Last Updated**: February 21, 2026  
**Status**: Ready for Execution  
**Target Deployment**: Beta (100-1,000 users)

---

## Executive Overview

This plan guides the complete deployment process:
1. **Supabase Setup** (20-30 min)
2. **Database Migrations** (5-10 min)
3. **Environment Configuration** (5 min)
4. **Docker Build & Deployment** (15-30 min)
5. **Verification & Testing** (30-60 min)

**Total Estimated Time**: 1.5-2 hours

---

## PART 1: SUPABASE DATABASE SETUP

### Step 1.1: Create Supabase Project

1. **Sign up/Login**
   - Go to https://supabase.com
   - Sign in with GitHub or email
   - Navigate to Dashboard

2. **Create New Project**
   - Click "New Project"
   - Select Organization (create if needed)
   - Project Name: `art-frames` (or your preference)
   - Database Password: Use secure password (save it safely)
   - Region: Choose closest to your users
     - US: `us-east-1` (Virginia)
     - EU: `eu-west-1` (Ireland)
     - Asia: `ap-southeast-1` (Singapore)
   - Click "Create new project"

3. **Wait for Initialization**
   - Project initialization takes 2-5 minutes
   - You'll see a progress indicator
   - Once ready, you'll have access to the dashboard

### Step 1.2: Gather Connection Details

Once project is created, collect these credentials (keep them secret):

1. **From Supabase Dashboard > Settings > Database**
   - Host: `your-project.db.supabase.co`
   - Port: `5432`
   - Database: `postgres`
   - User: `postgres`
   - Password: (what you entered during creation)
   - Connection String: (shown on page, starts with `postgresql://`)

2. **From Supabase Dashboard > Settings > API Settings**
   - Project URL: `https://your-project.supabase.co`
   - Anon Public Key: (visible on page)
   - Service Role Key: (keep this secret, used only server-side)

3. **Save to temporary file** (on your local machine):
   ```
   SUPABASE_PROJECT_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=eyJhbG...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
   SUPABASE_DB_HOST=your-project.db.supabase.co
   SUPABASE_DB_PASSWORD=yourdbpassword
   ```

---

## PART 2: DATABASE MIGRATIONS

### Step 2.1: Access SQL Editor

1. **Open Supabase Dashboard**
   - Navigate to your project
   - Click on "SQL Editor" in left sidebar
   - Click "New Query" button

### Step 2.2: Execute Initial Schema Migration

1. **Create Query 1: Initial Tables**
   - Click "New Query"
   - Copy content from `scripts/001_create_tables.sql`:

```sql
-- Create waitlist_entries table for storing email signups
CREATE TABLE IF NOT EXISTS public.waitlist_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  product_id TEXT NOT NULL,
  product_title TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON public.waitlist_entries(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_product ON public.waitlist_entries(product_id);

-- Enable RLS
ALTER TABLE public.waitlist_entries ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public waitlist)
CREATE POLICY "Anyone can join waitlist" ON public.waitlist_entries
  FOR INSERT WITH CHECK (true);

-- Allow reading all entries (for count display)
CREATE POLICY "Anyone can view waitlist count" ON public.waitlist_entries
  FOR SELECT USING (true);
```

   - Click "Run" button
   - Expected result: ✅ No errors, tables created

2. **Verify Table Creation**
   - In left sidebar, click "Table Editor"
   - You should see `waitlist_entries` table
   - Click on it to verify columns:
     - `id` (UUID)
     - `email` (TEXT)
     - `product_id` (TEXT)
     - `product_title` (TEXT)
     - `created_at` (TIMESTAMPTZ)

### Step 2.3: Execute Enhancement Migration

1. **Create Query 2: Enhanced Schema**
   - Go back to "SQL Editor"
   - Click "New Query"
   - Copy content from `scripts/002_enhance_waitlist_table.sql`:

```sql
-- Enhanced Waitlist Schema Migration
-- Adds constraints, indexes, and audit columns for production readiness

-- Add unique constraint to prevent duplicate signups for same product
ALTER TABLE public.waitlist_entries
ADD CONSTRAINT unique_email_product UNIQUE(email, product_id);

-- Add email format validation at database level
ALTER TABLE public.waitlist_entries
ADD CONSTRAINT valid_email_format 
CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$');

-- Add updated_at column for audit trail
ALTER TABLE public.waitlist_entries
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Create trigger function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_waitlist_entries_updated_at ON public.waitlist_entries;
CREATE TRIGGER update_waitlist_entries_updated_at
BEFORE UPDATE ON public.waitlist_entries
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Add index on created_at for sorting/filtering recent signups
CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON public.waitlist_entries(created_at DESC);

-- Add composite index for common queries (product_id + created_at)
CREATE INDEX IF NOT EXISTS idx_waitlist_product_created ON public.waitlist_entries(product_id, created_at DESC);

-- Add index on email for duplicate checking
CREATE INDEX IF NOT EXISTS idx_waitlist_email_unique ON public.waitlist_entries(email, product_id);

-- Add comment documentation
COMMENT ON TABLE public.waitlist_entries IS 'Stores waitlist signups for products. Prevents duplicates via unique constraint and validates email format at database level.';
COMMENT ON COLUMN public.waitlist_entries.id IS 'Unique identifier generated by database';
COMMENT ON COLUMN public.waitlist_entries.email IS 'User email address, validated with regex at database level';
COMMENT ON COLUMN public.waitlist_entries.product_id IS 'Reference to product (text, not foreign key as products are hardcoded)';
COMMENT ON COLUMN public.waitlist_entries.product_title IS 'Denormalized product title for reference, set at insertion time';
COMMENT ON COLUMN public.waitlist_entries.created_at IS 'Timestamp when user joined waitlist';
COMMENT ON COLUMN public.waitlist_entries.updated_at IS 'Timestamp of last update (reserved for future use)';
```

   - Click "Run" button
   - Expected result: ✅ No errors

2. **Verify Enhancements**
   - In "Table Editor", select `waitlist_entries`
   - Check columns - should now include `updated_at`
   - Check indexes - should see all 5 indexes:
     - `idx_waitlist_email`
     - `idx_waitlist_product`
     - `idx_waitlist_created_at`
     - `idx_waitlist_product_created`
     - `idx_waitlist_email_unique`

### Step 2.4: Test Database Connection

1. **Run Test Query**
   - Create new query in SQL Editor:
   ```sql
   SELECT NOW() as current_time, 
          version() as postgresql_version,
          current_database() as database_name;
   ```
   - Click "Run"
   - Should show current timestamp and PostgreSQL version

2. **Insert Test Data** (Optional)
   ```sql
   INSERT INTO public.waitlist_entries (email, product_id, product_title)
   VALUES ('test@example.com', 'p1', 'Sample Product')
   RETURNING id, email, product_id, created_at;
   ```
   - Should succeed and return the inserted record

3. **Verify Test Data**
   ```sql
   SELECT COUNT(*) as total_entries FROM public.waitlist_entries;
   SELECT * FROM public.waitlist_entries LIMIT 5;
   ```
   - Should show your test entry

---

## PART 3: ENVIRONMENT CONFIGURATION

### Step 3.1: Set Up Local Environment File

1. **On your local machine** (not the server), in the project root:

```bash
cp .env.example .env.local
```

2. **Edit `.env.local`** with your Supabase credentials:

```dotenv
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional: Service Role Key (only used server-side, not exposed to browser)
# SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Environment
NODE_ENV=production

# Optional Analytics
# NEXT_PUBLIC_GTAG=G-XXXXXXXXXX

# Optional Error Tracking
# NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/123456
```

3. **Replace these values:**
   - `your-project.supabase.co` → Your actual project URL
   - `eyJhbGciOi...` → Your actual Anon Key (from Supabase Settings > API)

### Step 3.2: Verify Environment Configuration

1. **Test Supabase Connection Locally** (if testing locally first):

```bash
cd /workspaces/art-frames

# Install dependencies (if not already done)
pnpm install

# Start dev server
pnpm dev

# Visit http://localhost:3000/api/health
# Should return: { "status": "healthy", "checks": { "database": "connected" } }
```

2. **Build Locally** (optional verification):

```bash
pnpm build
```

---

## PART 4: DOCKER DEPLOYMENT

### Step 4.1: Build Docker Image

Execute these commands in your terminal (in the project root directory):

```bash
# Build the Docker image
docker build -t art-frames:latest .

# Verify build succeeded
docker images | grep art-frames

# Expected output:
# REPOSITORY    TAG       IMAGE ID       CREATED         SIZE
# art-frames    latest    abc123def456   2 seconds ago    152MB
```

**What this does:**
- Reads `Dockerfile`
- Installs dependencies
- Builds Next.js application
- Creates optimized Alpine Linux image (~150MB)
- Includes health check configuration

### Step 4.2: Test Docker Build Locally (Optional)

If you want to test before deploying:

```bash
# Run the container locally
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co" \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key" \
  art-frames:latest

# In another terminal, test the app
curl http://localhost:3000/api/health

# Expected output:
# {"status":"healthy","checks":{"database":"connected"},"responseTime":25}

# Stop the container
docker stop <container-id>
```

### Step 4.3: Push Docker Image to Registry

Choose one of these options:

**Option A: Docker Hub** (Free, easiest)

```bash
# Login to Docker Hub
docker login

# Tag image for Docker Hub
docker tag art-frames:latest yourusername/art-frames:latest

# Push image
docker push yourusername/art-frames:latest

# Verify push
docker images yourusername/art-frames
```

**Option B: Containerize via Docker Compose** (For VPS/Server)

```bash
# Copy docker-compose.prod.yml to your server
scp docker-compose.prod.yml user@your-server:/srv/art-frames/

# Create .env.prod on server
cat > /srv/art-frames/.env.prod << EOF
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NODE_ENV=production
EOF

# On server, build and run
cd /srv/art-frames
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

**Option C: Cloud Registry** (Google Cloud, AWS, Azure)

```bash
# Example for Google Cloud
docker tag art-frames:latest gcr.io/your-project/art-frames:latest
docker push gcr.io/your-project/art-frames:latest
```

### Step 4.4: Deploy to Production

Choose your deployment method:

**Method 1: VPS (DigitalOcean, Linode, Hetzner, etc.)**

```bash
# 1. SSH into your server
ssh user@your-server

# 2. Create application directory
mkdir -p /srv/art-frames
cd /srv/art-frames

# 3. Create environment file
cat > .env << EOF
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NODE_ENV=production
EOF

# 4. Download docker-compose file
wget https://raw.githubusercontent.com/yourusername/art-frames/main/docker-compose.yml

# 5. Pull and run image
docker pull yourusername/art-frames:latest
docker run -d \
  --restart always \
  --name art-frames \
  -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co" \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key" \
  yourusername/art-frames:latest

# 6. Verify container is running
docker ps | grep art-frames
docker logs art-frames

# 7. Configure reverse proxy (Nginx recommended)
# See Step 5 below for Nginx setup
```

**Method 2: Kubernetes** (If using k8s cluster)

```bash
# Create namespace
kubectl create namespace art-frames

# Create secret for environment variables
kubectl create secret generic art-frames-secrets \
  --from-literal=NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co" \
  --from-literal=NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key" \
  -n art-frames

# Create deployment
cat > k8s-deployment.yml << 'EOF'
apiVersion: apps/v1
kind: Deployment
metadata:
  name: art-frames
  namespace: art-frames
spec:
  replicas: 3
  selector:
    matchLabels:
      app: art-frames
  template:
    metadata:
      labels:
        app: art-frames
    spec:
      containers:
      - name: art-frames
        image: yourusername/art-frames:latest
        ports:
        - containerPort: 3000
        env:
        - name: NEXT_PUBLIC_SUPABASE_URL
          valueFrom:
            secretKeyRef:
              name: art-frames-secrets
              key: NEXT_PUBLIC_SUPABASE_URL
        - name: NEXT_PUBLIC_SUPABASE_ANON_KEY
          valueFrom:
            secretKeyRef:
              name: art-frames-secrets
              key: NEXT_PUBLIC_SUPABASE_ANON_KEY
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 10

---
apiVersion: v1
kind: Service
metadata:
  name: art-frames-service
  namespace: art-frames
spec:
  selector:
    app: art-frames
  type: LoadBalancer
  ports:
  - port: 80
    targetPort: 3000
EOF

# Apply deployment
kubectl apply -f k8s-deployment.yml

# Check status
kubectl get pods -n art-frames
kubectl get svc -n art-frames
```

**Method 3: Cloud Platforms** (Vercel, Railway, Render, Fly.io)

```bash
# Example: Vercel (recommended for Next.js)
# 1. Push code to GitHub
git push origin main

# 2. Go to https://vercel.com/new
# 3. Import your GitHub repository
# 4. Add environment variables:
#    NEXT_PUBLIC_SUPABASE_URL=...
#    NEXT_PUBLIC_SUPABASE_ANON_KEY=...
# 5. Click Deploy

# Example: Railway
# 1. Go to https://railway.app
# 2. New Project > GitHub Repo
# 3. Select art-frames repository
# 4. Add variables in settings
# 5. Deploy automatically on git push

# Example: Fly.io
flyctl auth login
flyctl launch --image yourusername/art-frames:latest
flyctl secrets set NEXT_PUBLIC_SUPABASE_URL=...
flyctl deploy
```

### Step 4.5: Set Up Reverse Proxy (Nginx on VPS)

If deploying to VPS, configure Nginx to proxy requests:

```bash
# SSH into your server
ssh user@your-server

# Install Nginx
sudo apt-get update
sudo apt-get install nginx certbot python3-certbot-nginx

# Create Nginx config
sudo tee /etc/nginx/sites-available/art-frames << 'EOF'
server {
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    listen 80;
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/art-frames /etc/nginx/sites-enabled/

# Test Nginx config
sudo nginx -t

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Get SSL certificate (Let's Encrypt)
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

---

## PART 5: VERIFICATION & TESTING

### Step 5.1: Health Check

```bash
# Test the health endpoint
curl https://your-domain.com/api/health -i

# Expected response (200 OK):
# {
#   "status": "healthy",
#   "checks": {
#     "database": "connected",
#     "api": "responsive"
#   },
#   "responseTime": 45
# }
```

### Step 5.2: Run Unit Tests Against Production

```bash
# Run unit tests (should pass regardless of environment)
pnpm test:run

# Expected: 39/39 passing
```

### Step 5.3: Run E2E Tests Against Live Server

```bash
# Run E2E tests against production
PLAYWRIGHT_TEST_BASE_URL=https://your-domain.com pnpm test:e2e

# Expected: 78/78 passing

# Or with UI mode for debugging
PLAYWRIGHT_TEST_BASE_URL=https://your-domain.com pnpm test:e2e:ui
```

### Step 5.4: Smoke Testing Checklist

- [ ] **Homepage Loads**
  ```bash
  curl https://your-domain.com | head -100
  ```

- [ ] **Product Page Works**
  ```bash
  curl https://your-domain.com/product/p1 | grep -o "title" | head -1
  ```

- [ ] **API Responds**
  ```bash
  curl https://your-domain.com/api/waitlist/count
  # Should return: {"count":0} or similar
  ```

- [ ] **Production Logs Clean**
  ```bash
  docker logs art-frames | tail -20
  # Should see minimal errors
  ```

- [ ] **Rate Limiting Works**
  ```bash
  # Test rate limit (should succeed)
  curl -X POST https://your-domain.com/api/waitlist \
    -H "Content-Type: application/json" \
    -d '{"email":"test1@example.com"}'

  # 10 more requests should fail on the 11th
  for i in {1..10}; do 
    curl -X POST https://your-domain.com/api/waitlist \
      -H "Content-Type: application/json" \
      -d "{\"email\":\"test${i}@example.com\"}"
  done

  # This one should return 429 Too Many Requests
  curl -X POST https://your-domain.com/api/waitlist \
    -H "Content-Type: application/json" \
    -d '{"email":"test-over@example.com"}'
  ```

- [ ] **Mobile Responsive**
  - Open https://your-domain.com on mobile device
  - Verify layout adapts properly
  - Test waitlist signup on mobile

- [ ] **SSL Certificate Valid**
  ```bash
  curl -vI https://your-domain.com 2>&1 | grep certificate
  ```

### Step 5.5: Performance Baseline

```bash
# Measure page load time
curl -o /dev/null -s -w "%{time_total}\n" https://your-domain.com
# Target: < 3 seconds

# Check homepage size
curl -s https://your-domain.com | wc -c
# Target: < 200KB

# Database query performance
curl https://your-domain.com/api/waitlist/count
# Target: < 100ms response
```

---

## PART 6: MONITORING & ONGOING MAINTENANCE

### Step 6.1: Set Up Monitoring

**Option A: Docker Health Checks**
```bash
# Docker already has health checks configured
docker inspect art-frames | grep -A 10 Health

# Watch health status
watch -n 5 'docker inspect art-frames | grep -A 5 Health'
```

**Option B: Uptime Monitoring (Recommended)**

Use a service like:
- UptimeRobot (free plan)
- Pingdom
- Datadog
- New Relic

Configure to ping: `https://your-domain.com/api/health`

**Option C: Alerting**

```bash
# Create a simple monitoring script
cat > monitor.sh << 'EOF'
#!/bin/bash
while true; do
  status=$(curl -s https://your-domain.com/api/health | grep -o "healthy")
  if [ "$status" != "healthy" ]; then
    echo "ALERT: Service unhealthy at $(date)" | mail -s "Art Frames Alert" admin@example.com
  fi
  sleep 60
done
EOF

chmod +x monitor.sh
```

### Step 6.2: Log Monitoring

```bash
# View recent logs
docker logs art-frames --tail 100

# Follow logs in real-time
docker logs -f art-frames

# Search logs for errors
docker logs art-frames | grep -i error

# Export logs to file
docker logs art-frames > /var/log/art-frames-$(date +%Y%m%d).log
```

### Step 6.3: Database Maintenance

**Weekly**:
```sql
-- Check table sizes
SELECT 
    tablename,
    size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Analyze query performance
EXPLAIN ANALYZE
SELECT COUNT(*) FROM public.waitlist_entries
WHERE product_id = 'p1'
AND created_at > NOW() - INTERVAL '30 days';
```

**Monthly**:
```bash
# Vacuum and analyze (Supabase does this automatically)
# But can be triggered manually via:
psql postgresql://user:pass@host:5432/postgres -c "VACUUM ANALYZE;"
```

### Step 6.4: Backup Strategy

**Supabase Automatic Backups**:
- Go to Settings > Backups
- Enable daily backups (free tier has limited retention)
- Download backups regularly for long-term storage

**Manual Backup**:
```bash
# Backup database
pg_dump postgresql://user:pass@host:5432/postgres > backup-$(date +%Y%m%d).sql

# Backup specific table
pg_dump -t waitlist_entries postgresql://user:pass@host:5432/postgres > waitlist-backup.sql

# Restore from backup
psql postgresql://user:pass@host:5432/postgres < backup-20260221.sql
```

---

## PART 7: TROUBLESHOOTING

### Issue: Database Connection Fails

**Symptoms**: Health check returns `"database": "disconnected"`

**Solutions**:
1. Verify credentials in environment variables
2. Check Supabase project is not paused
3. Verify firewall allows connections from your IP
4. Check database isn't out of connections
5. Restart container:
   ```bash
   docker restart art-frames
   ```

### Issue: Rate Limiting Too Strict

**Symptoms**: Users get 429 errors on first request

**Solution**: Adjust limits in `lib/rate-limit.ts`:
```typescript
// Current limits:
const RATE_LIMITS = {
  '/api/waitlist': { requests: 10, windowMs: 60000 }, // 10/min
  '/api/waitlist/count': { requests: 5, windowMs: 60000 } // 5/min
};

// Increase limits:
const RATE_LIMITS = {
  '/api/waitlist': { requests: 30, windowMs: 60000 }, // 30/min
  '/api/waitlist/count': { requests: 20, windowMs: 60000 } // 20/min
};
```

Then rebuild and redeploy:
```bash
docker build -t art-frames:latest .
docker stop art-frames
docker run -d ... art-frames:latest
```

### Issue: High Memory/CPU Usage

**Symptoms**: Container using excessive resources

**Solutions**:
1. Check for errors in logs: `docker logs art-frames`
2. Monitor database query performance
3. Scale horizontally (run multiple instances)
4. Increase container resources in docker-compose

### Issue: 404 on Product Pages

**Symptoms**: `/product/p1` returns 404

**Solutions**:
1. Verify product has correct ID format (p1, p2, etc.)
2. Check `lib/products.ts` has product definitions
3. Rebuild and redeploy if products were added

### Issue: Emails Bouncing on Waitlist

**Symptoms**: Disposable emails somehow getting through

**Solutions**:
1. Update disposable email list in `lib/validations.ts`
2. Add email verification step (future enhancement)
3. Implement SMTP verification with mail service

---

## DEPLOYMENT CHECKLIST

### Pre-Deployment (Before running migrations)
- [ ] Supabase project created and initialized
- [ ] Database URL and keys obtained
- [ ] Docker image builds successfully
- [ ] All tests passing (unit + E2E)
- [ ] Environment variables prepared

### Database Migration Phase
- [ ] Migration 001 executed successfully
- [ ] Migration 002 executed successfully  
- [ ] Test data inserted and verified
- [ ] Table structure confirmed
- [ ] Indexes created and verified

### Docker Deployment Phase
- [ ] Docker image pushed to registry
- [ ] Environment variables configured on server
- [ ] Container running and healthy
- [ ] Reverse proxy (Nginx) configured
- [ ] SSL certificate installed

### Post-Deployment Verification
- [ ] Health check endpoint responding (200 OK)
- [ ] Homepage loading without errors
- [ ] Product pages working
- [ ] Waitlist signup functional
- [ ] Rate limiting working
- [ ] Logs show no errors
- [ ] All 78 E2E tests passing
- [ ] Performance metrics within targets

### Launch Readiness
- [ ] Beta user list prepared
- [ ] Support/help documentation ready
- [ ] Monitoring alerts configured
- [ ] On-call team briefed
- [ ] Rollback plan documented
- [ ] Backup verified

---

## Command Quick Reference

```bash
# Supabase
# (Via web dashboard at https://supabase.com/dashboard)

# Local testing
pnpm dev                              # Start dev server
pnpm test:run                         # Run unit tests
pnpm test:e2e                         # Run E2E tests

# Docker commands
docker build -t art-frames:latest .         # Build image
docker run -p 3000:3000 art-frames:latest   # Run locally
docker ps                                   # List containers
docker logs -f art-frames                   # View logs
docker stop art-frames                      # Stop container
docker push yourusername/art-frames:latest  # Push to registry

# Deployment
docker-compose -f docker-compose.prod.yml up -d    # Deploy
docker-compose -f docker-compose.prod.yml down     # Shutdown
docker-compose logs -f                             # View logs

# Verification
curl https://your-domain.com/api/health           # Health check
curl https://your-domain.com/api/waitlist/count   # API test
PLAYWRIGHT_TEST_BASE_URL=https://your-domain.com pnpm test:e2e
```

---

## Support & Documentation

- **Setup Issues**: See README.md
- **Detailed Checklist**: See PRODUCTION_READINESS.md
- **Implementation Details**: See IMPLEMENTATION_COMPLETE.md
- **Quick Commands**: See QUICK_REFERENCE.md
- **Validation Script**: Run `./validate-production.sh`

---

## Success Criteria

✅ Deployment is successful when:
- Health check returns 200 OK with "healthy" status
- All 78 E2E tests pass against production URL
- No errors in Docker logs
- Response times < 500ms p95
- Database connectivity verified
- SSL certificate valid
- Rate limiting functioning correctly
- All product pages loading
- Waitlist signup working end-to-end

---

**Generated**: February 21, 2026  
**Status**: Ready for Execution  
**Estimated Duration**: 1.5-2 hours
