import { WidgetContext, htmlAttributes } from '@progress/sitefinity-nextjs-sdk';
import type { CardSectionEntity } from './card.entity';
import { fetchData, extractSelectionId, pickImageUrl } from '../../../utils/sitefinity';
import { resolveAbsoluteUrl, extractHref } from '../../../utils/utils';

import ScrollableCards from './scrollableCards';
import FeatureCards from './featuresCards';
import AlternatingFeaturesCard from './alternatingFeaturesCards';
import LeadershipCards from './leadershipCards';
import CEOMessageCard from './ceoMessageCard';
import ChairmanMessageCard from './chairmanMessageCard';

import { CmsImage } from '../../../types/Type';
import Eyebrow from '../../atoms/eyebrow/eyebrow';
import Title from '../../atoms/title/title';
import Description from '../../atoms/description/description';
import CTA from '../../atoms/cta/cta';

interface ExpandBoxItem {
  Id: string;
  Title?: string;
  SubTitle?: string;
  Eyebrow?: string;
  Description?: string;
  CtaText?: string;
  CtaUrl?: string | undefined;
  Image?: CmsImage | CmsImage[] | null;
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
  let ctaHref = undefined;
  if (parentCardData?.CtaUrl) {
    try {
      const parsed = JSON.parse(parentCardData.CtaUrl);
      if (Array.isArray(parsed) && parsed.length > 0) {
        ctaHref = extractHref(parsed[0]?.href);
      }
    } catch (e) {
      console.error('Invalid CtaUrl JSON:', parentCardData.CtaUrl, e);
    }
  }

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

  //console.log('cardItems ======= >>>>>> ' + JSON.stringify(cardItems));

  const childCardData = cardItems.map((card) => {
    const img = Array.isArray(card?.Image) ? card.Image[0] : card?.Image;

    const iconUrl = resolveAbsoluteUrl(pickImageUrl(img), props.requestContext);
    const altText = img?.AlternativeText || img?.Title || card?.Title || 'Icon';

    const iconEl = iconUrl ? (
      <img
        src={iconUrl}
        alt={altText}
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

  //console.log('childCardData ======= >>>>>> ' + JSON.stringify(childCardData));

  return (
    <section {...attributes} className="w-full py-16 px-20">
      <div>
        <div className="flex flex-col items-center gap-2 text-center">
          {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
          <Title
            className="
              text-5xl
              font-bold     
              tracking-tight
              leading-[63px]
            "
          >
            {title}
          </Title>
          {subtitle && <Description html={subtitle} />}
        </div>

        <div className="mt-12 fadeup">
          <div className="grid grid-cols-3 gap-8">
            {childCardData.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="group rounded-[20px] bg-white p-8 hover:scale-105 duration-300"
              >
                <div className="gap-4">
                  <div>{item.icon}</div>
                </div>
                <div className="">
                  <h3 className="text-xl font-bold text-primary leading-9 tracking-[-0.02em]">{item.title}</h3>
                  {item.description ? (
                    <div className="mt-2 text-default text-base">
                      <Description html={item.description} />
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12 fadeup">
          <div className="grid grid-cols-3 gap-8">
            {childCardData.slice(3, 6).map((item) => (
              <div
                key={item.id}
                className="group rounded-[20px] bg-white p-8 hover:scale-105 duration-300"
              >
                <div className="gap-4">
                  <div>{item.icon}</div>
                </div>
                <div className="">
                  <h3 className="text-xl font-bold text-primary leading-9 tracking-[-0.02em]">{item.title}</h3>
                  {item.description ? (
                    <div className="mt-2 text-default text-base">
                      <Description html={item.description} />
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>

        {ctaText && (
          <div className="mt-12 text-center fadeup">
            <CTA
              variant="outline"
              colorText="text-primary"
              fontWeight="font-semibold"
              borderColor="border-primary"
              align="center"
              icon="arrow"
              bgColor="transparent"
              href={ctaHref || '#'}
            >
              {ctaText}
            </CTA>
          </div>
        )}
      </div>
    </section>
  );
}

