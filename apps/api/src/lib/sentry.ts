import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { config } from '../config/index.js';

/**
 * Initialize Sentry for error tracking and performance monitoring.
 * Skipped if SENTRY_DSN is not configured (development/test environments).
 */
export function initSentry(): void {
  if (!config.sentryDsn) {
    return;
  }

  Sentry.init({
    dsn: config.sentryDsn,
    environment: config.nodeEnv,
    integrations: [nodeProfilingIntegration()],
    tracesSampleRate: config.nodeEnv === 'production' ? 0.2 : 1.0,
    profilesSampleRate: config.nodeEnv === 'production' ? 0.1 : 0,
  });
}

export { Sentry };
