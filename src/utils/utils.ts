import type { WidgetContext } from '@progress/sitefinity-nextjs-sdk';

export function mergeClasses(...xs: Array<string | undefined | false | null>) {
  return xs.filter(Boolean).join(' ');
}

export function computeBaseUrl(ctx: WidgetContext<any>['requestContext']): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITEFINITY_BASE_URL;
  if (fromEnv) return fromEnv.replace(/\/+$/, '');

  const anyCtx = ctx as any;
  const origin =
    anyCtx?.origin ||
    anyCtx?.siteUrl ||
    (anyCtx?.scheme && anyCtx?.host ? `${anyCtx.scheme}://${anyCtx.host}` : null);

  return (origin || '').toString().replace(/\/+$/, '');
}

export function toAbsolute(
  u: string | undefined | null,
  ctx: WidgetContext<any>['requestContext'],
) {
  if (!u) return '';
  if (/^(data:|blob:)/i.test(u)) return u;
  if (/^https?:\/\//i.test(u)) return u;
  const base = computeBaseUrl(ctx);
  return base ? `${base}${u.startsWith('/') ? u : `/${u}`}` : u;
}

export const cleanHref = (href: string) => href.split('#')[0].split('?')[0];

export function normalizePath(input: string): string {
  if (!input) return '/';
  let s = input.trim();

  if (/^https?:\/\//i.test(s)) {
    try {
      const u = new URL(s);
      s = (u.pathname || '/') + (u.search ?? '') + (u.hash ?? '');
    } catch {}
  }
  s = s.split('#')[0].split('?')[0];
  s = s.replace(/^\/[a-z]{2}(?:-[A-Z]{2})?(?=\/|$)/, '');
  s = s.replace(/\/{2,}/g, '/');
  if (s.length > 1 && s.endsWith('/')) s = s.slice(0, -1);
  if (!s.startsWith('/')) s = '/' + s;
  if (s === '/home') return '/';
  return s;
}

export function hasChildren<T extends { children?: unknown }>(
  x: T,
): x is T & { children: unknown[] } {
  return Array.isArray((x as any)?.children);
}

export function displayTitle(raw: string): string {
  if (!raw) return '';
  const looksSluggy = /[-_]/.test(raw) || raw === raw.toLowerCase();
  if (!looksSluggy) return raw;
  const spaced = raw.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();
  const lower = spaced.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

export const sortByOrder = <T extends { Order?: number }>(arr: T[] = []) =>
  arr.slice().sort((a, b) => (a?.Order ?? 0) - (b?.Order ?? 0));

