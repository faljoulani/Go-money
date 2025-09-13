import { Metadata } from 'next';
import { RenderPage, pageMetadata } from '@progress/sitefinity-nextjs-sdk/pages';
import { templateRegistry } from '../template-registry';

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<{ [key: string]: string }>;
}): Promise<Metadata> {
  try { console.log('[BUILD-LOG] generateMetadata for catch-all route'); } catch {}
  return await pageMetadata({ params, searchParams });
}

// Ensure this catch-all route never attempts static rendering at build time
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<{ [key: string]: string }>;
}) {
  try { console.log('[BUILD-LOG] Rendering catch-all Page'); } catch {}
  return RenderPage({ params, searchParams, templates: templateRegistry });
}
