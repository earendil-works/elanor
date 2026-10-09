import type {CloudflareOptions} from '@sentry/hono/cloudflare';

import type {Bindings} from './auth.js';

export function sentryOptions(env: Bindings): CloudflareOptions {
  return {
    dsn: env.SENTRY_DSN,
    enabled: Boolean(env.SENTRY_DSN),
    environment: env.SENTRY_ENVIRONMENT,
    release: env.CF_VERSION_METADATA.id,
    // Omit tracing options entirely so incoming sampling headers cannot enable tracing.
    maxBreadcrumbs: 0,
    dataCollection: {
      userInfo: false,
      cookies: false,
      httpHeaders: false,
      httpBodies: [],
      urlQueryParams: false,
      stackFrameVariables: false,
    },
  };
}
