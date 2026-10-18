import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { waitlistLimiter, countLimiter, ordersLimiter, getClientIp, checkRateLimit } from "@/lib/rate-limit"

describe("Rate Limiter", () => {
    beforeEach(() => {
        waitlistLimiter.clear()
        countLimiter.clear()
    })

    describe("Basic rate limiting", () => {
        it("should allow requests within limit", () => {
            const result1 = waitlistLimiter.isAllowed("ip-1")
            const result2 = waitlistLimiter.isAllowed("ip-1")
            const result3 = waitlistLimiter.isAllowed("ip-1")

            expect(result1.allowed).toBe(true)
            expect(result2.allowed).toBe(true)
            expect(result3.allowed).toBe(true)
        })

        it("should block requests exceeding limit", () => {
            // Make 10 requests (limit) + 1
            for (let i = 0; i < 10; i++) {
                waitlistLimiter.isAllowed("ip-1")
            }

            const result = waitlistLimiter.isAllowed("ip-1")
            expect(result.allowed).toBe(false)
            expect(result.retryAfter).toBeDefined()
            expect(result.retryAfter).toBeGreaterThan(0)
        })

        it("should isolate limits between different identifiers", () => {
            waitlistLimiter.isAllowed("ip-1")
            waitlistLimiter.isAllowed("ip-1")
            const result = waitlistLimiter.isAllowed("ip-2")

            expect(result.allowed).toBe(true)
        })

        it("should track remaining requests", () => {
            waitlistLimiter.isAllowed("ip-1")
            const remaining = waitlistLimiter.getRemaining("ip-1")
            expect(remaining).toBe(9) // 10 max - 1 used
        })

        it("should return max requests when identifier is new", () => {
            const remaining = waitlistLimiter.getRemaining("new-ip")
            expect(remaining).toBe(10)
        })
    })

    describe("Different rate limiters", () => {
        it("should have different limits", () => {
            // Waitlist limiter: 10 per minute
            // Count limiter: 5 per minute

            for (let i = 0; i < 10; i++) {
                waitlistLimiter.isAllowed("ip-1")
            }
            const waitlistResult = waitlistLimiter.isAllowed("ip-1")
            expect(waitlistResult.allowed).toBe(false)

            for (let i = 0; i < 5; i++) {
                countLimiter.isAllowed("ip-1")
            }
            const countResult = countLimiter.isAllowed("ip-1")
            expect(countResult.allowed).toBe(false)
        })
    })

    describe("Reset functionality", () => {
        it("should reset counter for identifier", () => {
            waitlistLimiter.isAllowed("ip-1")
            waitlistLimiter.isAllowed("ip-1")
            waitlistLimiter.reset("ip-1")

            const result = waitlistLimiter.isAllowed("ip-1")
            expect(result.allowed).toBe(true)
        })

        it("should clear all data", () => {
            waitlistLimiter.isAllowed("ip-1")
            waitlistLimiter.isAllowed("ip-2")
            waitlistLimiter.clear()

            expect(waitlistLimiter.getRemaining("ip-1")).toBe(10)
            expect(waitlistLimiter.getRemaining("ip-2")).toBe(10)
        })
    })

    describe("getClientIp", () => {
        it("should extract IP from x-forwarded-for header", () => {
            const request = new Request("http://localhost", {
                headers: {
                    "x-forwarded-for": "192.168.1.1, 192.168.1.2",
                },
            })
            const ip = getClientIp(request)
            expect(ip).toBe("192.168.1.1")
        })

        it("should extract IP from x-real-ip header", () => {
            const request = new Request("http://localhost", {
                headers: {
                    "x-real-ip": "10.0.0.1",
                },
            })
            const ip = getClientIp(request)
            expect(ip).toBe("10.0.0.1")
        })

        it("should extract IP from cf-connecting-ip header", () => {
            const request = new Request("http://localhost", {
                headers: {
                    "cf-connecting-ip": "172.16.0.1",
                },
            })
            const ip = getClientIp(request)
            expect(ip).toBe("172.16.0.1")
        })

        it("should return unknown as fallback", () => {
            const request = new Request("http://localhost")
            const ip = getClientIp(request)
            expect(ip).toBe("unknown")
        })

        it("should prioritize proxy-set x-real-ip over client-forgeable x-forwarded-for", () => {
            const request = new Request("http://localhost", {
                headers: {
                    "x-forwarded-for": "192.168.1.1",
                    "x-real-ip": "10.0.0.1",
                },
            })
            const ip = getClientIp(request)
            expect(ip).toBe("10.0.0.1")
        })

        it("should prioritize x-vercel-forwarded-for over other headers", () => {
            const request = new Request("http://localhost", {
                headers: {
                    "x-vercel-forwarded-for": "203.0.113.7",
                    "x-forwarded-for": "192.168.1.1",
                    "x-real-ip": "10.0.0.1",
                },
            })
            const ip = getClientIp(request)
            expect(ip).toBe("203.0.113.7")
        })
    })

    describe("Retry-After calculation", () => {
        it("should provide reasonable retry-after time", () => {
            for (let i = 0; i < 11; i++) {
                waitlistLimiter.isAllowed("ip-1")
            }
            const result = waitlistLimiter.isAllowed("ip-1")
            expect(result.retryAfter).toBeLessThanOrEqual(60)
            expect(result.retryAfter).toBeGreaterThan(0)
        })
    })

    describe("checkRateLimit", () => {
        beforeEach(() => {
            ordersLimiter.clear()
        })

        afterEach(() => {
            vi.unstubAllEnvs()
            vi.unstubAllGlobals()
        })

        it("should fall back to the in-memory limiter without Redis config", async () => {
            vi.stubEnv("UPSTASH_REDIS_REST_URL", "")
            vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "")

            for (let i = 0; i < 5; i++) {
                expect((await checkRateLimit("orders", "ip-mem")).allowed).toBe(true)
            }
            expect((await checkRateLimit("orders", "ip-mem")).allowed).toBe(false)
        })

        it("should use the shared Redis counter when configured", async () => {
            vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://redis.example.com")
            vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "token")
            const fetchMock = vi.fn().mockResolvedValue(
                new Response(JSON.stringify([{ result: 6 }, { result: 0 }, { result: 30000 }]))
            )
            vi.stubGlobal("fetch", fetchMock)

            const result = await checkRateLimit("orders", "ip-redis")

            expect(result).toEqual({ allowed: false, retryAfter: 30 })
            expect(fetchMock).toHaveBeenCalledWith(
                "https://redis.example.com/pipeline",
                expect.objectContaining({ method: "POST" })
            )
            const body = JSON.parse(fetchMock.mock.calls[0][1].body)
            expect(body[0]).toEqual(["INCR", "ratelimit:orders:ip-redis"])
        })

        it("should fall back to memory when Redis is unreachable", async () => {
            vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://redis.example.com")
            vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "token")
            vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")))
            vi.spyOn(console, "error").mockImplementation(() => {})

            const result = await checkRateLimit("orders", "ip-down")
            expect(result.allowed).toBe(true)
            expect(ordersLimiter.getRemaining("ip-down")).toBe(4)
        })
    })
})
