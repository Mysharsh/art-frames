export async function register() {
    if (process.env.NEXT_RUNTIME === "nodejs") {
        // Server-side
        await import("./sentry.server.config");
    }
}
