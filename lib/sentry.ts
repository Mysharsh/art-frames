import * as Sentry from "@sentry/nextjs";

/**
 * Capture an exception with additional context
 */
export function captureException(
    error: Error | string,
    context?: Record<string, any>
) {
    if (context) {
        Sentry.captureException(error, { extra: context });
    } else {
        Sentry.captureException(error);
    }
}

/**
 * Capture a message
 */
export function captureMessage(
    message: string,
    level: Sentry.SeverityLevel = "info"
) {
    Sentry.captureMessage(message, level);
}

/**
 * Set user context for error tracking
 */
export function setUserContext(userId: string, email?: string) {
    Sentry.setUser({
        id: userId,
        email: email,
    });
}

/**
 * Clear user context
 */
export function clearUserContext() {
    Sentry.setUser(null);
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(
    message: string,
    category: string = "user-action"
) {
    Sentry.addBreadcrumb({
        message,
        category,
        level: "info",
    });
}
