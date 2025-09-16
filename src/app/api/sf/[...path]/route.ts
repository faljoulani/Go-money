import { NextRequest, NextResponse } from 'next/server';
import { sfFetch } from '../../../../lib/sfClient';

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

  const contentType = req.headers.get('content-type');
  const raw = await req.text();
  const body = contentType.includes('application/json') && raw ? JSON.parse(raw) : raw;

  try {
    const data = await sfFetch<any>(joined, {
      method: 'POST',
      params: qs,
      headers: {
        'Content-Type': contentType,
      },
      body,
    });
    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      {
        error: err?.message || 'Subscription failed',
      },
      { status: 400 },
    );
  }
}

