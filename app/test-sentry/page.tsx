'use client'

import { captureException, captureMessage, setUserContext, addBreadcrumb } from '@/lib/sentry'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export default function SentryTestPage() {
    const [status, setStatus] = useState<string>('')
    const [loading, setLoading] = useState(false)

    const testThrowError = () => {
        addBreadcrumb('User clicked throw error button', 'user-action')
        setStatus('🔴 Throwing error...')
        throw new Error('🎯 Sentry Test Error - This is intentional! Check your Sentry dashboard.')
    }

    const testCaptureError = () => {
        setStatus('📤 Capturing error...')
        addBreadcrumb('User clicked manual capture button', 'user-action')
        try {
            throw new Error('Manual error capture test')
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err))
            captureException(error, {
                context: 'manual-test',
                timestamp: new Date().toISOString(),
                testName: 'manual-error-capture'
            })
            setStatus('✅ Error captured! Check Sentry dashboard (may take 5-10 seconds)')
        }
    }

    const testCaptureMessage = () => {
        setStatus('💬 Sending message...')
        captureMessage('✅ Test message from Art Frames - Sentry is working!', 'info')
        addBreadcrumb('Message captured', 'signal')
        setStatus('✅ Message sent! Check Sentry dashboard')
    }

    const testUserContext = () => {
        setStatus('👤 Setting user context...')
        setUserContext('test-user-123', 'test@example.com')
        captureMessage('User context set for test@example.com', 'info')
        setStatus('✅ User context set and message sent!')
    }

    const testServerError = async (errorType: string) => {
        setLoading(true)
        setStatus(`🚀 Testing server error: ${errorType}...`)
        try {
            const response = await fetch(`/api/test-error?type=${errorType}`)
            if (!response.ok) {
                const data = await response.json()
                setStatus(`✅ Server error triggered! Type: ${errorType}\n📊 Response: ${JSON.stringify(data)}`)
            }
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err))
            captureException(error, {
                context: 'server-test',
                errorType,
                timestamp: new Date().toISOString()
            })
            setStatus(`❌ Network error: ${error.message}`)
        } finally {
            setLoading(false)
        }
    }

    const testServerValidationError = () => testServerError('validation')
    const testServerDatabaseError = () => testServerError('database')
    const testServerAuthError = () => testServerError('unauthorized')
    const testServerTimeoutError = () => testServerError('timeout')
    const testServerRateLimitError = () => testServerError('rate-limit')

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-lg shadow-xl p-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">
                            🚨 Sentry Test Page
                        </h1>
                        <p className="text-slate-600">
                            Test Sentry error tracking and monitoring
                        </p>
                    </div>

                    {/* Status */}
                    {status && (
                        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-blue-900 font-medium whitespace-pre-wrap">{status}</p>
                        </div>
                    )}

                    {/* Test Buttons */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        {/* Client-Side Tests */}
                        <div>
                            <h3 className="text-sm font-semibold text-slate-700 mb-2">
                                🔴 Client-Side Errors
                            </h3>
                            <Button
                                onClick={testThrowError}
                                variant="destructive"
                                className="w-full mb-2"
                                disabled={loading}
                            >
                                Throw Error
                            </Button>
                            <Button
                                onClick={testCaptureError}
                                variant="outline"
                                className="w-full"
                                disabled={loading}
                            >
                                Capture Error
                            </Button>
                        </div>

                        {/* Messages & Context */}
                        <div>
                            <h3 className="text-sm font-semibold text-slate-700 mb-2">
                                💬 Messages & Context
                            </h3>
                            <Button
                                onClick={testCaptureMessage}
                                variant="secondary"
                                className="w-full mb-2"
                                disabled={loading}
                            >
                                Send Message
                            </Button>
                            <Button
                                onClick={testUserContext}
                                variant="outline"
                                className="w-full"
                                disabled={loading}
                            >
                                Set User Context
                            </Button>
                        </div>
                    </div>

                    {/* Server-Side Tests */}
                    <div className="mb-8">
                        <h2 className="text-lg font-bold text-slate-900 mb-3">🚀 Server-Side (Production) Tests</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            <Button
                                onClick={testServerValidationError}
                                variant="outline"
                                className="w-full"
                                disabled={loading}
                            >
                                Validation Error
                            </Button>
                            <Button
                                onClick={testServerDatabaseError}
                                variant="outline"
                                className="w-full"
                                disabled={loading}
                            >
                                Database Error
                            </Button>
                            <Button
                                onClick={testServerAuthError}
                                variant="outline"
                                className="w-full"
                                disabled={loading}
                            >
                                Auth Error
                            </Button>
                            <Button
                                onClick={testServerTimeoutError}
                                variant="outline"
                                className="w-full"
                                disabled={loading}
                            >
                                Timeout Error
                            </Button>
                            <Button
                                onClick={testServerRateLimitError}
                                variant="outline"
                                className="w-full"
                                disabled={loading}
                            >
                                Rate Limit Error
                            </Button>
                        </div>
                    </div>

                    {/* Instructions */}
                    <div className="bg-slate-50 rounded-lg p-6 mb-6">
                        <h2 className="font-semibold text-slate-900 mb-3">📋 How to Test:</h2>
                        <ol className="space-y-2 text-slate-700 text-sm">
                            <li>1. Click any button above (client or server side)</li>
                            <li>2. Go to your <a href="https://sentry.io" target="_blank" className="text-blue-600 hover:underline">Sentry Dashboard</a></li>
                            <li>3. Navigate to your <strong>art-frames</strong> project</li>
                            <li>4. Check the <strong>Issues</strong> tab</li>
                            <li>5. You should see your test error/message appear within 5-10 seconds</li>
                            <li>6. Click on it to see full details, stack trace, and user context</li>
                            <li>7. <strong>Server-side tests</strong> simulate production errors from the backend</li>
                        </ol>
                    </div>

                    {/* Test Types Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                            <h3 className="font-semibold text-blue-900 mb-2">👨‍💻 Client-Side Tests</h3>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>✓ Direct JavaScript errors</li>
                                <li>✓ Manual error captures</li>
                                <li>✓ Message sending</li>
                                <li>✓ User context tracking</li>
                            </ul>
                        </div>

                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                            <h3 className="font-semibold text-purple-900 mb-2">🚀 Server-Side Tests (Production)</h3>
                            <ul className="text-sm text-purple-800 space-y-1">
                                <li>✓ API route errors</li>
                                <li>✓ Database failures</li>
                                <li>✓ Authentication errors</li>
                                <li>✓ Rate limiting & timeouts</li>
                            </ul>
                        </div>
                    </div>

                    {/* Info Box */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                        <h3 className="font-semibold text-green-900 mb-2">✅ Sentry Features</h3>
                        <ul className="text-sm text-green-800 space-y-1">
                            <li>✓ Automatic error capture (client & server)</li>
                            <li>✓ Manual error logging</li>
                            <li>✓ Performance monitoring</li>
                            <li>✓ Session replay</li>
                            <li>✓ User context tracking</li>
                            <li>✓ Breadcrumb trails</li>
                            <li>✓ Production error simulation</li>
                            <li>✓ API error tracking</li>
                        </ul>
                    </div>

                    {/* Production Testing Guide */}
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-6">
                        <h3 className="font-semibold text-orange-900 mb-2">🏭 Production Error Testing</h3>
                        <p className="text-sm text-orange-800 mb-3">
                            Use server-side tests to simulate real production errors. These API routes trigger errors that would occur in a live environment.
                        </p>
                        <div className="bg-white rounded p-3 text-xs font-mono text-orange-900 border border-orange-100">
                            GET /api/test-error?type=database<br/>
                            GET /api/test-error?type=validation<br/>
                            POST /api/test-error (with JSON body)
                        </div>
                    </div>

                    {/* Back Link */}
                    <div className="text-center">
                        <a href="/" className="text-blue-600 hover:underline">
                            ← Back to Home
                        </a>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center text-slate-400 text-sm">
                    <p>🧪 Test errors won't affect your application</p>
                    <p className="mt-2">📚 <a href="https://docs.sentry.io" target="_blank" className="text-blue-400 hover:underline">Sentry Documentation</a></p>
                </div>
            </div>
        </div>
    )
}
