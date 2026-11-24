import {sentry} from '@sentry/hono/cloudflare';
import {Hono} from 'hono';

import {sentryOptions} from './telemetry.js';

const app = new Hono<{Bindings: WorkerEnv}>();

app.use(sentry(app, sentryOptions));

app.use('*', async (c, next) => {
  await next();
  c.header('Referrer-Policy', 'same-origin');
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-Frame-Options', 'SAMEORIGIN');
  c.header('Content-Security-Policy', "base-uri 'self'; object-src 'none'; frame-ancestors 'self'");
});

app.all('*', async (c) => {
  if (c.req.method !== 'GET' && c.req.method !== 'HEAD') {
    c.header('Allow', 'GET, HEAD');
    return c.text('Method not allowed', 405);
  }
  // Build metadata is not part of the public documentation.
  if (c.req.path.startsWith('/.vite/')) return c.text('Not found', 404);
  const markdown = markdownPath(c.req.path);
  if (!markdown) {
    // Let Cloudflare serve and canonicalize the public assets with its cache headers.
    const response = await c.env.ASSETS.fetch(c.req.raw);
    return c.req.path.endsWith('.md') ? markdownResponse(response, c.req.path) : response;
  }
  const accept = c.req.header('Accept') ?? '';
  const wantsMarkdown = quality(accept, 'text/markdown') > quality(accept, 'text/html');
  const asset = await c.env.ASSETS.fetch(
    wantsMarkdown ? new Request(new URL(markdown, c.req.url), c.req.raw) : c.req.raw,
  );
  // Copied: the binding's response headers are immutable.
  const response = wantsMarkdown
    ? markdownResponse(asset, c.req.path)
    : new Response(asset.body, asset);
  // The same URL serves HTML or Markdown, depending on `Accept`.
  response.headers.append('Vary', 'Accept');
  return response;
});

/** The Markdown version of a page's path, such as `/components/button.md` for `/components/button/`. */
function markdownPath(path: string): string | undefined {
  if (path === '/' || /^\/brand\/?$/.test(path)) return llmsTxt(path);
  const page = /^\/(components\/[\w-]+|application-setup)\/?$/.exec(path)?.[1];
  return page ? `/${page}.md` : undefined;
}

/** The `q` value an `Accept` header gives a media type, 0 when it doesn't list it. */
function quality(accept: string, type: string): number {
  for (const range of accept.toLowerCase().split(',')) {
    const [name, ...parameters] = range.split(';').map((part) => part.trim());
    if (name !== type) continue;
    const q = parameters.find((parameter) => parameter.startsWith('q='));
    return q ? Number(q.slice(2)) || 0 : 1;
  }
  return 0;
}

/** The `llms.txt` that describes a path: the brand section's, or the site's. */
function llmsTxt(path: string): string {
  return /^\/brand(?:\/|$)/.test(path) ? '/brand/llms.txt' : '/llms.txt';
}

function markdownResponse(asset: Response, path: string): Response {
  const response = new Response(asset.body, asset);
  if (!asset.ok) return response;
  response.headers.set('Content-Type', 'text/markdown; charset=utf-8');
  response.headers.set('Link', `<${llmsTxt(path)}>; rel="describedby"`);
  return response;
}

app.onError(() => {
  console.error(JSON.stringify({event: 'docs_request_failed'}));
  return new Response('Request failed', {
    status: 500,
    headers: {'Cache-Control': 'no-store'},
  });
});

export default app;
