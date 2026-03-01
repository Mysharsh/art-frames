import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { adminAuth } from '@/lib/firebase/server';

const SESSION_COOKIE_NAME = '__session';
const SESSION_EXPIRES_IN_MS = 5 * 24 * 60 * 60 * 1000;

type SessionRequestBody = {
    idToken?: string;
};

export async function POST(request: Request) {
    if (!adminAuth) {
        return NextResponse.json(
            { error: 'Firebase Admin SDK is not configured on the server.' },
            { status: 500 }
        );
    }

    try {
        const body = (await request.json()) as SessionRequestBody;
        const idToken = body.idToken;

        if (!idToken) {
            return NextResponse.json({ error: 'Missing idToken' }, { status: 400 });
        }

        await adminAuth.verifyIdToken(idToken);

        const sessionCookie = await adminAuth.createSessionCookie(idToken, {
            expiresIn: SESSION_EXPIRES_IN_MS,
        });

        const cookieStore = await cookies();
        cookieStore.set(SESSION_COOKIE_NAME, sessionCookie, {
            maxAge: Math.floor(SESSION_EXPIRES_IN_MS / 1000),
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
        });

        return NextResponse.json({ ok: true });
    } catch (error) {
        return NextResponse.json({ error: 'Unable to create session.' }, { status: 401 });
    }
}

export async function DELETE() {
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, '', {
        maxAge: 0,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
    });

    return NextResponse.json({ ok: true });
}