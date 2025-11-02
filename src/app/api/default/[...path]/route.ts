// app/api/sf/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sfFetch } from '../../../../lib/sfClient';

export const runtime = 'nodejs'; // ensure streaming/body pass-through works

type Ctx = { params: Promise<{ path: string[] }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  const joined = Array.isArray(path) ? path.join('/') : String(path);
  const qs = Object.fromEntries(req.nextUrl.searchParams.entries());
  const data = await sfFetch<any>(joined, { params: qs });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  const joined = Array.isArray(path) ? path.join('/') : String(path);
  const qs = Object.fromEntries(req.nextUrl.searchParams.entries());

  const contentType = req.headers.get('content-type') || '';
  const lowered = contentType.toLowerCase();
  try {
    if (lowered.startsWith('multipart/form-data')) {
      // Consume incoming multipart
      const incoming = await req.formData();

      // Rebuild a fresh FormData for the outgoing request
      const outgoing = new FormData();
      for (const [key, value] of incoming.entries()) {
        if (value instanceof File) {
          outgoing.append(key, value, value.name);
        } else {
          outgoing.append(key, String(value));
        }
      }

      // IMPORTANT: don't set Content-Type here
      const data = await sfFetch<any>(joined, {
        method: 'POST',
        params: qs,
        body: outgoing,
      });

      return NextResponse.json(data, { status: 201 });
    }

    // JSON or other simple bodies (no files)
    let body: any = null;
    if (lowered.includes('application/json')) {
      body = await req.json();
    } else {
      // Pass-through for x-www-form-urlencoded or raw text
      body = await req.text();
    }

    const data = await sfFetch<any>(joined, {
      method: 'POST',
      params: qs,
      // forward other content-types as-is only for non-multipart
      headers: contentType ? { 'Content-Type': contentType } : {},
      body,
    });

    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Request failed' }, { status: 400 });
  }
}
