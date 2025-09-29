'use client';
import { useCallback, useMemo } from 'react';

type Params = Record<string, string | number | boolean | undefined>;
type Json = Record<string, any> | any[];
type Payload = Json | FormData | string | undefined;

const isFormDataLike = (val: unknown): val is FormData => {
  if (!val || typeof val !== 'object') return false;
  const ctor = typeof FormData !== 'undefined' ? FormData : undefined;
  if (ctor && val instanceof ctor) return true;
  return (
    typeof (val as any).append === 'function' &&
    typeof (val as any).entries === 'function' &&
    typeof (val as any)[Symbol.iterator] === 'function'
  );
};

function buildUrl(path: string, params?: Params) {
  const qs = new URLSearchParams();
  Object.entries(params || {}).forEach(([k, v]) => v != null && qs.set(k, String(v)));
  return `/${path}${qs.size ? `?${qs.toString()}` : ''}`;
}

export function useSfMutation(path: string | null) {
  const request = useCallback(
    async (
      method: 'POST' | 'PUT' | 'PATCH' | 'DELETE',
      opts?: { params?: Params; body?: Payload; headers?: Record<string, string> },
    ) => {
      if (!path) throw new Error('No path');
      const url = buildUrl(path, opts?.params);
      const body = opts?.body;
      const isFormData = isFormDataLike(body);
      const headers: Record<string, string> = {
        Accept: 'application/json',
        ...(opts?.headers || {}),
      };

      if (isFormData) {
        delete headers['Content-Type'];
      } else if (!headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
      }

      let preparedBody: BodyInit | undefined;
      if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
        if (isFormData) {
          preparedBody = body as FormData;
        } else if (typeof body === 'string') {
          preparedBody = body;
        } else {
          preparedBody = JSON.stringify((body as Json) ?? {});
        }
      }

      const res = await fetch(url, {
        method,
        headers,
        body: preparedBody,
      });

      const text = await res.text();
      const parsed = text
        ? (() => {
            try {
              return JSON.parse(text);
            } catch {
              return text;
            }
          })()
        : null;
      if (!res.ok) throw new Error(typeof parsed === 'string' ? parsed : JSON.stringify(parsed));
      return parsed;
    },
    [path],
  );

  const post = useCallback(
    (body?: Payload, opts?: Omit<Parameters<typeof request>[1], 'body'>) =>
      request('POST', { ...opts, body }),
    [request],
  );

  const put = useCallback(
    (body?: Payload, opts?: Omit<Parameters<typeof request>[1], 'body'>) =>
      request('PUT', { ...opts, body }),
    [request],
  );

  const patch = useCallback(
    (body?: Payload, opts?: Omit<Parameters<typeof request>[1], 'body'>) =>
      request('PATCH', { ...opts, body }),
    [request],
  );

  const del = useCallback(
    (opts?: Parameters<typeof request>[1]) => request('DELETE', opts),
    [request],
  );

  return useMemo(
    () => ({
      post,
      put,
      patch,
      del,
    }),
    [post, put, patch, del],
  );
}

