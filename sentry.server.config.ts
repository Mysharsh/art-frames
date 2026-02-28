// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Control whether to send user PII (Personally Identifiable Information).
  // This should only be enabled if it aligns with your privacy policy and data protection requirements.
  // Configure via the SENTRY_SEND_DEFAULT_PII environment variable ("true" to enable).
  sendDefaultPii: process.env.SENTRY_SEND_DEFAULT_PII === "true",
});
