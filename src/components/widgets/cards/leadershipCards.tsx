import { WidgetContext, htmlAttributes } from '@progress/sitefinity-nextjs-sdk';
import type { CardSectionEntity } from './card.entity';
import { fetchData, extractSelectionId } from '../../../utils/sitefinity';

import Title from '../../atoms/title/title';
import Description from '../../atoms/description/description';

interface Leadership {
  Id: string;
  Title?: string;
  SubTitle?: string;
  Eyebrow?: string;
  Description?: string;
  CtaText?: string;
  CtaUrl?: string | { Href?: string } | Array<{ Href?: string }>;
  Image?: any | any[];
}

export default async function Leadership(props: WidgetContext<CardSectionEntity>) {
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
  const parent = parentFetched as Leadership;

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
    <section {...attributes} className="w-full md:px-20 pt-10 md:pb-10 xs:pb-5">
      <div className="mb-8">
        <Title className="text-start md:leading-[63px] md:w-[650px] md:text-5xl xs:text-2xl xs:leading-8 font-bold text-primaryAlt">
          {title}
        </Title>
        {subtitle && (
          <Description className="text-start mt-1.5 tracking-[-0.02em] xs:leading-5">
            {subtitle}
          </Description>
        )}
      </div>

      <div className="bg-gradient-to-br from-[#10cebb] to-[#0357ad] dark:from-[#054e42] dark:to-[#010552] rounded-[30px] md:p-16 xs:py-16 xs:px-10 h-auto">
        <div className="grid md:grid-cols-3 xs:grid-cols-1 md:gap-x-10 xs:gap-y-4">
          {/* First 3 items */}
          {items.slice(0, 3).map((item: any, i: number) => (
            <div key={i} className="md:flex md:flex-col  items-center">
              {item.iconUrl && (
                <img
                  src={item.iconUrl}
                  alt={item.title}
                  className="rounded-full w-[251px] h-[363px] xs:mx-auto"
                />
              )}
              <div className="text-center mt-6 space-y-1">
                <h1 className="text-white md:text-[26px] md:leading-8 xs:leading-6  xs:text-lg whitespace-[90%] md:font-bold xs:font-semibold">
                  {item.title}
                </h1>
                <p className="text-white md:text-[20px] xs:text-base md:font-medium">
                  {item.description}
                </p>
              </div>
            </div>
          ))}

          {/* Last 2 items */}
          <div className="md:col-span-3 md:flex justify-center md:gap-x-10 xs:space-y-4 md:space-y-0 md:mt-14">
            {items.slice(3, 5).map((item: any, i: number) => (
              <div key={i} className="md:flex md:flex-col md:w-[330px]">
                {item.iconUrl && (
                  <img
                    src={item.iconUrl}
                    alt={item.title}
                    className="rounded-full w-[251px] h-[363px] xs:mx-auto xs:items-center"
                  />
                )}
                <div className="text-center mt-6 space-y-1">
                  <h1 className="text-white md:text-[26px] md:leading-8 xs:leading-6 xs:text-lg whitespace-nowrap md:font-bold xs:font-semibold">
                    {item.title}
                  </h1>
                  <p className="text-white md:text-[20px] xs:text-base md:font-medium xs:font-normal">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

