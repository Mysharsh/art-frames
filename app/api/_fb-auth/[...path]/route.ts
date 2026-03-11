import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const FIREBASE_AUTH_DOMAIN = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;

// Headers that must not be forwarded from the upstream response to avoid
// conflict with Next.js / Vercel's own response headers.
const HOP_BY_HOP = new Set([
    'connection',
    'keep-alive',
    'transfer-encoding',
    'te',
    'trailer',
    'upgrade',
    'proxy-authorization',
    'proxy-authenticate',
]);

async function handler(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    if (!FIREBASE_AUTH_DOMAIN) {
        return NextResponse.json(
            { error: 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN is not configured.' },
            { status: 500 }
        );
    }

    const { path } = await params;
    const search = request.nextUrl.search ?? '';
    const targetUrl = `https://${FIREBASE_AUTH_DOMAIN}/__/auth/${path.join('/')}${search}`;

    // Forward the request upstream but do NOT follow redirects automatically.
    // Following them server-side is exactly what produces the 508 loop.
    const upstream = await fetch(targetUrl, {
        method: request.method,
        headers: request.headers,
        body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : null,
        redirect: 'manual',
        // @ts-expect-error — Node 18 fetch duplex requirement
        duplex: 'half',
    });

    // For 3xx responses: hand the redirect back to the *browser*, not Vercel.
    // The browser popup will follow it, read location.hash, and complete auth.
    if (upstream.status >= 300 && upstream.status < 400) {
        const location = upstream.headers.get('location');
        if (location) {
            return NextResponse.redirect(location, { status: upstream.status });
        }
    }

    // For all other responses: stream the body back with the original status & safe headers.
    const responseHeaders = new Headers();
    upstream.headers.forEach((value, key) => {
        if (!HOP_BY_HOP.has(key.toLowerCase())) {
            responseHeaders.set(key, value);
        }
    });

    return new NextResponse(upstream.body, {
        status: upstream.status,
        headers: responseHeaders,
    });
}

export const GET = handler;
export const POST = handler;
