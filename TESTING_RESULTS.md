# Manual Browser Testing Checklist

## Test Results Summary

**Test Date:** February 28, 2026  
**Application:** Art Frames E-commerce Platform  
**Test Base URL:** http://localhost:3000

---

## Automated API & Page Tests ✅

All 21 automated tests passed:
- 6 main pages (Homepage, Waitlist, Login, Register, Profile, Auth Callback)
- 4 product pages (P1, P2, P10, P32)
- 6 API endpoint tests (Health, Waitlist GET/POST, Validation)
- 2 error pages (404, Invalid Product)
- 3 content verification tests

---

## Manual Browser Testing Guide

### 1. Homepage (`/`) - VISUAL TESTING

**Components to Test:**
- [ ] Hero Banner displays properly
- [ ] Category Chips are clickable and filter products
- [ ] Category Thumbnails navigate to filtered views
- [ ] Product Grid displays all products
- [ ] Product Cards show:
  - [ ] Product images load
  - [ ] Product titles display
  - [ ] Prices display correctly
  - [ ] Hover states work
  - [ ] Click navigates to product detail
- [ ] Offer Ticker scrolls continuously
- [ ] Search icon opens search overlay
- [ ] Search overlay:
  - [ ] Opens on click
  - [ ] Close button works
  - [ ] Search input accepts text
  - [ ] Search results display
  - [ ] Escape key closes overlay

**Header Navigation:**
- [ ] Logo links to homepage
- [ ] All navigation links work
- [ ] Mobile menu toggle (hamburger icon) works
- [ ] Mobile menu displays all navigation items
- [ ] Mobile menu closes on link click

**Bottom Navigation (Mobile):**
- [ ] Home button works
- [ ] Category button works
- [ ] Search button works
- [ ] Profile button works

---

### 2. Product Detail Pages (`/product/[id]`)

**Test Products:**
- `/product/p1` - Test product 1
- `/product/p2` - Test product 2
- `/product/p10` - Test product 10
- `/product/p32` - Test product 32

**Features to Test:**
- [ ] Product images display
- [ ] Image gallery navigation works
- [ ] Product title displays
- [ ] Price displays correctly
- [ ] Product description shows
- [ ] Product Tabs work:
  - [ ] Description tab
  - [ ] Specifications tab
  - [ ] Reviews tab
  - [ ] Tab switching is smooth
- [ ] Size selector (if available):
  - [ ] Options display
  - [ ] Selection works
  - [ ] Selected state shows
- [ ] Quantity selector:
  - [ ] Increment button works
  - [ ] Decrement button works
  - [ ] Manual input works
  - [ ] Validation (min/max)
- [ ] Add to Cart button:
  - [ ] Click triggers action
  - [ ] Loading state shows
  - [ ] Success feedback
- [ ] Add to Wishlist button:
  - [ ] Click triggers action
  - [ ] Icon toggles state
- [ ] Breadcrumb navigation:
  - [ ] Displays current path
  - [ ] Links work
- [ ] Related products section:
  - [ ] Products display
  - [ ] Click navigates to product

---

### 3. Waitlist Page (`/waitlist`)

**Form Testing:**
- [ ] Page loads successfully
- [ ] Email input field:
  - [ ] Accepts valid email
  - [ ] Shows error for invalid email
  - [ ] Required field validation
- [ ] Product selection (if available):
  - [ ] Dropdown/select works
  - [ ] Products listed
- [ ] Submit button:
  - [ ] Click submits form
  - [ ] Loading state shows
  - [ ] Success message displays
  - [ ] Error messages display properly
- [ ] Form validation:
  - [ ] Empty email shows error
  - [ ] Invalid format shows error
  - [ ] Duplicate entry shows conflict message

**Waitlist Modal (if on other pages):**
- [ ] Modal opens from trigger button
- [ ] Modal close button works
- [ ] Click outside closes modal
- [ ] Escape key closes modal
- [ ] Form submission works in modal
- [ ] Success/error states display

---

### 4. Authentication Pages

#### Login Page (`/auth/login`)
- [ ] Email input field works
- [ ] Password input field works
- [ ] Password visibility toggle
- [ ] Submit button:
  - [ ] Triggers login
  - [ ] Loading state
  - [ ] Success redirect
  - [ ] Error messages
- [ ] Form validation:
  - [ ] Required fields
  - [ ] Email format
  - [ ] Password requirements
- [ ] "Forgot Password" link works
- [ ] "Create Account" link works

#### Register Page (`/auth/register`)
- [ ] Email input field works
- [ ] Password input field works
- [ ] Confirm password field works
- [ ] Name/username field (if available)
- [ ] Password strength indicator
- [ ] Submit button:
  - [ ] Triggers registration
  - [ ] Loading state
  - [ ] Success redirect
  - [ ] Error messages
- [ ] Form validation:
  - [ ] Email uniqueness
  - [ ] Password match
  - [ ] Password strength
- [ ] "Already have account" link works

---

### 5. Profile Page (`/profile`)

**Features to Test:**
- [ ] User information displays
- [ ] Profile picture/avatar displays
- [ ] Edit profile form:
  - [ ] Input fields editable
  - [ ] Save changes button works
  - [ ] Cancel button works
  - [ ] Validation on save
- [ ] Profile sections:
  - [ ] Personal info
  - [ ] Order history (if implemented)
  - [ ] Wishlist items (if implemented)
  - [ ] Account settings
- [ ] Logout button:
  - [ ] Click logs out
  - [ ] Redirects to login

---

### 6. Error Pages

#### 404 Not Found (`/non-existent-page`)
- [ ] Custom 404 page displays
- [ ] "Go Home" button works
- [ ] Maintains header/footer
- [ ] Styling matches site design

#### Product Error Handling
- [ ] Invalid product ID shows error
- [ ] Error boundary catches errors
- [ ] Sentry error boundary shows custom UI
- [ ] "Try Again" button works

---

### 7. UI Components Testing

#### Buttons
- [ ] Primary button style renders
- [ ] Secondary button style renders
- [ ] Destructive button style renders
- [ ] Outline button style renders
- [ ] Ghost button style renders
- [ ] Link button style renders
- [ ] Small size works
- [ ] Default size works
- [ ] Large size works
- [ ] Icon buttons work
- [ ] Disabled state shows
- [ ] Disabled button not clickable
- [ ] Hover states work
- [ ] Focus states visible
- [ ] Loading spinner shows

#### Cards
- [ ] Product cards render properly
- [ ] Card hover effects work
- [ ] Card shadows display
- [ ] Card borders display
- [ ] Card content alignment correct

#### Badges
- [ ] Default badge displays
- [ ] Secondary badge displays
- [ ] Destructive badge displays
- [ ] Outline badge displays
- [ ] Badge sizes correct

#### Inputs & Labels
- [ ] Input focus ring shows
- [ ] Label associates with input
- [ ] Placeholder text displays
- [ ] Input validation styles
- [ ] Error states display
- [ ] Success states display
- [ ] Disabled state shows

---

### 8. Responsive Design Testing

#### Desktop (1920px+)
- [ ] Full width layout displays
- [ ] Navigation bar horizontal
- [ ] Product grid 4-5 columns
- [ ] Images full quality
- [ ] No horizontal scroll

#### Laptop (1024px - 1919px)
- [ ] Layout adapts
- [ ] Navigation readable
- [ ] Product grid 3-4 columns
- [ ] Content fits screen

#### Tablet (768px - 1023px)
- [ ] Mobile menu appears
- [ ] Product grid 2-3 columns
- [ ] Touch targets adequate
- [ ] Forms usable

#### Mobile (320px - 767px)
- [ ] Single column layout
- [ ] Bottom navigation appears
- [ ] Product grid 1-2 columns
- [ ] Touch-friendly buttons
- [ ] Hamburger menu works
- [ ] No horizontal scroll
- [ ] Text readable

---

### 9. Performance Testing

#### Page Load Speed
- [ ] Homepage loads < 3 seconds
- [ ] Product page loads < 2 seconds
- [ ] Images lazy load
- [ ] No layout shift (CLS)
- [ ] Smooth scrolling

#### Interactions
- [ ] Button clicks instant (<100ms)
- [ ] Form submissions responsive
- [ ] Navigation smooth
- [ ] Animations smooth (60fps)
- [ ] No jank on scroll

---

### 10. Accessibility Testing

#### Keyboard Navigation
- [ ] Tab key moves focus
- [ ] Enter activates buttons/links
- [ ] Escape closes modals
- [ ] Arrow keys navigate lists
- [ ] Focus visible on all elements
- [ ] Skip to content link

#### Screen Reader
- [ ] Images have alt text
- [ ] Buttons have labels
- [ ] Form inputs labeled
- [ ] ARIA labels present
- [ ] Landmarks defined
- [ ] Heading hierarchy correct

#### Color Contrast
- [ ] Text readable on backgrounds
- [ ] Links distinguishable
- [ ] Focus indicators visible
- [ ] Error messages clear

---

### 11. Browser Compatibility

Test on multiple browsers:
- [ ] **Chrome/Edge** (Chromium)
- [ ] **Firefox**
- [ ] **Safari**
- [ ] **Mobile Safari** (iOS)
- [ ] **Chrome Mobile** (Android)

---

### 12. API Integration Testing

#### Health Check API
```bash
curl http://localhost:3000/api/health
```
- [ ] Returns 200 OK
- [ ] Returns JSON with status
- [ ] Shows database connection status

#### Waitlist API
```bash
# GET count
curl http://localhost:3000/api/waitlist

# POST entry
curl -X POST -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","productId":"p1"}' \
  http://localhost:3000/api/waitlist
```
- [ ] GET returns count
- [ ] POST creates entry
- [ ] Validation works
- [ ] Rate limiting works
- [ ] Duplicate prevention works

---

### 13. Security Testing

#### Headers
- [ ] X-Content-Type-Options: nosniff
- [ ] X-Frame-Options: DENY
- [ ] X-XSS-Protection present
- [ ] Referrer-Policy set
- [ ] Content-Security-Policy present

#### Input Sanitization
- [ ] XSS attempts blocked
- [ ] SQL injection prevented
- [ ] Script tags escaped
- [ ] HTML entities escaped

#### Rate Limiting
- [ ] API rate limits enforce
- [ ] 429 status on exceeded
- [ ] Retry-After header present

---

### 14. Sentry Error Tracking

#### Error Capture
- [ ] JavaScript errors captured
- [ ] API errors logged
- [ ] User context set
- [ ] Breadcrumbs recorded
- [ ] Error boundary displays

**To test:** Trigger an error and check:
1. Custom error UI appears
2. Error logged to console (dev mode)
3. Sentry captures error (if DSN configured)

---

### 15. Database Integration

#### Supabase Connection
- [ ] Health API shows DB connected
- [ ] Waitlist entries save to DB
- [ ] Queries execute successfully
- [ ] RLS policies work
- [ ] No connection errors

---

## Test Execution Summary

**Automated Tests:** ✅ 21/21 Passed  
**Manual Browser Tests:** To be executed  
**Performance:** To be measured  
**Accessibility:** To be audited  
**Security:** Headers verified  

---

## Critical Issues Found

None - All automated tests passing.

## Warnings/Notes

1. **Sentry DSN Not Configured**: Set `NEXT_PUBLIC_SENTRY_DSN` in `.env.local` for production error tracking
2. **Cross-Origin Warning**: Consider adding `allowedDevOrigins` to next.config.mjs for development
3. **Image Optimization Disabled**: `unoptimized: true` - consider enabling for production

---

## Recommended Next Steps

1. ✅ Run automated test suite (`pnpm test:run`)
2. ✅ Run build verification (`pnpm build`)
3. Execute manual browser tests above
4. Configure Sentry DSN for error tracking
5. Test on multiple browsers
6. Test on real mobile devices
7. Run Lighthouse audit for performance
8. Run accessibility audit (a11y tools)
9. Load testing with k6 or Artillery
10. Security scan with OWASP ZAP

---

## Test Environment

- **Node Version:** 20.x
- **Package Manager:** pnpm 10.30.1
- **Framework:** Next.js 16.1.6
- **Database:** Supabase PostgreSQL
- **Error Tracking:** @sentry/nextjs 10.40.0
- **Testing:** Vitest 4.0.18, Playwright

---

## Quick Test Commands

```bash
# Start development server
pnpm dev

# Run unit tests
pnpm test:run

# Run E2E tests (when configured)
pnpm test:e2e

# Build for production
pnpm build

# Type check
pnpm tsc --noEmit

# Lint code
pnpm lint

# Run automated app tests
./test-app.sh
```
