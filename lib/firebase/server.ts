import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK (server-side only)
const serviceAccount = process.env.FIREBASE_ADMIN_SDK
    ? JSON.parse(process.env.FIREBASE_ADMIN_SDK)
    : undefined;

const app =
    getApps().length === 0 && serviceAccount
        ? initializeApp({
            credential: cert(serviceAccount),
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        })
        : getApps()[0];

export const adminAuth = serviceAccount ? getAdminAuth(app) : null;
export const adminDb = serviceAccount ? getAdminFirestore(app) : null;

export default app;
