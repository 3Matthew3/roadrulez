// Re-export the project's canonical client instrumentation to satisfy Sentry
// and Turbopack expectations. The real initialization lives in
// `instrumentation-client.ts` so we avoid duplicate initialization.
import "./instrumentation-client";
