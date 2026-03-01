import "@testing-library/jest-dom/vitest"

// Mock Firebase client environment variables for unit tests
process.env.NEXT_PUBLIC_FIREBASE_API_KEY = "test-api-key"
process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = "test-project.firebaseapp.com"
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = "test-project"
process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = "test-project.appspot.com"
process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = "123456789"
process.env.NEXT_PUBLIC_FIREBASE_APP_ID = "1:123456789:web:abcdef"

// Site URL
process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3000"
