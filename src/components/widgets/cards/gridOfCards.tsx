import { WidgetContext, htmlAttributes } from '@progress/sitefinity-nextjs-sdk';
import { RestClient } from '@progress/sitefinity-nextjs-sdk/rest-sdk';
import type { CardSectionEntity } from './card-section.entity';
import { idsFrom, fetchByIds, firstId } from '../../../utils/utils';
import Card from '../../atoms/card/card';

import Eyebrow from '../../atoms/eyebrow/eyebrow';
import Title from '../../atoms/title/title';
import Description from '../../atoms/description/description';
import CTA from '../../atoms/cta/cta';

export default async function GridOfCards(props: WidgetContext<CardSectionEntity>) {
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

  // Parent data (eyebrow/title/desc/cta)
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

  // Cards
  const cardIds =
    idsFrom(data.Cards).length > 0
      ? idsFrom(data.Cards)
      : ((parent?.Cards?.ItemIdsOrdered as string[] | undefined) ?? []);

  console.log('CARDS DATA ============ >>>>>>>>>>>>> ' + JSON.stringify(data.Cards));

  let cardItems: any[] = [];
  if (cardIds.length) {
    cardItems = await fetchByIds(
      cardIds,
      culture,
      'Telerik.Sitefinity.DynamicTypes.Model.Cards.Card',
      [
        'Id',
        'Title',
        'Description',
        'Icon',
        'LinkUrl',
        'Image($select=Id,Url,MediaUrl,ThumbnailUrl,EmbedUrl,Title,AlternativeText,Urls)',
      ],
    );
  } else {
    const { Items = [] } = await RestClient.getItems({
      type: 'Telerik.Sitefinity.DynamicTypes.Model.Cards.Card',
      culture,
      take: 6,
      fields: ['Id', 'Title', 'Description', 'Icon', 'LinkUrl'],
    });
    cardItems = Items;
  }

  const items = cardItems.map((c: any) => ({
    title: c?.Title ?? '',
    description: c?.Description ?? '',
    href: c?.LinkUrl ?? undefined,
    iconUrl:
      c?.Icon?.Url || c?.Icon?.MediaUrl || (Array.isArray(c?.Icon) && c.Icon[0]?.Url) || undefined,
  }));

  // ---- RENDER (use atoms) -------------------------------------------------
  const navy = '#0B2A8E';

  return (
    <section
      {...attributes}
      className="
        w-full bg-gradient-to-b from-[#F6F7F9] to-[#EFF1F4]
        py-16 md:py-24
      "
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center">
          {eyebrow && <Eyebrow color={navy}>{eyebrow}</Eyebrow>}

          <Title variant="hero" color={navy}>
            {title}
          </Title>

          {subtitle && <Description>{subtitle}</Description>}
        </div>

        {/* Cards grid */}
        <div className="mt-12">
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8 xl:gap-10">
            {items.map((item, i) => (
              <div
                key={i}
                className="
                  group rounded-[20px] bg-white/95
                  border border-slate-200 shadow-sm
                  p-6 md:p-8
                  transition-all duration-200
                  hover:-translate-y-1 hover:shadow-lg
                "
              >
                <Card {...item} />
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        {ctaText && (
          <div className="mt-12 text-center">
            <CTA
              href={ctaUrl?.trim() || '#'} // CTA link variant expects a string
              color={navy}
              // variant="solid" // uncomment if you want filled style
              // disabled={!ctaUrl?.trim()} // optional: make it non-clickable when empty
            >
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

