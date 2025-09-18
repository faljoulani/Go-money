import { WidgetContext, htmlAttributes } from '@progress/sitefinity-nextjs-sdk';
import type { HighlightBlockEntity } from './highlightBlock.entity';
import { resolveSitefinitySelection, firstIdFromSelection, linkToHref } from '../../../utils/utils';
import { fetchData } from '../../../utils/sitefinity';
import { CmsImage } from '../../../types/Type';

import Eyebrow from '../../atoms/eyebrow/eyebrow';
import Title from '../../atoms/title/title';
import Description from '../../atoms/description/description';
import ContentWithImage from './contentWithImage';
import ContentWithoutImage from './contentWithoutImage';
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
    <section className="mx-20 my-16 relative scaleC">
      {/* Background div that scales */}
      <div className="absolute inset-0 rounded-3xl bg-skyTint"></div>

      {/* Content above the background */}
      <div className="relative grid grid-cols-2 items-center gap-10 py-24 pl-16 pr-20">
        {/* Left: copy */}
        <div className="flex flex-col items- gap-5 max-w-xl fadeLeft duration-1000">
          {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
          <Title
            className="
                text-5xl
                font-bold     
                tracking-tight
                leading-[100%]
              "
          >
            {title}
          </Title>
          {description && (
            <Description className="font-extralight leading-[24px]" html={description} />
          )}

          {ctaText && (
            <div>
              <CTA
                href={(ctaHref || '').trim() || '#'}
                colorText="text-primary"
                borderColor="border-primary"
                bgColor="transparent"
                variant="outline"
                icon="arrow"
                align="left"
              >
                {ctaText}
              </CTA>
            </div>
          )}
        </div>

        {/* Right: artwork / image panel */}
        <div className="relative h-[392px] w-[490px] fadeRight duration-1000">
          <div className="relative mx-auto h-[392px] w-[490px] rounded-[20px] overflow-hidden">
            {imgSrc ? (
              <img
                src={imgSrc}
                alt={imgAlt}
                className="h-[392px] w-[490px] object-contain rounded-[20px]"
                draggable={false}
              />
            ) : (
              <div className="h-[392px] w-[490px] rounded-3xl bg-gradient-to-br from-white to-slate-100" />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

