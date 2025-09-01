import { WidgetContext, htmlAttributes } from '@progress/sitefinity-nextjs-sdk';
import { RestClient } from '@progress/sitefinity-nextjs-sdk/rest-sdk';
import type { CardSectionEntity } from './card-section.entity';

import Eyebrow from '../../atoms/eyebrow/eyebrow';
import Title from '../../atoms/title/title';
import Description from '../../atoms/description/description';
import CTA from '../../atoms/cta/cta';
import CardImage from '../../atoms/cardImage/cardImage';
import { idsFrom, fetchByIds, firstId } from '../../../utils/utils';

export default async function ScrollableCards(props: WidgetContext<CardSectionEntity>) {
  const attributes = htmlAttributes(props);
  const data = (props.model?.Properties || {}) as CardSectionEntity;
  const { culture } = props.requestContext;

  // 🔹 First-time placeholder: nothing selected yet (no parent list and no cards)
  const isEdit = props.requestContext.isEdit;
  const hasInitialSelection = Boolean(firstId(data.CardListData) || idsFrom(data.Cards).length);
  if (!hasInitialSelection) {
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

  // ----- image helpers (no responsive classes involved) -----
  const bestFromUrls = (urls: any): string | undefined => {
    if (!urls) return undefined;
    const arr = Array.isArray(urls) ? urls : [urls];
    const cand = arr
      .map((u: any) =>
        typeof u === 'string' ? { url: u, w: 0 } : { url: u?.Url, w: u?.Width || 0 },
      )
      .filter((x) => !!x.url);
    cand.sort((a, b) => (b.w ?? 0) - (a.w ?? 0));
    return cand[0]?.url;
  };

  const mediaUrl = (media: any) =>
    bestFromUrls(media?.Urls) || media?.Url || media?.MediaUrl || media?.ThumbnailUrl || undefined;

  const toAbsolute = (url?: string) => {
    if (!url) return undefined;
    if (/^https?:\/\//i.test(url)) return url;
    const base = (process.env.NEXT_PUBLIC_SITEFINITY_URL || '').replace(/\/$/, '');
    return base ? `${base}${url}` : url;
  };

  const pickCardImageUrl = (card: any): string | undefined => {
    const firstMedia =
      (Array.isArray(card?.Image) && card.Image[0]) ||
      card?.Image ||
      (Array.isArray(card?.Images) && card.Images[0]) ||
      card?.HeroImage ||
      card?.Banner ||
      card?.Media ||
      card?.FeaturedImage ||
      null;
    return toAbsolute(firstMedia ? mediaUrl(firstMedia) : undefined);
  };

  // ----- parent -----
  const parentId = firstId(data.CardListData);
  const parent = parentId
    ? await RestClient.getItem({
        type: 'Telerik.Sitefinity.DynamicTypes.Model.Cards.Cards',
        id: parentId,
        culture,
        fields: ['Id', 'Title', 'Eyebrow', 'Description', 'SubTitle', 'CtaText', 'CtaUrl', 'Cards'],
      })
    : null;

  const eyebrow = parent?.Eyebrow ?? '';
  const title = parent?.Title ?? 'Cards';
  const subtitle = parent?.Description ?? parent?.SubTitle ?? '';
  const ctaText = parent?.CtaText ?? '';
  const ctaUrl = parent?.CtaUrl ?? '';

  // ----- cards -----
  const cardIds =
    idsFrom(data.Cards).length > 0
      ? idsFrom(data.Cards)
      : ((parent?.Cards?.ItemIdsOrdered as string[] | undefined) ?? []);

  const cardFields = [
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
  ];

  let cardItems: any[] = [];
  if (cardIds.length) {
    cardItems = await fetchByIds(
      cardIds,
      culture,
      'Telerik.Sitefinity.DynamicTypes.Model.Cards.Card',
      cardFields,
    );
  } else {
    const { Items = [] } = await RestClient.getItems({
      type: 'Telerik.Sitefinity.DynamicTypes.Model.Cards.Card',
      culture,
      take: 6,
      fields: cardFields,
    });
    cardItems = Items;
  }

  // ----- render (no sm/md/lg classes) -----
  return (
    <section {...attributes} className="w-full bg-white py-16">
      <div className="mx-auto max-w-7xl px-8">
        {/* Heading */}
        <div className="text-center">
          {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
          <Title variant="hero">{title}</Title>
          {subtitle && <Description>{subtitle}</Description>}
        </div>

        {/* Frame */}
        <div className="mt-10 rounded-2xl p-10">
          <div className="space-y-16">
            {cardItems.map((card: any, i: number) => {
              const imgAbs = pickCardImageUrl(card);
              const isRight = i % 2 === 1;
              const rawHref = (card?.LinkUrl as string | undefined)?.trim();
              const hasHref = Boolean(rawHref);
              const href = hasHref ? rawHref! : '#';

              const rowTemplate = isRight
                ? '[grid-template-columns:minmax(0,1fr)_494px]'
                : '[grid-template-columns:494px_minmax(0,1fr)]';

              return (
                <div key={card.Id ?? i} className={`grid items-center ${rowTemplate} gap-6`}>
                  {/* Image side */}
                  <div
                    className={isRight ? 'order-2 justify-self-end' : 'order-1 justify-self-start'}
                  >
                    <div className="relative">
                      <div
                        className="
                          relative overflow-hidden
                          rounded-tl-lg rounded-tr-3xl rounded-br-lg rounded-bl-lg
                          shadow-sm ring-1 ring-black/5
                          w-[494px] h-[360px]
                        "
                      >
                        {imgAbs && (
                          <CardImage img={imgAbs} alt={card.Title ?? 'card image'} sizes="494px" />
                        )}
                      </div>

                      {/* decorative corner chip */}
                      <div
                        className={`absolute ${isRight ? 'left-6 -bottom-6' : 'right-6 -bottom-6'}`}
                      >
                        <div className="w-20 h-20 rounded-[18px] bg-[#2330E6]" />
                      </div>
                    </div>
                  </div>

                  {/* Copy side */}
                  <div className={isRight ? 'order-1 -mr-8' : 'order-2 ml-8'}>
                    <div className="relative">
                      <div
                        className="
                          rounded-[24px]
                          bg-gradient-to-r from-[#C9FFF2] to-[#D8EDFF]
                          shadow-[0_12px_30px_rgba(15,23,42,0.12)]
                          ring-1 ring-white/60
                          p-6 max-w-[38rem]
                        "
                      >
                        <h3 className="text-[1.8rem] leading-tight font-extrabold text-[color:var(--navy,#0B2A8E)]">
                          {card.Title}
                        </h3>

                        {card.Description && (
                          <p className="mt-3 text-base leading-7 text-slate-700">
                            {card.Description}
                          </p>
                        )}

                        {hasHref && (
                          <div className="mt-4">
                            <CTA href={href} variant="solid">
                              Let’s Go{' '}
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

        {/* Parent CTA */}
        {ctaText && (
          <div className="mt-10 text-center">
            <CTA href={ctaUrl?.trim() || '#'} color="#0B2A8E" variant="outline">
              {ctaText}
            </CTA>
          </div>
        )}
      </div>
    </section>
  );
}

