'use client';

import { useMemo } from 'react';
import useSWR, { SWRConfiguration } from 'swr';

type Params = Record<string, string | number | boolean | undefined>;

const fetcher = (url: string) =>
  fetch(url, { headers: { Accept: 'application/json' } }).then(async (r) => {
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  });

function stripCulturePrefix(p: string) {
  return p.replace(/^\/?ar\//i, '');
}

export function useSf<T = any>(path: string | null, params?: Params, config?: SWRConfiguration) {
  const url = useMemo(() => {
    if (!path) return null;

    const p = stripCulturePrefix(path.replace(/^\/+/, ''));
    const qs = new URLSearchParams();
    Object.entries(params || {}).forEach(([k, v]) => {
      if (v !== undefined && v !== null) qs.set(k, String(v));
    });

    return `/${p}${qs.toString() ? `?${qs.toString()}` : ''}`;
  }, [path, params]);

  const { data, error, isLoading, mutate } = useSWR<T>(url, fetcher, {
    revalidateOnFocus: false,
    ...config,
  });

  return { data, error, isLoading, mutate };
}

