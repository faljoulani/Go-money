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

export default async function ChairmanMessage(props: WidgetContext<CardSectionEntity>) {
  const attributes = htmlAttributes(props);
  const selection = (props.model?.Properties || {}) as any;
  const { culture } = props.requestContext;

  const isEdit = props.requestContext.isEdit;
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
    <section {...attributes} className="w-full md:px-20 md:py-16 xs:py-10">
      <div className="flex md:flex-row xs:flex-col items-center rounded-3xl md:gap-x-8 xs:space-y-4">
        <div className="relative justify-start">
          <img
            src={items[0]?.iconUrl}
            alt={items[0]?.title}
            className="rounded-[20px] md:w-[417px] md:h-[506px] xs:w-[343px] xs:h-[420px] object-cover"
          />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-bgAlt rounded-[16px] px-6 py-6 md:w-[90%] xs:w-[310px] xs:h-[115px] text-start space-y-2">
            {items[0]?.description && (
              <Description
                className="md:text-lg  xs:text-14px"
                html={items[0]?.description}
              ></Description>
            )}
            {items[0]?.title && (
              <Title className="md:text-2xl xs:text-lg font-medium text-primaryAlt">{items[0]?.title}</Title>
            )}
          </div>
        </div>

        <div className="text-start md:max-w-[790px] space-y-3">
          <div className="space-y-3">
            {eyebrow && <Eyebrow className="xs:text-14px xs:leading-[18px]">{eyebrow}</Eyebrow>}
            {title && (
              <Title className="text-[#001081] md:text-3xl xs:text-2xl font-bold tracking-[-0.02em]">
                {title}
              </Title>
            )}
          </div>
          {subtitle && (
            <Description
              className="text[16px] tracking-wider xs:leading-5"
              html={subtitle}
            ></Description>
          )}
        </div>
      </div>
    </section>
  );
}

