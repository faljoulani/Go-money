import { RenderWidget } from '@progress/sitefinity-nextjs-sdk/pages';

export const dynamic = 'force-dynamic';

export default async function Render({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string }>;
}) {
  return RenderWidget({ searchParams: await searchParams });
}
