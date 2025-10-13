import { WidgetContext, htmlAttributes } from '@progress/sitefinity-nextjs-sdk';
import type { CardSectionEntity } from './card.entity';
import { fetchData, extractSelectionId } from '../../../utils/sitefinity';

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
  isOverlay?: boolean | string;
  CtaUrl?: string | { Href?: string } | Array<{ Href?: string }>;
  Image?: any | any[];
}

const toBool = (v: unknown) =>
  typeof v === 'boolean' ? v : String(v ?? '').toLowerCase() === 'true';

export default async function CeoMessage(props: WidgetContext<CardSectionEntity>) {
  const attributes = htmlAttributes(props);
  const selection = (props.model?.Properties || {}) as any;
  const { culture, isEdit } = props.requestContext;
  const id = extractSelectionId(selection);
  if (!id) {
    return isEdit ? (
      <section
        {...attributes}
        className="p-6 border border-dashed rounded-lg text-center text-slate-500 "
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
      'isOverlay',
      'Image($select=Id,Url,MediaUrl,ThumbnailUrl,EmbedUrl,Title,AlternativeText,Urls)',
    ],
    { itemType: selection?.CardListData?.Content?.[0]?.Type, single: true },
  );
  const parent = parentFetched as CeoMessage;
  const eyebrow = parent?.Eyebrow ?? '';
  const title = parent?.Title ?? 'Cards';
  const subtitle = parent?.Description ?? parent?.SubTitle ?? '';
  const ctaText = parent?.CtaText ?? '';
  const isOverlay = parent?.isOverlay ?? true;

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
    const iconUrl =
      img?.Url ||
      img?.MediaUrl ||
      img?.ThumbnailUrl ||
      img?.Urls?.[0] ||
      img?.EmbedUrl ||
      undefined;

    return {
      title: c?.Title ?? '',
      description: c?.Description ?? '',
      href: itemHref || undefined,
      iconUrl,
    };
  });

  const wrapCls = toBool(isOverlay)
    ? 'relative z-20 -mt-40 max-w-[90%] mx-auto xxl:max-w-[1200px]'
    : 'bg-[#EEEEEE] w-full px-20 pb-10 mt-16';

  const cardShellCls = isOverlay
    ? 'bg-bgAlt relative flex md:flex-row xs:flex-col items-center gap-8 rounded-3xl md:px-24 xs:px-4 rtl:md:px-10 rtl:xs:px-4 py-10 overflow-hidden'
    : 'flex flex-row items-center pr-8 pl-10.5 pt-4 pb-7 bg-white rounded-3xl space-x-8 shadow-sm';

  const figureCls = isOverlay ? 'relative justify-start ' : 'relative justify-start';

  const imageCls = isOverlay
    ? 'rounded-[20px] md:w-[400px] md:h-[480px] xs:w-[287px] xs:h-[380px] object-cover'
    : 'rounded-[20px] w-[417px] h-[506px] object-cover';

  const overlayPanelCls = isOverlay
    ? 'absolute bottom-4 left-1/2 -translate-x-1/2 bg-bgAlt rounded-[16px] md:p-6 xs:p-[18px] md:w-[90%] md:h-[115px] xs:w-[255px] xs:h-[86px] text-start shadow-md'
    : 'absolute bottom-4 left-1/2 -translate-x-1/2 bg-bgAlt rounded-[16px] px-6 py-4 w-[90%] text-start';

  const textColCls = isOverlay ? 'text-start w-auto space-y-3 ' : 'text-start w-[522px] space-y-3';
  // ------------------------------------

  return (
    <section {...attributes} className={wrapCls}>
      <div className={cardShellCls}>
        <>
          <div className="absolute top-0 right-0 rtl:left-0 rtl:right-auto w-32 h-32 bg-[#0023f5] dark:bg-[#a6efd9] rounded-bl-[60px] rtl:rounded-br-[60px] rtl:rounded-bl-none xs:hidden md:block">
            <div className="absolute top-0 right-0 rtl:left-0 rtl:right-auto w-14 h-14 bg-bgAlt" />
          </div>
        </>

        <div className={figureCls}>
          {items[0]?.iconUrl && (
            <img src={items[0].iconUrl} alt={items[0]?.title || ''} className={imageCls} />
          )}
          <div className={overlayPanelCls}>
            {items[0]?.description && (
              <Description className="xs:text-14px xs:leading-[18px]">
                {items[0].description}
              </Description>
            )}
            {items[0]?.title && (
              <Title className="md:text-2xl xs:text-[18px] font-medium md:mt-3 xs:mt-2 text-primaryAlt">
                {items[0].title}
              </Title>
            )}
          </div>
        </div>

        <div className={textColCls}>
          <div className="space-y-3">
            {eyebrow && (
              <Eyebrow className="xs:text-14px xs:leading-[18px] text-primaryAlt">
                {eyebrow}
              </Eyebrow>
            )}
            {title && (
              <Title className="text-primary md:text-[36px] xs:text-2xl font-bold tracking-[-0.02em]">
                {title}
              </Title>
            )}
          </div>
          {subtitle && (
            <Description className="text[16px]  xs:leading-[28px]" html={subtitle}></Description>
          )}
          {!!ctaText && !!ctaHref && (
            <div className="pt-2">
              <CTA href={ctaHref} variant="outline" className="rounded-[16px] px-5 py-3">
                {ctaText}
              </CTA>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

