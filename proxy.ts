import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Protected route prefixes.
 * Any path starting with one of these values requires a valid session cookie.
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

export function proxy(request: NextRequest) {
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

    // Check for session cookie — full cryptographic verification happens in the
    // Server Component/Route Handler via lib/firebase/auth-server.ts.
    // The middleware acts as a first-pass redirect to avoid loading protected pages
    // for users who have no session at all.
    const sessionCookie = request.cookies.get('__session');

    if (!sessionCookie?.value) {
        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = '/auth/login';
        loginUrl.searchParams.set('next', pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
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
