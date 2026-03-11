import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore';

// Build service-account credential from either a single JSON blob (FIREBASE_ADMIN_SDK)
// or the three individual env vars (FIREBASE_ADMIN_PROJECT_ID, _CLIENT_EMAIL, _PRIVATE_KEY).
import type { ServiceAccount } from 'firebase-admin/app';

function buildServiceAccount(): ServiceAccount | undefined {
    if (process.env.FIREBASE_ADMIN_SDK) {
        return JSON.parse(process.env.FIREBASE_ADMIN_SDK) as ServiceAccount;
    }
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    // \n characters are stored as literal '\n' in env files — normalise them.
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');
    if (projectId && clientEmail && privateKey) {
        return { projectId, clientEmail, privateKey };
    }
    return undefined;
}

const serviceAccount = buildServiceAccount();

const app =
    getApps().length === 0 && serviceAccount
        ? initializeApp({
            credential: cert(serviceAccount),
        })
        : getApps()[0];

export const adminAuth = serviceAccount ? getAdminAuth(app) : null;
export const adminDb = serviceAccount ? getAdminFirestore(app) : null;

export default app;
