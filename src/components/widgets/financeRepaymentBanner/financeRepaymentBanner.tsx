import Image from 'next/image';
import { WidgetContext, htmlAttributes } from '@progress/sitefinity-nextjs-sdk';
import { fetchData, extractSelectionId } from '../../../utils/sitefinity';
import type { FinanceRepaymentBannerEntity } from './financeRepaymentBanner.entity';

import Title from '../../atoms/title/title';
import CTA from '../../atoms/cta/cta';

interface FinanceRepaymentBannerItem {
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
        <strong>FinanceRepaymentBanner</strong>
        <div className="mt-1">Open the designer and select the desired item.</div>
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

  const typedItem = item as FinanceRepaymentBannerItem;

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
      className="relative [perspective:1000px]"
    >
      <div className="flex h-[550px] w-auto items-center overflow-hidden rounded-[32px] mx-20 flip">
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
          <div className="text-white">
            <div className="flex flex-col gap-6 pl-24 w-full max-w-[560px]">
              <div className="relative -left-8 -mb-12 h-[180px] w-[590px] rounded-lg">
                <Image src={url(cards)} alt={cards?.AlternativeText || 'Cards'} fill priority />
              </div>

              {title && (
                <Title align="left" color="white">
                  {title}
                </Title>
              )}

              {ctaText && (
                <div>
                  <CTA
                    href={(ctaUrl || '').trim() || '#'}
                    textColor="text-white"
                    borderColor="border-white"
                    bgColor="transparent"
                    variant="outline"
                    icon="slot"
                    align="left"
                  >
                    {ctaText}
                  </CTA>
                </div>
              )}
            </div>
          </div>

          {/* Right: phone image (index 1, absolutely positioned) ----->>> the property name must be "phone"*/}
          {phone && (
            <div className="absolute right-0 top-0 z-20 flex h-full items-center">
              <Image
                src={url(phone)}
                alt={phone?.AlternativeText || 'Phone'}
                width={630}
                height={900}
                priority
                className="pointer-events-none select-none animate-float"
                style={{ filter: 'drop-shadow(28px -18px 42px rgba(0,0,0,0.35))' }}
              />
            </div>
          )}
        </div>
      </div>
      {/* subtle ring */}
      <div className="pointer-events-none absolute inset-0 rounded-[32px] ring-1 ring-white/10" />
    </section>
  );
}

