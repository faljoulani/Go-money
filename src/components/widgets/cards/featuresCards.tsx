import { WidgetContext, htmlAttributes } from '@progress/sitefinity-nextjs-sdk';
import type { CardSectionEntity } from './card.entity';
import { fetchData, pickImageUrl } from '../../../utils/sitefinity';
import Title from '../../atoms/title/title';
import Description from '../../atoms/description/description';
import { resolveAbsoluteUrl } from '../../../utils/utils';
import { MobileFeaturesCarousel } from './mobileFeatures';

type ServerSelection = {
  CardListData?: {
    ItemIdsOrdered?: string[] | null;
    Content?: Array<{ Type?: string }>;
  } | null;
  Cards?: {
    ItemIdsOrdered?: string[] | null;
    Content?: Array<{ Type?: string }>;
  } | null;
  ViewName?: string;
  SfWidgetLabel?: string;
} & Record<string, any>;

function takeIds(sel?: { ItemIdsOrdered?: string[] | null }): string[] {
  if (!sel) return [];
  return Array.isArray(sel.ItemIdsOrdered) ? sel.ItemIdsOrdered : [];
}

export default async function FeatureCards(props: WidgetContext<CardSectionEntity>) {
  const attributes = htmlAttributes(props);
  const selection = (props.model?.Properties || {}) as ServerSelection;
  const { culture } = props.requestContext;

  const headerId = takeIds(selection.CardListData)[0];
  const headerType = selection.CardListData?.Content?.[0]?.Type;

  const itemIds = takeIds(selection.Cards);
  const itemType = selection.Cards?.Content?.[0]?.Type;

  let sectionTitle = 'Our Values';
  let sectionSubtitle = '';

  if (headerId && headerType) {
    try {
      const parent = (await fetchData(
        [headerId],
        null,
        culture,
        ['Id', 'Title', 'Description', 'SubTitle'],
        { itemType: headerType, single: true },
      )) as any;

      sectionTitle = parent?.Title ?? sectionTitle;
      sectionSubtitle = parent?.Description ?? parent?.SubTitle ?? sectionSubtitle;
    } catch {}
  }

  if (!itemIds.length || !itemType) {
    return props.requestContext.isEdit ? (
      <section
        {...attributes}
        className="p-6 border border-dashed rounded-lg text-center text-slate-500"
      >
        <strong>Card Section</strong>
        <div className="mt-1">
          {(!itemIds.length &&
            'Open the designer and select one or more Cards in the “Cards” field.') ||
            (!itemType && 'Could not resolve the Cards dynamic type. Save the selection again.')}
        </div>
      </section>
    ) : null;
  }

  let cardItems: any[] = [];
  try {
    const fetched = await fetchData(
      itemIds,
      null,
      culture,
      [
        'Id',
        'Title',
        'Description',
        'Image($select=Id,Url,MediaUrl,ThumbnailUrl,EmbedUrl,Title,AlternativeText,Urls)',
        'Icon($select=Id,Url,MediaUrl,ThumbnailUrl,EmbedUrl,Title,AlternativeText,Urls)',
        'Logo($select=Id,Url,MediaUrl,ThumbnailUrl,EmbedUrl,Title,AlternativeText,Urls)',
      ],
      { itemType, single: false },
    );
    cardItems = Array.isArray(fetched) ? fetched : fetched ? [fetched] : [];
  } catch {
    cardItems = [];
  }

  const items = cardItems.map((card) => {
    const img =
      (Array.isArray(card?.Image) ? card.Image[0] : card?.Image) ||
      (Array.isArray(card?.Icon) ? card.Icon[0] : card?.Icon) ||
      (Array.isArray(card?.Logo) ? card.Logo[0] : card?.Logo);

    const iconUrl = resolveAbsoluteUrl(pickImageUrl(img), props.requestContext);
    const iconAlt = img?.AlternativeText || img?.Title || card?.Title || 'Icon';

    return {
      id: card?.Id ?? `${card?.Title ?? 'value'}-${Math.random().toString(36).slice(2)}`,
      title: card?.Title ?? '',
      description: card?.Description ?? '',
      iconUrl,
      iconAlt,
    };
  });


  if (!items.length) {
    return props.requestContext.isEdit ? (
      <section
        {...attributes}
        className="p-6 border border-dashed rounded-lg text-center text-slate-500"
      >
        <strong>Card Section</strong>
        <div className="mt-1">No cards found for the selected IDs. Check your content.</div>
      </section>
    ) : null;
  }
  return (
    <section {...attributes} className="w-full">
      <div className="mx-auto md:px-20">
        {/* Section header */}
        <div className="mb-8 text-center">
          <Title className="md:text-[48px] xs:text-2xl md:leading-[63px] rtl:md:leading-[90px] tracking-[-0.02em] text-center align-middle font-bold">
            {sectionTitle}
          </Title>
          {sectionSubtitle && (
            <Description
              color="text-[#757575] dark:text-[#E0E0E0]"
              className="mt-2 text-[16px] mx-auto align-middle text-center"
            >
              {sectionSubtitle}
            </Description>
          )}
        </div>

        {/* Gradient container */}
        <div
          className="relative mx-auto rounded-[30px] md:p-16 xs:pt-10 xs:pb-20 overflow-hidden bg-[linear-gradient(111.49deg,#000000_14.92%,#010552_46.49%,#0F148C_100.01%)] dark:bg-[#131321] dark:bg-none"
          
        >
          <img
            src="/assets/Vector.png"
            alt=""
            className="absolute object-cover bottom-0 left-0 z-0 pointer-events-none"
          />

          {/* Desktop grid */}
          <div className="hidden md:grid md:grid-cols-3 md:gap-8 relative">
            {items.map((item, idx) => (
              <div key={item.id} className="group">
                <div className="rounded-[32px] dark:border-none border-t border-l border-gradient-to-br from-[#FFFFFF00] to-[#FFFFFF]">
                  <div className="rounded-[32px] bg-white/10 dark:bg-surface-section md:px-12 md:py-14 md:h-[265px] flex flex-col items-center justify-center text-center">
                    {item.iconUrl ? (
                      <img
                        src={item.iconUrl}
                        alt={item.iconAlt}
                        className="mb-4 h-12 w-12 object-contain"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="mb-6 h-12 w-12 rounded-full border border-white/20 flex items-center justify-center text-white/60 text-sm">
                        *
                      </div>
                    )}
                    <h3 className="text-white text-[24px] leading-8">{item.title}</h3>
                    {item.description && (
                      <Description
                        color="#E0E0E0"
                        className="mt-3 max-w-[253px] text-[#E0E0E0] text-[16px] md:leading-7"
                        html={item.description}
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile carousel */}
          <MobileFeaturesCarousel
            items={items.map((item) => ({
              id: item.id,
              title: item.title,
              description: item.description,
              imgUrl: item.iconUrl,
              icon: null, // optional: you can pass JSX here instead
            }))}
          />
        </div>
      </div>
    </section>
  );
}

