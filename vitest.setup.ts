import "@testing-library/jest-dom/vitest"

// Mock Supabase environment variables for unit tests
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test-project.supabase.co"
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key"
process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role-key"

// Site URL
process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3000"
