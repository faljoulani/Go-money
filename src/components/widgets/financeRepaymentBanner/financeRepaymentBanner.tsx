import Image from 'next/image';
import { WidgetContext, htmlAttributes } from '@progress/sitefinity-nextjs-sdk';
import { fetchData, extractSelectionId } from '../../../utils/sitefinity';
import type { FinanceRepaymentBannerEntity } from './financeRepaymentBanner.entity';

import Title from '../../atoms/title/title';

interface ExpandBoxItem {
  Id: string;
  Title?: string;
  Eyebrow?: string;
  Description?: string;
  CtaText?: string;
  CtaUrl?: string | { Href?: string } | Array<{ Href?: string }>;
  Image?: any | any[];
}

export default async function FinanceRepaymentBanner(
  props: WidgetContext<FinanceRepaymentBannerEntity>,
) {
  const attrs = htmlAttributes(props);
  const { culture, isEdit } = props.requestContext;

  let selection = props.model?.Properties?.ExpandBox ?? (props.model?.Properties as any)?.ExpandBox;
  if (typeof selection === 'string') {
    try {
      selection = JSON.parse(selection);
    } catch {
      selection = undefined;
    }
  }

  const id = extractSelectionId(selection);

  if (!id) {
    return isEdit ? (
      <section
        {...attrs}
        className="p-6 border border-dashed rounded-2xl text-center text-slate-500"
      >
        <strong>ExpandBox</strong>
        <div className="mt-1">Open the designer and select an ExpandBox item.</div>
      </section>
    ) : null;
  }

  const item = await fetchData(
    [id],
    null,
    culture,
    [
      'Id',
      'Title',
      'Description',
      'Eyebrow',
      'CtaText',
      'CtaUrl',
      'Image($select=Id,Url,MediaUrl,ThumbnailUrl,EmbedUrl,Title,AlternativeText,Urls)',
    ],
    {
      itemType: selection?.Content?.[0]?.Type,
      single: true,
    },
  );

  const typedItem = item as ExpandBoxItem;

  if (!item) {
    return isEdit ? (
      <section
        {...attrs}
        className="p-6 border border-dashed rounded-lg text-center text-slate-500"
      >
        Select an ExpandBox item.
      </section>
    ) : null;
  }

  const title = typedItem.Title ?? undefined;
  const ctaText = typedItem.CtaText ?? 'Learn more →';
  const ctaUrl =
    typeof typedItem.CtaUrl === 'string'
      ? typedItem.CtaUrl
      : (typedItem.CtaUrl as any)?.[0]?.Href || (typedItem.CtaUrl as any)?.Href || '#';

  const imgs = Array.isArray(typedItem.Image) ? typedItem.Image : [typedItem.Image].filter(Boolean);

  const byTitle = (t: string) =>
    imgs.find((im: any) => (im?.Title || '').toLowerCase().includes(t));

  const mainBg = byTitle('main background') ?? imgs[0];
  const phone = byTitle('phone') ?? imgs[1] ?? imgs[0];
  const cards = byTitle('cards/services') ?? byTitle('cards') ?? byTitle('services') ?? imgs[2];

  const url = (im: any) => im?.MediaUrl || im?.Url || im?.ThumbnailUrl || '';

  return (
    <section
      {...attrs}
      className="relative mx-auto flex h-[550px] w-[1240px] items-center overflow-hidden rounded-[32px]"
    >
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(180deg, rgba(0,0,0,0) 0%, #000 100%),
              linear-gradient(97.8deg, #010663 0%, #6BE5BF 100%)
            `,
          }}
        />
        {mainBg && (
          <Image
            src={url(mainBg)}
            alt={mainBg?.AlternativeText || 'Background'}
            fill
            priority
            className="object-cover"
          />
        )}
      </div>

      {/* content container (to align children vertically center) */}
      <div className="relative z-10 flex w-full items-center">
        <div className="flex w-1/2 text-white">
          <div className="pl-10 w-full max-w-[560px] space-y-6">
            <div className="relative h-[97px] w-full overflow-hidden rounded-lg">
              <Image
                src={url(cards)}
                alt={cards?.AlternativeText || 'Cards'}
                fill
                className="object-cover"
                priority
              />
            </div>

            {title && (
              <Title color="white" align="left" variant="hero">
                {title}
              </Title>
            )}

            <a
              href={ctaUrl}
              className="inline-flex items-center gap-2 rounded-2xl border border-white bg-transparent px-5 py-3 text-white transition hover:bg-white hover:text-slate-900"
            >
              {ctaText}
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M5 12h14" />
                <path d="m13 5 7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>

        {/* Right: phone image (index 1, absolutely positioned) ----->>> the property name must be "phone"*/}
        {phone && (
          <div className="absolute right-0 top-0 z-20 flex h-full items-center">
            <Image
              src={url(phone)}
              alt={phone?.AlternativeText || 'Phone'}
              width={420}
              height={840}
              priority
              className="pointer-events-none select-none"
              style={{ filter: 'drop-shadow(28px -18px 42px rgba(0,0,0,0.35))' }}
            />
          </div>
        )}
      </div>
      {/* subtle ring */}
      <div className="pointer-events-none absolute inset-0 rounded-[32px] ring-1 ring-white/10" />
    </section>
  );
}

