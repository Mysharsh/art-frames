import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Validate Firebase configuration
const isConfigValid = firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId;

if (!isConfigValid) {
    console.error(
        'Firebase configuration is incomplete. Missing required environment variables.',
        {
            hasApiKey: !!firebaseConfig.apiKey,
            hasAuthDomain: !!firebaseConfig.authDomain,
            hasProjectId: !!firebaseConfig.projectId,
            hasAppId: !!firebaseConfig.appId,
        }
    );
}

// Initialize Firebase (prevents multiple initializations)
let app;
try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    console.log('[Firebase] App initialized successfully', {
        projectId: firebaseConfig.projectId,
        authDomain: firebaseConfig.authDomain,
        appsCount: getApps().length,
    });
} catch (error) {
    console.error('Failed to initialize Firebase:', error);
    throw new Error('Firebase initialization failed. Check your configuration.');
}

// Get Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

console.log('[Firebase] Auth and Firestore services initialized', {
    authReady: !!auth,
    dbReady: !!db,
});

export default app;

