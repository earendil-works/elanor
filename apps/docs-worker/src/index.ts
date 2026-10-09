import {sentry} from '@sentry/hono/cloudflare';
import {Hono} from 'hono';
import {deleteCookie, getSignedCookie, setSignedCookie} from 'hono/cookie';
import {Check} from 'typebox/value';

import publicAssetPaths from '../../docs/dist/public-assets.txt';
import {
  authConfig,
  COOKIE_OPTIONS,
  exchangeGoogleCode,
  FLOW_COOKIE,
  FLOW_TTL,
  googleAuthorizationUrl,
  OAuthFlow,
  parseCookiePayload,
  randomToken,
  returnUrl,
  SignInRejected,
  Session,
  SESSION_COOKIE,
  SESSION_TTL,
  type AuthConfig,
  type Bindings,
} from './auth.js';
import {sentryOptions} from './telemetry.js';

const app = new Hono<{Bindings: Bindings; Variables: {auth: AuthConfig}}>();

const publicAssets = new Set(publicAssetPaths.trim().split('\n'));

// Background requests must never replace an in-flight OAuth flow cookie.
function isPageNavigation(request: Request): boolean {
  return (
    request.method === 'GET' &&
    request.headers.get('sec-fetch-mode') === 'navigate' &&
    request.headers.get('sec-fetch-dest') === 'document'
  );
}

app.use(sentry(app, sentryOptions));

app.use('*', async (c, next) => {
  await next();
  // Override asset cache headers as well as auth responses. Never cache private
  // content in a browser/shared HTTP cache after the session has expired.
  c.header('Cache-Control', 'private, no-store');
  c.header('CDN-Cache-Control', 'no-store');
  c.header('Cloudflare-CDN-Cache-Control', 'no-store');
  // Native same-origin POST forms need an Origin header for the logout CSRF check.
  // Keep OAuth URLs out of referrers, and never send site referrers cross-origin.
  c.header('Referrer-Policy', c.req.path.startsWith('/auth/') ? 'no-referrer' : 'same-origin');
  c.header('X-Robots-Tag', 'noindex, nofollow');
  c.header('X-Content-Type-Options', 'nosniff');
});

app.use('*', async (c, next) => {
  const config = authConfig(c.env);
  if (!config) return c.text('Authentication unavailable', 503);
  // Never derive OAuth callbacks from an arbitrary Host header or preview URL.
  if (new URL(c.req.url).origin !== config.origin) return c.text('Not found', 404);
  c.set('auth', config);
  await next();
});

app.get('/auth/login', async (c) => {
  if (!isPageNavigation(c.req.raw)) return c.text('Unauthorized', 401);
  const config = c.get('auth');
  const flow = {
    state: randomToken(),
    nonce: randomToken(),
    verifier: randomToken(),
    next: returnUrl(c.req.query('next'), config.origin),
    expiresAt: Date.now() + FLOW_TTL * 1000,
  };
  await setSignedCookie(c, FLOW_COOKIE, JSON.stringify(flow), config.sessionSecret, {
    ...COOKIE_OPTIONS,
    maxAge: FLOW_TTL,
  });
  return c.redirect(await googleAuthorizationUrl(config, flow));
});

app.get('/auth/callback', async (c) => {
  const config = c.get('auth');
  const value = await getSignedCookie(c, config.sessionSecret, FLOW_COOKIE);
  deleteCookie(c, FLOW_COOKIE, COOKIE_OPTIONS);
  const flow = parseCookiePayload(value);
  const code = c.req.query('code');
  if (
    !Check(OAuthFlow, flow) ||
    flow.expiresAt <= Date.now() ||
    flow.state !== c.req.query('state') ||
    c.req.query('error') ||
    !code
  ) {
    return c.text('Google sign-in failed. Start again at /auth/login.', 400);
  }

  let identity;
  try {
    identity = await exchangeGoogleCode(config, code, flow);
  } catch (error) {
    if (!(error instanceof SignInRejected)) throw error;
    if (error.reason === 'workspace_required') {
      return c.text(
        'Sign-in requires an Earendil Google Workspace account. Retry at /auth/login.',
        403,
      );
    }
    return c.text('Google sign-in failed. Start again at /auth/login.', 400);
  }
  await setSignedCookie(
    c,
    SESSION_COOKIE,
    JSON.stringify({...identity, expiresAt: Date.now() + SESSION_TTL * 1000}),
    config.sessionSecret,
    {...COOKIE_OPTIONS, maxAge: SESSION_TTL},
  );
  return c.redirect(returnUrl(flow.next, config.origin));
});

app.post('/auth/logout', (c) => {
  if (c.req.header('origin') !== c.get('auth').origin) return c.text('Forbidden', 403);
  deleteCookie(c, SESSION_COOKIE, COOKIE_OPTIONS);
  deleteCookie(c, FLOW_COOKIE, COOKIE_OPTIONS);
  return c.redirect('/', 303);
});

// The Worker selects public HTML on the server. Everything else is private unless
// explicitly listed by the build; run_worker_first must remain true.
app.all('*', async (c) => {
  const config = c.get('auth');
  const url = new URL(c.req.url);
  // Build-only variants/manifests are never directly addressable, even when signed in.
  if (
    url.pathname === '/guest' ||
    url.pathname.startsWith('/guest/') ||
    url.pathname === '/public-assets.txt' ||
    url.pathname.startsWith('/.vite/')
  ) {
    return c.text('Not found', 404);
  }
  const value = await getSignedCookie(c, config.sessionSecret, SESSION_COOKIE);
  const session = parseCookiePayload(value);
  const signedIn =
    Check(Session, session) &&
    session.expiresAt > Date.now() &&
    session.email.toLowerCase().endsWith('@earendil.com');
  const publicPage = url.pathname === '/' || url.pathname === '/brand/';
  const canonical =
    url.pathname === '/index.html'
      ? '/'
      : url.pathname === '/brand' || url.pathname === '/brand/index.html'
        ? '/brand/'
        : undefined;
  if (!signedIn && !publicPage && !canonical && !publicAssets.has(url.pathname)) {
    if (!isPageNavigation(c.req.raw)) return c.text('Unauthorized', 401);
    const next = returnUrl(url.href, config.origin);
    return c.redirect(`/auth/login?${new URLSearchParams({next})}`);
  }
  if (c.req.method !== 'GET' && c.req.method !== 'HEAD') {
    c.header('Allow', 'GET, HEAD');
    return c.text('Method not allowed', 405);
  }
  if (canonical) return c.redirect(canonical + url.search, 308);
  if (!signedIn && publicPage) {
    url.pathname = url.pathname === '/' ? '/guest/' : '/guest/brand/';
    return c.env.ASSETS.fetch(new Request(url, c.req.raw));
  }
  return c.env.ASSETS.fetch(c.req.raw);
});

app.onError(() => {
  console.error(JSON.stringify({event: 'docs_request_failed'}));
  return new Response('Request failed', {
    status: 500,
    headers: {'Cache-Control': 'private, no-store'},
  });
});

export default app;
