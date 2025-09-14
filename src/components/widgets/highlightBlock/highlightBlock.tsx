import { WidgetContext, htmlAttributes } from '@progress/sitefinity-nextjs-sdk';
import type { HighlightBlockEntity } from './highlightBlock.entity';
import { resolveSitefinitySelection, firstIdFromSelection, linkToHref } from '../../../utils/utils';
import { fetchData } from '../../../utils/sitefinity';
import { CmsImage } from '../../../types/type';

import Eyebrow from '../../atoms/eyebrow/eyebrow';
import Title from '../../atoms/title/title';
import Description from '../../atoms/description/description';
import ContentWithImage from './contentWithImage';
import ContentWithoutImage from './ContentWithoutImage';
import CTA from '../../atoms/cta/cta';

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

  const selection = resolveSitefinitySelection(
    props.model?.Properties?.ExpandBox ?? (props.model?.Properties as any)?.ExpandBox,
  );
  const id = firstIdFromSelection(selection);

  if (!id) return <EmptySafe isEdit={isEdit} label="ExpandBox" />;

  const fields = [
    'Id',
    'Title',
    'Eyebrow',
    'Description',
    'CtaText',
    'CtaUrl',
    'Image($select=Id,Url,MediaUrl,ThumbnailUrl,EmbedUrl,Title,AlternativeText)',
  ];

  const payload = await fetchData(id ? [id] : [], props.model?.Properties, culture, fields, {
    itemType: selection.Content?.[0]?.Type,
    single: true,
  });

  const data = Array.isArray(payload) ? payload?.[0] : payload;

  if (!data) return <EmptySafe isEdit={isEdit} label="ExpandBox" />;

  if (process.env.NODE_ENV === 'development') {
    console.log('[ExpandBoxDefault] itemId=%s', data.Id);
  }

  const eyebrow: string | undefined = data.Eyebrow;
  const title: string | undefined = data.Title;
  const description: string | undefined = data.Description;
  const ctaText: string | undefined = data.CtaText || 'More details';
  const ctaHref: string | undefined = linkToHref(data.CtaUrl);
  const imgSrc: string | undefined = imageUrl(
    Array.isArray(data.Image) ? data.Image[0] : data.Image,
  );
  const imgAlt: string =
    (Array.isArray(data.Image) ? data.Image?.[0]?.AlternativeText : data.Image?.AlternativeText) ||
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

