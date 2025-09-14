import { WidgetContext, htmlAttributes } from '@progress/sitefinity-nextjs-sdk';
import type { CardSectionEntity } from './card.entity';
import { fetchData, extractSelectionId } from '../../../utils/sitefinity';
import { resolveAbsoluteUrl } from '../../../utils/utils';

import ScrollableCards from './scrollableCards';
import FeatureCards from './featuresCards';
import AlternatingFeaturesCard from './alternatingFeaturesCards';
import LeadershipCards from './leadershipCards';
import CEOMessageCard from './ceoMessageCard';
import ChairmanMessageCard from './chairmanMessageCard';

import { CmsImage } from '../../../types/type';
import Eyebrow from '../../atoms/eyebrow/eyebrow';
import Title from '../../atoms/title/title';
import Description from '../../atoms/description/description';
import CTA from '../../atoms/cta/cta';
import FadeUp from './fadeUp';

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

function first<T>(x?: T | T[] | null): T | undefined {
  if (!x) return undefined;
  return Array.isArray(x) ? x[0] : x;
}

function pickImageUrl(img?: CmsImage): string | undefined {
  if (!img) return undefined;
  return img.Url || img.MediaUrl || img.ThumbnailUrl || img.Urls?.[0] || img.EmbedUrl || undefined;
}

function extractHref(raw?: ExpandBoxItem['CtaUrl'] | any): string {
  if (!raw) return '';
  if (typeof raw === 'string') return raw;
  if (Array.isArray(raw)) return raw.find((x) => x?.Href)?.Href || '';
  return raw?.Href || '';
}

export default async function Cards(props: WidgetContext<CardSectionEntity>) {
  const attrs = htmlAttributes(props);
  const selectedView =
    (props.model as any)?.ViewName ||
    (props.model?.Properties as any)?.ViewName ||
    (props as any)?.viewName ||
    'Default';

  return (
    <section {...attrs} data-view={selectedView}>
      <div data-react-root>
        {selectedView === 'LeadershipCards' ? (
          <LeadershipCards {...props} />
        ) : selectedView === 'CEOMessageCard' ? (
          <CEOMessageCard {...props} />
        ) : selectedView === 'ChairmanMessageCard' ? (
          <ChairmanMessageCard {...props} />
        ) : selectedView === 'ScrollableCards' ? (
          <ScrollableCards {...props} />
        ) : selectedView === 'FeatureCards' ? (
          <FeatureCards {...props} />
        ) : selectedView === 'AlternatingFeaturesCard' ? (
          <AlternatingFeaturesCard {...props} />
        ) : (
          <GridOfCards {...props} />
        )}
      </div>
    </section>
  );
}

async function GridOfCards(props: WidgetContext<CardSectionEntity>) {
  const attributes = htmlAttributes(props);
  const selection = (props.model?.Properties || {}) as any;
  const { culture } = props.requestContext;

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

  const parentCardPayload = await fetchData(
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

  const parentCardData = parentCardPayload as ExpandBoxItem;
  const eyebrow = parentCardData?.Eyebrow ?? '';
  const title = parentCardData?.Title ?? 'Cards';
  const subtitle = parentCardData?.Description ?? parentCardData?.SubTitle ?? '';
  const ctaText = parentCardData?.CtaText ?? '';
  const ctaHref = extractHref(parentCardData?.CtaUrl);

  const selectedIds: string[] = (() => {
    const raw = selection?.Cards;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw as string[];
    if (Array.isArray((raw as any)?.ItemIdsOrdered)) return (raw as any).ItemIdsOrdered;
    return [];
  })();

  let cardItems: any[] = [];
  if (selectedIds.length > 0) {
    const childCardPayload = await fetchData(
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
    cardItems = Array.isArray(childCardPayload)
      ? childCardPayload
      : childCardPayload
        ? [childCardPayload]
        : [];
  }

  const childCardData = cardItems.map((card) => {
    const img = first<CmsImage>(card?.Image);
    const urlCandidate = pickImageUrl(img);
    const iconUrl = resolveAbsoluteUrl(urlCandidate, props.requestContext);

    const alternativeText = img?.AlternativeText || img?.Title || card?.Title || 'Icon';

    const iconEl = iconUrl ? (
      <img
        src={iconUrl}
        alt={alternativeText}
        className="h-[72px] w-[72px] object-contain mb-8"
        loading="lazy"
        decoding="async"
      />
    ) : null;

    return {
      id: card?.Id ?? `${card?.Title ?? 'item'}-${Math.random().toString(36).slice(2)}`,
      title: card?.Title ?? '',
      description: card?.Description ?? '',
      href: extractHref(card?.CtaUrl) || undefined,
      icon: iconEl,
    };
  });
  return (
    <section {...attributes} className="w-full py-16 px-20">
      <div>
        <div className="text-center">
          {eyebrow && <Eyebrow color="#010663">{eyebrow}</Eyebrow>}
          <Title variant="hero" color="#010663" className="my-1 h-[63px]">
            {title}
          </Title>
          {subtitle && <Description>{subtitle}</Description>}
        </div>

        <div className="mt-12">
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8 xl:gap-8">
            {childCardData.map((item) => (
              <div
                key={item.id}
                className="group rounded-[20px] bg-white p-8 transition-all hover:-translate-y-4"
              >
                <div className="gap-4">
                  <div className="icon-wrapper">{item.icon}</div>
                </div>
                <div className="mr-7">
                  <h3 className="text-[19px] font-bold text-[#010663]">{item.title}</h3>
                  <p className="mt-2 text-gray-600 text-lg">{item.description}</p>
                </div>
                {item.href && <a href={item.href} className="mt-4 inline-block text-[#010663]"></a>}
              </div>
            ))}
          </div>
        </div>

        {ctaText && (
          <div className="mt-12 text-center">
            <CTA
              href={(ctaHref || '').trim() || '#'}
              color="#0B2A8E"
              borderColor="var(--Button-button-border-primary, #010663)"
              variant="outline"
              width={248}
              height={56}
              icon="arrow"
            >
              {ctaText}
            </CTA>
          </div>
        )}
      </div>
    </section>
  );
}

