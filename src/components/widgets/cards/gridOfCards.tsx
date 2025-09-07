import { WidgetContext, htmlAttributes } from '@progress/sitefinity-nextjs-sdk';
import type { CardSectionEntity } from './card.entity';
import { fetchData, extractSelectionId } from '../../../utils/sitefinity';

import Card from '../../atoms/card/card';
import Eyebrow from '../../atoms/eyebrow/eyebrow';
import Title from '../../atoms/title/title';
import Description from '../../atoms/description/description';
import CTA from '../../atoms/cta/cta';
import ScrollableCards from './scrollableCards';

type AnySel = any;

type CmsImage = {
  Id?: string;
  Url?: string;
  MediaUrl?: string;
  ThumbnailUrl?: string;
  EmbedUrl?: string;
  Urls?: string[];
  Title?: string;
  AlternativeText?: string;
};

interface ExpandBoxItem {
  Id: string;
  Title?: string;
  SubTitle?: string;
  Eyebrow?: string;
  Description?: string;
  CtaText?: string;
  CtaUrl?: string | { Href?: string } | Array<{ Href?: string }>;
  Image?: CmsImage | CmsImage[] | null;
}

/* -------------------- small helpers -------------------- */
function toAbsoluteUrl(url?: string): string {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  const base = (process.env.NEXT_PUBLIC_SITEFINITY_BASE_URL || '').replace(/\/+$/, '');
  if (!base) return url; // best effort
  return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
}

function first<T>(x?: T | T[] | null): T | undefined {
  if (!x) return undefined;
  return Array.isArray(x) ? x[0] : x;
}

function pickImageUrl(img?: CmsImage): string | undefined {
  if (!img) return undefined;
  return img.Url || img.MediaUrl || img.ThumbnailUrl || img.Urls?.[0] || img.EmbedUrl || undefined;
}

function extractHref(raw?: ExpandBoxItem['CtaUrl'] | AnySel): string {
  if (!raw) return '';
  if (typeof raw === 'string') return raw;
  if (Array.isArray(raw)) return raw.find((x) => x?.Href)?.Href || '';
  return raw?.Href || '';
}

export default async function GridOfCards(props: WidgetContext<CardSectionEntity>) {
  const attributes = htmlAttributes(props);
  const selection = (props.model?.Properties || {}) as AnySel;
  const { culture } = props.requestContext;

  const selectedView =
    (props.model as AnySel)?.ViewName ||
    (props.model?.Properties as AnySel)?.ViewName ||
    (props as AnySel)?.viewName ||
    'Default';

  if (selectedView === 'ScrollableCards') {
    return <ScrollableCards {...props} />;
  }

  const parentSelectionId = extractSelectionId(selection);
  if (!parentSelectionId) {
    return props.requestContext.isEdit ? (
      <section
        {...attributes}
        className="p-6 border border-dashed rounded-lg text-center text-slate-500"
      >
        <strong>Cards</strong>
        <div className="mt-1">Open the designer and select a Card List.</div>
      </section>
    ) : null;
  }

  const parentFetched = await fetchData(
    [parentSelectionId],
    null,
    culture,
    [
      'Id',
      'Title',
      'Description',
      'SubTitle',
      'Eyebrow',
      'CtaText',
      'CtaUrl',
      'Image($select=Id,Url,MediaUrl,ThumbnailUrl,EmbedUrl,Title,AlternativeText,Urls)',
    ],
    {
      itemType: selection?.CardListData?.Content?.[0]?.Type,
      single: true,
    },
  );

  const parent = parentFetched as ExpandBoxItem;
  const eyebrow = parent?.Eyebrow ?? '';
  const title = parent?.Title ?? 'Cards';
  const subtitle = parent?.Description ?? parent?.SubTitle ?? '';
  const ctaText = parent?.CtaText ?? '';
  const ctaHref = extractHref(parent?.CtaUrl);

  const selectedIds: string[] = (() => {
    const raw = selection?.Cards;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw as string[];
    if (Array.isArray((raw as AnySel)?.ItemIdsOrdered)) return (raw as AnySel).ItemIdsOrdered;
    return [];
  })();

  let cardItems: AnySel[] = [];
  if (selectedIds.length > 0) {
    const fetched = await fetchData(
      selectedIds,
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
        itemType: selection?.Cards?.Content?.[0]?.Type ?? selection?.Content?.[0]?.Type,
        single: false,
      },
    );
    cardItems = Array.isArray(fetched) ? fetched : fetched ? [fetched] : [];
  }

  const items = cardItems.map((c) => {
    const img = first<CmsImage>(c?.Image);
    const urlCandidate = pickImageUrl(img);
    const iconUrl = toAbsoluteUrl(urlCandidate);

    const a11y = img?.AlternativeText || img?.Title || c?.Title || 'Icon';

    const iconEl = iconUrl ? (
      <img
        src={iconUrl}
        alt={a11y}
        className="h-12 w-12 object-contain"
        loading="lazy"
        decoding="async"
      />
    ) : null;

    return {
      id: c?.Id ?? `${c?.Title ?? 'item'}-${Math.random().toString(36).slice(2)}`,
      title: c?.Title ?? '',
      description: c?.Description ?? '',
      href: extractHref(c?.CtaUrl) || undefined,
      icon: iconEl,
    };
  });

  const navy = '#0B2A8E';

  return (
    <section {...attributes} className="w-full bg-gradient-to-b from-[#F6F7F9] to-[#EFF1F4] py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {eyebrow && <Eyebrow color={navy}>{eyebrow}</Eyebrow>}
          <Title variant="hero" color={navy}>
            {title}
          </Title>
          {subtitle && <Description>{subtitle}</Description>}
        </div>

        <div className="mt-12">
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8 xl:gap-10">
            {items.map((item) => (
              <div
                key={item.id}
                className="group rounded-[20px] bg-white/95 border border-slate-200 shadow-sm p-6 md:p-8 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
              >
                {item.href ? (
                  <Card
                    icon={item.icon}
                    title={item.title}
                    description={item.description}
                    href={item.href}
                  />
                ) : (
                  <Card icon={item.icon} title={item.title} description={item.description} />
                )}
              </div>
            ))}
          </div>
        </div>

        {ctaText && (
          <div className="mt-12 text-center">
            <CTA href={(ctaHref || '').trim() || '#'} color={navy}>
              {ctaText}
              <span aria-hidden className="translate-y-px">
                ›
              </span>
            </CTA>
          </div>
        )}
      </div>
    </section>
  );
}

