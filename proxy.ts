import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

/**
 * Protected route prefixes.
 * Any path starting with one of these values requires a valid authenticated session.
 */
const PROTECTED_PREFIXES = ['/profile'];

/**
 * Routes that should be skipped entirely (static assets, Next internals).
 */
const PUBLIC_PREFIXES = [
    '/_next',
    '/api',
    '/favicon.ico',
    '/monitoring', // Sentry tunnel route
];

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip middleware for Next.js internals and API routes
    if (PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
        return NextResponse.next();
    }

    // Check whether the path needs protection
    const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
    if (!isProtected) {
        return NextResponse.next();
    }

    const { response, user } = await updateSession(request)
    if (!user) {
        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = '/auth/login';
        loginUrl.searchParams.set('next', pathname);
        return NextResponse.redirect(loginUrl);
    }

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image  (image optimisation)
         * - favicon.ico
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
