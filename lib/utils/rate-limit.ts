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

/**
 * Utility function to extract client IP from request
 */
export function getClientIp(request: Request): string {
    const forwarded = request.headers.get('x-forwarded-for')
    if (forwarded) {
        return forwarded.split(',')[0].trim()
    }
    const realIp = request.headers.get('x-real-ip')
    if (realIp) {
        return realIp
    }
    // Fallback for development - will be "127.0.0.1" in dev
    return request.headers.get('cf-connecting-ip') || 'unknown'
}
