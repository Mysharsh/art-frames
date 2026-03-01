import {
    signInWithPopup,
    GoogleAuthProvider,
    signOut as firebaseSignOut,
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { auth } from './client';

// Firebase handles persistence automatically via localStorage
// No server-side session management needed

/**
 * Create and configure Google Auth Provider
 */
function getGoogleProvider() {
    const provider = new GoogleAuthProvider();

    // Add required scopes for user profile information
    provider.addScope('profile');
    provider.addScope('email');

    return provider;
}

/**
 * Sign in with Google OAuth
 */
export async function signInWithGoogle() {
    try {
        // Log initialization state for debugging
        console.log('[Auth Debug] Attempting Google sign-in...', {
            authInitialized: !!auth,
            authApp: !!auth?.app,
            authDomain: auth?.app?.options?.authDomain,
            projectId: auth?.app?.options?.projectId,
        });

        const googleProvider = getGoogleProvider();
        console.log('[Auth Debug] Google provider created with scopes:', {
            scopes: ['profile', 'email'],
        });

        // Verify auth is properly initialized
        if (!auth || !auth.app) {
            throw new Error('Firebase Auth is not properly initialized. Check your configuration.');
        }

        console.log('[Auth Debug] Starting signInWithPopup...');
        const result = await signInWithPopup(auth, googleProvider);
        console.log('[Auth Debug] Sign-in successful!', {
            uid: result.user.uid,
            email: result.user.email,
            displayName: result.user.displayName,
        });
        return result.user;
    } catch (error) {
        const firebaseError = error as FirebaseError;

        // Log full error for debugging
        console.error('Google sign-in error:', {
            code: firebaseError?.code || 'unknown',
            message: firebaseError?.message || String(error),
            errorString: error instanceof Error ? error.toString() : String(error),
            errorName: firebaseError?.name || 'Unknown Error',
        });

        // Handle specific Firebase auth errors
        if (firebaseError.code === 'auth/popup-closed-by-user') {
            throw new Error('Sign-in was cancelled');
        }
        if (firebaseError.code === 'auth/popup-blocked') {
            throw new Error('Sign-in popup was blocked. Please allow popups and try again');
        }
        if (firebaseError.code === 'auth/internal-error') {
            throw new Error('Firebase authentication error. Please check your API key and Firebase configuration in the console.');
        }
        if (firebaseError.code === 'auth/invalid-api-key') {
            throw new Error('Invalid Firebase API key. Check your environment variables.');
        }
        if (firebaseError.code === 'auth/unauthorized-domain') {
            throw new Error('This domain is not authorized. Add it to Firebase Console > Authentication > Settings > Authorized domains.');
        }

        throw error instanceof Error ? error : new Error('Authentication failed');
    }
}

/**
 * Sign out the current user
 */
export async function signOut() {
    try {
        await firebaseSignOut(auth);
        // Firebase clears local auth state automatically
    } catch (error) {
        console.error('Sign out error:', error);
        throw error;
    }
}

/**
 * Get the current user from the client
 */
export function getCurrentUser() {
    return auth.currentUser;
}

/**
 * Get user ID token for authenticated requests
 */
export async function getIdToken() {
    const user = auth.currentUser;
    if (!user) return null;

    try {
        return await user.getIdToken();
    } catch (error) {
        console.error('Get ID token error:', error);
        return null;
    }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
    return !!auth.currentUser;
}
