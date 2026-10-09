import {base64url, createRemoteJWKSet, errors, jwtVerify} from 'jose';
import Type from 'typebox';
import {Check} from 'typebox/value';

const GOOGLE_OAUTH_CLIENT_ID =
  '1027554472842-55rq92mn9c2m0dcp9tbcva2be3du16fg.apps.googleusercontent.com';

export const SESSION_COOKIE = '__Host-elanor_session';
export const FLOW_COOKIE = '__Host-elanor_oauth';
export const SESSION_TTL = 60 * 60 * 24 * 30;
export const FLOW_TTL = 60 * 10;
export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: 'Lax',
  path: '/',
} as const;

export type Bindings = WorkerEnv & {
  GOOGLE_OAUTH_CLIENT_SECRET?: string;
  SESSION_SECRET?: string;
};

export function authConfig(env: Bindings) {
  const clientSecret = env.GOOGLE_OAUTH_CLIENT_SECRET;
  const sessionSecret = env.SESSION_SECRET;
  if (!clientSecret || !sessionSecret || sessionSecret.length < 32) return null;
  const origin = new URL(env.BASE_URL).origin;
  return {
    clientSecret,
    sessionSecret,
    origin,
    redirectUri: `${origin}/auth/callback`,
  };
}
export type AuthConfig = NonNullable<ReturnType<typeof authConfig>>;

export const OAuthFlow = Type.Object({
  state: Type.String(),
  nonce: Type.String(),
  verifier: Type.String(),
  next: Type.String(),
  expiresAt: Type.Number(),
});
export const Session = Type.Object({
  subject: Type.String({minLength: 1}),
  email: Type.String(),
  hostedDomain: Type.Literal('earendil.com'),
  expiresAt: Type.Number(),
});

// Callers verify signatures before parsing and validate the decoded payload afterward.
export function parseCookiePayload(value: string | false | undefined): unknown {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    // Parse errors can include cookie contents; do not attach the original error.
    throw new Error('Invalid JSON in verified authentication cookie');
  }
}

export function randomToken() {
  return base64url.encode(crypto.getRandomValues(new Uint8Array(32)));
}

export function returnUrl(value: string | undefined, origin: string): string {
  const home = new URL('/', origin).href;
  let url: URL;
  try {
    url = new URL(value ?? '/', origin);
  } catch {
    return home;
  }
  if (
    url.origin !== origin ||
    url.username ||
    url.password ||
    url.pathname === '/auth' ||
    url.pathname.startsWith('/auth/')
  ) {
    return home;
  }
  url.hash = '';
  // Keep the validated origin: a pathname beginning with // is not a safe Location.
  return url.href;
}

export async function googleAuthorizationUrl(
  config: AuthConfig,
  flow: {state: string; nonce: string; verifier: string},
) {
  const challenge = base64url.encode(
    new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(flow.verifier))),
  );
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.search = new URLSearchParams({
    client_id: GOOGLE_OAUTH_CLIENT_ID,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: 'openid email',
    state: flow.state,
    nonce: flow.nonce,
    code_challenge: challenge,
    code_challenge_method: 'S256',
    hd: 'earendil.com',
    prompt: 'select_account',
  }).toString();
  return url.toString();
}

export class SignInRejected extends Error {
  constructor(readonly reason: 'invalid_grant' | 'invalid_id_token' | 'workspace_required') {
    super(reason);
    this.name = 'SignInRejected';
  }
}

const invalidTokenCodes = new Set([
  'ERR_JOSE_ALG_NOT_ALLOWED',
  'ERR_JWS_INVALID',
  'ERR_JWS_SIGNATURE_VERIFICATION_FAILED',
  'ERR_JWT_CLAIM_VALIDATION_FAILED',
  'ERR_JWT_EXPIRED',
  'ERR_JWT_INVALID',
]);

const InvalidGrant = Type.Object({error: Type.Literal('invalid_grant')});

const GOOGLE_JWKS = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));
const TokenResponse = Type.Object({id_token: Type.String()});
const IdentityClaims = Type.Object({
  sub: Type.String({minLength: 1}),
  email: Type.String(),
  email_verified: Type.Boolean(),
  nonce: Type.String(),
  hd: Type.Optional(Type.String()),
});

export async function exchangeGoogleCode(
  config: AuthConfig,
  code: string,
  flow: {nonce: string; verifier: string},
) {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {'content-type': 'application/x-www-form-urlencoded'},
    body: new URLSearchParams({
      client_id: GOOGLE_OAUTH_CLIENT_ID,
      client_secret: config.clientSecret,
      code,
      code_verifier: flow.verifier,
      redirect_uri: config.redirectUri,
      grant_type: 'authorization_code',
    }),
    signal: AbortSignal.timeout(10_000),
  });
  // Only Google's documented invalid_grant response is an expected exchange rejection.
  // Outages, invalid client configuration, and malformed responses are server failures.
  if (!response.ok && response.status !== 400) {
    throw new Error(`Google token endpoint returned HTTP ${response.status}`);
  }
  let token: unknown;
  try {
    token = await response.json();
  } catch (error) {
    // JSON parse errors can contain response text, including credentials or tokens.
    if (error instanceof SyntaxError)
      throw new Error('Google token endpoint returned invalid JSON');
    throw error;
  }
  if (!response.ok) {
    if (Check(InvalidGrant, token)) throw new SignInRejected('invalid_grant');
    throw new Error(`Google token endpoint returned HTTP ${response.status}`);
  }
  if (!Check(TokenResponse, token)) throw new Error('Google ID token missing');

  const {payload} = await jwtVerify(token.id_token, GOOGLE_JWKS, {
    algorithms: ['RS256'],
    audience: GOOGLE_OAUTH_CLIENT_ID,
    issuer: ['https://accounts.google.com', 'accounts.google.com'],
    requiredClaims: ['exp', 'iat', 'sub'],
  }).catch((error: unknown) => {
    if (error instanceof errors.JOSEError && invalidTokenCodes.has(error.code)) {
      throw new SignInRejected('invalid_id_token');
    }
    // JWKS timeouts and invalid key-set responses are infrastructure failures.
    throw error;
  });
  if (!Check(IdentityClaims, payload) || payload.nonce !== flow.nonce) {
    throw new SignInRejected('invalid_id_token');
  }
  if (
    !payload.email_verified ||
    payload.hd !== 'earendil.com' ||
    !payload.email.toLowerCase().endsWith('@earendil.com')
  ) {
    throw new SignInRejected('workspace_required');
  }
  return {subject: payload.sub, email: payload.email, hostedDomain: payload.hd};
}
