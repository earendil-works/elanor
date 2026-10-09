import {init} from '@sentry/astro';

// The DSN is public configuration; SENTRY_AUTH_TOKEN stays in the build environment.
if (import.meta.env.PROD) {
  init({
    dsn: 'https://e372376d56119f095d32f053bcb3bd80@o4510178388869120.ingest.us.sentry.io/4512225360084992',
    environment: import.meta.env.MODE,
    // Omit tracing options entirely so inherited sampling cannot enable tracing.
    maxBreadcrumbs: 0,
    // Browser page URLs and inline-script frames can retain query strings even
    // with dataCollection disabled. Keep only the request URL, without URL details.
    beforeSend(event) {
      if (event.request) {
        event.request = {url: event.request.url?.replace(/[?#].*/s, '')};
      }
      for (const exception of event.exception?.values ?? []) {
        for (const frame of exception.stacktrace?.frames ?? []) {
          frame.filename = frame.filename?.replace(/[?#].*/s, '');
          frame.abs_path = frame.abs_path?.replace(/[?#].*/s, '');
        }
      }
      return event;
    },
    dataCollection: {
      userInfo: false,
      cookies: false,
      httpHeaders: false,
      httpBodies: [],
      urlQueryParams: false,
      stackFrameVariables: false,
    },
  });
}
