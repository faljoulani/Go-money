import { WidgetContext, htmlAttributes } from '@progress/sitefinity-nextjs-sdk';
import { RestClient } from '@progress/sitefinity-nextjs-sdk/rest-sdk';
import type { HighlightBlockEntity } from './highlightBlock.entity';

import Eyebrow from '../../atoms/eyebrow/eyebrow';
import Title from '../../atoms/title/title';
import Description from '../../atoms/description/description';
import ContentWithImage from './contentWithImage';
import ContentWithoutImage from './contentWithoutImage';
import CTA from '../../atoms/cta/cta';

type CmsLink = { Href?: string; OpenInNewTab?: boolean } | string | null | undefined;
type CmsImage =
  | {
      Id?: string;
      Url?: string;
      MediaUrl?: string;
      ThumbnailUrl?: string;
      EmbedUrl?: string;
      Title?: string;
      AlternativeText?: string;
    }
  | null
  | undefined;

function parseSelection(raw: unknown) {
  if (!raw) return undefined;
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw);
    } catch {
      return undefined;
    }
  }
  return raw as any;
}

function firstIdFromSelection(sel: any) {
  if (!sel) return undefined;
  if (sel.Id) return sel.Id;
  const ids = sel?.CardListData?.ItemIdsOrdered ?? sel?.ItemIdsOrdered;
  if (Array.isArray(ids) && ids.length) return ids[0];
  const maybeContentId = sel?.Content?.[0]?.Variations?.[0]?.Filter?.Value?.split(',')?.[0];
  return maybeContentId || undefined;
}

function linkToHref(link: CmsLink): string | undefined {
  if (!link) return undefined;
  if (typeof link === 'string') return link;
  const anyLink = link as any;
  if (Array.isArray(anyLink)) {
    const first = anyLink[0];
    return typeof first === 'string' ? first : first?.Href;
  }
  return anyLink.Href;
}

function imageUrl(img: CmsImage): string | undefined {
  if (!img) return undefined;
  return img.MediaUrl || img.Url || img.ThumbnailUrl || img.EmbedUrl;
}

function EmptySafe({ isEdit, label }: { isEdit: boolean; label: string }) {
  return isEdit ? (
    <div className="p-6 border border-dashed rounded-2xl text-center text-slate-500">
      <strong>{label}</strong>
      <div className="mt-1">Open the designer and select an item.</div>
    </div>
  ) : (
    <div />
  );
}

export default async function HighlightBlock(props: WidgetContext<HighlightBlockEntity>) {
  const attrs = htmlAttributes(props);
  const selectedView =
    (props.model as any)?.ViewName ||
    (props.model?.Properties as any)?.ViewName ||
    (props as any)?.viewName ||
    'Default';

  return (
    <section {...attrs} data-view={selectedView}>
      <div data-react-root>
        {selectedView === 'ContentWithImage' ? (
          <ContentWithImage {...props} />
        ) : selectedView === 'ContentWithoutImage' ? (
          <ContentWithoutImage {...props} />
        ) : (
          <HighlightBlockDefault {...props} />
        )}
      </div>
    </section>
  );
}

async function HighlightBlockDefault(props: WidgetContext<HighlightBlockEntity>) {
  const { culture, isEdit } = props.requestContext;

  const selection = parseSelection(
    props.model?.Properties?.ExpandBox ?? (props.model?.Properties as any)?.ExpandBox,
  );
  const id = firstIdFromSelection(selection);

  if (!id) return <EmptySafe isEdit={isEdit} label="ExpandBox" />;

  const item = await RestClient.getItem({
    type: 'Telerik.Sitefinity.DynamicTypes.Model.ExpandBox.ExpandBox',
    id,
    culture,
    fields: [
      'Id',
      'Title',
      'Eyebrow',
      'Description',
      'CtaText',
      'CtaUrl',
      'Image($select=Id,Url,MediaUrl,ThumbnailUrl,EmbedUrl,Title,AlternativeText)',
    ],
  });

  if (!item) return <EmptySafe isEdit={isEdit} label="ExpandBox" />;

  if (process.env.NODE_ENV === 'development') {
    console.log('[ExpandBoxDefault] itemId=%s', item.Id);
  }

  const eyebrow: string | undefined = item.Eyebrow;
  const title: string | undefined = item.Title;
  const description: string | undefined = item.Description;
  const ctaText: string | undefined = item.CtaText || 'More details';
  const ctaHref: string | undefined = linkToHref(item.CtaUrl);
  const imgSrc: string | undefined = imageUrl(
    Array.isArray(item.Image) ? item.Image[0] : item.Image,
  );
  const imgAlt: string =
    (Array.isArray(item.Image) ? item.Image?.[0]?.AlternativeText : item.Image?.AlternativeText) ||
    title ||
    'illustration';

  return (
    <section className="mx-20 my-16">
      <div className="relative overflow-hidden rounded-[28px] bg-[#CFE8F1] py-[94px] pl-16 pr-[87px]">
        <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2">
          {/* Left: copy */}
          <div className="max-w-xl text-left">
            <div>
              {eyebrow && <Eyebrow align="left">{eyebrow}</Eyebrow>}
              {title && (
                <Title align="left" variant="hero" className="mb-3 mt-5 h-[59px]">
                  {title}
                </Title>
              )}
              {description && <Description align="left">{description}</Description>}
            </div>

            {ctaText ? (
              <div className="mt-4">
                <CTA
                  href={(ctaHref || '').trim() || '#'}
                  color="#010663"
                  borderColor="var(--Button-button-border-primary, #001081)"
                  variant="outline"
                  width={248}
                  height={56}
                  icon="arrow"
                >
                  <div className="my-4 font-medium">{ctaText}</div>
                </CTA>
              </div>
            ) : null}
          </div>

          {/* Right: artwork / image panel */}
          <div className="relative h-[392px] w-[490px]">
            <div className="relative mx-auto h-[392px] w-[490px] rounded-[20px] overflow-hidden">
              {/* Gradient shadow outside (top + right) */}

              {/* Actual content */}
              {imgSrc ? (
                <img
                  src={imgSrc}
                  alt={imgAlt}
                  className="h-[392px] w-[490px] object-contain rounded-[20px]"
                  draggable={false}
                />
              ) : (
                <div className="h-[392px] w-[490px] rounded-[20px] bg-gradient-to-br from-white to-slate-100" />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

