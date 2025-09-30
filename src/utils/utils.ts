import type { WidgetContext } from '@progress/sitefinity-nextjs-sdk';

import { CmsLink } from '../types/typee';

export const DAY_MS = 86_400_000;

export function mergeClasses(...xs: Array<string | undefined | false | null>) {
  return xs.filter(Boolean).join(' ');
}

export function resolveSitefinitySelection(raw: unknown) {
  if (!raw) return undefined;
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw);
    } catch {
      return undefined;
    }
  }
  return raw as any;
}

export function firstIdFromSelection(sel: any) {
  if (!sel) return undefined;
  if (sel.Id) return sel.Id;
  const ids = sel?.CardListData?.ItemIdsOrdered ?? sel?.ItemIdsOrdered;
  if (Array.isArray(ids) && ids.length) return ids[0];
  const maybeContentId = sel?.Content?.[0]?.Variations?.[0]?.Filter?.Value?.split(',')?.[0];
  return maybeContentId || undefined;
}

export function linkToHref(link: CmsLink | CmsLink[]): string | undefined {
  if (!link) return undefined;

  // If link is a string
  if (typeof link === 'string') return link;

  // If link is an array, take the first item
  const first = Array.isArray(link) ? link[0] : link;

  // If the first item is a string, return it
  if (typeof first === 'string') return first;

  // If the first item is an object with href, return href
  if (first && typeof first === 'object' && 'href' in first)
    return (first as { href: string }).href;

  return undefined;
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

export function resolveAbsoluteUrl(
  url: string | null | undefined,
  requestContext: WidgetContext<any>['requestContext'],
): string {
  if (!url) return '';
  if (/^(data:|blob:)/i.test(url)) return url;
  if (/^https?:\/\//i.test(url)) return url;

  const siteBaseUrl = computeBaseUrl(requestContext);
  return siteBaseUrl ? `${siteBaseUrl}${url.startsWith('/') ? url : `/${url}`}` : url;
}

export function extractHref(raw?: any): string {
  if (!raw) return '';
  if (typeof raw === 'string') return raw;
  if (Array.isArray(raw)) return raw.find((x) => x?.Href)?.Href || '';
  return raw?.Href || '';
}

export const cleanHref = (href: string) => href.split('#')[0].split('?')[0];

export function routeMatchKey(urlOrPath?: string): string {
  if (!urlOrPath) return '/';

  let path = urlOrPath.trim();

  if (/^https?:\/\//i.test(path)) {
    try {
      path = new URL(path).pathname || '/';
    } catch {}
  }

  const hashIdx = path.indexOf('#');
  if (hashIdx !== -1) path = path.slice(0, hashIdx);
  const queryIdx = path.indexOf('?');
  if (queryIdx !== -1) path = path.slice(0, queryIdx);

  path = path.replace(/^\/[a-z]{2}(?:-[A-Z]{2})?(?=\/|$)/, '');

  path = path.replace(/\/{2,}/g, '/');

  if (!path.startsWith('/')) path = '/' + path;
  if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);

  return path === '/home' ? '/' : path || '/';
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

export const daysSinceUtc = (utc?: string) =>
  !utc ? 0 : Math.max(0, Math.floor((Date.now() - new Date(utc).getTime()) / DAY_MS));

