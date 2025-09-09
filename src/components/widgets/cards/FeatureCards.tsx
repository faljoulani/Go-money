import { WidgetContext, htmlAttributes } from '@progress/sitefinity-nextjs-sdk';
import type { CardSectionEntity } from './card.entity';
import { fetchData } from '../../../utils/sitefinity';

import Title from '../../atoms/title/title';
import Description from '../../atoms/description/description';

type CmsImage = {
  Id?: string;
  Url?: string;
  MediaUrl?: string;
  ThumbnailUrl?: string;
  EmbedUrl?: string;
  Urls?: string[];
  Title?: string;
  AlternativeText?: string;
};

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

function pickFirst<T>(x?: T | T[] | null): T | undefined {
  if (!x) return undefined;
  return Array.isArray(x) ? x[0] : x;
}

function pickImageUrl(img?: CmsImage): string | undefined {
  if (!img) return undefined;
  return img.Url || img.MediaUrl || img.ThumbnailUrl || img.Urls?.[0] || img.EmbedUrl || undefined;
}

function toAbsoluteUrl(url?: string): string {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  const base = (process.env.NEXT_PUBLIC_SITEFINITY_BASE_URL || '').replace(/\/+$/, '');
  if (!base) return url;
  return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
}

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

  const items = cardItems.map((c) => {
    const img =
      (Array.isArray(c?.Image) ? c.Image[0] : c?.Image) ||
      (Array.isArray(c?.Icon) ? c.Icon[0] : c?.Icon) ||
      (Array.isArray(c?.Logo) ? c.Logo[0] : c?.Logo);

    const iconUrl = toAbsoluteUrl(pickImageUrl(img));
    const iconAlt = img?.AlternativeText || img?.Title || c?.Title || 'Icon';

    return {
      id: c?.Id ?? `${c?.Title ?? 'value'}-${Math.random().toString(36).slice(2)}`,
      title: c?.Title ?? '',
      description: c?.Description ?? '',
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
    <section {...attributes} className="w-full py-16">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6">
        {/* Section header */}
        <div className="mb-8 text-center">
          <Title
            variant="hero"
            className="
              font-lufga font-bold
              text-[48px] leading-[100%] tracking-[-0.02em]
              text-center align-middle
              text-[#010663]
            ß"
          >
            {sectionTitle}
          </Title>

          {sectionSubtitle && (
            <Description
              align="center"
              maxWidth={640}
              className="
                mt-4
                font-lufga font-normal
                text-[16px] leading-[100%] tracking-[0]
                text-center align-middle
                text-[#757575]
              "
            >
              {sectionSubtitle}
            </Description>
          )}
        </div>

        {/* Gradient container */}
        <div
          className="relative mx-auto rounded-[30px] p-10 md:p-12 lg:p-[72px] overflow-hidden"
          style={{
            background: 'linear-gradient(111.49deg,#000000 14.92%,#010552 46.49%,#0F148C 100.01%)',
          }}
        >
          {/* subtle grid pattern */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.15] [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:48px_48px] rounded-[30px]" />

          {/* cards grid */}
          <div className="relative grid gap-6 md:gap-8 lg:gap-10 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <div key={item.id} className="group">
                <div className="rounded-3xl p-px [background:linear-gradient(322.31deg,rgba(255,255,255,0)_58.6%,#ffffff_105.96%)]">
                  <div
                    className="
                      rounded-3xl border border-white/10
                      bg-white/10 backdrop-blur-[45.5px]
                      px-10 py-16
                      h-[265px] flex flex-col items-center justify-center text-center
                      transition-transform duration-200 group-hover:-translate-y-1
                    "
                  >
                    {item.iconUrl ? (
                      <img
                        src={item.iconUrl}
                        alt={item.iconAlt}
                        className="mb-6 h-12 w-12 object-contain"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="mb-6 h-12 w-12 rounded-full border border-white/20 flex items-center justify-center text-white/60 text-sm">
                        *
                      </div>
                    )}

                    <h3 className="font-lufga text-white text-[22px] leading-tight">
                      {item.title}
                    </h3>

                    {item.description && (
                      <p className="mt-3 max-w-[260px] text-white/80 text-[14px] leading-[20px]">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

