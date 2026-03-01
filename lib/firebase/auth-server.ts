/**
 * Server-side Firebase Auth helpers.
 * Import ONLY from Server Components, Route Handlers, or Server Actions.
 * Never import this file in client components — it uses next/headers and firebase-admin.
 */
import { cookies } from 'next/headers';
import { adminAuth } from './server';

/**
 * Verify and return the decoded Firebase session cookie.
 * Returns null if the cookie is absent or invalid.
 */
export async function getSession() {
    try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get('__session')?.value;

        if (!sessionCookie) {
            return null;
        }

        if (!adminAuth) {
            // Admin SDK not configured — cannot verify session
            console.warn('Firebase Admin SDK is not initialised. Set FIREBASE_ADMIN_SDK env var.');
            return null;
        }

        const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
        return decoded;
    } catch (error) {
        // Cookie is expired, revoked, or tampered
        return null;
    }
}

/**
 * Returns true when a valid, unexpired session cookie is present.
 */
export async function isAuthenticated(): Promise<boolean> {
    const session = await getSession();
    return session !== null;
}
