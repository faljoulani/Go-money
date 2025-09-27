import { WidgetContext, htmlAttributes } from '@progress/sitefinity-nextjs-sdk';
import type { CardSectionEntity } from './card.entity';
import { fetchData, extractSelectionId } from '../../../utils/sitefinity';
import { extractHref } from '../../../utils/utils';

import Eyebrow from '../../atoms/eyebrow/eyebrow';
import Title from '../../atoms/title/title';
import Description from '../../atoms/description/description';
import CTA from '../../atoms/cta/cta';
import CardImage from '../../atoms/cardImage/cardImage';

interface CardItem {
  Id: string;
  Title?: string;
  SubTitle?: string;
  Eyebrow?: string;
  Description?: string;
  CtaText?: string;
  CtaUrl?: string | undefined;
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
        <strong>Cards list</strong>
        <div className="mt-1">Open the designer and select a Card List.</div>
      </section>
    ) : null;
  }

  const parentCardPayload = await fetchData(
    [id],
    null,
    culture,
    ['Id', 'Title', 'Eyebrow', 'Description', 'SubTitle', 'CtaText', 'CtaUrl', 'Cards'],
    {
      itemType: selection?.CardListData?.Content?.[0]?.Type,
      single: true,
    },
  );
  const parentCardData = parentCardPayload as CardItem;

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

  const selectedIds: string[] =
    (selection?.Cards?.ItemIdsOrdered as string[]) ??
    (parentCardData?.Cards?.ItemIdsOrdered as string[]) ??
    [];

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
    cardItems = Array.isArray(childCardPayload)
      ? childCardPayload
      : childCardPayload
        ? [childCardPayload]
        : [];
  }

  console.log('cardItems ' + JSON.stringify(cardItems));

  const childCardData = cardItems.map((card: any) => {
    const rawHref = card?.LinkUrl ?? '';
    const href = rawHref?.trim() || '#';

    const img =
      (Array.isArray(card?.Image) && card.Image[0]) ||
      card?.Image ||
      (Array.isArray(card?.Images) && card.Images[0]) ||
      card?.HeroImage ||
      card?.Banner ||
      card?.Media ||
      card?.FeaturedImage ||
      null;

    const imgUrl =
      img?.Url || img?.MediaUrl || img?.ThumbnailUrl || (Array.isArray(img?.Urls) && img.Urls[0]);

    return {
      id: card?.Id,
      title: card?.Title ?? '',
      description: card?.Description ?? '',
      href,
      imgUrl,
    };
  });

  return (
    <section {...attributes} className="w-full bg-white">
      <div className="mx-auto max-w-[1240px]">
        <div className="relative">
          <div className="sticky top-20 flex flex-col gap-2 text-center fadeup bg-white  h-[600px] fadeupText">
            {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
            <Title className="text-5xl font-bold tracking-tight leading-[100%]">{title}</Title>
            {subtitle && <Description className="mx-auto" html={subtitle}></Description>}
          </div>

          <div className="mt-10 px-[205px]">
            <div className="space-y-16">
              {childCardData.map((card, index) => {
                const isRight = index % 2 === 1;
                const rowTemplate = isRight
                  ? '[grid-template-columns:minmax(0,1fr)_330px]'
                  : '[grid-template-columns:330px_minmax(0,1fr)]';

                return (
                  <div
                    key={card.id ?? index}
                    className={`flex flex-row gap-8 items-center ${rowTemplate} fadeScaleTranslate`}
                  >
                    <div
                      className={
                        isRight ? 'order-2 justify-self-end' : 'order-1 justify-self-start'
                      }
                    >
                      <div className="relative">
                        <div className="relative overflow-hidden rounded-xl w-[330px] h-[250px]">
                          {card.imgUrl && (
                            <CardImage
                              img={card.imgUrl}
                              alt={card.title || 'card image'}
                              sizes="w-[330px] h-[250px]"
                            />
                          )}
                        </div>

                        <div
                          className={`absolute ${isRight ? 'left-0 -bottom-0' : 'right-0 -bottom-0'}`}
                        >
                          <div
                            className={`relative w-[72px] h-[72px] ${isRight ? 'bg-[#0DF9C4] rounded-tr-3xl' : ' bg-[#1919E5] rounded-tl-3xl'}`}
                          >
                            <div
                              className={`absolute w-10 h-10 bg-white ${isRight ? 'left-0 -bottom-0' : 'right-0 -bottom-0'}`}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className={isRight ? 'order-1 mr-8' : 'order-2 ml-8'}>
                      <div className="w-[468px]">
                        <h3 className="text-32px tracking-[-0.02em] leading-10 font-medium text-primary">
                          {card.title}
                        </h3>
                        {card.description && (
                          <p className="mt-3 leading-5 text-default">
                            <Description html={card.description} />
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {ctaText && (
          <div className="mt-12 mx-auto text-center justify-center">
            <CTA
              className="w-[248px] h-14"
              variant="outline"
              colorText="text-primary"
              fontWeight="font-medium"
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

