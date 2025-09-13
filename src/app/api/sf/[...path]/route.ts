import { NextRequest, NextResponse } from 'next/server';
import { sfFetch } from '../../../../lib/sfClient';

type Ctx = { params: Promise<{ path: string[] }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;               // <-- await params
  const joined = Array.isArray(path) ? path.join('/') : String(path);

  const qs = Object.fromEntries(req.nextUrl.searchParams.entries());
  const data = await sfFetch<any>(joined, { params: qs });
  return NextResponse.json(data);
}

