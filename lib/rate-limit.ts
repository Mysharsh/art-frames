/**
 * In-memory rate limiter for production Docker deployment
 * Uses sliding window counter algorithm with automatic cleanup
 */

interface RateLimitRecord {
    count: number
    resetTime: number
}

class RateLimiter {
    private store: Map<string, RateLimitRecord> = new Map()
    private readonly windowMs: number
    private readonly maxRequests: number

    constructor(windowMs: number = 60000, maxRequests: number = 5) {
        this.windowMs = windowMs // Time window in milliseconds (default: 1 minute)
        this.maxRequests = maxRequests // Max requests per window (default: 5)

        // Cleanup expired entries every 5 minutes
        setInterval(() => this.cleanup(), 5 * 60 * 1000)
    }

    /**
     * Check if request is allowed and increment counter
     * @param identifier Unique identifier (IP address, email, etc.)
     * @returns Object with allowed status and retry-after time
     */
    isAllowed(identifier: string): { allowed: boolean; retryAfter?: number } {
        const now = Date.now()
        const record = this.store.get(identifier)

        if (!record || now > record.resetTime) {
            // First request or window expired
            this.store.set(identifier, {
                count: 1,
                resetTime: now + this.windowMs,
            })
            return { allowed: true }
        }

        record.count += 1

        if (record.count > this.maxRequests) {
            const retryAfter = Math.ceil((record.resetTime - now) / 1000)
            return { allowed: false, retryAfter }
        }

        return { allowed: true }
    }

    /**
     * Remove expired entries from store
     */
    private cleanup(): void {
        const now = Date.now()
        for (const [key, record] of this.store.entries()) {
            if (now > record.resetTime) {
                this.store.delete(key)
            }
        }
    }

    /**
     * Get remaining requests for identifier
     */
    getRemaining(identifier: string): number {
        const record = this.store.get(identifier)
        if (!record || Date.now() > record.resetTime) {
            return this.maxRequests
        }
        return Math.max(0, this.maxRequests - record.count)
    }

    /**
     * Reset counter for identifier
     */
    reset(identifier: string): void {
        this.store.delete(identifier)
    }

    /**
     * Clear all records (useful for testing)
     */
    clear(): void {
        this.store.clear()
    }
}

// Export singleton instance (new window = 60s, max 10 requests per minute for waitlist endpoint)
export const waitlistLimiter = new RateLimiter(60 * 1000, 10)

// Tighter limit for public count endpoint (5 requests per minute)
export const countLimiter = new RateLimiter(60 * 1000, 5)

// Order creation (5 requests per minute)
export const ordersLimiter = new RateLimiter(60 * 1000, 5)

export type RateLimitPolicy = 'waitlist' | 'count' | 'orders'

const policies: Record<RateLimitPolicy, { limiter: RateLimiter; windowMs: number; max: number }> = {
    waitlist: { limiter: waitlistLimiter, windowMs: 60 * 1000, max: 10 },
    count: { limiter: countLimiter, windowMs: 60 * 1000, max: 5 },
    orders: { limiter: ordersLimiter, windowMs: 60 * 1000, max: 5 },
}

type UpstashResult = Array<{ result?: number; error?: string }>

/**
 * Fixed-window counter in Upstash Redis via its REST API, shared by every
 * serverless instance. Returns null if Redis is not configured or unreachable.
 */
async function checkWithUpstash(
    key: string,
    windowMs: number,
    max: number
): Promise<{ allowed: boolean; retryAfter?: number } | null> {
    const url = process.env.UPSTASH_REDIS_REST_URL
    const token = process.env.UPSTASH_REDIS_REST_TOKEN
    if (!url || !token) {
        return null
    }

    try {
        const response = await fetch(`${url.replace(/\/$/, '')}/pipeline`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify([
                ['INCR', key],
                ['PEXPIRE', key, String(windowMs), 'NX'],
                ['PTTL', key],
            ]),
            cache: 'no-store',
        })

        if (!response.ok) {
            throw new Error(`Upstash responded with ${response.status}`)
        }

        const [incr, , pttl] = (await response.json()) as UpstashResult
        if (typeof incr?.result !== 'number') {
            throw new Error(incr?.error || 'Unexpected Upstash response')
        }

        if (incr.result > max) {
            const ttlMs = typeof pttl?.result === 'number' && pttl.result > 0 ? pttl.result : windowMs
            return { allowed: false, retryAfter: Math.ceil(ttlMs / 1000) }
        }

        return { allowed: true }
    } catch (error) {
        console.error('Rate limit store unavailable, using in-memory fallback:', error)
        return null
    }
}

/**
 * Check a request against a named policy. Uses Redis when UPSTASH_REDIS_REST_URL and
 * UPSTASH_REDIS_REST_TOKEN are set (required on serverless hosts such as Vercel, where
 * memory is per instance); otherwise falls back to the in-memory limiter.
 */
export async function checkRateLimit(
    policy: RateLimitPolicy,
    identifier: string
): Promise<{ allowed: boolean; retryAfter?: number }> {
    const { limiter, windowMs, max } = policies[policy]
    const shared = await checkWithUpstash(`ratelimit:${policy}:${identifier}`, windowMs, max)
    return shared ?? limiter.isAllowed(identifier)
}

/**
 * Extract the client IP. Headers set by the hosting proxy (Vercel, nginx) are preferred
 * because they overwrite any client-supplied value; the first x-forwarded-for entry can be
 * forged by the client behind proxies that append to it, so it is only a fallback.
 */
export function getClientIp(request: Request): string {
    const vercelIp = request.headers.get('x-vercel-forwarded-for')
    if (vercelIp) {
        return vercelIp.split(',')[0].trim()
    }
    const realIp = request.headers.get('x-real-ip')
    if (realIp) {
        return realIp.trim()
    }
    const forwarded = request.headers.get('x-forwarded-for')
    if (forwarded) {
        return forwarded.split(',')[0].trim()
    }
    return request.headers.get('cf-connecting-ip') || 'unknown'
}
