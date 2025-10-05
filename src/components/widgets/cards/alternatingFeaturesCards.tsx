import { WidgetContext, htmlAttributes } from '@progress/sitefinity-nextjs-sdk';
import type { CardSectionEntity } from './card.entity';
import { fetchData, extractSelectionId } from '../../../utils/sitefinity';
import { ImgUrl } from '../../../types/typee';

import Eyebrow from '../../atoms/eyebrow/eyebrow';
import Title from '../../atoms/title/title';
import Subtitle from '../../atoms/subtitle/subtitle';
import Description from '../../atoms/description/description';
import CTA from '../../atoms/cta/cta';
import CardImage from '../../atoms/cardImage/cardImage';
import { linkToHref } from '../../../utils/utils';

type CardItem = {
  Id: string;
  Title?: string;
  Description?: string;
  Eyebrow?: string;
  Subtitle?: string;
  LinkUrl?: string;
  Image?: any;
  CtaText?: string;
  CtaUrl?: string | { Href?: string } | Array<{ Href?: string }>;
};

type Parent = {
  Id: string;
  Title?: string;
  Eyebrow?: string;
  Description?: string;
  SubTitle?: string;
  CtaText?: string;
  CtaUrl?: string | { Href?: string } | Array<{ Href?: string }>;
  Cards?: { ItemIdsOrdered?: string[] };
};

export default async function AlternatingFeaturesCard(props: WidgetContext<CardSectionEntity>) {
  const attributes = htmlAttributes(props);
  const selection = (props.model?.Properties || {}) as any;
  const { culture, isEdit } = props.requestContext;

  const id = extractSelectionId(selection);

  if (!id) {
    return isEdit ? (
      <section
        {...attributes}
        className="p-6 border border-dashed rounded-lg text-center text-slate-500"
      >
        <strong>Cards list</strong>
        <div className="mt-1">Open the designer and select a Card List.</div>
      </section>
    ) : null;
  }

  const parentCardPayload = await fetchData(
    [id],
    null,
    culture,
    ['Id', 'Title', 'Eyebrow', 'Description', 'CtaText', 'CtaUrl', 'Cards'],
    {
      itemType: selection?.CardListData?.Content?.[0]?.Type,
      single: true,
    },
  );
  const parentCardData = parentCardPayload as CardItem;

  const eyebrow = parentCardData?.Eyebrow ?? '';
  const title = parentCardData?.Title ?? 'Cards';
  const subtitle = parentCardData?.Description ?? '';
  const ctaText = parentCardData?.CtaText ?? '';
  const ctaUrlRaw = parentCardData?.CtaUrl;
  const ctaHref =
    typeof ctaUrlRaw === 'string'
      ? ctaUrlRaw
      : Array.isArray(ctaUrlRaw)
        ? (ctaUrlRaw.find((x) => x?.Href)?.Href ?? '')
        : (ctaUrlRaw?.Href ?? '');

  const selectedIds: string[] = (selection?.Cards?.ItemIdsOrdered as string[]) ?? [];

  let items: CardItem[] = [];
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
        'SubTitle',
        'LinkUrl',
        'Image($select=Id,Url,MediaUrl,ThumbnailUrl,AlternativeText,Urls)',
      ],
      {
        itemType: selection?.Cards?.Content?.[0]?.Type ?? selection?.Content?.[0]?.Type,
        single: false,
      },
    );
    items = Array.isArray(childCardPayload)
      ? childCardPayload
      : childCardPayload
        ? [childCardPayload]
        : [];
    console.log('Child card payload:', childCardPayload);
  }

  const childCardData = items.map((card: any) => {
    const img = (Array.isArray(card?.Image) && card.Image[0]) || null;

    const imgUrl =
      img?.Url || img?.MediaUrl || img?.ThumbnailUrl || (Array.isArray(img?.Urls) && img.Urls[0]);

    let rawCtaUrl = card.CtaUrl;

    try {
      if (typeof rawCtaUrl === 'string') {
        rawCtaUrl = JSON.parse(rawCtaUrl);
      }
    } catch {
      // If parsing fails, leave it as-is
    }

    const href = linkToHref(rawCtaUrl);

    // const href = (card?.CtaUrl || '').trim();

    return {
      id: card?.Id,
      title: card?.Title ?? '',
      description: card?.Description ?? '',
      subtitle: card?.SubTitle ?? '',
      eyebrow: card?.Eyebrow ?? '',
      href,
      imgUrl,
      ctaText: card?.CtaText ?? '',
    };
  });

  return (
    <section {...attributes} className="w-full">
      <div className="mx-auto md:px-20 xs:px-4">
        {/* rows */}
        <div className="">
          {childCardData.map((card, i) => {
            const isRight = i % 2 === 0;
            const gridCols = isRight
              ? 'md:grid-cols-[minmax(0,1fr)_460px]'
              : 'md:grid-cols-[460px_minmax(0,1fr)]';

            return (
              <div
                key={card.id ?? i}
                className={`grid xs:grid-cols-1 items-center min-h-[588px] ${gridCols} gap-x-10 md:gap-y-8 xs:gap-y-6 `}
              >
                {/* image column */}
                <div
                  className={isRight ? 'md:order-2 justify-self-end' : 'md:order-1 justify-self-start'}
                >
                  <div className="relative md:w-[460px] md:h-[460px] xs:size-[311px] overflow-hidden rounded-2xl">
                    {card.imgUrl && (
                      <CardImage img={card.imgUrl} alt={card.title || 'card image'} />
                    )}
                  </div>
                </div>

                {/* text column */}
                <div className={`${isRight ? 'order-1 ' : 'order-2 '} text-left rtl:text-right`}>
                  <div className="max-w-[760px]">
                    <div className="flex flex-col items-start space-y-3">
                      {card.eyebrow && <Eyebrow className='text-14px leading-[18px]'>{card.eyebrow}</Eyebrow>}

                      {card.title && (
                        <Title className="md:text-[40px] md:leading-[75px] xs:text-2xl xs:leading-8 font-bold tracking-[-0.02em]">
                          {card.title}
                        </Title>
                      )}

                      {card.subtitle && <Subtitle align="left" className='font-semibold md:leading-6 xs:leading-5 md:text-lg xs:text-base'>{card.subtitle}</Subtitle>}

                      {card.description && (
                        <Description
                          maxWidth={597}
                          className="rtl:max-w-[760px] xs:leading-5"
                          html={card.description}
                        />
                      )}

                      {card.ctaText && (
                        <div className="self-start">
                          <CTA
                            href={card.href}
                            borderColor=""
                            variant="solid"
                            className="rounded-[18px] w-[250px] h-12 border"
                          >
                            {card.ctaText}
                          </CTA>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

