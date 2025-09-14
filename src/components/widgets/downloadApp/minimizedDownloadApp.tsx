import { WidgetContext, htmlAttributes } from '@progress/sitefinity-nextjs-sdk';
import type { DownloadAppEntity } from './downloadApp.entity';
import { fetchData, extractSelectionId } from '../../../utils/sitefinity';

interface MinimizedDownloadNow {
  Id: string;
  Title?: string;
  SubTitle?: string;
  Eyebrow?: string;
  Description?: string;
  CtaText?: string;
  CtaUrl?: string | { Href?: string } | Array<{ Href?: string }>;
  Image?: any | any[];
}

export default async function MinimizedDownloadNow(props: WidgetContext<DownloadAppEntity>) {
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

  const parentPayload = await fetchData(
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
  const parentData = parentPayload as MinimizedDownloadNow;

  const title = parentData?.Title ?? 'Cards';
  const subtitle = parentData?.Description ?? parentData?.SubTitle ?? '';
  const parentImage = Array.isArray(parentData?.Image) ? parentData.Image[0] : parentData?.Image;

  const parentImgUrl =
    parentImage?.Url ||
    parentImage?.MediaUrl ||
    parentImage?.ThumbnailUrl ||
    parentImage?.Urls?.[0] ||
    parentImage?.EmbedUrl ||
    undefined;

  const selectedIds: string[] = (() => {
    const raw = selection?.Cards;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw as string[];
    if (Array.isArray((raw as any)?.ItemIdsOrdered)) return (raw as any).ItemIdsOrdered as string[];
    return [];
  })();

  let cardItems: any[] = [];
  if (selectedIds.length > 0) {
    const childPayload = await fetchData(
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
    cardItems = Array.isArray(childPayload) ? childPayload : childPayload ? [childPayload] : [];
  }

  const childCardsData = cardItems.map((c: any) => {
    const itemHrefRaw = c?.CtaUrl;
    const itemHref =
      typeof itemHrefRaw === 'string'
        ? itemHrefRaw
        : Array.isArray(itemHrefRaw)
          ? (itemHrefRaw.find((x) => x?.Href)?.Href ?? '')
          : (itemHrefRaw?.Href ?? c?.LinkUrl ?? undefined);

    const image = Array.isArray(c?.Image) ? c.Image[0] : c?.Image;
    const icon = Array.isArray(c?.Icon) ? c.Icon[0] : c?.Icon;
    const iconUrl =
      image?.Url ||
      image?.MediaUrl ||
      image?.ThumbnailUrl ||
      image?.Urls?.[0] ||
      image?.EmbedUrl ||
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
    <section {...attributes}>
      <div
        className="relative h-[184px] w-[1240px] rounded-3xl mx-20 mb-16 mt-25"
        style={{ background: 'linear-gradient(258.38deg, #6BE5BF -1.4%, #B3DFEF 100%)' }}
      >
        <div className="relative flex h-full w-full gap-6  px-16">
          {/* LEFT: phone image */}
          <div className="relative z-30 w-[279px] h-[282px]">
            {parentImgUrl && (
              <img
                src={parentImgUrl}
                alt={parentImgUrl?.AlternativeText || 'Mobile'}
                width={360}
                height={720}
                className="absolute left-0 bottom-24.5 "
              />
            )}
          </div>

          {/* RIGHT: text + logos */}
          <div className="flex h-full w-[75%] items-center justify-between">
            <div className="w-full max-w-[620px] text-[#0A1B2E]">
              <h2 className="text-[40px] font-[800] leading-[1.05] tracking-[-0.02em] text-[#00145A]">
                {title}
              </h2>

              {subtitle && (
                <div
                  className="mt-3 text-[15px] leading-relaxed opacity-90"
                  dangerouslySetInnerHTML={{ __html: subtitle }}
                />
              )}
            </div>
            {/* round store logos */}

            {childCardsData.length > 0 && (
              <div className="relative my-16 flex items-center">
                {childCardsData.slice(0, 3).map((item: any, index: number) => (
                  <a key={index} href={item.href} rel="" className="flex flex-col items-center">
                    {item.iconUrl && (
                      <div
                        className={`flex items-center justify-center h-14 w-14 rounded-full bg-black border-2 border-[#6BE5BF] ${index === 0 ? 'absolute right-22.5 top-0 z-30' : `${index === 1 ? 'absolute right-11 top-0' : ''}`}`}
                      >
                        <img
                          src={item.iconUrl}
                          alt={item.title}
                          className="h-7 w-7 object-contain"
                        />
                      </div>
                    )}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

