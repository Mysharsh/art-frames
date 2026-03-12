import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    return NextResponse.json(
        { error: 'Manual session creation is no longer supported. Use Supabase OAuth callback flow.' },
        { status: 410 }
    );
}

export async function DELETE() {
    const cookieStore = await cookies();

    const authCookies = cookieStore
        .getAll()
        .filter((cookie) => cookie.name.startsWith('sb-') || cookie.name === '__session');

    authCookies.forEach((cookie) => {
        cookieStore.set(cookie.name, '', {
            maxAge: 0,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
        });
    });

    return NextResponse.json({ ok: true });
}