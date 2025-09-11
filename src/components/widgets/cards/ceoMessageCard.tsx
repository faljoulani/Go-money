import { WidgetContext, htmlAttributes } from '@progress/sitefinity-nextjs-sdk';
import type { CardSectionEntity } from './card.entity';
import { fetchData, extractSelectionId } from '../../../utils/sitefinity';

import Card from '../../atoms/card/card';
import Eyebrow from '../../atoms/eyebrow/eyebrow';
import Title from '../../atoms/title/title';
import Description from '../../atoms/description/description';
import CTA from '../../atoms/cta/cta';

interface CeoMessage {
  Id: string;
  Title?: string;
  SubTitle?: string;
  Eyebrow?: string;
  Description?: string;
  CtaText?: string;
  CtaUrl?: string | { Href?: string } | Array<{ Href?: string }>;
  Image?: any | any[];
}

export default async function CeoMessage(props: WidgetContext<CardSectionEntity>) {
  const attributes = htmlAttributes(props);
  const selection = (props.model?.Properties || {}) as any;
  const { culture } = props.requestContext;

  const isEdit = props.requestContext.isEdit;
  const id = extractSelectionId(selection);
  console.log('ID OF PARENT ========== >>>>>>>>>>>>> ' + JSON.stringify(id));

  console.log('selection ========== >>>>>>>>>>>>> ' + JSON.stringify(selection));

  if (!id) {
    return isEdit ? (
      <section
        {...attributes}
        className="p-6 border border-dashed rounded-lg text-center text-slate-500 mt-[-200px]"
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
  const parent = parentFetched as CeoMessage;

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

  const selectedIds: string[] = (() => {
    const raw = selection?.Cards;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw as string[];
    if (Array.isArray((raw as any)?.ItemIdsOrdered)) return (raw as any).ItemIdsOrdered as string[];
    return [];
  })();

  console.log('DATA OF PARENT =========== >>>>>>>>>>>> ' + JSON.stringify(parent));

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

  const items = cardItems.map((c: any) => {
    const itemHrefRaw = c?.CtaUrl;
    const itemHref =
      typeof itemHrefRaw === 'string'
        ? itemHrefRaw
        : Array.isArray(itemHrefRaw)
          ? (itemHrefRaw.find((x) => x?.Href)?.Href ?? '')
          : (itemHrefRaw?.Href ?? c?.LinkUrl ?? undefined);

    const img = Array.isArray(c?.Image) ? c.Image[0] : c?.Image;
    const icon = Array.isArray(c?.Icon) ? c.Icon[0] : c?.Icon;
    const iconUrl =
      img?.Url ||
      img?.MediaUrl ||
      img?.ThumbnailUrl ||
      img?.Urls?.[0] ||
      img?.EmbedUrl ||
      icon?.Url ||
      icon?.MediaUrl ||
      undefined;

    return {
      title: c?.Title ?? '',
      description: c?.Description ?? '',
      href: itemHref || undefined,
      iconUrl,
    };
  });
  return (
    <section {...attributes} className="bg-[#EEEEEE] w-full px-20 pb-10 ">
      <div className="flex flex-row items-center pr-8 pl-10.5 pt-4 pb-7 bg-white rounded-3xl space-x-8">
        <div className="absolute top-0 right-20 w-32 h-32 bg-[#0023F5] rounded-bl-[60px]">
          <div className="absolute top-0 right-0 w-16 h-16 bg-white"></div>
        </div>
        <div className="absolute top-[204px] right-2">
          <img src="/icons/Floating-button.svg" alt="Floating-button" />
        </div>
        <div className="relative justify-start">
          <img
            src={items[0]?.iconUrl}
            alt={items[0]?.title}
            className="rounded-[20px] w-[417px] h-[506px] object-cover"
          />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white rounded-[16px] px-6 py-4 w-[90%] text-start">
            {items[0]?.description && (
              <Description
                align="left"
                style={{
                  fontWeight: 400,
                  fontSize: '16px',
                  lineHeight: '100%',
                }}
              >
                {items[0]?.description}
              </Description>
            )}
            {items[0]?.title && (
              <Title
                align="left"
                style={{
                  fontSize: '24px',
                  color: 'var(--Text-text-primary, #010663)',
                  fontWeight: 500,
                }}
              >
                {items[0]?.title}
              </Title>
            )}
          </div>
        </div>

        <div className="text-start w-[522px] space-y-3">
          <div className="space-y-3">
            {eyebrow && <Eyebrow align="left">{eyebrow}</Eyebrow>}
            {title && (
              <Title
                align="left"
                style={{
                  fontSize: '33px',
                  color: 'var(--Text-text-primary, #010663)',
                  fontWeight: 700,
                }}
              >
                {title}
              </Title>
            )}
          </div>
          <div>
            {subtitle && (
              <Description
                align="left"
                style={{
                  fontWeight: 400,
                  fontSize: '16px',
                  lineHeight: '100%',
                }}
              >
                {subtitle}
              </Description>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

