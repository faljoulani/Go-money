'use client';
import { useCallback } from 'react';

type Params = Record<string, string|number|boolean|undefined>;
type Json = Record<string,any>|any[];

function buildUrl(path: string, params?: Params) {

  const qs = new URLSearchParams();
  Object.entries(params||{}).forEach(([k,v]) => v!=null && qs.set(k, String(v)));
  return `/${path}${qs.size ? `?${qs.toString()}` : ''}`;
}

export function useSfMutation(path: string|null) {
  const request = useCallback(async (
    method: 'POST'|'PUT'|'PATCH'|'DELETE',
    opts?: { params?: Params; body?: Json|string; headers?: Record<string,string> }
  ) => {
    if (!path) throw new Error('No path');
    const url = buildUrl(path, opts?.params);
    const res = await fetch(url, {
      method,
      headers: { Accept:'application/json', 'Content-Type':'application/json', ...(opts?.headers||{}) },
      body: method==='POST'||method==='PUT'||method==='PATCH'
        ? (typeof opts?.body === 'string' ? opts.body : JSON.stringify(opts?.body ?? {}))
        : undefined,
    });
    const text = await res.text();
    const parsed = text ? (()=>{ try{return JSON.parse(text);}catch{return text;} })() : null;
    if (!res.ok) throw new Error(typeof parsed==='string' ? parsed : JSON.stringify(parsed));
    return parsed;
  }, [path]);

  return {
    post:  (body?: Json|string, opts?: Omit<Parameters<typeof request>[1], 'body'>) => request('POST', { ...opts, body }),
    put:   (body?: Json|string, opts?: Omit<Parameters<typeof request>[1], 'body'>) => request('PUT',  { ...opts, body }),
    patch: (body?: Json|string, opts?: Omit<Parameters<typeof request>[1], 'body'>) => request('PATCH',{ ...opts, body }),
    del:   (opts?: Parameters<typeof request>[1]) => request('DELETE', opts),
  };
}
