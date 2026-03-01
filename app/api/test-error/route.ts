import * as Sentry from '@sentry/nextjs'
import { NextResponse } from 'next/server'

/**
 * Test error endpoint for manual Sentry testing
 * Supports multiple error types for comprehensive testing
 */

export async function GET(request: Request) {
    if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const errorType = searchParams.get('type') || 'generic'
    const message = searchParams.get('message') || 'Manual production error test'

    try {
        // Add breadcrumb for debugging
        Sentry.addBreadcrumb({
            message: `Test error triggered: ${errorType}`,
            category: 'api-test',
            level: 'info',
        })

        switch (errorType) {
            case 'generic':
                throw new Error(message)

            case 'validation':
                const validationError = new Error('Validation Failed')
                validationError.name = 'ValidationError'
                throw validationError

            case 'database':
                const dbError = new Error('Database connection failed')
                dbError.name = 'DatabaseError'
                Sentry.captureException(dbError, {
                    tags: {
                        errorType: 'database',
                        severity: 'critical',
                    },
                })
                throw dbError

            case 'unauthorized':
                const authError = new Error('Unauthorized access attempt')
                authError.name = 'AuthorizationError'
                Sentry.captureException(authError, {
                    tags: {
                        errorType: 'auth',
                        severity: 'warning',
                    },
                })
                throw authError

            case 'rate-limit':
                const rateLimitError = new Error('Rate limit exceeded')
                rateLimitError.name = 'RateLimitError'
                throw rateLimitError

            case 'timeout':
                const timeoutError = new Error('Operation timeout')
                timeoutError.name = 'TimeoutError'
                throw timeoutError

            case 'message':
                Sentry.captureMessage(message, 'error')
                return Response.json({
                    success: true,
                    message: 'Error message captured',
                    type: errorType,
                })

            default:
                throw new Error(`Unknown error type: ${errorType}`)
        }
    } catch (error) {
        // Sentry automatically captures exceptions in Next.js
        // But we can also capture it explicitly with context
        if (error instanceof Error) {
            Sentry.captureException(error, {
                tags: {
                    test: 'true',
                    errorType,
                    endpoint: '/api/test-error',
                },
                contexts: {
                    api: {
                        method: request.method,
                        url: request.url,
                        errorType,
                    },
                },
            })
        }

        // Return error response
        return Response.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                type: errorType,
                timestamp: new Date().toISOString(),
            },
            { status: 500 }
        )
    }
}

export async function POST(request: Request) {
    if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    try {
        const body = await request.json()
        const { errorType = 'generic', message = 'Manual error from POST', userId } = body

        if (userId) {
            Sentry.setUser({ id: userId })
        }

        // Throw error with context
        const error = new Error(message)
        Sentry.captureException(error, {
            tags: {
                test: 'true',
                errorType,
                method: 'POST',
            },
            extra: body,
        })

        throw error
    } catch (error) {
        Sentry.captureException(error, {
            tags: {
                endpoint: '/api/test-error',
                method: 'POST',
            },
        })

        return Response.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString(),
            },
            { status: 500 }
        )
    }
}
