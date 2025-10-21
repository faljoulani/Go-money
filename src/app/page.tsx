import Page from './[...slug]/page';
import { Metadata } from 'next';
import { pageMetadata } from '@progress/sitefinity-nextjs-sdk/pages';
export const dynamic = 'force-dynamic';

export async function generateMetadata({ searchParams }: any): Promise<Metadata> {
  const baseMetadata = await pageMetadata({ params: { slug: [] }, searchParams });
  
  // Add fallback meta description if not provided by Sitefinity
  return {
    ...baseMetadata,
    description: baseMetadata.description || 'GoMoney - Your trusted digital financial platform. Secure, fast, and reliable financial services for all your banking needs.',
  };
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string }>;
}) {
  // return RenderPage({ params, searchParams, templates: templateRegistry });

  return Page({ params: Promise.resolve({ slug: [] }), searchParams });
}
