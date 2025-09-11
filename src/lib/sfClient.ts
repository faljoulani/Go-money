// src/lib/sfClient.ts (server-only)
let cachedToken: { token: string; exp: number } | null = null;

const SF_BASE = (process.env.SF_BASE_URL || 'http://dev-sfall.ddns.net:9095').replace(/\/$/, '');
const TOKEN_URL = process.env.SF_OIDC_TOKEN_URL || `${SF_BASE}/sitefinity/oauth/token`;
const FLOW = (process.env.SF_AUTH_FLOW || 'client_credentials') as 'client_credentials' | 'password';

async function fetchToken(): Promise<{ access_token: string; expires_in: number }> {
  const headers: Record<string, string> = { 'Content-Type': 'application/x-www-form-urlencoded' };
  let body: URLSearchParams;

  if (FLOW === 'password') {
    body = new URLSearchParams({
      grant_type: 'password',
      username: process.env.SF_USERNAME!,
      password: process.env.SF_PASSWORD!,
      client_id: process.env.SF_CLIENT_ID!,
      client_secret: process.env.SF_CLIENT_SECRET!,
      scope: process.env.SF_SCOPE || 'sf-api',
    });
  } else {
    const basic = Buffer.from(`${process.env.SF_CLIENT_ID}:${process.env.SF_CLIENT_SECRET}`).toString('base64');
    headers.Authorization = `Basic ${basic}`;
    body = new URLSearchParams({ grant_type: 'client_credentials', scope: process.env.SF_SCOPE || 'sf-api' });
  }

  const res = await fetch(TOKEN_URL, { method: 'POST', headers, body, cache: 'no-store', redirect: 'manual' });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Token ${res.status} ${res.statusText} @ ${TOKEN_URL}\n${text.slice(0, 500)}`);
  }

  try {
    const json = JSON.parse(text) as { access_token: string; expires_in: number };
    if (!json.access_token) throw new Error('No access_token in response');
    return json;
  } catch {
    throw new Error(`Token parse error (non-JSON response) @ ${TOKEN_URL}\n${text.slice(0, 500)}`);
  }
}

export async function getSfToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && cachedToken.exp - 30 > now) return cachedToken.token;

  const { access_token, expires_in } = await fetchToken();
  cachedToken = { token: access_token, exp: now + (expires_in || 3600) };
  return cachedToken.token;
}

export async function sfFetch<T>(
  path: string,
  opts: {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    params?: Record<string, string | number | boolean | undefined>;
    headers?: Record<string, string>;
    body?: any;
  } = {},
): Promise<T> {
  const u = new URL(path.startsWith('http') ? path : `/${path.replace(/^\/+/, '')}`, SF_BASE);
  for (const [k, v] of Object.entries(opts.params || {})) {
    if (v !== undefined && v !== null) u.searchParams.set(k, String(v));
  }

  async function call(fresh = false): Promise<T> {
    if (fresh) cachedToken = null;
    const token = await getSfToken();

    const headers: Record<string, string> = {
      Accept: 'application/json;odata.metadata=minimal',
      Authorization: `Bearer ${token}`,
      ...(opts.headers || {}),
    };
    if ((process.env.SF_AUTH_FLOW || 'client_credentials') === 'client_credentials' &&
        (process.env.SF_SERVICE_ACCOUNT || '').toLowerCase() === 'true') {
      headers['X-SF-Service-Request'] = 'true';
    }

    const res = await fetch(u.toString(), {
      method: opts.method || 'GET',
      headers,
      body: opts.body ? (typeof opts.body === 'string' ? opts.body : JSON.stringify(opts.body)) : undefined,
      cache: 'no-store',
      redirect: 'manual',
    });

    if (res.status === 401 && (res.headers.get('www-authenticate') || '').toLowerCase().includes('invalid_token')) {
      return call(true);
    }

    const text = await res.text();
    console.log("TEXT:", text)
    console.log("Parsed Text:", JSON.parse(text));
    
    if (!res.ok) {
      throw new Error(`sfFetch ${res.status} ${res.statusText} ${u}\n${text.slice(0, 500)}`);
    }
    try { return JSON.parse(text) as T; } catch { return text as unknown as T; }
  }

  return call(false);
}
