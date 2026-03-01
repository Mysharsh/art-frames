import {
    collection,
    query,
    where,
    getDocs,
    addDoc,
    deleteDoc,
    updateDoc,
    setDoc,
    doc,
    getDoc,
    Query,
    WriteBatch,
    writeBatch,
    getCountFromServer,
} from 'firebase/firestore';
import { db } from './client';

/**
 * Firestore utility functions for database operations
 */

export async function getWaitlistEntry(email: string, productId: string) {
    const q = query(
        collection(db, 'waitlist'),
        where('email', '==', email),
        where('product_id', '==', productId)
    );
    const snapshot = await getDocs(q);
    return snapshot.empty ? null : snapshot.docs[0];
}

export async function addWaitlistEntry(data: {
    email: string;
    product_id: string;
    product_title: string;
}) {
    return await addDoc(collection(db, 'waitlist'), {
        ...data,
        created_at: new Date(),
        updated_at: new Date(),
    });
}

export async function deleteWaitlistEntry(email: string, productId: string) {
    const entry = await getWaitlistEntry(email, productId);
    if (entry) {
        await deleteDoc(entry.ref);
    }
}

export async function getWaitlistCount(productId: string) {
    const q = query(collection(db, 'waitlist'), where('product_id', '==', productId));
    const snapshot = await getDocs(q);
    return snapshot.size;
}

export async function getWaitlistEntries(productId: string) {
    const q = query(collection(db, 'waitlist'), where('product_id', '==', productId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
    }));
}

export async function getUserProfile(userId: string) {
    const docSnap = await getDoc(doc(db, 'users', userId));
    return docSnap.exists() ? docSnap.data() : null;
}

export async function createUserProfile(userId: string, data: {
    email: string;
    full_name?: string;
    avatar_url?: string;
}) {
    return await setDoc(doc(db, 'users', userId), {
        ...data,
        role: 'user',
        created_at: new Date(),
        updated_at: new Date(),
    }, { merge: true });
}

export async function updateUserProfile(userId: string, data: Partial<{
    full_name: string;
    avatar_url: string;
}>) {
    return await updateDoc(doc(db, 'users', userId), {
        ...data,
        updated_at: new Date(),
    });
}

export async function isAdmin(userId: string): Promise<boolean> {
    const profile = await getUserProfile(userId);
    return profile?.role === 'admin';
}
