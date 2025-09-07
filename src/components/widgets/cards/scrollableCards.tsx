import { WidgetContext, htmlAttributes } from '@progress/sitefinity-nextjs-sdk';
import type { CardSectionEntity } from './card.entity';
import { fetchData, extractSelectionId } from '../../../utils/sitefinity';

import Eyebrow from '../../atoms/eyebrow/eyebrow';
import Title from '../../atoms/title/title';
import Description from '../../atoms/description/description';
import CTA from '../../atoms/cta/cta';
import CardImage from '../../atoms/cardImage/cardImage';

interface ExpandBoxItem {
  Id: string;
  Title?: string;
  SubTitle?: string;
  Eyebrow?: string;
  Description?: string;
  CtaText?: string;
  CtaUrl?: string | { Href?: string } | Array<{ Href?: string }>;
  Image?: any | any[];
  Cards?: { ItemIdsOrdered?: string[] };
}

export default async function ScrollableCards(props: WidgetContext<CardSectionEntity>) {
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
        <strong>Cards</strong>
        <div className="mt-1">Open the designer and select a Card List.</div>
      </section>
    ) : null;
  }

  const parentFetched = await fetchData(
    [id],
    null,
    culture,
    ['Id', 'Title', 'Eyebrow', 'Description', 'SubTitle', 'CtaText', 'CtaUrl', 'Cards'],
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
  const ctaUrlRaw = parent?.CtaUrl;
  const ctaHref =
    typeof ctaUrlRaw === 'string'
      ? ctaUrlRaw
      : Array.isArray(ctaUrlRaw)
        ? (ctaUrlRaw.find((x) => x?.Href)?.Href ?? '')
        : (ctaUrlRaw?.Href ?? '');

  const selectedIds: string[] =
    (selection?.Cards?.ItemIdsOrdered as string[]) ??
    (parent?.Cards?.ItemIdsOrdered as string[]) ??
    [];

  let cardItems: any[] = [];
  if (selectedIds.length > 0) {
    const fetched = await fetchData(
      selectedIds,
      null,
      culture,
      [
        'Id',
        'Title',
        'Description',
        'LinkUrl',
        'Image($select=Id,Url,MediaUrl,ThumbnailUrl,AlternativeText,Urls)',
        'Images($select=Id,Url,MediaUrl,ThumbnailUrl,AlternativeText,Urls)',
        'HeroImage($select=Id,Url,MediaUrl,ThumbnailUrl,Urls)',
        'Banner($select=Id,Url,MediaUrl,ThumbnailUrl,Urls)',
        'Media($select=Id,Url,MediaUrl,ThumbnailUrl,Urls)',
        'FeaturedImage($select=Id,Url,MediaUrl,ThumbnailUrl,Urls)',
      ],
      {
        itemType: selection?.Cards?.Content?.[0]?.Type ?? selection?.Content?.[0]?.Type,
        single: false,
      },
    );
    cardItems = Array.isArray(fetched) ? fetched : fetched ? [fetched] : [];
  }

  const items = cardItems.map((c: any) => {
    const rawHref = c?.LinkUrl ?? '';
    const href = rawHref?.trim() || '#';

    const img =
      (Array.isArray(c?.Image) && c.Image[0]) ||
      c?.Image ||
      (Array.isArray(c?.Images) && c.Images[0]) ||
      c?.HeroImage ||
      c?.Banner ||
      c?.Media ||
      c?.FeaturedImage ||
      null;

    const imgUrl =
      img?.Url || img?.MediaUrl || img?.ThumbnailUrl || (Array.isArray(img?.Urls) && img.Urls[0]);

    return {
      id: c?.Id,
      title: c?.Title ?? '',
      description: c?.Description ?? '',
      href,
      imgUrl,
    };
  });

  return (
    <section {...attributes} className="w-full bg-white">
      <div className="mx-auto max-w-7xl px-8">
        {/* Heading */}
        <div className="text-center">
          {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
          <Title variant="hero">{title}</Title>
          {subtitle && <Description>{subtitle}</Description>}
        </div>

        {/* Alternating frame */}
        <div className="mt-10 px-[205px]">
          <div className="space-y-16">
            {items.map((card, i) => {
              const isRight = i % 2 === 1;
              const rowTemplate = isRight
                ? '[grid-template-columns:minmax(0,1fr)_330px]'
                : '[grid-template-columns:330px_minmax(0,1fr)]';

              return (
                <div key={card.id ?? i} className={`grid items-center ${rowTemplate}`}>
                  {/* Image side */}
                  <div
                    className={isRight ? 'order-2 justify-self-end' : 'order-1 justify-self-start'}
                  >
                    <div className="relative">
                      {/* Card image */}
                      <div
                        className="
                        relative overflow-hidden
                        rounded-xl
                        w-[330px] h-[250px]"
                      >
                        {card.imgUrl && (
                          <CardImage img={card.imgUrl} alt={card.title || 'card image'} />
                        )}
                      </div>

                      {/* Decorative chip */}
                      <div
                        className={`absolute ${isRight ? 'left-0 -bottom-0' : 'right-0 -bottom-0'}`}
                      >
                        {/* Blue block */}
                        <div
                          className={`relative w-18 h-18 ${isRight ? 'bg-[#0DF9C4] rounded-tr-3xl' : ' bg-[#1919E5] rounded-tl-3xl'}`}
                        >
                          {/* White square cutout */}
                          <div
                            className={`absolute w-10 h-10 bg-white ${isRight ? 'left-0 -bottom-0' : 'right-0 -bottom-0'}`}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Text side */}
                  <div className={isRight ? 'order-1 mr-8' : 'order-2 ml-8'}>
                    <div className="max-w-[38rem]">
                      <h3 className="text-[1.8rem] leading-tight font-extrabold text-[color:var(--navy,#0B2A8E)]">
                        {card.title}
                      </h3>
                      {card.description && (
                        <p className="mt-3 text-base leading-7 text-slate-700">
                          {card.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Parent CTA */}
        {ctaText && (
          <div className="mt-10 text-center">
            <CTA
              href={(ctaHref || '').trim() || '#'}
              color="#010663"
              borderColor='#001081'
              variant="outline"
              width={248}
              height={56}
              className="rounded-[20px] px-6 py-[18px] border opacity-100"
            >
              {ctaText}
            </CTA>
          </div>
        )}
      </div>
    </section>
  );
}

