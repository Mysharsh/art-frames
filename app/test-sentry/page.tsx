'use client'

import { captureException, captureMessage, setUserContext, addBreadcrumb } from '@/lib/sentry'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export default function SentryTestPage() {
    const [status, setStatus] = useState<string>('')

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
                            <p className="text-blue-900 font-medium">{status}</p>
                        </div>
                    )}

                    {/* Test Buttons */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        <div>
                            <h3 className="text-sm font-semibold text-slate-700 mb-2">
                                🔴 Test Errors
                            </h3>
                            <Button
                                onClick={testThrowError}
                                variant="destructive"
                                className="w-full mb-2"
                            >
                                Throw Error
                            </Button>
                            <Button
                                onClick={testCaptureError}
                                variant="outline"
                                className="w-full"
                            >
                                Capture Error
                            </Button>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold text-slate-700 mb-2">
                                💬 Test Messages
                            </h3>
                            <Button
                                onClick={testCaptureMessage}
                                variant="secondary"
                                className="w-full mb-2"
                            >
                                Send Message
                            </Button>
                            <Button
                                onClick={testUserContext}
                                variant="outline"
                                className="w-full"
                            >
                                Set User Context
                            </Button>
                        </div>
                    </div>

                    {/* Instructions */}
                    <div className="bg-slate-50 rounded-lg p-6 mb-6">
                        <h2 className="font-semibold text-slate-900 mb-3">📋 How to Test:</h2>
                        <ol className="space-y-2 text-slate-700 text-sm">
                            <li>1. Click any button above</li>
                            <li>2. Go to your <a href="https://sentry.io" target="_blank" className="text-blue-600 hover:underline">Sentry Dashboard</a></li>
                            <li>3. Navigate to your <strong>art-frames</strong> project</li>
                            <li>4. Check the <strong>Issues</strong> tab</li>
                            <li>5. You should see your test error/message appear within 5-10 seconds</li>
                            <li>6. Click on it to see full details, stack trace, and user context</li>
                        </ol>
                    </div>

                    {/* Info Box */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                        <h3 className="font-semibold text-green-900 mb-2">✅ Sentry Features</h3>
                        <ul className="text-sm text-green-800 space-y-1">
                            <li>✓ Automatic error capture</li>
                            <li>✓ Manual error logging</li>
                            <li>✓ Performance monitoring</li>
                            <li>✓ Session replay</li>
                            <li>✓ User context tracking</li>
                            <li>✓ Breadcrumb trails</li>
                        </ul>
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
