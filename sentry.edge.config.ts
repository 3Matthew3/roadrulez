// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Define how likely traces are sampled. Tune via env in production.
  tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? 0.05),

  // Enable logs to be sent to Sentry (optional)
  enableLogs: process.env.SENTRY_ENABLE_LOGS === "true",

  // Enable sending user PII only if explicitly configured
  sendDefaultPii: process.env.SENTRY_SEND_PII === "true",
});
