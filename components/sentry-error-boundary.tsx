'use client';

import * as Sentry from "@sentry/nextjs";
import { ReactNode } from "react";

interface ErrorBoundaryProps {
    children: ReactNode;
}

export function SentryErrorBoundary({ children }: ErrorBoundaryProps) {
    return <Sentry.ErrorBoundary fallback={<ErrorFallback />} showDialog>
        {children}
    </Sentry.ErrorBoundary>;
}

function ErrorFallback() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-destructive/10 p-4">
            <div className="text-center max-w-md">
                <h1 className="text-2xl font-bold text-destructive mb-4">
                    Something went wrong
                </h1>
                <p className="text-muted-foreground mb-6">
                    Our team has been notified. Please try refreshing the page or contact support if the problem persists.
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                    Refresh Page
                </button>
            </div>
        </div>
    );
}
