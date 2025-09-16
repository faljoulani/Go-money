import { WidgetContext, htmlAttributes } from '@progress/sitefinity-nextjs-sdk';
import type { CardSectionEntity } from './card.entity';
import { fetchData, extractSelectionId } from '../../../utils/sitefinity';
import { ImgUrl } from '../../../types/Type';

import Eyebrow from '../../atoms/eyebrow/eyebrow';
import Title from '../../atoms/title/title';
import Subtitle from '../../atoms/subtitle/subtitle';
import Description from '../../atoms/description/description';
import CTA from '../../atoms/cta/cta';
import CardImage from '../../atoms/cardImage/cardImage';

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

  const listId = extractSelectionId(selection);
  if (!listId) {
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
    [listId],
    null,
    culture,
    ['Id', 'Title', 'Eyebrow', 'Description', 'SubTitle', 'CtaText', 'CtaUrl', 'Cards'],
    { itemType: selection?.CardListData?.Content?.[0]?.Type, single: true },
  );
  const parent = parentFetched as Parent;

  const chosenIds: string[] =
    (selection?.Cards?.ItemIdsOrdered as string[]) ??
    (parent?.Cards?.ItemIdsOrdered as string[]) ??
    [];

  let items: CardItem[] = [];
  if (chosenIds.length > 0) {
    const fetched = await fetchData(
      chosenIds,
      null,
      culture,
      [
        'Id',
        'Title',
        'Description',
        'Eyebrow',
        'CtaText',
        'CtaUrl',
        'Subtitle',
        'LinkUrl',
        'Image($select=Id,Url,MediaUrl,ThumbnailUrl,AlternativeText,Urls)',
      ],
      {
        itemType: selection?.Cards?.Content?.[0]?.Type ?? selection?.Content?.[0]?.Type,
        single: false,
      },
    );
    items = (Array.isArray(fetched) ? fetched : fetched ? [fetched] : []) as CardItem[];
  }

  return (
    <section {...attributes} className="w-full bg-white">
      <div className="mx-auto max-w-[1240px] px-6">
        {/* rows */}
        <div className="space-y-10">
          {items.map((card, i) => {
            const isRight = i % 2 === 0;
            const gridCols = isRight
              ? 'grid-cols-[minmax(0,1fr)_460px]'
              : 'grid-cols-[460px_minmax(0,1fr)]';

            const imgUrl = ImgUrl(card);
            const href = (card?.LinkUrl || '').trim();

            return (
              <div
                key={card.Id ?? i}
                className={`grid items-center min-h-[588px] ${gridCols} py-28 gap-x-10 gap-y-8`}
              >
                {/* image column */}
                <div
                  className={isRight ? 'order-2 justify-self-end' : 'order-1 justify-self-start'}
                >
                  <div className="relative w-[460px] h-[460px] overflow-hidden rounded-2xl">
                    {imgUrl && <CardImage img={imgUrl} alt={card.Title || 'image'} />}
                  </div>
                </div>

                {/* text column */}
                <div
                  className={`${isRight ? 'order-1 pr-6 md:pr-12' : 'order-2 pl-6 md:pl-12'} text-left`}
                >
                  <div className="max-w-[760px]">
                    <div className="flex flex-col items-start space-y-3">
                      {card.Eyebrow && <Eyebrow align="left">{card.Eyebrow}</Eyebrow>}

                      {card.Title && (
                        <Title className="!text-[28px] !leading-[34px]" align="left">
                          {card.Title}
                        </Title>
                      )}

                      {card.Subtitle && <Subtitle align="left">{card.Subtitle}</Subtitle>}

                      {card.Description && (
                        <Description
                          className="!text-[16px] !leading-[26px] text-[#424242]"
                          align="left"
                        >
                          {card.Description}
                        </Description>
                      )}

                      {card.CtaText && (
                        <div className="pt-2 self-start">
                          <CTA
                            href={href}
                            borderColor="#010663"
                            variant="outline"
                            className="rounded-[20px] px-6 py-[18px] border"
                          >
                            {card.CtaText}
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

