import {sentry} from '@sentry/hono/cloudflare';
import {Hono} from 'hono';

import {sentryOptions} from './telemetry.js';

const app = new Hono<{Bindings: WorkerEnv}>();

app.use(sentry(app, sentryOptions));

app.use('*', async (c, next) => {
  await next();
  c.header('Referrer-Policy', 'same-origin');
  c.header('X-Content-Type-Options', 'nosniff');
});

app.all('*', async (c) => {
  if (c.req.method !== 'GET' && c.req.method !== 'HEAD') {
    c.header('Allow', 'GET, HEAD');
    return c.text('Method not allowed', 405);
  }
  // Build metadata is not part of the public documentation.
  if (c.req.path.startsWith('/.vite/')) return c.text('Not found', 404);
  // Let Cloudflare serve and canonicalize the public assets with its cache headers.
  return c.env.ASSETS.fetch(c.req.raw);
});

app.onError(() => {
  console.error(JSON.stringify({event: 'docs_request_failed'}));
  return new Response('Request failed', {
    status: 500,
    headers: {'Cache-Control': 'no-store'},
  });
});

export default app;
