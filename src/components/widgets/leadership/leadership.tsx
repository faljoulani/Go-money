import { WidgetContext, htmlAttributes } from '@progress/sitefinity-nextjs-sdk';
import type { LeadershipEntity } from './leadership.entity';
import { fetchData, extractSelectionId } from '../../../utils/sitefinity';

import Card from '../../atoms/card/card';
import Eyebrow from '../../atoms/eyebrow/eyebrow';
import Title from '../../atoms/title/title';
import Description from '../../atoms/description/description';
import CTA from '../../atoms/cta/cta';

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

export default async function Leadership(props: WidgetContext<LeadershipEntity>) {
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
    <section {...attributes} className="w-full px-20 pt-5 pb-14 bg-[#EEEEEE]">
      <div className="mb-10">
        <Title variant="hero" className="text-start h-[63px] w-[650px] ml-0">
          {title}
        </Title>
        {subtitle && (
          <Description className="text-start ml-0 mt-1.5 text-[17px]">{subtitle}</Description>
        )}
      </div>

      <div className="bg-gradient-to-br from-[#10CEBB] to-[#0357AD] rounded-[30px] pt-10.5 pb-14 px-[142px]">
        <div className="grid grid-cols-3 gap-x-25">
          {/* First 3 items */}
          {items.slice(0, 3).map((item: any, i: number) => (
            <div key={i} className="flex flex-col items-center">
              {item.iconUrl && (
                <img
                  src={item.iconUrl}
                  alt={item.title}
                  className="rounded-full w-[251px] h-[363px]"
                />
              )}
              <div className="text-center mt-8.5">
                <h1 className="text-white text-[25px] whitespace-nowrap font-bold">{item.title}</h1>
                <p className="text-white text-lg">{item.description}</p>
              </div>
            </div>
          ))}

          {/* Last 2 items */}
          <div className="col-span-3 flex justify-center gap-x-25 mt-14.5">
            {items.slice(3, 5).map((item: any, i: number) => (
              <div key={i} className="flex flex-col items-center">
                {item.iconUrl && (
                  <img
                    src={item.iconUrl}
                    alt={item.title}
                    className="rounded-full w-[251px] h-[363px]"
                  />
                )}
                <div className="text-center mt-8.5">
                  <h1 className="text-white text-[26px] whitespace-nowrap font-bold">
                    {item.title}
                  </h1>
                  <p className="text-white text-lg">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      
    </section>
  );
}

